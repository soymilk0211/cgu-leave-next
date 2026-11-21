// Pure filter: which of 967/967直/202/603 match the selected origin/destination. Static data only.
(function (root) {
  const FILTERED = ['A7', 'A7 機捷', '林口長庚']; // 台北／桃園 終點 not verified per route: list by origin only
  function matchBuses(data, origin, dest) {
    const byOrigin = data.routes.filter((r) => r.origins.includes(origin));
    const filtered = FILTERED.includes(dest);
    return { routes: filtered ? byOrigin.filter((r) => r.dests.includes(dest)) : byOrigin, destUnfiltered: !filtered };
  }
  const api = { matchBuses };
  if (typeof module !== 'undefined') module.exports = api; else root.CityBuses = api;
})(typeof window !== 'undefined' ? window : globalThis);
