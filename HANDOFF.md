# Session handoff

Use this when starting a **new Cloud Agent** connected to this repository.

## Context

Phase 6 (polish & release gate) is complete. See [PLAN.md](./PLAN.md) for any remaining manual steps.

### Decisions already made

- Single-component HACS repo (not a monorepo)
- UI-focused Lovelace card built from composable `toggle-row` elements
- Fast PR screenshots via **Vite playground + Playwright** (no full HA Docker per PR)
- Full HA smoke tests **release-only** (manual HA install verification)
- **Release gate:** Playwright smoke against packed `dist/hacs-toggle-card.js` on `v*` tags
- **HACS category:** Pure Lovelace plugin (no Python wrapper for now)
- **Screenshot baselines:** Artifacts-only per PR

### Row component model

Each row has templated title/subtitle, icon, and left/right-aligned controls:

| Type | Behavior |
|------|----------|
| `button` | Title, icon, or both; runs any HA `ActionConfig` |
| `toggle` | Boolean on/off; optional `disables_row` to disable all row buttons when off |

## Suggested next task

> Optional follow-ups: submit to the HACS default store (manual), run manual HA install verification before a release, or add full HA Docker smoke if production `ha-selector` behavior needs automated coverage.

## Branch naming

`cursor/<descriptive-name>-19f1`
