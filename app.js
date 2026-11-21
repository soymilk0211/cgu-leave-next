(async function () {
  const $ = (id) => document.getElementById(id);
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
  const go = () => render(new Date());
  $('origin').onchange = $('dest').onchange = go;
  go();
})();
