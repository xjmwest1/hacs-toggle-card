# Toggle Row Card

A compact Home Assistant Lovelace card that displays entities as toggle rows — ideal for switches, booleans, and other on/off controls.

> **Status:** Phase 1 scaffold — see [PLAN.md](./PLAN.md) for the full project plan, architecture, and implementation roadmap.

## Features (current)

- Single-entity toggle row with theme-aware styling
- Loading skeleton before `hass` is attached
- Vite playground for local development

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
