# Toggle Row Card

A Home Assistant Lovelace card built from reusable **row components** — each row has a templated title/subtitle, icon, and composable controls (buttons and toggles).

> **Status:** Reusable row component implemented — see [PLAN.md](./PLAN.md).

## Row model

- **Title / subtitle** — template strings evaluated against `hass`
- **Icon** — static MDI icon or entity-derived
- **Controls** — left- or right-aligned sub-components:
  - **Button** — title, icon, or both; performs any HA action
  - **Toggle** — boolean value; optionally disables all row buttons when off (`disables_row`)

## Example config

```yaml
type: custom:toggle-row-card
rows:
  - icon: mdi:lightbulb
    title: "[[[ return states['switch.porch'].attributes.friendly_name; ]]]"
    subtitle: "[[[ return states['switch.porch'].state === 'on' ? 'On' : 'Off'; ]]]"
    controls:
      - type: button
        align: left
        icon: mdi:information-outline
        tap_action:
          action: more-info
          entity: switch.porch
      - type: toggle
        align: right
        entity: switch.porch
```

## Development

```bash
cd frontend
npm ci
npm run dev          # playground at http://localhost:5173
npm run build        # → frontend/dist/toggle-row-card.js
npm run screenshots  # → ../artifacts/screenshots/
```

### Playground scenes

| Scene | URL |
|-------|-----|
| Switch on | `/?scene=default-on` |
| Switch off | `/?scene=default-off` |
| Row with buttons | `/?scene=row-with-buttons` |
| Row disabled | `/?scene=row-disabled` |
| Unavailable | `/?scene=unavailable` |
| Loading | `/?scene=loading` |

## License

TBD
