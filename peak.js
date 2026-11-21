// Pure logic: regular-pattern peak hint. `now` is injected; no live data.
(function (root) {
  const NT = typeof module !== 'undefined' ? require('./next-trips.js') : root.NextTrips;
  // Fri 12:00–19:00, Mon–Fri 16:30–18:00 (start inclusive, end exclusive). shortcut: no holiday calendar, so 連假 days still show it.
  function isPeak(now) {
    const { dow, sec } = NT.taipei(now), m = sec / 60;
    return (dow === 5 && m >= 720 && m < 1140) || (dow >= 1 && dow <= 5 && m >= 990 && m < 1080);
  }
  const PEAK_TEXT = '現在是尖峰，建議提早 30 分鐘或改搭其他路線。（這是依週五 12:00–19:00、平日 16:30–18:00 的規律所做的文字提示，不是即時排隊或擁擠資料。）';
  const api = { isPeak, PEAK_TEXT };
  if (typeof module !== 'undefined') module.exports = api; else root.Peak = api;
})(typeof window !== 'undefined' ? window : globalThis);
