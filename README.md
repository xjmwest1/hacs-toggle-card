# Toggle Row Card

A compact Home Assistant Lovelace card built from reusable **row components** — each row has a templated title/subtitle, icon, and composable controls (buttons and toggles).

> **Status:** Phase 1 scaffold complete; row component architecture defined in [PLAN.md](./PLAN.md).

## Planned row model

- **Title / subtitle** — template strings evaluated against `hass`
- **Icon** — static MDI or entity-derived
- **Controls** — left- or right-aligned sub-components:
  - **Button** — title, icon, or both; performs any HA action
  - **Toggle** — boolean value; optionally disables all row buttons when off

## Features (current)

- Single-entity toggle row with theme-aware styling (to be refactored into row component)
- Loading skeleton before `hass` is attached
- Vite playground with Playwright screenshot capture

## Development

```bash
cd frontend
npm ci
npm run dev          # playground at http://localhost:5173
npm run build        # → frontend/dist/toggle-row-card.js
```

### Playground scenes

| Scene | URL |
|-------|-----|
| Default (switch on) | `http://localhost:5173/?scene=default-on` |
| Loading skeleton | `http://localhost:5173/?scene=loading` |

## License

TBD
