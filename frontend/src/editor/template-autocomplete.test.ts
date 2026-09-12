import { describe, expect, it } from 'vitest';
import {
  applyTemplateSuggestion,
  filterTemplateVariables,
  getTemplateAutocompleteContext,
} from './template-autocomplete';

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
];

describe('getTemplateAutocompleteContext', () => {
  it('is inactive before the user types {{', () => {
    expect(getTemplateAutocompleteContext('Porch Light', 11)).toEqual({
      active: false,
      filter: '',
      replaceStart: 0,
    });
  });

  it('activates after the user types {{', () => {
    expect(getTemplateAutocompleteContext('Light: {{', 9)).toEqual({
      active: true,
      filter: '',
      replaceStart: 7,
    });
  });

  it('filters based on text after {{', () => {
    expect(getTemplateAutocompleteContext('{{ switch.por', 13)).toEqual({
      active: true,
      filter: 'switch.por',
      replaceStart: 0,
    });
  });

  it('deactivates after a completed variable', () => {
    expect(getTemplateAutocompleteContext('{{ switch.porch.name }}', 24)).toEqual({
      active: false,
      filter: '',
      replaceStart: 0,
    });
  });
});

describe('filterTemplateVariables', () => {
  it('returns all variables when filter is empty', () => {
    expect(filterTemplateVariables(variables, '')).toHaveLength(2);
  });

  it('filters by token and label', () => {
    expect(filterTemplateVariables(variables, 'state')).toEqual([variables[1]]);
  });
});

describe('applyTemplateSuggestion', () => {
  it('replaces the open template token with a full snippet', () => {
    const context = getTemplateAutocompleteContext('Title: {{', 9);
    const result = applyTemplateSuggestion('Title: {{', 9, 'switch.porch.name', context);

    expect(result).toEqual({
      value: 'Title: {{ switch.porch.name }}',
      cursor: 'Title: {{ switch.porch.name }}'.length,
    });
  });
});
