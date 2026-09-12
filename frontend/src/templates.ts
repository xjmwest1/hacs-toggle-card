import { HomeAssistant } from 'custom-card-helpers';

const TEMPLATE_PATTERN = /^\[\[\[\s*(.*?)\s*\]\]\]$/s;

export interface TemplateResult {
  value: string;
  error?: string;
}

export function evaluateTemplate(
  template: string,
  hass: HomeAssistant,
): TemplateResult {
  const match = template.match(TEMPLATE_PATTERN);
  if (!match) {
    return { value: template };
  }

  try {
    const evaluator = new Function(
      'states',
      'hass',
      `"use strict"; ${match[1]}`,
    ) as (states: HomeAssistant['states'], hass: HomeAssistant) => unknown;

    const result = evaluator(hass.states, hass);
    return { value: String(result ?? '') };
  } catch (error) {
    return {
      value: '',
      error: error instanceof Error ? error.message : 'Template error',
    };
  }
}
