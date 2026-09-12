import { ActionConfig, HomeAssistant, LovelaceCardEditor } from 'custom-card-helpers';
import { css, CSSResultGroup, html, LitElement, nothing, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import './editor/editor-entity-picker';
import './editor/editor-icon-picker';
import './editor/editor-template-input';
import { applyRowEntitySelection } from './editor-row-entity';
import {
  createSceneTapAction,
  getButtonTapActionType,
  getSceneFromTapAction,
  getScenePickerOptions,
  type ButtonTapActionType,
} from './editor-scene-picker';
import { sharedVars } from './styles';
import { getTemplateVariables } from './template-variables';
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

        <label class="field">
          <span>Entity (optional)</span>
          <editor-entity-picker
            .hass=${this.hass}
            .value=${row.entity ?? ''}
            placeholder="switch.example"
            @value-changed=${(ev: CustomEvent<{ value: string }>) =>
              this._updateRowEntity(rowIndex, ev)}
          ></editor-entity-picker>
        </label>

        ${this._renderTemplateField(rowIndex, 'title', row.title, row)}
        ${this._renderTemplateField(rowIndex, 'subtitle', row.subtitle ?? '', row, true)}

        <label class="field">
          <span>Icon (optional)</span>
          <editor-icon-picker
            .value=${row.icon ?? ''}
            placeholder="mdi:lightbulb — falls back to entity icon"
            @value-changed=${(ev: CustomEvent<{ value: string }>) =>
              this._updateRow(rowIndex, {
                icon: ev.detail.value || undefined,
              })}
          ></editor-icon-picker>
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

  private _updateRowEntity(rowIndex: number, ev: CustomEvent<{ value: string }>): void {
    const entityId = ev.detail.value || undefined;
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
    const variables = getTemplateVariables(row);
    const hasEntitySources = variables.length > 0;

    return html`
      <label class="field">
        <span>${field === 'title' ? 'Title' : 'Subtitle (optional)'}</span>
        <editor-template-input
          id=${`${field}-${rowIndex}`}
          .value=${value}
          .variables=${variables}
          placeholder=${optional
            ? 'Optional, e.g. {{ switch.porch.state_label }}'
            : 'e.g. {{ switch.porch.name }}'}
          @value-changed=${(ev: CustomEvent<{ value: string }>) =>
            this._updateTemplateField(rowIndex, field, ev)}
        ></editor-template-input>
        <div class="template-help">
          Type <code>{{</code> for template suggestions. Format dates with
          <code>{{ switch.porch.last_changed | date }}</code>,
          <code>{{ sensor.event.attr.start | datetime:short }}</code>, or relative values like
          <code>{{ switch.porch.last_updated | relative }}</code>.
          ${hasEntitySources ? nothing : html`<span> Set a row entity for suggestions.</span>`}
        </div>
      </label>
    `;
  }

  private _updateTemplateField(
    rowIndex: number,
    field: 'title' | 'subtitle',
    ev: CustomEvent<{ value: string }>,
  ): void {
    const value = ev.detail.value;

    if (field === 'title') {
      this._updateRow(rowIndex, { title: value });
      return;
    }

    this._updateRow(rowIndex, { subtitle: value || undefined });
  }

  private _renderControlEditor(
    rowIndex: number,
    control: RowControlConfig,
    controlIndex: number,
  ): TemplateResult {
    const controls = this._config.rows[rowIndex].controls;

    return html`
      <div class="control-editor">
        <div class="control-header">
          <span>Control ${controlIndex + 1}</span>
          <div class="row-actions">
            ${controlIndex > 0
              ? html`
                  <button
                    class="icon-button"
                    type="button"
                    title="Move up"
                    @click=${() => this._moveControl(rowIndex, controlIndex, -1)}
                  >
                    ↑
                  </button>
                `
              : nothing}
            ${controlIndex < controls.length - 1
              ? html`
                  <button
                    class="icon-button"
                    type="button"
                    title="Move down"
                    @click=${() => this._moveControl(rowIndex, controlIndex, 1)}
                  >
                    ↓
                  </button>
                `
              : nothing}
            ${controls.length > 1
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
        <editor-entity-picker
          .hass=${this.hass}
          .value=${control.entity}
          @value-changed=${(ev: CustomEvent<{ value: string }>) =>
            this._updateControl(rowIndex, controlIndex, {
              entity: ev.detail.value,
            })}
        ></editor-entity-picker>
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
        <span>Button title (optional)</span>
        <input
          .value=${control.title ?? ''}
          @input=${(ev: Event) =>
            this._updateControl(rowIndex, controlIndex, {
              title: (ev.target as HTMLInputElement).value || undefined,
            })}
        />
      </label>
      <label class="field">
        <span>Button icon (optional)</span>
        <editor-icon-picker
          .value=${control.icon ?? ''}
          placeholder="mdi:information-outline"
          @value-changed=${(ev: CustomEvent<{ value: string }>) =>
            this._updateControl(rowIndex, controlIndex, {
              icon: ev.detail.value || undefined,
            })}
        ></editor-icon-picker>
      </label>
      <label class="field">
        <span>Tap action</span>
        <select
          .value=${getButtonTapActionType(control.tap_action)}
          @change=${(ev: Event) => this._updateButtonAction(rowIndex, controlIndex, ev)}
        >
          <option value="none">None</option>
          <option value="more-info">More info</option>
          <option value="trigger-scene">Trigger scene</option>
          <option value="call-service">Call service</option>
        </select>
      </label>
      ${getButtonTapActionType(control.tap_action) === 'more-info'
        ? html`
            <label class="field">
              <span>Action entity</span>
              <editor-entity-picker
                .hass=${this.hass}
                .value=${control.tap_action && 'entity' in control.tap_action ? control.tap_action.entity : ''}
                @value-changed=${(ev: CustomEvent<{ value: string }>) =>
                  this._updateButtonActionEntity(rowIndex, controlIndex, ev)}
              ></editor-entity-picker>
            </label>
          `
        : nothing}
      ${getButtonTapActionType(control.tap_action) === 'trigger-scene'
        ? html`
            <label class="field">
              <span>Scene</span>
              <editor-entity-picker
                .hass=${this.hass}
                domainFilter="scene"
                .value=${getSceneFromTapAction(control.tap_action)}
                placeholder="Filter scenes..."
                @value-changed=${(ev: CustomEvent<{ value: string }>) =>
                  this._updateButtonScene(rowIndex, controlIndex, ev)}
              ></editor-entity-picker>
            </label>
          `
        : nothing}
      ${getButtonTapActionType(control.tap_action) === 'call-service'
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

  private _moveControl(rowIndex: number, controlIndex: number, direction: -1 | 1): void {
    const rows = [...this._config.rows];
    const controls = [...rows[rowIndex].controls];
    const targetIndex = controlIndex + direction;

    if (targetIndex < 0 || targetIndex >= controls.length) {
      return;
    }

    [controls[controlIndex], controls[targetIndex]] = [controls[targetIndex], controls[controlIndex]];
    rows[rowIndex] = {
      ...rows[rowIndex],
      controls,
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
    const action = (ev.target as HTMLSelectElement).value as ButtonTapActionType;
    const rows = [...this._config.rows];
    const control = rows[rowIndex].controls[controlIndex] as RowButtonConfig;
    const currentEntity =
      control.tap_action && 'entity' in control.tap_action ? control.tap_action.entity : 'switch.example';
    const currentService =
      control.tap_action && 'service' in control.tap_action ? control.tap_action.service : 'script.example';
    const currentScene =
      getSceneFromTapAction(control.tap_action) ||
      getScenePickerOptions(this.hass)[0]?.entityId ||
      'scene.example';

    if (action === 'none') {
      control.tap_action = { action: 'none' };
    } else if (action === 'more-info') {
      control.tap_action = { action: 'more-info', entity: currentEntity };
    } else if (action === 'trigger-scene') {
      control.tap_action = createSceneTapAction(currentScene);
    } else if (action === 'call-service') {
      control.tap_action = { action: 'call-service', service: currentService };
    }

    this._config = { ...this._config, rows };
    this._notifyConfigChanged();
  }

  private _updateButtonScene(rowIndex: number, controlIndex: number, ev: CustomEvent<{ value: string }>): void {
    const sceneEntityId = ev.detail.value.trim();
    if (!sceneEntityId) {
      return;
    }

    const rows = [...this._config.rows];
    const control = rows[rowIndex].controls[controlIndex] as RowButtonConfig;
    control.tap_action = createSceneTapAction(sceneEntityId);
    this._config = { ...this._config, rows };
    this._notifyConfigChanged();
  }

  private _updateButtonActionEntity(
    rowIndex: number,
    controlIndex: number,
    ev: CustomEvent<{ value: string }>,
  ): void {
    const entity = ev.detail.value;
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
      .field select,
      .field editor-entity-picker,
      .field editor-icon-picker,
      .field editor-template-input {
        width: 100%;
      }

      .field input,
      .field select {
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
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    'toggle-row-card-editor': ToggleRowCardEditor;
  }
}
