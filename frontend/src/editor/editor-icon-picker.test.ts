// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import './editor-icon-picker';
import type { EditorIconPicker } from './editor-icon-picker';

function flushFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function createPicker(value = ''): EditorIconPicker {
  const picker = document.createElement('editor-icon-picker') as EditorIconPicker;
  picker.value = value;
  document.body.append(picker);
  return picker;
}

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('editor-icon-picker value-changed', () => {
  it('does not emit value-changed on every keystroke', async () => {
    const picker = createPicker('mdi:lightbulb');
    await picker.updateComplete;

    const events: string[] = [];
    picker.addEventListener('value-changed', (ev) => {
      events.push((ev as CustomEvent<{ value: string }>).detail.value);
    });

    const input = picker.shadowRoot?.querySelector('input') as HTMLInputElement;
    input.value = 'mdi:bell';
    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));

    await picker.updateComplete;
    expect(events).toEqual([]);
  });

  it('commits a custom icon on blur', async () => {
    const picker = createPicker('mdi:lightbulb');
    await picker.updateComplete;

    const events: string[] = [];
    picker.addEventListener('value-changed', (ev) => {
      events.push((ev as CustomEvent<{ value: string }>).detail.value);
    });

    const input = picker.shadowRoot?.querySelector('input') as HTMLInputElement;
    input.focus();
    await picker.updateComplete;

    input.value = 'mdi:bell-outline';
    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    input.blur();
    await flushFrame();
    await picker.updateComplete;

    expect(events).toEqual(['mdi:bell-outline']);
  });

  it('commits immediately when selecting from the dropdown', async () => {
    const picker = createPicker('mdi:lightbulb');
    await picker.updateComplete;

    const events: string[] = [];
    picker.addEventListener('value-changed', (ev) => {
      events.push((ev as CustomEvent<{ value: string }>).detail.value);
    });

    const input = picker.shadowRoot?.querySelector('input') as HTMLInputElement;
    input.focus();
    await picker.updateComplete;

    const option = picker.shadowRoot?.querySelector('.option') as HTMLButtonElement;
    option.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, composed: true }));
    await flushFrame();
    await picker.updateComplete;

    expect(events.length).toBe(1);
    expect(events[0]).toMatch(/^mdi:/);
  });
});

describe('editor-icon-picker sibling isolation', () => {
  it('does not deliver bubbled value-changed to a sibling picker listener', async () => {
    const container = document.createElement('div');
    const rowPicker = createPicker('mdi:lightbulb');
    const buttonPicker = createPicker('mdi:gesture-tap-button');
    container.append(rowPicker, buttonPicker);
    document.body.append(container);
    await rowPicker.updateComplete;
    await buttonPicker.updateComplete;

    const rowEvents: string[] = [];
    rowPicker.addEventListener('value-changed', (ev) => {
      rowEvents.push((ev as CustomEvent<{ value: string }>).detail.value);
    });

    const buttonEvents: string[] = [];
    buttonPicker.addEventListener('value-changed', (ev) => {
      buttonEvents.push((ev as CustomEvent<{ value: string }>).detail.value);
    });

    const input = buttonPicker.shadowRoot?.querySelector('input') as HTMLInputElement;
    input.focus();
    input.value = 'mdi:bell-outline';
    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    input.blur();
    await flushFrame();
    await buttonPicker.updateComplete;

    expect(buttonEvents).toEqual(['mdi:bell-outline']);
    expect(rowEvents).toEqual([]);
  });
});

describe('editor-icon-picker value prop sync', () => {
  it('keeps the closed input in sync when the value prop changes externally', async () => {
    const picker = createPicker('mdi:lightbulb');
    await picker.updateComplete;

    picker.value = 'mdi:power';
    await picker.updateComplete;

    const input = picker.shadowRoot?.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('mdi:power');
  });

  it('does not reset an open filter when the value prop changes externally', async () => {
    const picker = createPicker('mdi:lightbulb');
    await picker.updateComplete;

    const input = picker.shadowRoot?.querySelector('input') as HTMLInputElement;
    input.focus();
    await picker.updateComplete;

    input.value = 'mdi:bell';
    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    await picker.updateComplete;

    picker.value = 'mdi:power';
    await picker.updateComplete;

    expect(input.value).toBe('mdi:bell');
  });
});

describe('editor-icon-picker ha-icon-picker bridge', () => {
  beforeEach(() => {
    class MockHaIconPicker extends HTMLElement {
      connectedCallback(): void {
        this.addEventListener('click', () => {
          this.dispatchEvent(
            new CustomEvent('value-changed', {
              detail: { value: 'mdi:bell-outline' },
              bubbles: true,
              composed: true,
            }),
          );
        });
      }
    }

    customElements.define('ha-icon-picker', MockHaIconPicker);
  });

  it('re-emits ha-icon-picker changes once after stopping propagation', async () => {
    const parent = document.createElement('div');
    const picker = createPicker('mdi:lightbulb');
    parent.append(picker);
    document.body.append(parent);
    await picker.updateComplete;

    const hostEvents: string[] = [];
    picker.addEventListener('value-changed', (ev) => {
      hostEvents.push((ev as CustomEvent<{ value: string }>).detail.value);
    });

    const parentEvents: string[] = [];
    parent.addEventListener('value-changed', (ev) => {
      parentEvents.push((ev as CustomEvent<{ value: string }>).detail.value);
    });

    picker.shadowRoot?.querySelector('ha-icon-picker')?.dispatchEvent(new Event('click'));
    await picker.updateComplete;

    expect(hostEvents).toEqual(['mdi:bell-outline']);
    expect(parentEvents).toEqual(['mdi:bell-outline']);
  });
});
