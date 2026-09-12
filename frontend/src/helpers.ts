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

const MDI_FALLBACK_PATH =
  'M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z';

const MDI_PATHS: Record<string, string> = {
  'mdi:lightbulb':
    'M12,2A7,7 0 0,1 19,9C19,11.38 17.81,13.47 16,14.74V17A1,1 0 0,1 15,18H9A1,1 0 0,1 8,17V14.74C6.19,13.47 5,11.38 5,9A7,7 0 0,1 12,2M9,21V20H15V21A1,1 0 0,1 14,22H10A1,1 0 0,1 9,21Z',
  'mdi:lightbulb-outline':
    'M12,2A7,7 0 0,1 19,9C19,11.38 17.81,13.47 16,14.74V17A1,1 0 0,1 15,18H9A1,1 0 0,1 8,17V14.74C6.19,13.47 5,11.38 5,9A7,7 0 0,1 12,2M9,21V20H15V21A1,1 0 0,1 14,22H10A1,1 0 0,1 9,21M12,4A5,5 0 0,0 7,9C7,10.5 7.83,11.74 9,12.5V16H15V12.5C16.17,11.74 17,10.5 17,9A5,5 0 0,0 12,4Z',
  'mdi:account-multiple':
    'M16,13C15.71,13 12,13.17 12,15.83C12,16.5 12.32,17.5 12.67,18.43C12.77,18.67 13,18.83 13.27,18.83H14.77C15.05,18.83 15.28,18.67 15.38,18.43C15.73,17.5 16.05,16.5 16.05,15.83C16.05,13.17 12.34,13 12.05,13M20,10V7H18V10H15V12H18V15H20V12H23V10M12,5.5A2.5,2.5 0 0,1 14.5,8A2.5,2.5 0 0,1 12,10.5A2.5,2.5 0 0,1 9.5,8A2.5,2.5 0 0,1 12,5.5M5.5,8C5.5,5.85 7.35,4 9.5,4C11.15,4 12.58,5.05 13.07,6.5H9.5C7.35,6.5 5.5,8.35 5.5,10.5C5.5,12.65 7.35,14.5 9.5,14.5H13.07C12.58,15.95 11.15,17 9.5,17C7.35,17 5.5,15.15 5.5,13V8Z',
  'mdi:information-outline':
    'M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z',
  'mdi:gesture-tap-button':
    'M5,10.5C5,8 7,6 9.5,6C11.24,6 12.72,7.17 13.24,8.73L14,11H16.5C17.88,11 19,12.12 19,13.5V17H21V19H3V17H5V10.5M7,17H17V13.5C17,13.22 16.78,13 16.5,13H12.5L11.5,9.5C11.22,8.67 10.5,8 9.5,8C8.12,8 7,9.12 7,10.5V17Z',
  'mdi:play':
    'M8,5.14V19.14L19,12.14L8,5.14Z',
  'mdi:power':
    'M16,13V11H18V13H16M20,13V11H22V13H20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4Z',
  'mdi:bell-outline':
    'M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 18,14H6A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,19A2,2 0 0,1 17,21H7A2,2 0 0,1 5,19V18H19V19Z',
  'mdi:toggle-switch':
    'M17,7H22V17H17V19A1,1 0 0,0 18,20H20V22H16.5C15.95,22 15,21.55 15,21C15,21.55 14.05,22 13.5,22H10V2H13.5C14.05,2 15,2.45 15,3C15,2.45 15.95,2 16.5,2H20V4H18A1,1 0 0,0 17,5V7Z',
  'mdi:toggle-switch-off':
    'M17,7H22V17H17V19A1,1 0 0,0 18,20H20V22H16.5C15.95,22 15,21.55 15,21C15,21.55 14.05,22 13.5,22H10V2H13.5C14.05,2 15,2.45 15,3C15,2.45 15.95,2 16.5,2H20V4H18A1,1 0 0,0 17,5V7M2,12A2,2 0 0,1 4,10A2,2 0 0,1 6,12A2,2 0 0,1 4,14A2,2 0 0,1 2,12Z',
  'mdi:home':
    'M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z',
  'mdi:home-outline':
    'M12,5.69L17,10.19V18H15V12H9V18H7V10.19L12,5.69M12,3L2,12H5V20H11V14H13V20H19V12H22L12,3Z',
  'mdi:cog':
    'M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z',
  'mdi:check':
    'M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z',
  'mdi:close':
    'M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z',
};

export function getMdiPath(icon: string): string {
  return MDI_PATHS[icon] ?? MDI_FALLBACK_PATH;
}
