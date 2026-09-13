import type { RowButtonConfig } from './types';

export function shouldRequireButtonConfirmation(config: RowButtonConfig): boolean {
  return Boolean(
    config.confirmation && config.tap_action && config.tap_action.action !== 'none',
  );
}

export function getButtonConfirmationMessage(config: RowButtonConfig): string {
  const title = config.title?.trim();
  if (title) {
    return `Run "${title}"?`;
  }

  return 'Run this action?';
}
