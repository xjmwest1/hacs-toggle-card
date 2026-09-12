import { HomeAssistant } from 'custom-card-helpers';
import { describe, expect, it } from 'vitest';
import { createSwitchEntity } from '../fixtures/hass-base';
import { evaluateTemplate, parseVariableToken } from './templates';

const porch = createSwitchEntity('switch.porch', 'on', 'Porch Light');
const hass = {
  states: {
    'switch.porch': porch,
  },
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

  it('reports unknown variables', () => {
    expect(evaluateTemplate('{{ missing }}', hass)).toEqual({
      value: '',
      error: 'Unknown variable: missing',
    });
  });
});
