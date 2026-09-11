# Cloud Agent Instructions

This repo is a UI-focused HACS Lovelace card. Read [PLAN.md](./PLAN.md) before making changes.

## Environment

- Node.js 22+ (installed in Cursor Cloud)
- No Docker required for routine UI work
- Install: `cd frontend && npm ci && npx playwright install chromium`

## After UI changes

1. `cd frontend && npm run build`
2. `npm run screenshots` — writes PNGs to `../artifacts/screenshots/`
3. Attach 2–4 key screenshots as walkthrough artifacts (default-on, multi-row, editor)
4. `npm test` — run Vitest; fix failures before finishing

## Do NOT by default

- Boot a full Home Assistant Docker instance for routine PR screenshots
- Use `computerUse` for screenshots unless playground scenes cannot cover the change

## When to use full HA

Only when changes affect:

- Real `ha-selector` / `ha-form` editor behavior in production HA
- Card picker registration
- Python config flow or custom integration wiring

## Branch naming

Use `cursor/<descriptive-name>-e697` for agent branches.