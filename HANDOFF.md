# Session handoff

Use this when starting a **new Cloud Agent** connected to this repository.

## Context

Planning is complete. Implementation has **not** started. See [PLAN.md](./PLAN.md) for architecture, repo layout, screenshot workflow, and phased roadmap.

### Decisions already made

- Single-component HACS repo (not a monorepo)
- UI-focused Lovelace toggle-row card
- Fast PR screenshots via **Vite playground + Playwright** (no full HA Docker per PR)
- Full HA smoke tests **release-only**
- Scaffold from [custom-cards/boilerplate-card](https://github.com/custom-cards/boilerplate-card)

### Open questions (resolve in Phase 1)

1. HACS category: pure Lovelace plugin vs Python integration wrapper?
2. Row interactions: toggle only, or tap/hold actions?
3. Commit screenshot baselines in repo, or artifacts-only per PR?

## Suggested first task for the new agent

> Read PLAN.md and HANDOFF.md, then implement **Phase 1 — Card scaffold**: fork boilerplate-card patterns, create `frontend/`, rename to `toggle-row-card`, and get `npm run dev` working with a single toggle-row scene.

## Branch naming

`cursor/<descriptive-name>-e697`