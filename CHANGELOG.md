# Changelog

All notable changes to this project are documented here.

## [Unreleased]

## [0.2.0] - 2026-09-12

### Added

- Shared card config validation and normalization (`frontend/src/config.ts`)
- Vitest coverage for config edge cases (empty rows, invalid controls, card size)
- Release smoke script (`npm run smoke`) and `release-smoke.yml` workflow on `v*` tags
- Row entity with optional `icon_state` tinting

## [0.1.0] - 2026-09-12

First public release for HACS and manual install.

### Added

- Composable `toggle-row` card with templated title/subtitle and left/right controls
- `button` and `toggle` sub-components with `disables_row` support
- Visual editor with row and control repeaters
- Vite playground with Playwright screenshot scenes
- HACS packaging (`hacs.json`, brand icon, `npm run pack`, verify script)
- Vitest coverage for template evaluation, control partitioning, and row disable logic
