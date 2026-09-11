import { createMockHass, createSwitchEntity } from '../hass-base';
import type { ToggleRowCardConfig } from '@src/types';

const entityId = 'switch.porch';

export const config: ToggleRowCardConfig = {
  type: 'custom:toggle-row-card',
  entity: entityId,
};

export const hass = createMockHass({
  [entityId]: createSwitchEntity(entityId, 'unavailable', 'Porch Light'),
});
