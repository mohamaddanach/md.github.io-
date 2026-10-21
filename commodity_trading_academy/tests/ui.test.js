/* Browser UI test (Playwright + Chromium):  node commodity_trading_academy/tests/ui.test.js
 * Requires the `playwright` package (npm i -D playwright, or a global install). Opens the app from file://,
 * visits every route, lesson and document, then drives end-to-end flows and fails on any page error. */
'use strict';
const path = require('path');
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) {
  try { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); } catch (e2) { console.error('Playwright is not installed. Run: npm i -D playwright && npx playwright install chromium'); process.exit(2); }
}
const BASE = 'file://' + path.join(__dirname, '..', 'index.html');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1360, height: 900 } });
  const errors = []; let checks = 0;
  const ok = (name, cond, info) => { checks++; if (!cond) errors.push('FAIL ' + name + (info ? ' — ' + info : '')); };
  page.on('pageerror', (e) => errors.push('PAGE ERROR ' + page.url() + ': ' + e.message));
  page.on('dialog', (d) => d.accept());
  const go = async (r) => { await page.goto(BASE + '#/command'); await page.goto(BASE + '#/' + r); await page.waitForTimeout(120); };
  await page.goto(BASE); await page.evaluate(() => localStorage.clear()); await page.reload(); await page.waitForTimeout(300);

  // 1. every route renders
  const routes = ['command', 'path', 'encyclopedia', 'gold', 'gold/cases', 'gold/tools', 'gold/instruments', 'wheat', 'wheat/tools', 'sugar/tools', 'steel/tools', 'global', 'global/drivers', 'global/structural', 'global/research', 'physical', 'physical/calculator', 'physical/history', 'physical/company', 'futures', 'futures/learn', 'analysis', 'analysis/fundamental', 'analysis/spreads', 'dealroom', 'finance', 'finance/incoterms', 'finance/lc', 'finance/library', 'finance/checklist', 'logistics', 'logistics/laytime', 'logistics/handling', 'logistics/disruptions', 'risk', 'risk/register', 'risk/stress', 'risk/sizing', 'quant', 'quant/corr', 'quant/var', 'quant/portfolio', 'journal', 'journal/new', 'performance', 'exams', 'exams/practice', 'exams/certificate', 'glossary', 'settings'];
  for (const r of routes) { await go(r); const t = await page.$eval('#main', (e) => e.innerText); ok('route ' + r, t.length > 200 && !t.includes('Something went wrong')); }
  // 2. every lesson (with embedded tools) and document
  await page.evaluate(() => { CTA.state.settings.freeNav = true; CTA.save(true); });
  for (const id of await page.evaluate(() => CTA.LESSONS.map((l) => l.id))) { await go('path/lesson/' + id); ok('lesson widgets ' + id, await page.evaluate(() => [...document.querySelectorAll('[data-widget]')].every((e) => e.innerHTML.trim() && !e.innerHTML.includes('failed to load')))); }
  for (const id of await page.evaluate(() => CTA.DOCS.map((d) => d.id))) { await go('finance/library/' + id); ok('document ' + id, (await page.$$('.hot')).length > 0); }
  for (const id of await page.evaluate(() => CTA.CASES.map((c) => c.commodity + '/cases/' + c.id))) { await go(id); ok('case ' + id, !!(await page.$('.case-steps'))); }
  // 3. mastery: pass a lesson quiz
  await page.evaluate(() => { CTA.state.settings.freeNav = false; CTA.save(true); });
  await go('path/lesson/f-commodity');
  await page.evaluate(() => document.querySelectorAll('#mastery .q').forEach((q) => { q.querySelector(`input[value="${CTA.Q_INDEX[q.dataset.q].a}"]`).checked = true; }));
  await page.click('#mastery .submit'); ok('lesson mastered', await page.evaluate(() => CTA.progress.lessonDone('f-commodity')));
  await go('path/lesson/m-flows'); ok('stage 2 locked until stage 1 mastered', (await page.$eval('#main', (e) => e.innerText)).includes('Locked'));
  // 4. a full physical deal in each commodity; ledger must equal P&L
  for (const com of ['wheat', 'gold', 'sugar', 'steel']) {
    await go('physical/workflow'); await page.click(`[data-c="${com}"]`); await page.waitForTimeout(80);
    for (let i = 0; i < 25; i++) {
      await page.evaluate(() => { const run = CTA.state.physical.active, b = document.querySelector('.stage-body'), g = {}; b.querySelectorAll('input[type=radio]').forEach((r) => { g[r.name] = g[r.name] || r; }); Object.values(g).forEach((r) => { r.checked = true; }); b.querySelectorAll('input[type=checkbox]').forEach((c, k) => { c.checked = k % 2 === 0; }); b.querySelectorAll('select').forEach((s) => { s.selectedIndex = s.options[0].value === '' ? 1 : 0; }); const m = CTA.simModel(run, run.stage === 6 ? { route: 'R1', insp: 'I1' } : run.stage === 8 ? { route: 'R1', insp: 'I1', noMarket: true } : run.stage === 9 ? { route: 'R1', insp: 'I1' } : {}); const a = { 6: m.landedPerUnit, 8: m.qty * (m.B0 + m.prem) - (m.value + m.costs), 9: m.value + m.costs, 24: m.net }; b.querySelectorAll('input[type=text]').forEach((t) => { t.value = String(a[run.stage]); }); });
      await page.click('[data-a=submit]'); const nx = await page.$('[data-a=next]'); if (!nx) { ok('deal step ' + i, false, com); break; } await nx.click(); await page.waitForTimeout(30);
    }
    const d = await page.evaluate(() => { const r = CTA.state.physical.completed.slice(-1)[0]; return { pnl: r.pnl, sum: r.ledger.reduce((s, x) => s + x[1], 0), com: r.commodity }; });
    ok('physical deal ' + com + ' ledger = P&L', d.com === com && Math.abs(d.sum - d.pnl) < 0.01);
  }
  // 5. futures: order with stop but no target, run to the end, cash reconciles
  await go('futures/trade'); await page.click('[data-s="gold-up"]'); await page.waitForTimeout(80);
  await page.fill('#o-qty', '2'); await page.fill('#o-stop', '1900'); await page.click('[data-a=buy]'); await page.waitForTimeout(50);
  ok('futures order without take-profit fills', await page.evaluate(() => CTA.state.futures.positions.length === 1));
  for (let i = 0; i < 15; i++) { const b = await page.$('[data-a=step5]'); if (!b) break; await b.click(); await page.waitForTimeout(30); const dep = await page.$('[data-a=deposit]'); if (dep) await dep.click(); }
  const F = await page.evaluate(() => { const F = CTA.state.futures; return { s: F.status, c: F.cash, st: F.startCash, d: F.deposits, r: F.history.reduce((a, h) => a + h.pnl, 0) }; });
  ok('futures scenario finished and cash reconciles', F.s === 'finished' && Math.abs(F.c - F.st - F.d - F.r) < 0.01, JSON.stringify(F));
  // 6. deal calculator matches the hand-verified example
  await go('physical/calculator'); ok('deal calculator example net profit', (await page.$eval('#dc-out .kpi .kv', (e) => e.textContent)).includes('113,339'));
  await page.selectOption('#dc-buyTerm', 'CIF'); await page.waitForTimeout(60); ok('CIF purchase locks the freight line', await page.$eval('#dc-freight', (e) => e.disabled));
  // 7. negotiation reaches an outcome
  await go('dealroom/gulf'); for (let i = 0; i < 8; i++) { const s = await page.$('[data-a=send]'); if (!s) break; await s.click(); await page.waitForTimeout(40); }
  ok('negotiation recorded', await page.evaluate(() => CTA.state.negotiations.length === 1));
  // 8. exam + LC + in-browser calculation tests + persistence
  await go('exams/gold'); await page.click('#exSub'); await page.waitForTimeout(80); ok('exam recorded', await page.evaluate(() => CTA.state.exams.gold && CTA.state.exams.gold.attempts === 1));
  await go('settings'); await page.click('#s-test'); await page.waitForTimeout(80); ok('in-browser calc tests pass', /^(\d+)\/\1 passed$/.test(await page.$eval('#s-tres .note strong', (e) => e.textContent)));
  await page.reload(); await page.waitForTimeout(250); ok('progress persists after reload', await page.evaluate(() => CTA.state.physical.completed.length === 4 && CTA.progress.lessonDone('f-commodity')));
  // 9. phone width: no horizontal page scroll
  const m = await browser.newPage({ viewport: { width: 390, height: 844 } }); await m.goto(BASE + '#/command'); await m.waitForTimeout(300);
  ok('no horizontal overflow at 390px', await m.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  await browser.close();
  errors.forEach((e) => console.log(e));
  console.log(`\n${checks - errors.filter((e) => e.startsWith('FAIL')).length}/${checks} UI checks passed${errors.some((e) => e.startsWith('PAGE')) ? ' — page errors occurred' : ''}`);
  if (errors.length) process.exitCode = 1;
})();
