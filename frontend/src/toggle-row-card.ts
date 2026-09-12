import { HomeAssistant, LovelaceCard, LovelaceCardEditor } from 'custom-card-helpers';
import { LitElement, PropertyValues, TemplateResult, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import './components/toggle-row';
import { getCardSize, normalizeCardConfig } from './config';
import { CARD_VERSION } from './const';
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
  description: 'Composable rows with templated labels, buttons, and toggles',
});

@customElement('toggle-row-card')
export class ToggleRowCard extends LitElement implements LovelaceCard {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import('./toggle-row-card-editor');
    return document.createElement('toggle-row-card-editor') as LovelaceCardEditor;
  }

  public static getStubConfig(): Record<string, unknown> {
    return {
      rows: [
        {
          icon: 'mdi:lightbulb',
          entity: 'switch.porch',
          title: 'Porch Light',
          subtitle: 'On',
          controls: [
            {
              type: 'button',
              align: 'left',
              icon: 'mdi:information-outline',
              tap_action: {
                action: 'more-info',
                entity: 'switch.porch',
              },
            },
            {
              type: 'toggle',
              align: 'right',
              entity: 'switch.porch',
            },
          ],
        },
        {
          icon: 'mdi:account-multiple',
          entity: 'input_boolean.guest_mode',
          title: 'Guest Mode',
          subtitle: 'Off',
          controls: [
            {
              type: 'toggle',
              align: 'right',
              entity: 'input_boolean.guest_mode',
              disables_row: true,
            },
          ],
        },
      ],
    };
  }

  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private config!: ToggleRowCardConfig;

  public setConfig(config: ToggleRowCardConfig): void {
    this.config = normalizeCardConfig(config);
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    return changedProps.has('config') || changedProps.has('hass');
  }

  protected render(): TemplateResult | void {
    if (!this.config) {
      return;
    }

    if (!this.hass) {
      return this._renderSkeleton();
    }

    return html`
      <ha-card>
        <div class="card-content">
          <div class="rows">
            ${this.config.rows.map((row, index) => html`
              ${index > 0 ? html`<div class="row-divider"></div>` : nothing}
              <toggle-row .hass=${this.hass} .config=${row}></toggle-row>
            `)}
          </div>
        </div>
      </ha-card>
    `;
  }

  private _renderSkeleton(): TemplateResult {
    const rowCount = this.config.rows.length;

    return html`
      <ha-card>
        <div class="card-content">
          <div class="rows" aria-busy="true" aria-label="Loading">
            ${Array.from({ length: rowCount }, (_, index) => html`
              ${index > 0 ? html`<div class="row-divider"></div>` : nothing}
              <div class="skeleton-row">
                <div class="skeleton skeleton-icon"></div>
                <div class="skeleton-text">
                  <div class="skeleton skeleton-title"></div>
                  <div class="skeleton skeleton-subtitle"></div>
                </div>
                <div class="skeleton skeleton-controls"></div>
              </div>
            `)}
          </div>
        </div>
      </ha-card>
    `;
  }

  public getCardSize(): number {
    return getCardSize(this.config);
  }

  static styles = cardStyles;
}

declare global {
  interface HTMLElementTagNameMap {
    'toggle-row-card': ToggleRowCard;
  }
}
