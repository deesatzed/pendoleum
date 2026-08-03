# Finish Pendoleum and Push the Verified App

Use the complete block below with Codex `/goal` from this repository root:

```text
/goal
OUTCOME: Finish Pendoleum as a release-credible v1 of the existing single-file generative musical instrument, prove the current app and its documented creative loop work, repair stale documentation and handoff evidence, commit only the intended repository changes, and push the verified result to `origin/main` without force-pushing or deploying it.

CURRENT BASELINE TO REVALIDATE:
- Expected repository: `/Volumes/WS4TB/waswiki/bupendi/pendoleum`.
- Expected branch at goal creation: `main`, tracking `origin/main`.
- Expected starting commit at goal creation: `941d729`.
- Runtime source of truth: `index.html`.
- Historical prototype/reference: `idea1.md`; do not overwrite current implementation from it.
- Historical design/ship records: `docs/architecture/` and `docs/plans/`; treat their dated claims as historical until reverified against current HEAD.
- Product identity: a local-first, no-account browser instrument combining modal layers, pendulum visualization, ET/JI tuning, Web Audio, optional Web MIDI, recording, and genetic scale evolution.
- Before editing, read `AGENTS.md` and every present project truth file in this order: `GOAL.md`, `STANDARDS.md`, `IMPLEMENT.md`, `DECISIONS.md`, `PROGRESS.md`, `TASK_QUEUE.md`, then this file.
- Recheck all baseline facts. If paths, branch, HEAD, upstream, or dirty state differ, trust the checkout rather than this snapshot and record the difference before continuing.

DEFINITION OF THE COMPLETED V1:
1. Opening `index.html` in a supported Chromium browser renders the complete instrument with no uncaught load errors and two usable default layers.
2. Layer add/remove honors the five-layer cap. Every layer can change mode, key, octave, rational speed, ascending/descending order, and note count without breaking animation or sound state.
3. ET and JI produce measurably different tuning for applicable modes; integer pendulum weights and rational layer speeds retain their documented commensurate behavior.
4. Start Sound, Mute, Pause/Resume, volume, hard Stop, and Restart have distinct, truthful behavior. Hard Stop leaves the app silent and frozen until the user explicitly starts sound or resumes motion.
5. Recording either downloads a non-empty playable browser-supported audio file or gives a truthful unsupported-browser message without throwing.
6. Web MIDI either lists and uses available outputs or reports unavailable/denied/empty-output state without crashing. Real MIDI hardware is optional evidence, not a completion requirement.
7. Evolve Once and Simulate Overnight Breeding create and retain selectable evolved modes, honor the five-layer cap, yield during long runs, and support cancellation without leaving the UI in a false running state.
8. The interface remains usable on the Chromium desktop target and at narrower laptop widths. Add only bounded responsive/accessibility hardening needed for basic use: viewport metadata, non-overflowing controls/canvas, meaningful control names, keyboard focus visibility, canvas fallback/description, and live status semantics.
9. README and visual assets describe the actual current interface and behavior. Do not claim novelty, production readiness, cross-browser parity, audible confirmation, MIDI hardware success, or test coverage without evidence.
10. A durable handoff records purpose, audience/value, exact verified commands/results, current limitations, optional future work, final branch/commit, and push state.

PROOF OF DONE:
1. Capture the starting state with actual output from:
   - `pwd`
   - `git status --short --branch`
   - `git remote -v`
   - `git rev-parse HEAD`
   - `git rev-list --left-right --count HEAD...@{upstream}`
2. Create a repository-local, repeatable verification entry point at `scripts/verify.sh`. It must fail nonzero on any required failure and cover, at minimum:
   - inline JavaScript parsing;
   - two-layer boot and five-layer cap;
   - per-layer mode/key/octave/speed/order/note state changes;
   - ET/JI divergence and the documented JI Ionian integer weights;
   - evolved-mode storage/injection at and below the cap;
   - breeding cancellation and UI-state cleanup;
   - Mute/Pause/Stop state semantics;
   - missing Web Audio, MediaRecorder, and Web MIDI degradation paths;
   - required DOM controls, status semantics, viewport/responsive hooks, and documentation invariants.
3. Run `./scripts/verify.sh` from a clean shell and require exit 0. Do not weaken assertions to obtain green output.
4. Run a current-head Chromium browser smoke on the actual `index.html`, preferably through a local static server when browser security rules require it. Exercise the documented creative loop: boot, layer edits, sound start/mute, pause/resume, Stop, ET/JI, evolve once, cancellable breeding, recording when supported, and MIDI unavailable/device path. Record browser name/version, console errors, and observed results in the handoff.
5. Browser proof must use the real current app, not a replacement demo or mocked page. API stubs may supplement deterministic failure-path tests but cannot substitute for the real browser smoke.
6. For subjective or hardware-dependent checks that the agent cannot honestly perform, record `NOT OPERATOR-VERIFIED` and the exact manual check. Do not block v1 solely because no MIDI device exists; do block on uncaught errors, broken controls, silent-by-code audio graphs, zero-byte recording where recording is claimed supported, or false UI state.
7. Refresh or remove stale visual evidence. If `docs/assets/app-screenshot.png` remains, it must show the current controls. README links and instructions must work from this repository layout.
8. Correct documentation drift:
   - describe the genetic fitness function as implemented; do not claim a novelty metric unless one is implemented and tested;
   - identify dated architecture/plan files as historical where needed;
   - reconcile the unchecked old plan checklist with the acceptance history without fabricating retroactive evidence;
   - replace ambiguous licensing language such as `Experiment freely` with truthful wording. Do not choose or add a legal license without explicit owner instruction.
9. Create or update `HANDOFF.md`, `PROGRESS.md`, and `DECISIONS.md`:
   - `HANDOFF.md`: final purpose, users/value, capabilities, proof, limitations, exact final Git state, and optional future work;
   - `PROGRESS.md`: chronological batches, commands, results, assumptions, and remaining risks;
   - `DECISIONS.md`: only material architecture, scope, testing, documentation, dependency, or compatibility decisions.
10. Run final repository checks and require all to pass:
    - `./scripts/verify.sh`
    - `git diff --check`
    - inspect `git diff --stat` and `git diff` for scope and secret leakage
    - `git status --short --branch`
11. Before committing, fetch `origin` and confirm the push can remain fast-forward. Reconcile upstream changes safely; never discard unrelated work and never use force push.
12. Commit the verified, scoped changes with a descriptive message. Do not include unrelated files, credentials, browser profiles, recordings, temporary artifacts, or generated caches.
13. Run `git push origin main` to push the completed commit to `origin/main`. Production deployment, GitHub Pages activation, releases, and external announcements are out of scope.
14. After pushing, require:
    - `git status --porcelain` returns no output;
    - `git rev-parse HEAD` equals `git rev-parse origin/main` after a fetch;
    - `git rev-list --left-right --count HEAD...origin/main` returns `0 0`;
    - the final report includes the pushed commit hash and exact verification results.

SCOPE:
- May modify: `index.html`, `README.md`, `.gitignore`, `docs/assets/`, `docs/architecture/`, `docs/plans/`, `scripts/`, `tests/`, `HANDOFF.md`, `PROGRESS.md`, `DECISIONS.md`, and this `GOAL_FINISH.md` only when clarification is necessary.
- May add small repository-local test fixtures needed to verify the current app.
- Preserve `idea1.md` as the historical source narrative unless a minimal note is required to prevent it being mistaken for runtime truth.
- Do not modify files outside this repository.
- Do not add persistence, accounts, a backend, collaboration, cloud services, preset sharing, Scala export, MIDI CC, a framework migration, or other adjacent product features.
- Do not deploy or publish a release. The authorized external mutation is the final scoped Git push described above.

CONSTRAINTS:
- Preserve the single-file runtime: the playable application remains `index.html` with no build required. Verification and documentation may use separate files.
- Preserve the visual identity and the existing creative loop. Make bounded correctness, responsiveness, accessibility, and truthful-UX improvements; do not redesign the app.
- Prefer no new runtime dependencies. Add a development dependency only if current local tools cannot provide reliable verification, document why it is necessary, pin it, and keep it out of the runtime path.
- Do not rewrite the genetic fitness function merely to defend marketing copy; correct the copy unless a change is independently justified by a verified defect.
- Do not remove or weaken checks, error handling, layer caps, Stop semantics, or browser-degradation paths to make verification pass.
- Do not fabricate browser, audio, MIDI, recording, accessibility, or cross-browser evidence.
- Never commit secrets, credentials, personal browser data, absolute private paths, downloads, or temporary recordings.
- Preserve unrelated user changes. Stage files explicitly and review the staged diff before commit.
- Git operations must be non-destructive: no force push, no history rewrite, no hard reset, no broad clean, and no deletion of unrelated work.
- The user's request authorizes a normal scoped commit and fast-forward push to `origin/main` only after all required proof is green.

ITERATION:
1. Audit before editing: current files, Git identity/state, existing claims, dated evidence, available browsers/tools, and the smallest path to the completed-v1 definition.
2. Write the initial audit and assumptions to `PROGRESS.md`. Make safe assumptions and continue; do not ask routine implementation questions.
3. Work in small batches in this dependency order:
   A. Establish the verification harness and reproduce current truth.
   B. Fix demonstrated functional/state defects.
   C. Add bounded responsive/accessibility hardening.
   D. Run the real current-head browser creative loop and repair failures.
   E. Refresh README, screenshot/visual evidence, acceptance history, and handoff.
   F. Run the complete gate, review scope/security, commit, fetch, and push.
4. After each batch, run the nearest relevant checks and append commands/results to `PROGRESS.md`.
5. On a failure, diagnose the cause before editing. Make up to three materially different, evidence-based repair attempts. Re-run the narrow check, then the full gate after it passes.
6. If an intended check is impossible in the environment, exhaust safe local alternatives. Clearly separate required automated proof, real-browser proof, and optional operator/hardware confirmation.
7. Re-read the completed-v1 definition and `git diff` before declaring completion; remove accidental scope creep and temporary artifacts.

STOP:
Stop and report a concrete blocker without committing or pushing if:
- repository identity, remote ownership, or push target cannot be verified;
- credentials or GitHub authorization are missing;
- `origin/main` cannot be updated by a safe fast-forward without a consequential conflict or unrelated-history decision;
- unrelated dirty work overlaps files that must be changed and cannot be preserved safely;
- a destructive action, production deployment, legal/license choice, credential exposure, or material product-scope decision is required;
- the real browser app has a required failure that remains after three distinct repair attempts;
- the same verification failure persists after three distinct mitigation attempts;
- required proof would have to be fabricated or a required check would have to be weakened.

Do not stop merely because MIDI hardware is absent, subjective audibility cannot be heard by the agent, an optional browser is unavailable, or optional future features remain. Record those limits truthfully and complete if all required implementation and objective proof gates pass.

COMPLETE:
Mark the goal complete only when:
- every completed-v1 requirement is implemented or truthfully bounded;
- `./scripts/verify.sh` and all final checks pass on the final tree;
- current-head real-browser evidence is recorded with no required unresolved failure;
- documentation, current screenshot state, progress, decisions, and handoff match the implementation;
- the staged/committed scope contains no unrelated changes or sensitive artifacts;
- the verified commit is pushed to `origin/main` without force;
- local `HEAD` and fetched `origin/main` are identical and the worktree is clean;
- the final report states the commit hash, files changed, commands and results, unverified operator/hardware checks, and optional future work without calling those optional items incomplete v1 work.
```

## Invocation

From this repository root, start the goal using the contents above. The goal itself authorizes the final scoped fast-forward push; it does not authorize deployment, a release, force-push, or selecting a legal license.
