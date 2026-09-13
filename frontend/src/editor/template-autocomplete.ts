import type { TemplateFormatOption, TemplateVariable } from '../template-variables';
import { formatVariableSnippet } from '../template-variables';

export type TemplateAutocompleteMode = 'variable' | 'format';

export interface TemplateAutocompleteContext {
  active: boolean;
  mode: TemplateAutocompleteMode;
  filter: string;
  replaceStart: number;
  token?: string;
}

export function getTemplateAutocompleteContext(
  value: string,
  cursor: number,
): TemplateAutocompleteContext {
  const inactive: TemplateAutocompleteContext = {
    active: false,
    mode: 'variable',
    filter: '',
    replaceStart: 0,
  };

  const before = value.slice(0, cursor);
  const lastOpen = before.lastIndexOf('{{');

  if (lastOpen === -1) {
    return inactive;
  }

  const afterOpen = before.slice(lastOpen + 2);
  if (afterOpen.includes('}}')) {
    return inactive;
  }

  const pipeIndex = afterOpen.indexOf('|');
  if (pipeIndex !== -1) {
    const token = afterOpen.slice(0, pipeIndex).trim();
    const filter = afterOpen.slice(pipeIndex + 1).trim().toLowerCase();

    return {
      active: true,
      mode: 'format',
      filter,
      replaceStart: lastOpen,
      token,
    };
  }

  return {
    active: true,
    mode: 'variable',
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

export function filterTemplateFormatOptions(
  options: TemplateFormatOption[],
  filter: string,
): TemplateFormatOption[] {
  if (!filter) {
    return options;
  }

  return options.filter((option) => {
    const haystack = `${option.format} ${option.label} ${option.description}`.toLowerCase();
    return haystack.includes(filter);
  });
}

export function applyTemplateVariableSuggestion(
  value: string,
  cursor: number,
  token: string,
  context: TemplateAutocompleteContext,
  supportsFormatting: boolean,
): { value: string; cursor: number; openFormatSuggestions: boolean } {
  if (supportsFormatting) {
    const partial = `{{ ${token} | `;
    const nextValue = value.slice(0, context.replaceStart) + partial + value.slice(cursor);

    return {
      value: nextValue,
      cursor: context.replaceStart + partial.length,
      openFormatSuggestions: true,
    };
  }

  const snippet = formatVariableSnippet(token);
  const nextValue = value.slice(0, context.replaceStart) + snippet + value.slice(cursor);

  return {
    value: nextValue,
    cursor: context.replaceStart + snippet.length,
    openFormatSuggestions: false,
  };
}

export function applyTemplateFormatSuggestion(
  value: string,
  cursor: number,
  token: string,
  format: string,
  context: TemplateAutocompleteContext,
): { value: string; cursor: number } {
  const snippet = formatVariableSnippet(token, format);
  const nextValue = value.slice(0, context.replaceStart) + snippet + value.slice(cursor);

  return {
    value: nextValue,
    cursor: context.replaceStart + snippet.length,
  };
}