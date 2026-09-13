import { HomeAssistant } from 'custom-card-helpers';
import type { RowButtonConfig, RowControlConfig, ToggleRowConfig } from './types';

const PLACEHOLDER_ENTITY = 'switch.example';
const DEFAULT_ROW_TITLE = 'New row';
const DEFAULT_ROW_ICON = 'mdi:toggle-switch';

function getEntityIcon(hass: HomeAssistant | undefined, entityId: string): string | undefined {
  const icon = hass?.states[entityId]?.attributes?.icon;
  return typeof icon === 'string' && icon.length > 0 ? icon : undefined;
}

function shouldReplaceRowIcon(
  rowIcon: string | undefined,
  previousEntityId: string | undefined,
  hass: HomeAssistant | undefined,
): boolean {
  if (!rowIcon || rowIcon === DEFAULT_ROW_ICON) {
    return true;
  }

  if (previousEntityId) {
    const previousEntityIcon = getEntityIcon(hass, previousEntityId);
    if (previousEntityIcon && rowIcon === previousEntityIcon) {
      return true;
    }
  }

  return false;
}

function shouldReplaceTitle(title: string, previousEntityId?: string): boolean {
  if (!title || title === DEFAULT_ROW_TITLE) {
    return true;
  }

  if (previousEntityId && title === `{{ ${previousEntityId}.name }}`) {
    return true;
  }

  return false;
}

function shouldReplaceControlEntity(entity: string | undefined, previousEntityId?: string): boolean {
  if (!entity || entity === PLACEHOLDER_ENTITY) {
    return true;
  }

  return Boolean(previousEntityId && entity === previousEntityId);
}

function syncControlsForRowEntity(
  controls: RowControlConfig[],
  entityId: string,
  previousEntityId?: string,
): RowControlConfig[] {
  return controls.map((control) => {
    if (control.type === 'toggle') {
      if (!shouldReplaceControlEntity(control.entity, previousEntityId)) {
        return control;
      }

      return { ...control, entity: entityId };
    }

    if (
      control.type === 'button' &&
      control.tap_action?.action === 'more-info' &&
      'entity' in control.tap_action
    ) {
      if (!shouldReplaceControlEntity(control.tap_action.entity, previousEntityId)) {
        return control;
      }

      return {
        ...control,
        tap_action: {
          ...control.tap_action,
          entity: entityId,
        },
      } as RowButtonConfig;
    }

    return control;
  });
}

export function applyRowEntitySelection(
  row: ToggleRowConfig,
  entityId: string | undefined,
  hass: HomeAssistant | undefined,
  previousEntityId?: string,
): ToggleRowConfig {
  if (!entityId) {
    return { ...row, entity: undefined };
  }

  const patch: ToggleRowConfig = {
    ...row,
    entity: entityId,
  };

  const entityIcon = getEntityIcon(hass, entityId);
  if (entityIcon && shouldReplaceRowIcon(row.icon, previousEntityId, hass)) {
    patch.icon = entityIcon;
  }

  if (shouldReplaceTitle(row.title, previousEntityId)) {
    patch.title = `{{ ${entityId}.name }}`;
  }

  patch.controls = syncControlsForRowEntity(row.controls, entityId, previousEntityId);

  return patch;
}

export function getEntityPickerOptions(hass: HomeAssistant | undefined): string[] {
  if (!hass) {
    return [];
  }

  return Object.keys(hass.states).sort((left, right) => left.localeCompare(right));
}
