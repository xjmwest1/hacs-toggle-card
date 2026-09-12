import { HomeAssistant } from 'custom-card-helpers';
import { LitElement, TemplateResult, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './row-button';
import './row-toggle';
import {
  getMdiPath,
  isRowDisabled,
  partitionControls,
} from '../helpers';
import { rowStyles } from '../styles';
import { evaluateTemplate } from '../templates';
import type { RowControlConfig, ToggleRowConfig } from '../types';

@customElement('toggle-row')
export class ToggleRow extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public config!: ToggleRowConfig;

  protected render(): TemplateResult {
    const titleResult = this.hass
      ? evaluateTemplate(this.config.title, this.hass)
      : { value: this.config.title };
    const subtitleResult =
      this.config.subtitle && this.hass
        ? evaluateTemplate(this.config.subtitle, this.hass)
        : this.config.subtitle
          ? { value: this.config.subtitle }
          : null;

    const rowDisabled = isRowDisabled(this.config.controls ?? [], this.hass);
    const { left, right } = partitionControls(this.config.controls ?? []);
    const icon = this.config.icon;

    return html`
      <div class="toggle-row ${rowDisabled ? 'toggle-row--disabled' : ''}">
        ${icon ? this._renderIcon(icon) : ''}
        <div class="row-text">
          <div class="row-title">
            ${titleResult.value}
          </div>
          ${subtitleResult?.value
            ? html`
                <div class="row-subtitle">
                  ${subtitleResult.value}
                </div>
              `
            : nothing}
        </div>
        ${left.length
          ? html`
              <div class="row-controls row-controls--left">
                ${left.map((control) => this._renderControl(control, rowDisabled))}
              </div>
            `
          : nothing}
        ${right.length
          ? html`
              <div class="row-controls row-controls--right">
                ${right.map((control) => this._renderControl(control, rowDisabled))}
              </div>
            `
          : nothing}
      </div>
      ${titleResult.error || subtitleResult?.error
        ? html`
            <div class="row-warning">
              ${titleResult.error ?? subtitleResult?.error}
            </div>
          `
        : nothing}
    `;
  }

  private _renderIcon(icon: string): TemplateResult {
    return html`
      <div class="row-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d=${getMdiPath(icon)}></path>
        </svg>
      </div>
    `;
  }

  private _renderControl(
    control: RowControlConfig,
    rowDisabled: boolean,
  ): TemplateResult {
    if (control.type === 'button') {
      if (!control.title && !control.icon) {
        return html``;
      }

      return html`
        <row-button
          .hass=${this.hass}
          .config=${control}
          ?disabled=${rowDisabled}
        ></row-button>
      `;
    }

    return html`
      <row-toggle .hass=${this.hass} .config=${control}></row-toggle>
    `;
  }

  static styles = rowStyles;
}

declare global {
  interface HTMLElementTagNameMap {
    'toggle-row': ToggleRow;
  }
}
