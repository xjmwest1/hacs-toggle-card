import { HomeAssistant } from 'custom-card-helpers';
import { HassEntity } from 'home-assistant-js-websocket';

const VARIABLE_PATTERN = /\{\{\s*([^}|]+?)(?:\s*\|\s*([^}]+?))?\s*\}\}/g;

export interface TemplateResult {
  value: string;
  error?: string;
}

interface ParsedVariable {
  entityId: string;
  field: string;
  attribute?: string;
}

const FIELD_SUFFIXES = [
  'state_label',
  'last_changed',
  'last_updated',
  'state',
  'name',
  'unit',
  'entity',
] as const;

export function evaluateTemplate(template: string, hass: HomeAssistant): TemplateResult {
  const errors: string[] = [];

  const value = template.replace(VARIABLE_PATTERN, (_match, rawToken: string, rawFormat?: string) => {
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

    if (!rawFormat) {
      return resolved.value;
    }

    const formatted = formatVariableValue(resolved.value, rawFormat.trim(), hass);
    if (formatted.error) {
      errors.push(formatted.error);
    }

    return formatted.value;
  });

  return {
    value,
    error: errors.length ? errors.join('; ') : undefined,
  };
}

export function parseVariableToken(token: string): ParsedVariable | null {
  for (const field of FIELD_SUFFIXES) {
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
    case 'last_changed':
      return { value: stateObj.last_changed };
    case 'last_updated':
      return { value: stateObj.last_updated };
    case 'attr':
      return {
        value: String(stateObj.attributes[parsed.attribute ?? ''] ?? ''),
      };
    default:
      return { value: '', error: `Unknown field: ${parsed.field}` };
  }
}

function formatVariableValue(
  rawValue: string,
  format: string,
  hass: HomeAssistant,
): TemplateResult {
  const [type, style = 'medium'] = format.includes(':') ? format.split(':', 2) : [format, 'medium'];

  if (type !== 'date' && type !== 'datetime') {
    return { value: rawValue, error: `Unknown format: ${format}` };
  }

  const date = parseDateValue(rawValue);
  if (!date) {
    return { value: rawValue, error: `Cannot format non-date value: ${rawValue}` };
  }

  const locale = hass.locale?.language ?? 'en-US';
  const options = getDateFormatOptions(type, style);

  return {
    value: new Intl.DateTimeFormat(locale, options).format(date),
  };
}

function getDateFormatOptions(
  type: 'date' | 'datetime',
  style: string,
): Intl.DateTimeFormatOptions {
  switch (style) {
    case 'short':
      return type === 'datetime'
        ? { dateStyle: 'short', timeStyle: 'short' }
        : { dateStyle: 'short' };
    case 'long':
      return type === 'datetime'
        ? { dateStyle: 'long', timeStyle: 'medium' }
        : { dateStyle: 'long' };
    case 'medium':
    default:
      return type === 'datetime'
        ? { dateStyle: 'medium', timeStyle: 'short' }
        : { dateStyle: 'medium' };
  }
}

function parseDateValue(rawValue: string): Date | null {
  if (!rawValue) {
    return null;
  }

  const trimmed = rawValue.trim();
  const numeric = Number(trimmed);
  if (!Number.isNaN(numeric) && trimmed !== '') {
    return new Date(numeric > 1e12 ? numeric : numeric * 1000);
  }

  const parsed = Date.parse(trimmed);
  if (!Number.isNaN(parsed)) {
    return new Date(parsed);
  }

  return null;
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

export function formatVariableSnippet(token: string, format?: string): string {
  if (!format) {
    return `{{ ${token} }}`;
  }

  return `{{ ${token} | ${format} }}`;
}
