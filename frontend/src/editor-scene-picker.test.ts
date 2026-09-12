import { HomeAssistant } from 'custom-card-helpers';
import { describe, expect, it } from 'vitest';
import {
  createSceneTapAction,
  filterScenePickerOptions,
  getButtonTapActionType,
  getSceneFromTapAction,
  getScenePickerOptions,
} from './editor-scene-picker';

const mockHass = {
  states: {
    'scene.movie_time': {
      entity_id: 'scene.movie_time',
      state: 'scening',
      attributes: { friendly_name: 'Movie Time' },
    },
    'scene.relax': {
      entity_id: 'scene.relax',
      state: 'scening',
      attributes: { friendly_name: 'Relax' },
    },
    'switch.porch': {
      entity_id: 'switch.porch',
      state: 'on',
      attributes: { friendly_name: 'Porch Light' },
    },
  },
} as unknown as HomeAssistant;

describe('getScenePickerOptions', () => {
  it('returns only scene entities sorted by friendly name', () => {
    expect(getScenePickerOptions(mockHass)).toEqual([
      { entityId: 'scene.movie_time', label: 'Movie Time' },
      { entityId: 'scene.relax', label: 'Relax' },
    ]);
  });
});

describe('getButtonTapActionType', () => {
  it('detects scene trigger actions', () => {
    expect(getButtonTapActionType(createSceneTapAction('scene.movie_time'))).toBe('trigger-scene');
  });

  it('detects generic call-service actions', () => {
    expect(
      getButtonTapActionType({
        action: 'call-service',
        service: 'script.example',
      }),
    ).toBe('call-service');
  });
});

describe('getSceneFromTapAction', () => {
  it('reads the scene entity id from service data', () => {
    expect(getSceneFromTapAction(createSceneTapAction('scene.relax'))).toBe('scene.relax');
  });
});

describe('filterScenePickerOptions', () => {
  const options = getScenePickerOptions(mockHass);

  it('filters scenes by entity id or friendly name', () => {
    expect(filterScenePickerOptions(options, 'movie')).toEqual([
      { entityId: 'scene.movie_time', label: 'Movie Time' },
    ]);
  });
});
