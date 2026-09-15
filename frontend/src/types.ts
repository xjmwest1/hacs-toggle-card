import { ActionConfig, LovelaceCardConfig } from 'custom-card-helpers';

export type RowAlign = 'left' | 'right';

export interface RowButtonConfig {
  type: 'button';
  align: RowAlign;
  title?: string;
  icon?: string;
  /** When true, show a confirmation dialog before running the tap action. */
  confirmation?: boolean;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

export interface RowToggleConfig {
  type: 'toggle';
  align: RowAlign;
  entity: string;
  disables_row?: boolean;
}

export type RowControlConfig = RowButtonConfig | RowToggleConfig;

export interface ToggleRowConfig {
  title: string;
  subtitle?: string;
  icon?: string;
  /** Row subject entity — drives icon fallback and unavailable styling. */
  entity?: string;
  /** Entity that drives row icon state tinting. Omit for no tint. */
  icon_state_entity?: string;
  /** When true, highlight the icon when the tint entity is off instead of on. */
  icon_state_invert?: boolean;
  /** @deprecated Ignored — use `icon_state_entity` instead. */
  icon_state?: boolean;
  controls: RowControlConfig[];
}

export interface ToggleRowCardConfig extends LovelaceCardConfig {
  type: string;
  rows: ToggleRowConfig[];
}
