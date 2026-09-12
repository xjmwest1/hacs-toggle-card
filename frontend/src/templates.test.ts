import { HomeAssistant } from 'custom-card-helpers';
import { describe, expect, it } from 'vitest';
import { createSwitchEntity } from '../fixtures/hass-base';
import { evaluateTemplate, parseVariableToken } from './templates';

const porch = createSwitchEntity('switch.porch', 'on', 'Porch Light');
const hass = {
  states: {
    'switch.porch': porch,
    'sensor.event': {
      entity_id: 'sensor.event',
      state: 'scheduled',
      attributes: {
        friendly_name: 'Next Event',
        start: '2026-09-12T18:30:00.000Z',
      },
      last_changed: '2026-09-12T10:15:00.000Z',
      last_updated: '2026-09-12T10:15:00.000Z',
      context: {
        id: 'mock',
        parent_id: null,
        user_id: null,
      },
    },
  },
  locale: { language: 'en-US' },
} as unknown as HomeAssistant;

describe('parseVariableToken', () => {
  it('parses qualified entity tokens', () => {
    expect(parseVariableToken('switch.porch.name')).toEqual({
      entityId: 'switch.porch',
      field: 'name',
    });
  });

  it('parses attribute tokens', () => {
    expect(parseVariableToken('switch.porch.attr.brightness')).toEqual({
      entityId: 'switch.porch',
      field: 'attr',
      attribute: 'brightness',
    });
  });

  it('parses last_changed and last_updated tokens', () => {
    expect(parseVariableToken('switch.porch.last_changed')).toEqual({
      entityId: 'switch.porch',
      field: 'last_changed',
    });
    expect(parseVariableToken('switch.porch.last_updated')).toEqual({
      entityId: 'switch.porch',
      field: 'last_updated',
    });
  });

  it('rejects shorthand tokens without an entity id', () => {
    expect(parseVariableToken('name')).toBeNull();
  });
});

describe('evaluateTemplate', () => {
  it('returns static text unchanged', () => {
    expect(evaluateTemplate('Guest Mode', hass)).toEqual({
      value: 'Guest Mode',
    });
  });

  it('interpolates static text around qualified variables', () => {
    expect(
      evaluateTemplate('{{ switch.porch.name }} ({{ switch.porch.state_label }})', hass),
    ).toEqual({
      value: 'Porch Light (On)',
    });
  });

  it('formats entity timestamps with date pipes', () => {
    const result = evaluateTemplate('Changed {{ sensor.event.last_changed | date:short }}', hass);

    expect(result.error).toBeUndefined();
    expect(result.value).toMatch(/^Changed 9\/12\/26/);
  });

  it('formats attribute values as datetimes', () => {
    const result = evaluateTemplate('Starts {{ sensor.event.attr.start | datetime:short }}', hass);

    expect(result.error).toBeUndefined();
    expect(result.value).toMatch(/^Starts 9\/12\/26/);
  });

  it('reports unknown variables', () => {
    expect(evaluateTemplate('{{ missing }}', hass)).toEqual({
      value: '',
      error: 'Unknown variable: missing',
    });
  });

  it('reports unknown format pipes', () => {
    expect(evaluateTemplate('{{ switch.porch.name | uppercase }}', hass)).toEqual({
      value: 'Porch Light',
      error: 'Unknown format: uppercase',
    });
  });
});
