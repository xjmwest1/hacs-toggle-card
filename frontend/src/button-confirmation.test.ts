import { describe, expect, it } from 'vitest';
import {
  getButtonConfirmationMessage,
  shouldRequireButtonConfirmation,
} from './button-confirmation';
import type { RowButtonConfig } from './types';

const baseButton: RowButtonConfig = {
  type: 'button',
  align: 'right',
  icon: 'mdi:play',
  tap_action: { action: 'call-service', service: 'script.example' },
};

describe('shouldRequireButtonConfirmation', () => {
  it('is false when confirmation is not enabled', () => {
    expect(shouldRequireButtonConfirmation(baseButton)).toBe(false);
  });

  it('is true when confirmation is enabled with a real action', () => {
    expect(
      shouldRequireButtonConfirmation({
        ...baseButton,
        confirmation: true,
      }),
    ).toBe(true);
  });

  it('is false when confirmation is enabled but the action is none', () => {
    expect(
      shouldRequireButtonConfirmation({
        ...baseButton,
        confirmation: true,
        tap_action: { action: 'none' },
      }),
    ).toBe(false);
  });
});

describe('getButtonConfirmationMessage', () => {
  it('uses the button title when available', () => {
    expect(
      getButtonConfirmationMessage({
        ...baseButton,
        title: 'Run scene',
      }),
    ).toBe('Run "Run scene"?');
  });

  it('falls back to a generic message without a title', () => {
    expect(getButtonConfirmationMessage(baseButton)).toBe('Run this action?');
  });
});
