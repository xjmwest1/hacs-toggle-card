import {
  HomeAssistant,
  hasConfigOrEntityChanged,
  LovelaceCard,
  LovelaceCardEditor,
} from 'custom-card-helpers';
import { LitElement, PropertyValues, TemplateResult, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CARD_VERSION } from './const';
import { getRowLabel, getToggleService, isEntityOn } from './helpers';
import { cardStyles } from './styles';
import type { ToggleRowCardConfig } from './types';

console.info(
  `%c TOGGLE-ROW-CARD %c v${CARD_VERSION} `,
  'color: #03a9f4; font-weight: bold; background: #111',
  'color: #fff; font-weight: bold; background: #333',
);

interface WindowWithCustomCards extends Window {
  customCards?: Array<{ type: string; name: string; description: string }>;
}

const customCardsWindow = window as WindowWithCustomCards;
customCardsWindow.customCards = customCardsWindow.customCards ?? [];
customCardsWindow.customCards.push({
  type: 'toggle-row-card',
  name: 'Toggle Row Card',
  description: 'Compact toggle rows for switches, booleans, and on/off entities',
});

@customElement('toggle-row-card')
export class ToggleRowCard extends LitElement implements LovelaceCard {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    throw new Error('Visual editor is not available yet');
  }

  public static getStubConfig(): Record<string, unknown> {
    return {
      entity: 'switch.example',
    };
  }

  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private config!: ToggleRowCardConfig;

  public setConfig(config: ToggleRowCardConfig): void {
    if (!config?.entity) {
      throw new Error('You must provide an entity');
    }

    this.config = {
      ...config,
    };
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (!this.config) {
      return false;
    }

    return hasConfigOrEntityChanged(this, changedProps, false);
  }

  protected render(): TemplateResult | void {
    if (!this.config) {
      return;
    }

    if (!this.hass) {
      return this._renderSkeleton();
    }

    const stateObj = this.hass.states[this.config.entity!];
    if (!stateObj) {
      return this._showError(`Entity not found: ${this.config.entity}`);
    }

    const isUnavailable =
      stateObj.state === 'unavailable' || stateObj.state === 'unknown';
    const isOn = isEntityOn(stateObj);
    const label = getRowLabel(stateObj, this.config.entity!, this.config.name);
    const toggleService = getToggleService(stateObj);

    return html`
      <ha-card>
        <div class="card-content">
          <div class="toggle-row">
            ${this._renderIcon(stateObj)}
            <div
              class="row-label ${isUnavailable ? 'row-label--unavailable' : ''}"
            >
              ${label}
            </div>
            <button
              class="toggle-switch"
              type="button"
              role="switch"
              aria-checked=${isOn ? 'true' : 'false'}
              aria-label=${`Toggle ${label}`}
              data-checked=${isOn ? 'true' : 'false'}
              ?disabled=${isUnavailable || !toggleService}
              @click=${this._handleToggle}
            >
              <span class="toggle-switch__thumb"></span>
            </button>
          </div>
        </div>
      </ha-card>
    `;
  }

  private _renderIcon(stateObj: { attributes: { icon?: string } }): TemplateResult {
    const icon = this.config.icon ?? stateObj.attributes.icon ?? 'mdi:toggle-switch';

    return html`
      <div class="row-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d=${this._mdiPath(icon)}></path>
        </svg>
      </div>
    `;
  }

  private _mdiPath(icon: string): string {
    // Minimal stand-in for MDI paths in the playground.
    if (icon.includes('light')) {
      return 'M12,2A7,7 0 0,1 19,9C19,11.38 17.81,13.47 16,14.74V17A1,1 0 0,1 15,18H9A1,1 0 0,1 8,17V14.74C6.19,13.47 5,11.38 5,9A7,7 0 0,1 12,2M9,21V20H15V21A1,1 0 0,1 14,22H10A1,1 0 0,1 9,21Z';
    }

    return 'M17,7H22V17H17V19A1,1 0 0,0 18,20H20V22H16.5C15.95,22 15,21.55 15,21C15,21.55 14.05,22 13.5,22H10V20H12A1,1 0 0,0 13,19V5A1,1 0 0,0 12,4H10V2H13.5C14.05,2 15,2.45 15,3C15,2.45 15.95,2 16.5,2H20V4H18A1,1 0 0,0 17,5V7Z';
  }

  private _handleToggle(event: Event): void {
    event.stopPropagation();

    if (!this.hass || !this.config.entity) {
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

  private _renderSkeleton(): TemplateResult {
    return html`
      <ha-card>
        <div class="card-content skeleton-row" aria-busy="true" aria-label="Loading">
          <div class="skeleton skeleton-icon"></div>
          <div class="skeleton skeleton-label"></div>
          <div class="skeleton skeleton-switch"></div>
        </div>
      </ha-card>
    `;
  }

  private _showError(error: string): TemplateResult {
    const errorCard = document.createElement('hui-error-card') as LovelaceCard & {
      setConfig: (config: Record<string, unknown>) => void;
    };

    errorCard.setConfig({
      type: 'error',
      error,
      origConfig: this.config,
    });

    return html`${errorCard}`;
  }

  public getCardSize(): number {
    return 1;
  }

  static styles = cardStyles;
}

declare global {
  interface HTMLElementTagNameMap {
    'toggle-row-card': ToggleRowCard;
  }
}
