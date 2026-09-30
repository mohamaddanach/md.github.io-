/* Receiving department page (Customs / Accounting): lists hand-offs from the shipment JSON files */
(function () {
  const L = TS.L, t = TS.t, esc = TS.esc;
  const D = (TS.dept = {});
  let sel = null;

  D.mount = (cfg) => {
    const render = () => {
      TS.applyLang();
      const ships = TS.store.handedTo(cfg.key);
      const cur = ships.find((s) => s.id === sel) || ships[0];
      document.getElementById('app').innerHTML = `
        <header class="topbar"><a class="brand" href="../index.html">⚓ Training Shipping <small>/ ${t(cfg.title)}</small></a><span class="spacer"></span><a class="btn sm" href="../operations_pricing_freight_forwarder/index.html">⛴ ${t(L('Operations', 'العمليات'))}</a>${TS.langSwitch()}</header>
        <main class="main" style="max-width:1150px;margin:0 auto">
          <h1>${cfg.icon} ${t(cfg.title)}</h1>
          <div class="note"><strong>${t(L('Receiving desk', 'مكتب الاستلام'))}</strong>${t(cfg.intro)}</div>
          <div class="card"><div class="row"><b>${t(L('Import a shipment JSON file', 'استيراد ملف شحنة JSON'))}</b><input type="file" id="imp" accept=".json,application/json"></div></div>
          ${ships.length ? `<div class="row" style="margin-bottom:12px">${ships.map((s) => `<button class="btn sm ${cur && s.id === cur.id ? 'primary' : ''}" data-s="${esc(s.id)}">${esc(s.id)}</button>`).join('')}</div>` : `<p class="muted">${t(L('No shipment has been handed to this department yet. Work a shipment in Operations until the hand-off step.', 'لم تُسلَّم أي شحنة لهذا القسم بعد. نفّذ شحنة في العمليات حتى مرحلة التسليم.'))}</p>`}
          <div id="body"></div>
          <div class="note warn">${t(TS.REF.disclaimer)}</div>
        </main>`;
      document.querySelectorAll('[data-s]').forEach((b) => (b.onclick = () => { sel = b.dataset.s; render(); }));
      document.getElementById('imp').onchange = async (e) => {
        const f = e.target.files[0]; if (!f) return;
        try { const s = await TS.readJSONFile(f); TS.store.save(s); sel = s.id; TS.toast(t(L('Shipment file received', 'تم استلام ملف الشحنة')), 'ok'); render(); }
        catch (err) { TS.toast(err.message, 'bad'); }
      };
      if (cur) cfg.body(document.getElementById('body'), cur, () => { TS.store.save(cur); render(); });
    };
    document.addEventListener('ts:lang', render);
    render();
  };

  D.kv = (rows) => `<div class="table-wrap"><table><tbody>${rows.map(([k, v]) => `<tr><th style="width:230px">${t(k)}</th><td>${v}</td></tr>`).join('')}</tbody></table></div>`;
})();
