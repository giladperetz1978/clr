(function (root) {
  'use strict';

  const TAU = Math.PI * 2;
  const ACTIONS = ['idle', 'eating', 'drinking', 'running', 'gym', 'basketball', 'soccer', 'tennis'];
  const PERIOD = { idle: 4, eating: 3.6, drinking: 4.2, running: 1.05, gym: 3.8, basketball: 1.25, soccer: 2.8, tennis: 2.6 };
  const add = (a, b) => a.map((v, i) => v + b[i]);
  const sub = (a, b) => a.map((v, i) => v - b[i]);
  const mul = (a, n) => a.map((v) => v * n);
  const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
  const length = (a) => Math.hypot(...a);
  const unit = (a) => mul(a, 1 / Math.max(length(a), 0.000001));
  const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
  const mix = (a, b, t) => a + (b - a) * t;
  const lerp = (a, b, t) => a.map((v, i) => mix(v, b[i], t));
  const smooth = (t) => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); };

  function track(phase, keys) {
    for (let i = 1; i < keys.length; i++) {
      if (phase <= keys[i][0]) {
        return mix(keys[i - 1][1], keys[i][1], smooth((phase - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0])));
      }
    }
    return keys[keys.length - 1][1];
  }

  function rotate(point, yaw) {
    const [x, y, z] = point;
    return [x * Math.cos(yaw) + z * Math.sin(yaw), y, z * Math.cos(yaw) - x * Math.sin(yaw)];
  }

  // Two-bone IK keeps limb lengths constant while the hand/foot follows a target.
  function solveLimb(start, target, upper, lower, pole) {
    const delta = sub(target, start);
    const distance = clamp(length(delta), Math.abs(upper - lower) + 0.0001, upper + lower - 0.0001);
    const direction = length(delta) < 0.0001 ? [0, -1, 0] : unit(delta);
    let bend = sub(pole, mul(direction, dot(pole, direction)));
    if (length(bend) < 0.0001) {
      const alternate = Math.abs(direction[0]) < 0.9 ? [1, 0, 0] : [0, 0, 1];
      bend = sub(alternate, mul(direction, dot(alternate, direction)));
    }
    const along = (upper * upper - lower * lower + distance * distance) / (2 * distance);
    const height = Math.sqrt(Math.max(0, upper * upper - along * along));
    return {
      start,
      joint: add(start, add(mul(direction, along), mul(unit(bend), height))),
      end: add(start, mul(direction, distance))
    };
  }

  function sample(action, time) {
    if (!ACTIONS.includes(action)) throw new RangeError(`Unknown avatar action: ${action}`);
    const p = ((time / PERIOD[action]) % 1 + 1) % 1;
    const wave = Math.sin(p * TAU);
    const pose = {
      pelvis: [0, 0.94, 0], yaw: 0, lean: 0, nod: 0, jaw: 0, viewYaw: -.37,
      leftHand: [-0.29, 0.91, 0.09], rightHand: [0.29, 0.91, 0.09],
      leftFoot: [-0.15, 0.08, 0], rightFoot: [0.15, 0.08, 0],
      propAngle: 0, ball: [0.48, 0.13, 0.18], breath: Math.sin(time * TAU / 4) * 0.006
    };

    if (action === 'eating' || action === 'drinking') {
      const lift = track(p, [[0, 0], [.16, 0], [.36, 1], [.67, 1], [.9, 0], [1, 0]]);
      pose.rightHand = lerp([.35, 1.04, .23], action === 'eating' ? [.035, 1.61, .24] : [.09, 1.60, .26], lift);
      pose.leftHand = [-.22, 1.08, .24];
      pose.yaw = -.06 * lift;
      pose.nod = (action === 'drinking' ? -.13 : .06) * lift;
      pose.jaw = action === 'eating' ? lift * (.5 + .5 * Math.sin(time * TAU * 2.8)) : 0;
      pose.propAngle = action === 'drinking' ? lift * -1.15 : -.15;
    } else if (action === 'running') {
      pose.viewYaw = -.95;
      pose.pelvis = [0, .895 + .035 * (1 - Math.cos(p * TAU * 2)), 0];
      pose.lean = .12;
      pose.yaw = .09 * wave;
      for (const [side, offset] of [['left', 0], ['right', .5]]) {
        const phase = (p + offset) % 1;
        // Stance occupies 58% of the stride; the foot lifts only during recovery.
        const stance = phase < .58;
        const swing = (phase - .58) / .42;
        pose[`${side}Foot`] = [side === 'left' ? -.15 : .15,
          .08 + (stance ? 0 : .23 * Math.sin(Math.PI * swing)),
          stance ? mix(.3, -.3, phase / .58) : mix(-.3, .3, smooth(swing))];
        pose[`${side}Hand`] = [side === 'left' ? -.32 : .32,
          1.15 + .06 * Math.cos(phase * TAU), .12 - .28 * Math.cos(phase * TAU)];
      }
    } else if (action === 'gym') {
      const squat = track(p, [[0, 0], [.23, 1], [.45, 0], [1, 0]]);
      const press = track(p, [[0, 0], [.42, 0], [.63, 1], [.76, 1], [.96, 0], [1, 0]]);
      pose.pelvis = [0, .94 - .17 * squat, -.07 * squat];
      pose.lean = .1 * squat;
      pose.leftFoot = [-.23, .08, .03];
      pose.rightFoot = [.23, .08, .03];
      pose.leftHand = [-.37, 1.4 - .17 * squat + .47 * press, .16];
      pose.rightHand = [.37, pose.leftHand[1], .16];
    } else if (action === 'basketball') {
      pose.pelvis = [-.045, .87 + .018 * Math.cos(p * TAU), -.015];
      pose.lean = .09;
      pose.leftFoot = [-.22, .08, .1];
      pose.rightFoot = [.24, .08, -.09];
      // A ballistic arc reaches the floor at mid-cycle; the palm follows the top at contact.
      const h = .13 + .72 * (1 - Math.pow(2 * (p < .5 ? p : 1 - p), 2));
      pose.ball = [.49, h, .2];
      pose.rightHand = [.49, Math.max(.88, h + .13), .2];
      pose.leftHand = [-.35, 1.13, .22];
    } else if (action === 'soccer') {
      const kick = track(p, [[0, 0], [.24, -.35], [.42, 1], [.64, .3], [.85, 0], [1, 0]]);
      pose.pelvis = [-.05, .93 - .03 * Math.sin(p * Math.PI) ** 2, 0];
      pose.yaw = -.12 * kick;
      pose.lean = -.05 * kick;
      pose.rightFoot = [.19, .08 + .19 * Math.max(0, kick), .5 * kick];
      pose.leftHand = [-.42, 1.12, .1 - .15 * kick];
      pose.rightHand = [.38, 1.05, -.15];
      const flight = clamp((p - .42) / .4);
      const returning = smooth((p - .82) / .18);
      pose.ball = lerp([.19 + .42 * flight, .13 + .55 * Math.sin(Math.PI * flight), .68 + 1.0 * flight], [.19, .13, .68], returning);
    } else if (action === 'tennis') {
      const swing = track(p, [[0, 0], [.22, -.35], [.48, 1], [.65, 1.25], [.9, 0], [1, 0]]);
      pose.pelvis = [.06 * swing, .9 + .025 * swing, 0];
      pose.yaw = -.2 + .45 * swing;
      pose.leftFoot = [-.25, .08, .1];
      pose.rightFoot = [.26, .08, -.15];
      pose.rightHand = [.42 - .32 * swing, 1.06 + .27 * swing, .20 + .14 * swing];
      pose.leftHand = [-.35, 1.23, .25 - .12 * swing];
      pose.propAngle = -.6 + 1.2 * swing;
      const contact = [.10 - Math.sin(.6) * .32, 1.33 + Math.cos(.6) * .32, .34 + .15 * .32];
      pose.ball = p < .48
        ? lerp([.85, 1.35, 2.0], contact, p / .48)
        : lerp(contact, [-1.2, 1.8, 2.5], clamp((p - .48) / .35));
    }
    return pose;
  }

  function blend(a, b, t) {
    return Object.fromEntries(Object.keys(b).map((key) => [key,
      Array.isArray(b[key]) ? lerp(a[key], b[key], t) : mix(a[key], b[key], t)]));
  }

  function rig(pose) {
    const torso = (p) => {
      const v = rotate(p, pose.yaw);
      return add(pose.pelvis, [v[0], v[1] * Math.cos(pose.lean) - v[2] * Math.sin(pose.lean),
        v[2] * Math.cos(pose.lean) + v[1] * Math.sin(pose.lean)]);
    };
    return {
      pelvis: pose.pelvis,
      chest: torso([0, .39 + pose.breath, 0]),
      neck: torso([0, .59 + pose.breath, 0]),
      head: torso([0, .76 + pose.breath, 0]),
      leftArm: solveLimb(torso([-.24, .5, 0]), pose.leftHand, .32, .30, [-.45, -1, -.65]),
      rightArm: solveLimb(torso([.24, .5, 0]), pose.rightHand, .32, .30, [.45, -1, -.65]),
      leftLeg: solveLimb(torso([-.135, 0, 0]), pose.leftFoot, .45, .44, [0, 0, 1]),
      rightLeg: solveLimb(torso([.135, 0, 0]), pose.rightFoot, .45, .44, [0, 0, 1])
    };
  }

  // Exposed pure math also runs in Node and in the dependency-free browser regression page.
  const math = { ACTIONS, PERIOD, sample, rig, solveLimb, blend };
  root.CaloriAvatarMotion = math;
  if (typeof module !== 'undefined' && module.exports) module.exports = math;
  if (typeof document === 'undefined') return;

  const figure = document.getElementById('body-figure');
  if (!figure) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'natural-avatar';
  canvas.setAttribute('role', 'img');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('CaloriTrack avatar: Canvas 2D is unavailable; using the illustrated fallback.');
    return;
  }
  figure.prepend(canvas);
  figure.classList.add('has-natural-avatar');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const scale = 132;
  let action = 'idle', food = 0, water = 0, clock = 0, transition = 1;
  let fromPose = sample('idle', 0), pose = fromPose;
  let previous = 0, frame = 0, visible = false, inViewport = false, started = false;

  function project(point) {
    const [x, y, z] = rotate(point, pose.viewYaw);
    const perspective = 5 / (5 - z);
    return [160 + x * scale * perspective, 160 - (y - 1 - z * .09) * scale * perspective, perspective, z];
  }

  function ellipse(point, rx, ry, color, angle = 0) {
    const [x, y, s] = project(point);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.ellipse(0, 0, rx * scale * s, ry * scale * s, 0, 0, TAU);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  function surface(path, centerX, width, tint = false, axis = [centerX - width, 0, centerX + width, 0]) {
    const gradient = ctx.createLinearGradient(...axis);
    gradient.addColorStop(0, '#405c70');
    gradient.addColorStop(.32, '#d9edf1');
    gradient.addColorStop(.58, '#a9cbd4');
    gradient.addColorStop(1, '#416479');
    ctx.fillStyle = gradient;
    ctx.fill(path);
    if (tint) {
      ctx.save();
      ctx.clip(path);
      for (const [ratio, x, color] of [[food, 0, '#34d399'], [water, 160, '#38bdf8']]) {
        const top = 292 - clamp(ratio) * 251;
        ctx.fillStyle = color;
        ctx.globalAlpha = .65;
        ctx.fillRect(x, top, 160, 300 - top);
        ctx.globalAlpha = .9;
        ctx.fillStyle = '#dcfff9';
        ctx.fillRect(x, top, 160, 1);
      }
      ctx.restore();
    }
    ctx.strokeStyle = '#e0f6ff55';
    ctx.lineWidth = .6;
    ctx.stroke(path);
  }

  function bone(a, b, r1, r2, tint = true) {
    const pa = project(a), pb = project(b);
    const angle = Math.atan2(pb[1] - pa[1], pb[0] - pa[0]);
    const normal = [-Math.sin(angle), Math.cos(angle)];
    const ra = r1 * scale * pa[2], rb = r2 * scale * pb[2];
    const path = new Path2D();
    path.moveTo(pa[0] + normal[0] * ra, pa[1] + normal[1] * ra);
    path.lineTo(pb[0] + normal[0] * rb, pb[1] + normal[1] * rb);
    path.arc(pb[0], pb[1], rb, angle + Math.PI / 2, angle - Math.PI / 2, true);
    path.lineTo(pa[0] - normal[0] * ra, pa[1] - normal[1] * ra);
    path.arc(pa[0], pa[1], ra, angle - Math.PI / 2, angle + Math.PI / 2, true);
    path.closePath();
    const cx = (pa[0] + pb[0]) / 2, cy = (pa[1] + pb[1]) / 2, radius = Math.max(ra, rb);
    surface(path, cx, radius, tint, [
      cx - normal[0] * radius, cy - normal[1] * radius,
      cx + normal[0] * radius, cy + normal[1] * radius
    ]);
  }

  function sphere(point, radius, colors) {
    const [x, y, s] = project(point), r = radius * scale * s;
    const gradient = ctx.createRadialGradient(x - r * .32, y - r * .4, r * .05, x, y, r);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(.55, colors[1]);
    gradient.addColorStop(1, colors[2]);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
  }

  function line(points, color, width) {
    ctx.beginPath();
    points.forEach((point, i) => {
      const [x, y] = project(point);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  function torso(body) {
    const l = project(body.leftArm.start), r = project(body.rightArm.start);
    const hipL = project(add(body.leftLeg.start, [-.035, 0, 0]));
    const hipR = project(add(body.rightLeg.start, [.035, 0, 0]));
    const n = project(body.neck), c = project(body.chest);
    const path = new Path2D();
    path.moveTo(n[0] - 8, n[1]);
    path.quadraticCurveTo(l[0] - 4, l[1] - 2, l[0], l[1] + 14);
    path.bezierCurveTo(l[0] + 10, c[1] + 25, hipL[0] - 5, hipL[1] - 12, hipL[0], hipL[1] + 6);
    path.quadraticCurveTo((hipL[0] + hipR[0]) / 2, hipL[1] + 14, hipR[0], hipR[1] + 6);
    path.bezierCurveTo(hipR[0] + 5, hipR[1] - 12, r[0] - 10, c[1] + 25, r[0], r[1] + 14);
    path.quadraticCurveTo(r[0] + 4, r[1] - 2, n[0] + 8, n[1]);
    path.closePath();
    surface(path, c[0], 33, true);
    line([add(body.chest, [-.14, .04, .13]), add(body.chest, [0, .015, .16]), add(body.chest, [.14, .04, .13])], '#1c586e44', 1);
  }

  function head(body) {
    bone(body.neck, body.head, .065, .08);
    const center = project(body.head);
    const path = new Path2D();
    path.ellipse(center[0], center[1], 17 * center[2], 22 * center[2], -pose.nod, 0, TAU);
    surface(path, center[0], 20, true);
    const face = (point) => add(body.head, rotate(point, pose.yaw));
    const blink = clock % 5.3 > 5.12 ? .15 : 1;
    for (const x of [-.054, .054]) {
      ellipse(face([x, .018, .116]), .014, .021 * blink, '#123349');
      ellipse(face([x - .003, .024, .128]), .004, .005 * blink, '#ffffff');
    }
    ellipse(face([0, -.062, .123]), .032, .008 + pose.jaw * .019, '#234859');
  }

  function equipment(body, opacity = 1) {
    ctx.save();
    ctx.globalAlpha = opacity;
    const hand = body.rightArm.end;
    if (action === 'eating') {
      const apple = add(hand, [0, .035, .04]);
      sphere(apple, .061, ['#ffe0d7', '#f45c62', '#912437']);
      line([add(apple, [0, .055, 0]), add(apple, [.012, .085, 0])], '#724a27', 2);
      ellipse(add(apple, [.028, .075, 0]), .026, .012, '#82cb7c', -.4);
    } else if (action === 'drinking') {
      const axis = [Math.sin(pose.propAngle), Math.cos(pose.propAngle), 0];
      const bottom = add(hand, mul(axis, -.085)), top = add(hand, mul(axis, .10));
      bone(bottom, top, .043, .037, false);
      line([bottom, top], '#38bdf8bb', 7);
      bone(top, add(top, mul(axis, .025)), .023, .023, false);
    } else if (action === 'gym') {
      const l = body.leftArm.end, r = body.rightArm.end;
      const axis = unit(sub(r, l));
      const leftEnd = add(l, mul(axis, -.16)), rightEnd = add(r, mul(axis, .16));
      bone(leftEnd, rightEnd, .019, .019, false);
      for (const [end, sign] of [[leftEnd, 1], [rightEnd, -1]]) {
        bone(end, add(end, mul(axis, sign * .08)), .105, .105, false);
        bone(add(end, mul(axis, sign * .025)), add(end, mul(axis, sign * .055)), .108, .108, false);
      }
    } else if (action === 'tennis') {
      const axis = [Math.sin(-pose.propAngle), Math.cos(pose.propAngle), .15];
      const tip = add(hand, mul(axis, .23));
      bone(hand, tip, .018, .014, false);
      const center = project(add(tip, mul(axis, .09)));
      ctx.save();
      ctx.translate(center[0], center[1]);
      ctx.rotate(pose.propAngle);
      ctx.beginPath();
      ctx.ellipse(0, 0, 12, 18, 0, 0, TAU);
      ctx.strokeStyle = '#bcf17a';
      ctx.lineWidth = 2.6;
      ctx.stroke();
      ctx.clip();
      ctx.strokeStyle = '#c6e5be88';
      ctx.lineWidth = .65;
      for (let x = -15; x <= 15; x += 4) {
        ctx.beginPath(); ctx.moveTo(x, -20); ctx.lineTo(x, 20); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-15, x); ctx.lineTo(15, x); ctx.stroke();
      }
      ctx.restore();
    }
    if (['basketball', 'soccer', 'tennis'].includes(action)) {
      const radius = action === 'tennis' ? .035 : .12;
      const colors = action === 'basketball' ? ['#ffd9a3', '#e77c2a', '#843b17']
        : action === 'soccer' ? ['#ffffff', '#d4e0ea', '#647787'] : ['#f7ffb1', '#b5d941', '#6a852b'];
      const ballPhase = clock / PERIOD.tennis % 1;
      const ballOpacity = action === 'tennis'
        ? smooth(ballPhase / .1) * (1 - smooth((ballPhase - .85) / .15)) : 1;
      ctx.globalAlpha *= ballOpacity;
      ellipse([pose.ball[0], .012, pose.ball[2]], radius * 1.2, radius * .27, '#00000040');
      sphere(pose.ball, radius, colors);
      const [x, y, s] = project(pose.ball);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(clock * 3);
      if (action === 'basketball') {
        ctx.strokeStyle = '#532c21';
        ctx.lineWidth = 1.1;
        ctx.beginPath(); ctx.ellipse(0, 0, radius * scale * s * .45, radius * scale * s, 0, 0, TAU); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-radius * scale * s, 0); ctx.lineTo(radius * scale * s, 0); ctx.stroke();
      } else if (action === 'soccer') {
        ctx.fillStyle = '#273e50';
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const a = i * TAU / 5;
          const px = Math.cos(a) * 6 * s, py = Math.sin(a) * 6 * s;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }
    ctx.restore();
  }

  function draw() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = Math.round(rect.width * dpr), h = Math.round(rect.height * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.setTransform(h / 320, 0, 0, h / 320, (w - h) / 2, 0);
    const halo = ctx.createRadialGradient(160, 165, 10, 160, 165, 150);
    halo.addColorStop(0, '#33d3bf22'); halo.addColorStop(1, '#33d3bf00');
    ctx.fillStyle = halo; ctx.fillRect(0, 0, 320, 320);
    ellipse([0, -.025, 0], .6, .10, '#05112080');
    const body = rig(pose);
    const pieces = [];
    for (const side of ['left', 'right']) {
      const arm = body[`${side}Arm`], leg = body[`${side}Leg`];
      for (const [limb, radii] of [[arm, [.075, .062, .044]], [leg, [.108, .078, .047]]]) {
        pieces.push({ z: project(lerp(limb.start, limb.end, .5))[3], paint() {
          bone(limb.start, limb.joint, radii[0], radii[1]);
          bone(limb.joint, limb.end, radii[1], radii[2]);
        } });
      }
      pieces.push({ z: project(arm.end)[3] + .02, paint() {
        bone(arm.end, add(arm.end, [0, -.038, .015]), .047, .035);
        bone(add(arm.end, [side === 'left' ? .025 : -.025, .008, .025]), add(arm.end, [0, -.025, .043]), .018, .012);
      } });
      pieces.push({ z: project(leg.end)[3], paint() {
        bone(add(leg.end, [0, -.025, -.025]), add(leg.end, [0, -.034, .10]), .057, .065, false);
        line([add(leg.end, [-.03, -.065, -.02]), add(leg.end, [-.03, -.065, .12])], side === 'left' ? '#57d5c3' : '#6ecbff', 2);
      } });
    }
    pieces.push({ z: project(body.chest)[3], paint: () => torso(body) });
    pieces.push({ z: project(body.head)[3], paint: () => head(body) });
    pieces.sort((a, b) => a.z - b.z).forEach((piece) => piece.paint());
    equipment(body, smooth(transition));
    if (['running', 'gym', 'basketball', 'soccer', 'tennis'].includes(action)) {
      for (let i = 0; i < 3; i++) {
        const phase = (clock * .7 + i / 3) % 1;
        ctx.globalAlpha = Math.sin(phase * Math.PI) * .65;
        ellipse(add(body.head, [(i % 2 ? -1 : 1) * .22, -.28 * phase, 0]), .012, .025, '#71d5f3');
      }
      ctx.globalAlpha = 1;
    }
  }

  function tick(now) {
    frame = 0;
    if (!visible || document.hidden || reduced.matches) return;
    const delta = previous ? Math.min((now - previous) / 1000, .05) : 0;
    previous = now;
    clock += delta;
    transition = Math.min(1, transition + delta / .42);
    pose = blend(fromPose, sample(action, clock), smooth(transition));
    draw();
    frame = requestAnimationFrame(tick);
  }

  function refresh() {
    visible = inViewport && !document.hidden && canvas.getBoundingClientRect().width > 0;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    previous = 0;
    if (reduced.matches) {
      pose = sample(action, PERIOD[action] * .48);
      transition = 1;
      if (visible) draw();
    } else if (visible) {
      draw();
      frame = requestAnimationFrame(tick);
    }
  }

  root.CaloriAvatar = {
    update(next) {
      if (!ACTIONS.includes(next.action)) throw new RangeError(`Unknown avatar action: ${next.action}`);
      if (next.action !== action || !started) {
        fromPose = pose;
        action = next.action;
        clock = 0;
        transition = 0;
        started = true;
      }
      food = clamp(next.food);
      water = clamp(next.water);
      canvas.setAttribute('aria-label', next.description);
      refresh();
    }
  };
  new IntersectionObserver(([entry]) => { inViewport = entry.isIntersecting; refresh(); }).observe(canvas);
  new ResizeObserver(refresh).observe(canvas);
  document.addEventListener('visibilitychange', refresh);
  reduced.addEventListener('change', refresh);
})(globalThis);
