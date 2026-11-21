const test = require('node:test');
const assert = require('node:assert');
const { isPeak, PEAK_TEXT } = require('../peak.js');
const at = (s) => isPeak(new Date(s + '+08:00'));

test('Friday 12:00–19:00', () => {
  assert.deepStrictEqual(['11:59', '12:00', '15:00', '18:59', '19:00'].map((t) => at('2026-11-20T' + t + ':00')), [false, true, true, true, false]);
});
test('Mon–Thu 16:30–18:00', () => {
  assert.deepStrictEqual(['16:29', '16:30', '17:59', '18:00'].map((t) => at('2026-11-23T' + t + ':00')), [false, true, true, false]);
  assert.strictEqual(at('2026-11-23T13:00:00'), false); // Mon midday is not peak
});
test('weekend never', () => {
  assert.ok(!at('2026-11-21T17:00:00') && !at('2026-11-22T17:00:00'));
});
test('Taipei clock, not UTC', () => {
  assert.ok(isPeak(new Date('2026-11-23T09:00:00Z'))); // 17:00 Taipei Monday
});
test('copy reads as a pattern hint', () => {
  assert.ok(PEAK_TEXT.includes('規律') && PEAK_TEXT.includes('不是即時'));
});
