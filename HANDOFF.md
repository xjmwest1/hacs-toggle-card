# Session handoff

Use this when starting a **new Cloud Agent** connected to this repository.

## Context

Phase 3 (reusable row component) is complete. See [PLAN.md](./PLAN.md) for architecture and remaining phases.

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

> Implement **Phase 4 — Multi-row polish + editor**: visual editor with row/control repeaters, `getStubConfig()`, and dark theme scene. Add Vitest coverage for template eval and disable logic.

## Branch naming

`cursor/<descriptive-name>-83ae`
