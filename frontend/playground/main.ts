import '@src/toggle-row-card';
import type { MockHass } from '@fixtures/hass-base';
import type { ToggleRowCardConfig } from '@src/types';
import { config, hass } from '@fixtures/scenes/default-on';

interface SceneModule {
  config: ToggleRowCardConfig;
  hass?: MockHass;
}

const scenes: Record<string, () => Promise<SceneModule>> = {
  'default-on': async () => ({ config, hass }),
  loading: async () => ({ config }),
};

async function mountScene(sceneId: string): Promise<void> {
  const loader = scenes[sceneId] ?? scenes['default-on'];
  const scene = await loader();
  const host = document.querySelector('#card-host');
  const label = document.querySelector('#scene-label');

  if (!host) {
    throw new Error('Missing #card-host element');
  }

  if (label) {
    label.textContent = `Scene: ${sceneId}`;
  }

  const card = document.createElement('toggle-row-card');
  card.setConfig(scene.config);

  if (scene.hass) {
    card.hass = scene.hass as never;
  }

  host.replaceChildren(card);
}

const sceneId = new URLSearchParams(window.location.search).get('scene') ?? 'default-on';
void mountScene(sceneId);
