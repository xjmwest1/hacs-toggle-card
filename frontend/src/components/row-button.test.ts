// @vitest-environment happy-dom
import { HomeAssistant } from 'custom-card-helpers';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import './row-button';
import type { RowButton } from './row-button';
import type { RowButtonConfig } from '../types';

const handleAction = vi.fn();

vi.mock('custom-card-helpers', async () => {
  const actual = await vi.importActual<typeof import('custom-card-helpers')>('custom-card-helpers');
  return {
    ...actual,
    handleAction: (...args: unknown[]) => handleAction(...args),
  };
});

const config: RowButtonConfig = {
  type: 'button',
  align: 'right',
  title: 'Run',
  icon: 'mdi:play',
  confirmation: true,
  tap_action: { action: 'call-service', service: 'script.example' },
};

function createButton(): RowButton {
  const button = document.createElement('row-button') as RowButton;
  button.hass = { states: {} } as unknown as HomeAssistant;
  button.config = config;
  document.body.append(button);
  return button;
}

beforeEach(() => {
  handleAction.mockClear();
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('row-button confirmation', () => {
  it('shows a confirmation dialog before running the tap action', async () => {
    const button = createButton();
    await button.updateComplete;

    button.shadowRoot?.querySelector('.row-button')?.dispatchEvent(new Event('click', { bubbles: true }));
    await button.updateComplete;

    expect(handleAction).not.toHaveBeenCalled();
    expect(button.shadowRoot?.querySelector('.confirm-dialog')).not.toBeNull();
    expect(button.shadowRoot?.querySelector('.confirm-title')?.textContent).toBe('Run "Run"?');
  });

  it('runs the tap action when confirmation is accepted', async () => {
    const button = createButton();
    await button.updateComplete;

    button.shadowRoot?.querySelector('.row-button')?.dispatchEvent(new Event('click', { bubbles: true }));
    await button.updateComplete;

    button.shadowRoot
      ?.querySelector('.confirm-button--primary')
      ?.dispatchEvent(new Event('click', { bubbles: true }));
    await button.updateComplete;

    expect(handleAction).toHaveBeenCalledTimes(1);
    expect(button.shadowRoot?.querySelector('.confirm-dialog')).toBeNull();
  });

  it('does not run the tap action when confirmation is cancelled', async () => {
    const button = createButton();
    await button.updateComplete;

    button.shadowRoot?.querySelector('.row-button')?.dispatchEvent(new Event('click', { bubbles: true }));
    await button.updateComplete;

    button.shadowRoot
      ?.querySelector('.confirm-button:not(.confirm-button--primary)')
      ?.dispatchEvent(new Event('click', { bubbles: true }));
    await button.updateComplete;

    expect(handleAction).not.toHaveBeenCalled();
    expect(button.shadowRoot?.querySelector('.confirm-dialog')).toBeNull();
  });

  it('runs the tap action immediately when confirmation is disabled', async () => {
    const button = createButton();
    button.config = { ...config, confirmation: false };
    await button.updateComplete;

    button.shadowRoot?.querySelector('.row-button')?.dispatchEvent(new Event('click', { bubbles: true }));
    await button.updateComplete;

    expect(handleAction).toHaveBeenCalledTimes(1);
    expect(button.shadowRoot?.querySelector('.confirm-dialog')).toBeNull();
  });
});
