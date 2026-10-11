// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file adaptiveIcons.tsx
 * @input Bound local capability contracts and supplied default-first artwork
 * @output Immutable adaptive source IR and actual ReactNode-valued read views
 * @position Server-safe source construction and one-direction size/appearance/weight selection
 */
import React, {type ComponentType, type ReactNode} from 'react';
import {
  defineIconCapabilities,
  getApplicationIconCapabilities,
  getOwnIconData,
  isRecord,
  requireKeys,
  requireRecord,
  validateIconCapabilities,
  validateIconWeightRange,
  type IconCapabilities,
  type IconContractAppearance,
  type IconContractSize,
  type IconContractWeight,
  type IconWeightRange,
} from './iconCapabilities';
import {isIconComponent} from './iconComponentType';

export interface ParameterizedIconVersion {
  readonly render: ComponentType<{weight?: number}>;
  readonly weightRange: IconWeightRange;
}
export type IconVersion = ReactNode | ParameterizedIconVersion;
type BranchMap<K extends string, V> = [K] extends [never]
  ? Readonly<Record<string, never>>
  : Readonly<Partial<Record<K, V>>>;
export interface AdaptiveIconTree<
  C extends IconCapabilities = IconCapabilities,
> {
  readonly default: IconVersion | AdaptiveIconTree<C>;
  readonly bySize?: BranchMap<
    IconContractSize<C>,
    IconVersion | AdaptiveIconTree<C>
  >;
  readonly byAppearance?: BranchMap<
    IconContractAppearance<C>,
    IconVersion | AdaptiveIconTree<C>
  >;
  readonly byWeight?: BranchMap<
    `${IconContractWeight<C>}`,
    IconVersion | AdaptiveIconTree<C>
  >;
}
export interface AdaptiveIconEntry<
  C extends IconCapabilities = IconCapabilities,
> {
  readonly capabilities: C;
  readonly tree: AdaptiveIconTree<C>;
}
export type IconEntry<C extends IconCapabilities = IconCapabilities> =
  ReactNode | AdaptiveIconTree<C> | AdaptiveIconEntry;
const immutableEntries = new WeakSet<object>();
const entriesWithMutableArrays = new WeakSet<object>();

export function isAdaptiveIconTree(value: unknown): value is AdaptiveIconTree {
  return (
    isRecord(value) &&
    (Object.hasOwn(value, 'default') ||
      Object.hasOwn(value, 'bySize') ||
      Object.hasOwn(value, 'byAppearance') ||
      Object.hasOwn(value, 'byWeight'))
  );
}
export function isAdaptiveIconEntry(
  value: unknown,
): value is AdaptiveIconEntry {
  return (
    isRecord(value) &&
    (Object.hasOwn(value, 'capabilities') || Object.hasOwn(value, 'tree'))
  );
}
export function isParameterizedIcon(
  value: unknown,
): value is ParameterizedIconVersion {
  return (
    isRecord(value) &&
    (Object.hasOwn(value, 'render') || Object.hasOwn(value, 'weightRange'))
  );
}
function isElement(value: unknown): boolean {
  const tag = getOwnIconData(value, '$$typeof');
  return (
    tag === Symbol.for('react.transitional.element') ||
    tag === Symbol.for('react.element')
  );
}
function hasDataMethod(value: object, key: PropertyKey): boolean {
  let current: object | null = value;
  while (current !== null) {
    const descriptor = Object.getOwnPropertyDescriptor(current, key);
    if (descriptor) {
      return 'value' in descriptor && typeof descriptor.value === 'function';
    }
    current = Object.getPrototypeOf(current);
  }
  return false;
}
function validateVersion(
  value: unknown,
  contract: IconCapabilities | undefined,
  stage: number,
  ancestors: Set<unknown>,
): void {
  if (ancestors.has(value)) {
    throw new Error('Icon: an adaptive entry cannot be cyclic.');
  }
  if (isParameterizedIcon(value)) {
    requireKeys(
      value as unknown as Record<string, unknown>,
      ['render', 'weightRange'],
      'parameterized version',
    );
    validateIconWeightRange(value.weightRange);
    if (!isIconComponent(value.render)) {
      throw new Error(
        'Icon: a parameterized version needs a supplied component.',
      );
    }
    const range = contract?.weights?.range;
    if (
      !range ||
      value.weightRange.min < range.min ||
      value.weightRange.max > range.max
    ) {
      throw new Error(
        'Icon: parameterized weights must be backed by the bound contract range.',
      );
    }
    return;
  }
  if (isAdaptiveIconTree(value)) {
    if (!contract) {
      throw new Error(
        'Icon: adaptive entries need a bound capability contract.',
      );
    }
    requireKeys(
      value as unknown as Record<string, unknown>,
      ['default', 'bySize', 'byAppearance', 'byWeight'],
      'adaptive branch',
    );
    if (!Object.hasOwn(value, 'default') || value.default == null) {
      throw new Error('Icon: every adaptive branch needs a supplied default.');
    }
    const app = getApplicationIconCapabilities(contract);
    const next = new Set(ancestors);
    next.add(value);
    const axes = ['bySize', 'byAppearance', 'byWeight'] as const;
    let firstAxis = 3;
    axes.forEach((axis, index) => {
      const branches = value[axis];
      if (branches === undefined) {
        return;
      }
      if (index < stage) {
        throw new Error(
          'Icon: branches must resolve size, appearance, then weight once.',
        );
      }
      firstAxis = Math.min(firstAxis, index);
      requireRecord(branches, axis);
      for (const [key, branch] of Object.entries(branches)) {
        const admitted =
          index === 0
            ? Object.hasOwn(app.sizes, key)
            : index === 1
              ? contract.appearances?.includes(key)
              : contract.weights?.values?.some(
                  weight => String(weight) === key,
                );
        if (!admitted) {
          throw new Error(`Icon: unadmitted ${axis} branch "${key}".`);
        }
        if (branch == null) {
          throw new Error('Icon: a branch must end in supplied artwork.');
        }
        validateVersion(branch, contract, index + 1, next);
      }
    });
    validateVersion(
      value.default,
      contract,
      firstAxis === 3 ? stage : firstAxis + 1,
      next,
    );
    return;
  }
  if (
    value == null ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint' ||
    (typeof value === 'number' && Number.isFinite(value)) ||
    isElement(value)
  ) {
    return;
  }
  if (Array.isArray(value)) {
    const next = new Set(ancestors);
    next.add(value);
    const length = Object.getOwnPropertyDescriptor(value, 'length')
      ?.value as number;
    for (let index = 0; index < length; index++) {
      const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
      if (descriptor && !('value' in descriptor)) {
        throw new Error('Icon: fixed arrays must contain data nodes.');
      }
      if (descriptor) {
        // Fixed containers may contain React nodes, never parameterized/source IR.
        validateVersion(descriptor.value, undefined, stage, next);
      }
    }
    return;
  }
  if (
    typeof value === 'object' &&
    value !== null &&
    (hasDataMethod(value, Symbol.iterator) ||
      hasDataMethod(value, 'then') ||
      getOwnIconData(value, '$$typeof') === Symbol.for('react.portal'))
  ) {
    return;
  }
  throw new Error(
    'Icon: entry must be supplied React artwork or a valid adaptive branch.',
  );
}
export function validateIconEntry(
  entry: unknown,
  capabilities?: IconCapabilities,
): void {
  if (
    typeof entry === 'object' &&
    entry !== null &&
    immutableEntries.has(entry) &&
    !entriesWithMutableArrays.has(entry)
  ) {
    return;
  }
  if (isAdaptiveIconTree(entry) && capabilities) {
    validateIconCapabilities(capabilities);
  }
  if (isAdaptiveIconEntry(entry)) {
    requireKeys(
      entry as unknown as Record<string, unknown>,
      ['capabilities', 'tree'],
      'adaptive entry',
    );
    validateIconCapabilities(entry.capabilities);
    if (!isAdaptiveIconTree(entry.tree)) {
      throw new Error('Icon: bound adaptive entry needs an artwork tree.');
    }
    validateVersion(entry.tree, entry.capabilities, 0, new Set());
  } else {
    if (isParameterizedIcon(entry)) {
      throw new Error(
        'Icon: parameterized versions belong in an adaptive artwork tree.',
      );
    }
    validateVersion(entry, capabilities, 0, new Set());
  }
}
function snapshotVersion(
  value: IconVersion | AdaptiveIconTree,
  mutableArrays: {found: boolean},
): IconVersion | AdaptiveIconTree {
  if (isAdaptiveIconTree(value)) {
    const result: {
      default: IconVersion | AdaptiveIconTree;
      bySize?: Readonly<Record<string, IconVersion | AdaptiveIconTree>>;
      byAppearance?: Readonly<Record<string, IconVersion | AdaptiveIconTree>>;
      byWeight?: Readonly<Record<string, IconVersion | AdaptiveIconTree>>;
    } = {default: snapshotVersion(value.default, mutableArrays)};
    for (const axis of ['bySize', 'byAppearance', 'byWeight'] as const) {
      if (value[axis]) {
        result[axis] = Object.freeze(
          Object.fromEntries(
            Object.entries(value[axis]).map(([key, branch]) => [
              key,
              snapshotVersion(branch, mutableArrays),
            ]),
          ),
        );
      }
    }
    return Object.freeze(result);
  }
  if (isParameterizedIcon(value)) {
    return Object.freeze({
      render: value.render,
      weightRange: Object.freeze({...value.weightRange}),
    });
  }
  if (Array.isArray(value)) {
    // Preserve the supplied ReactNode identity. Mutable fixed arrays still need runtime validation.
    mutableArrays.found = true;
  }
  return value;
}
export function normalizeIconEntry(
  entry: unknown,
  capabilities?: IconCapabilities,
): IconEntry {
  if (
    typeof entry === 'object' &&
    entry !== null &&
    immutableEntries.has(entry)
  ) {
    validateIconEntry(entry);
    return entry as IconEntry;
  }
  validateIconEntry(entry, capabilities);
  if (
    typeof entry === 'object' &&
    entry !== null &&
    isElement(entry) &&
    Object.isFrozen(entry)
  ) {
    immutableEntries.add(entry);
  }
  if (isAdaptiveIconEntry(entry)) {
    return defineAdaptiveIcon(entry.capabilities, entry.tree);
  }
  if (isAdaptiveIconTree(entry)) {
    if (!capabilities) {
      throw new Error(
        'Icon: adaptive entries need a bound capability contract.',
      );
    }
    return defineAdaptiveIcon(capabilities, entry);
  }
  return entry as ReactNode;
}
export function prepareIconEntries(
  entries: unknown,
  capabilities?: IconCapabilities,
): {
  entries: Readonly<Record<string, IconEntry>>;
  contracts: ReadonlyArray<IconCapabilities>;
} {
  if (entries === undefined || entries === null) {
    return {entries: Object.freeze({}), contracts: Object.freeze([])};
  }
  requireRecord(entries, 'icon entries');
  const normalized: Record<string, IconEntry> = {};
  const contracts: IconCapabilities[] = [];
  for (const [name, entry] of Object.entries(entries)) {
    const bound = normalizeIconEntry(entry, capabilities);
    normalized[name] = bound;
    const contract = getIconEntryContract(bound);
    if (contract) {
      contracts.push(contract);
    }
  }
  getApplicationIconCapabilities(...contracts);
  return {
    entries: Object.freeze(normalized),
    contracts: Object.freeze([...new Set(contracts)]),
  };
}
export function defineAdaptiveIcon<const C extends IconCapabilities>(
  capabilities: C,
  tree: AdaptiveIconTree<NoInfer<C>>,
): AdaptiveIconEntry<C> {
  const contract = defineIconCapabilities(capabilities);
  validateIconEntry({capabilities: contract, tree});
  const mutableArrays = {found: false};
  const entry = Object.freeze({
    capabilities: contract,
    tree: snapshotVersion(tree, mutableArrays) as AdaptiveIconTree<C>,
  });
  immutableEntries.add(entry);
  if (mutableArrays.found) {
    entriesWithMutableArrays.add(entry);
  }
  return entry;
}
export function getIconEntryContract(
  entry: unknown,
  fallback?: IconCapabilities,
): IconCapabilities | undefined {
  return isAdaptiveIconEntry(entry)
    ? entry.capabilities
    : isAdaptiveIconTree(entry)
      ? fallback
      : undefined;
}
export function getIconSourceDefaults(
  entries: Readonly<Record<string, IconEntry>>,
): Readonly<Record<string, ReactNode>> {
  const nodes: Record<string, ReactNode> = {};
  let adaptive = false;
  for (const [name, entry] of Object.entries(entries)) {
    let current: IconVersion | AdaptiveIconTree = isAdaptiveIconEntry(entry)
      ? entry.tree
      : entry;
    adaptive ||= isAdaptiveIconEntry(entry) || isAdaptiveIconTree(entry);
    while (isAdaptiveIconTree(current)) {
      current = current.default;
    }
    nodes[name] = isParameterizedIcon(current)
      ? React.createElement(current.render)
      : current;
  }
  return adaptive
    ? Object.freeze(nodes)
    : (entries as Readonly<Record<string, ReactNode>>);
}
export interface AdaptiveAxisResult {
  supported: boolean;
  selected?: string | number;
  fallback: boolean;
}
export interface AdaptiveSelection {
  node: ReactNode;
  size: AdaptiveAxisResult;
  appearance: AdaptiveAxisResult;
  weight: AdaptiveAxisResult;
}
export function selectAdaptiveIcon(
  entry: IconEntry,
  request: {size: string; appearance?: string; weight?: string | number},
  renderNode = true,
): AdaptiveSelection {
  let current: IconVersion | AdaptiveIconTree = isAdaptiveIconEntry(entry)
    ? entry.tree
    : entry;
  const result: AdaptiveSelection = {
    node: null,
    size: {supported: false, fallback: false},
    appearance: {supported: false, fallback: false},
    weight: {supported: false, fallback: false},
  };
  for (const [axis, field] of [
    ['size', 'bySize'],
    ['appearance', 'byAppearance'],
    ['weight', 'byWeight'],
  ] as const) {
    const value = request[axis];
    while (isAdaptiveIconTree(current) && !current[field]) {
      const axes = ['bySize', 'byAppearance', 'byWeight'] as const;
      if (
        axes
          .slice(axes.indexOf(field) + 1)
          .some(
            later => current && isAdaptiveIconTree(current) && current[later],
          )
      ) {
        break;
      }
      current = current.default;
    }
    if (isAdaptiveIconTree(current) && current[field]) {
      const branches = current[field] as Readonly<
        Record<string, IconVersion | AdaptiveIconTree>
      >;
      const matched =
        value !== undefined && Object.hasOwn(branches, String(value));
      result[axis] = {
        supported: matched,
        ...(matched ? {selected: value} : {}),
        fallback: value !== undefined && !matched,
      };
      current = matched ? branches[String(value)] : current.default;
    }
  }
  while (isAdaptiveIconTree(current)) {
    current = current.default;
  }
  if (isParameterizedIcon(current)) {
    const weight = request.weight;
    const matched =
      typeof weight === 'number' &&
      Number.isFinite(weight) &&
      weight >= current.weightRange.min &&
      weight <= current.weightRange.max;
    result.weight = {
      supported: matched,
      ...(matched ? {selected: weight} : {}),
      fallback: weight !== undefined && !matched,
    };
    result.node = renderNode
      ? React.createElement(current.render, matched ? {weight} : undefined)
      : null;
  } else {
    result.node = renderNode ? current : null;
  }
  return result;
}
