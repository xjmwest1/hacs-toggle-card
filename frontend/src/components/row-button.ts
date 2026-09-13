import { ActionConfig, handleAction, HomeAssistant } from 'custom-card-helpers';
import { LitElement, TemplateResult, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  getButtonConfirmationMessage,
  shouldRequireButtonConfirmation,
} from '../button-confirmation';
import { getMdiPath } from '../helpers';
import { buttonStyles } from '../styles';
import type { RowButtonConfig } from '../types';

@customElement('row-button')
export class RowButton extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public config!: RowButtonConfig;

  @property({ type: Boolean }) public disabled = false;

  @state() private _confirmOpen = false;

  protected render(): TemplateResult {
    const { title, icon } = this.config;
    const iconOnly = Boolean(icon && !title);
    const ariaLabel = title ?? icon ?? 'Button';

    return html`
      <div class="row-button-host">
        <button
          class="row-button ${iconOnly ? 'row-button--icon-only' : ''}"
          type="button"
          aria-label=${ariaLabel}
          ?disabled=${this.disabled}
          @click=${this._handleClick}
        >
          ${icon
            ? html`
                <span class="row-button__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d=${getMdiPath(icon)}></path>
                  </svg>
                </span>
              `
            : nothing}
          ${title ? html`<span class="row-button__title">${title}</span>` : nothing}
        </button>
        ${this._confirmOpen ? this._renderConfirmationDialog() : nothing}
      </div>
    `;
  }

  private _renderConfirmationDialog(): TemplateResult {
    const message = getButtonConfirmationMessage(this.config);

    return html`
      <div class="confirm-overlay" @click=${this._cancelConfirmation}>
        <div
          class="confirm-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          @click=${(ev: Event) => ev.stopPropagation()}
          @keydown=${this._handleDialogKeyDown}
        >
          <div id="confirm-title" class="confirm-title">${message}</div>
          <div class="confirm-actions">
            <button type="button" class="confirm-button" @click=${this._cancelConfirmation}>
              Cancel
            </button>
            <button
              type="button"
              class="confirm-button confirm-button--primary"
              @click=${this._confirmAction}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private _handleClick(event: Event): void {
    event.stopPropagation();

    if (this.disabled || !this.hass || !this.config.tap_action) {
      return;
    }

    if (shouldRequireButtonConfirmation(this.config)) {
      this._confirmOpen = true;
      return;
    }

    this._performAction();
  }

  private _handleDialogKeyDown(ev: KeyboardEvent): void {
    if (ev.key === 'Escape') {
      ev.preventDefault();
      this._cancelConfirmation();
    }
  }

  private _cancelConfirmation(): void {
    this._confirmOpen = false;
  }

  private _confirmAction(): void {
    this._confirmOpen = false;
    this._performAction();
  }

  private _performAction(): void {
    if (!this.hass || !this.config.tap_action) {
      return;
    }

    handleAction(
      this,
      this.hass,
      this.config as { tap_action?: ActionConfig },
      'tap',
    );
  }

  static styles = buttonStyles;
}

declare global {
  interface HTMLElementTagNameMap {
    'row-button': RowButton;
  }
}
