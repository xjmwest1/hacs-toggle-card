import { HassEntity } from 'home-assistant-js-websocket';

export interface MockHass {
  states: Record<string, HassEntity>;
  themes: { darkMode: boolean; themes: Record<string, unknown> };
  locale: { language: string };
  callService(
    domain: string,
    service: string,
    data?: Record<string, unknown>,
  ): Promise<void>;
}

export function createSwitchEntity(
  entityId: string,
  state: 'on' | 'off' | 'unavailable' | 'unknown',
  friendlyName?: string,
): HassEntity {
  return {
    entity_id: entityId,
    state,
    attributes: {
      friendly_name: friendlyName ?? entityId,
      icon: 'mdi:lightbulb',
    },
    last_changed: '2026-09-11T12:00:00.000Z',
    last_updated: '2026-09-11T12:00:00.000Z',
    context: {
      id: 'mock',
      parent_id: null,
      user_id: null,
    },
  };
}

export function createMockHass(
  entities: Record<string, HassEntity>,
  onCallService?: (
    domain: string,
    service: string,
    data?: Record<string, unknown>,
  ) => void,
): MockHass {
  const states = { ...entities };

  return {
    states,
    themes: { darkMode: false, themes: {} },
    locale: { language: 'en' },
    async callService(domain, service, data) {
      onCallService?.(domain, service, data);

      const entityId = data?.entity_id as string | undefined;
      if (!entityId || !states[entityId]) {
        return;
      }

      const current = states[entityId];
      if (service === 'toggle') {
        states[entityId] = {
          ...current,
          state: current.state === 'on' ? 'off' : 'on',
          last_updated: new Date().toISOString(),
        };
      }
    },
  };
}
