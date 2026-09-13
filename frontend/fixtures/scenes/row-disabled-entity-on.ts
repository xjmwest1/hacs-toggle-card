import {
  createInputBooleanEntity,
  createMockHass,
  createSwitchEntity,
} from '../hass-base';
import type { ToggleRowCardConfig } from '@src/types';

const porchEntity = 'switch.porch';
const guestModeEntity = 'input_boolean.guest_mode';

export const config: ToggleRowCardConfig = {
  type: 'custom:toggle-row-card',
  rows: [
    {
      icon: 'mdi:lightbulb',
      entity: porchEntity,
      icon_state_entity: porchEntity,
      title: 'Porch Light',
      subtitle: 'Automation paused while guest mode is off',
      controls: [
        {
          type: 'toggle',
          align: 'right',
          entity: guestModeEntity,
          disables_row: true,
        },
        {
          type: 'button',
          align: 'right',
          title: 'Run',
          icon: 'mdi:play',
          tap_action: {
            action: 'call-service',
            service: 'script.porch_scene',
          },
        },
      ],
    },
  ],
};

export const hass = createMockHass({
  [porchEntity]: createSwitchEntity(porchEntity, 'on', 'Porch Light'),
  [guestModeEntity]: createInputBooleanEntity(guestModeEntity, 'off', 'Guest Mode'),
});
