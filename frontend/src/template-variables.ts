import type { ToggleRowConfig } from './types';
import { formatVariableSnippet as formatTemplateSnippet } from './templates';

export interface TemplateVariable {
  token: string;
  label: string;
  description: string;
}

const FIELD_TOKENS = [
  { suffix: 'name', label: 'Name', description: 'Entity friendly name' },
  { suffix: 'state', label: 'State', description: 'Raw entity state' },
  { suffix: 'state_label', label: 'State label', description: 'Formatted entity state' },
  { suffix: 'unit', label: 'Unit', description: 'Unit of measurement' },
  { suffix: 'entity', label: 'Entity ID', description: 'Entity ID string' },
  { suffix: 'last_changed', label: 'Last changed', description: 'Entity last changed timestamp' },
  { suffix: 'last_updated', label: 'Last updated', description: 'Entity last updated timestamp' },
] as const;

export interface TemplateFormatOption {
  format: string;
  label: string;
  description: string;
}

export const TEMPLATE_FORMAT_OPTIONS: TemplateFormatOption[] = [
  { format: 'date', label: 'Date', description: 'Locale date (medium style)' },
  { format: 'datetime', label: 'Date & time', description: 'Locale date and time' },
  { format: 'date:short', label: 'Short date', description: 'Locale short date' },
  {
    format: 'datetime:short',
    label: 'Short date & time',
    description: 'Locale short date and time',
  },
  { format: 'relative', label: 'Relative time', description: 'Relative time such as "2 hours ago"' },
  {
    format: 'relative:short',
    label: 'Short relative time',
    description: 'Compact relative time such as "2 hr. ago"',
  },
];

const FORMATTABLE_SUFFIXES = new Set(['last_changed', 'last_updated']);

const EXAMPLE_ENTITY = 'switch.example';

export function getRowToggleEntities(row: ToggleRowConfig): string[] {
  return [
    ...new Set(
      row.controls
        .filter((control) => control.type === 'toggle')
        .map((control) => control.entity),
    ),
  ];
}

export function getRowEntitySources(row: ToggleRowConfig): string[] {
  const toggleEntities = getRowToggleEntities(row);
  const sources = row.entity ? [row.entity, ...toggleEntities] : toggleEntities;

  return [...new Set(sources)];
}

export function tokenSupportsFormatting(token: string): boolean {
  const suffix = token.split('.').at(-1);
  return suffix ? FORMATTABLE_SUFFIXES.has(suffix) : false;
}

export function getTemplateFormatOptions(): TemplateFormatOption[] {
  return TEMPLATE_FORMAT_OPTIONS;
}

export function getTemplateVariables(row: ToggleRowConfig): TemplateVariable[] {
  const entityIds = getRowEntitySources(row);
  const sources = entityIds.length > 0 ? entityIds : [EXAMPLE_ENTITY];

  return sources.flatMap((entityId) =>
    FIELD_TOKENS.map((field) => ({
      token: `${entityId}.${field.suffix}`,
      label: `${entityId} ${field.label.toLowerCase()}`,
      description: field.description,
    })),
  );
}

export function formatVariableSnippet(token: string, format?: string): string {
  return formatTemplateSnippet(token, format);
}

export function insertTemplateVariable(
  currentValue: string,
  token: string,
  selectionStart?: number | null,
  selectionEnd?: number | null,
  format?: string,
): { value: string; cursor: number } {
  const snippet = formatVariableSnippet(token, format);
  const start = selectionStart ?? currentValue.length;
  const end = selectionEnd ?? currentValue.length;
  const value = currentValue.slice(0, start) + snippet + currentValue.slice(end);

  return {
    value,
    cursor: start + snippet.length,
  };
}
