import type { TemplateVariable } from '../template-variables';
import { formatVariableSnippet } from '../template-variables';

export interface TemplateAutocompleteContext {
  active: boolean;
  filter: string;
  replaceStart: number;
}

export function getTemplateAutocompleteContext(
  value: string,
  cursor: number,
): TemplateAutocompleteContext {
  const before = value.slice(0, cursor);
  const lastOpen = before.lastIndexOf('{{');

  if (lastOpen === -1) {
    return { active: false, filter: '', replaceStart: 0 };
  }

  const afterOpen = before.slice(lastOpen + 2);
  if (afterOpen.includes('}}')) {
    return { active: false, filter: '', replaceStart: 0 };
  }

  return {
    active: true,
    filter: afterOpen.trim().toLowerCase(),
    replaceStart: lastOpen,
  };
}

export function filterTemplateVariables(
  variables: TemplateVariable[],
  filter: string,
): TemplateVariable[] {
  if (!filter) {
    return variables;
  }

  return variables.filter((variable) => {
    const haystack = `${variable.token} ${variable.label} ${variable.description}`.toLowerCase();
    return haystack.includes(filter);
  });
}

export function applyTemplateSuggestion(
  value: string,
  cursor: number,
  token: string,
  context: TemplateAutocompleteContext,
): { value: string; cursor: number } {
  const snippet = formatVariableSnippet(token);
  const nextValue = value.slice(0, context.replaceStart) + snippet + value.slice(cursor);

  return {
    value: nextValue,
    cursor: context.replaceStart + snippet.length,
  };
}
