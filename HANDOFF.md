# Session handoff

Use this when starting a **new Cloud Agent** connected to this repository.

## Context

Phase 5 (HACS packaging) is complete. See [PLAN.md](./PLAN.md) for remaining phases.

### Decisions already made

- Single-component HACS repo (not a monorepo)
- UI-focused Lovelace card built from composable `toggle-row` elements
- Fast PR screenshots via **Vite playground + Playwright** (no full HA Docker per PR)
- Full HA smoke tests **release-only**
- **HACS category:** Pure Lovelace plugin (no Python wrapper for now)
- **Screenshot baselines:** Artifacts-only per PR

### Row component model

Each row has templated title/subtitle, icon, and left/right-aligned controls:

| Type | Behavior |
|------|----------|
| `button` | Title, icon, or both; runs any HA `ActionConfig` |
| `toggle` | Boolean on/off; optional `disables_row` to disable all row buttons when off |

## Suggested next task

> Start **Phase 6 — Polish & release gate**: config edge-case Vitest, optional HA smoke workflow on `release/*` tags, HACS default store submission if desired. Manual HA install verification remains release-only.

## Branch naming

`cursor/<descriptive-name>-bbf6`
