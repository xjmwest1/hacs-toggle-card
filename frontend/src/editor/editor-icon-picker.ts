import { css, html, LitElement, nothing, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getMdiPath } from '../helpers';
import { COMMON_EDITOR_ICONS } from './common-icons';

function filterIcons(icons: readonly string[], filter: string): string[] {
  const normalized = filter.trim().toLowerCase().replace(/^mdi:/, '');
  if (!normalized) {
    return [...icons];
  }

  return icons.filter((icon) => icon.toLowerCase().includes(normalized));
}

@customElement('editor-icon-picker')
export class EditorIconPicker extends LitElement {
  @property() public value = '';

  @property() public placeholder = 'mdi:lightbulb';

  @state() private _filter = '';

  @state() private _open = false;

  @state() private _highlightedIndex = 0;

  private get _usesHaPicker(): boolean {
    return Boolean(customElements.get('ha-icon-picker'));
  }

  private get _icons(): string[] {
    const icons: string[] = [...COMMON_EDITOR_ICONS];
    if (this.value && !icons.includes(this.value)) {
      icons.unshift(this.value);
    }
    return icons;
  }

  private get _filteredIcons(): string[] {
    const source = this._open ? this._filter : this.value;
    const filtered = filterIcons(this._icons, source);
    if (this.allowCustomValue && source.trim() && !filtered.includes(source.trim())) {
      const custom = source.trim().startsWith('mdi:') ? source.trim() : `mdi:${source.trim()}`;
      return [custom, ...filtered];
    }
    return filtered;
  }

  @property({ type: Boolean }) public allowCustomValue = true;

  protected render(): TemplateResult {
    if (this._usesHaPicker) {
      return html`
        <ha-icon-picker
          .value=${this.value}
          @value-changed=${this._onHaValueChanged}
        ></ha-icon-picker>
      `;
    }

    const icons = this._filteredIcons;
    const showDropdown = this._open && icons.length > 0;

    return html`
      <div class="icon-picker">
        <div class="input-row">
          ${this.value
            ? html`
                <span class="selected-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d=${getMdiPath(this.value)}></path>
                  </svg>
                </span>
              `
            : nothing}
          <input
            .value=${this._open ? this._filter : this.value}
            placeholder=${this.placeholder}
            autocomplete="off"
            @input=${this._onInput}
            @focus=${this._onFocus}
            @keydown=${this._onKeyDown}
            @blur=${this._onBlur}
          />
        </div>
        ${showDropdown
          ? html`
              <ul class="dropdown" role="listbox">
                ${icons.map((icon, index) => this._renderOption(icon, index === this._highlightedIndex))}
              </ul>
            `
          : nothing}
      </div>
    `;
  }

  private _renderOption(icon: string, highlighted: boolean): TemplateResult {
    return html`
      <li>
        <button
          type="button"
          class="option ${highlighted ? 'highlighted' : ''}"
          role="option"
          aria-selected=${highlighted}
          @mousedown=${(ev: Event) => this._selectIcon(icon, ev)}
        >
          <span class="option-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d=${getMdiPath(icon)}></path>
            </svg>
          </span>
          <span class="option-label">${icon}</span>
        </button>
      </li>
    `;
  }

  private _onHaValueChanged(ev: CustomEvent<{ value: string }>): void {
    this._emitValueChanged(ev.detail.value ?? '');
  }

  private _onFocus(): void {
    this._filter = this.value;
    this._highlightedIndex = 0;
    this._open = true;
  }

  private _onInput(ev: Event): void {
    const value = (ev.target as HTMLInputElement).value;
    this._filter = value;
    this._highlightedIndex = 0;
    this._open = true;

    if (this.allowCustomValue) {
      this._emitValueChanged(value);
    }
  }

  private _onKeyDown(ev: KeyboardEvent): void {
    const icons = this._filteredIcons;
    if (!this._open || icons.length === 0) {
      return;
    }

    if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      this._highlightedIndex = (this._highlightedIndex + 1) % icons.length;
      return;
    }

    if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      this._highlightedIndex = (this._highlightedIndex - 1 + icons.length) % icons.length;
      return;
    }

    if (ev.key === 'Enter' || ev.key === 'Tab') {
      ev.preventDefault();
      this._selectIcon(icons[this._highlightedIndex]);
      return;
    }

    if (ev.key === 'Escape') {
      ev.preventDefault();
      this._open = false;
      this._filter = this.value;
    }
  }

  private _onBlur(): void {
    requestAnimationFrame(() => {
      this._open = false;
      this._filter = this.value;
    });
  }

  private _selectIcon(icon: string, ev?: Event): void {
    ev?.preventDefault();
    this._open = false;
    this._filter = icon;
    this._emitValueChanged(icon);
  }

  private _emitValueChanged(value: string): void {
    this.dispatchEvent(
      new CustomEvent('value-changed', {
        detail: { value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  static styles = css`
    :host {
      display: block;
    }

    .icon-picker {
      position: relative;
    }

    .input-row {
      display: flex;
      align-items: center;
      gap: 8px;
      border: 1px solid var(--toggle-row-divider, rgba(0, 0, 0, 0.12));
      border-radius: 4px;
      padding: 0 10px;
      background: transparent;
    }

    .input-row:focus-within {
      border-color: var(--toggle-row-accent, #03a9f4);
    }

    .selected-icon,
    .option-icon {
      display: inline-flex;
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      color: var(--toggle-row-secondary-text, rgba(0, 0, 0, 0.54));
    }

    .selected-icon svg,
    .option-icon svg {
      width: 100%;
      height: 100%;
      fill: currentColor;
    }

    input {
      width: 100%;
      box-sizing: border-box;
      padding: 8px 0;
      border: none;
      background: transparent;
      color: var(--toggle-row-primary-text, inherit);
      font: inherit;
      outline: none;
    }

    .dropdown {
      position: absolute;
      z-index: 2;
      top: calc(100% + 4px);
      left: 0;
      right: 0;
      margin: 0;
      padding: 4px 0;
      list-style: none;
      max-height: 240px;
      overflow: auto;
      border: 1px solid var(--toggle-row-divider, rgba(0, 0, 0, 0.12));
      border-radius: 6px;
      background: var(--card-background-color, #fff);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    }

    .option {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 8px 12px;
      border: none;
      background: transparent;
      color: inherit;
      cursor: pointer;
      font: inherit;
      text-align: left;
    }

    .option:hover,
    .option.highlighted {
      background: rgba(3, 169, 244, 0.08);
    }

    .option-label {
      font-size: 0.8125rem;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'editor-icon-picker': EditorIconPicker;
  }
}
