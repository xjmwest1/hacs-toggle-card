import { createMockHass, createSwitchEntity } from '../hass-base';
import type { ToggleRowCardConfig } from '@src/types';

const entityId = 'switch.porch';

export const config: ToggleRowCardConfig = {
  type: 'custom:toggle-row-card',
  rows: [
    {
      icon: 'mdi:lightbulb',
      title: 'Porch Light',
      subtitle: 'On',
      controls: [
        {
          type: 'button',
          align: 'left',
          icon: 'mdi:information-outline',
          tap_action: {
            action: 'more-info',
            entity: entityId,
          },
        },
        {
          type: 'toggle',
          align: 'right',
          entity: entityId,
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
        },
      ],
    },
  ],
};

export const hass = createMockHass({
  [entityId]: createSwitchEntity(entityId, 'on', 'Porch Light'),
  'input_boolean.guest_mode': createSwitchEntity(
    'input_boolean.guest_mode',
    'off',
    'Guest Mode',
  ),
});
