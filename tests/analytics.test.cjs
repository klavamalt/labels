const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(require('node:path').join(__dirname, '../analytics.js'), 'utf8');
function setup(ym) {
  const window = { ym };
  vm.runInNewContext(source, { window });
  return window.ProjectAnalytics;
}
test('each case counts start and result once per attempt, without reaction data', () => {
  const calls = [];
  const analytics = setup((...args) => calls.push(args));
  for (let id = 1; id <= 6; id++) {
    const attempt = analytics.story(id);
    attempt.complete();
    assert.equal(calls.length, (id - 1) * 2);
    attempt.start(); attempt.start();
    attempt.complete(); attempt.complete();
    const pair = JSON.parse(JSON.stringify(calls.slice(-2)));
    assert.deepEqual(pair, [
      [113784473, 'reachGoal', 'story_start', { case_id: id }],
      [113784473, 'reachGoal', 'story_complete', { case_id: id }]
    ]);
  }
  const replay = analytics.story(1);
  replay.start(); replay.complete();
  assert.equal(calls.length, 14);
});
test('unavailable or failing analytics never blocks the story', () => {
  for (const ym of [undefined, () => { throw new Error('blocked'); }]) {
    const attempt = setup(ym).story(1);
    assert.doesNotThrow(() => { attempt.start(); attempt.complete(); });
  }
});
