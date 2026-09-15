import { HomeAssistant } from 'custom-card-helpers';
import { describe, expect, it } from 'vitest';
import {
  createInputBooleanEntity,
  createSwitchEntity,
} from '../fixtures/hass-base';
import {
  getIconStateEntityId,
  getRowIconState,
  getToggleService,
  isEntityOn,
  isEntityUnavailable,
  isRowDisabled,
  partitionControls,
  resolveRowIcon,
  shouldShowIconState,
} from './helpers';
import type { RowControlConfig, ToggleRowConfig } from './types';

const porchOn = createSwitchEntity('switch.porch', 'on', 'Porch Light');
const porchOff = createSwitchEntity('switch.porch', 'off', 'Porch Light');
const guestOn = createInputBooleanEntity('input_boolean.guest_mode', 'on', 'Guest Mode');
const guestOff = createInputBooleanEntity('input_boolean.guest_mode', 'off', 'Guest Mode');

function hassWith(...entities: ReturnType<typeof createSwitchEntity>[]): HomeAssistant {
  const states = Object.fromEntries(entities.map((entity) => [entity.entity_id, entity]));
  return { states } as unknown as HomeAssistant;
}

describe('isEntityOn', () => {
  it('treats on switches as on', () => {
    expect(isEntityOn(porchOn)).toBe(true);
  });

  it('treats off switches as off', () => {
    expect(isEntityOn(porchOff)).toBe(false);
  });

  it('treats unavailable entities as off', () => {
    expect(isEntityOn(createSwitchEntity('switch.porch', 'unavailable'))).toBe(false);
  });
});

describe('isEntityUnavailable', () => {
  it('returns false for known on entities', () => {
    expect(isEntityUnavailable(porchOn)).toBe(false);
  });

  it('returns true for missing entities', () => {
    expect(isEntityUnavailable(undefined)).toBe(true);
  });
});

describe('getToggleService', () => {
  it('returns toggle for switches', () => {
    expect(getToggleService(porchOn)).toEqual({ domain: 'switch', service: 'toggle' });
  });
});

describe('partitionControls', () => {
  it('splits controls by alignment', () => {
    const controls: RowControlConfig[] = [
      { type: 'button', align: 'left', icon: 'mdi:info' },
      { type: 'toggle', align: 'right', entity: 'switch.porch' },
      { type: 'button', align: 'right', title: 'Run' },
    ];

    expect(partitionControls(controls)).toEqual({
      left: [controls[0]],
      right: [controls[1], controls[2]],
    });
  });

  it('places right-aligned controls in the right group', () => {
    const control: RowControlConfig = {
      type: 'toggle',
      align: 'right',
      entity: 'switch.porch',
    };
    expect(partitionControls([control]).right).toEqual([control]);
  });
});

describe('getIconStateEntityId', () => {
  it('returns icon_state_entity when set', () => {
    expect(
      getIconStateEntityId({
        title: 'Test',
        entity: 'switch.porch',
        icon_state_entity: 'binary_sensor.motion',
        controls: [],
      }),
    ).toBe('binary_sensor.motion');
  });

  it('falls back to the row entity when no override is set', () => {
    expect(
      getIconStateEntityId({
        title: 'Test',
        entity: 'switch.porch',
        controls: [],
      }),
    ).toBe('switch.porch');
  });

  it('returns undefined when icon_state_entity is omitted and icon_state is false', () => {
    expect(
      getIconStateEntityId({
        title: 'Test',
        entity: 'switch.porch',
        icon_state: false,
        controls: [],
      }),
    ).toBeUndefined();
  });
});

describe('shouldShowIconState', () => {
  it('is false without a tint entity', () => {
    expect(shouldShowIconState({ title: 'Test', controls: [] })).toBe(false);
  });

  it('defaults to true when a row entity is set', () => {
    expect(
      shouldShowIconState({ title: 'Test', entity: 'switch.porch', controls: [] }),
    ).toBe(true);
  });

  it('is true when only icon_state_entity is set', () => {
    expect(
      shouldShowIconState({
        title: 'Test',
        icon_state_entity: 'binary_sensor.motion',
        controls: [],
      }),
    ).toBe(true);
  });

  it('respects icon_state: false', () => {
    expect(
      shouldShowIconState({
        title: 'Test',
        entity: 'switch.porch',
        icon_state: false,
        controls: [],
      }),
    ).toBe(false);
  });
});

describe('resolveRowIcon', () => {
  it('prefers the configured icon', () => {
    expect(
      resolveRowIcon({ title: 'Test', icon: 'mdi:power', controls: [] }, porchOn),
    ).toBe('mdi:power');
  });

  it('falls back to the entity icon attribute', () => {
    expect(
      resolveRowIcon({ title: 'Test', entity: 'switch.porch', controls: [] }, porchOn),
    ).toBe('mdi:lightbulb');
  });
});

describe('getRowIconState', () => {
  it('returns active for on entities', () => {
    expect(getRowIconState(porchOn)).toBe('active');
  });

  it('returns inactive for off entities', () => {
    expect(getRowIconState(porchOff)).toBe('inactive');
  });

  it('returns unavailable for missing entities', () => {
    expect(getRowIconState(undefined)).toBe('unavailable');
  });
});

describe('isRowDisabled', () => {
  const controls: RowControlConfig[] = [
    {
      type: 'toggle',
      align: 'right',
      entity: 'input_boolean.guest_mode',
      disables_row: true,
    },
    {
      type: 'button',
      align: 'right',
      title: 'Notify',
    },
  ];

  it('disables the row when a disables_row toggle is off', () => {
    expect(isRowDisabled(controls, hassWith(guestOff))).toBe(true);
  });

  it('keeps the row enabled when the disables_row toggle is on', () => {
    expect(isRowDisabled(controls, hassWith(guestOn))).toBe(false);
  });

  it('ignores toggles without disables_row', () => {
    const rowControls: RowControlConfig[] = [
      { type: 'toggle', align: 'right', entity: 'switch.porch' },
    ];

    expect(isRowDisabled(rowControls, hassWith(porchOff))).toBe(false);
  });
});
