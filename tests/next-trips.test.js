const test = require('node:test');
const assert = require('node:assert');
const data = require('../data/a7-shuttle-timetable.json');
const { nextTrips } = require('../next-trips.js');
const at = (s) => new Date(s + '+08:00'); // injected Taipei clock
const times = (r) => r.trips.map((t) => t.time);

test('weekday off-peak: 明德 flag correct, past trips omitted', () => {
  const r = nextTrips(data, at('2026-11-23T09:20:00'), '候車亭', 'A7'); // Monday
  assert.deepStrictEqual(times(r), ['09:30', '10:00', '10:30']);
  assert.ok(r.trips.every((t) => t.detour)); // 09:05–15:40 trips are ＊
  const peak = nextTrips(data, at('2026-11-23T07:00:00'), '候車亭', 'A7');
  assert.strictEqual(peak.trips[0].detour, false);
  assert.ok(r.caveat.includes('3～5分鐘') && r.caveat.includes('滿載'));
});

test('a trip at exactly now is past', () => {
  assert.strictEqual(times(nextTrips(data, at('2026-11-23T09:30:00'), '候車亭', 'A7'))[0], '10:00');
});

test('Friday extra appears (明德樓), Monday has none', () => {
  const fri = nextTrips(data, at('2026-11-20T19:10:00'), '明德樓', 'A7');
  assert.ok(fri.trips.some((t) => t.extra && t.time === '19:15'));
  const mon = nextTrips(data, at('2026-11-23T19:10:00'), '明德樓', 'A7');
  assert.ok(!mon.trips.some((t) => t.extra));
});

test('after the last run: empty and noMore', () => {
  const r = nextTrips(data, at('2026-11-23T23:00:00'), '候車亭', 'A7');
  assert.deepStrictEqual([r.status, r.trips.length, r.noMore], ['ok', 0, true]);
});

test('fewer than three left is flagged', () => {
  const r = nextTrips(data, at('2026-11-23T21:00:00'), '候車亭', 'A7'); // last shelter times 21:10..
  assert.ok(r.trips.length < 3 && r.noMore);
  assert.ok(r.trips.every((t) => t.time > '21:00'));
});

test('non-service day (連假 during) says no service', () => {
  const r = nextTrips(data, at('2026-12-01T10:00:00'), '候車亭', 'A7', { dayKinds: { '2026-12-01': 'none' } });
  assert.strictEqual(r.status, 'no_service');
});

test('Saturday: no regular trips + message; Sunday uses Sun/holiday column; Friday has extras', () => {
  for (const o of ['候車亭', '明德樓']) {
    const sat = nextTrips(data, at('2026-11-28T10:00:00'), o, 'A7');
    assert.strictEqual(sat.status, 'no_saturday');
    assert.strictEqual(sat.message, '週六常態無校車，請改搭 603／967／202');
    assert.ok(!sat.trips);
  }
  assert.strictEqual(nextTrips(data, at('2026-11-28T10:00:00'), '候車亭', 'A7').breakNote, '寒暑假班表另行公告，請看總務處');
  const sun = nextTrips(data, at('2026-11-29T08:00:00'), '候車亭', 'A7');
  assert.strictEqual(times(sun)[0], '17:00');
  assert.ok(sun.note.includes('星期日'));
  assert.ok(nextTrips(data, at('2026-11-27T19:10:00'), '明德樓', 'A7').trips.some((t) => t.extra && t.time === '19:15'));
});

test('2026-11-21 sports-day override only on that date', () => {
  assert.deepStrictEqual(times(nextTrips(data, at('2026-11-21T07:00:00'), '候車亭', 'A7')), ['07:25', '07:40', '07:55']);
  assert.notStrictEqual(nextTrips(data, at('2026-11-22T07:00:00'), '候車亭', 'A7').trips[0].time, '07:25');
});

test('combinations with no trips say so', () => {
  for (const [o, d] of [['候車亭', '台北'], ['候車亭', '林口長庚'], ['A7', 'A7'], ['明德樓', '桃園']])
    assert.strictEqual(nextTrips(data, at('2026-11-23T09:00:00'), o, d).status, 'no_route');
});
