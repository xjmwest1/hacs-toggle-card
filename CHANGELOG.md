# Changelog

All notable changes to this project are documented here.

## [Unreleased]

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
