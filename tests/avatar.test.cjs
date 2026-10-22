const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('production preserves all original SVG avatar action animations', () => {
  const read = (file) => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const html = read('index.html');
  const styles = read('style.css');

  assert.match(html, /<svg class="body-avatar"/);
  assert.doesNotMatch(html, /avatar-motion\.js|<canvas/i);
  assert.doesNotMatch(styles, /\.has-natural-avatar\s+\.body-avatar\s*\{\s*display:\s*none/);
  assert.doesNotMatch(read('sw.js'), /avatar-motion\.js/);
  assert.doesNotMatch(read(path.join('ops', 'deploy.ps1')), /avatar-motion\.js/);

  for (const [action, animation] of [
    ['eating', 'arm-eat-lift'],
    ['drinking', 'arm-drink-tilt'],
    ['running', 'body-run-stride'],
    ['gym', 'body-gym-squat'],
    ['basketball', 'basketball-dribble'],
    ['soccer', 'soccer-ball-kick'],
    ['tennis', 'racket-swing']
  ]) {
    assert.ok(styles.includes(`.body-figure.action-${action}`), `${action} selector remains`);
    assert.ok(styles.includes(`animation: ${animation}`), `${animation} remains enabled`);
  }
});

test('regular deployments do not rerun TLS provisioning', () => {
  const deploy = fs.readFileSync(path.join(__dirname, '..', 'ops', 'deploy.ps1'), 'utf8');
  assert.doesNotMatch(deploy, /server-setup\.sh|certbot/i);
  assert.match(deploy, /systemctl restart caloritrack\.service/);
});
