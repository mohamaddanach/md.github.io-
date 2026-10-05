/* Training Shipping — lightweight SVG charts & graphics (theme-aware tokens, direct labels, hover tooltips).
 * Palette: validated reference palette slots 1–3 (--s1 blue, --s2 orange, --s3 aqua) + status tokens. */
(function () {
  const esc = TS.esc, L = TS.L, t = TS.t;
  const V = (TS.viz = {});
  const f0 = (x) => TS.num(x, 0);
  const tipAttr = (s) => ` data-tip="${esc(s)}" tabindex="0"`;
  const legend = (items) => `<div class="legend">${items.map((x) => `<span><i style="background:var(--${x.c})"></i>${esc(x.l)}</span>`).join('')}</div>`;
  const head = (o) => (o.title ? `<p class="viz-title">${esc(o.title)}</p>` : '') + (o.sub ? `<p class="viz-sub">${esc(o.sub)}</p>` : '');
  const rr = (x, y, w, h, r, cls, fill, extra) => { r = Math.min(r, w / 2, h / 2); return `<path d="M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h} Z" class="${cls || ''}" fill="${fill}"${extra || ''}/>`; };
  const hbar = (x, y, w, h, fill, extra) => { w = Math.max(w, 1); const r = Math.min(4, h / 2, w / 2); return `<path d="M${x},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h - r} Q${x + w},${y + h} ${x + w - r},${y + h} H${x} Z" fill="${fill}"${extra || ''}/>`; };

  /* grouped horizontal bars: {title, sub, series:[{l, c:'s1'}], rows:[{label, values:[], tips:[]}], unit, fmt} */
  V.hbars = (o) => {
    const W = 640, LW = 130, RW = 74, BH = 14, G = 2, RG = 14;
    const ns = o.series.length, rowH = ns * BH + (ns - 1) * G;
    const max = Math.max(...o.rows.flatMap((r) => r.values), 1);
    const H = o.rows.length * (rowH + RG) + 22;
    const sx = (v) => (v / max) * (W - LW - RW);
    const fmt = o.fmt || ((v) => (o.unit || '') + ' ' + f0(v));
    let svg = '';
    [0, 0.25, 0.5, 0.75, 1].forEach((p) => { const x = LW + p * (W - LW - RW); svg += `<line class="gl" x1="${x}" x2="${x}" y1="0" y2="${H - 18}"/><text x="${x}" y="${H - 4}" text-anchor="middle">${f0(max * p)}</text>`; });
    o.rows.forEach((r, i) => {
      const y0 = i * (rowH + RG) + 4;
      svg += `<text x="${LW - 8}" y="${y0 + rowH / 2 + 4}" text-anchor="end" class="${r.strong ? 'tt' : ''}">${esc(r.label)}</text>`;
      r.values.forEach((v, j) => {
        const y = y0 + j * (BH + G), w = sx(v);
        svg += hbar(LW, y, w, BH, `var(--${o.series[j].c})`, tipAttr(`${r.label} — ${o.series[j].l}: ${fmt(v)}${r.tips && r.tips[j] ? '\n' + r.tips[j] : ''}`));
        svg += `<text class="vl" x="${LW + w + 5}" y="${y + BH - 3}">${esc(fmt(v))}</text>`;
      });
    });
    return `<div class="viz">${head(o)}${ns > 1 ? legend(o.series) : ''}<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.title || 'bar chart')}">${svg}</svg></div>`;
  };

  /* single stacked bar: {title, sub, parts:[{l, v, c}], unit} */
  V.stack = (o) => {
    const W = 640, H = 30, tot = o.parts.reduce((a, p) => a + p.v, 0) || 1;
    let x = 0, svg = '';
    o.parts.forEach((p, i) => {
      const w = (p.v / tot) * W - (i < o.parts.length - 1 ? 2 : 0);
      svg += `<rect x="${x}" y="0" width="${Math.max(w, 1)}" height="${H}" rx="${i === 0 || i === o.parts.length - 1 ? 4 : 0}" fill="var(--${p.c})"${tipAttr(`${p.l}: ${o.unit || ''} ${TS.num(p.v)} (${TS.num((p.v / tot) * 100, 1)}%)`)}/>`;
      if (w > 70) svg += `<text x="${x + 8}" y="${H / 2 + 4}" style="fill:#fff;font-weight:600">${TS.num((p.v / tot) * 100, 0)}%</text>`;
      x += w + 2;
    });
    return `<div class="viz">${head(o)}<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.title || '')}">${svg}</svg><div class="legend">${o.parts.map((p) => `<span><i style="background:var(--${p.c})"></i>${esc(p.l)}: <b>${o.unit || ''} ${TS.num(p.v)}</b></span>`).join('')}</div></div>`;
  };

  /* cumulative cost by day: {title, sub, days, free, costAt(d), actual, unit} */
  V.ddcurve = (o) => {
    const W = 640, H = 220, PL = 50, PB = 26, PT = 10, PR = 16;
    const N = o.days, maxC = Math.max(o.costAt(N), 1);
    const sx = (d) => PL + ((d - 0.5) / N) * (W - PL - PR), sy = (c) => PT + (1 - c / maxC) * (H - PT - PB);
    let svg = `<rect x="${sx(0.5)}" y="${PT}" width="${sx(o.free + 0.5) - sx(0.5)}" height="${H - PT - PB}" fill="var(--ok-soft)"/><text x="${sx(0.5) + 6}" y="${PT + 14}">${esc(t(L('Free time', 'فترة السماح')))} (${o.free})</text>`;
    [0, 0.5, 1].forEach((p) => { const y = sy(maxC * p); svg += `<line class="gl" x1="${PL}" x2="${W - PR}" y1="${y}" y2="${y}"/><text x="${PL - 6}" y="${y + 4}" text-anchor="end">${f0(maxC * p)}</text>`; });
    let path = '';
    for (let d = 1; d <= N; d++) { const c = o.costAt(d); path += (d === 1 ? `M${sx(d - 0.5)},${sy(c)}` : ` H${sx(d - 0.5)} V${sy(c)}`) ; }
    path += ` H${sx(N + 0.5)}`;
    svg += `<path d="${path}" fill="none" stroke="var(--s1)" stroke-width="2"/>`;
    for (let d = 1; d <= N; d++) {
      if (d % Math.ceil(N / 12) === 0 || d === 1) svg += `<text x="${sx(d)}" y="${H - 8}" text-anchor="middle">${d}</text>`;
      svg += `<rect x="${sx(d - 0.5)}" y="${PT}" width="${sx(d + 0.5) - sx(d - 0.5)}" height="${H - PT - PB}" fill="transparent"${tipAttr(`${t(L('Day', 'اليوم'))} ${d}: ${o.unit || ''} ${f0(o.costAt(d))}`)}/>`;
    }
    if (o.actual) { const x = sx(o.actual); svg += `<line x1="${x}" x2="${x}" y1="${PT}" y2="${H - PB}" stroke="var(--s2)" stroke-width="2" stroke-dasharray="4 3"/><circle cx="${x}" cy="${sy(o.costAt(o.actual))}" r="5" fill="var(--s2)" stroke="var(--panel)" stroke-width="2"/><text class="vl" x="${x + 7}" y="${sy(o.costAt(o.actual)) - 8}">${esc(t(L('Empty returned', 'إرجاع الفارغ')))} — ${o.unit || ''} ${f0(o.costAt(o.actual))}</text>`; }
    return `<div class="viz">${head(o)}<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.title || '')}">${svg}</svg></div>`;
  };

  /* waterfall: {title, sub, items:[{l, v, kind:'total'|'delta'}], unit} — deltas may be negative */
  V.waterfall = (o) => {
    const W = 640, H = 230, PB = 40, PT = 18, n = o.items.length, bw = Math.min(90, (W - 20) / n - 14);
    let run = 0; const bars = o.items.map((it) => { if (it.kind === 'total') { run = it.v; return { it, a: 0, b: it.v }; } const a = run; run += it.v; return { it, a, b: run }; });
    const max = Math.max(...bars.map((x) => Math.max(x.a, x.b)), 1);
    const sy = (v) => PT + (1 - v / max) * (H - PT - PB);
    let svg = `<line class="ax" x1="0" x2="${W}" y1="${sy(0)}" y2="${sy(0)}"/>`;
    bars.forEach((x, i) => {
      const cx = 10 + i * ((W - 20) / n) + ((W - 20) / n - bw) / 2;
      const top = sy(Math.max(x.a, x.b)), h = Math.max(Math.abs(sy(x.a) - sy(x.b)), 2);
      const col = x.it.kind === 'total' ? 's1' : 's2';
      svg += rr(cx, top, bw, h, x.it.kind === 'total' ? 4 : 2, '', `var(--${col})`, tipAttr(`${x.it.l}: ${o.unit || ''} ${TS.num(x.it.v)}`));
      if (i < n - 1) svg += `<line x1="${cx + bw}" x2="${cx + bw + 14}" y1="${sy(x.b)}" y2="${sy(x.b)}" class="gl" stroke-dasharray="3 2"/>`;
      svg += `<text class="vl" x="${cx + bw / 2}" y="${top - 5}" text-anchor="middle">${x.it.kind === 'total' ? '' : x.it.v < 0 ? '−' : '+'}${TS.num(Math.abs(x.it.v), 0)}</text>`;
      svg += `<text x="${cx + bw / 2}" y="${H - PB + 16}" text-anchor="middle">${esc(x.it.l)}</text>`;
    });
    return `<div class="viz">${head(o)}${legend([{ l: t(L('Totals', 'المجاميع')), c: 's1' }, { l: t(L('Additions / deductions', 'إضافات / حسومات')), c: 's2' }])}<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.title || '')}">${svg}</svg></div>`;
  };

  /* utilisation meter */
  V.meter = (label, value, max, unit) => {
    const p = Math.max(0, Math.min(100, (value / max) * 100));
    return `<div class="meter ${p > 100 ? 'bad' : p > 90 ? 'warn' : ''}"><div class="mt"><span>${esc(label)}</span><b>${TS.num(value, 1)} / ${TS.num(max, 0)} ${esc(unit)} · ${TS.num(p, 0)}%${p > 90 ? ' ⚠' : ''}</b></div><div class="track" role="meter" aria-valuenow="${TS.num(p, 0)}" aria-valuemin="0" aria-valuemax="100" aria-label="${esc(label)}"><div class="fill" style="width:${p}%"></div></div></div>`;
  };

  /* progress ring */
  V.ring = (pct, label, size) => {
    size = size || 84; const r = size / 2 - 7, C = 2 * Math.PI * r, p = Math.max(0, Math.min(100, pct));
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="${esc(label || '')} ${TS.num(p, 0)}%"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--line)" stroke-width="7"/><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--ok)" stroke-width="7" stroke-linecap="round" stroke-dasharray="${(C * p) / 100} ${C}" transform="rotate(-90 ${size / 2} ${size / 2})"/><text x="50%" y="54%" text-anchor="middle" class="ring-txt" style="font-size:${size / 4.6}px">${TS.num(p, 0)}%</text></svg>`;
  };

  /* deadline timeline: {title, today, items:[{l, date}]} — same-date items merged; if labels would collide, markers are numbered with a key below */
  V.timeline = (o) => {
    const byDate = {};
    o.items.filter((x) => x.date).forEach((x) => { (byDate[x.date] = byDate[x.date] || []).push(x.l); });
    const pts = Object.keys(byDate).sort().map((d) => ({ date: d, l: byDate[d].join(' · ') }));
    const ds = pts.map((p) => p.date).concat([o.today]).sort();
    const a = ds[0], b = ds[ds.length - 1], span = Math.max(TS.diffDays(a, b), 1);
    const W = 640, PX = 40, AX = 62, sx = (d) => PX + (TS.diffDays(a, d) / span) * (W - 2 * PX);
    const xs = pts.map((p) => sx(p.date));
    const crowded = xs.some((x, i) => i > 0 && x - xs[i - 1] < 120);
    let svg = `<line class="ax" x1="${PX}" x2="${W - PX}" y1="${AX}" y2="${AX}"/>`;
    const tx = sx(o.today), ta = tx > W - PX - 60 ? 'end' : tx < PX + 60 ? 'start' : 'middle';
    svg += `<line x1="${tx}" x2="${tx}" y1="${AX - 40}" y2="${AX + 30}" stroke="var(--s2)" stroke-width="2" stroke-dasharray="4 3"/><text x="${tx}" y="${AX + 46}" text-anchor="${ta}" class="vl">${esc(t(L('Today', 'اليوم')))} ${esc(TS.fmtDate(o.today, false))}</text>`;
    const status = (p) => { const dd = TS.diffDays(o.today, p.date); return p.date < o.today ? t(L('passed', 'مضى')) : dd === 0 ? t(L('TODAY', 'اليوم')) : t(L('in ', 'بعد ')) + dd + t(L(' day(s)', ' يوم')); };
    pts.forEach((p, i) => {
      const cx = xs[i], past = p.date < o.today, dd = TS.diffDays(o.today, p.date);
      const stroke = past ? 'var(--ok)' : dd <= 1 ? 'var(--crit)' : 'var(--s1)';
      const yOff = crowded ? (i % 2 === 0 ? -14 : 14) : 0;
      svg += `<g${tipAttr(`${p.l}: ${TS.fmtDate(p.date)}\n${status(p)}`)}><circle cx="${cx}" cy="${AX + yOff}" r="${crowded ? 10 : 7}" fill="${past ? 'var(--ok)' : 'var(--panel)'}" stroke="${stroke}" stroke-width="2.5"/>${crowded ? `<text x="${cx}" y="${AX + yOff + 4}" text-anchor="middle" style="font-weight:700;fill:${past ? '#fff' : 'var(--viz-ink)'}">${i + 1}</text>` : ''}</g>`;
      if (crowded && yOff) svg += `<line x1="${cx}" x2="${cx}" y1="${AX}" y2="${AX + (yOff > 0 ? 4 : -4)}" class="gl"/>`;
      if (!crowded) {
        const an = cx < PX + 40 ? 'start' : cx > W - PX - 40 ? 'end' : 'middle', up = i % 2 === 0;
        svg += `<text x="${cx}" y="${up ? AX - 26 : AX + 22}" text-anchor="${an}" class="${past ? '' : 'vl'}">${esc(p.l)}</text><text x="${cx}" y="${up ? AX - 13 : AX + 35}" text-anchor="${an}">${esc(TS.fmtDate(p.date, false).replace(/ \d{4}$/, ''))}</text>`;
      }
    });
    const key = crowded ? `<ol class="legend" style="list-style:none;padding:0">${pts.map((p, i) => `<li><b>${i + 1}</b> ${esc(p.l)} — ${esc(TS.fmtDate(p.date, false))} <span class="muted">(${esc(status(p))})</span></li>`).join('')}</ol>` : '';
    return `<div class="viz">${head(o)}<svg viewBox="0 0 ${W} ${AX + 54}" role="img" aria-label="${esc(o.title || 'timeline')}">${svg}</svg>${key}${legend([{ l: t(L('Passed', 'مضى')), c: 'ok' }, { l: t(L('Today', 'اليوم')), c: 's2' }])}</div>`;
  };

  /* shipment journey illustration: {from, via, to, fromD, viaD, toD, progress 0..1, label, mode} */
  V.journey = (o) => {
    const W = 640, H = 150, x1 = 60, x3 = W - 60, x2 = (x1 + x3) / 2, y = 78;
    const path = `M${x1},${y} C${x1 + 90},${y - 50} ${x2 - 90},${y - 50} ${x2},${y} S${x3 - 90},${y + 50} ${x3},${y}`;
    const p = Math.max(0, Math.min(1, o.progress || 0));
    let svg = `<rect class="sea" x="0" y="16" width="${W}" height="${H - 40}" rx="14"/>`;
    svg += `<path class="route" d="${path}"/>`;
    svg += `<path class="route-done" d="${path}" pathLength="100" stroke-dasharray="${p * 100} 100"/>`;
    [[x1, o.from, o.fromD, p > 0], [x2, o.via, o.viaD, p >= 0.5], [x3, o.to, o.toD, p >= 1]].forEach(([x, nm, d, done], i) => {
      if (!nm) return;
      const an = i === 0 ? 'start' : i === 2 ? 'end' : 'middle', lx = i === 0 ? x - 30 : i === 2 ? x + 30 : x;
      svg += `<circle class="port ${done ? 'done' : ''}" cx="${x}" cy="${y}" r="9"${tipAttr(nm + (d ? '\n' + d : ''))}/><text x="${lx}" y="${i === 1 ? y - 22 : y + 30}" text-anchor="${an}" class="vl">${esc(nm)}</text>${d ? `<text x="${lx}" y="${i === 1 ? y - 36 : y + 44}" text-anchor="${an}">${esc(d)}</text>` : ''}`;
    });
    const bz = (a, b, c, d, u) => (1 - u) ** 3 * a + 3 * (1 - u) ** 2 * u * b + 3 * (1 - u) * u * u * c + u ** 3 * d;
    const seg = p <= 0.5 ? [[x1, x1 + 90, x2 - 90, x2], [y, y - 50, y - 50, y], p * 2] : [[x2, x2 + 90, x3 - 90, x3], [y, y + 50, y + 50, y], (p - 0.5) * 2];
    const sxp = bz(...seg[0], seg[2]), syp = bz(...seg[1], seg[2]);
    svg += `<g class="shipico" transform="translate(${sxp.toFixed(1)},${syp.toFixed(1)})"><circle r="15" fill="var(--panel)" stroke="var(--brand)" stroke-width="2"/><text text-anchor="middle" y="6" style="font-size:16px">${o.icon || '⛴'}</text></g>`;
    return `<div class="viz journey">${head(o)}<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.title || 'journey')} ${TS.num(p * 100, 0)}%">${svg}</svg>${o.label ? `<p class="viz-sub" style="text-align:center">${esc(o.label)}</p>` : ''}</div>`;
  };

  /* hover tooltips for every [data-tip] mark */
  let tip = null;
  const show = (el, x, y) => { tip = tip || Object.assign(document.body.appendChild(document.createElement('div')), { id: 'viz-tip' }); tip.textContent = el.getAttribute('data-tip'); tip.style.display = 'block'; const r = tip.getBoundingClientRect(); tip.style.left = Math.min(x + 12, innerWidth - r.width - 8) + 'px'; tip.style.top = Math.max(8, y - r.height - 10) + 'px'; };
  const hide = () => { if (tip) tip.style.display = 'none'; };
  document.addEventListener('mousemove', (e) => { const el = e.target.closest && e.target.closest('[data-tip]'); if (el) show(el, e.clientX, e.clientY); else hide(); });
  document.addEventListener('focusin', (e) => { const el = e.target.closest && e.target.closest('[data-tip]'); if (el) { const b = el.getBoundingClientRect(); show(el, b.left + b.width / 2, b.top); } });
  document.addEventListener('focusout', hide);
  document.addEventListener('scroll', hide, true);
})();
