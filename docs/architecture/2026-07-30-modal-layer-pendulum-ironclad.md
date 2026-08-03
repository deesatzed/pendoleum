# Ironclad Design Packet — Modal Layer Pendulum v3 Ship

**Mode:** `architecture --mode=ironclad`  
**Date:** 2026-07-30  
**Role:** SWE  
**Upstream:** `/build` Stage 1 · `planning --mode=interview` (confirmed)  
**Source artifact:** `idea1.md` (embedded complete HTML prototype)

> **Historical record:** This packet captures the 2026-07-30 v3 ship design. The current runtime also includes later recording, Stop/Pause, rational-speed, per-layer-control, responsive, and accessibility hardening. See the repository `HANDOFF.md` and current verification gate for present truth.

---

# PASS A — Design Packet Construction

### 0. Input Integration Summary

| Input ID | Source snippet | Constraint extracted |
|----------|----------------|----------------------|
| I1 | Interview: ship idea1 HTML as real app | Extract + harden; not leave as markdown-only |
| I2 | Interview: single-page app, HTML only | One openable HTML file; no backend |
| I3 | Interview: Chromium-first | Chrome/Edge/Brave primary; Safari/FF best-effort |
| I4 | Interview: all four pillars day-one | Layers + Web Audio + JI/ET + Web MIDI + genetic evolve |
| I5 | Interview: graceful MIDI + Audio failures | Clear status; visual app still runs |
| I6 | Interview: solo musician / experimenter | Browser workflow: stack modes → sound → optional MIDI → evolve |
| I7 | Interview: acceptance = full loop, no happy-path console errors | Manual verification criteria; no automated suite required |
| I8 | idea1.md: closed creative loop | layer modes → collide → evolve DNA → feed back → audio + MIDI |
| I9 | idea1.md: max 5 layers; numPerLayer 4–12 | Hard UI caps already in prototype |
| I10 | idea1.md: JI modes + ET modes + customModes | Three tuning sources |
| I11 | Scope out: backend, accounts, Vite/TS, hard cross-browser, auto tests | Explicit non-goals |

**Assumptions (labeled):**

- **A1:** Extracting the HTML block from `idea1.md` preserves intended behavior when saved as `index.html`.
- **A2:** `file://` open is acceptable for acceptance; local static server is optional, not required.
- **A3:** “No console errors on happy path” means no uncaught exceptions during the documented creative loop on Chromium with user gesture for audio.
- **A4:** Genetic fitness function and MIDI note mapping in idea1 are intentional and need not be redesigned for v1 ship.

---

### 1. Problem Frame & Success Criteria

**Problem:** The generative instrument exists only as markdown-embedded source. It is not a loadable product artifact, has no project home, and lacks explicit hardening for permission/device failures beyond partial MIDI catch.

**Success (binary / testable):**

| ID | Criterion | Test |
|----|-----------|------|
| S1 | `index.html` exists at repo root (or agreed path) and is valid HTML | Open in Chromium; page renders title + canvas |
| S2 | ≥2 default layers boot; add/remove layer works (cap 5) | UI actions; status updates |
| S3 | Start Sound → audible oscillators tied to pendulum energy | User gesture; hear amplitude change with motion |
| S4 | JI toggle changes frequency path vs ET | Toggle + restart; pitch color differs for same mode |
| S5 | Enable MIDI: success lists outputs OR status explains failure | With device: list; without: status message, no throw |
| S6 | Evolve Once / Overnight Breed inject named custom modes as layers | New mode in select; playable |
| S7 | No uncaught exceptions on happy path | DevTools Console clean during S1–S6 |

---

### 2. Constraints, Non-Goals & Invariants

**Constraints**

- Single HTML deliverable (CSS + JS inline or in-file only).
- Client-only; no network dependency for core loop.
- Real Web Audio API and Web MIDI API (no mock audio/MIDI).
- Chromium-first.

**Non-goals (quarantine backlog)**

- Multi-file modules, bundlers, TypeScript.
- Persistence / preset library / cloud.
- MIDI CC, Scala export, recording (mentioned as future in idea1; not day-one).
- Automated unit/browser tests.
- Cross-browser parity guarantees.

**Invariants**

- Physics–pitch coupling: pendulum frequency parameter drives both visual period and audio frequency (and MIDI mapping).
- Creative loop remains closed: evolved scales become playable layers.
- Audio starts only after user gesture (`toggleAudio`).
- Layer count hard cap ≤ 5 (prototype behavior).

---

### 3. Candidate Architectures (≥3)

| ID | Architecture | Pros | Cons | Fit |
|----|--------------|------|------|-----|
| C1 | **Raw extract** — paste idea1 HTML to `index.html` unchanged | Fastest; max fidelity | Weak structure; incomplete failure UX; hard to harden surgically | Med |
| C2 | **Single-file regions** — one `index.html` with named JS sections (Tuning, Physics, Audio, MIDI, Genetic, UI, Render) + hardened guards | Still one file; auditable; matches scope; easy manual test | No module isolation; globals remain | **High** |
| C3 | **Static multi-file** (css/js split) or Vite/TS | Cleaner long-term | **Out of scope** (I2) | Reject for this ship |

**Selected: C2** — Single-file regionalized extract with minimal hardening only where requirements demand (I5).

**ADR-001:** Prefer C2 over C1 so failure handling and section boundaries are explicit without violating single-file constraint. Prefer C2 over C3 because multi-file is explicitly out of scope.

---

### 4. Selected Architecture

```
[Browser Document: index.html]
  ├── Presentation (HTML shell + CSS)
  ├── UI binding (layer rows, controls, status)
  ├── Domain: Tuning (ET map, JI modes, customModes, getFreqs)
  ├── Domain: Layer/Pendulum state
  ├── Domain: Genetic (population, fitness, mutate, crossover, breed)
  ├── IO: Web Audio (AudioContext, oscillators, gains)
  ├── IO: Web MIDI (access, output select, note on/off)
  └── Loop: requestAnimationFrame draw + peak→MIDI + energy→gain
```

**Truth locations**

| Truth | Where |
|-------|--------|
| Active layers & modes | `layers[]` |
| Pendulum dynamics & trails | `layer.pendulums[]` |
| Tuning system (JI vs ET) | `#jiToggle` + mode tables |
| Evolved scales | `window.customModes` (or module-local `customModes`) |
| Audio on/off | `isAudioOn` + AudioContext state |
| MIDI destination | `midiOutput` |
| Simulation time | `time` |

---

### 5. Component Breakdown

| Component | Responsibility | Contract |
|-----------|----------------|----------|
| **UI Shell** | Controls, layer select/remove, status text | DOM events → domain commands; never throws on missing MIDI |
| **Tuning** | Map mode name + n + useJI → relative freqs | Pure function `getFreqs(mode, n, useJI)` |
| **Restart** | Rebuild pendulums from layers + tuning; (re)wire audio | Idempotent; stops old oscs safely |
| **Audio Engine** | Context init, master gain, per-pendulum osc/gain | Requires user gesture path; silent if off |
| **MIDI Engine** | requestMIDIAccess, populate select, note send | No-op if no output; status on failure |
| **Genetic** | Population evolve; inject custom mode + layer | Always produces named scale ≥1 ratio |
| **Render Loop** | Angle integration, trails, peak detect, gain envelope | Runs even if audio/MIDI off |

---

### 6. Data Flow & State Model

```
User action
  → UI handler
    → mutates layers / flags / population
    → restart() if structural
    → status text

rAF draw(time):
  for each pendulum:
    angle = f(time, f)
    if peak crossing → MIDI note (if midiOutput)
    update trail / draw
    if p.gain → setTarget gain from energy

Evolve:
  population → elite/mutate/crossover → best scale
  → customModes[name] = scale
  → layers.push({mode:name})
  → createLayerUI + restart
```

**State machine (audio)**

`uninitialized → created (suspended|running) → isAudioOn true|false`

**State machine (MIDI)**

`idle → requesting → ready(outputs≥1) | unavailable(message)`

---

### 7. Failure Modes & Mitigations

| Failure | Detection | Containment | Recovery |
|---------|-----------|-------------|----------|
| AudioContext blocked | `state === 'suspended'` after toggle | Keep visual loop | Resume on gesture; status hint |
| Web Audio missing | `!window.AudioContext && !webkit` | Status; disable sound path | Visual-only |
| MIDI API missing / denied | catch on `requestMIDIAccess` | Status string (prototype already) | App continues |
| Zero MIDI outputs | empty select after success | Status: no devices | User plugs device + re-enable |
| Oscillator stop/disconnect race | try/catch on stop | Already partial in prototype | Keep try/catch; ensure disconnect order |
| Layer cap | `layers.length >= 5` | No-op add | User removes layer |
| Overnight breed + layer cap | may push past 5 | **Gap in prototype** | Harden: refuse inject or auto-trim to 5 with status (Derived fix required for invariant) |
| Happy-path uncaught error | Console | Fix before ship | S7 gate |

---

### 8. Sequential Roadmap (Dependency Order, No Timelines)

| Phase | Objective | Inputs | Outputs | Risks | Unknowns | Contingencies | Origin Trace |
|-------|-----------|--------|---------|-------|----------|---------------|--------------|
| P0 | Freeze requirements | Interview confirm | This packet | Drift | — | Re-interview | I1–I7 |
| P1 | Extract HTML | idea1.md fenced block | `index.html` raw | Truncation | — | Diff against md | I8 |
| P2 | Regionalize JS | raw index | Section comments + optional customModes local | Behavior change | — | Diff behavior smoke | C2 |
| P3 | Harden Audio/MIDI | I5 | Guards + status | Over-edit | Exact Safari behavior | Chromium only claim | I5 |
| P4 | Layer-cap on breed | I9 invariant | Cap-safe evolve | UX surprise | Prefer refuse vs trim | Status message | I9 |
| P5 | Manual acceptance | S1–S7 | Checklist pass log | Environment MIDI | No hardware | Document MIDI optional path | I7 |
| P6 | Optional README | User later | Run notes | Scope creep | — | Skip if not requested | Non-goal unless asked |

---

### 9. Implementation Playbook (Granular)

1. **Objective:** Create ship path  
   - Tasks: ensure repo has `index.html` target path  
   - Validation: file exists  
   - Risk: wrong path  
   - Cascade: cannot open app  

2. **Objective:** Extract exact HTML from idea1  
   - Tasks: copy from `<!DOCTYPE` through `</html>`; strip markdown fence  
   - Validation: file opens; canvas visible  
   - Risk: partial copy  
   - Cascade: syntax errors  

3. **Objective:** Boot defaults  
   - Tasks: verify addLayer×2 + draw loop  
   - Validation: two layer rows, animation  

4. **Objective:** Audio path  
   - Tasks: Start Sound gesture; confirm masterGain path  
   - Validation: audible; Mute works  

5. **Objective:** JI path  
   - Tasks: toggle JI; restart; compare  
   - Validation: status shows (JI)/(ET); pitch change  

6. **Objective:** MIDI path  
   - Tasks: Enable MIDI; empty vs populated select; no throw  
   - Validation: status messages correct  

7. **Objective:** Genetic path  
   - Tasks: evolveOnce; overnightBreed with small gens  
   - Validation: custom mode in dropdown; layer added  

8. **Objective:** Harden failures  
   - Tasks: guard AudioContext absence; improve MIDI empty-output status; try/catch audio resume  
   - Validation: disable MIDI path simulation / deny → status, no throw  

9. **Objective:** Layer-cap safety on breed  
   - Tasks: if inject would exceed 5, stop with status or inject only free slots  
   - Validation: at 5 layers, breed does not create 6th  

10. **Objective:** Console clean pass  
    - Tasks: run full creative loop  
    - Validation: S7  

**Fidelity Gate (after steps 1–5):** Target ≥ 0.90 vs idea1 behavior.  
**Fidelity Gate (after steps 6–10):** Target ≥ 0.85 (hardening may add messages only).

---

### 10. Testing & Falsification Protocol

| Level | Case | Pass/Fail |
|-------|------|-----------|
| System | Open `index.html` Chromium | Renders |
| System | Start Sound without prior click elsewhere | Audio works after button |
| Falsify | Claim “MIDI always works” | Fail if no device — must status, not crash |
| Falsify | Claim “JI identical to ET” | Fail if pitches match for ionian all pendulums |
| Edge | 5 layers, addLayer | No-op |
| Edge | overnightBreed gens=5 at 4 layers | ≤5 layers after |
| UX | Status always reflects last meaningful action | Human check |
| Adversarial | Spam evolve / toggle JI / mute | No throw |

**No unit harness required** (I7). Manual checklist is the verification harness.

---

### 11. Scope Firewall

| Element | Source | Direct/Derived | Keep/Remove/Confirm |
|---------|--------|----------------|---------------------|
| Single HTML | I2 | Direct | Keep |
| Four pillars | I4 | Direct | Keep |
| Graceful audio/MIDI | I5 | Direct | Keep |
| Regionalized sections | C2 | Derived | Keep (structure only) |
| Layer-cap on breed | I9 + gap | Derived | Keep (invariant repair) |
| README | not accepted | Derived | Confirm later / out unless asked |
| Persistence | out | — | Remove |
| MIDI CC / Scala | idea1 future tease | — | Remove from day-one |

| Section | Alignment (0–1) | Drift | Action |
|---------|-----------------|-------|--------|
| Architecture C2 | 0.95 | None material | Proceed |
| Harden breed cap | 0.90 | Small behavior add | Document as fix not feature |
| Optional modules | 1.0 | None invented as required | OK |

---

### 12. UX Bible (Solo Experimenter)

**Cognitive model:** “Stack living modes → hear collisions → optional external MIDI → breed next DNA.”

**Navigation hierarchy (flat):**

1. Layer rows (mode select, remove)  
2. Transport-ish: + Layer, Restart, Start Sound, num per layer  
3. Tuning: JI checkbox  
4. MIDI: Enable + device select  
5. Evolve: Once / Overnight + gens  
6. Canvas (read-only spectacle)  
7. Status line (system voice)

**Interaction constraints:**

- Audio gated by explicit Start Sound.  
- MIDI gated by Enable MIDI.  
- Max 5 layers.  
- Status is the only system feedback channel (no toast framework).

**Accessibility (minimal, non-invented stretch):** Prefer native controls (buttons, select, checkbox, number) already present — keep labels; do not block ship on a11y overhaul.

**UX failure map:**

| Friction | Mitigation |
|----------|------------|
| Silence expected | Status if audio blocked; button shows Mute/Start |
| MIDI silent | Status when no device |
| Breed floods layers | Cap inject |

---

### 13. Optional Modules

**Missing inputs (not invented as required):** deployment host, analytics, monetization, compliance, scaling.

**Derived optional (backlog only):** README runbook; localStorage presets; Scala export; MIDI CC.

---

### 14. Clarifying Questions + Risk Exposures

Non-blocking for plan (defaults in parentheses):

1. Preferred path for `index.html`? (**repo root**)  
2. On breed at layer cap: refuse entirely vs fill remaining slots only? (**fill remaining slots, then status**)  
3. Keep `window.customModes` global vs local `let customModes`? (**local preferred for cleanliness; behavior same**)

**Risk exposures:**

- R1: MIDI untestable without hardware → acceptance must allow “status explains unavailability” as pass.  
- R2: `file://` + some browser MIDI quirks → Chromium + optional `npx serve` note if user later wants README.  
- R3: Over-hardening changes sonic character → limit edits to guards and cap.

### Pass A Artifact Bundle

| Artifact | Purpose | Where |
|----------|---------|-------|
| `A-SourceMap` | Traceability | §0, §11 |
| `A-Roadmap` | Dependency build | §8–9 |
| `A-AssumptionList` | A1–A4, R1–R3 | §0, §14 |
| `A-DriftGate` | Alignment scores | §11 |

---

# PASS B — First-Principles + Alien Goggles Audit & Rewrite

### B1. Faults, Assumptions, Ambiguities Found

1. **Pass A slightly over-structured** a single-file toy into “engines.” Risk of implementer rewriting more than extract+guard.  
2. **A2 file://** may be wrong for Web MIDI on some setups; acceptance should not require MIDI success, only non-throw + status.  
3. **Overnight breed exceeding layer cap** is a real invariant break in source — must fix or accept broken invariant.  
4. **`window.customModes`** is fragile; local binding is cleaner but must update all references (`createLayerUI`, `getFreqs`, evolve).  
5. **“Harden” can drift into redesign** of fitness/MIDI mapping — forbidden without re-interview.  
6. **No explicit “do not change sonic defaults”** invariant was under-emphasized.  
7. **Ambiguity:** Is `idea1.md` kept as historical source of truth or replaced? Need both: md remains narrative; `index.html` is runtime SOT.

### B2. First-Principles Reconstruction

> User needs to **open one file and complete the creative loop** → system must be a **browser document with executable script** → architecture requires **valid HTML + real Audio/MIDI APIs + mutable layer state + rAF loop**.  
> User needs **failures not to kill the experiment** → permission/device errors must **degrade to status text**, not exceptions.  
> User needs **evolved DNA to re-enter the instrument** → genetic output must **register as a mode and attach as a layer** under the same layer cap as manual adds.

Minimal architecture axiom set:

1. One document.  
2. One simulation loop.  
3. Three IO surfaces: canvas, audio, MIDI (last two optional at runtime).  
4. One layer list as sole composition model.

### B3. Alien-Goggles Reframe

A non-human designer might not separate “modes” and “pendulums” — only **coupled oscillators with ratio genomes**. UI could be genome editor only. **Rejected for this ship:** human input already specifies the pendulum-layer metaphor and control layout. Alien alternative logged as backlog, not selected.

### B4. Corrective Rewrite (Final Architecture)

**Ship architecture (revised, leaner):**

1. **Deliverable:** `/index.html` only (runtime source of truth).  
2. **Method:** Extract idea1 HTML **byte-faithful first**, then apply **minimal patches**:
   - AudioContext feature detect + status  
   - MIDI: catch + empty-output status (strengthen existing)  
   - Layer-cap enforcement on `evolveOnce` / `overnightBreed`  
   - Optional: `customModes` as `let` at top scope instead of `window`  
3. **Do not:** re-theme UI, retune fitness, change pendulum physics constants, split files, add frameworks.  
4. **Docs:** no README required for acceptance (I7); if added later, non-blocking.  
5. **Verification:** manual S1–S7 checklist only; MIDI hardware optional with documented alternate pass.

**Differences from Pass A:** demote “regional engines” from required refactor to **optional comment banners only**; prioritize fidelity extract + three hardenings; lock sonic constants.

### B5. Questions Required Before Further Execution

Blocking: **none** if defaults accepted:

| Q | Default if unanswered |
|---|------------------------|
| Path of HTML | `index.html` at repo root |
| Breed at cap | Inject only into free slots (0..5-layers); status if none free |
| customModes | Prefer local `let customModes = {}` with reference updates |

---

## Final Selected Design (Post-Pass B)

| Decision | Choice |
|----------|--------|
| Architecture | Single-file extract + minimal harden (C2 lean) |
| Runtime SOT | `index.html` |
| Narrative SOT | `idea1.md` (historical / description) |
| Scope | Four pillars, Chromium-first, no backend |
| Hardening | Audio detect, MIDI fail/empty status, layer-cap on breed |
| Forbidden without re-approval | Multi-file, mocks, redesign of GA/physics/UI chrome |

**Falsifiability of design:** If an engineer cannot produce S1–S7 by extract+three patches, the design failed (over-constrained or under-specified). If patches change default pitches/physics without requirement, design fidelity failed.

---

## Machine-Readable Handoff (for `planning --mode=plan`)

```json
{
  "project": "pendoleum-modal-layer-pendulum",
  "architecture": "single-html-extract-minimal-harden",
  "deliverable": "index.html",
  "source": "idea1.md#html-block",
  "must": ["layers", "web-audio", "ji-et", "web-midi", "genetic-evolve"],
  "harden": ["audio-feature-detect", "midi-fail-status", "layer-cap-on-breed"],
  "non_goals": ["backend", "build-tooling", "automated-tests", "cross-browser-guarantee"],
  "acceptance": ["S1","S2","S3","S4","S5","S6","S7"],
  "defaults": {
    "html_path": "index.html",
    "breed_at_cap": "fill_free_slots_only",
    "customModes": "local_let"
  }
}
```
