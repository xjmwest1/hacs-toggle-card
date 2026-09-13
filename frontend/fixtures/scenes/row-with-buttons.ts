import { createMockHass, createSwitchEntity } from '../hass-base';
import type { ToggleRowCardConfig } from '@src/types';

const entityId = 'switch.porch';

export const config: ToggleRowCardConfig = {
  type: 'custom:toggle-row-card',
  rows: [
    {
      icon: 'mdi:lightbulb',
      entity: entityId,
      icon_state_entity: entityId,
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
  [entityId]: createSwitchEntity(entityId, 'on', 'Porch Light'),
});
