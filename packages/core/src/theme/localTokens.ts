// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file localTokens.ts
 * @input Root and adaptation theme-local token declarations and references
 * @output Validated enrollment metadata plus normalized conditional writes
 * @position Theme-local namespace owner; final adaptation-cycle validation is
 *   performed after the reachable ordered cascade is assembled.
 */

import type {DefinedTheme, TokenValue} from './defineTheme';

const THEME_NAME_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

function isAsciiNameCodePoint(codePoint: number): boolean {
  return (
    codePoint === 0x2d ||
    codePoint === 0x5f ||
    (codePoint >= 0x30 && codePoint <= 0x39) ||
    (codePoint >= 0x41 && codePoint <= 0x5a) ||
    (codePoint >= 0x61 && codePoint <= 0x7a)
  );
}

function isNewline(codePoint: number): boolean {
  return codePoint === 0x0a || codePoint === 0x0c || codePoint === 0x0d;
}

function isHexDigit(codePoint: number): boolean {
  return (
    (codePoint >= 0x30 && codePoint <= 0x39) ||
    (codePoint >= 0x41 && codePoint <= 0x46) ||
    (codePoint >= 0x61 && codePoint <= 0x66)
  );
}

/**
 * Whether a string is one complete CSS custom-property name.
 *
 * Custom-property names are case-sensitive dashed identifiers. Keep escaped and
 * non-ASCII names byte-for-byte rather than normalizing them: spelling is part
 * of identity, while ownership lives in explicit metadata.
 */
function isValidCSSCustomPropertyName(name: string): boolean {
  const parsed = readCustomPropertyName(name, 0);
  return parsed?.end === name.length;
}

export interface ResolvedLocalTokenContract {
  localTokens: Record<string, string>;
  owners: Record<string, string>;
  lineage: string[];
}

function hasOwn(object: object, key: PropertyKey): boolean {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function resolveTokenValue(value: TokenValue, path: string): string {
  if (typeof value === 'string') {
    return value;
  }
  if (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === 'string' &&
    typeof value[1] === 'string'
  ) {
    return `light-dark(${value[0]}, ${value[1]})`;
  }
  throw new Error(
    `${path} must be a CSS string or a [light, dark] string tuple.`,
  );
}

function readCustomPropertyName(
  value: string,
  start: number,
): {name: string; end: number} | undefined {
  if (value.slice(start, start + 2) !== '--') {return undefined;}

  let index = start + 2;
  while (index < value.length) {
    const codePoint = value.codePointAt(index);
    if (codePoint === undefined || codePoint === 0) {break;}

    if (codePoint === 0x5c) {
      const nextIndex = index + 1;
      const next = value.codePointAt(nextIndex);
      if (next === undefined || isNewline(next)) {break;}

      if (isHexDigit(next)) {
        let cursor = nextIndex;
        let digits = 0;
        while (
          cursor < value.length &&
          digits < 6 &&
          isHexDigit(value.codePointAt(cursor) ?? -1)
        ) {
          cursor += 1;
          digits += 1;
        }
        const whitespace = value.codePointAt(cursor);
        if (
          whitespace === 0x20 ||
          whitespace === 0x09 ||
          whitespace === 0x0a ||
          whitespace === 0x0c ||
          whitespace === 0x0d
        ) {
          cursor +=
            whitespace === 0x0d && value.codePointAt(cursor + 1) === 0x0a
              ? 2
              : 1;
        }
        index = cursor;
        continue;
      }

      index = nextIndex + (next > 0xffff ? 2 : 1);
      continue;
    }

    if (codePoint < 0x80 && !isAsciiNameCodePoint(codePoint)) {break;}
    index += codePoint > 0xffff ? 2 : 1;
  }

  return index > start + 2
    ? {name: value.slice(start, index), end: index}
    : undefined;
}

function collectCustomPropertyReferences(
  value: unknown,
  refs: Set<string>,
): void {
  if (typeof value === 'string') {
    const functionPattern = /var\s*\(/gi;
    for (
      let match = functionPattern.exec(value);
      match;
      match = functionPattern.exec(value)
    ) {
      let start = functionPattern.lastIndex;
      while (/\s/.test(value[start] ?? '')) {start += 1;}
      const reference = readCustomPropertyName(value, start);
      if (reference) {refs.add(reference.name);}
    }
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      collectCustomPropertyReferences(item, refs);
    }
    return;
  }
  if (value && typeof value === 'object') {
    for (const nested of Object.values(value)) {
      collectCustomPropertyReferences(nested, refs);
    }
  }
}

export function assertNoTokenCycles(
  tokenValues: Record<string, string>,
  context?: string,
  relevantNames?: ReadonlySet<string>,
): void {
  const dependencies = new Map<string, string[]>();
  for (const [name, value] of Object.entries(tokenValues)) {
    const refs = new Set<string>();
    collectCustomPropertyReferences(value, refs);
    dependencies.set(
      name,
      [...refs].filter(reference => hasOwn(tokenValues, reference)),
    );
  }

  const findCyclePath = (
    start: string,
    component: ReadonlySet<string>,
  ): string[] => {
    const path = [start];
    const onPath = new Set(path);
    const search = (name: string): boolean => {
      for (const dependency of dependencies.get(name) ?? []) {
        if (!component.has(dependency)) {
          continue;
        }
        if (dependency === start) {
          path.push(start);
          return true;
        }
        if (onPath.has(dependency)) {
          continue;
        }
        path.push(dependency);
        onPath.add(dependency);
        if (search(dependency)) {
          return true;
        }
        onPath.delete(dependency);
        path.pop();
      }
      return false;
    };
    search(start);
    return path;
  };

  let nextIndex = 0;
  const indexes = new Map<string, number>();
  const lowlinks = new Map<string, number>();
  const stack: string[] = [];
  const onStack = new Set<string>();

  const visit = (name: string): void => {
    const index = nextIndex++;
    indexes.set(name, index);
    lowlinks.set(name, index);
    stack.push(name);
    onStack.add(name);

    for (const dependency of dependencies.get(name) ?? []) {
      if (!indexes.has(dependency)) {
        visit(dependency);
        lowlinks.set(
          name,
          Math.min(lowlinks.get(name) ?? index, lowlinks.get(dependency) ?? 0),
        );
      } else if (onStack.has(dependency)) {
        lowlinks.set(
          name,
          Math.min(lowlinks.get(name) ?? index, indexes.get(dependency) ?? 0),
        );
      }
    }

    if (lowlinks.get(name) !== index) {
      return;
    }

    const component: string[] = [];
    let member: string;
    do {
      member = stack.pop() ?? name;
      onStack.delete(member);
      component.push(member);
    } while (member !== name);

    const hasCycle =
      component.length > 1 ||
      (dependencies.get(component[0]) ?? []).includes(component[0]);
    if (
      !hasCycle ||
      (relevantNames &&
        !component.some(componentName => relevantNames.has(componentName)))
    ) {
      return;
    }

    const start =
      component.find(componentName => relevantNames?.has(componentName)) ??
      component[0];
    const cycle = findCyclePath(start, new Set(component)).join(' -> ');
    throw new Error(
      `${context ? `${context}: ` : ''}Theme token cycle detected: ${cycle}.`,
    );
  };

  for (const name of Object.keys(tokenValues)) {
    if (!indexes.has(name)) {
      visit(name);
    }
  }
}

function assertInheritedContract(
  themeName: string,
  base: DefinedTheme,
): asserts base is DefinedTheme & {
  localTokens: Record<string, string>;
  __localTokenOwners: Record<string, string>;
  __localTokenLineage: string[];
} {
  const lineage = base.__localTokenLineage;
  if (
    !Array.isArray(lineage) ||
    lineage.length === 0 ||
    lineage[lineage.length - 1] !== base.name ||
    lineage.some(name => typeof name !== 'string' || name.length === 0)
  ) {
    throw new Error(
      `defineTheme("${themeName}"): the base theme has invalid theme-local token lineage metadata.`,
    );
  }
  if (
    !base.localTokens ||
    typeof base.localTokens !== 'object' ||
    Array.isArray(base.localTokens) ||
    !base.__localTokenOwners ||
    typeof base.__localTokenOwners !== 'object' ||
    Array.isArray(base.__localTokenOwners)
  ) {
    throw new Error(
      `defineTheme("${themeName}"): the base theme has incomplete theme-local token metadata.`,
    );
  }

  for (const [name, value] of Object.entries(base.localTokens)) {
    const owner = base.__localTokenOwners[name];
    if (
      typeof value !== 'string' ||
      !owner ||
      !lineage.includes(owner) ||
      !isValidCSSCustomPropertyName(name)
    ) {
      throw new Error(
        `defineTheme("${themeName}"): inherited local token "${name}" does not match its exact lineage metadata.`,
      );
    }
  }
  for (const name of Object.keys(base.__localTokenOwners)) {
    if (!hasOwn(base.localTokens, name)) {
      throw new Error(
        `defineTheme("${themeName}"): inherited local-token owner metadata names undeclared token "${name}".`,
      );
    }
  }
}

/**
 * Resolve and validate the opt-in theme-local token contract.
 *
 * Themes that omit `localTokens` and do not extend an enrolled base bypass this
 * function's exact owner and lineage checks so legacy token behavior stays intact.
 */
export function resolveLocalTokenContract(
  input: {
    name: string;
    localTokens?: Record<string, TokenValue>;
  },
  base: DefinedTheme | undefined,
  tokens: Record<string, string>,
): ResolvedLocalTokenContract | undefined {
  const directlyEnrolled = hasOwn(input, 'localTokens');
  const inherited = base?.__localTokenLineage !== undefined;

  if (!directlyEnrolled && !inherited) {
    return undefined;
  }

  if (directlyEnrolled && !THEME_NAME_PATTERN.test(input.name)) {
    throw new Error(
      `defineTheme("${input.name}"): themes using localTokens require a stable lower-kebab name.`,
    );
  }

  if (inherited && base) {
    assertInheritedContract(input.name, base);
  }

  const localTokens = {...base?.localTokens};
  const owners = {...base?.__localTokenOwners};
  const declarations = input.localTokens;

  if (
    directlyEnrolled &&
    (declarations === null ||
      declarations === undefined ||
      typeof declarations !== 'object' ||
      Array.isArray(declarations))
  ) {
    throw new Error(
      `defineTheme("${input.name}"): localTokens must be a token map.`,
    );
  }

  for (const [name, value] of Object.entries(declarations ?? {})) {
    const inheritedOwner = owners[name];
    if (!isValidCSSCustomPropertyName(name)) {
      throw new Error(
        `defineTheme("${input.name}"): local token "${name}" must be a valid CSS custom-property name.`,
      );
    }
    if (!inheritedOwner) {
      owners[name] = input.name;
    }
    localTokens[name] = resolveTokenValue(
      value,
      `defineTheme("${input.name}").localTokens["${name}"]`,
    );
  }

  for (const name of Object.keys(localTokens)) {
    if (!owners[name]) {
      throw new Error(
        `defineTheme("${input.name}"): inherited local token "${name}" has no owner metadata.`,
      );
    }
    if (hasOwn(tokens, name)) {
      throw new Error(
        `defineTheme("${input.name}"): token "${name}" cannot be declared in both tokens and localTokens.`,
      );
    }
  }

  assertNoTokenCycles(localTokens, `defineTheme("${input.name}").localTokens`);

  return {
    localTokens,
    owners,
    lineage: [...(base?.__localTokenLineage ?? []), input.name],
  };
}

/**
 * Resolve theme-local values written by one adaptation rule.
 *
 * Adaptations may replace names already enrolled by the root theme lineage, but
 * they never enroll names of their own. This validates one rule's references;
 * cycle validation waits until all co-matching writes have cascaded in order.
 */
export function resolveAdaptationLocalTokens(
  themeName: string,
  ruleIndex: number,
  declarations: Record<string, TokenValue> | undefined,
  rootLocalTokens: Record<string, string> | undefined,
): Record<string, string> | undefined {
  const path = `defineTheme("${themeName}").adaptations.rules[${ruleIndex}].value.localTokens`;
  if (declarations === undefined) {return undefined;}
  if (
    declarations === null ||
    typeof declarations !== 'object' ||
    Array.isArray(declarations)
  ) {
    throw new Error(`${path} must be a token map.`);
  }

  const resolved: Record<string, string> = {};
  for (const [name, value] of Object.entries(declarations)) {
    if (!rootLocalTokens || !hasOwn(rootLocalTokens, name)) {
      throw new Error(
        `${path}["${name}"] cannot enroll a theme-local token. Declare it in the root theme or an exact enrolled base first.`,
      );
    }
    resolved[name] = resolveTokenValue(value, `${path}["${name}"]`);
  }

  return Object.keys(resolved).length > 0 ? resolved : undefined;
}
