import { createMockHass, createSwitchEntity } from '../hass-base';
import type { ToggleRowCardConfig } from '@src/types';

export const config: ToggleRowCardConfig = {
  type: 'custom:toggle-row-card',
  rows: [
    {
      icon: 'mdi:lightbulb',
      entity: 'switch.porch',
      icon_state_entity: 'switch.porch',
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
      entity: 'switch.garage',
      icon_state_entity: 'switch.garage',
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
  ],
};

export const hass = createMockHass({
  'switch.porch': createSwitchEntity('switch.porch', 'on', 'Porch Light'),
  'switch.garage': createSwitchEntity('switch.garage', 'off', 'Garage Light'),
});

export const darkMode = true;
