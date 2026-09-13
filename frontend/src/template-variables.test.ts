import { describe, expect, it } from 'vitest';
import {
  getRowEntitySources,
  getTemplateFormatOptions,
  getTemplateVariables,
  tokenSupportsFormatting,
} from './template-variables';
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
    expect(variables.some((variable) => variable.token === 'switch.porch.last_changed')).toBe(true);
    expect(variables.some((variable) => variable.token === 'switch.porch.last_updated')).toBe(true);
  });
});

describe('getTemplateFormatOptions', () => {
  it('includes common date and relative formats', () => {
    const formats = getTemplateFormatOptions().map((option) => option.format);

    expect(formats).toContain('date');
    expect(formats).toContain('datetime:short');
    expect(formats).toContain('relative:short');
  });
});

describe('tokenSupportsFormatting', () => {
  it('supports timestamp tokens only', () => {
    expect(tokenSupportsFormatting('switch.porch.last_changed')).toBe(true);
    expect(tokenSupportsFormatting('switch.porch.last_updated')).toBe(true);
    expect(tokenSupportsFormatting('switch.porch.name')).toBe(false);
  });
});
