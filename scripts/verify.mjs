import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const htmlPath = path.join(root, 'index.html');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const html = fs.readFileSync(htmlPath, 'utf8');
const readme = read('README.md');

let passed = 0;
function pass(label) {
  passed += 1;
  console.log(`PASS ${label}`);
}
function check(condition, message) {
  assert.ok(condition, message);
  pass(message);
}

const scriptMatches = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)];
assert.equal(scriptMatches.length, 1, 'exactly one inline runtime script');
const source = scriptMatches[0][1];
new Function(source);
pass('inline runtime script parses');

const requiredMarkup = [
  '<meta name="viewport"',
  'id="layersPanel"',
  'id="addLayerBtn"',
  'id="restartBtn"',
  'id="pauseBtn"',
  'id="audioBtn"',
  'id="stopBtn"',
  'id="recBtn"',
  'id="jiToggle"',
  'id="midiBtn"',
  'id="midiOut"',
  'id="evolveBtn"',
  'id="breedBtn"',
  'id="cancelBreedBtn"',
  'role="img"',
  'aria-live="polite"',
  '@media (max-width:640px)'
];
for (const marker of requiredMarkup) check(html.includes(marker), `required markup: ${marker}`);

check(!/fitness on harmonic purity \+ novelty/i.test(readme), 'README does not claim an unimplemented novelty fitness metric');
check(!/Experiment freely/i.test(readme), 'README does not imply an ungranted license');
check(fs.existsSync(path.join(root, 'docs/assets/app-screenshot.png')), 'current screenshot asset exists');
for (const file of ['HANDOFF.md', 'PROGRESS.md', 'DECISIONS.md']) check(fs.existsSync(path.join(root, file)), `durable ${file} exists`);
check(/Current Chromium smoke/.test(read('HANDOFF.md')), 'handoff contains current browser evidence');
check(/Current-head revalidation/.test(read('docs/plans/2026-07-30-acceptance-log.md')), 'acceptance log contains current-head evidence');

const noop = () => {};
const canvasContext = {
  beginPath: noop, fill: noop, fillRect: noop, moveTo: noop, lineTo: noop,
  stroke: noop, arc: noop, closePath: noop,
  fillStyle: '', strokeStyle: '', lineWidth: 1
};
let created = 0;
const elements = new Map();
function makeElement(id, tagName = 'div') {
  const children = [];
  const el = {
    id,
    tagName: tagName.toUpperCase(),
    value: '',
    checked: false,
    textContent: '',
    innerHTML: '',
    href: '',
    download: '',
    style: {},
    className: '',
    children,
    options: [],
    classList: {
      _items: new Set(),
      add(...names) { names.forEach((name) => this._items.add(name)); },
      remove(...names) { names.forEach((name) => this._items.delete(name)); },
      contains(name) { return this._items.has(name); }
    },
    appendChild(child) {
      children.push(child);
      if (this.tagName === 'SELECT') this.options.push(child);
      return child;
    },
    click() { this.clicked = true; },
    getContext() { return canvasContext; }
  };
  if (id === 'c') {
    el.width = 920;
    el.height = 600;
  }
  return el;
}
function element(id, tagName = 'div') {
  if (!elements.has(id)) elements.set(id, makeElement(id, tagName));
  return elements.get(id);
}
for (const id of ['layersPanel', 'numPerLayer', 'pauseBtn', 'audioBtn', 'stopBtn', 'recBtn', 'downloadLink', 'jiToggle', 'midiBtn', 'midiOut', 'breedBtn', 'cancelBreedBtn', 'gens', 'volSlider', 'status', 'c']) {
  element(id, id === 'c' ? 'canvas' : id === 'midiOut' ? 'select' : 'div');
}
element('numPerLayer').value = '7';
element('gens').value = '5';
element('volSlider').value = '55';
const documentStub = {
  getElementById(id) { return element(id, id === 'midiOut' ? 'select' : id === 'c' ? 'canvas' : 'div'); },
  createElement(tagName) { return makeElement(`created-${++created}`, tagName); }
};
class FakeBlob {
  constructor(parts = [], options = {}) {
    this.type = options.type || '';
    this.size = parts.reduce((total, part) => total + (part?.size || String(part).length || 0), 0);
  }
}
const sandbox = {
  document: documentStub,
  window: {},
  navigator: {},
  requestAnimationFrame: noop,
  setTimeout,
  clearTimeout,
  URL: { createObjectURL: () => 'blob:verify', revokeObjectURL: noop },
  Blob: FakeBlob,
  console,
  Math,
  Date,
  Promise,
  Number,
  String,
  Array,
  Object,
  JSON,
  Error,
  parseInt,
  parseFloat,
  isFinite
};
vm.createContext(sandbox);
vm.runInContext(source, sandbox, { filename: 'index.html:inline-script' });
const evaluate = (expression) => vm.runInContext(expression, sandbox);
const evaluateAsync = (body) => vm.runInContext(`(async () => { ${body} })()`, sandbox);

assert.equal(evaluate('layers.length'), 2);
pass('runtime boots two default layers');
assert.equal(evaluate('layers[0].mode'), 'ionian');
assert.equal(evaluate('layers[1].mode'), 'dorian');
assert.equal(evaluate('JSON.stringify(getFreqPlan("ionian", 7, true, "C", 0, "1", "asc").weights)'), '[24,27,30,32,36,40,45]');
pass('JI Ionian uses documented integer weights');
assert.notEqual(evaluate('JSON.stringify(getFreqs("ionian", 7, true))'), evaluate('JSON.stringify(getFreqs("ionian", 7, false))'));
pass('JI and ET produce different frequency plans');
assert.equal(evaluate('speedFactor("1/8")'), 0.125);
assert.equal(evaluate('speedFactor("8")'), 8);
pass('rational speed factors parse exactly');

evaluate("setLayerField(0, 'mode', 'blues'); setLayerField(0, 'key', 'A'); setLayerField(0, 'octave', 2); setLayerField(0, 'speed', '1/8'); setLayerField(0, 'order', 'desc'); setLayerField(0, 'notes', 5);");
const fieldState = JSON.parse(evaluate('JSON.stringify({mode:layers[0].mode,key:layers[0].key,octave:layers[0].octave,speed:layers[0].speed,order:layers[0].order,notes:layers[0].notes,pendulums:layers[0].pendulums.length})'));
assert.deepEqual(fieldState, { mode: 'blues', key: 'A', octave: 2, speed: '1/8', order: 'desc', notes: 5, pendulums: 5 });
pass('per-layer mode/key/octave/speed/order/note controls update state');

evaluate('while (layers.length < 5) addLayer()');
assert.equal(evaluate('layers.length'), 5);
evaluate('addLayer()');
assert.equal(evaluate('layers.length'), 5);
pass('layer cap holds at five');
assert.equal(evaluate('injectModeAsLayer("cap_test", [1, 1.5])'), false);
assert.equal(evaluate('layers.length'), 5);
assert.equal(evaluate('customModes.cap_test.length'), 2);
pass('evolved modes save without exceeding the layer cap');

evaluate('removeLayer(4)');
assert.equal(evaluate('injectModeAsLayer("loaded_test", [1, 1.5])'), true);
assert.equal(evaluate('layers.length'), 5);
assert.equal(evaluate('layers[4].mode'), 'loaded_test');
pass('evolved mode injects as a selectable layer when a slot is free');

await evaluateAsync("document.getElementById('gens').value = '200'; const breeding = overnightBreed(); cancelBreed(); await breeding;");
assert.equal(evaluate('breedRunning'), false);
assert.match(evaluate('document.getElementById("status").textContent'), /Breeding cancelled/);
pass('breeding cancellation restores idle UI state');

evaluate('stopAll()');
assert.equal(evaluate('isPaused'), true);
assert.equal(evaluate('isAudioOn'), false);
assert.equal(evaluate('document.getElementById("pauseBtn").textContent'), 'Resume');
pass('hard Stop leaves motion paused and audio off');
await evaluateAsync("await toggleAudio();");
assert.match(evaluate('document.getElementById("status").textContent'), /Web Audio not available/);
pass('missing Web Audio reports a truthful status');
await evaluateAsync("await startRecording();");
assert.match(evaluate('document.getElementById("status").textContent'), /Web Audio unavailable/);
pass('recording reports missing Web Audio without throwing');
await evaluateAsync("await enableMIDI();");
assert.match(evaluate('document.getElementById("status").textContent'), /MIDI not available/);
pass('missing Web MIDI reports a truthful status');

console.log(`VERIFY PASS: ${passed} deterministic checks`);
