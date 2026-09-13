import { css, html, LitElement, nothing, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  formatVariableSnippet,
  getTemplateFormatOptions,
  insertTemplateVariable,
  tokenSupportsFormatting,
  type TemplateFormatOption,
  type TemplateVariable,
} from '../template-variables';
import {
  applyTemplateFormatSuggestion,
  applyTemplateVariableSuggestion,
  filterTemplateFormatOptions,
  filterTemplateVariables,
  getTemplateAutocompleteContext,
  type TemplateAutocompleteContext,
} from './template-autocomplete';

@customElement('editor-template-input')
export class EditorTemplateInput extends LitElement {
  @property() public value = '';

  @property() public placeholder = '';

  @property({ attribute: false }) public variables: TemplateVariable[] = [];

  @state() private _highlightedIndex = 0;

  @state() private _open = false;

  @state() private _context: TemplateAutocompleteContext = getTemplateAutocompleteContext('', 0);

  protected updated(changed: Map<string, unknown>): void {
    if (changed.has('value') && !this._open) {
      this._context = getTemplateAutocompleteContext(this.value, this._input?.selectionStart ?? this.value.length);
    }
  }

  private get _input(): HTMLInputElement | null {
    return this.renderRoot.querySelector('input');
  }

  private get _variableSuggestions(): TemplateVariable[] {
    if (!this._context.active || this._context.mode !== 'variable') {
      return [];
    }

    return filterTemplateVariables(this.variables, this._context.filter);
  }

  private get _formatSuggestions(): TemplateFormatOption[] {
    if (!this._context.active || this._context.mode !== 'format' || !this._context.token) {
      return [];
    }

    return filterTemplateFormatOptions(getTemplateFormatOptions(), this._context.filter);
  }

  private get _suggestionCount(): number {
    return this._context.mode === 'format'
      ? this._formatSuggestions.length
      : this._variableSuggestions.length;
  }

  protected render(): TemplateResult {
    const suggestions = this._context.mode === 'format' ? this._formatSuggestions : this._variableSuggestions;
    const showSuggestions = this._open && this._context.active && suggestions.length > 0;

    return html`
      <div class="template-input">
        <input
          .value=${this.value}
          placeholder=${this.placeholder}
          autocomplete="off"
          @input=${this._onInput}
          @focus=${this._syncContext}
          @click=${this._syncContext}
          @keydown=${this._onKeyDown}
          @blur=${this._onBlur}
        />
        ${showSuggestions
          ? html`
              <ul class="suggestions" role="listbox">
                ${this._context.mode === 'format'
                  ? suggestions.map((option, index) =>
                      this._renderFormatSuggestion(
                        option as TemplateFormatOption,
                        index === this._highlightedIndex,
                      ),
                    )
                  : suggestions.map((variable, index) =>
                      this._renderVariableSuggestion(
                        variable as TemplateVariable,
                        index === this._highlightedIndex,
                      ),
                    )}
              </ul>
            `
          : nothing}
      </div>
    `;
  }

  private _renderVariableSuggestion(variable: TemplateVariable, highlighted: boolean): TemplateResult {
    return html`
      <li>
        <button
          type="button"
          class="suggestion ${highlighted ? 'highlighted' : ''}"
          role="option"
          aria-selected=${highlighted}
          @mousedown=${(ev: Event) => this._selectVariable(variable, ev)}
        >
          <span class="suggestion-token">${formatVariableSnippet(variable.token)}</span>
          <span class="suggestion-label">${variable.label}</span>
        </button>
      </li>
    `;
  }

  private _renderFormatSuggestion(option: TemplateFormatOption, highlighted: boolean): TemplateResult {
    const token = this._context.token ?? '';

    return html`
      <li>
        <button
          type="button"
          class="suggestion ${highlighted ? 'highlighted' : ''}"
          role="option"
          aria-selected=${highlighted}
          @mousedown=${(ev: Event) => this._selectFormat(option, ev)}
        >
          <span class="suggestion-token">${formatVariableSnippet(token, option.format)}</span>
          <span class="suggestion-label">${option.label}</span>
        </button>
      </li>
    `;
  }

  private _syncContext(): void {
    const input = this._input;
    if (!input) {
      return;
    }

    this._context = getTemplateAutocompleteContext(this.value, input.selectionStart ?? this.value.length);
    this._highlightedIndex = 0;
    this._open = this._context.active;
  }

  private _onInput(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    this._context = getTemplateAutocompleteContext(input.value, input.selectionStart ?? input.value.length);
    this._highlightedIndex = 0;
    this._open = this._context.active;
    this._emitValueChanged(input.value);
  }

  private _onKeyDown(ev: KeyboardEvent): void {
    const count = this._suggestionCount;

    if (!this._open || !this._context.active || count === 0) {
      return;
    }

    if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      this._highlightedIndex = (this._highlightedIndex + 1) % count;
      return;
    }

    if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      this._highlightedIndex = (this._highlightedIndex - 1 + count) % count;
      return;
    }

    if (ev.key === 'Enter' || ev.key === 'Tab') {
      ev.preventDefault();
      if (this._context.mode === 'format') {
        this._applyFormat(this._formatSuggestions[this._highlightedIndex]);
      } else {
        this._applyVariable(this._variableSuggestions[this._highlightedIndex]);
      }
      return;
    }

    if (ev.key === 'Escape') {
      ev.preventDefault();
      this._open = false;
    }
  }

  private _onBlur(): void {
    requestAnimationFrame(() => {
      this._open = false;
    });
  }

  private _selectVariable(variable: TemplateVariable, ev: Event): void {
    ev.preventDefault();
    this._applyVariable(variable);
  }

  private _selectFormat(option: TemplateFormatOption, ev: Event): void {
    ev.preventDefault();
    this._applyFormat(option);
  }

  private _applyVariable(variable: TemplateVariable): void {
    const input = this._input;
    const cursor = input?.selectionStart ?? this.value.length;
    const { value, cursor: nextCursor, openFormatSuggestions } = applyTemplateVariableSuggestion(
      this.value,
      cursor,
      variable.token,
      this._context,
      tokenSupportsFormatting(variable.token),
    );

    this._emitValueChanged(value);

    if (input) {
      requestAnimationFrame(() => {
        input.focus();
        input.setSelectionRange(nextCursor, nextCursor);
        this._context = getTemplateAutocompleteContext(value, nextCursor);
        this._highlightedIndex = 0;
        this._open = openFormatSuggestions && this._context.active;
      });
      return;
    }

    this._open = openFormatSuggestions;
  }

  private _applyFormat(option: TemplateFormatOption): void {
    const input = this._input;
    const cursor = input?.selectionStart ?? this.value.length;
    const token = this._context.token;

    if (!token) {
      return;
    }

    const { value, cursor: nextCursor } = applyTemplateFormatSuggestion(
      this.value,
      cursor,
      token,
      option.format,
      this._context,
    );

    this._open = false;
    this._emitValueChanged(value);

    if (input) {
      requestAnimationFrame(() => {
        input.focus();
        input.setSelectionRange(nextCursor, nextCursor);
      });
    }
  }

  public insertVariable(token: string): void {
    const input = this._input;
    const { value, cursor } = insertTemplateVariable(
      this.value,
      token,
      input?.selectionStart,
      input?.selectionEnd,
    );

    this._emitValueChanged(value);

    if (input) {
      requestAnimationFrame(() => {
        input.focus();
        input.setSelectionRange(cursor, cursor);
        this._syncContext();
      });
    }
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

    .template-input {
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

    .suggestions {
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

    .suggestion {
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

    .suggestion:hover,
    .suggestion.highlighted {
      background: rgba(3, 169, 244, 0.08);
    }

    .suggestion-token {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 0.75rem;
      color: var(--toggle-row-accent, #03a9f4);
    }

    .suggestion-label {
      font-size: 0.75rem;
      color: var(--toggle-row-secondary-text, rgba(0, 0, 0, 0.54));
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'editor-template-input': EditorTemplateInput;
  }
}
