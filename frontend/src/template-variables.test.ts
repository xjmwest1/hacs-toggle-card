import { describe, expect, it } from 'vitest';
import { getRowEntitySources, getTemplateVariables } from './template-variables';
import type { ToggleRowConfig } from './types';

const baseRow: ToggleRowConfig = {
  title: 'Test',
  controls: [
    { type: 'toggle', align: 'right', entity: 'switch.garage' },
  ],
};

describe('getRowEntitySources', () => {
  it('includes the row entity before toggle entities', () => {
    expect(
      getRowEntitySources({
        ...baseRow,
        entity: 'switch.porch',
      }),
    ).toEqual(['switch.porch', 'switch.garage']);
  });

  it('deduplicates when row entity matches a toggle', () => {
    expect(
      getRowEntitySources({
        ...baseRow,
        entity: 'switch.garage',
      }),
    ).toEqual(['switch.garage']);
  });
});

describe('getTemplateVariables', () => {
  it('builds variables from the row entity', () => {
    const variables = getTemplateVariables({
      title: 'Test',
      entity: 'switch.porch',
      controls: [],
    });

    expect(variables.some((variable) => variable.token === 'switch.porch.name')).toBe(true);
  });
});
