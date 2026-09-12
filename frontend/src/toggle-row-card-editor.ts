import { ActionConfig, HomeAssistant, LovelaceCardEditor } from 'custom-card-helpers';
import { css, CSSResultGroup, html, LitElement, nothing, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import './toggle-row-card';
import { validateCardConfig } from './config';
import { applyRowEntitySelection, getEntityPickerOptions } from './editor-row-entity';
import { sharedVars } from './styles';
import {
  getTemplateVariables,
  insertTemplateVariable,
  type TemplateVariable,
} from './template-variables';
import type {
  RowAlign,
  RowButtonConfig,
  RowControlConfig,
  RowToggleConfig,
  ToggleRowCardConfig,
  ToggleRowConfig,
} from './types';

type ControlType = RowControlConfig['type'];

function cloneConfig(config: ToggleRowCardConfig): ToggleRowCardConfig {
  return {
    ...config,
    rows: config.rows.map((row) => ({
      ...row,
      controls: row.controls.map((control) => ({ ...control })),
    })),
  };
}

function createEmptyRow(): ToggleRowConfig {
  return {
    title: 'New row',
    icon: 'mdi:toggle-switch',
    controls: [
      {
        type: 'toggle',
        align: 'right',
        entity: 'switch.example',
      },
    ],
  };
}

function createControl(type: ControlType): RowControlConfig {
  if (type === 'button') {
    return {
      type: 'button',
      align: 'right',
      icon: 'mdi:gesture-tap-button',
      tap_action: { action: 'none' },
    };
  }

  return {
    type: 'toggle',
    align: 'right',
    entity: 'switch.example',
  };
}

@customElement('toggle-row-card-editor')
export class ToggleRowCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _config!: ToggleRowCardConfig;

  public setConfig(config: ToggleRowCardConfig): void {
    this._config = cloneConfig(config);
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this._config) {
      return nothing;
    }

    return html`
      <div class="editor">
        ${this._renderPreview()}
        <div class="editor-section">
          <div class="section-header">
            <h3>Rows</h3>
          </div>
          ${this._config.rows.map((row, rowIndex) => this._renderRowEditor(row, rowIndex))}
          <button class="text-button add-row-button" type="button" @click=${this._addRow}>
            Add row
          </button>
        </div>
      </div>
    `;
  }

  private _renderPreview(): TemplateResult {
    if (!this.hass) {
      return html`
        <section class="editor-preview">
          <div class="section-header">
            <h3>Live preview</h3>
          </div>
          <p class="preview-placeholder">Connect Home Assistant to preview the card.</p>
        </section>
      `;
    }

    const previewConfig = this._getPreviewConfig();
    if (!previewConfig) {
      return html`
        <section class="editor-preview">
          <div class="section-header">
            <h3>Live preview</h3>
          </div>
          <p class="preview-placeholder">
            Complete each row title and control before previewing.
          </p>
        </section>
      `;
    }

    return html`
      <section class="editor-preview">
        <div class="section-header">
          <h3>Live preview</h3>
        </div>
        <toggle-row-card .hass=${this.hass} .config=${previewConfig}></toggle-row-card>
      </section>
    `;
  }

  private _getPreviewConfig(): ToggleRowCardConfig | null {
    try {
      return validateCardConfig({
        type: 'custom:toggle-row-card',
        rows: this._config.rows,
      });
    } catch {
      return null;
    }
  }

  private _renderRowEditor(row: ToggleRowConfig, rowIndex: number): TemplateResult {
    return html`
      <div class="row-editor">
        <div class="row-editor-header">
          <strong>Row ${rowIndex + 1}</strong>
          <div class="row-actions">
            ${rowIndex > 0
              ? html`
                  <button
                    class="icon-button"
                    type="button"
                    title="Move up"
                    @click=${() => this._moveRow(rowIndex, -1)}
                  >
                    ↑
                  </button>
                `
              : nothing}
            ${rowIndex < this._config.rows.length - 1
              ? html`
                  <button
                    class="icon-button"
                    type="button"
                    title="Move down"
                    @click=${() => this._moveRow(rowIndex, 1)}
                  >
                    ↓
                  </button>
                `
              : nothing}
            ${this._config.rows.length > 1
              ? html`
                  <button
                    class="icon-button danger"
                    type="button"
                    title="Remove row"
                    @click=${() => this._removeRow(rowIndex)}
                  >
                    ×
                  </button>
                `
              : nothing}
          </div>
        </div>

        ${this._renderRowEntityField(row, rowIndex)}

        ${this._renderTemplateField(rowIndex, 'title', row.title, row)}
        ${this._renderTemplateField(rowIndex, 'subtitle', row.subtitle ?? '', row, true)}

        <label class="field">
          <span>Icon</span>
          <input
            .value=${row.icon ?? ''}
            placeholder="mdi:lightbulb (optional — falls back to entity icon)"
            @input=${(ev: Event) =>
              this._updateRow(rowIndex, {
                icon: (ev.target as HTMLInputElement).value || undefined,
              })}
          />
        </label>

        ${row.entity
          ? html`
              <label class="checkbox-field">
                <input
                  type="checkbox"
                  .checked=${row.icon_state ?? true}
                  @change=${(ev: Event) =>
                    this._updateRow(rowIndex, {
                      icon_state: (ev.target as HTMLInputElement).checked,
                    })}
                />
                <span>Tint icon by entity state</span>
              </label>
            `
          : nothing}

        <div class="controls-section">
          <div class="section-header">
            <h4>Controls</h4>
            <button class="text-button" type="button" @click=${() => this._addControl(rowIndex)}>
              Add control
            </button>
          </div>
          ${row.controls.map((control, controlIndex) =>
            this._renderControlEditor(rowIndex, control, controlIndex),
          )}
        </div>
      </div>
    `;
  }

  private _renderRowEntityField(row: ToggleRowConfig, rowIndex: number): TemplateResult {
    const entityOptions = getEntityPickerOptions(this.hass);

    if (entityOptions.length === 0) {
      return html`
        <label class="field">
          <span>Optional</span>
          <input
            .value=${row.entity ?? ''}
            placeholder="switch.example"
            @input=${(ev: Event) => this._updateRowEntity(rowIndex, ev)}
          />
        </label>
      `;
    }

    return html`
      <label class="field">
        <span>Optional</span>
        <select
          .value=${row.entity ?? ''}
          @change=${(ev: Event) => this._updateRowEntity(rowIndex, ev)}
        >
          <option value="">None</option>
          ${entityOptions.map(
            (entityId) => html`
              <option value=${entityId}>${entityId}</option>
            `,
          )}
        </select>
      </label>
    `;
  }

  private _updateRowEntity(rowIndex: number, ev: Event): void {
    const target = ev.target as HTMLInputElement | HTMLSelectElement;
    const entityId = target.value || undefined;
    const row = this._config.rows[rowIndex];
    const updatedRow = applyRowEntitySelection(row, entityId, this.hass, row.entity);

    this._updateRow(rowIndex, updatedRow);
  }

  private _renderTemplateField(
    rowIndex: number,
    field: 'title' | 'subtitle',
    value: string,
    row: ToggleRowConfig,
    optional = false,
  ): TemplateResult {
    const listId = `${field}-vars-${rowIndex}`;
    const variables = getTemplateVariables(row);
    const hasEntitySources = getTemplateVariables(row).length > 0;

    return html`
      <label class="field">
        <span>${field === 'title' ? 'Title' : 'Subtitle'}</span>
        <input
          id=${`${field}-${rowIndex}`}
          list=${listId}
          .value=${value}
          placeholder=${optional
            ? 'Optional, e.g. {{ switch.porch.state_label }}'
            : 'e.g. {{ switch.porch.name }}'}
          @input=${(ev: Event) => this._updateTemplateField(rowIndex, field, ev)}
        />
        <datalist id=${listId}>
          ${variables.map(
            (variable) => html`
              <option value=${this._templateSuggestion(value, variable.token)}>
                ${variable.label}
              </option>
            `,
          )}
        </datalist>
        <div class="template-help">
          Use explicit entity variables like <code>{{ switch.porch.name }}</code>. Set a row
          entity or add a toggle control for insert suggestions.
          ${hasEntitySources ? nothing : html`<span> No entities on this row yet.</span>`}
        </div>
        <div class="var-chips">
          ${variables.map((variable) => this._renderVariableChip(rowIndex, field, variable))}
        </div>
      </label>
    `;
  }

  private _renderVariableChip(
    rowIndex: number,
    field: 'title' | 'subtitle',
    variable: TemplateVariable,
  ): TemplateResult {
    return html`
      <button
        class="var-chip"
        type="button"
        title=${variable.description}
        @click=${(ev: Event) => this._insertTemplateVariable(rowIndex, field, variable.token, ev)}
      >
        ${variable.label}
      </button>
    `;
  }

  private _templateSuggestion(currentValue: string, token: string): string {
    if (!currentValue) {
      return insertTemplateVariable('', token).value;
    }

    return `${currentValue} ${insertTemplateVariable('', token).value}`.trim();
  }

  private _updateTemplateField(
    rowIndex: number,
    field: 'title' | 'subtitle',
    ev: Event,
  ): void {
    const value = (ev.target as HTMLInputElement).value;

    if (field === 'title') {
      this._updateRow(rowIndex, { title: value });
      return;
    }

    this._updateRow(rowIndex, { subtitle: value || undefined });
  }

  private _insertTemplateVariable(
    rowIndex: number,
    field: 'title' | 'subtitle',
    token: string,
    ev: Event,
  ): void {
    const input = (ev.currentTarget as HTMLElement)
      .closest('.field')
      ?.querySelector('input') as HTMLInputElement | null;
    const row = this._config.rows[rowIndex];
    const currentValue = field === 'title' ? row.title : row.subtitle ?? '';
    const { value, cursor } = insertTemplateVariable(
      currentValue,
      token,
      input?.selectionStart,
      input?.selectionEnd,
    );

    if (field === 'title') {
      this._updateRow(rowIndex, { title: value });
    } else {
      this._updateRow(rowIndex, { subtitle: value || undefined });
    }

    if (input) {
      requestAnimationFrame(() => {
        input.focus();
        input.setSelectionRange(cursor, cursor);
      });
    }
  }

  private _renderControlEditor(
    rowIndex: number,
    control: RowControlConfig,
    controlIndex: number,
  ): TemplateResult {
    return html`
      <div class="control-editor">
        <div class="control-header">
          <span>Control ${controlIndex + 1}</span>
          ${rowIndex >= 0 && this._config.rows[rowIndex].controls.length > 1
            ? html`
                <button
                  class="icon-button danger"
                  type="button"
                  title="Remove control"
                  @click=${() => this._removeControl(rowIndex, controlIndex)}
                >
                  ×
                </button>
              `
            : nothing}
        </div>

        <label class="field">
          <span>Type</span>
          <select
            .value=${control.type}
            @change=${(ev: Event) =>
              this._setControlType(rowIndex, controlIndex, (ev.target as HTMLSelectElement).value as ControlType)}
          >
            <option value="toggle">Toggle</option>
            <option value="button">Button</option>
          </select>
        </label>

        <label class="field">
          <span>Alignment</span>
          <select
            .value=${control.align}
            @change=${(ev: Event) =>
              this._updateControl(rowIndex, controlIndex, {
                align: (ev.target as HTMLSelectElement).value as RowAlign,
              })}
          >
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </label>

        ${control.type === 'toggle' ? this._renderToggleFields(rowIndex, control, controlIndex) : nothing}
        ${control.type === 'button' ? this._renderButtonFields(rowIndex, control, controlIndex) : nothing}
      </div>
    `;
  }

  private _renderToggleFields(
    rowIndex: number,
    control: RowToggleConfig,
    controlIndex: number,
  ): TemplateResult {
    return html`
      <label class="field">
        <span>Toggle entity</span>
        <input
          .value=${control.entity}
          @input=${(ev: Event) =>
            this._updateControl(rowIndex, controlIndex, {
              entity: (ev.target as HTMLInputElement).value,
            })}
        />
      </label>
      <label class="checkbox-field">
        <input
          type="checkbox"
          .checked=${control.disables_row ?? false}
          @change=${(ev: Event) =>
            this._updateControl(rowIndex, controlIndex, {
              disables_row: (ev.target as HTMLInputElement).checked || undefined,
            })}
        />
        <span>Disables row when off</span>
      </label>
    `;
  }

  private _renderButtonFields(
    rowIndex: number,
    control: RowButtonConfig,
    controlIndex: number,
  ): TemplateResult {
    return html`
      <label class="field">
        <span>Button title</span>
        <input
          .value=${control.title ?? ''}
          @input=${(ev: Event) =>
            this._updateControl(rowIndex, controlIndex, {
              title: (ev.target as HTMLInputElement).value || undefined,
            })}
        />
      </label>
      <label class="field">
        <span>Button icon</span>
        <input
          .value=${control.icon ?? ''}
          placeholder="mdi:information-outline"
          @input=${(ev: Event) =>
            this._updateControl(rowIndex, controlIndex, {
              icon: (ev.target as HTMLInputElement).value || undefined,
            })}
        />
      </label>
      <label class="field">
        <span>Tap action</span>
        <select
          .value=${control.tap_action?.action ?? 'none'}
          @change=${(ev: Event) => this._updateButtonAction(rowIndex, controlIndex, ev)}
        >
          <option value="none">None</option>
          <option value="more-info">More info</option>
          <option value="call-service">Call service</option>
        </select>
      </label>
      ${control.tap_action?.action === 'more-info'
        ? html`
            <label class="field">
              <span>Action entity</span>
              <input
                .value=${control.tap_action && 'entity' in control.tap_action ? control.tap_action.entity : ''}
                @input=${(ev: Event) => this._updateButtonActionEntity(rowIndex, controlIndex, ev)}
              />
            </label>
          `
        : nothing}
      ${control.tap_action?.action === 'call-service'
        ? html`
            <label class="field">
              <span>Service</span>
              <input
                .value=${control.tap_action && 'service' in control.tap_action ? control.tap_action.service : ''}
                placeholder="script.example"
                @input=${(ev: Event) => this._updateButtonService(rowIndex, controlIndex, ev)}
              />
            </label>
          `
        : nothing}
    `;
  }

  private _addRow(): void {
    this._config = {
      ...this._config,
      rows: [...this._config.rows, createEmptyRow()],
    };
    this._notifyConfigChanged();
  }

  private _removeRow(rowIndex: number): void {
    this._config = {
      ...this._config,
      rows: this._config.rows.filter((_, index) => index !== rowIndex),
    };
    this._notifyConfigChanged();
  }

  private _moveRow(rowIndex: number, direction: -1 | 1): void {
    const rows = [...this._config.rows];
    const targetIndex = rowIndex + direction;
    if (targetIndex < 0 || targetIndex >= rows.length) {
      return;
    }

    [rows[rowIndex], rows[targetIndex]] = [rows[targetIndex], rows[rowIndex]];
    this._config = { ...this._config, rows };
    this._notifyConfigChanged();
  }

  private _updateRow(rowIndex: number, patch: Partial<ToggleRowConfig> | ToggleRowConfig): void {
    const rows = [...this._config.rows];
    rows[rowIndex] = { ...rows[rowIndex], ...patch };
    this._config = { ...this._config, rows };
    this._notifyConfigChanged();
  }

  private _addControl(rowIndex: number): void {
    const rows = [...this._config.rows];
    rows[rowIndex] = {
      ...rows[rowIndex],
      controls: [...rows[rowIndex].controls, createControl('toggle')],
    };
    this._config = { ...this._config, rows };
    this._notifyConfigChanged();
  }

  private _removeControl(rowIndex: number, controlIndex: number): void {
    const rows = [...this._config.rows];
    rows[rowIndex] = {
      ...rows[rowIndex],
      controls: rows[rowIndex].controls.filter((_, index) => index !== controlIndex),
    };
    this._config = { ...this._config, rows };
    this._notifyConfigChanged();
  }

  private _setControlType(rowIndex: number, controlIndex: number, type: ControlType): void {
    const rows = [...this._config.rows];
    rows[rowIndex] = {
      ...rows[rowIndex],
      controls: rows[rowIndex].controls.map((control, index) =>
        index === controlIndex ? createControl(type) : control,
      ),
    };
    this._config = { ...this._config, rows };
    this._notifyConfigChanged();
  }

  private _updateControl(
    rowIndex: number,
    controlIndex: number,
    patch: Partial<RowControlConfig>,
  ): void {
    const rows = [...this._config.rows];
    rows[rowIndex] = {
      ...rows[rowIndex],
      controls: rows[rowIndex].controls.map((control, index) =>
        index === controlIndex ? ({ ...control, ...patch } as RowControlConfig) : control,
      ),
    };
    this._config = { ...this._config, rows };
    this._notifyConfigChanged();
  }

  private _updateButtonAction(rowIndex: number, controlIndex: number, ev: Event): void {
    const action = (ev.target as HTMLSelectElement).value;
    const rows = [...this._config.rows];
    const control = rows[rowIndex].controls[controlIndex] as RowButtonConfig;
    const currentEntity =
      control.tap_action && 'entity' in control.tap_action ? control.tap_action.entity : 'switch.example';
    const currentService =
      control.tap_action && 'service' in control.tap_action ? control.tap_action.service : 'script.example';

    if (action === 'none') {
      control.tap_action = { action: 'none' };
    } else if (action === 'more-info') {
      control.tap_action = { action: 'more-info', entity: currentEntity };
    } else if (action === 'call-service') {
      control.tap_action = { action: 'call-service', service: currentService };
    }

    this._config = { ...this._config, rows };
    this._notifyConfigChanged();
  }

  private _updateButtonActionEntity(rowIndex: number, controlIndex: number, ev: Event): void {
    const entity = (ev.target as HTMLInputElement).value;
    const rows = [...this._config.rows];
    const control = rows[rowIndex].controls[controlIndex] as RowButtonConfig;

    control.tap_action = { action: 'more-info', entity };

    this._config = { ...this._config, rows };
    this._notifyConfigChanged();
  }

  private _updateButtonService(rowIndex: number, controlIndex: number, ev: Event): void {
    const service = (ev.target as HTMLInputElement).value;
    const rows = [...this._config.rows];
    const control = rows[rowIndex].controls[controlIndex] as RowButtonConfig;
    control.tap_action = { action: 'call-service', service } as ActionConfig;
    this._config = { ...this._config, rows };
    this._notifyConfigChanged();
  }

  private _notifyConfigChanged(): void {
    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: { config: cloneConfig(this._config) },
        bubbles: true,
        composed: true,
      }),
    );
  }

  static styles: CSSResultGroup = [
    sharedVars,
    css`
      :host {
        display: block;
      }

      .editor {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .editor-preview {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 12px;
        border: 1px solid var(--toggle-row-divider);
        border-radius: 8px;
        background: var(--card-background-color, #fff);
      }

      .preview-placeholder {
        margin: 0;
        color: var(--toggle-row-secondary-text);
        font-size: 0.8125rem;
      }

      .editor-preview toggle-row-card {
        display: block;
        pointer-events: none;
      }

      .editor-section,
      .row-editor,
      .control-editor {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 12px;
        border: 1px solid var(--toggle-row-divider);
        border-radius: 8px;
        background: var(--card-background-color, #fff);
      }

      .section-header,
      .row-editor-header,
      .control-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      h3,
      h4 {
        margin: 0;
        font-size: 0.95rem;
        font-weight: 600;
      }

      .row-actions {
        display: flex;
        gap: 4px;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 0.8125rem;
      }

      .field span,
      .checkbox-field span {
        color: var(--toggle-row-secondary-text);
      }

      .field input,
      .field select {
        width: 100%;
        box-sizing: border-box;
        padding: 8px 10px;
        border: 1px solid var(--toggle-row-divider);
        border-radius: 4px;
        background: transparent;
        color: var(--toggle-row-primary-text);
        font: inherit;
      }

      .checkbox-field {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.8125rem;
      }

      .text-button,
      .icon-button {
        border: none;
        background: transparent;
        color: var(--toggle-row-accent);
        cursor: pointer;
        font: inherit;
      }

      .add-row-button {
        align-self: flex-start;
        padding: 4px 0;
      }

      .icon-button {
        width: 28px;
        height: 28px;
        border-radius: 50%;
      }

      .icon-button:hover,
      .text-button:hover {
        background: rgba(3, 169, 244, 0.08);
      }

      .icon-button.danger {
        color: var(--toggle-row-warning);
      }

      .controls-section {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .template-help {
        color: var(--toggle-row-secondary-text);
        font-size: 0.75rem;
      }

      .template-help code {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 0.75rem;
      }

      .var-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .var-chip {
        border: 1px solid var(--toggle-row-divider);
        border-radius: 999px;
        padding: 4px 10px;
        background: rgba(3, 169, 244, 0.08);
        color: var(--toggle-row-accent);
        cursor: pointer;
        font: inherit;
        font-size: 0.75rem;
      }

      .var-chip:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    'toggle-row-card-editor': ToggleRowCardEditor;
  }
}
