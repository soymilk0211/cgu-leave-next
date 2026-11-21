(async function () {
  const $ = (id) => document.getElementById(id);
  const showPeak = () => { const p = Peak.isPeak(new Date()); $('peak').hidden = !p; $('peak-text').textContent = p ? Peak.PEAK_TEXT : ''; };
  showPeak();
  const box = $('jiahao-result');
  let data;
  try { data = await (await fetch('data/a7-shuttle-timetable.json')).json(); }
  catch (e) { box.textContent = '無法載入時刻表資料（請透過網頁伺服器開啟，不要直接開檔）。'; return; }
  $('checked').textContent = data.last_checked;

  function render(now) {
    const r = NextTrips.nextTrips(data, now, $('origin').value, $('dest').value);
    const msg = { no_route: '此出發點／目的地組合沒有家豪班次（家豪只往返 A7 站與校區）。', no_service: '今日無家豪班次', unverified: '官方時刻表未載明週六是否行駛，無法列出班次（未確認，請查總務處公告）。' }[r.status];
    box.replaceChildren();
    const add = (tag, text, cls) => { const e = document.createElement(tag); e.textContent = text; if (cls) e.className = cls; box.append(e); return e; };
    if (msg) add('p', msg);
    else {
      if (r.note) add('p', r.note, 'muted');
      if (r.trips.length) {
        const ul = document.createElement('ul');
        for (const t of r.trips) {
          const li = document.createElement('li');
          li.textContent = `${t.time}　${t.detour ? '繞明德' : '不繞明德'}${t.extra ? '　週五加班車' : ''}　（${t.label}）`;
          ul.append(li);
        }
        box.append(ul);
      }
      if (r.noMore) add('p', r.trips.length ? '今日沒有更多班次了。' : '今日已無後續家豪班次。');
    }
    add('p', r.caveat, 'caveat');
    add('p', '候車亭／明德樓的時間取自官方時刻表欄位，表上未註明是到達或發車時間。', 'muted');
  }
  let buses;
  try { buses = await (await fetch('data/city-buses.json')).json(); } catch (e) { buses = null; }
  function renderBuses() {
    const el = $('buses-result');
    el.replaceChildren();
    const add = (p, tag, text, cls) => { const e = document.createElement(tag); e.textContent = text; if (cls) e.className = cls; p.append(e); return e; };
    if (!buses) return add(el, 'p', '無法載入公車資料。');
    const m = CityBuses.matchBuses(buses, $('origin').value, $('dest').value);
    if (m.destUnfiltered) add(el, 'p', '此目的地的各路線終點尚未逐一核對，僅依出發點列出。', 'muted');
    if (!m.routes.length) add(el, 'p', '沒有已核對的市區公車符合此出發點／目的地。');
    for (const r of m.routes) {
      const d = document.createElement('div');
      add(d, 'h3', r.name);
      add(d, 'p', r.note, 'caveat');
      if (r.timetable_status === 'unverified') add(d, 'p', '靜態班表：查不到（未驗證）');
      for (const t of r.timetables) {
        add(d, 'h4', t.kind + (t.terminus ? '（' + t.terminus + '發車）' : ''));
        add(d, 'p', t.times.join('、'));
      }
      const a = add(d, 'p', ''); const l = document.createElement('a');
      l.href = r.live_url; l.target = '_blank'; l.rel = 'noopener noreferrer'; l.textContent = '官方即時動態頁（另開分頁）';
      a.append(l);
      const s = add(d, 'p', '資料來源：', 'muted'); const sa = document.createElement('a');
      sa.href = r.source_url; sa.target = '_blank'; sa.rel = 'noopener noreferrer'; sa.textContent = r.source_url;
      s.append(sa, '　最後核對：' + r.last_checked);
      el.append(d);
    }
  }
  const go = () => { render(new Date()); renderBuses(); showPeak(); };
  $('origin').onchange = $('dest').onchange = go;
  go();
})();
