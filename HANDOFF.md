# Session handoff

Use this when starting a **new Cloud Agent** connected to this repository.

## Context

Phase 1 scaffold is complete. See [PLAN.md](./PLAN.md) for architecture, repo layout, screenshot workflow, and phased roadmap.

### Decisions already made

- Single-component HACS repo (not a monorepo)
- UI-focused Lovelace toggle-row card
- Fast PR screenshots via **Vite playground + Playwright** (no full HA Docker per PR)
- Full HA smoke tests **release-only**
- Scaffold from [custom-cards/boilerplate-card](https://github.com/custom-cards/boilerplate-card)

### Resolved in Phase 1

1. **HACS category:** Pure Lovelace plugin (no Python integration wrapper for now)
2. **Row interactions:** Toggle only (tap/hold actions deferred)
3. **Screenshot baselines:** Artifacts-only per PR (Phase 2)

## Suggested next task

> Implement **Phase 2 — Playground + screenshots**: fixture scenes, scene router, `npm run screenshots`, and Playwright capture to `artifacts/screenshots/`.

## Branch naming

`cursor/<descriptive-name>-e697`