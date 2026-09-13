# Changelog

All notable changes to this project are documented here.

## [Unreleased]

### Added

- Optional `icon_state_entity` row field — the sole source for row icon tinting (omit for no tint); auto-populated when selecting a row entity in the editor
- Optional `confirmation` checkbox on button controls to show a cancelable confirmation dialog before the tap action runs

## [0.4.0] - 2026-09-13

### Added

- Two-stage template autocomplete for title/subtitle: entity fields first, then date/datetime/relative formatting options for timestamp fields
- Expanded MDI icon path map (`@mdi/js`) for editor previews and card rendering

### Fixed

- Button icon picker no longer commits partial icon names on every keystroke (commits on selection or blur)
- Custom row icons are preserved when changing the row entity (unless the icon came from the previous entity)
- `ha-icon-picker` bridge no longer double-fires `value-changed` events

### Changed

- Title/subtitle help text simplified to “Type {{ for template suggestions.”

## [0.3.0] - 2026-09-12

### Added

- Visual editor row entity picker with auto-populated icon, title, and related control fields
- Template date, datetime, and relative formatting pipes (`| date`, `| datetime:short`, `| relative`, etc.)
- Button **Trigger scene** action with filterable scene picker (`scene.turn_on`)
- Control reordering within each row (move up/down)

### Changed

- **Add row** button moved to the bottom of the rows section
- Optional field labels now include `(optional)` consistently
- Live preview and template suggestion pills removed from the visual editor
- Row entity field appears first in each row card

## [0.2.0] - 2026-09-12

### Added

- Shared card config validation and normalization (`frontend/src/config.ts`)
- Vitest coverage for config edge cases (empty rows, invalid controls, card size)
- Release smoke script (`npm run smoke`) and `release-smoke.yml` workflow on `v*` tags
- Row entity with optional `icon_state` tinting
- Editor template autocomplete (suggestions after `{{`), filterable entity picker, and icon picker with previews

## [0.1.0] - 2026-09-12

First public release for HACS and manual install.

### Added

- Composable `toggle-row` card with templated title/subtitle and left/right controls
- `button` and `toggle` sub-components with `disables_row` support
- Visual editor with row and control repeaters
- Vite playground with Playwright screenshot scenes
- HACS packaging (`hacs.json`, brand icon, `npm run pack`, verify script)
- Vitest coverage for template evaluation, control partitioning, and row disable logic
