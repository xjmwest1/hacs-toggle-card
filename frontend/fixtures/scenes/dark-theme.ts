import { createMockHass, createSwitchEntity } from '../hass-base';
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
  ],
};

export const hass = createMockHass({
  'switch.porch': createSwitchEntity('switch.porch', 'on', 'Porch Light'),
  'switch.garage': createSwitchEntity('switch.garage', 'off', 'Garage Light'),
});

export const darkMode = true;
