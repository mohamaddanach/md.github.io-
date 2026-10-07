/* Training Shipping — shared task widgets (forms with checking, choices, tables, email preview).
 * Used by every department. A widget gets a ctx: { ship, w:{form:{}}, save(), mistake(n), hint() }. */
(function () {
  const L = TS.L, t = TS.t, esc = TS.esc;
  /* ======================= generic widgets ======================= */
  const ui = (TS.ui = {});
  ui.defaultFrom = '';

  ui.table = (heads, rows, cls) => `<div class="table-wrap"><table class="${cls || ''}"><thead><tr>${heads.map((h) => `<th class="${h.num ? 'num' : ''}">${t(h.l || h)}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;

  ui.emailCard = (e) => `<div class="email-preview"><div class="meta"><b>${t(L('From', 'من'))}:</b> ${esc(e.from || ui.defaultFrom)}<br><b>${t(L('To', 'إلى'))}:</b> ${esc(e.to)}${e.cc ? '<br><b>Cc:</b> ' + esc(e.cc) : ''}<br><b>${t(L('Subject', 'الموضوع'))}:</b> ${esc(t(e.subject))}</div>${t(e.body)}</div>`;

  function fieldValue(el, f) {
    if (f.type === 'number') return el.value === '' ? '' : Number(el.value);
    return el.value;
  }

  function fieldHTML(f, v, state) {
    const id = 'f_' + f.k;
    const val = v == null ? '' : v;
    let input;
    if (f.type === 'select') {
      input = `<select id="${id}" data-k="${f.k}"><option value="">—</option>${f.options.map((o) => `<option value="${esc(o.v)}" ${String(o.v) === String(val) ? 'selected' : ''}>${esc(t(o.l || o.v))}</option>`).join('')}</select>`;
    } else if (f.type === 'textarea') {
      input = `<textarea id="${id}" data-k="${f.k}">${esc(val)}</textarea>`;
    } else {
      input = `<input id="${id}" data-k="${f.k}" type="${f.type || 'text'}" ${f.type === 'number' ? 'step="any"' : ''} value="${esc(val)}" ${f.ro ? 'readonly' : ''} placeholder="${esc(t(f.ph || ''))}">`;
    }
    const cls = state && state[f.k] ? (state[f.k].ok ? 'right' : 'wrong') : '';
    const fb = state && state[f.k] && !state[f.k].ok ? `<div class="fb">✗ ${esc(state[f.k].msg)}</div>` : '';
    return `<div class="field ${f.full ? 'full' : ''} ${cls}"><label for="${id}">${t(f.label)}${f.unit ? ' <span class="muted">(' + t(f.unit) + ')</span>' : ''}</label>${input}${f.help ? `<div class="help">${t(f.help)}</div>` : ''}${fb}</div>`;
  }

  function checkField(f, v, ship) {
    if (f.ro) return { ok: true };
    if (v === '' || v == null) return { ok: false, msg: t(L('Required.', 'حقل مطلوب.')) };
    if (f.check) {
      const r = f.check(v, ship);
      return r === true ? { ok: true } : { ok: false, msg: t(r || L('Not correct.', 'غير صحيح.')) };
    }
    const ans = f.ans ? f.ans(ship) : undefined;
    let ok;
    if (f.type === 'number') ok = Math.abs(Number(v) - Number(ans)) <= (f.tol != null ? f.tol : 0.01);
    else if (f.type === 'select' || f.type === 'date') ok = String(v) === String(ans);
    else if (f.contains) ok = f.contains.every((k) => TS.norm(v).includes(TS.norm(k))) || (!!f.containsAlt && f.containsAlt.every((k) => TS.norm(v).includes(TS.norm(k))));
    else ok = TS.norm(v) === TS.norm(ans);
    return ok ? { ok: true } : { ok: false, msg: t(f.fb || L('Not correct — check the source document or email again.', 'غير صحيح — راجع المستند أو البريد مرة أخرى.')) };
  }

  /* form: fields with check / show answer. opts: {key, fields, submit, onSuccess(values), intro} */
  ui.form = (ctx, body, opts) => {
    const store = (ctx.w.form[opts.key] = ctx.w.form[opts.key] || { v: {}, state: null });
    opts.fields.forEach((f) => { if (store.v[f.k] == null && f.value) store.v[f.k] = f.value(ctx.ship); });
    const draw = () => {
      body.innerHTML = `${opts.intro ? `<div class="note">${t(opts.intro)}</div>` : ''}
        <div class="form">${opts.fields.map((f) => fieldHTML(f, store.v[f.k], store.state)).join('')}</div>
        <div class="row" style="margin-top:14px">
          <button class="btn primary" data-act="check">${t(opts.submit || L('Check & save', 'تحقّق واحفظ'))}</button>
          <button class="btn ghost" data-act="answer">${t(L('Show me the answer', 'أرني الجواب'))}</button>
        </div>`;
      body.querySelectorAll('[data-k]').forEach((el) => el.addEventListener('input', () => {
        const f = opts.fields.find((x) => x.k === el.dataset.k);
        store.v[f.k] = fieldValue(el, f); ctx.save();
      }));
      body.querySelector('[data-act=check]').onclick = () => {
        const state = {}; let bad = 0;
        opts.fields.forEach((f) => { const r = checkField(f, store.v[f.k], ctx.ship); state[f.k] = r; if (!r.ok) bad++; });
        store.state = state;
        if (bad) { ctx.mistake(bad); ctx.save(); draw(); TS.toast(t(L(`${bad} field(s) need correction`, `${bad} حقل/حقول تحتاج تصحيح`)), 'bad'); return; }
        opts.fields.forEach((f) => { if (f.path) TS.setPath(ctx.ship, f.path, store.v[f.k]); });
        store.state = null;
        opts.onSuccess && opts.onSuccess(store.v);
      };
      body.querySelector('[data-act=answer]').onclick = () => {
        ctx.hint();
        opts.fields.forEach((f) => { if (f.ans) store.v[f.k] = f.ans(ctx.ship); });
        store.state = null; ctx.save(); draw();
      };
    };
    draw();
  };

  /* choice: single or multiple choice with feedback. opts: {key, q, options:[{l, ok, fb}], multi, onSuccess(selected), submit} */
  ui.choice = (ctx, body, opts) => {
    const store = (ctx.w.form[opts.key] = ctx.w.form[opts.key] || { sel: [], checked: false });
    const draw = () => {
      body.innerHTML = `${opts.q ? `<p><b>${t(opts.q)}</b></p>` : ''}${opts.pre ? opts.pre : ''}
        <div>${opts.options.map((o, i) => {
          const on = store.sel.includes(i);
          const cls = store.checked ? (o.ok === on ? (on ? 'right' : '') : 'wrong') : '';
          return `<label class="check ${cls}"><input type="${opts.multi ? 'checkbox' : 'radio'}" name="ch_${opts.key}" value="${i}" ${on ? 'checked' : ''}><span>${t(o.l)}${store.checked && o.fb && (on || o.ok) ? `<br><small>${t(o.fb)}</small>` : ''}</span></label>`;
        }).join('')}</div>
        <div class="row" style="margin-top:12px"><button class="btn primary" data-act="check">${t(opts.submit || L('Check', 'تحقّق'))}</button>
        <button class="btn ghost" data-act="answer">${t(L('Show me the answer', 'أرني الجواب'))}</button></div>`;
      body.querySelectorAll('input[name=ch_' + opts.key + ']').forEach((el) => el.addEventListener('change', () => {
        const i = Number(el.value);
        if (opts.multi) store.sel = el.checked ? [...new Set(store.sel.concat(i))] : store.sel.filter((x) => x !== i);
        else store.sel = [i];
        store.checked = false; ctx.save();
      }));
      body.querySelector('[data-act=check]').onclick = () => {
        store.checked = true;
        const correct = opts.options.every((o, i) => !!o.ok === store.sel.includes(i));
        if (!correct) { ctx.mistake(1); ctx.save(); draw(); TS.toast(t(L('Not quite — read the feedback', 'ليس تمامًا — اقرأ الملاحظات')), 'bad'); return; }
        ctx.save();
        opts.onSuccess && opts.onSuccess(store.sel);
      };
      body.querySelector('[data-act=answer]').onclick = () => {
        ctx.hint(); store.sel = opts.options.map((o, i) => (o.ok ? i : -1)).filter((i) => i >= 0); store.checked = true; ctx.save(); draw();
      };
    };
    draw();
  };

})();
