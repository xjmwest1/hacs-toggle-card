import { LovelaceCardConfig } from 'custom-card-helpers';

export interface ToggleRowCardConfig extends LovelaceCardConfig {
  type: string;
  entity?: string;
  name?: string;
  icon?: string;
}
