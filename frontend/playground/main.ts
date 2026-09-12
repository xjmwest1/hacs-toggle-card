import '@src/toggle-row-card';
import '@src/toggle-row-card-editor';
import { cloneMockHass, type MockHass } from '@fixtures/hass-base';
import { getSceneLabel } from '@fixtures/scene-labels';
import type { ToggleRowCardConfig } from '@src/types';

interface SceneModule {
  config: ToggleRowCardConfig;
  hass?: MockHass;
  darkMode?: boolean;
}

const scenes: Record<string, () => Promise<SceneModule>> = {
  'default-on': async () => import('@fixtures/scenes/default-on'),
  'default-off': async () => import('@fixtures/scenes/default-off'),
  unavailable: async () => import('@fixtures/scenes/unavailable'),
  'row-with-buttons': async () => import('@fixtures/scenes/row-with-buttons'),
  'row-disabled': async () => import('@fixtures/scenes/row-disabled'),
  'multi-row': async () => import('@fixtures/scenes/multi-row'),
  'dark-theme': async () => import('@fixtures/scenes/dark-theme'),
  editor: async () => import('@fixtures/scenes/editor'),
  loading: async () => {
    const { config } = await import('@fixtures/scenes/default-on');
    return { config };
  },
};

interface PlaygroundCard {
  setConfig: (config: ToggleRowCardConfig) => void;
  hass?: MockHass;
}

interface PlaygroundEditor {
  setConfig: (config: ToggleRowCardConfig) => void;
  hass?: MockHass;
}

function applyTheme(darkMode: boolean): void {
  document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
}

function attachReactiveHass(
  element: PlaygroundCard | PlaygroundEditor,
  hass: MockHass,
): void {
  const originalCallService = hass.callService.bind(hass);

  hass.callService = async (domain, service, data) => {
    await originalCallService(domain, service, data);
    element.hass = cloneMockHass(hass);
  };

  element.hass = cloneMockHass(hass);
}

async function mountScene(sceneId: string): Promise<void> {
  const loader = scenes[sceneId] ?? scenes['default-on'];
  const scene = await loader();
  const host = document.querySelector('#card-host');
  const label = document.querySelector('#scene-label');
  const stateLabel = document.querySelector('#scene-state-label');

  if (!host) {
    throw new Error('Missing #card-host element');
  }

  applyTheme(scene.darkMode ?? sceneId === 'dark-theme');

  if (label) {
    label.textContent = `Scene: ${sceneId}`;
  }

  if (stateLabel) {
    stateLabel.textContent = getSceneLabel(sceneId);
  }

  if (sceneId === 'editor') {
    const editor = document.createElement('toggle-row-card-editor') as unknown as PlaygroundEditor &
      HTMLElement;
    editor.setConfig(scene.config);

    if (scene.hass) {
      attachReactiveHass(editor, scene.hass);
    }

    host.replaceChildren(editor);
    return;
  }

  const card = document.createElement('toggle-row-card') as unknown as PlaygroundCard &
    HTMLElement;

  card.setConfig(scene.config);

  if (scene.hass) {
    attachReactiveHass(card, scene.hass);
  }

  host.replaceChildren(card);
}

const sceneId = new URLSearchParams(window.location.search).get('scene') ?? 'default-on';
void mountScene(sceneId);
