import { HomeAssistant } from 'custom-card-helpers';
import { HassEntity } from 'home-assistant-js-websocket';

const VARIABLE_PATTERN = /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g;

export interface TemplateResult {
  value: string;
  error?: string;
}

interface ParsedVariable {
  entityId: string;
  field: string;
  attribute?: string;
}

export function evaluateTemplate(template: string, hass: HomeAssistant): TemplateResult {
  const errors: string[] = [];

  const value = template.replace(VARIABLE_PATTERN, (_match, rawToken: string) => {
    const token = rawToken.trim();
    const parsed = parseVariableToken(token);

    if (!parsed) {
      errors.push(`Unknown variable: ${token}`);
      return '';
    }

    const resolved = resolveParsedVariable(parsed, hass);
    if (resolved.error) {
      errors.push(resolved.error);
    }

    return resolved.value;
  });

  return {
    value,
    error: errors.length ? errors.join('; ') : undefined,
  };
}

export function parseVariableToken(token: string): ParsedVariable | null {
  for (const field of ['state_label', 'state', 'name', 'unit', 'entity'] as const) {
    const suffix = `.${field}`;
    if (token.endsWith(suffix)) {
      const entityId = token.slice(0, -suffix.length);
      if (!entityId.includes('.')) {
        return null;
      }

      return { entityId, field };
    }
  }

  const attrMarker = '.attr.';
  const attrIndex = token.indexOf(attrMarker);
  if (attrIndex > 0) {
    const entityId = token.slice(0, attrIndex);
    const attribute = token.slice(attrIndex + attrMarker.length);
    if (!entityId.includes('.') || !attribute) {
      return null;
    }

    return {
      entityId,
      field: 'attr',
      attribute,
    };
  }

  return null;
}

function resolveParsedVariable(parsed: ParsedVariable, hass: HomeAssistant): TemplateResult {
  const stateObj = hass.states[parsed.entityId];

  if (!stateObj) {
    return {
      value: '',
      error: `Entity not found: ${parsed.entityId}`,
    };
  }

  switch (parsed.field) {
    case 'entity':
      return { value: parsed.entityId };
    case 'name':
      return { value: getFriendlyName(stateObj) };
    case 'state':
      return { value: stateObj.state };
    case 'state_label':
      return { value: formatStateLabel(stateObj.state) };
    case 'unit':
      return { value: String(stateObj.attributes.unit_of_measurement ?? '') };
    case 'attr':
      return {
        value: String(stateObj.attributes[parsed.attribute ?? ''] ?? ''),
      };
    default:
      return { value: '', error: `Unknown field: ${parsed.field}` };
  }
}

function getFriendlyName(stateObj: HassEntity): string {
  const friendlyName = stateObj.attributes.friendly_name;
  return typeof friendlyName === 'string' && friendlyName.length > 0
    ? friendlyName
    : stateObj.entity_id;
}

function formatStateLabel(state: string): string {
  if (state === 'on' || state === 'off') {
    return state[0].toUpperCase() + state.slice(1);
  }

  if (state === 'unavailable' || state === 'unknown') {
    return state[0].toUpperCase() + state.slice(1);
  }

  return state;
}
