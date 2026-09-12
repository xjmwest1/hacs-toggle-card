export interface TemplateVariable {
  token: string;
  label: string;
  description: string;
  requiresRowEntity?: boolean;
}

export const ROW_TEMPLATE_VARIABLES: TemplateVariable[] = [
  {
    token: 'name',
    label: 'Name',
    description: 'Friendly name of the row entity',
    requiresRowEntity: true,
  },
  {
    token: 'state',
    label: 'State',
    description: 'Raw state of the row entity',
    requiresRowEntity: true,
  },
  {
    token: 'state_label',
    label: 'State label',
    description: 'Formatted state (e.g. on → On)',
    requiresRowEntity: true,
  },
  {
    token: 'unit',
    label: 'Unit',
    description: 'Unit of measurement of the row entity',
    requiresRowEntity: true,
  },
  {
    token: 'entity',
    label: 'Entity ID',
    description: 'Row entity ID',
    requiresRowEntity: true,
  },
];

export function formatVariableSnippet(token: string): string {
  return `{{ ${token} }}`;
}

export function getTemplateVariables(rowEntityId?: string): TemplateVariable[] {
  const variables = [...ROW_TEMPLATE_VARIABLES];

  if (rowEntityId) {
    for (const base of ROW_TEMPLATE_VARIABLES) {
      if (base.requiresRowEntity) {
        variables.push({
          token: `${rowEntityId}.${base.token}`,
          label: `${rowEntityId} ${base.label.toLowerCase()}`,
          description: base.description,
        });
      }
    }
  }

  return variables;
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
