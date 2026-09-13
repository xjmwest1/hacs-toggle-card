import type { RowControlConfig, ToggleRowCardConfig, ToggleRowConfig } from './types';

export class ConfigValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigValidationError';
  }
}

export function validateRowConfig(row: ToggleRowConfig, rowIndex = 0): void {
  const rowLabel = rowIndex > 0 ? ` (row ${rowIndex + 1})` : '';

  if (!row.title?.trim()) {
    throw new ConfigValidationError(`Each row must have a title${rowLabel}`);
  }

  validateRowControls(row.controls ?? [], rowIndex);
}

export function validateRowControls(controls: RowControlConfig[], rowIndex = 0): void {
  const rowLabel = rowIndex > 0 ? ` in row ${rowIndex + 1}` : '';

  for (const [controlIndex, control] of controls.entries()) {
    const controlLabel = `control ${controlIndex + 1}${rowLabel}`;

    if (control.type !== 'button' && control.type !== 'toggle') {
      throw new ConfigValidationError(`Unknown control type for ${controlLabel}`);
    }

    if (control.align !== 'left' && control.align !== 'right') {
      throw new ConfigValidationError(`${controlLabel} must use align "left" or "right"`);
    }

    if (control.type === 'toggle' && !control.entity?.trim()) {
      throw new ConfigValidationError(`Toggle ${controlLabel} must specify an entity`);
    }

    if (control.type === 'button' && !control.title?.trim() && !control.icon?.trim()) {
      throw new ConfigValidationError(
        `Button ${controlLabel} must include a title, icon, or both`,
      );
    }
  }
}

export function validateCardConfig(
  config: ToggleRowCardConfig | null | undefined,
): ToggleRowCardConfig {
  if (!config?.rows?.length) {
    throw new ConfigValidationError('You must provide at least one row');
  }

  config.rows.forEach((row, index) => validateRowConfig(row, index));

  return config;
}

export function normalizeCardConfig(config: ToggleRowCardConfig): ToggleRowCardConfig {
  validateCardConfig(config);

  return {
    ...config,
    rows: config.rows.map((row) => ({
      ...row,
      title: row.title.trim(),
      subtitle: row.subtitle?.trim() || undefined,
      icon_state_entity: row.icon_state_entity?.trim() || undefined,
      controls: (row.controls ?? []).map((control) => ({ ...control })),
    })),
  };
}

export function getCardSize(config: ToggleRowCardConfig | null | undefined): number {
  const rowCount = config?.rows?.length ?? 0;
  return Math.max(1, rowCount);
}
