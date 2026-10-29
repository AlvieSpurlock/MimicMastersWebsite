/* ==========================================================
   Transparency trackers. Reads data/<game>.csv (settings in data/games.js).
   Mounts (put anywhere in a page, after loading data/games.js):
     <div data-tracker="scorchlet" data-root="../" data-more="../transparency.html#scorchlet"></div>
         Made / Given / Kept tiles for one game, pledge check and recent months.
     <div data-monthly="mimic-masters" data-root="../"></div>
         Month-by-month chart and table for one game.
     <div data-transparency-all data-root=""></div>
         Everything: studio totals, per charity, per game, monthly chart, full ledger.
   CSV text is only ever inserted as text, never as HTML.
   ========================================================== */
(() => {
  const GAMES = window.GAMES || [], CHARITIES = window.CHARITIES || {};
  const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const svg = (tag, attrs) => { const e = document.createElementNS("http://www.w3.org/2000/svg", tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
  const key = s => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

  /* ---------- CSV ---------- */
  function parseCSV(t) {
    t = t.replace(/^﻿/, ""); const out = []; let r = [], f = "", q = false;
    for (let i = 0; i < t.length; i++) { const c = t[i];
      if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
      else if (c === '"') q = true; else if (c === ",") { r.push(f); f = ""; }
      else if (c === "\n" || c === "\r") { if (c === "\r" && t[i + 1] === "\n") i++; r.push(f); f = ""; out.push(r); r = []; }
      else f += c; }
    if (f !== "" || r.length) { r.push(f); out.push(r); }
    const h = (out.shift() || []).map(key);
    return out.filter(r => r.some(x => x.trim())).map(r => Object.fromEntries(h.map((k, i) => [k, (r[i] || "").trim()])));
  }
  const money = v => { const n = parseFloat(String(v || "").replace(/[^0-9.\-]/g, "")); return isFinite(n) ? n : 0; };
  const cents = n => Math.round(n * 100) / 100;
  const MONTHS = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
  function monthKey(s) {
    s = String(s || "").trim(); let m;
    if ((m = /^(\d{4})[-/.](\d{1,2})/.exec(s))) return `${m[1]}-${m[2].padStart(2, "0")}`;
    if ((m = /^(\d{1,2})[-/.](\d{4})$/.exec(s))) return `${m[2]}-${m[1].padStart(2, "0")}`;
    if ((m = /^([a-z]{3})[a-z]*\.?\s+(\d{4})$/i.exec(s)) && MONTHS.includes(m[1].toLowerCase())) return `${m[2]}-${String(MONTHS.indexOf(m[1].toLowerCase()) + 1).padStart(2, "0")}`;
    return null;
  }
  const monthLabel = (k, long) => { const [y, mo] = k.split("-"); return new Date(+y, +mo - 1, 1).toLocaleDateString("en-US", { month: long ? "long" : "short", year: "numeric" }); };
  const charityOf = (code, game) => {
    const c = code || game.charity; const hit = Object.keys(CHARITIES).find(k => key(k) === key(c) || key(CHARITIES[k].name) === key(c));
    return hit ? { code: hit, ...CHARITIES[hit] } : { code: c, name: c, url: "" };
  };

  function rowsFor(game, text) {
    return parseCSV(text).map(r => {
      const month = monthKey(r.month); if (!month) return null;
      const gross = money(r.gross);
      const cutRaw = String(r.platformcut || r.cut || "");
      const cut = /%/.test(cutRaw) ? gross * money(cutRaw) / 100 : money(cutRaw);
      const g = cents(gross), c = cents(cut), net = cents(g - c), donated = cents(money(r.donated));
      const receipt = /^https?:\/\//i.test(r.receipt || "") ? r.receipt : "";
      return { game, month, platform: r.platform || "—", gross: g, cut: c, net, donated, kept: cents(net - donated), charity: charityOf(r.charity, game), receipt, notes: r.notes || "" };
    }).filter(Boolean);
  }
  const cache = {};
  function load(game, root) {
    const url = `${root}data/${game.csv}`;
    const get = u => fetch(u, { cache: "no-store" }).then(r => (r.ok ? r.text() : Promise.reject(r.status)));
    // Standalone Mimic Masters site: reads the studio's live ledger, falls back to the local copy in data/.
    return cache[url] || (cache[url] = get(url).catch(() => get(`data/${game.csv}`))
      .then(t => ({ ok: true, rows: rowsFor(game, t) }))
      .catch(() => ({ ok: false, rows: [] })));
  }
  const sum = (rows, f) => cents(rows.reduce((n, r) => n + r[f], 0));
  function byMonth(rows) {
    const m = {}; rows.forEach(r => { (m[r.month] = m[r.month] || []).push(r); });
    return Object.keys(m).sort().map(k => {
      const rs = m[k]; const pledged = cents(rs.reduce((n, r) => n + r.net * r.game.rate, 0));
      return { month: k, rows: rs, gross: sum(rs, "gross"), cut: sum(rs, "cut"), net: sum(rs, "net"), donated: sum(rs, "donated"), kept: sum(rs, "kept"), pledged, receipts: rs.filter(r => r.receipt) };
    });
  }

  /* ---------- pieces ---------- */
  function tiles(made, given, kept, givenLabel) {
    const box = el("div", "tp-tiles");
    [["Made", made, "after platform cuts", "made"], [givenLabel || "Given", given, "to charity", "given"], ["Kept", kept, "to keep the lights on", "kept"]]
      .forEach(([lab, v, sub, cls]) => { const t = el("div", "tp-tile " + cls); t.append(el("div", "tp-label", lab), el("div", "tp-val", usd.format(v)), el("div", "tp-sub", sub)); box.append(t); });
    return box;
  }
  function pledgeLine(pledged, donated, rate, charityName, latestMonth) {
    const p = el("p", "tp-pledge"); const owed = cents(pledged - donated);
    if (owed <= 0.009) p.append(el("b", "tp-ok", "✓ Pledge kept. "), `${Math.round(rate * 100)}% of net revenue promised to ${charityName}: ${usd.format(pledged)}. Given: ${usd.format(donated)}.`);
    else p.append(el("b", "tp-due", "⏳ Donation pending. "), `${usd.format(owed)} still to give to ${charityName}` + (latestMonth ? `, usually sent at the end of ${monthLabel(latestMonth, true)}.` : "."));
    return p;
  }
  function placeholder(title, sub) { const d = el("div", "tp-empty"); d.append(el("div", "tp-cup", "☕"), el("div", "tp-empty-t", title), el("div", "tp-empty-s", sub)); return d; }
  function receiptLinks(rs) {
    const span = el("span", "tp-receipts");
    if (!rs.length) { span.textContent = "—"; return span; }
    rs.forEach((r, i) => { const a = el("a", null, rs.length > 1 ? `Receipt ${i + 1}` : "Receipt"); a.href = r.receipt; a.target = "_blank"; a.rel = "noopener"; span.append(a); });
    return span;
  }
  function monthTable(months, opts = {}) {
    const wrap = el("div", "tp-table-wrap"), t = el("table", "tp-table"), head = el("tr");
    const cols = opts.full ? ["Month", "Gross", "Platform cut", "Made", "Given", "Kept", "Proof"] : ["Month", "Made", "Given", "Kept", "Proof"];
    cols.forEach((c, i) => head.append(el("th", i > 0 && c !== "Proof" ? "num" : null, c)));
    const thead = el("thead"); thead.append(head); t.append(thead);
    const tb = el("tbody");
    [...months].reverse().forEach(m => {
      const tr = el("tr"); tr.append(el("td", null, monthLabel(m.month)));
      if (opts.full) tr.append(el("td", "num", usd.format(m.gross)), el("td", "num neg", m.cut ? "−" + usd.format(m.cut) : usd.format(0)));
      tr.append(el("td", "num", usd.format(m.net)), el("td", "num given", usd.format(m.donated)), el("td", "num", usd.format(m.kept)));
      const td = el("td"); td.append(receiptLinks(m.receipts)); tr.append(td); tb.append(tr);
    });
    t.append(tb); wrap.append(t); return wrap;
  }
  function chart(months, title) {
    const fig = el("figure", "tp-chart"); if (title) fig.append(el("figcaption", null, title));
    const W = 720, H = 260, padL = 58, padB = 34, padT = 12, n = months.length;
    const max = Math.max(1, ...months.map(m => m.net)); const nice = niceMax(max);
    const s = svg("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": "Monthly made, given and kept" });
    const plotH = H - padB - padT, plotW = W - padL - 10, slot = plotW / Math.max(n, 1), bw = Math.min(46, slot * 0.62);
    for (let i = 0; i <= 4; i++) {
      const v = nice * i / 4, y = padT + plotH - plotH * v / nice;
      s.append(svg("line", { x1: padL, x2: W - 10, y1: y, y2: y, class: "tp-grid" }));
      const lab = svg("text", { x: padL - 8, y: y + 4, class: "tp-axis", "text-anchor": "end" }); lab.textContent = usd.format(v).replace(/\.00$/, ""); s.append(lab);
    }
    months.forEach((m, i) => {
      const x = padL + slot * i + (slot - bw) / 2, base = padT + plotH;
      const hGiven = plotH * Math.max(0, m.donated) / nice, hKept = plotH * Math.max(0, m.kept) / nice;
      const g = svg("g", {});
      const rk = svg("rect", { x, y: base - hGiven - hKept, width: bw, height: hKept, class: "tp-bar-kept", rx: 3 });
      const rg = svg("rect", { x, y: base - hGiven, width: bw, height: hGiven, class: "tp-bar-given", rx: 3 });
      const tip = svg("title", {}); tip.textContent = `${monthLabel(m.month, true)}: made ${usd.format(m.net)}, gave ${usd.format(m.donated)}, kept ${usd.format(m.kept)}`;
      g.append(tip, rk, rg); s.append(g);
      if (n <= 14 || i % Math.ceil(n / 12) === 0) { const lab = svg("text", { x: x + bw / 2, y: H - 12, class: "tp-axis", "text-anchor": "middle" }); lab.textContent = monthLabel(m.month).replace(" 20", " ’"); s.append(lab); }
    });
    fig.append(s);
    const legend = el("div", "tp-legend"); legend.append(el("span", "lg-given", "Given to charity"), el("span", "lg-kept", "Kept"));
    fig.append(legend); return fig;
  }
  function niceMax(v) { const p = Math.pow(10, Math.floor(Math.log10(v))); for (const m of [1, 2, 2.5, 5, 10]) if (v <= m * p) return m * p; return 10 * p; }

  /* ---------- mounts ---------- */
  const rootOf = m => m.dataset.root || "";
  const findGame = id => GAMES.find(g => g.id === id);

  document.querySelectorAll("[data-tracker]").forEach(async m => {
    const game = findGame(m.dataset.tracker); if (!game) return;
    const ch = charityOf("", game);
    m.replaceChildren(placeholder("Pouring the tea…", "Counting every last sugar cube."));
    const { ok, rows } = await load(game, rootOf(m));
    m.replaceChildren();
    if (!rows.length) {
      m.append(tiles(0, 0, 0, "Given to " + ch.code));
      m.append(placeholder(ok ? "The kettle is on!" : "The ledger couldn't be reached", ok ? `Nothing has been earned or given yet. The first month will show up right here, down to the cent.` : "Please check back in a little while."));
      return;
    }
    const months = byMonth(rows), pledged = cents(months.reduce((n, x) => n + x.pledged, 0));
    const net = sum(rows, "net"), donated = sum(rows, "donated"), kept = sum(rows, "kept");
    m.append(tiles(net, donated, kept, "Given to " + ch.code));
    m.append(pledgeLine(pledged, donated, game.rate, ch.name, months[months.length - 1].month));
    m.append(monthTable(months.slice(-6)));
    if (m.dataset.more) { const a = el("a", "tp-more", "See every month, with platform cuts →"); a.href = m.dataset.more; m.append(a); }
  });

  document.querySelectorAll("[data-monthly]").forEach(async m => {
    const game = findGame(m.dataset.monthly); if (!game) return;
    const ch = charityOf("", game);
    m.replaceChildren(placeholder("Pouring the tea…", "Counting every last sugar cube."));
    const { ok, rows } = await load(game, rootOf(m));
    m.replaceChildren();
    if (!rows.length) { m.append(tiles(0, 0, 0, "Given to " + ch.code), placeholder(ok ? "The ledger is empty, for now." : "The ledger couldn't be reached", "Every month will be listed here: what came in, what the stores took, what went to charity and what was kept.")); return; }
    const months = byMonth(rows), pledged = cents(months.reduce((n, x) => n + x.pledged, 0));
    m.append(tiles(sum(rows, "net"), sum(rows, "donated"), sum(rows, "kept"), "Given to " + ch.code));
    m.append(pledgeLine(pledged, sum(rows, "donated"), game.rate, ch.name, months[months.length - 1].month));
    m.append(chart(months, "Month by month"));
    m.append(monthTable(months, { full: true }));
    const plats = {}; rows.forEach(r => { const p = plats[r.platform] = plats[r.platform] || { gross: 0, cut: 0, net: 0 }; p.gross += r.gross; p.cut += r.cut; p.net += r.net; });
    const pl = el("div", "tp-platforms"); pl.append(el("h4", null, "By platform"));
    Object.entries(plats).forEach(([name, p]) => { const d = el("div", "tp-plat"); d.append(el("b", null, name), el("span", null, `${usd.format(cents(p.gross))} gross · −${usd.format(cents(p.cut))} cut · ${usd.format(cents(p.net))} made`)); pl.append(d); });
    m.append(pl);
  });

  document.querySelectorAll("[data-transparency-all]").forEach(async m => {
    const root = rootOf(m);
    m.replaceChildren(placeholder("Pouring the tea…", "Counting every last sugar cube."));
    const results = await Promise.all(GAMES.map(g => load(g, root)));
    const rows = results.flatMap(r => r.rows);
    m.replaceChildren();
    const totals = el("section", "tp-block");
    totals.append(el("h3", "tp-h", "Studio totals"), tiles(sum(rows, "net"), sum(rows, "donated"), sum(rows, "kept"), "Given"));
    if (rows.length) totals.append(el("p", "tp-note", `Before platform cuts, players spent ${usd.format(sum(rows, "gross"))}. The stores kept ${usd.format(sum(rows, "cut"))}.`));
    m.append(totals);

    // per charity
    const cBlock = el("section", "tp-block"); cBlock.append(el("h3", "tp-h", "Where the giving goes"));
    const cGrid = el("div", "tp-charities"), perC = {};
    GAMES.forEach(g => { const c = charityOf("", g); perC[c.code] = perC[c.code] || { ...c, total: 0, games: new Set() }; perC[c.code].games.add(g.name); });
    rows.forEach(r => { const c = perC[r.charity.code] = perC[r.charity.code] || { ...r.charity, total: 0, games: new Set() }; c.total += r.donated; c.games.add(r.game.name); });
    Object.values(perC).forEach(c => {
      const card = el("div", "tp-charity"); const name = c.url ? el("a", null, c.name) : el("span", null, c.name);
      if (c.url) { name.href = c.url; name.target = "_blank"; name.rel = "noopener"; }
      const h = el("div", "tp-charity-name"); h.append(name);
      card.append(h, el("div", "tp-val", usd.format(cents(c.total))), el("div", "tp-sub", "from " + [...c.games].join(", ")));
      cGrid.append(card);
    });
    cBlock.append(cGrid); m.append(cBlock);

    // per game
    const gBlock = el("section", "tp-block"); gBlock.append(el("h3", "tp-h", "By game"));
    const wrap = el("div", "tp-table-wrap"), t = el("table", "tp-table"), hr = el("tr");
    ["Game", "Pledge", "Made", "Given", "Kept", ""].forEach((c, i) => hr.append(el("th", i >= 2 && i <= 4 ? "num" : null, c)));
    const th = el("thead"); th.append(hr); t.append(th); const tb = el("tbody");
    GAMES.forEach((g, i) => {
      const rs = results[i].rows, c = charityOf("", g), tr = el("tr"); tr.id = "row-" + g.id;
      const name = el("a", null, g.name); name.href = root + g.page; const td0 = el("td"); td0.append(name);
      tr.append(td0, el("td", null, `${Math.round(g.rate * 100)}% → ${c.code}`), el("td", "num", usd.format(sum(rs, "net"))), el("td", "num given", usd.format(sum(rs, "donated"))), el("td", "num", usd.format(sum(rs, "kept"))));
      const td = el("td"); const a = el("a", null, "Months ↓"); a.href = "#" + g.id; td.append(a); tr.append(td); tb.append(tr);
    });
    t.append(tb); wrap.append(t); gBlock.append(wrap); m.append(gBlock);

    // combined monthly chart
    if (rows.length) { const mBlock = el("section", "tp-block"); mBlock.append(el("h3", "tp-h", "Month by month, all games"), chart(byMonth(rows))); m.append(mBlock); }

    // each game's full months
    GAMES.forEach((g, i) => {
      const rs = results[i].rows, c = charityOf("", g), sec = el("section", "tp-block tp-game"); sec.id = g.id;
      const h = el("h3", "tp-h"); const a = el("a", null, g.name); a.href = root + g.page; h.append(a);
      sec.append(h, el("p", "tp-note", `${Math.round(g.rate * 100)}% of net revenue goes to ${c.name}.`));
      if (!rs.length) sec.append(placeholder("Nothing yet", results[i].ok ? "No months recorded for this game yet." : "This game's ledger couldn't be reached."));
      else { const months = byMonth(rs); sec.append(pledgeLine(cents(months.reduce((n, x) => n + x.pledged, 0)), sum(rs, "donated"), g.rate, c.name, months[months.length - 1].month), monthTable(months, { full: true })); }
      m.append(sec);
    });
  });
})();
