import { css, CSSResultGroup } from 'lit';

export const cardStyles: CSSResultGroup = css`
  :host {
    display: block;
    --toggle-row-accent: var(--primary-color, #03a9f4);
    --toggle-row-track-off: var(--disabled-color, rgba(0, 0, 0, 0.26));
    --toggle-row-track-on: var(--toggle-row-accent);
    --toggle-row-thumb: var(--text-primary-color, #fff);
    --toggle-row-row-bg: var(--card-background-color, #fff);
    --toggle-row-divider: var(--divider-color, rgba(0, 0, 0, 0.12));
    --toggle-row-primary-text: var(--primary-text-color, rgba(0, 0, 0, 0.87));
    --toggle-row-secondary-text: var(--secondary-text-color, rgba(0, 0, 0, 0.54));
  }

  ha-card {
    overflow: hidden;
  }

  .card-content {
    padding: 16px;
  }

  .toggle-row {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 48px;
  }

  .row-icon {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    color: var(--state-icon-color, var(--toggle-row-accent));
  }

  .row-icon svg {
    width: 100%;
    height: 100%;
    fill: currentColor;
  }

  .row-label {
    flex: 1;
    min-width: 0;
    font-size: 16px;
    font-weight: 500;
    color: var(--toggle-row-primary-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .row-label--unavailable {
    color: var(--toggle-row-secondary-text);
  }

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

  .warning {
    padding: 16px;
    color: var(--error-color, #f44336);
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
  }

  .skeleton-icon {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .skeleton-label {
    flex: 1;
    height: 16px;
    max-width: 55%;
  }

  .skeleton-switch {
    width: 36px;
    height: 20px;
    border-radius: 10px;
    flex-shrink: 0;
  }
`;
