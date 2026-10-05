/* Training Shipping — shared core
 * Used by every department (operations, customs, accounting).
 * - Language (English / Arabic, RTL aware)
 * - Shipment store (browser localStorage) shared by all departments
 * - JSON export / import so a shipment file can be passed between departments
 */
(function () {
  const TS = (window.TS = window.TS || {});

  const LS_SHIPS = 'ts_shipments_v1';
  const LS_LANG = 'ts_lang';
  const LS_CUR = 'ts_current_shipment';

  TS.SCHEMA = 'training_shipping.shipment';
  TS.SCHEMA_VERSION = 1;

  function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage blocked */ } }

  /* ---------------- language ---------------- */
  TS.lang = safeGet(LS_LANG) === 'ar' ? 'ar' : 'en';
  TS.L = (en, ar) => ({ en, ar });
  TS.t = (o) => {
    if (o == null) return '';
    if (typeof o === 'object') return o[TS.lang] != null ? o[TS.lang] : (o.en != null ? o.en : '');
    return String(o);
  };
  TS.applyLang = () => {
    document.documentElement.lang = TS.lang;
    document.documentElement.dir = TS.lang === 'ar' ? 'rtl' : 'ltr';
  };
  TS.setLang = (l) => {
    TS.lang = l === 'ar' ? 'ar' : 'en';
    safeSet(LS_LANG, TS.lang);
    TS.applyLang();
    document.dispatchEvent(new CustomEvent('ts:lang'));
  };
  TS.langSwitch = () => `
    <div class="lang-switch" role="group" aria-label="Language">
      <button type="button" data-lang="en" class="${TS.lang === 'en' ? 'on' : ''}">English</button>
      <button type="button" data-lang="ar" class="${TS.lang === 'ar' ? 'on' : ''}">العربية</button>
    </div>`;
  document.addEventListener('click', (e) => {
    const b = e.target.closest('.lang-switch [data-lang]');
    if (b) TS.setLang(b.dataset.lang);
  });

  /* ---------------- helpers ---------------- */
  TS.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  TS.uid = (p) => (p || 'id') + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  TS.clone = (o) => JSON.parse(JSON.stringify(o));
  TS.getPath = (o, path) => path.split('.').reduce((a, k) => (a == null ? undefined : a[k]), o);
  TS.setPath = (o, path, v) => {
    const ks = path.split('.');
    let cur = o;
    ks.slice(0, -1).forEach((k) => { if (cur[k] == null || typeof cur[k] !== 'object') cur[k] = {}; cur = cur[k]; });
    cur[ks[ks.length - 1]] = v;
  };
  TS.norm = (s) => String(s == null ? '' : s).toLowerCase().replace(/[^a-z0-9؀-ۿ]+/g, ' ').trim();
  TS.round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

  /* dates are ISO yyyy-mm-dd strings, treated as UTC calendar days */
  TS.todayISO = () => new Date().toISOString().slice(0, 10);
  TS.addDays = (iso, n) => { const d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  TS.diffDays = (a, b) => Math.round((new Date(b + 'T00:00:00Z') - new Date(a + 'T00:00:00Z')) / 86400000);
  TS.fmtDate = (iso, withDay) => {
    if (!iso) return '—';
    const d = new Date(iso + 'T00:00:00Z');
    const opt = { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' };
    if (withDay !== false) opt.weekday = 'short';
    return d.toLocaleDateString(TS.lang === 'ar' ? 'ar-LB-u-nu-latn' : 'en-GB', opt);
  };
  TS.money = (n, cur) => (cur || 'USD') + ' ' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  TS.num = (n, d) => Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: d == null ? 2 : d });

  /* ---------------- shipment store ---------------- */
  TS.store = {
    all() { try { return JSON.parse(safeGet(LS_SHIPS) || '{}') || {}; } catch (e) { return {}; } },
    list() { return Object.values(this.all()).sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt))); },
    get(id) { return this.all()[id] || null; },
    save(s) {
      s.updatedAt = new Date().toISOString();
      const a = this.all(); a[s.id] = s; safeSet(LS_SHIPS, JSON.stringify(a));
      return s;
    },
    remove(id) { const a = this.all(); delete a[id]; safeSet(LS_SHIPS, JSON.stringify(a)); if (this.currentId() === id) this.setCurrent(''); },
    currentId() { return safeGet(LS_CUR) || ''; },
    setCurrent(id) { safeSet(LS_CUR, id || ''); },
    /* shipments that were handed off to a department: dept = 'customs' | 'accounting' */
    handedTo(dept) { return this.list().filter((s) => s.handoffs && Object.values(s.handoffs).some((h) => h && h.department === dept)); },
  };

  TS.downloadJSON = (ship) => {
    const blob = new Blob([JSON.stringify(ship, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = ship.id + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };

  TS.readJSONFile = (file) => new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      try {
        const o = JSON.parse(r.result);
        if (!o || o.schema !== TS.SCHEMA || !o.id) throw new Error('Not a Training Shipping shipment file');
        resolve(o);
      } catch (e) { reject(e); }
    };
    r.onerror = () => reject(r.error);
    r.readAsText(file);
  });

  /* ---------------- UI bits ---------------- */
  TS.toast = (msg, type) => {
    let box = document.getElementById('ts-toasts');
    if (!box) { box = document.createElement('div'); box.id = 'ts-toasts'; document.body.appendChild(box); }
    const el = document.createElement('div');
    el.className = 'toast ' + (type || '');
    el.textContent = msg;
    box.appendChild(el);
    while (box.children.length > 4) box.firstChild.remove();
    setTimeout(() => el.classList.add('out'), 3800);
    setTimeout(() => el.remove(), 4400);
  };


  /* single-file (offline .htm) mode: links between departments switch the frame in the parent shell */
  if (window.TS_BUNDLED) {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href]');
      if (!a) return;
      const h = a.getAttribute('href');
      const key = /operations_pricing_freight_forwarder/.test(h) ? 'ops' : /customs_department/.test(h) ? 'cus' : /accounting_department/.test(h) ? 'acc' : /(^|\/)index\.html$/.test(h) ? 'home' : null;
      if (key) { e.preventDefault(); try { window.parent.postMessage({ tsNav: key }, '*'); } catch (err) { /* ignore */ } }
    }, true);
  }
  TS.applyLang();
})();
