import { describe, expect, it } from 'vitest';
import {
  ConfigValidationError,
  getCardSize,
  normalizeCardConfig,
  validateCardConfig,
  validateRowConfig,
} from './config';
import type { ToggleRowCardConfig } from './types';

const validConfig: ToggleRowCardConfig = {
  type: 'custom:toggle-row-card',
  rows: [
    {
      title: 'Porch Light',
      entity: 'switch.porch',
      controls: [
        {
          type: 'button',
          align: 'left',
          icon: 'mdi:information-outline',
        },
        {
          type: 'toggle',
          align: 'right',
          entity: 'switch.porch',
        },
      ],
    },
  ],
};

describe('validateCardConfig', () => {
  it('accepts a valid multi-row config', () => {
    const config: ToggleRowCardConfig = {
      type: 'custom:toggle-row-card',
      rows: [
        {
          title: 'Row one',
          controls: [{ type: 'toggle', align: 'right', entity: 'switch.one' }],
        },
        {
          title: 'Row two',
          controls: [{ type: 'button', align: 'left', title: 'Run' }],
        },
      ],
    };

    expect(validateCardConfig(config)).toBe(config);
  });

  it('rejects missing config', () => {
    expect(() => validateCardConfig(undefined)).toThrow(ConfigValidationError);
    expect(() => validateCardConfig(undefined)).toThrow('at least one row');
  });

  it('rejects an empty rows array', () => {
    expect(() =>
      validateCardConfig({ type: 'custom:toggle-row-card', rows: [] }),
    ).toThrow('at least one row');
  });

  it('rejects rows without a title', () => {
    expect(() =>
      validateCardConfig({
        type: 'custom:toggle-row-card',
        rows: [{ title: '', controls: [] }],
      }),
    ).toThrow('Each row must have a title');
  });

  it('rejects whitespace-only titles', () => {
    expect(() =>
      validateCardConfig({
        type: 'custom:toggle-row-card',
        rows: [{ title: '   ', controls: [] }],
      }),
    ).toThrow('Each row must have a title');
  });

  it('rejects toggles without an entity', () => {
    expect(() =>
      validateCardConfig({
        type: 'custom:toggle-row-card',
        rows: [
          {
            title: 'Broken',
            controls: [{ type: 'toggle', align: 'right', entity: '' }],
          },
        ],
      }),
    ).toThrow('must specify an entity');
  });

  it('rejects buttons without title or icon', () => {
    expect(() =>
      validateCardConfig({
        type: 'custom:toggle-row-card',
        rows: [
          {
            title: 'Broken',
            controls: [{ type: 'button', align: 'right' }],
          },
        ],
      }),
    ).toThrow('must include a title, icon, or both');
  });

  it('rejects unknown control types', () => {
    expect(() =>
      validateCardConfig({
        type: 'custom:toggle-row-card',
        rows: [
          {
            title: 'Broken',
            controls: [{ type: 'slider', align: 'right' } as never],
          },
        ],
      }),
    ).toThrow('Unknown control type');
  });

  it('rejects invalid align values', () => {
    expect(() =>
      validateCardConfig({
        type: 'custom:toggle-row-card',
        rows: [
          {
            title: 'Broken',
            controls: [{ type: 'toggle', align: 'center', entity: 'switch.porch' } as never],
          },
        ],
      }),
    ).toThrow('align "left" or "right"');
  });
});

describe('validateRowConfig', () => {
  it('includes the row number in nested validation errors', () => {
    expect(() =>
      validateRowConfig(
        {
          title: 'Second row',
          controls: [{ type: 'toggle', align: 'right', entity: '' }],
        },
        1,
      ),
    ).toThrow('in row 2');
  });
});

describe('normalizeCardConfig', () => {
  it('trims row titles and subtitles', () => {
    const normalized = normalizeCardConfig({
      type: 'custom:toggle-row-card',
      rows: [
        {
          title: '  Porch Light  ',
          subtitle: '  On  ',
          controls: [{ type: 'toggle', align: 'right', entity: 'switch.porch' }],
        },
      ],
    });

    expect(normalized.rows[0].title).toBe('Porch Light');
    expect(normalized.rows[0].subtitle).toBe('On');
  });

  it('trims icon_state_entity values', () => {
    const normalized = normalizeCardConfig({
      type: 'custom:toggle-row-card',
      rows: [
        {
          title: 'Porch Light',
          entity: 'switch.porch',
          icon_state_entity: '  binary_sensor.motion  ',
          controls: [{ type: 'toggle', align: 'right', entity: 'switch.porch' }],
        },
      ],
    });

    expect(normalized.rows[0].icon_state_entity).toBe('binary_sensor.motion');
  });

  it('drops false icon_state_invert values', () => {
    const normalized = normalizeCardConfig({
      type: 'custom:toggle-row-card',
      rows: [
        {
          title: 'Porch Light',
          entity: 'switch.porch',
          icon_state_invert: false,
          controls: [{ type: 'toggle', align: 'right', entity: 'switch.porch' }],
        },
      ],
    });

    expect(normalized.rows[0].icon_state_invert).toBeUndefined();
  });

  it('preserves icon_state_invert when true', () => {
    const normalized = normalizeCardConfig({
      type: 'custom:toggle-row-card',
      rows: [
        {
          title: 'Porch Light',
          entity: 'switch.porch',
          icon_state_invert: true,
          controls: [{ type: 'toggle', align: 'right', entity: 'switch.porch' }],
        },
      ],
    });

    expect(normalized.rows[0].icon_state_invert).toBe(true);
  });

  it('drops blank subtitles', () => {
    const normalized = normalizeCardConfig({
      type: 'custom:toggle-row-card',
      rows: [
        {
          title: 'Porch Light',
          subtitle: '   ',
          controls: [{ type: 'toggle', align: 'right', entity: 'switch.porch' }],
        },
      ],
    });

    expect(normalized.rows[0].subtitle).toBeUndefined();
  });

  it('clones row and control objects', () => {
    const normalized = normalizeCardConfig(validConfig);

    expect(normalized).not.toBe(validConfig);
    expect(normalized.rows[0]).not.toBe(validConfig.rows[0]);
    expect(normalized.rows[0].controls[0]).not.toBe(validConfig.rows[0].controls[0]);
  });
});

describe('getCardSize', () => {
  it('returns the row count for valid configs', () => {
    expect(getCardSize(validConfig)).toBe(1);
    expect(
      getCardSize({
        ...validConfig,
        rows: [...validConfig.rows, { title: 'Second', controls: [] }],
      }),
    ).toBe(2);
  });

  it('returns at least one when config is missing', () => {
    expect(getCardSize(undefined)).toBe(1);
    expect(getCardSize({ type: 'custom:toggle-row-card', rows: [] })).toBe(1);
  });
});
