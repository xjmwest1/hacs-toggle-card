// @vitest-environment happy-dom
import { HomeAssistant } from 'custom-card-helpers';
import { afterEach, describe, expect, it } from 'vitest';
import {
  createInputBooleanEntity,
  createMockHass,
  createSwitchEntity,
} from '../../fixtures/hass-base';
import './toggle-row';
import type { ToggleRow } from './toggle-row';
import type { ToggleRowConfig } from '../types';

function createRow(config: ToggleRowConfig, hass: HomeAssistant): ToggleRow {
  const row = document.createElement('toggle-row') as ToggleRow;
  row.hass = hass;
  row.config = config;
  document.body.append(row);
  return row;
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('toggle-row icon tint', () => {
  it('highlights the icon when the tint entity is on', async () => {
    const entityId = 'switch.porch';
    const row = createRow(
      {
        title: 'Porch Light',
        icon: 'mdi:lightbulb',
        entity: entityId,
        icon_state_entity: entityId,
        controls: [],
      },
      createMockHass({
        [entityId]: createSwitchEntity(entityId, 'on', 'Porch Light'),
      }) as unknown as HomeAssistant,
    );
    await row.updateComplete;

    const icon = row.shadowRoot?.querySelector('.row-icon');
    expect(icon?.classList.contains('row-icon--state-tint')).toBe(true);
    expect(icon?.classList.contains('row-icon--active')).toBe(true);
    expect(icon?.classList.contains('row-icon--inactive')).toBe(false);
  });

  it('dims the icon when the tint entity is off', async () => {
    const entityId = 'switch.porch';
    const row = createRow(
      {
        title: 'Porch Light',
        icon: 'mdi:lightbulb',
        entity: entityId,
        icon_state_entity: entityId,
        controls: [],
      },
      createMockHass({
        [entityId]: createSwitchEntity(entityId, 'off', 'Porch Light'),
      }) as unknown as HomeAssistant,
    );
    await row.updateComplete;

    const icon = row.shadowRoot?.querySelector('.row-icon');
    expect(icon?.classList.contains('row-icon--state-tint')).toBe(true);
    expect(icon?.classList.contains('row-icon--inactive')).toBe(true);
    expect(icon?.classList.contains('row-icon--active')).toBe(false);
  });

  it('tints from the row entity when icon_state_entity is omitted', async () => {
    const entityId = 'input_boolean.guest_mode';
    const row = createRow(
      {
        title: 'Guest Mode',
        icon: 'mdi:account-multiple',
        entity: entityId,
        controls: [],
      },
      createMockHass({
        [entityId]: createInputBooleanEntity(entityId, 'on', 'Guest Mode'),
      }) as unknown as HomeAssistant,
    );
    await row.updateComplete;

    const icon = row.shadowRoot?.querySelector('.row-icon');
    expect(icon?.classList.contains('row-icon--state-tint')).toBe(true);
    expect(icon?.classList.contains('row-icon--active')).toBe(true);
  });

  it('does not apply tint classes when icon tint is disabled', async () => {
    const entityId = 'switch.porch';
    const row = createRow(
      {
        title: 'Porch Light',
        icon: 'mdi:lightbulb',
        entity: entityId,
        icon_state: false,
        controls: [],
      },
      createMockHass({
        [entityId]: createSwitchEntity(entityId, 'on', 'Porch Light'),
      }) as unknown as HomeAssistant,
    );
    await row.updateComplete;

    const icon = row.shadowRoot?.querySelector('.row-icon');
    expect(icon?.classList.contains('row-icon--state-tint')).toBe(false);
    expect(icon?.classList.contains('row-icon--active')).toBe(false);
  });
});
