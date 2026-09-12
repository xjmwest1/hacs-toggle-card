import { ActionConfig, LovelaceCardConfig } from 'custom-card-helpers';

export type RowAlign = 'left' | 'right';

export interface RowButtonConfig {
  type: 'button';
  align: RowAlign;
  title?: string;
  icon?: string;
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
  controls: RowControlConfig[];
}

export interface ToggleRowCardConfig extends LovelaceCardConfig {
  type: string;
  rows: ToggleRowConfig[];
}
