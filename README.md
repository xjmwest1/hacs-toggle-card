# Toggle Row Card

A Home Assistant Lovelace card built from reusable **row components** — each row has a templated title/subtitle, icon, and composable controls (buttons and toggles).

## Installation

### HACS (recommended)

1. Open **HACS → Frontend** (Dashboard plugins).
2. Click **Explore & Download Repositories**, search for **Toggle Row Card**, and add this repository as a custom repository if needed:
   - Repository: `https://github.com/xjmwest1/hacs-toggle-card`
   - Category: **Lovelace / Dashboard**
3. Install **Toggle Row Card** from HACS.
4. Add the Lovelace resource if HACS did not do it automatically:

```yaml
url: /hacsfiles/toggle-row-card/hacs-toggle-card.js
type: module
```

5. Add the card to your dashboard:

```yaml
type: custom:toggle-row-card
rows:
  - icon: mdi:lightbulb
    title: Porch Light
    controls:
      - type: toggle
        align: right
        entity: switch.porch
```

### Manual install

1. Download `hacs-toggle-card.js` from the [latest GitHub release](https://github.com/xjmwest1/hacs-toggle-card/releases/latest).
2. Copy it to your Home Assistant `config/www/` directory (for example `config/www/toggle-row-card/hacs-toggle-card.js`).
3. Register the resource under **Settings → Dashboards → Resources**:

```yaml
url: /local/toggle-row-card/hacs-toggle-card.js
type: module
```

4. Hard-refresh the browser (Ctrl+F5 / Cmd+Shift+R) and add `custom:toggle-row-card` to a view.

## Row model

- **Title / subtitle** — static text with `{{ variable }}` placeholders (no JavaScript)
- **Icon** — static MDI icon or entity-derived
- **Controls** — left- or right-aligned sub-components:
  - **Button** — title, icon, or both; performs any HA action
  - **Toggle** — boolean value; optionally disables all row buttons when off (`disables_row`)

## Example config

```yaml
type: custom:toggle-row-card
rows:
  - icon: mdi:lightbulb
    entity: switch.porch
    title: '{{ name }}'
    subtitle: '{{ state_label }}'
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

### Title / subtitle variables

Set `entity` on the row to use shorthand variables in title or subtitle:

| Variable | Value |
|----------|-------|
| `{{ name }}` | Friendly name |
| `{{ state }}` | Raw state (`on`, `off`, …) |
| `{{ state_label }}` | Formatted state (`On`, `Off`, …) |
| `{{ unit }}` | Unit of measurement |
| `{{ entity }}` | Entity ID |

Mix static text and variables: `Light: {{ name }} ({{ state_label }})`.

You can also reference another entity explicitly: `{{ switch.garage.state }}` or `{{ switch.garage.attr.brightness }}`.

## Development

```bash
cd frontend
npm ci
npm run dev          # playground at http://localhost:5173
npm run build        # → frontend/dist/toggle-row-card.js
npm run pack         # → ../dist/hacs-toggle-card.js (HACS bundle)
npm run screenshots  # → ../artifacts/screenshots/
```

### Verify HACS packaging

After `npm run pack`:

```bash
node scripts/verify-hacs-package.mjs
```

### Playground scenes

| Scene | URL |
|-------|-----|
| Switch on | `/?scene=default-on` |
| Switch off | `/?scene=default-off` |
| Row with buttons | `/?scene=row-with-buttons` |
| Row disabled | `/?scene=row-disabled` |
| Multi-row | `/?scene=multi-row` |
| Dark theme | `/?scene=dark-theme` |
| Visual editor | `/?scene=editor` |
| Unavailable | `/?scene=unavailable` |
| Loading | `/?scene=loading` |

## Requirements

- Home Assistant **2023.4** or newer
- HACS (for HACS install path)

## License

MIT
