/**
 * Parses a stringified TypeScript prop type into a control descriptor
 * that the playground can render an input for.
 *
 * Ported from the internal docsite (nest/apps/xds).
 */

export interface ElementOption {
  label: string;
  componentName: string;
}

export type PropControlDescriptor =
  | {kind: 'enum'; options: string[]; allowEmpty: boolean}
  | {kind: 'boolean'}
  | {kind: 'string'}
  | {kind: 'number'}
  | {kind: 'callback'}
  | {kind: 'element'; options: ElementOption[]}
  | {kind: 'unknown'};

const STRING_LITERAL_RE = /^['"]([^'"]*)['"]$/;
const NUMBER_LITERAL_RE = /^-?\d+(\.\d+)?$/;
const CALLBACK_RE = /=>/;
const NODE_TYPE_RE = /\b(ReactNode|ReactElement|JSX\.Element|ReactChild)\b/;
const REACT_ELEMENT_RE = /ReactElement<(XDS\w+)Props>/g;

function splitUnion(input: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  let inString: string | null = null;

  for (let i = 0; i < input.length; i++) {
    const c = input[i];

    if (inString) {
      if (c === inString && input[i - 1] !== '\\') inString = null;
      continue;
    }

    if (c === "'" || c === '"' || c === '`') {
      inString = c;
      continue;
    }

    if (c === '(' || c === '[' || c === '{' || c === '<') depth++;
    else if (c === ')' || c === ']' || c === '}' || c === '>') depth--;
    else if (c === '|' && depth === 0) {
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
  if (!t) return {kind: 'unknown'};

  // If slotElements is declared, use it directly for the element control
  if (slotElements && slotElements.length > 0) {
    return {
      kind: 'element',
      options: slotElements.map(el => ({
        label: el.__element.replace(/^XDS/, ''),
        componentName: el.__element,
      })),
    };
  }

  if (CALLBACK_RE.test(t)) return {kind: 'callback'};

  if (t === 'boolean') return {kind: 'boolean'};
  if (t === 'string') return {kind: 'string'};
  if (t === 'number') return {kind: 'number'};

  if (t === 'SpacingStep') {
    return {
      kind: 'enum',
      options: ['0', '0.5', '1', '1.5', '2', '3', '4', '5', '6', '8', '10'],
      allowEmpty: false,
    };
  }
  if (t === 'SizeValue') return {kind: 'number'};
  if (t === 'XDSIconType' || t === 'XDSIconName') {
    return {
      kind: 'enum',
      options: [
        'check',
        'close',
        'info',
        'warning',
        'search',
        'calendar',
        'clock',
        'chevronDown',
        'chevronLeft',
        'chevronRight',
        'checkCircle',
        'xCircle',
        'externalLink',
        'menu',
        'moreHorizontal',
        'copy',
        'wrench',
        'arrowUp',
        'arrowDown',
        'eyeSlash',
      ],
      allowEmpty: true,
    };
  }
  if (t === 'XDSInputStatus') {
    return {
      kind: 'enum',
      options: ['default', 'error', 'warning', 'success'],
      allowEmpty: false,
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
  let allowEmpty = false;
  let onlyLiterals = true;

  for (const part of parts) {
    if (part === 'undefined' || part === 'null') {
      allowEmpty = true;
      continue;
    }
    const sm = STRING_LITERAL_RE.exec(part);
    if (sm) {
      literals.push(sm[1]);
    } else if (NUMBER_LITERAL_RE.test(part)) {
      literals.push(part);
    } else {
      onlyLiterals = false;
      break;
    }
  }

  if (onlyLiterals && literals.length >= 2) {
    return {kind: 'enum', options: literals, allowEmpty};
  }

  if (
    onlyLiterals === false &&
    parts.every(p => p === 'true' || p === 'false')
  ) {
    return {kind: 'boolean'};
  }

  return {kind: 'unknown'};
}

export function coerceDefault(
  raw: string | undefined,
  control: PropControlDescriptor,
): unknown {
  if (raw == null) return undefined;
  const v = raw.trim();
  if (!v) return undefined;

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
      return control.options.includes(stripped) ? stripped : undefined;
    }
    case 'string': {
      const m = STRING_LITERAL_RE.exec(v);
      return m ? m[1] : v;
    }
    case 'element':
      return undefined;
    default:
      return undefined;
  }
}
