const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const context = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'avatar-motion.js'), 'utf8'), context);
const { ACTIONS, PERIOD, sample, rig, solveLimb, blend } = context.CaloriAvatarMotion;
const distance = (a, b) => Math.hypot(...a.map((v, i) => v - b[i]));

test('all action cycles keep finite coordinates and constant arm and leg lengths', () => {
  for (const action of ACTIONS) {
    for (let i = 0; i <= 180; i++) {
      const body = rig(sample(action, PERIOD[action] * i / 180));
      for (const [key, a, b] of [
        ['leftArm', .32, .30], ['rightArm', .32, .30],
        ['leftLeg', .45, .44], ['rightLeg', .45, .44]
      ]) {
        const limb = body[key];
        assert.ok(Object.values(limb).flat().every(Number.isFinite), `${action}: ${key} finite`);
        assert.ok(Math.abs(distance(limb.start, limb.joint) - a) < 1e-8, `${action}: upper ${key}`);
        assert.ok(Math.abs(distance(limb.joint, limb.end) - b) < 1e-8, `${action}: lower ${key}`);
      }
      const pose = sample(action, PERIOD[action] * i / 180);
      for (const side of ['left', 'right']) {
        assert.ok(distance(body[`${side}Arm`].end, pose[`${side}Hand`]) < 1e-8, `${action}: hand target`);
        assert.ok(distance(body[`${side}Leg`].end, pose[`${side}Foot`]) < 1e-8, `${action}: foot target`);
      }
    }
  }
});

test('IK handles coincident targets, unreachable targets and parallel bend poles', () => {
  for (const target of [[0, 0, 0], [0, 50, 0], [0, -.4, 0]]) {
    const limb = solveLimb([0, 0, 0], target, .32, .30, [0, 1, 0]);
    assert.ok(Math.abs(distance(limb.start, limb.joint) - .32) < 1e-8);
    assert.ok(Math.abs(distance(limb.joint, limb.end) - .30) < 1e-8);
  }
});

test('running has grounded stance and lifted recovery; gym feet remain planted', () => {
  for (let i = 0; i < 100; i++) {
    const p = i / 100;
    const run = sample('running', PERIOD.running * p);
    if (p < .58) assert.equal(run.leftFoot[1], .08);
    if (p > .6 && p < .99) assert.ok(run.leftFoot[1] > .08);
    const gym = rig(sample('gym', PERIOD.gym * p));
    assert.ok(distance(gym.leftLeg.end, [-.23, .08, .03]) < 1e-8);
    assert.ok(distance(gym.rightLeg.end, [.23, .08, .03]) < 1e-8);
  }
});

test('basketball has floor contact and a palm touching the ball at the top', () => {
  const top = sample('basketball', 0);
  const bottom = sample('basketball', PERIOD.basketball / 2);
  assert.ok(Math.abs(top.rightHand[1] - top.ball[1] - .13) < 1e-8);
  assert.ok(Math.abs(bottom.ball[1] - .13) < 1e-8);
  assert.ok(top.ball[1] > bottom.ball[1] + .7);
});

test('tennis ball meets the attached racket at the contact frame', () => {
  const pose = sample('tennis', PERIOD.tennis * .48);
  const hand = rig(pose).rightArm.end;
  const axis = [-Math.sin(pose.propAngle), Math.cos(pose.propAngle), .15];
  const racketCenter = hand.map((v, i) => v + axis[i] * .32);
  assert.ok(distance(pose.ball, racketCenter) < 1e-8);
});

test('body poses are continuous at loop boundaries', () => {
  for (const action of ACTIONS) {
    const end = sample(action, PERIOD[action] - .00001);
    const start = sample(action, 0);
    for (const key of ['pelvis', 'leftHand', 'rightHand', 'leftFoot', 'rightFoot']) {
      assert.ok(distance(end[key], start[key]) < .001, `${action}: ${key}`);
    }
  }
});

test('blending preserves endpoints and does not mutate poses', () => {
  const a = sample('running', .2), b = sample('drinking', 1);
  const before = JSON.stringify([a, b]);
  assert.equal(JSON.stringify(blend(a, b, 0)), JSON.stringify(a));
  for (const key of Object.keys(b)) {
    const expected = Array.isArray(b[key]) ? b[key] : [b[key]];
    const result = blend(a, b, 1)[key];
    const values = Array.isArray(result) ? result : [result];
    values.forEach((v, i) => assert.ok(Math.abs(v - expected[i]) < 1e-10));
  }
  assert.equal(JSON.stringify([a, b]), before);
  assert.throws(() => sample('unknown', 0), /Unknown avatar action/);
});

test('motion asset is loaded before app and included in offline cache and deployment', () => {
  const read = (file) => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const html = read('index.html');
  assert.ok(html.indexOf('src="avatar-motion.js"') < html.indexOf('src="app.js"'));
  assert.ok(read('sw.js').includes("'./avatar-motion.js'"));
  assert.ok(read(path.join('ops', 'deploy.ps1')).includes("'avatar-motion.js'"));
});
