import {
  createInputBooleanEntity,
  createMockHass,
  createSwitchEntity,
} from '../hass-base';
import type { ToggleRowCardConfig } from '@src/types';

export const config: ToggleRowCardConfig = {
  type: 'custom:toggle-row-card',
  rows: [
    {
      icon: 'mdi:lightbulb',
      title: 'Porch Light',
      subtitle: 'On',
      controls: [
        {
          type: 'toggle',
          align: 'right',
          entity: 'switch.porch',
        },
      ],
    },
    {
      icon: 'mdi:lightbulb-outline',
      title: 'Garage Light',
      subtitle: 'Off',
      controls: [
        {
          type: 'toggle',
          align: 'right',
          entity: 'switch.garage',
        },
      ],
    },
    {
      icon: 'mdi:account-multiple',
      title: 'Guest Mode',
      subtitle: 'Off',
      controls: [
        {
          type: 'toggle',
          align: 'right',
          entity: 'input_boolean.guest_mode',
          disables_row: true,
        },
        {
          type: 'button',
          align: 'right',
          icon: 'mdi:bell-outline',
          tap_action: {
            action: 'call-service',
            service: 'script.notify_guests',
          },
        },
      ],
    },
  ],
};

export const hass = createMockHass({
  'switch.porch': createSwitchEntity('switch.porch', 'on', 'Porch Light'),
  'switch.garage': createSwitchEntity('switch.garage', 'off', 'Garage Light'),
  'input_boolean.guest_mode': createInputBooleanEntity(
    'input_boolean.guest_mode',
    'off',
    'Guest Mode',
  ),
});
