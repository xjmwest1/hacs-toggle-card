# Session handoff

Use this when starting a **new Cloud Agent** connected to this repository.

## Context

Phase 1 scaffold and partial Phase 2 (screenshots) are complete. The plan now defines a **reusable row component architecture**. See [PLAN.md](./PLAN.md) for full details.

### Decisions already made

- Single-component HACS repo (not a monorepo)
- UI-focused Lovelace card built from composable `toggle-row` elements
- Fast PR screenshots via **Vite playground + Playwright** (no full HA Docker per PR)
- Full HA smoke tests **release-only**
- Scaffold from [custom-cards/boilerplate-card](https://github.com/custom-cards/boilerplate-card)
- **HACS category:** Pure Lovelace plugin (no Python wrapper for now)
- **Screenshot baselines:** Artifacts-only per PR

### Row component model (2026-09-12)

Each row has:

- **Title** and **subtitle** — template strings evaluated against `hass`
- **Icon**
- **Controls** — any number of sub-components, each `align: left | right`

Sub-components (v1):

| Type | Behavior |
|------|----------|
| `button` | Title, icon, or both; runs any HA `ActionConfig` |
| `toggle` | Boolean on/off; optional `disables_row` to disable all row buttons when off |

## Suggested next task

> Implement **Phase 3 — Reusable row component**: extract `toggle-row`, add `row-button` and `row-toggle` sub-components, template evaluation for title/subtitle, and `disables_row` behavior. Refactor the card to render `rows[]`.

## Branch naming

`cursor/<descriptive-name>-83ae`
