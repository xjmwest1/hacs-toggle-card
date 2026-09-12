import { HomeAssistant } from 'custom-card-helpers';
import { describe, expect, it } from 'vitest';
import {
  createInputBooleanEntity,
  createSwitchEntity,
} from '../fixtures/hass-base';
import {
  getToggleService,
  isEntityOn,
  isEntityUnavailable,
  isRowDisabled,
  partitionControls,
} from './helpers';
import type { RowControlConfig } from './types';

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
