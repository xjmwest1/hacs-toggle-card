export const sceneLabels: Record<string, string> = {
  'default-on': 'Switch on',
  'default-off': 'Switch off',
  loading: 'Loading',
  unavailable: 'Unavailable',
  'row-with-buttons': 'Row with buttons',
  'row-disabled': 'Row disabled',
};

export function getSceneLabel(sceneId: string): string {
  return sceneLabels[sceneId] ?? sceneId;
}
