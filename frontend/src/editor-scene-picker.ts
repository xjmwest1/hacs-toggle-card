import { ActionConfig, HomeAssistant } from 'custom-card-helpers';

export interface ScenePickerOption {
  entityId: string;
  label: string;
}

export type ButtonTapActionType = 'none' | 'more-info' | 'call-service' | 'trigger-scene';

export function getScenePickerOptions(hass: HomeAssistant | undefined): ScenePickerOption[] {
  if (!hass) {
    return [];
  }

  return Object.entries(hass.states)
    .filter(([entityId]) => entityId.startsWith('scene.'))
    .map(([entityId, state]) => ({
      entityId,
      label:
        typeof state.attributes.friendly_name === 'string' && state.attributes.friendly_name.length > 0
          ? state.attributes.friendly_name
          : entityId,
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
}

export function getButtonTapActionType(tapAction?: ActionConfig): ButtonTapActionType {
  if (!tapAction || tapAction.action === 'none') {
    return 'none';
  }

  if (tapAction.action === 'more-info') {
    return 'more-info';
  }

  if (tapAction.action === 'call-service' && 'service' in tapAction && tapAction.service === 'scene.turn_on') {
    return 'trigger-scene';
  }

  if (tapAction.action === 'call-service') {
    return 'call-service';
  }

  return 'none';
}

export function getSceneFromTapAction(tapAction?: ActionConfig): string {
  if (tapAction?.action !== 'call-service' || !('service_data' in tapAction)) {
    return '';
  }

  const entityId = tapAction.service_data?.entity_id;
  return typeof entityId === 'string' ? entityId : '';
}

export function createSceneTapAction(sceneEntityId: string): ActionConfig {
  return {
    action: 'call-service',
    service: 'scene.turn_on',
    service_data: {
      entity_id: sceneEntityId,
    },
  };
}

export function filterScenePickerOptions(
  options: ScenePickerOption[],
  query: string,
): ScenePickerOption[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return options;
  }

  return options.filter(
    (option) =>
      option.entityId.toLowerCase().includes(normalizedQuery) ||
      option.label.toLowerCase().includes(normalizedQuery),
  );
}
