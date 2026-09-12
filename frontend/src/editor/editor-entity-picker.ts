import { HomeAssistant } from 'custom-card-helpers';
import { css, html, LitElement, nothing, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

interface EntityOption {
  entityId: string;
  label: string;
}

function getEntityOptions(hass: HomeAssistant | undefined): EntityOption[] {
  if (!hass?.states) {
    return [];
  }

  return Object.values(hass.states)
    .map((state) => ({
      entityId: state.entity_id,
      label:
        typeof state.attributes.friendly_name === 'string' && state.attributes.friendly_name
          ? state.attributes.friendly_name
          : state.entity_id,
    }))
    .sort((left, right) => left.entityId.localeCompare(right.entityId));
}

function filterEntityOptions(options: EntityOption[], filter: string): EntityOption[] {
  const normalized = filter.trim().toLowerCase();
  if (!normalized) {
    return options;
  }

  return options.filter(
    (option) =>
      option.entityId.toLowerCase().includes(normalized) ||
      option.label.toLowerCase().includes(normalized),
  );
}

@customElement('editor-entity-picker')
export class EditorEntityPicker extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @property() public value = '';

  @property() public placeholder = 'switch.example';

  @property({ type: Boolean }) public allowCustomValue = true;

  @state() private _filter = '';

  @state() private _open = false;

  @state() private _highlightedIndex = 0;

  private get _usesHaPicker(): boolean {
    return Boolean(customElements.get('ha-entity-picker'));
  }

  private get _options(): EntityOption[] {
    return getEntityOptions(this.hass);
  }

  private get _filteredOptions(): EntityOption[] {
    const source = this._open ? this._filter : this.value;
    return filterEntityOptions(this._options, source);
  }

  protected render(): TemplateResult {
    if (this._usesHaPicker) {
      return html`
        <ha-entity-picker
          .hass=${this.hass}
          .value=${this.value}
          .allowCustomEntity=${this.allowCustomValue}
          @value-changed=${this._onHaValueChanged}
        ></ha-entity-picker>
      `;
    }

    const options = this._filteredOptions;
    const showDropdown = this._open && options.length > 0;

    return html`
      <div class="entity-picker">
        <input
          .value=${this._open ? this._filter : this.value}
          placeholder=${this.placeholder}
          autocomplete="off"
          @input=${this._onInput}
          @focus=${this._onFocus}
          @keydown=${this._onKeyDown}
          @blur=${this._onBlur}
        />
        ${showDropdown
          ? html`
              <ul class="dropdown" role="listbox">
                ${options.map((option, index) =>
                  this._renderOption(option, index === this._highlightedIndex),
                )}
              </ul>
            `
          : nothing}
      </div>
    `;
  }

  private _renderOption(option: EntityOption, highlighted: boolean): TemplateResult {
    return html`
      <li>
        <button
          type="button"
          class="option ${highlighted ? 'highlighted' : ''}"
          role="option"
          aria-selected=${highlighted}
          @mousedown=${(ev: Event) => this._selectOption(option.entityId, ev)}
        >
          <span class="option-id">${option.entityId}</span>
          ${option.label !== option.entityId
            ? html`<span class="option-label">${option.label}</span>`
            : nothing}
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

    if (!this.allowCustomValue) {
      const exactMatch = this._options.find((option) => option.entityId === value);
      if (exactMatch) {
        this._emitValueChanged(exactMatch.entityId);
      }
      return;
    }

    this._emitValueChanged(value);
  }

  private _onKeyDown(ev: KeyboardEvent): void {
    const options = this._filteredOptions;
    if (!this._open || options.length === 0) {
      return;
    }

    if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      this._highlightedIndex = (this._highlightedIndex + 1) % options.length;
      return;
    }

    if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      this._highlightedIndex = (this._highlightedIndex - 1 + options.length) % options.length;
      return;
    }

    if (ev.key === 'Enter' || ev.key === 'Tab') {
      ev.preventDefault();
      this._selectOption(options[this._highlightedIndex].entityId);
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

  private _selectOption(entityId: string, ev?: Event): void {
    ev?.preventDefault();
    this._open = false;
    this._filter = entityId;
    this._emitValueChanged(entityId);
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

    .entity-picker {
      position: relative;
    }

    input {
      width: 100%;
      box-sizing: border-box;
      padding: 8px 10px;
      border: 1px solid var(--toggle-row-divider, rgba(0, 0, 0, 0.12));
      border-radius: 4px;
      background: transparent;
      color: var(--toggle-row-primary-text, inherit);
      font: inherit;
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
      max-height: 220px;
      overflow: auto;
      border: 1px solid var(--toggle-row-divider, rgba(0, 0, 0, 0.12));
      border-radius: 6px;
      background: var(--card-background-color, #fff);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    }

    .option {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 2px;
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

    .option-id {
      font-size: 0.8125rem;
    }

    .option-label {
      font-size: 0.75rem;
      color: var(--toggle-row-secondary-text, rgba(0, 0, 0, 0.54));
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'editor-entity-picker': EditorEntityPicker;
  }
}
