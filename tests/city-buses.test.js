const test = require('node:test');
const assert = require('node:assert');
const data = require('../data/city-buses.json');
const { matchBuses } = require('../city-buses.js');
const ids = (o, d) => matchBuses(data, o, d).routes.map((r) => r.id);

test('matching', () => {
  assert.deepStrictEqual(ids('候車亭', 'A7'), ['967', '967直', '202', '603']);
  assert.deepStrictEqual(ids('候車亭', '林口長庚'), ['967', '967直', '202']);
  assert.deepStrictEqual(ids('明德樓', 'A7'), []);
  assert.ok(matchBuses(data, '候車亭', '台北').destUnfiltered);
});

test('honesty + provenance', () => {
  const r202 = data.routes.find((r) => r.id === '202');
  assert.strictEqual(r202.timetables.length, 0);
  for (const r of data.routes) {
    assert.ok(r.source_url.startsWith('https://') && r.live_url.startsWith('https://') && r.last_checked === '2026-11-21');
  }
  assert.strictEqual(data.routes.find((r) => r.id === '603').timetables[0].times.length, 24);
});
