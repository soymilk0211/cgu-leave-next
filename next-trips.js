// Pure logic: next 家豪 trips from the verified timetable. No DOM, no fetch; `now` is injected.
(function (root) {
  const STOP = { '候車亭': 'campus_shelter', '明德樓': 'meide' };
  const TO_A7 = ['A7', 'A7 機捷']; // 家豪 only serves A7站1號出口
  const SHEET = { direct_loop: '直達', offpeak_detour_loop: '繞明德', meide_start_loop: '明德樓發車（第二張表）', sports_day_direct_loop: '直達', sports_day_meide_loop: '明德樓發車' };

  function taipei(now) {
    const p = {};
    for (const x of new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Taipei', hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(now)) p[x.type] = x.value;
    return { date: `${p.year}-${p.month}-${p.day}`, dow: new Date(Date.UTC(p.year, p.month - 1, p.day)).getUTCDay(), sec: +p.hour * 3600 + +p.minute * 60 + +p.second };
  }
  const mins = (hhmm) => { const [h, m] = hhmm.split(':'); return h * 60 + +m; };

  // opts.dayKinds: optional {YYYY-MM-DD: 'friday'|'sunday'|'none'} for 連假 days (the data has no holiday calendar).
  function nextTrips(data, now, origin, dest, opts) {
    const t = taipei(now);
    const base = { date: t.date, limit: 3, caveat: data.caveat.zh };
    if (!STOP[origin] || !TO_A7.includes(dest)) return { ...base, status: 'no_route' };

    const ov = data.overrides.find((o) => o.valid_on === t.date);
    let pool, note = '';
    const kind = ((opts && opts.dayKinds) || {})[t.date];
    if (ov) { pool = ov.trips; note = '今日為運動會特別班表（僅 ' + ov.valid_on + ' 適用）。'; }
    else if (kind === 'none') return { ...base, status: 'no_service' };
    else {
      const sched = kind === 'sunday' || (!kind && t.dow === 0) ? ['sun_holiday']
        : kind === 'friday' || (!kind && t.dow === 5) ? ['mon_fri', 'friday_preholiday_extra']
        : !kind && t.dow >= 1 && t.dow <= 4 ? ['mon_fri'] : null;
      if (!sched) return { ...base, status: 'unverified' }; // Saturday: not stated by the source
      pool = data.trips.filter((x) => sched.includes(x.schedule));
      if (sched[0] === 'sun_holiday') note = '星期日／例假日官方表只列下午班次。';
    }

    const key = STOP[origin];
    const all = pool.filter((x) => x.stop_times[key]).map((x) => ({
      id: x.id, time: x.stop_times[key], detour: x.detours_via_meide,
      extra: !!x.is_friday_or_preholiday_extra || x.schedule === 'friday_preholiday_extra',
      label: SHEET[x.route],
    })).sort((a, b) => mins(a.time) - mins(b.time));
    const upcoming = all.filter((x) => mins(x.time) * 60 > t.sec);
    return { ...base, status: 'ok', note, trips: upcoming.slice(0, 3), noMore: upcoming.length < 3 };
  }

  const api = { nextTrips, taipei };
  if (typeof module !== 'undefined') module.exports = api; else root.NextTrips = api;
})(typeof window !== 'undefined' ? window : globalThis);
