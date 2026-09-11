export const sceneLabels: Record<string, string> = {
  'default-on': 'Switch on',
  'default-off': 'Switch off',
  loading: 'Loading',
  unavailable: 'Unavailable',
};

export function getSceneLabel(sceneId: string): string {
  return sceneLabels[sceneId] ?? sceneId;
}
