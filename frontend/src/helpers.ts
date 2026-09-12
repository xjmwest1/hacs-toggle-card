import { HassEntity } from 'home-assistant-js-websocket';
import type { RowAlign, RowControlConfig } from './types';

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

const MDI_PATHS: Record<string, string> = {
  'mdi:lightbulb':
    'M12,2A7,7 0 0,1 19,9C19,11.38 17.81,13.47 16,14.74V17A1,1 0 0,1 15,18H9A1,1 0 0,1 8,17V14.74C6.19,13.47 5,11.38 5,9A7,7 0 0,1 12,2M9,21V20H15V21A1,1 0 0,1 14,22H10A1,1 0 0,1 9,21Z',
  'mdi:account-multiple':
    'M16,13C15.71,13 12,13.17 12,15.83C12,16.5 12.32,17.5 12.67,18.43C12.77,18.67 13,18.83 13.27,18.83H14.77C15.05,18.83 15.28,18.67 15.38,18.43C15.73,17.5 16.05,16.5 16.05,15.83C16.05,13.17 12.34,13 12.05,13M20,10V7H18V10H15V12H18V15H20V12H23V10M12,5.5A2.5,2.5 0 0,1 14.5,8A2.5,2.5 0 0,1 12,10.5A2.5,2.5 0 0,1 9.5,8A2.5,2.5 0 0,1 12,5.5M5.5,8C5.5,5.85 7.35,4 9.5,4C11.15,4 12.58,5.05 13.07,6.5H9.5C7.35,6.5 5.5,8.35 5.5,10.5C5.5,12.65 7.35,14.5 9.5,14.5H13.07C12.58,15.95 11.15,17 9.5,17C7.35,17 5.5,15.15 5.5,13V8Z',
  'mdi:information-outline':
    'M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z',
  'mdi:play':
    'M8,5.14V19.14L19,12.14L8,5.14Z',
  'mdi:power':
    'M16,13V11H18V13H16M20,13V11H22V13H20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4Z',
  'mdi:bell-outline':
    'M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 18,14H6A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,19A2,2 0 0,1 17,21H7A2,2 0 0,1 5,19V18H19V19Z',
  'mdi:toggle-switch':
    'M17,7H22V17H17V19A1,1 0 0,0 18,20H20V22H16.5C15.95,22 15,21.55 15,21C15,21.55 14.05,22 13.5,22H10V2H13.5C14.05,2 15,2.45 15,3C15,2.45 15.95,2 16.5,2H20V4H18A1,1 0 0,0 17,5V7Z',
};

export function getMdiPath(icon: string): string {
  return MDI_PATHS[icon] ?? MDI_PATHS['mdi:toggle-switch'];
}
