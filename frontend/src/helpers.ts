import { HassEntity } from 'home-assistant-js-websocket';
import { computeName } from 'custom-card-helpers';

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

export function getRowLabel(
  stateObj: HassEntity | undefined,
  entityId: string,
  overrideName?: string,
): string {
  if (overrideName) {
    return overrideName;
  }

  if (stateObj) {
    return computeName(stateObj);
  }

  return entityId;
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
