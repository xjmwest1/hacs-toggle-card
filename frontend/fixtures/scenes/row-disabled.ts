import { createInputBooleanEntity, createMockHass } from '../hass-base';
import type { ToggleRowCardConfig } from '@src/types';

const entityId = 'input_boolean.guest_mode';

export const config: ToggleRowCardConfig = {
  type: 'custom:toggle-row-card',
  rows: [
    {
      icon: 'mdi:account-multiple',
      title: 'Guest Mode',
      subtitle: 'Disable automations while guests are home',
      controls: [
        {
          type: 'toggle',
          align: 'right',
          entity: entityId,
          disables_row: true,
        },
        {
          type: 'button',
          align: 'right',
          title: 'Notify',
          icon: 'mdi:bell-outline',
          tap_action: {
            action: 'call-service',
            service: 'notify.mobile_app',
            service_data: {
              message: 'Guest mode changed',
            },
          },
        },
      ],
    },
  ],
};

export const hass = createMockHass({
  [entityId]: createInputBooleanEntity(entityId, 'off', 'Guest Mode'),
});
