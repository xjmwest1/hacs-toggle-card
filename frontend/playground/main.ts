import '@src/toggle-row-card';
import type { MockHass } from '@fixtures/hass-base';
import { getSceneLabel } from '@fixtures/scene-labels';
import type { ToggleRowCardConfig } from '@src/types';

interface SceneModule {
  config: ToggleRowCardConfig;
  hass?: MockHass;
}

const scenes: Record<string, () => Promise<SceneModule>> = {
  'default-on': async () => import('@fixtures/scenes/default-on'),
  'default-off': async () => import('@fixtures/scenes/default-off'),
  unavailable: async () => import('@fixtures/scenes/unavailable'),
  loading: async () => {
    const { config } = await import('@fixtures/scenes/default-on');
    return { config };
  },
};

async function mountScene(sceneId: string): Promise<void> {
  const loader = scenes[sceneId] ?? scenes['default-on'];
  const scene = await loader();
  const host = document.querySelector('#card-host');
  const label = document.querySelector('#scene-label');
  const stateLabel = document.querySelector('#scene-state-label');

  if (!host) {
    throw new Error('Missing #card-host element');
  }

  if (label) {
    label.textContent = `Scene: ${sceneId}`;
  }

  if (stateLabel) {
    stateLabel.textContent = getSceneLabel(sceneId);
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
