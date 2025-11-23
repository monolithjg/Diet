<!-- Copilot / AI agent instructions tailored for contributors and automated agents -->
# Copilot Instructions — Diet app

This file gives concise, actionable guidance for AI coding agents working on this repository.

- **Big picture:** React + TypeScript app built with Vite. Feature-based layout under `src/features/` (notably `wizard` and `results`). Core business logic lives in `src/lib/` (RMR/TDEE/macros and the Contextual Guidance Engine `cge`). The app is mobile-first and optimized for lazy-loading and connection-aware behavior.

- **Build & test (essential commands):** Refer to `package.json` scripts.
  - Dev: `npm run dev` (Vite with HMR)
  - Build: `npm run build` (runs `tsc -b` then `vite build` — project references/composite build)
  - Preview: `npm run preview`
  - Unit tests: `npm run test` (Vitest)
  - Full tests (unit + e2e): `npm run test:all` (runs `npm run test` then Playwright at repo root)
  - Lint: `npm run lint`

- **Key files to inspect for context / examples:**
  - `package.json` — scripts and dev tools (Vite, Vitest, Playwright)
  - `README.md` — high-level architecture and development notes
  - `src/main.tsx` — service worker registration, web-vitals instrumentation
  - `src/routes.tsx` — lazy route loading pattern using `React.lazy` + `Suspense`
  - `src/lib/store.ts` — single Zustand store with `immer` middleware, localStorage persistence key `dietCalculatorState`, guidance debounce (`scheduleGuidanceUpdate`) and public API (`setTdee`, `setMacros`, `recalcRmr`)
  - `src/lib/cge/*` — guidance engine API (`generateContextualGuidance`, `mergeGuidance`) and rule modules

- **Patterns & conventions (do not break):**
  - Store updates use `immer`-style mutative drafts via Zustand middleware — prefer the existing `set` patterns when editing store logic.
  - Macro plan uses `carbsG` vs `carbG` mapping in helpers — follow `macroPlanToMacroOutput` conventions in `store.ts` when transforming shapes.
  - CGE (Contextual Guidance Engine) is a pure JS/TS module under `src/lib/cge`; prefer adding rule logic as new exports under `src/lib/cge/rules/` and then re-exporting from `src/lib/cge/index.ts`.
  - Routes are lazy-loaded; prefer adding feature entrypoints under `src/features/<feature>/index.tsx` to maintain chunking.

- **State & persistence notes:**
  - Local state persists to `localStorage` under `dietCalculatorState`. Changes to persisted shapes must include a migration strategy in `loadPersistedState`.
  - Guidance generation is debounced (250ms) — avoid introducing fast, synchronous loops that call `generateGuidance` repeatedly.

- **Testing & CI cues:**
  - Unit tests use Vitest and React Testing Library. Run targeted files with Vitest CLI, e.g. `npm test -- macros.test.ts`.
  - E2E tests use Playwright (see `e2e/` specs). `npm run test:all` runs unit tests then Playwright from the repo root.

- **Examples for typical agent tasks:**
  - To add a new guidance rule: create `src/lib/cge/rules/myRule.ts`, export helper from `src/lib/cge/index.ts`, and add unit tests under `src/lib/cge/__tests__/` that call `generateContextualGuidance` with a representative `CGEInput`.
  - To add a UI step: add a feature under `src/features/<step>` with `atoms/`, `molecules/`, `organisms/`, then lazy-import it in `src/routes.tsx`.

- **Avoid assumptions:**
  - Do not assume global persistence keys or shapes — check `src/lib/store.ts` for shape details.
  - Do not change lazy-loading routes without validating bundle output (`npm run build`) and runtime behavior.

- If anything here is unclear or you'd like more detail (examples of `CGEInput` shapes, store snapshots, or test-running recipes), tell me which section to expand.
