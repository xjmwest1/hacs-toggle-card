import type { ToggleRowConfig } from './types';

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
] as const;

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

export function formatVariableSnippet(token: string): string {
  return `{{ ${token} }}`;
}

export function insertTemplateVariable(
  currentValue: string,
  token: string,
  selectionStart?: number | null,
  selectionEnd?: number | null,
): { value: string; cursor: number } {
  const snippet = formatVariableSnippet(token);
  const start = selectionStart ?? currentValue.length;
  const end = selectionEnd ?? currentValue.length;
  const value = currentValue.slice(0, start) + snippet + currentValue.slice(end);

  return {
    value,
    cursor: start + snippet.length,
  };
}
