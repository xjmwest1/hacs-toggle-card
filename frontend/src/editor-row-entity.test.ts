import { HomeAssistant } from 'custom-card-helpers';
import { describe, expect, it } from 'vitest';
import { applyRowEntitySelection, getEntityPickerOptions } from './editor-row-entity';
import type { ToggleRowConfig } from './types';

const mockHass = {
  states: {
    'switch.porch': {
      entity_id: 'switch.porch',
      state: 'on',
      attributes: {
        friendly_name: 'Porch Light',
        icon: 'mdi:lightbulb-on',
      },
    },
    'input_boolean.guest_mode': {
      entity_id: 'input_boolean.guest_mode',
      state: 'off',
      attributes: {
        friendly_name: 'Guest Mode',
        icon: 'mdi:account-multiple',
      },
    },
  },
} as unknown as HomeAssistant;

function createRow(overrides: Partial<ToggleRowConfig> = {}): ToggleRowConfig {
  return {
    title: 'New row',
    icon: 'mdi:toggle-switch',
    controls: [
      {
        type: 'toggle',
        align: 'right',
        entity: 'switch.example',
      },
      {
        type: 'button',
        align: 'left',
        icon: 'mdi:information-outline',
        tap_action: {
          action: 'more-info',
          entity: 'switch.example',
        },
      },
    ],
    ...overrides,
  };
}

describe('applyRowEntitySelection', () => {
  it('clears the row entity when no entity is selected', () => {
    const row = createRow({ entity: 'switch.porch', icon_state_entity: 'binary_sensor.motion' });

    expect(applyRowEntitySelection(row, undefined, mockHass, 'switch.porch')).toEqual({
      ...row,
      entity: undefined,
      icon_state_entity: undefined,
    });
  });

  it('populates icon, title, and related control entities from the selected entity', () => {
    const row = createRow();

    expect(applyRowEntitySelection(row, 'switch.porch', mockHass)).toEqual({
      ...row,
      entity: 'switch.porch',
      icon: 'mdi:lightbulb-on',
      title: '{{ switch.porch.name }}',
      controls: [
        {
          type: 'toggle',
          align: 'right',
          entity: 'switch.porch',
        },
        {
          type: 'button',
          align: 'left',
          icon: 'mdi:information-outline',
          tap_action: {
            action: 'more-info',
            entity: 'switch.porch',
          },
        },
      ],
    });
  });

  it('updates rows that already pointed at the previous entity', () => {
    const row = createRow({
      entity: 'switch.porch',
      title: '{{ switch.porch.name }}',
      icon: 'mdi:lightbulb-on',
      controls: [
        {
          type: 'toggle',
          align: 'right',
          entity: 'switch.porch',
        },
      ],
    });

    expect(applyRowEntitySelection(row, 'input_boolean.guest_mode', mockHass, 'switch.porch')).toEqual({
      ...row,
      entity: 'input_boolean.guest_mode',
      icon: 'mdi:account-multiple',
      title: '{{ input_boolean.guest_mode.name }}',
      controls: [
        {
          type: 'toggle',
          align: 'right',
          entity: 'input_boolean.guest_mode',
        },
      ],
    });
  });

  it('preserves a custom row icon when the entity changes', () => {
    const row = createRow({
      icon: 'mdi:power',
      controls: [
        {
          type: 'button',
          align: 'left',
          icon: 'mdi:information-outline',
          tap_action: { action: 'none' },
        },
      ],
    });

    expect(applyRowEntitySelection(row, 'switch.porch', mockHass)).toEqual({
      ...row,
      entity: 'switch.porch',
      icon: 'mdi:power',
      title: '{{ switch.porch.name }}',
      controls: row.controls,
    });
  });

  it('preserves custom titles and unrelated control entities', () => {
    const row = createRow({
      title: 'Custom title',
      controls: [
        {
          type: 'toggle',
          align: 'right',
          entity: 'switch.other',
        },
        {
          type: 'button',
          align: 'left',
          icon: 'mdi:information-outline',
          tap_action: {
            action: 'more-info',
            entity: 'switch.other',
          },
        },
      ],
    });

    expect(applyRowEntitySelection(row, 'switch.porch', mockHass)).toEqual({
      ...row,
      entity: 'switch.porch',
      icon: 'mdi:lightbulb-on',
      title: 'Custom title',
      controls: row.controls,
    });
  });
});

describe('getEntityPickerOptions', () => {
  it('returns sorted entity ids from hass', () => {
    expect(getEntityPickerOptions(mockHass)).toEqual([
      'input_boolean.guest_mode',
      'switch.porch',
    ]);
  });

  it('returns an empty list when hass is unavailable', () => {
    expect(getEntityPickerOptions(undefined)).toEqual([]);
  });
});
