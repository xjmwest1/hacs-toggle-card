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
- **Entity** — optional row subject; drives icon fallback, state tinting, and unavailable styling
- **Icon** — static MDI icon, or falls back to the row entity's icon; optionally tinted by entity state (`icon_state`, default on)
- **Controls** — left- or right-aligned sub-components:
  - **Button** — title, icon, or both; performs any HA action
  - **Toggle** — boolean value; optionally disables all row buttons when off (`disables_row`)

## Example config

```yaml
type: custom:toggle-row-card
rows:
  - icon: mdi:lightbulb
    entity: switch.porch
    title: '{{ switch.porch.name }}'
    subtitle: '{{ switch.porch.state_label }}'
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

Use explicit entity references inside static text:

| Variable | Value |
|----------|-------|
| `{{ switch.porch.name }}` | Friendly name |
| `{{ switch.porch.state }}` | Raw state (`on`, `off`, …) |
| `{{ switch.porch.state_label }}` | Formatted state (`On`, `Off`, …) |
| `{{ switch.porch.unit }}` | Unit of measurement |
| `{{ switch.porch.entity }}` | Entity ID |
| `{{ switch.porch.attr.brightness }}` | Entity attribute |

Mix static text and variables: `Light: {{ switch.porch.name }} ({{ switch.porch.state_label }})`.

The visual editor suggests variables for toggle entities on the same row.

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
npm test
npm run smoke   # Playwright smoke against dist/hacs-toggle-card.js
```

Release tags (`v*`) run the same smoke checks in GitHub Actions via `.github/workflows/release-smoke.yml`.

### HACS default store submission

This repository is ready for manual submission to the [HACS default store](https://www.hacs.xyz/docs/publish/include/):

1. Confirm a tagged release exists with `hacs-toggle-card.js` attached.
2. Open a PR to [hacs/default](https://github.com/hacs/default) adding this repository under the **plugin** category.
3. Ensure `hacs.json`, `README.md`, and `brand/icon.png` remain valid (`node scripts/verify-hacs-package.mjs`).

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
