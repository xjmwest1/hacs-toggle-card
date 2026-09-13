import { HomeAssistant } from 'custom-card-helpers';
import { HassEntity } from 'home-assistant-js-websocket';
import type { RowAlign, RowControlConfig, ToggleRowConfig } from './types';

export type RowIconState = 'active' | 'inactive' | 'unavailable';

const ON_STATES = new Set(['on', 'open', 'locked', 'playing', 'home', 'true']);

export function isEntityOn(stateObj: HassEntity): boolean {
  if (stateObj.state === 'unavailable' || stateObj.state === 'unknown') {
    return false;
  }

  const domain = stateObj.entity_id.split('.')[0];

  if (domain === 'lock') {
    return stateObj.state === 'locked';
  }

  if (domain === 'cover') {
    return stateObj.state === 'open' || stateObj.state === 'opening';
  }

  return ON_STATES.has(stateObj.state);
}

export function isEntityUnavailable(stateObj: HassEntity | undefined): boolean {
  return !stateObj || stateObj.state === 'unavailable' || stateObj.state === 'unknown';
}

export function getToggleService(
  stateObj: HassEntity,
): { domain: string; service: string } | null {
  const domain = stateObj.entity_id.split('.')[0];

  switch (domain) {
    case 'light':
    case 'switch':
    case 'fan':
    case 'input_boolean':
    case 'automation':
    case 'script':
    case 'siren':
      return { domain, service: 'toggle' };
    case 'cover':
      return {
        domain,
        service: stateObj.state === 'open' ? 'close_cover' : 'open_cover',
      };
    case 'lock':
      return {
        domain,
        service: stateObj.state === 'locked' ? 'unlock' : 'lock',
      };
    default:
      return null;
  }
}

export function isRowDisabled(
  controls: RowControlConfig[],
  hass: HomeAssistant,
): boolean {
  return controls.some((control) => {
    if (control.type !== 'toggle' || !control.disables_row) {
      return false;
    }

    const stateObj = hass.states[control.entity];
    return stateObj ? !isEntityOn(stateObj) : false;
  });
}

export function shouldShowIconState(config: ToggleRowConfig): boolean {
  if (!config.entity) {
    return false;
  }

  return config.icon_state ?? true;
}

export function resolveRowIcon(
  config: ToggleRowConfig,
  stateObj: HassEntity | undefined,
): string | undefined {
  if (config.icon) {
    return config.icon;
  }

  const entityIcon = stateObj?.attributes.icon;
  return typeof entityIcon === 'string' && entityIcon.length > 0 ? entityIcon : undefined;
}

export function getRowIconState(
  stateObj: HassEntity | undefined,
): RowIconState | null {
  if (!stateObj) {
    return 'unavailable';
  }

  if (isEntityUnavailable(stateObj)) {
    return 'unavailable';
  }

  return isEntityOn(stateObj) ? 'active' : 'inactive';
}

export function partitionControls(
  controls: RowControlConfig[],
): { left: RowControlConfig[]; right: RowControlConfig[] } {
  const left: RowControlConfig[] = [];
  const right: RowControlConfig[] = [];

  for (const control of controls) {
    if (control.align === 'left') {
      left.push(control);
    } else {
      right.push(control);
    }
  }

  return { left, right };
}

import { getMdiPath } from './mdi-paths';
export { getMdiPath };
