// Copyright (c) Meta Platforms, Inc. and affiliates.

import {getIconRegistry} from '@xds/core/Icon';

/**
 * @file parsePropType.ts
 * @input Stringified TypeScript prop types from component docs
 * @output Control descriptors and typed default/option coercion helpers
 * @position Component detail and playground prop-control generation.
 *
 * Parses a stringified TypeScript prop type into a control descriptor
 * that the playground can render an input for. Literal unions become
 * enum controls, including mixed string-literal + boolean unions.
 *
 * Ported from the internal docsite (nest/apps/xds).
 */

export interface ElementOption {
  label: string;
  componentName: string;
}

type InputStatusOption = 'error' | 'warning' | 'success';

export type EnumOptionValue = string | number | boolean;

export interface EnumPropControlDescriptor {
  kind: 'enum';
  options: string[];
  allowEmpty: boolean;
  optionValues?: Record<string, EnumOptionValue>;
}

export type PropControlDescriptor =
  | EnumPropControlDescriptor
  | {kind: 'input-status'; options: InputStatusOption[]; allowEmpty: boolean}
  | {kind: 'theme'}
  | {kind: 'syntax-theme'}
  | {kind: 'boolean'}
  | {kind: 'string'}
  | {kind: 'number'}
  | {kind: 'callback'}
  | {kind: 'element'; options: ElementOption[]}
  | {kind: 'slot-list'; options: ElementOption[]}
  | {kind: 'unknown'};

const STRING_LITERAL_RE = /^['"]([^'"]*)['"]$/;
const NUMBER_LITERAL_RE = /^-?\d+(\.\d+)?$/;
const CALLBACK_RE = /=>/;
const NODE_TYPE_RE = /\b(ReactNode|ReactElement|JSX\.Element|ReactChild)\b/;
const REACT_ELEMENT_RE = /ReactElement<(XDS\w+)Props>/g;

const INPUT_STATUS_OPTIONS: InputStatusOption[] = [
  'error',
  'warning',
  'success',
];

function hasStringLiteral(typeStr: string, value: string): boolean {
  return new RegExp(`['"]${value}['"]`).test(typeStr);
}

function parseStatusOptions(typeStr: string): InputStatusOption[] {
  const literalOptions = INPUT_STATUS_OPTIONS.filter(status =>
    hasStringLiteral(typeStr, status),
  );
  return literalOptions.length > 0 ? literalOptions : INPUT_STATUS_OPTIONS;
}

function isInputStatusType(typeStr: string, propName?: string): boolean {
  if (propName !== 'status') {
    return false;
  }

  if (/\bXDS(?:InputStatus|FieldStatus)\b/.test(typeStr)) {
    return true;
  }

  return (
    typeStr.trim().startsWith('{') &&
    /\btype\s*:/.test(typeStr) &&
    INPUT_STATUS_OPTIONS.some(status => hasStringLiteral(typeStr, status))
  );
}

function splitUnion(input: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  let inString: string | null = null;

  for (let i = 0; i < input.length; i++) {
    const c = input[i];

    if (inString) {
      if (c === inString && input[i - 1] !== '\\') {
        inString = null;
      }
      continue;
    }

    if (c === "'" || c === '"' || c === '`') {
      inString = c;
      continue;
    }

    if (c === '(' || c === '[' || c === '{' || c === '<') {
      depth++;
    } else if (c === ')' || c === ']' || c === '}' || c === '>') {
      depth--;
    } else if (c === '|' && depth === 0) {
      parts.push(input.slice(start, i).trim());
      start = i + 1;
    }
  }

  parts.push(input.slice(start).trim());
  return parts.filter(p => p.length > 0);
}

export function parsePropType(
  typeStr: string,
  propName?: string,
  slotElements?: Array<{__element: string; props?: Record<string, unknown>}>,
): PropControlDescriptor {
  const t = typeStr.trim();
  if (!t) {
    return {kind: 'unknown'};
  }

  // If slotElements is declared, use it directly for the element control
  if (slotElements && slotElements.length > 0) {
    const options = slotElements.map(el => ({
      label: el.__element.replace(/^XDS/, ''),
      componentName: el.__element,
    }));
    // children with slotElements → repeatable slot list (add/remove items)
    if (propName === 'children') {
      return {kind: 'slot-list', options};
    }
    return {kind: 'element', options};
  }

  if (CALLBACK_RE.test(t)) {
    return {kind: 'callback'};
  }

  if (t === 'boolean') {
    return {kind: 'boolean'};
  }
  if (t === 'string') {
    return {kind: 'string'};
  }
  if (t === 'number') {
    return {kind: 'number'};
  }

  if (t === 'SpacingStep') {
    return {
      kind: 'enum',
      options: ['0', '0.5', '1', '1.5', '2', '3', '4', '5', '6', '8', '10'],
      allowEmpty: false,
    };
  }
  if (t === 'SizeValue') {
    return {kind: 'number'};
  }
  if (t === 'XDSDefinedTheme') {
    return {kind: 'theme'};
  }
  if (t === 'SyntaxTheme') {
    return {kind: 'syntax-theme'};
  }
  if (isInputStatusType(t, propName)) {
    return {
      kind: 'input-status',
      options: parseStatusOptions(t),
      allowEmpty: true,
    };
  }
  if (t === 'XDSIconType' || t === 'XDSIconName') {
    return {
      kind: 'enum',
      options: Object.keys(getIconRegistry()),
      allowEmpty: true,
    };
  }
  if (t === 'XDSAppShellBreakpoint') {
    return {
      kind: 'enum',
      options: ['sm', 'md', 'lg', 'none'],
      allowEmpty: false,
    };
  }

  const elementMatches: ElementOption[] = [];
  let m;
  REACT_ELEMENT_RE.lastIndex = 0;
  while ((m = REACT_ELEMENT_RE.exec(t)) !== null) {
    const componentName = m[1];
    elementMatches.push({
      label: componentName.replace(/^XDS/, ''),
      componentName,
    });
  }
  if (elementMatches.length > 0) {
    return {kind: 'element', options: elementMatches};
  }

  if (NODE_TYPE_RE.test(t)) {
    const isIconProp =
      propName != null &&
      /^(icon|startIcon|endIcon|leftIcon|rightIcon)$/i.test(propName);
    if (isIconProp) {
      return {
        kind: 'element',
        options: [{label: 'Icon', componentName: 'XDSIcon'}],
      };
    }
    return {kind: 'string'};
  }

  const parts = splitUnion(t);
  const literals: string[] = [];
  const optionValues: Record<string, EnumOptionValue> = {};
  let allowEmpty = false;
  let onlyLiterals = true;
  let hasNonBooleanLiteral = false;
  let hasOptionValueOverrides = false;

  function addLiteral(value: string): void {
    if (!literals.includes(value)) {
      literals.push(value);
    }
  }

  function addOptionValue(option: string, value: EnumOptionValue): void {
    optionValues[option] = value;
    hasOptionValueOverrides = true;
  }

  for (const part of parts) {
    if (part === 'undefined' || part === 'null') {
      allowEmpty = true;
      continue;
    }
    if (part === 'boolean') {
      addLiteral('true');
      addLiteral('false');
      addOptionValue('true', true);
      addOptionValue('false', false);
      continue;
    }
    const sm = STRING_LITERAL_RE.exec(part);
    if (sm) {
      hasNonBooleanLiteral = true;
      addLiteral(sm[1]);
    } else if (NUMBER_LITERAL_RE.test(part)) {
      hasNonBooleanLiteral = true;
      addLiteral(part);
    } else if (part === 'true' || part === 'false') {
      addLiteral(part);
      addOptionValue(part, part === 'true');
    } else {
      onlyLiterals = false;
      break;
    }
  }

  if (onlyLiterals && literals.length >= 2) {
    if (!hasNonBooleanLiteral) {
      return {kind: 'boolean'};
    }
    return {
      kind: 'enum',
      options: literals,
      allowEmpty,
      ...(hasOptionValueOverrides ? {optionValues} : {}),
    };
  }

  return {kind: 'unknown'};
}

export function coerceEnumOption(
  control: EnumPropControlDescriptor,
  option: string,
): EnumOptionValue {
  if (
    control.optionValues != null &&
    Object.prototype.hasOwnProperty.call(control.optionValues, option)
  ) {
    return control.optionValues[option];
  }
  return option;
}

export function coerceDefault(
  raw: string | undefined,
  control: PropControlDescriptor,
): unknown {
  if (raw == null) {
    return undefined;
  }
  const v = raw.trim();
  if (!v) {
    return undefined;
  }

  switch (control.kind) {
    case 'boolean':
      return v === 'true';
    case 'number': {
      const n = Number(v);
      return Number.isFinite(n) ? n : undefined;
    }
    case 'enum': {
      const m = STRING_LITERAL_RE.exec(v);
      const stripped = m ? m[1] : v;
      return control.options.includes(stripped)
        ? coerceEnumOption(control, stripped)
        : undefined;
    }
    case 'string': {
      const m = STRING_LITERAL_RE.exec(v);
      return m ? m[1] : v;
    }
    case 'input-status': {
      const m = STRING_LITERAL_RE.exec(v);
      const stripped = m ? m[1] : v;
      return control.options.includes(stripped as InputStatusOption)
        ? {type: stripped, message: `${stripped} status`}
        : undefined;
    }
    case 'element':
      return undefined;
    default:
      return undefined;
  }
}
