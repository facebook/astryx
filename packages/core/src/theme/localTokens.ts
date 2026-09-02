// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {ComponentStyleMap, DefinedTheme, TokenValue} from './defineTheme';
import type {ResolvedOnMedia} from './onMediaTokens';

const LOCAL_TOKEN_PREFIX = '--astryx-theme-';
const THEME_NAME_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const LOCAL_TOKEN_SUFFIX_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CSS_VAR_PATTERN = /var\(\s*(--[^,\s)]+)/gi;

export interface ResolvedLocalTokenContract {
  localTokens: Record<string, string>;
  owners: Record<string, string>;
  lineage: string[];
}

function hasOwn(object: object, key: PropertyKey): boolean {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function isExactLocalTokenName(name: string, owner: string): boolean {
  const prefix = `${LOCAL_TOKEN_PREFIX}${owner}-`;
  return (
    name.startsWith(prefix) &&
    LOCAL_TOKEN_SUFFIX_PATTERN.test(name.slice(prefix.length))
  );
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

function collectLocalReferences(value: unknown, refs: Set<string>): void {
  if (typeof value === 'string') {
    CSS_VAR_PATTERN.lastIndex = 0;
    for (
      let match = CSS_VAR_PATTERN.exec(value);
      match;
      match = CSS_VAR_PATTERN.exec(value)
    ) {
      const name = match[1];
      if (name.startsWith(LOCAL_TOKEN_PREFIX)) {
        refs.add(name);
      }
    }
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      collectLocalReferences(item, refs);
    }
    return;
  }
  if (value && typeof value === 'object') {
    for (const nested of Object.values(value)) {
      collectLocalReferences(nested, refs);
    }
  }
}

function assertNoLocalTokenCycles(localTokens: Record<string, string>): void {
  const dependencies = new Map<string, string[]>();
  for (const [name, value] of Object.entries(localTokens)) {
    const refs = new Set<string>();
    collectLocalReferences(value, refs);
    dependencies.set(
      name,
      [...refs].filter(reference => hasOwn(localTokens, reference)),
    );
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (name: string, path: string[]): void => {
    if (visiting.has(name)) {
      const start = path.indexOf(name);
      const cycle = [...path.slice(start), name].join(' -> ');
      throw new Error(`Theme-local token cycle detected: ${cycle}.`);
    }
    if (visited.has(name)) {
      return;
    }
    visiting.add(name);
    for (const dependency of dependencies.get(name) ?? []) {
      visit(dependency, [...path, name]);
    }
    visiting.delete(name);
    visited.add(name);
  };

  for (const name of Object.keys(localTokens)) {
    visit(name, []);
  }
}

function assertDeclaredReferences(
  localTokens: Record<string, string>,
  components: ComponentStyleMap | undefined,
  onDark: ResolvedOnMedia | undefined,
  onLight: ResolvedOnMedia | undefined,
): void {
  const refs = new Set<string>();
  collectLocalReferences(localTokens, refs);
  collectLocalReferences(components, refs);
  collectLocalReferences(onDark?.components, refs);
  collectLocalReferences(onLight?.components, refs);

  for (const reference of refs) {
    if (!hasOwn(localTokens, reference)) {
      throw new Error(
        `Theme-local token reference "${reference}" has no declaration in the enrolled theme lineage.`,
      );
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
      !isExactLocalTokenName(name, owner)
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
 * function's reserved-namespace checks so legacy token behavior stays intact.
 */
export function resolveLocalTokenContract(
  input: {
    name: string;
    localTokens?: Record<string, TokenValue>;
  },
  base: DefinedTheme | undefined,
  tokens: Record<string, string>,
  components: ComponentStyleMap | undefined,
  onDark: ResolvedOnMedia | undefined,
  onLight: ResolvedOnMedia | undefined,
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
    if (!inheritedOwner) {
      const expectedPrefix = `${LOCAL_TOKEN_PREFIX}${input.name}-`;
      if (!isExactLocalTokenName(name, input.name)) {
        throw new Error(
          `defineTheme("${input.name}"): local token "${name}" must use the exact namespace "${expectedPrefix}" followed by a lowercase kebab-case purpose.`,
        );
      }
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

  assertDeclaredReferences(localTokens, components, onDark, onLight);
  assertNoLocalTokenCycles(localTokens);

  return {
    localTokens,
    owners,
    lineage: [...(base?.__localTokenLineage ?? []), input.name],
  };
}
