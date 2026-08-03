# Pendoleum Current Handoff

**Status:** Release-credible v1 implementation verified and pushed to `origin/main`.

**As of:** 2026-08-03

## Repository truth

- Repository: `/Volumes/WS4TB/waswiki/bupendi/pendoleum`
- Branch: `main`
- Remote: `origin` → `https://github.com/deesatzed/pendoleum.git`
- Verified base before finish changes: `75b520566595875e998cf6b6892cd31bd216ee6c`
- First verified implementation push: `9d8b9670d35392b4456706fec30417f3d3ff9d1a` (`Finish and verify Pendoleum v1`).
- Runtime source of truth: `index.html`
- `idea1.md` and the dated architecture/ship-plan files are historical references, not current runtime truth.

## Purpose and value

Pendoleum is a local-first, no-account browser instrument for exploring modal harmony as animated pendulum systems. A user stacks modal layers, chooses ET or JI tuning, hears motion-driven Web Audio, optionally sends peak events over MIDI, records the result, and breeds new ratio scales back into the instrument.

It is useful to experimental composers, sound designers, generative artists, music-theory learners, and MIDI performers who want a low-friction audiovisual system that produces structured but non-prescribed musical material.

## Implemented v1 capability

- Two default layers and a five-layer maximum.
- Modal families including church modes, pentatonics, blues, whole tone, and custom evolved scales.
- Per-layer mode, key, octave, exact rational speed, note order, and note count.
- Equal temperament and 5-limit just-intonation frequency plans.
- Canvas pendulum trails with motion-derived amplitude and peak events.
- Gesture-gated Web Audio, Mute, Pause/Resume, volume, hard Stop, and Restart.
- MediaRecorder WebM capture with truthful unsupported-browser handling.
- Optional Web MIDI output with missing, denied, and empty-device status paths.
- Genetic mutation/crossover/fitness on harmonic interval targets and scale-length preference; Evolve Once and cancellable overnight breeding.
- Responsive canvas/control layout and basic status/canvas accessibility semantics.

## Evidence

### Deterministic gate

Command: `./scripts/verify.sh` (which runs `node scripts/verify.mjs` and the browser smoke).

The deterministic portion passed 39 checks covering inline parsing, markup and durable-handoff invariants, boot layers, JI/ET, integer weights, rational speeds, all per-layer fields, cap-safe injection, breeding cancellation, Stop semantics, and missing Audio/Recorder/MIDI paths.

### Current Chromium smoke

- Browser: Chrome `151.0.7922.72`.
- Page: real `file:///Volumes/WS4TB/waswiki/bupendi/pendoleum/index.html`.
- Two layers and all 12 primary controls rendered.
- Live per-layer changes applied: blues / A / octave +2 / ×1/8 / descending / 5 notes.
- JI status, five-layer cap, Evolve Once at cap and with a free slot, and cancellation all passed.
- Web Audio started; Mute, hard Stop, and Resume state transitions passed.
- Recording produced 10,819 bytes of WebM data and returned to idle state.
- MIDI absence reported `MIDI not available in this browser` without JavaScript errors.
- 640px viewport measured `scrollWidth=640`, `clientWidth=640`.
- JavaScript page errors: `[]`.

The screenshot in `docs/assets/app-screenshot.png` was regenerated from the current UI and includes the expanded per-layer controls.

## Explicit limits

- Subjective speaker/listening confirmation was not operator-verified by this run.
- External MIDI hardware or DAW output was not available; only the real unavailable-capability path was verified.
- Chromium is the tested target; other browser support varies by Web Audio, MediaRecorder, and Web MIDI implementation.
- Evolved modes are session-local; persistence, presets, sharing, Scala export, and MIDI CC remain future work.
- No software license is granted by this repository at present; do not infer reuse rights from the README.

## Git handoff record

- The verified implementation commit above was pushed with `git push origin main`.
- Post-push audit after that push: local `HEAD` and `origin/main` both resolved to `9d8b9670d35392b4456706fec30417f3d3ff9d1a`; `git rev-list --left-right --count HEAD...origin/main` returned `0 0`; `git status --porcelain` returned no output.
- A documentation-only follow-up may update this handoff; the final command output remains authoritative for the current HEAD hash and remote parity.
