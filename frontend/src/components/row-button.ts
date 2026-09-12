import { ActionConfig, handleAction, HomeAssistant } from 'custom-card-helpers';
import { LitElement, TemplateResult, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { getMdiPath } from '../helpers';
import { buttonStyles } from '../styles';
import type { RowButtonConfig } from '../types';

@customElement('row-button')
export class RowButton extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public config!: RowButtonConfig;

  @property({ type: Boolean }) public disabled = false;

  protected render(): TemplateResult {
    const { title, icon } = this.config;
    const iconOnly = Boolean(icon && !title);
    const ariaLabel = title ?? icon ?? 'Button';

    return html`
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
          : ''}
        ${title ? html`<span class="row-button__title">${title}</span>` : ''}
      </button>
    `;
  }

  private _handleClick(event: Event): void {
    event.stopPropagation();

    if (this.disabled || !this.hass || !this.config.tap_action) {
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
