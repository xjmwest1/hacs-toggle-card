import { createMockHass, createSwitchEntity } from '../hass-base';
import type { ToggleRowCardConfig } from '@src/types';

const entityId = 'switch.porch';

export const config: ToggleRowCardConfig = {
  type: 'custom:toggle-row-card',
  rows: [
    {
      icon: 'mdi:lightbulb',
      entity: entityId,
      title: '{{ name }}',
      subtitle: '{{ state_label }}',
      controls: [
        {
          type: 'toggle',
          align: 'right',
          entity: entityId,
        },
      ],
    },
  ],
};

export const hass = createMockHass({
  [entityId]: createSwitchEntity(entityId, 'off', 'Porch Light'),
});
