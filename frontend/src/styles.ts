import { css, CSSResultGroup } from 'lit';

export const sharedVars = css`
  :host {
    --toggle-row-accent: var(--primary-color, #03a9f4);
    --toggle-row-track-off: var(--disabled-color, rgba(0, 0, 0, 0.26));
    --toggle-row-track-on: var(--toggle-row-accent);
    --toggle-row-thumb: var(--text-primary-color, #fff);
    --toggle-row-divider: var(--divider-color, rgba(0, 0, 0, 0.12));
    --toggle-row-primary-text: var(--primary-text-color, rgba(0, 0, 0, 0.87));
    --toggle-row-secondary-text: var(--secondary-text-color, rgba(0, 0, 0, 0.54));
    --toggle-row-warning: var(--error-color, #f44336);
  }
`;

export const cardStyles: CSSResultGroup = [
  sharedVars,
  css`
    :host {
      display: block;
    }

    ha-card {
      overflow: hidden;
    }

    .card-content {
      padding: 8px 0;
    }

    .rows {
      display: flex;
      flex-direction: column;
    }

    .row-divider {
      height: 1px;
      margin: 0 16px;
      background: var(--toggle-row-divider);
    }

    .warning {
      padding: 16px;
      color: var(--toggle-row-warning);
    }

    @keyframes skeleton-pulse {
      0%,
      100% {
        opacity: 1;
      }
      50% {
        opacity: 0.4;
      }
    }

    .skeleton {
      border-radius: 4px;
      background: var(--toggle-row-divider);
      animation: skeleton-pulse 1.4s ease-in-out infinite;
    }

    .skeleton-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      min-height: 56px;
    }

    .skeleton-icon {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .skeleton-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .skeleton-title {
      height: 14px;
      width: 45%;
    }

    .skeleton-subtitle {
      height: 11px;
      width: 30%;
    }

    .skeleton-controls {
      width: 72px;
      height: 20px;
      border-radius: 10px;
      flex-shrink: 0;
    }
  `,
];

export const rowStyles: CSSResultGroup = [
  sharedVars,
  css`
    :host {
      display: block;
    }

    .toggle-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      min-height: 56px;
    }

    .toggle-row--disabled .row-button {
      opacity: 0.45;
      pointer-events: none;
    }

    .row-icon {
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      color: var(--toggle-row-accent);
    }

    .row-icon--active {
      color: var(--state-icon-color, var(--toggle-row-accent));
    }

    .row-icon--inactive {
      color: var(
        --state-inactive-icon-color,
        var(--disabled-text-color, var(--toggle-row-secondary-text))
      );
    }

    .row-icon--unavailable {
      color: var(
        --state-unavailable-color,
        var(--disabled-text-color, var(--toggle-row-secondary-text))
      );
    }

    .row-icon svg {
      width: 100%;
      height: 100%;
      fill: currentColor;
    }

    .row-text {
      flex: 1;
      min-width: 0;
    }

    .row-title {
      font-size: 16px;
      font-weight: 500;
      color: var(--toggle-row-primary-text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .row-subtitle {
      margin-top: 2px;
      font-size: 13px;
      color: var(--toggle-row-secondary-text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .row-title--unavailable,
    .row-subtitle--unavailable {
      color: var(--toggle-row-secondary-text);
    }

    .row-controls {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    .row-controls--left {
      margin-right: 4px;
    }

    .row-controls--right {
      margin-left: auto;
    }

    .row-warning {
      padding: 0 16px 8px;
      font-size: 12px;
      color: var(--toggle-row-warning);
    }
  `,
];

export const buttonStyles: CSSResultGroup = [
  sharedVars,
  css`
    .row-button {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-height: 32px;
      padding: 4px 10px;
      border: 1px solid var(--toggle-row-divider);
      border-radius: 16px;
      background: transparent;
      color: var(--toggle-row-primary-text);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.15s ease;
    }

    .row-button:hover:not(:disabled) {
      background: rgba(0, 0, 0, 0.04);
    }

    .row-button:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .row-button--icon-only {
      padding: 4px;
      width: 32px;
      justify-content: center;
    }

    .row-button__icon {
      width: 18px;
      height: 18px;
      color: var(--state-icon-color, var(--toggle-row-accent));
    }

    .row-button__icon svg {
      width: 100%;
      height: 100%;
      fill: currentColor;
    }
  `,
];

export const toggleStyles: CSSResultGroup = [
  sharedVars,
  css`
    .toggle-switch {
      position: relative;
      flex-shrink: 0;
      width: 36px;
      height: 20px;
      padding: 0;
      border: none;
      border-radius: 10px;
      background: var(--toggle-row-track-off);
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .toggle-switch:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .toggle-switch[data-checked='true'] {
      background: var(--toggle-row-track-on);
    }

    .toggle-switch__thumb {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: var(--toggle-row-thumb);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
      transition: transform 0.2s ease;
    }

    .toggle-switch[data-checked='true'] .toggle-switch__thumb {
      transform: translateX(16px);
    }
  `,
];
