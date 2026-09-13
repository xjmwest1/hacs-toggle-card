import { describe, expect, it } from 'vitest';
import {
  applyTemplateFormatSuggestion,
  applyTemplateVariableSuggestion,
  filterTemplateFormatOptions,
  filterTemplateVariables,
  getTemplateAutocompleteContext,
} from './template-autocomplete';
import { getTemplateFormatOptions } from '../template-variables';

const variables = [
  {
    token: 'switch.porch.name',
    label: 'switch.porch name',
    description: 'Entity friendly name',
  },
  {
    token: 'switch.porch.state',
    label: 'switch.porch state',
    description: 'Raw entity state',
  },
  {
    token: 'switch.porch.last_changed',
    label: 'switch.porch last changed',
    description: 'Entity last changed timestamp',
  },
];

describe('getTemplateAutocompleteContext', () => {
  it('is inactive before the user types {{', () => {
    expect(getTemplateAutocompleteContext('Porch Light', 11)).toEqual({
      active: false,
      mode: 'variable',
      filter: '',
      replaceStart: 0,
    });
  });

  it('activates after the user types {{', () => {
    expect(getTemplateAutocompleteContext('Light: {{', 9)).toEqual({
      active: true,
      mode: 'variable',
      filter: '',
      replaceStart: 7,
    });
  });

  it('filters based on text after {{', () => {
    expect(getTemplateAutocompleteContext('{{ switch.por', 13)).toEqual({
      active: true,
      mode: 'variable',
      filter: 'switch.por',
      replaceStart: 0,
    });
  });

  it('deactivates after a completed variable', () => {
    expect(getTemplateAutocompleteContext('{{ switch.porch.name }}', 24)).toEqual({
      active: false,
      mode: 'variable',
      filter: '',
      replaceStart: 0,
    });
  });

  it('enters format mode after a pipe inside an open template', () => {
    expect(getTemplateAutocompleteContext('{{ switch.porch.last_changed | dat', 35)).toEqual({
      active: true,
      mode: 'format',
      filter: 'dat',
      replaceStart: 0,
      token: 'switch.porch.last_changed',
    });
  });
});

describe('filterTemplateVariables', () => {
  it('returns all variables when filter is empty', () => {
    expect(filterTemplateVariables(variables, '')).toHaveLength(3);
  });

  it('filters by token and label', () => {
    expect(filterTemplateVariables(variables, 'state')).toEqual([variables[1]]);
  });
});

describe('filterTemplateFormatOptions', () => {
  it('returns all format options when filter is empty', () => {
    expect(filterTemplateFormatOptions(getTemplateFormatOptions(), '')).toHaveLength(6);
  });

  it('filters by format and label', () => {
    const matches = filterTemplateFormatOptions(getTemplateFormatOptions(), 'relative');
    expect(matches).toHaveLength(2);
    expect(matches.every((option) => option.format.startsWith('relative'))).toBe(true);
  });
});

describe('applyTemplateVariableSuggestion', () => {
  it('replaces the open template token with a full snippet', () => {
    const context = getTemplateAutocompleteContext('Title: {{', 9);
    const result = applyTemplateVariableSuggestion(
      'Title: {{',
      9,
      'switch.porch.name',
      context,
      false,
    );

    expect(result).toEqual({
      value: 'Title: {{ switch.porch.name }}',
      cursor: 'Title: {{ switch.porch.name }}'.length,
      openFormatSuggestions: false,
    });
  });

  it('opens format suggestions for formattable tokens', () => {
    const context = getTemplateAutocompleteContext('Title: {{', 9);
    const result = applyTemplateVariableSuggestion(
      'Title: {{',
      9,
      'switch.porch.last_changed',
      context,
      true,
    );

    expect(result).toEqual({
      value: 'Title: {{ switch.porch.last_changed | ',
      cursor: 'Title: {{ switch.porch.last_changed | '.length,
      openFormatSuggestions: true,
    });
  });
});

describe('applyTemplateFormatSuggestion', () => {
  it('replaces the open template token with a formatted snippet', () => {
    const partial = 'Title: {{ switch.porch.last_changed | ';
    const context = getTemplateAutocompleteContext(partial, partial.length);
    const result = applyTemplateFormatSuggestion(
      partial,
      partial.length,
      'switch.porch.last_changed',
      'date',
      context,
    );

    expect(result).toEqual({
      value: 'Title: {{ switch.porch.last_changed | date }}',
      cursor: 'Title: {{ switch.porch.last_changed | date }}'.length,
    });
  });
});
