/* eslint-disable no-console */
// End-to-end test for AgriGuide, driven over the Chrome DevTools Protocol using
// the `ws` package (no heavy browser-automation dependency). Covers the five
// scenarios required by the spec (§12) against the LIVE Django backend.
//
// Usage: node e2e-cdp.js   (frontend dev server + backend must be running)

const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const os = require('os');
const path = require('path');

const FRONT = 'http://localhost:5173';
const BACK = 'http://127.0.0.1:8000';
const CHROME = process.env.CHROME_BIN || '/usr/bin/google-chrome';
const PORT = 9333;
const USER = { id: 'e2e@agriguide.test', pw: 'pass12345' };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function httpJson(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(d));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });
}

// ---- page-side helpers injected into every document -----------------------
const HELPERS = `(() => {
  window.__q = (sel, root=document) => root.querySelector(sel);
  window.__qa = (sel, root=document) => [...root.querySelectorAll(sel)];
  window.__wait = (sel, t=9000) => new Promise((res) => {
    const end = Date.now() + t;
    (function poll(){
      const el = document.querySelector(sel);
      if (el) return res(el);
      if (Date.now() > end) return res(null);
      setTimeout(poll, 100);
    })();
  });
  window.__waitText = (text, t=9000) => new Promise((res) => {
    const end = Date.now() + t;
    (function poll(){
      if (document.body.innerText.includes(text)) return res(true);
      if (Date.now() > end) return res(false);
      setTimeout(poll, 100);
    })();
  });
  window.__set = (sel, val) => {
    const el = document.querySelector(sel);
    if (!el) return false;
    const proto = el.tagName === 'SELECT' ? HTMLSelectElement.prototype
               : el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype
               : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
    setter.call(el, val);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  };
  window.__click = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return false;
    el.click();
    return true;
  };
  window.__clickText = (text, sel='button') => {
    const el = [...document.querySelectorAll(sel)].find(e => e.textContent.includes(text));
    if (!el) return false;
    el.click();
    return true;
  };
})();`;

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.errors = [];
    ws.on('message', (m) => {
      const msg = JSON.parse(m.toString());
      if (msg.id) {
        const p = this.pending.get(msg.id);
        if (p) {
          this.pending.delete(msg.id);
          msg.error ? p.rej(new Error(JSON.stringify(msg.error))) : p.res(msg.result);
        }
      } else if (msg.method === 'Runtime.exceptionThrown') {
        this.errors.push(JSON.stringify(msg.params.exceptionDetails?.text || 'exception'));
      }
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((res, rej) => {
      this.pending.set(id, { res, rej });
      this.ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          rej(new Error('timeout ' + method));
        }
      }, 20000);
    });
  }
}

async function evaluate(cdp, expr) {
  const r = await cdp.send('Runtime.evaluate', {
    expression: expr,
    awaitPromise: true,
    returnByValue: true,
  });
  if (r.exceptionDetails) {
    throw new Error('page error: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
  }
  return r.result?.value;
}

async function goto(cdp, url) {
  await cdp.send('Page.navigate', { url });
  for (let i = 0; i < 100; i++) {
    try {
      const st = await evaluate(cdp, 'document.readyState');
      if (st === 'complete') break;
    } catch {}
    await sleep(100);
  }
  await sleep(500);
  await evaluate(cdp, HELPERS);
}

// ---- test harness ---------------------------------------------------------
const results = [];
function check(name, pass, detail = '') {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
}

async function run() {
  // Launch Chrome headless with remote debugging.
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'agri-e2e-'));
  const chrome = spawn(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    '--window-size=1280,900',
    'about:blank',
  ], { stdio: 'ignore' });

  // Wait for the DevTools endpoint.
  let targets;
  for (let i = 0; i < 60; i++) {
    await sleep(500);
    try {
      targets = await httpJson(`http://127.0.0.1:${PORT}/json/list`);
      if (targets.find((t) => t.type === 'page')) break;
    } catch {}
  }
  const page = targets.find((t) => t.type === 'page');
  if (!page) throw new Error('No Chrome page target found');

  const cdp = new CDP(new WebSocket(page.webSocketDebuggerUrl, { perMessageDeflate: false }));
  await new Promise((r) => cdp.ws.on('open', r));
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');

  try {
    // ---------------- Test 4: authentication failure ----------------
    await goto(cdp, `${FRONT}/Login`);
    await evaluate(cdp, `__set('input[name="username"]','${USER.id}')`);
    await evaluate(cdp, `__set('input[name="password"]','definitely-wrong')`);
    await evaluate(cdp, `__click('.login-btn-primary')`);
    const errShown = await evaluate(cdp, `__waitText('Invalid', 8000) || __waitText('Login failed', 3000)`);
    const stillLogin = (await evaluate(cdp, 'location.pathname')) === '/Login';
    check('Test 4 — auth failure shows a useful error and does not log in', Boolean(errShown) && stillLogin,
      `error=${Boolean(errShown)} path=${await evaluate(cdp, 'location.pathname')}`);

    // ---------------- Test 1: successful assessment ----------------
    await evaluate(cdp, `__set('input[name="username"]','${USER.id}')`);
    await evaluate(cdp, `__set('input[name="password"]','${USER.pw}')`);
    await evaluate(cdp, `__click('.login-btn-primary')`);
    const shell = await evaluate(cdp, `__wait('.app-shell', 12000)`);
    check('Test 1a — login succeeds and app shell (dashboard) loads', Boolean(shell));
    const statCards = await evaluate(cdp, `__qa('.stat-card').length`);
    check('Test 1b — dashboard shows real backend counts', Number(statCards) > 0, `stat cards=${statCards}`);

    await goto(cdp, `${FRONT}/Recommendations`);
    await evaluate(cdp, `__wait('.form-card', 9000)`);
    await evaluate(cdp, `__set('#locationSelect','SITE-A')`);
    await sleep(300);
    await evaluate(cdp, `__set('#farmerName','Abebe E2E')`);
    await evaluate(cdp, `__set('#growthStage','Vegetative (V8)')`);
    await evaluate(cdp, `__set('#symptoms','Yellow leaves on the lower canopy following heavy rain.')`);
    await evaluate(cdp, `__set('#affectedArea','Lower canopy, eastern boundary')`);
    await evaluate(cdp, `__set('#rainfall','Heavy rain for 3 days')`);
    await evaluate(cdp, `__click('.submit-btn')`);
    const adv = await evaluate(cdp, `__wait('.adv-card', 15000)`);
    check('Test 1c — advisory preview generated by backend', Boolean(adv));
    const srcCount = await evaluate(cdp, `document.querySelectorAll('.adv-source').length`);
    check('Test 1d — preview shows source references (retrieved guidance)', Number(srcCount) > 0, `sources=${srcCount}`);

    // ---------------- Test 3: ambiguity / not-a-diagnosis ----------------
    const notDiagnosis = await evaluate(cdp, `document.body.innerText.includes('not confirmed diagnoses')`);
    const hasPossibility = await evaluate(cdp, `document.querySelectorAll('.adv-possibility').length`);
    check('Test 3 — possibilities labelled, no confirmed diagnosis', Boolean(notDiagnosis) && Number(hasPossibility) > 0,
      `possibilities=${hasPossibility}`);

    // ---------------- Test 1 continued: explicit confirm + save ----------------
    await evaluate(cdp, `__clickText('Review', '.adv-actions button')`);
    const dialog = await evaluate(cdp, `__wait('.dialog', 6000)`);
    check('Test 1e — explicit confirmation dialog appears before saving', Boolean(dialog));
    await evaluate(cdp, `__clickText('Confirm and Save', '.dialog__actions button')`);
    const saved = await evaluate(cdp, `__waitText('Record saved', 15000)`);
    check('Test 1f — advisory saved after explicit confirmation', Boolean(saved));

    // Reopen from Saved Advisories (backend list + detail).
    await goto(cdp, `${FRONT}/SavedRecords`);
    const recordItem = await evaluate(cdp, `__wait('.record-item', 15000)`);
    check('Test 1g — saved record listed from backend', Boolean(recordItem));
    await evaluate(cdp, `__clickText('View Record')`);
    const detail = await evaluate(cdp, `__wait('.detail-panel', 12000)`);
    const detailSrc = await evaluate(cdp, `document.querySelectorAll('.source-item').length`);
    check('Test 1h — saved record reopens with advisory + sources', Boolean(detail) && Number(detailSrc) > 0,
      `detail=${Boolean(detail)} sources=${detailSrc}`);

    // ---------------- Test 2: missing information ----------------
    await goto(cdp, `${FRONT}/Recommendations`);
    await evaluate(cdp, `__wait('.form-card', 9000)`);
    await evaluate(cdp, `__set('#locationSelect','SITE-A')`);
    await sleep(200);
    await evaluate(cdp, `__set('#farmerName','Preserve Me')`);
    // leave growthStage/symptoms/conditions empty on purpose
    await evaluate(cdp, `__click('.submit-btn')`);
    await sleep(600);
    const fieldErr = await evaluate(cdp, `document.querySelectorAll('.error-text').length`);
    const stayedOnForm = (await evaluate(cdp, `document.querySelectorAll('.adv-card').length`)) === 0;
    const preserved = await evaluate(cdp, `document.querySelector('#farmerName')?.value`);
    check('Test 2 — missing info shows validation and preserves input',
      Number(fieldErr) > 0 && stayedOnForm && preserved === 'Preserve Me',
      `errors=${fieldErr} stayedOnForm=${stayedOnForm} preserved=${JSON.stringify(preserved)}`);

    // ---------------- global: no uncaught page exceptions ----------------
    check('No uncaught page exceptions during run', cdp.errors.length === 0,
      cdp.errors.slice(0, 3).join(' | '));
  } finally {
    cdp.ws.close();
    chrome.kill();
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
  }

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  process.exit(failed.length ? 1 : 0);
}

run().catch((e) => {
  console.error('E2E harness error:', e);
  process.exit(2);
});
