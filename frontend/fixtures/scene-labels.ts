export const sceneLabels: Record<string, string> = {
  'default-on': 'Switch on',
  'default-off': 'Switch off',
  loading: 'Loading',
  unavailable: 'Unavailable',
  'row-with-buttons': 'Row with buttons',
  'row-disabled': 'Row disabled',
  'row-disabled-entity-on': 'Row disabled, entity on',
  'multi-row': 'Multi-row',
  'dark-theme': 'Dark theme',
  editor: 'Visual editor',
};

export function getSceneLabel(sceneId: string): string {
  return sceneLabels[sceneId] ?? sceneId;
}
