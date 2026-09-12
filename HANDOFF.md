# Session handoff

Use this when starting a **new Cloud Agent** connected to this repository.

## Context

Phase 4 (visual editor + dark theme scene) is complete. See [PLAN.md](./PLAN.md) for remaining phases.

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

> Implement **Phase 5 — HACS packaging**: finalize `hacs.json`, README install docs, brand assets, first GitHub release, and manual install verification in HA. Add Vitest coverage for template eval and disable logic (Phase 4 remainder / Phase 6).

## Branch naming

`cursor/<descriptive-name>-83ae`
