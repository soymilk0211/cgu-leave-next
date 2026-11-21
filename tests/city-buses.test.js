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
  for (const r of data.routes) {
    assert.ok(r.source_url.startsWith('https://') && r.live_url.startsWith('https://') && r.last_checked === '2026-11-21');
  }
  assert.strictEqual(data.routes.find((r) => r.id === '603').timetables[0].times.length, 24);
});

test('202 verified from ebus.tycg; 603 origin; 967 operator label', () => {
  const by = (id) => data.routes.find((r) => r.id === id);
  const r202 = by('202');
  assert.strictEqual(r202.source_url, 'https://ebus.tycg.gov.tw/ebus/time-table/2020');
  assert.deepStrictEqual(r202.timetables[0].times, ['07:30', '10:10', '14:20', '15:40', '17:00', '18:30', '20:10']);
  assert.deepStrictEqual(r202.timetables[1].times, ['09:10', '14:20', '17:00', '18:50']);
  assert.ok(r202.timetables.every((t) => t.time_template.includes('從體育大學發車，長庚大學為下一站') && t.times.includes('17:00')));
  assert.ok(!JSON.stringify(r202).includes('未驗證）。本頁不列'));
  assert.strictEqual(by('603').also_source, 'https://ebus.tycg.gov.tw/ebus/time-table/6030');
  assert.ok(by('603').timetables.every((t) => t.label.includes('長庚大學') && t.label.includes('起點')));
  assert.strictEqual(by('967').source_url, 'https://www.sanchung-bus.com.tw/image/967.pdf');
  assert.ok(by('967').timetables.every((t) => t.label === '長庚大學發車（業者標示）'));
  assert.ok(!JSON.stringify(by('967')).includes('桃園酒廠'));
});
