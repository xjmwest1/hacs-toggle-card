// @vitest-environment happy-dom
import { HomeAssistant } from 'custom-card-helpers';
import { afterEach, describe, expect, it } from 'vitest';
import { createMockHass, createSwitchEntity } from '../fixtures/hass-base';
import './toggle-row-card-editor';
import type { ToggleRowCardEditor } from './toggle-row-card-editor';
import type { RowButtonConfig, ToggleRowCardConfig } from './types';

const mockHass = createMockHass({
  'switch.porch': createSwitchEntity('switch.porch', 'on', 'Porch Light'),
}) as unknown as HomeAssistant;

function createConfig(): ToggleRowCardConfig {
  return {
    type: 'custom:toggle-row-card',
    rows: [
      {
        title: 'Porch Light',
        icon: 'mdi:lightbulb',
        entity: 'switch.porch',
        controls: [
          {
            type: 'button',
            align: 'left',
            icon: 'mdi:information-outline',
            tap_action: { action: 'more-info', entity: 'switch.porch' },
          },
        ],
      },
    ],
  };
}

function createEditor(config = createConfig()): ToggleRowCardEditor {
  const editor = document.createElement('toggle-row-card-editor') as ToggleRowCardEditor;
  editor.hass = mockHass;
  editor.setConfig(config);
  document.body.append(editor);
  return editor;
}

function getIconPickers(editor: ToggleRowCardEditor): HTMLElement[] {
  return Array.from(editor.shadowRoot?.querySelectorAll('editor-icon-picker') ?? []);
}

afterEach(() => {
  document.body.innerHTML = '';
});

function flushFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

describe('toggle-row-card-editor icon pickers', () => {
  it('keeps row.icon unchanged when the button icon picker commits a value', async () => {
    const editor = createEditor();
    await editor.updateComplete;

    const pickers = getIconPickers(editor);
    expect(pickers).toHaveLength(2);

    const buttonPicker = pickers[1];
    const input = buttonPicker.shadowRoot?.querySelector('input') as HTMLInputElement;
    input.focus();
    input.value = 'mdi:bell-outline';
    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    input.blur();
    await flushFrame();
    await editor.updateComplete;

    const config = (editor as unknown as { _config: ToggleRowCardConfig })._config;
    expect(config.rows[0].icon).toBe('mdi:lightbulb');
    expect((config.rows[0].controls[0] as RowButtonConfig).icon).toBe('mdi:bell-outline');
  });

  it('preserves a custom row.icon when the row entity is re-selected', async () => {
    const config = createConfig();
    config.rows[0].icon = 'mdi:power';
    const editor = createEditor(config);
    await editor.updateComplete;

    const entityPicker = editor.shadowRoot?.querySelector('editor-entity-picker');
    entityPicker!.dispatchEvent(
      new CustomEvent('value-changed', {
        detail: { value: 'switch.porch' },
        bubbles: true,
        composed: true,
      }),
    );
    await editor.updateComplete;

    const updated = (editor as unknown as { _config: ToggleRowCardConfig })._config;
    expect(updated.rows[0].icon).toBe('mdi:power');
    expect((updated.rows[0].controls[0] as RowButtonConfig).icon).toBe('mdi:information-outline');
  });
});
