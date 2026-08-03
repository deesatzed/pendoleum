# Deterministic Execution Plan — Modal Layer Pendulum v3 Ship

**Mode:** `planning --mode=plan`  
**Date:** 2026-07-30  
**Upstream:**  
- Interview requirements (confirmed)  
- `docs/architecture/2026-07-30-modal-layer-pendulum-ironclad.md`  

> **Historical record:** This dated checklist is preserved as the original execution plan. Its unchecked operator list is not a current status signal; see `docs/plans/2026-07-30-acceptance-log.md` for the original acceptance record and `HANDOFF.md` for current-head proof.

**Defaults locked (no further ask unless unblock):**  
- Deliverable path: `index.html` (repo root)  
- Breed at layer cap: fill free slots only; status if none free  
- `customModes`: local `let customModes = {}` (not `window`)  

---

## Phase 1 — Outcome Framing

### Testable Outcomes

| ID | Outcome | Test |
|----|---------|------|
| O1 | Runtime app exists as openable HTML | File `index.html` at repo root; Chromium loads without parse error |
| O2 | Layer composition works | Boot shows ≥2 layers; + Layer / × respect max 5 |
| O3 | Web Audio path works | After Start Sound, pendulums produce audible amplitude modulation |
| O4 | JI/ET path works | Toggle JI → status shows (JI); pitches differ from ET for same mode stack |
| O5 | Web MIDI path degrades safely | Enable MIDI: lists devices OR status explains failure/empty; no uncaught exception |
| O6 | Genetic path injects playable modes | Evolve Once and Overnight Breed create named modes selectable as layers |
| O7 | Layer cap holds under breed | With 5 layers, breed does not create 6th layer; status explains |
| O8 | Happy-path console clean | Full loop O1–O6 with no uncaught exceptions in DevTools |

### Success Criteria (Non-Negotiable)

- **Functional:** O1–O8 all pass on Chromium (Chrome or Edge or Brave).  
- **Fidelity:** Sonic defaults (base frequency 98×f, pendulum constants, fitness targets) unchanged unless required for a bug fix.  
- **Quality:** No mock audio/MIDI; real browser APIs only.  
- **Constraints:** Single file; no backend; no build tooling.

### Failure Modes (Pre-Mortem)

| Failure Mode | Detection Signal | Mitigation |
|--------------|------------------|------------|
| Partial HTML extract | Parse error / missing controls | Re-extract full fence from idea1.md; validate DOCTYPE→/html |
| Over-edit changes sound | Pitch/feel differs from idea1 paste | Diff against original; restore constants |
| MIDI treated as hard fail | Ship blocked without hardware | O5 allows status-only pass |
| Breed ignores cap | layers.length > 5 | Step 8 validation fails → fix inject helper |
| customModes rename miss | Evolved mode missing from select | Grep all customModes refs; fix |
| Scope creep (README, split files) | Extra deliverables appear as required | Reject; plan only `index.html` |

---

## Phase 2 — System Decomposition

| Piece | Must exist | Inputs | Outputs |
|-------|------------|--------|---------|
| `idea1.md` HTML block | Source | File read | String HTML |
| `index.html` | Deliverable | Extract + patches | Browser app |
| Tuning tables | In script | mode name, n, JI flag | relative freqs |
| `layers[]` | State | UI / evolve | composition |
| `customModes` | State | genetic | ratio arrays |
| AudioContext path | Optional runtime | user gesture | sound |
| MIDIAccess path | Optional runtime | user gesture | notes |
| rAF `draw` | Always | time, state | canvas + side effects |
| Status line | Feedback | all subsystems | user-visible truth |

**Dependencies:** Extract before patches. Audio/MIDI harden independent of each other. Layer-cap patch depends on evolve functions existing. Acceptance depends on all patches merged.

---

## Phase 3 — Deterministic Execution Plan

### Step 1: Verify workspace source

- **Action:** Confirm `idea1.md` contains a complete HTML document fence.  
- **Input:** `/Volumes/WS4TB/pendoleum/idea1.md`  
- **Output:** Verified start line (`<!DOCTYPE html>`) and end line (`</html>`).  
- **Validation:** Both markers present; script includes `evolveOnce`, `enableMIDI`, `toggleAudio`, `jiModes`.  
- **Failure Handling:** Stop chain; report missing markers.

### Step 2: Extract to `index.html`

- **Action:** Write the fenced HTML content (no markdown fences) to `index.html` at repo root.  
- **Input:** HTML block from idea1.md  
- **Output:** `index.html`  
- **Validation:** File non-empty; starts with `<!DOCTYPE html>`; ends with `</html>`; opens in browser or `head` parse check.  
- **Failure Handling:** Delete incomplete file; re-extract.

### Step 3: Baseline smoke (pre-harden)

- **Action:** Open `index.html` in Chromium; observe boot.  
- **Input:** `index.html`  
- **Output:** Pass/fail notes for: canvas visible, 2 layer rows, animation motion.  
- **Validation:** All three true.  
- **Failure Handling:** Diff extract vs source; fix extract before any patches.

### Step 4: Localize `customModes`

- **Action:** Replace `window.customModes` with file-scope `let customModes = {}`; update every read/write (`createLayerUI`, `getFreqs`, `evolveOnce`, `overnightBreed`).  
- **Input:** `index.html`  
- **Output:** Patched script; no remaining `window.customModes` (except none).  
- **Validation:** `rg 'window\\.customModes' index.html` → 0 matches; `rg 'customModes' index.html` shows consistent local use.  
- **Failure Handling:** Revert localization if evolve inject breaks; re-apply carefully.

### Step 5: Harden Audio feature detect

- **Action:** In `initAudio` / `toggleAudio`: if neither `AudioContext` nor `webkitAudioContext`, set status to a clear message and return without throw. On toggle, if context suspended, call `resume()` after user gesture (keep existing pattern; ensure no uncaught rejection).  
- **Input:** `index.html` audio functions  
- **Output:** Guarded audio path  
- **Validation:** Code path exists; happy path still starts sound after Start Sound.  
- **Failure Handling:** If audio breaks, restore prior toggleAudio and add only feature-detect early return.

### Step 6: Harden MIDI empty / fail status

- **Action:** Keep try/catch around `requestMIDIAccess`. After success: if zero outputs, set status e.g. `MIDI access OK but no output devices found`. On catch, status remains non-throwing message.  
- **Input:** `enableMIDI`  
- **Output:** Explicit empty-output branch  
- **Validation:** Reading code shows empty branch; no throw on missing API.  
- **Failure Handling:** Restore idea1 catch body; add only empty check.

### Step 7: Add shared inject helper with layer cap

- **Action:** Implement `function freeLayerSlots() { return Math.max(0, 5 - layers.length); }` and `function injectModeAsLayer(name, scale) { ... }` that: sets `customModes[name]=scale`; if `freeLayerSlots()===0`, updates status and returns false; else pushes layer, returns true.  
- **Input:** layer cap invariant (max 5)  
- **Output:** Helper used by evolve paths  
- **Validation:** Helper present; max 5 encoded once.  
- **Failure Handling:** Inline cap checks in both evolve functions if helper abstraction fails review.

### Step 8: Wire evolveOnce / overnightBreed to cap

- **Action:**  
  - `evolveOnce`: after computing best scale, call inject; if false, still may store in `customModes` optionally — **spec:** store mode in `customModes` always, add layer only if slot free; status reflects both cases.  
  - `overnightBreed`: inject top 2 only into free slots (0–2 adds); status reports how many loaded vs skipped.  
- **Input:** Step 7 helper  
- **Output:** Cap-safe breed  
- **Validation:** Mentally simulate layers=5 → no push; layers=4 overnight → at most 1 add if only top-1 fits, or 1 free slot max 1 inject.  
- **Failure Handling:** Fix off-by-one; re-validate.

### Step 9: Preserve createLayerUI after inject

- **Action:** Ensure every successful inject calls `createLayerUI()` then `restart()`.  
- **Input:** evolve functions  
- **Output:** UI shows new mode in selects  
- **Validation:** New mode name appears in dropdown options.  
- **Failure Handling:** If options missing, fix opts construction to include `Object.keys(customModes)`.

### Step 10: Fidelity check vs idea1 constants

- **Action:** Compare critical constants unchanged: `98 * f`, `length: 155/(f*f)`, `time += 0.0152`, fitness `targets` array, layer max 5, masterGain 0.16.  
- **Input:** idea1.md + index.html  
- **Output:** Diff report (should be empty for these)  
- **Validation:** All listed constants match.  
- **Failure Handling:** Restore constants from idea1.

### Step 11: Manual acceptance O1–O8

- **Action:** Execute checklist in Phase 6.  
- **Input:** Chromium + `index.html`  
- **Output:** Written pass/fail for each O#  
- **Validation:** All O1–O8 pass (O5 status-only OK without hardware).  
- **Failure Handling:** Fix failing step; do not claim complete.

### Step 12: Write acceptance evidence note

- **Action:** Append or create `docs/plans/2026-07-30-acceptance-log.md` with date, browser name, O1–O8 results.  
- **Input:** Step 11 results  
- **Output:** Evidence file  
- **Validation:** File lists each outcome PASS/FAIL.  
- **Failure Handling:** If any FAIL, plan status = blocked until fixed.

---

## Phase 4 — To-Do Checklist (Operator Mode)

- [ ] Step 1: Verify idea1.md HTML fence complete  
- [ ] Step 2: Extract to `index.html`  
- [ ] Step 3: Baseline smoke (canvas, 2 layers, motion)  
- [ ] Step 4: Localize `customModes`  
- [ ] Step 5: Harden Audio feature detect  
- [ ] Step 6: Harden MIDI empty/fail status  
- [ ] Step 7: Add freeLayerSlots + injectModeAsLayer  
- [ ] Step 8: Wire evolveOnce / overnightBreed to cap  
- [ ] Step 9: Ensure createLayerUI + restart after inject  
- [ ] Step 10: Fidelity check constants vs idea1  
- [ ] Step 11: Manual acceptance O1–O8  
- [ ] Step 12: Write acceptance evidence log  

---

## Phase 5 — Anti-Drift Safeguards

**Checkpoints**

- After Step 3: behavior must match idea1 paste.  
- After Step 8: only guards + cap + customModes locality differ.  
- After Step 10: constants match idea1.

**Forced re-alignment**

- If any checkpoint fails → return to last valid step; discard divergent edits.

**DO NOT**

- Add multi-file structure, bundler, TypeScript.  
- Mock Audio or MIDI.  
- Redesign UI chrome, colors, GA fitness, pendulum physics.  
- Add README as a required acceptance item.  
- Claim production-ready if O1–O8 incomplete.  
- Use placeholders or demo-only audio.

---

## Phase 6 — Verification Harness

### Unit-level (manual / code inspection)

| Check | Expected |
|-------|----------|
| `freeLayerSlots` at 5 layers | 0 |
| inject at 5 layers | false; no push |
| `customModes` local only | no `window.customModes` |

### Integration

| Check | Expected |
|-------|----------|
| evolveOnce with 2 layers | layers → 3; new mode in UI |
| overnightBreed gens=5 with 4 layers | layers ≤ 5 |
| Start Sound then Mute | audible then silent path |

### End-to-end (creative loop)

1. Open `index.html`  
2. Confirm 2 layers animating  
3. Start Sound → hear  
4. Toggle JI → status (JI)  
5. Enable MIDI → devices or status  
6. Evolve Once → new layer/mode  
7. Overnight Breed (gens=10) → offspring modes  
8. Console: no uncaught errors  

**Pass condition:** All steps succeed; O5 may pass via status without MIDI hardware.

---

## Phase 7 — Output Format Requirements

This plan is:

- Hierarchical (phases → steps)  
- Free of time estimates  
- Immediately executable by any operator following steps 1–12  
- Traceable to interview + ironclad  

**Exit gate for this plan:** Steps 1–12 complete with O1–O8 all PASS and evidence log written.

**Out of plan (next stage, not this chain):** Stage 2 preliminary build beyond ship, productization, hosting.

---

## Traceability

| Plan element | Source |
|--------------|--------|
| Single HTML | Interview I2 / Ironclad C2 lean |
| Four pillars | Interview I4 |
| Graceful MIDI/Audio | Interview I5 / Ironclad harden |
| Layer cap breed | Ironclad B4 / Pass A gap |
| Acceptance O1–O8 | Interview I7 + Ironclad S1–S7 (+cap as O7) |
| No mock | Project Claude.md + interview |
