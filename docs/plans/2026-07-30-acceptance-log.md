# Acceptance Log — Modal Layer Pendulum v3 Ship

**Date:** 2026-07-30  
**Deliverable:** `/Volumes/WS4TB/pendoleum/index.html`  
**Browser (automated):** Google Chrome headless (`--headless=new`)  
**Browser (manual audio/MIDI):** Operator should confirm O3–O5 interactively in Chromium  

> The original record below is a dated v3 ship checkpoint. The current checkout is `/Volumes/WS4TB/waswiki/bupendi/pendoleum`; current-head revalidation is appended after the historical result and must not be inferred from the original path or browser run.

## Outcomes

| ID | Outcome | Result | Evidence |
|----|---------|--------|----------|
| O1 | Runtime app openable HTML | **PASS** | `index.html` at repo root; headless `--dump-dom` returns title “Modal Layer Pendulum – New Music Engine v3” |
| O2 | Layer composition (≥2 boot, cap 5) | **PASS** | Headless DOM: `L1` present, `ionian` options, `layer-row` rendered; code `MAX_LAYERS = 5`; node logic test for cap |
| O3 | Web Audio path | **PASS (code + feature guard)** | `toggleAudio` / `initAudio` with real AudioContext; feature-detect status if missing. *Audible confirmation requires local user gesture in Chromium (not available in headless).* |
| O4 | JI/ET differs | **PASS** | Node logic test: `getFreqs` ionian JI ≠ ET for n=7 |
| O5 | MIDI degrades safely | **PASS (code path)** | Guards: no `requestMIDIAccess` → status; catch → status; zero outputs → “MIDI access OK but no output devices found”. No throw paths. Hardware listing is environment-dependent. |
| O6 | Genetic injects playable modes | **PASS (code + logic)** | `injectModeAsLayer` stores `customModes` and adds layer under cap; `evolveOnce` / `overnightBreed` wired |
| O7 | Layer cap under breed | **PASS** | Node tests: at 5 layers inject returns false and does not push; overnight at 4 layers loads 1 saves 1 |
| O8 | Happy-path no uncaught errors | **PASS (load path)** | Headless load/dump-dom succeeds; static checks no `window.customModes`; script parses. Full interactive console check is for local Chromium operator. |

## Hardening applied (vs idea1 extract)

1. `let customModes = {}` (no `window.customModes`)  
2. Audio feature detect + resume rejection status  
3. MIDI: missing API / empty outputs / catch status  
4. `MAX_LAYERS` + `freeLayerSlots` + `injectModeAsLayer` on evolve paths  

## Fidelity constants (unchanged)

- `98 * f`  
- `length: 155/(f*f)`  
- `time += 0.0152`  
- `masterGain.gain.value = 0.16`  
- fitness `targets = [1.25, 1.333, 1.5, 1.666, 1.875, 1.2, 1.4, 1.6]`  

## Gap / action plan (not 100% interactive audio)

| Gap | Action |
|-----|--------|
| Headless cannot prove audible output (O3 ears) | Open `index.html` in Chrome → Start Sound → confirm hear |
| MIDI device list needs hardware (O5 devices) | Enable MIDI with a virtual/hardware output when available; empty-device status already verified in code |

**Ship status:** Plan steps 1–12 complete for automated + code verification. Interactive audio/MIDI ear/device check remains operator-side; code paths are real (no mocks).

## Current-head revalidation — 2026-08-03

**Working-tree base:** `origin/main` `75b520566595875e998cf6b6892cd31bd216ee6c` plus the finish-goal changes being verified.

**Browser:** Chrome `151.0.7922.72`, headless Chromium DevTools run against the real `file:///Volumes/WS4TB/waswiki/bupendi/pendoleum/index.html`.

**Automated gate:** `node scripts/verify.mjs` — **PASS, 39 deterministic checks**.

**Browser gate:** `node scripts/browser_smoke.mjs` — **PASS**.

Verified in the current runtime:

- two default layers and all 12 primary controls render;
- mode, key, octave, rational speed, order, and note-count changes update live state;
- JI status changes, five-layer cap, cap-safe evolution, and cancellable breeding;
- Web Audio starts in Chromium, Mute/Stop/Resume state transitions are truthful;
- recording produced non-empty WebM data (`10,819` bytes in the smoke run);
- MIDI absence reports `MIDI not available in this browser` without a JavaScript error;
- a 640px Chromium viewport has no horizontal overflow;
- current creative-loop run recorded no JavaScript console errors (`[]`).

Still operator-dependent and intentionally not claimed as verified here:

- subjective speaker/listening confirmation;
- output through an external MIDI device or DAW.
