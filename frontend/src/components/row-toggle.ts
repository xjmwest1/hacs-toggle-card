import { HomeAssistant } from 'custom-card-helpers';
import { LitElement, TemplateResult, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { getToggleService, isEntityOn, isEntityUnavailable } from '../helpers';
import { toggleStyles } from '../styles';
import type { RowToggleConfig } from '../types';

@customElement('row-toggle')
export class RowToggle extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public config!: RowToggleConfig;

  protected render(): TemplateResult {
    const stateObj = this.hass?.states[this.config.entity];
    const unavailable = isEntityUnavailable(stateObj);
    const isOn = stateObj ? isEntityOn(stateObj) : false;
    const toggleService = stateObj ? getToggleService(stateObj) : null;
    const label = stateObj?.attributes.friendly_name ?? this.config.entity;

    return html`
      <button
        class="toggle-switch"
        type="button"
        role="switch"
        aria-checked=${isOn ? 'true' : 'false'}
        aria-label=${`Toggle ${label}`}
        data-checked=${isOn ? 'true' : 'false'}
        ?disabled=${unavailable || !toggleService}
        @click=${this._handleToggle}
      >
        <span class="toggle-switch__thumb"></span>
      </button>
    `;
  }

  private _handleToggle(event: Event): void {
    event.stopPropagation();

    if (!this.hass) {
      return;
    }

    const stateObj = this.hass.states[this.config.entity];
    if (!stateObj) {
      return;
    }

    const toggleService = getToggleService(stateObj);
    if (!toggleService) {
      return;
    }

    void this.hass.callService(toggleService.domain, toggleService.service, {
      entity_id: this.config.entity,
    });
  }

  static styles = toggleStyles;
}

declare global {
  interface HTMLElementTagNameMap {
    'row-toggle': RowToggle;
  }
}
