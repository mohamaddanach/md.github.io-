#!/usr/bin/env python3
"""Build training_shipping.htm: the whole training system (hub + Operations + Customs + Accounting)
in ONE self-contained HTML file that works offline by double-click.
Each department page is inlined (CSS + JS) and shown in a frame; all pages share the same browser storage."""
import json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES = {'home': 'index.html', 'ops': 'operations_pricing_freight_forwarder/index.html',
         'cus': 'customs_department/index.html', 'acc': 'accounting_department/index.html'}

def inline(rel):
    path = os.path.join(ROOT, rel)
    base = os.path.dirname(path)
    html = open(path, encoding='utf-8').read()
    def css(m):
        return '<style>\n' + open(os.path.normpath(os.path.join(base, m.group(1))), encoding='utf-8').read() + '\n</style>'
    def js(m):
        code = open(os.path.normpath(os.path.join(base, m.group(1))), encoding='utf-8').read()
        return '<script>\n' + code.replace('</script', '<\\/script') + '\n</script>'
    html = re.sub(r'<link rel="stylesheet" href="((?!https?:)[^"]+)">', css, html)
    html = re.sub(r'<script src="([^"]+)"></script>', js, html)
    html = html.replace('<body>', '<body>\n<script>window.TS_BUNDLED = true;</script>', 1)
    return html

pages = {k: inline(v) for k, v in PAGES.items()}
data = json.dumps(pages, ensure_ascii=False).replace('</', '<\\/')
shell = '''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Training Shipping — offline</title>
<style>
  html, body { margin: 0; height: 100%; background: #0b4f71; font-family: "Segoe UI", Tahoma, Arial, sans-serif; }
  #bar { height: 40px; display: flex; align-items: center; gap: 6px; padding: 0 10px; color: #fff; overflow-x: auto; white-space: nowrap; }
  #bar b { margin-inline-end: 10px; }
  #bar button { background: rgba(255,255,255,.14); color: #fff; border: 1px solid rgba(255,255,255,.3); border-radius: 7px; padding: 5px 10px; cursor: pointer; font: inherit; font-size: 13px; }
  #bar button.on { background: #fff; color: #0b4f71; font-weight: 700; }
  #bar small { margin-inline-start: auto; opacity: .75; }
  iframe { display: block; width: 100%; height: calc(100% - 40px); border: 0; background: #f4f6f9; }
</style>
</head>
<body>
<div id="bar"><b>⚓ Training Shipping</b>
  <button data-p="home">Home · الرئيسية</button>
  <button data-p="ops">⛴ Operations · العمليات</button>
  <button data-p="cus">🛃 Customs · الجمارك</button>
  <button data-p="acc">📒 Accounting · المحاسبة</button>
  <small>Offline single-file edition · works without internet</small></div>
<iframe id="f" title="Training Shipping"></iframe>
<script>
const PAGES = ''' + data + ''';
const f = document.getElementById('f');
function show(k) {
  if (!PAGES[k]) k = 'home';
  f.srcdoc = PAGES[k];
  document.querySelectorAll('#bar button').forEach((b) => b.classList.toggle('on', b.dataset.p === k));
  try { sessionStorage.setItem('ts_shell_page', k); } catch (e) {}
}
document.querySelectorAll('#bar button').forEach((b) => b.onclick = () => show(b.dataset.p));
window.addEventListener('message', (e) => { if (e.data && e.data.tsNav) show(e.data.tsNav); });
let start = 'home'; try { start = sessionStorage.getItem('ts_shell_page') || 'home'; } catch (e) {}
show(start);
</script>
</body>
</html>
'''
out = os.path.join(ROOT, 'training_shipping.htm')
open(out, 'w', encoding='utf-8').write(shell)
print('wrote', out, round(os.path.getsize(out) / 1024), 'KB')
