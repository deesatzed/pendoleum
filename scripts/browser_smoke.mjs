import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const chrome = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const pageUrl = `file://${path.join(root, 'index.html')}`;
const port = 9222 + Math.floor(Math.random() * 500);
const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pendoleum-chrome-'));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

if (!fs.existsSync(chrome)) throw new Error(`Chrome not found at ${chrome}`);

class CdpClient {
  constructor(url) {
    this.nextId = 0;
    this.pending = new Map();
    this.listeners = new Map();
    this.socket = new WebSocket(url);
    this.ready = new Promise((resolve, reject) => {
      this.socket.onopen = resolve;
      this.socket.onerror = reject;
    });
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(`${message.error.code}: ${message.error.message}`));
        else pending.resolve(message.result || {});
        return;
      }
      for (const listener of this.listeners.get(message.method) || []) listener(message.params || {});
    };
  }
  on(method, listener) {
    const listeners = this.listeners.get(method) || [];
    listeners.push(listener);
    this.listeners.set(method, listeners);
  }
  async send(method, params = {}) {
    await this.ready;
    const id = ++this.nextId;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }
  close() { try { this.socket.close(); } catch {} }
}

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.json();
}
async function waitForJson(url, timeoutMs = 10000) {
  const deadline = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    try { return await getJson(url); } catch (error) { lastError = error; await sleep(100); }
  }
  throw lastError || new Error(`Timed out waiting for ${url}`);
}

const child = spawn(chrome, [
  '--headless=new',
  `--remote-debugging-port=${port}`,
  '--remote-allow-origins=*',
  `--user-data-dir=${userDataDir}`,
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-gpu',
  '--disable-background-networking',
  '--disable-component-update',
  '--disable-default-apps',
  '--disable-sync',
  '--window-size=1400,1300',
  'about:blank'
], { stdio: ['ignore', 'ignore', 'pipe'] });
let chromeStderr = '';
child.stderr.on('data', (chunk) => { chromeStderr += chunk.toString(); });
let cdp;
const pageErrors = [];
const checks = [];
function record(name, value) {
  checks.push({ name, value });
  console.log(`BROWSER PASS ${name}: ${typeof value === 'string' ? value : JSON.stringify(value)}`);
}
function assertRecord(condition, name, value) {
  assert.ok(condition, `${name}: ${value ?? 'failed'}`);
  record(name, value);
}

try {
  const version = await waitForJson(`http://127.0.0.1:${port}/json/version`);
  const browserVersion = version.Browser || 'unknown';
  const target = await getJson(`http://127.0.0.1:${port}/json/list`);
  const pageTarget = target.find((item) => item.type === 'page');
  if (!pageTarget?.webSocketDebuggerUrl) throw new Error('Chrome page target unavailable');
  cdp = new CdpClient(pageTarget.webSocketDebuggerUrl);
  cdp.on('Runtime.exceptionThrown', (params) => pageErrors.push(params.exceptionDetails?.text || 'runtime exception'));
  cdp.on('Log.entryAdded', (params) => {
    const entry = params.entry;
    if (entry?.level === 'error' && entry.source === 'javascript') pageErrors.push(entry.text);
  });
  await cdp.send('Runtime.enable');
  await cdp.send('Log.enable');
  await cdp.send('Page.enable');
  const load = new Promise((resolve) => cdp.on('Page.loadEventFired', resolve));
  await cdp.send('Page.navigate', { url: pageUrl });
  await load;
  await sleep(300);

  const evaluate = async (expression) => {
    const result = await cdp.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
      userGesture: true
    });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || 'page evaluation failed');
    return result.result?.value;
  };
  const click = (id) => evaluate(`document.getElementById(${JSON.stringify(id)}).click()`);
  const clickText = (text) => evaluate(`Array.from(document.querySelectorAll('button')).find((button) => button.textContent.includes(${JSON.stringify(text)})).click()`);
  const setSelect = (title, value, index = 0) => evaluate(`(() => { const el = document.querySelectorAll('select[title="${title}"]')[${index}]; el.value = ${JSON.stringify(value)}; el.dispatchEvent(new Event('change', { bubbles: true })); return el.value; })()`);
  const status = () => evaluate('document.getElementById("status").textContent');

  const initial = await evaluate(`({
    title: document.title,
    rows: document.querySelectorAll('.layer-row').length,
    canvas: Boolean(document.querySelector('canvas[role="img"]')),
    status: document.getElementById('status').textContent,
    controls: ['addLayerBtn','restartBtn','pauseBtn','audioBtn','stopBtn','recBtn','jiToggle','midiBtn','midiOut','evolveBtn','breedBtn','cancelBreedBtn'].filter((id) => document.getElementById(id)).length
  })`);
  assertRecord(initial.title.includes('Modal Layer Pendulum'), 'current page loads', initial.title);
  assertRecord(initial.rows === 2, 'two default layers render', initial.rows);
  assertRecord(initial.canvas === true, 'canvas has accessible role and label', initial.canvas);
  assertRecord(initial.controls === 12, 'all primary controls render', initial.controls);

  await setSelect('Mode / scale', 'blues');
  await setSelect('Key / root', 'A');
  await setSelect('Octave', '2');
  await setSelect('Swing speed (exact rational factor)', '1/8');
  await setSelect('Note order — reverse does not remove pendulums', 'desc');
  await setSelect('How many notes/pendulums (remove notes by lowering)', '5');
  const changed = await evaluate('({mode:layers[0].mode,key:layers[0].key,octave:layers[0].octave,speed:layers[0].speed,order:layers[0].order,notes:layers[0].notes,pendulums:layers[0].pendulums.length})');
  assertRecord(changed.mode === 'blues' && changed.key === 'A' && changed.octave === 2 && changed.speed === '1/8' && changed.order === 'desc' && changed.notes === 5 && changed.pendulums === 5, 'per-layer controls update the live app', changed);

  await click('jiToggle');
  assertRecord(/\(JI\)/.test(await status()), 'JI toggle updates live status', await status());
  await evaluate('document.getElementById("volSlider").value = "25"; document.getElementById("volSlider").dispatchEvent(new Event("input", {bubbles:true}))');
  record('volume control dispatches', await evaluate('document.getElementById("volSlider").value'));

  for (let i = 0; i < 3; i += 1) await click('addLayerBtn');
  assertRecord(await evaluate('layers.length') === 5, 'layer add reaches five-layer cap', await evaluate('layers.length'));
  await click('addLayerBtn');
  assertRecord(await evaluate('layers.length') === 5, 'sixth layer is refused', await evaluate('layers.length'));

  await click('evolveBtn');
  assertRecord(/saved|loaded/.test(await status()), 'Evolve Once completes at the layer cap', await status());
  await evaluate('document.querySelector(".layer-row button").click()');
  await click('evolveBtn');
  assertRecord(await evaluate('layers.length') === 5, 'Evolve Once loads a mode when a slot is free', await evaluate('layers.length'));

  await evaluate('document.getElementById("gens").value = "200"');
  await click('breedBtn');
  await sleep(20);
  await click('cancelBreedBtn');
  await sleep(150);
  const cancelled = await evaluate('({running:breedRunning,status:document.getElementById("status").textContent,breedDisplay:document.getElementById("breedBtn").style.display,cancelDisplay:document.getElementById("cancelBreedBtn").style.display})');
  assertRecord(cancelled.running === false && /Breeding cancelled/.test(cancelled.status) && cancelled.cancelDisplay === 'none', 'breeding cancellation restores idle UI', cancelled);

  await click('audioBtn');
  await sleep(300);
  const audioState = await evaluate('({available:Boolean(window.AudioContext || window.webkitAudioContext),on:isAudioOn,status:document.getElementById("status").textContent})');
  assertRecord(audioState.available ? audioState.on === true : /Web Audio not available/.test(audioState.status), 'Start Sound follows real Web Audio capability', audioState);
  if (audioState.on) {
    await click('audioBtn');
    await sleep(100);
    const muted = await evaluate('({on:isAudioOn,status:document.getElementById("status").textContent})');
    assertRecord(muted.on === false && /Muted/.test(muted.status), 'Mute silences while motion continues', muted);
  }

  await click('recBtn');
  await sleep(700);
  const recordingState = await evaluate('({supported:typeof MediaRecorder !== "undefined",recording:isRecording,status:document.getElementById("status").textContent})');
  if (recordingState.supported && recordingState.recording) {
    await click('recBtn');
    await sleep(1000);
    const saved = await evaluate('({bytes:recordChunks.reduce((n,chunk) => n + (chunk.size || 0), 0),recording:isRecording,status:document.getElementById("status").textContent,download:document.getElementById("downloadLink").download})');
    assertRecord(saved.bytes > 0 && saved.recording === false && /Saved recording/.test(saved.status), 'recording produces non-empty WebM data', saved);
  } else {
    assertRecord(/unsupported|unavailable/i.test(recordingState.status), 'recording reports truthful capability', recordingState);
  }

  await click('stopBtn');
  const stopped = await evaluate('({paused:isPaused,on:isAudioOn,pauseLabel:document.getElementById("pauseBtn").textContent,status:document.getElementById("status").textContent})');
  assertRecord(stopped.paused === true && stopped.on === false && stopped.pauseLabel === 'Resume' && /Stopped/.test(stopped.status), 'hard Stop freezes and silences', stopped);
  await click('pauseBtn');
  assertRecord((await evaluate('isPaused')) === false, 'Resume releases the motion freeze', await status());
  await click('stopBtn');

  await click('midiBtn');
  await sleep(150);
  const midiStatus = await status();
  assertRecord(/MIDI (not available|ready|access OK but no output)/.test(midiStatus), 'MIDI capability path reports truthful status', midiStatus);

  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 640, height: 900, deviceScaleFactor: 1, mobile: false });
  await sleep(100);
  const narrow = await evaluate('({width:window.innerWidth,scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth})');
  assertRecord(narrow.scrollWidth <= narrow.clientWidth + 2, 'narrow Chromium viewport has no horizontal overflow', narrow);
  await cdp.send('Emulation.clearDeviceMetricsOverride');

  if (process.env.UPDATE_SCREENSHOT === '1') {
    const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(root, 'docs/assets/app-screenshot.png'), Buffer.from(shot.data, 'base64'));
    record('current screenshot refreshed', path.join('docs', 'assets', 'app-screenshot.png'));
  }

  assertRecord(pageErrors.length === 0, 'current creative loop has no JavaScript console errors', pageErrors);
  console.log(JSON.stringify({ browser: browserVersion, page: pageUrl, checks, pageErrors, operatorChecks: ['NOT OPERATOR-VERIFIED: subjective audible speaker confirmation', 'NOT OPERATOR-VERIFIED: external MIDI hardware output'] }, null, 2));
} finally {
  cdp?.close();
  if (child.exitCode === null) {
    try { child.kill('SIGTERM'); } catch {}
    await Promise.race([
      new Promise((resolve) => child.once('exit', resolve)),
      sleep(1500)
    ]);
  }
  try {
    fs.rmSync(userDataDir, { recursive: true, force: true });
  } catch (error) {
    if (error.code !== 'ENOTEMPTY') throw error;
    await sleep(300);
    fs.rmSync(userDataDir, { recursive: true, force: true });
  }
}
