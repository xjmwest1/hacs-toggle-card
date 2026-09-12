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
  it('parses row-level shorthand tokens', () => {
    expect(parseVariableToken('name', 'switch.porch')).toEqual({
      entityId: 'switch.porch',
      field: 'name',
    });
  });

  it('parses qualified entity tokens', () => {
    expect(parseVariableToken('switch.porch.state')).toEqual({
      entityId: 'switch.porch',
      field: 'state',
    });
  });

  it('parses attribute tokens', () => {
    expect(parseVariableToken('switch.porch.attr.brightness')).toEqual({
      entityId: 'switch.porch',
      field: 'attr',
      attribute: 'brightness',
    });
  });
});

describe('evaluateTemplate', () => {
  it('returns static text unchanged', () => {
    expect(evaluateTemplate('Guest Mode', hass, { entityId: 'switch.porch' })).toEqual({
      value: 'Guest Mode',
    });
  });

  it('interpolates static text around variables', () => {
    expect(
      evaluateTemplate('{{ name }} ({{ state_label }})', hass, { entityId: 'switch.porch' }),
    ).toEqual({
      value: 'Porch Light (On)',
    });
  });

  it('resolves qualified entity references', () => {
    expect(evaluateTemplate('State: {{ switch.porch.state }}', hass)).toEqual({
      value: 'State: on',
    });
  });

  it('reports unknown variables', () => {
    expect(evaluateTemplate('{{ missing }}', hass, { entityId: 'switch.porch' })).toEqual({
      value: '',
      error: 'Unknown variable: missing',
    });
  });

  it('reports missing row entity for shorthand variables', () => {
    expect(evaluateTemplate('{{ name }}', hass)).toEqual({
      value: '',
      error: 'Unknown variable: name',
    });
  });
});
