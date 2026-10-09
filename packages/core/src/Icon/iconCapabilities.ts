// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file iconCapabilities.ts
 * @input Grouped library contracts, foreign own-data contributors and default/per-size presentation
 * @output Immutable local snapshots, pure cached composition and sibling-safe theme policy
 * @position Server-safe Icon engine; no process-wide capability admission
 */
import type {IconCapabilityMap} from './index';
import {checkDeclarationValue} from '../theme/declarationBoundary';

export type BuiltInIconSize = 'xsm' | 'sm' | 'md' | 'lg';
export interface IconWeightRange {
  readonly min: number;
  readonly max: number;
}
export interface IconCapabilities {
  readonly sizes?: Readonly<Record<string, {readonly default: string}>>;
  readonly appearances?: ReadonlyArray<string>;
  readonly weights?:
    | {readonly values: ReadonlyArray<string | number>; readonly range?: never}
    | {readonly range: IconWeightRange; readonly values?: never};
}
type SizesOf<C> = C extends unknown
  ? 'sizes' extends keyof C
    ? C extends {readonly sizes?: infer S}
      ? keyof NonNullable<S> & string
      : never
    : never
  : never;
type AppearancesOf<C> = C extends unknown
  ? 'appearances' extends keyof C
    ? C extends {readonly appearances?: ReadonlyArray<infer A extends string>}
      ? A
      : never
    : never
  : never;
type WeightsFrom<W> = W extends {
  readonly values: ReadonlyArray<infer V extends string | number>;
}
  ? V
  : W extends {readonly range: IconWeightRange}
    ? number
    : never;
type WeightsOf<C> = C extends unknown
  ? 'weights' extends keyof C
    ? C extends {readonly weights?: infer W}
      ? WeightsFrom<NonNullable<W>>
      : never
    : never
  : never;
type ApplicationContract = IconCapabilityMap[keyof IconCapabilityMap];
export type IconSize = BuiltInIconSize | SizesOf<ApplicationContract>;
export type IconAppearance = AppearancesOf<ApplicationContract>;
export type IconWeight = WeightsOf<ApplicationContract>;
export type IconContractSize<C> = BuiltInIconSize | SizesOf<C>;
export type IconContractAppearance<C> = AppearancesOf<C>;
export type IconContractWeight<C> = WeightsOf<C>;
export interface IconRequest<C = ApplicationContract> {
  size?: IconSize | SizesOf<C>;
  appearance?: IconAppearance | AppearancesOf<C>;
  weight?: IconWeight | WeightsOf<C>;
}
type PartialMap<K extends string, V> = [K] extends [never]
  ? Readonly<Record<string, never>>
  : Readonly<Partial<Record<K, V>>>;
export interface IconPresentationPolicy<C = ApplicationContract> {
  readonly default?: {
    readonly appearance?: IconAppearance | AppearancesOf<C>;
    readonly weight?: IconWeight | WeightsOf<C>;
  };
  readonly bySize?: PartialMap<
    IconSize | SizesOf<C>,
    {
      readonly appearance?: IconAppearance | AppearancesOf<C>;
      readonly weight?: IconWeight | WeightsOf<C>;
    }
  >;
}
export interface IconThemeCapabilitiesInput<
  C extends IconCapabilities = Record<never, never>,
> {
  readonly contract?: C;
  readonly sizeOverrides?: PartialMap<IconSize | SizesOf<C>, string | null>;
  readonly presentation?: IconPresentationPolicy<C> | null;
}
/** Normalized read policy retains null inheritance-clearing markers. */
export interface IconThemeCapabilities {
  readonly contract?: IconCapabilities;
  readonly sizeOverrides?: Readonly<Record<string, string | null>>;
  readonly presentation?: {
    readonly default?: {
      readonly appearance?: string;
      readonly weight?: string | number;
    };
    readonly bySize?: Readonly<
      Record<
        string,
        {
          readonly appearance?: string;
          readonly weight?: string | number;
        }
      >
    >;
  } | null;
}
export interface ApplicationIconCapabilities {
  readonly sizes: Readonly<Record<string, {readonly default: string}>>;
  readonly appearances: ReadonlyArray<string>;
  readonly weights: {
    readonly values: ReadonlyArray<string | number>;
    readonly ranges: ReadonlyArray<IconWeightRange>;
  };
}
export const builtInIconDimensions = Object.freeze({
  xsm: '12px',
  sm: '16px',
  md: '20px',
  lg: '24px',
});
const contractSnapshots = new WeakSet<object>();
const inputContractSnapshots = new WeakMap<
  object,
  {fingerprint: string; snapshot: IconCapabilities}
>();
interface CompositionNode {
  children: WeakMap<object, CompositionNode>;
  value?: ApplicationIconCapabilities;
}
const compositionCache: CompositionNode = {children: new WeakMap()};
const policyContracts = new WeakMap<object, ReadonlyArray<IconCapabilities>>();

/** @internal Own-data reads do not invoke accessors or coerce opaque values. */
// eslint-disable-next-line @typescript-eslint/promise-function-async -- Opaque data, including React promises, is read synchronously and never awaited.
export function getOwnIconData(value: unknown, key: string): unknown {
  if (value === null || typeof value !== 'object') {
    return undefined;
  }
  const descriptor = Object.getOwnPropertyDescriptor(value, key);
  if (descriptor && !('value' in descriptor)) {
    throw new Error('Icon: runtime fields must be plain data.');
  }
  return descriptor?.value;
}
export function isRecord(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
export function requireRecord(
  value: unknown,
  label: string,
): asserts value is Record<string, unknown> {
  if (!isRecord(value)) {
    throw new Error(`Icon: ${label} must be a plain object.`);
  }
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (typeof key !== 'string' || !descriptor || !('value' in descriptor)) {
      throw new Error(`Icon: ${label} must contain plain data fields.`);
    }
  }
}
export function requireIconDataArray(
  value: unknown,
  label: string,
): asserts value is ReadonlyArray<unknown> {
  // Contract arrays are data, never a vehicle for inherited getters or iterator behavior.
  if (
    !Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Array.prototype
  ) {
    throw new Error(`Icon: ${label} must be a data array.`);
  }
  const length = Object.getOwnPropertyDescriptor(value, 'length')?.value;
  if (
    typeof length !== 'number' ||
    Reflect.ownKeys(value).length !== length + 1
  ) {
    throw new Error(`Icon: ${label} must contain only finite data items.`);
  }
  for (let index = 0; index < length; index++) {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (!descriptor || !('value' in descriptor)) {
      throw new Error(`Icon: ${label} must contain plain data items.`);
    }
  }
}
export function requireKeys(
  value: Record<string, unknown>,
  keys: ReadonlyArray<string>,
  label: string,
): void {
  requireRecord(value, label);
  if (
    Reflect.ownKeys(value).some(
      key => typeof key !== 'string' || !keys.includes(key),
    )
  ) {
    throw new Error(`Icon: ${label} contains an unknown field.`);
  }
}
function validName(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.trim() === value &&
    value.length > 0 &&
    !['__proto__', 'constructor', 'prototype'].includes(value)
  );
}
export function validateIconDimension(value: unknown): asserts value is string {
  if (
    typeof value !== 'string' ||
    value.trim() !== value ||
    checkDeclarationValue(value) !== null
  ) {
    throw new Error('Icon: a size dimension must be a safe CSS length.');
  }
  const literal =
    /^(?:\d+(?:\.\d+)?|\.\d+)(?:px|rem|em|ch|ex|cap|ic|lh|rlh|vw|vh|vi|vb|vmin|vmax|svw|svh|lvw|lvh|dvw|dvh|cqw|cqh|cqi|cqb|cqmin|cqmax|cm|mm|Q|in|pt|pc)$/;
  if (literal.test(value) && parseFloat(value) > 0) {
    return;
  }
  if (
    /^(?:var|calc|min|max|clamp)\(.+\)$/.test(value) &&
    !/[;{}]/.test(value)
  ) {
    const nonMath = value
      .replace(/--[-\w]+/g, '1px')
      .replace(/\b(?:var|calc|min|max|clamp)\s*\(/g, '(')
      .replace(
        /(?:\d+(?:\.\d+)?|\.\d+)(?:px|rem|em|ch|ex|cap|ic|lh|rlh|vw|vh|vi|vb|vmin|vmax|svw|svh|lvw|lvh|dvw|dvh|cqw|cqh|cqi|cqb|cqmin|cqmax|cm|mm|Q|in|pt|pc)?/g,
        '0',
      )
      .replace(/[()\s,0+*/-]/g, '');
    if (
      nonMath === '' &&
      !/\(\s*\)|[+*/-]\s*\)/.test(value) &&
      (value.includes('var(--') ||
        /\d(?:px|rem|em|ch|ex|cap|ic|lh|rlh|vw|vh|vi|vb|vmin|vmax|svw|svh|lvw|lvh|dvw|dvh|cqw|cqh|cqi|cqb|cqmin|cqmax|cm|mm|Q|in|pt|pc)/.test(
          value,
        ))
    ) {
      return;
    }
  }
  throw new Error(
    'Icon: a size dimension must be a positive CSS length or CSS length expression.',
  );
}
export function validateIconWeightRange(
  range: unknown,
): asserts range is IconWeightRange {
  requireRecord(range, 'weight range');
  requireKeys(range, ['min', 'max'], 'weight range');
  if (
    typeof range.min !== 'number' ||
    typeof range.max !== 'number' ||
    !Number.isFinite(range.min) ||
    !Number.isFinite(range.max) ||
    range.min >= range.max
  ) {
    throw new Error('Icon: a weight range needs finite min < max.');
  }
}
function validWeight(value: unknown): value is string | number {
  return (
    validName(value) || (typeof value === 'number' && Number.isFinite(value))
  );
}
export function validateIconCapabilities(
  input: unknown,
): asserts input is IconCapabilities {
  requireRecord(input, 'capability contract');
  requireKeys(
    input,
    ['sizes', 'appearances', 'weights'],
    'capability contract',
  );
  if (input.sizes !== undefined) {
    requireRecord(input.sizes, 'sizes');
    for (const [name, size] of Object.entries(input.sizes)) {
      if (!validName(name)) {
        throw new Error('Icon: invalid size name.');
      }
      requireRecord(size, 'size');
      requireKeys(size, ['default'], 'size');
      validateIconDimension(size.default);
    }
  }
  if (input.appearances !== undefined) {
    requireIconDataArray(input.appearances, 'appearances');
    if (
      !input.appearances.length ||
      !input.appearances.every(validName) ||
      new Set(input.appearances).size !== input.appearances.length
    ) {
      throw new Error('Icon: appearances must be unique nonempty names.');
    }
  }
  if (input.weights !== undefined) {
    requireRecord(input.weights, 'weights');
    requireKeys(input.weights, ['values', 'range'], 'weights');
    if (
      input.weights.values !== undefined &&
      input.weights.range === undefined
    ) {
      const values = input.weights.values;
      requireIconDataArray(values, 'exact weights');
      if (
        !values.length ||
        !values.every(validWeight) ||
        new Set(values.map(String)).size !== values.length
      ) {
        throw new Error(
          'Icon: exact weights must be unique finite numbers or nonempty names.',
        );
      }
    } else if (
      input.weights.range !== undefined &&
      input.weights.values === undefined
    ) {
      validateIconWeightRange(input.weights.range);
    } else {
      throw new Error(
        'Icon: weights declare either exact values or one range.',
      );
    }
  }
}
export function defineIconCapabilities<const C extends IconCapabilities>(
  input: C,
): C {
  if (
    typeof input === 'object' &&
    input !== null &&
    contractSnapshots.has(input)
  ) {
    return input;
  }
  validateIconCapabilities(input);
  const fingerprint = JSON.stringify(input);
  const previous = inputContractSnapshots.get(input);
  if (previous?.fingerprint === fingerprint) {
    return previous.snapshot as C;
  }
  composeCapabilities([input]);
  const snapshot = freezeCopy(input);
  contractSnapshots.add(snapshot);
  inputContractSnapshots.set(input, {fingerprint, snapshot});
  return snapshot;
}
/** Plain policy/contract data only; supplied React nodes and callbacks stay opaque. */
function freezeCopy<T>(input: T): T {
  if (
    typeof input === 'object' &&
    input !== null &&
    contractSnapshots.has(input)
  ) {
    return input;
  }
  if (Array.isArray(input)) {
    return Object.freeze(input.map(freezeCopy)) as T;
  }
  if (isRecord(input)) {
    return Object.freeze(
      Object.fromEntries(
        Object.entries(input).map(([key, value]) => [key, freezeCopy(value)]),
      ),
    ) as T;
  }
  return input;
}
function composeCapabilities(
  contracts: ReadonlyArray<IconCapabilities>,
): ApplicationIconCapabilities {
  const sizes: Record<string, {default: string}> = Object.fromEntries(
    Object.entries(builtInIconDimensions).map(([name, dimension]) => [
      name,
      {default: dimension},
    ]),
  );
  const appearances = new Set<string>();
  const values = new Set<string | number>();
  const ranges = new Map<string, IconWeightRange>();
  for (const contract of contracts) {
    if (!contractSnapshots.has(contract)) {
      validateIconCapabilities(contract);
    }
    for (const [name, size] of Object.entries(contract.sizes ?? {})) {
      const builtIn = builtInIconDimensions[name as BuiltInIconSize];
      const equivalent =
        builtIn !== undefined &&
        /^(?:\d+(?:\.\d+)?|\.\d+)(?:px|rem)$/.test(size.default) &&
        parseFloat(size.default) * (size.default.endsWith('rem') ? 16 : 1) ===
          parseFloat(builtIn);
      if (sizes[name] && sizes[name].default !== size.default && !equivalent) {
        throw new Error(
          `Icon: conflicting canonical default for size "${name}".`,
        );
      }
      sizes[name] = {default: builtIn ?? size.default};
    }
    contract.appearances?.forEach(value => appearances.add(value));
    contract.weights?.values?.forEach(value => values.add(value));
    if (contract.weights?.range) {
      ranges.set(
        `${contract.weights.range.min}:${contract.weights.range.max}`,
        contract.weights.range,
      );
    }
  }
  return freezeCopy({
    sizes,
    appearances: [...appearances].sort(),
    weights: {
      values: [...values].sort((a, b) => {
        const left = `${typeof a}:${a}`;
        const right = `${typeof b}:${b}`;
        return left < right ? -1 : left > right ? 1 : 0;
      }),
      ranges: [...ranges.values()].sort(
        (a, b) => a.min - b.min || a.max - b.max,
      ),
    },
  });
}
const builtInCapabilities = composeCapabilities([]);
export function getApplicationIconCapabilities(
  ...contracts: (IconCapabilities | undefined)[]
): ApplicationIconCapabilities {
  const local = [
    ...new Set(
      contracts.filter(
        (value): value is IconCapabilities => value !== undefined,
      ),
    ),
  ];
  if (!local.length) {
    return builtInCapabilities;
  }
  if (local.every(value => contractSnapshots.has(value))) {
    let cache = compositionCache;
    for (const contract of local) {
      let next = cache.children.get(contract);
      if (!next) {
        next = {children: new WeakMap()};
        cache.children.set(contract, next);
      }
      cache = next;
    }
    cache.value ??= composeCapabilities(local);
    return cache.value;
  }
  return composeCapabilities(local);
}
/** @internal Read contract contributors independently, without foreign array getters or methods. */
export function readIconThemeContractList(
  input: unknown,
  notifyInvalid: () => void,
): ReadonlyArray<IconCapabilities> {
  const contracts: IconCapabilities[] = [];
  if (input === undefined) {
    return Object.freeze(contracts);
  }
  try {
    if (!Array.isArray(input)) {
      throw new Error('Icon: theme contracts must be an array.');
    }
    const length = getOwnIconData(input, 'length');
    if (
      typeof length !== 'number' ||
      !Number.isSafeInteger(length) ||
      length < 0
    ) {
      throw new Error('Icon: theme contracts must have a finite data length.');
    }
    let indices = 0;
    for (const key of Reflect.ownKeys(input)) {
      if (key === 'length') {
        continue;
      }
      if (
        typeof key !== 'string' ||
        !/^(0|[1-9]\d*)$/.test(key) ||
        Number(key) >= length
      ) {
        notifyInvalid();
        continue;
      }
      indices++;
      try {
        const value = getOwnIconData(input, key);
        contracts.push(defineIconCapabilities(value as IconCapabilities));
      } catch {
        notifyInvalid();
      }
    }
    // Sparse slots are malformed, but never prevent valid own-data siblings from surviving.
    if (indices !== length) {
      notifyInvalid();
    }
  } catch {
    notifyInvalid();
  }
  return Object.freeze(contracts);
}

/** @internal Contracts are local immutable policy metadata, not module admission. */
export function getIconThemeContracts(
  policy: IconThemeCapabilities | undefined,
): ReadonlyArray<IconCapabilities> {
  if (!policy || typeof policy !== 'object') {
    return [];
  }
  const cached = policyContracts.get(policy);
  if (cached) {
    return cached;
  }
  try {
    const contract = getOwnIconData(policy, 'contract');
    return contract === undefined
      ? []
      : Object.freeze([defineIconCapabilities(contract as IconCapabilities)]);
  } catch {
    return [];
  }
}
export function admitsIconWeight(
  capabilities: ApplicationIconCapabilities | IconCapabilities,
  value: unknown,
): value is string | number {
  if (!validWeight(value) || !capabilities.weights) {
    return false;
  }
  const weights = capabilities.weights;
  if (weights.values?.includes(value)) {
    return true;
  }
  const ranges =
    'ranges' in weights ? weights.ranges : weights.range ? [weights.range] : [];
  return (
    typeof value === 'number' &&
    ranges.some(range => value >= range.min && value <= range.max)
  );
}
export function validateIconThemeCapabilities(
  input: unknown,
  inherited?: IconThemeCapabilities,
  contracts: ReadonlyArray<IconCapabilities> = [],
): asserts input is IconThemeCapabilities {
  requireRecord(input, 'theme iconCapabilities');
  requireKeys(
    input,
    ['contract', 'sizeOverrides', 'presentation'],
    'theme iconCapabilities',
  );
  if (input.contract !== undefined) {
    validateIconCapabilities(input.contract);
  }
  const app = getApplicationIconCapabilities(
    inherited?.contract,
    input.contract,
    ...contracts,
  );
  if (input.sizeOverrides !== undefined) {
    requireRecord(input.sizeOverrides, 'sizeOverrides');
    for (const [size, dimension] of Object.entries(input.sizeOverrides)) {
      if (!Object.hasOwn(app.sizes, size)) {
        throw new Error(`Icon: unadmitted size override "${size}".`);
      }
      if (dimension !== null) {
        validateIconDimension(dimension);
      }
    }
  }
  function validatePresentation(value: unknown): void {
    requireRecord(value, 'presentation request');
    requireKeys(value, ['appearance', 'weight'], 'presentation request');
    if (
      value.appearance !== undefined &&
      !app.appearances.includes(value.appearance as string)
    ) {
      throw new Error('Icon: unadmitted theme appearance.');
    }
    if (value.weight !== undefined && !admitsIconWeight(app, value.weight)) {
      throw new Error('Icon: unadmitted theme weight.');
    }
  }
  if (input.presentation !== undefined && input.presentation !== null) {
    const policy = input.presentation;
    requireRecord(policy, 'presentation');
    requireKeys(policy, ['default', 'bySize'], 'presentation');
    if (policy.default !== undefined) {
      validatePresentation(policy.default);
    }
    if (policy.bySize !== undefined) {
      requireRecord(policy.bySize, 'bySize');
      for (const [size, value] of Object.entries(policy.bySize)) {
        if (!Object.hasOwn(app.sizes, size)) {
          throw new Error('Icon: unadmitted presentation size.');
        }
        validatePresentation(value);
      }
    }
  }
}
const normalizedPolicies = new WeakSet<object>();
const malformedPolicies = new WeakSet<object>();
const mergedPolicies = new WeakMap<
  object,
  WeakMap<object, IconThemeCapabilities>
>();
export function normalizeIconThemeCapabilities(
  input: unknown,
  inherited?: IconThemeCapabilities,
  options: {contracts?: ReadonlyArray<IconCapabilities>} = {},
): IconThemeCapabilities | undefined {
  if (input === undefined && !options.contracts?.length) {
    return inherited;
  }
  if (
    input &&
    typeof input === 'object' &&
    normalizedPolicies.has(input) &&
    !inherited &&
    !options.contracts?.length
  ) {
    return input;
  }
  const value = input ?? {};
  validateIconThemeCapabilities(value, inherited, options.contracts);
  const boundContract =
    value.contract === undefined
      ? undefined
      : defineIconCapabilities(value.contract);
  const own = freezeCopy({
    ...value,
    ...(boundContract ? {contract: boundContract} : {}),
  });
  const contracts = Object.freeze([
    ...new Set(
      [
        ...getIconThemeContracts(inherited),
        ...(options.contracts ?? []),
        ...(own.contract ? [own.contract] : []),
      ].map(defineIconCapabilities),
    ),
  ]);
  policyContracts.set(own, contracts);
  normalizedPolicies.add(own);
  return mergeIconThemeCapabilities(inherited, own);
}
export function mergeIconThemeCapabilities(
  inherited: IconThemeCapabilities | undefined,
  own: IconThemeCapabilities | undefined,
): IconThemeCapabilities | undefined {
  const contracts = [
    ...getIconThemeContracts(inherited),
    ...getIconThemeContracts(own),
  ];
  let malformed = false;
  const sanitize = (policy: IconThemeCapabilities | undefined) => {
    if (
      policy &&
      typeof policy === 'object' &&
      normalizedPolicies.has(policy)
    ) {
      return policy;
    }
    try {
      return readIconThemeCapabilities(policy, contracts, () => {
        malformed = true;
      });
    } catch {
      malformed = true;
      return undefined;
    }
  };
  inherited = sanitize(inherited);
  own = sanitize(own);
  const preserveMalformed = (policy: IconThemeCapabilities | undefined) => {
    if (!malformed) {
      return policy;
    }
    const marked = freezeCopy(policy ?? {});
    normalizedPolicies.add(marked);
    malformedPolicies.add(marked);
    policyContracts.set(
      marked,
      Object.freeze([...getIconThemeContracts(policy)]),
    );
    return marked;
  };
  if (!own) {
    return preserveMalformed(inherited);
  }
  if (!inherited) {
    return preserveMalformed(own);
  }
  let cache = mergedPolicies.get(inherited);
  if (!cache) {
    cache = new WeakMap();
    mergedPolicies.set(inherited, cache);
  }
  const cached = cache.get(own);
  if (cached) {
    return cached;
  }
  const result = freezeCopy({
    ...inherited,
    ...own,
    ...(own.presentation === undefined
      ? {presentation: inherited.presentation}
      : {}),
    sizeOverrides: {...inherited.sizeOverrides, ...own.sizeOverrides},
  });
  policyContracts.set(
    result,
    Object.freeze([
      ...new Set([
        ...getIconThemeContracts(inherited),
        ...getIconThemeContracts(own),
      ]),
    ]),
  );
  if (
    malformed ||
    malformedPolicies.has(inherited) ||
    malformedPolicies.has(own)
  ) {
    malformedPolicies.add(result);
  }
  normalizedPolicies.add(result);
  cache.set(own, result);
  return result;
}
/** @internal Sanitize runtime policy by field; malformed siblings never erase valid intent. */
export function readIconThemeCapabilities(
  input: unknown,
  contracts: ReadonlyArray<IconCapabilities>,
  notifyInvalid: () => void,
): IconThemeCapabilities | undefined {
  let malformed = false;
  const invalid = () => {
    malformed = true;
    notifyInvalid();
  };
  if (input === undefined) {
    return undefined;
  }
  if (
    typeof input === 'object' &&
    input !== null &&
    normalizedPolicies.has(input)
  ) {
    if (malformedPolicies.has(input)) {
      invalid();
    }
    return input;
  }
  try {
    if (!isRecord(input)) {
      throw new Error('Invalid runtime policy');
    }
  } catch {
    invalid();
    return undefined;
  }
  const keys = (() => {
    try {
      return Reflect.ownKeys(input);
    } catch {
      invalid();
      return [];
    }
  })();
  for (const key of keys) {
    if (
      typeof key !== 'string' ||
      !['contract', 'sizeOverrides', 'presentation'].includes(key)
    ) {
      invalid();
    }
  }
  const result: {
    contract?: IconCapabilities;
    sizeOverrides?: Record<string, string | null>;
    presentation?: NonNullable<IconThemeCapabilities['presentation']> | null;
  } = {};
  // eslint-disable-next-line @typescript-eslint/promise-function-async -- Runtime data is opaque synchronous metadata and is never awaited.
  const field = (record: unknown, key: string): unknown => {
    try {
      return getOwnIconData(record, key);
    } catch {
      invalid();
      return undefined;
    }
  };
  const ownContract = field(input, 'contract');
  if (ownContract !== undefined) {
    try {
      result.contract = defineIconCapabilities(ownContract as IconCapabilities);
    } catch {
      invalid();
    }
  }
  let app: ApplicationIconCapabilities;
  try {
    app = getApplicationIconCapabilities(...contracts, result.contract);
  } catch {
    invalid();
    delete result.contract;
    app = getApplicationIconCapabilities(...contracts);
  }
  const map = (
    value: unknown,
    visit: (name: string, item: unknown) => void,
  ) => {
    if (value === undefined) {
      return;
    }
    try {
      if (!isRecord(value)) {
        throw new Error('Invalid map');
      }
      for (const key of Reflect.ownKeys(value)) {
        if (typeof key !== 'string') {
          invalid();
          continue;
        }
        visit(key, field(value, key));
      }
    } catch {
      invalid();
    }
  };
  const sizes: Record<string, string | null> = {};
  map(field(input, 'sizeOverrides'), (name, dimension) => {
    try {
      if (!Object.hasOwn(app.sizes, name)) {
        throw new Error('Unknown size');
      }
      if (dimension !== null) {
        validateIconDimension(dimension);
      }
      sizes[name] = dimension;
    } catch {
      invalid();
    }
  });
  result.sizeOverrides = sizes;
  const present = (value: unknown) => {
    const item: {appearance?: string; weight?: string | number} = {};
    try {
      if (!isRecord(value)) {
        throw new Error('Invalid presentation');
      }
      for (const key of Reflect.ownKeys(value)) {
        if (key !== 'appearance' && key !== 'weight') {
          invalid();
          continue;
        }
        const data = field(value, key);
        if (key === 'appearance') {
          if (typeof data === 'string' && app.appearances.includes(data)) {
            item.appearance = data;
          } else if (data !== undefined) {
            invalid();
          }
        } else if (admitsIconWeight(app, data)) {
          item.weight = data;
        } else if (data !== undefined) {
          invalid();
        }
      }
    } catch {
      invalid();
    }
    return item;
  };
  const presentation = field(input, 'presentation');
  if (presentation === null) {
    result.presentation = null;
  } else if (presentation !== undefined) {
    try {
      if (!isRecord(presentation)) {
        throw new Error('Invalid presentation');
      }
      for (const key of Reflect.ownKeys(presentation)) {
        if (key !== 'default' && key !== 'bySize') {
          invalid();
        }
      }
      const policy: {
        default?: ReturnType<typeof present>;
        bySize?: Record<string, ReturnType<typeof present>>;
      } = {};
      const baseline = field(presentation, 'default');
      if (baseline !== undefined) {
        policy.default = present(baseline);
      }
      const sizePolicy: Record<string, ReturnType<typeof present>> = {};
      policy.bySize = sizePolicy;
      map(field(presentation, 'bySize'), (name, value) => {
        if (Object.hasOwn(app.sizes, name)) {
          sizePolicy[name] = present(value);
        } else {
          invalid();
        }
      });
      result.presentation = policy;
    } catch {
      invalid();
    }
  }
  const snapshot = freezeCopy(result);
  normalizedPolicies.add(snapshot);
  policyContracts.set(
    snapshot,
    Object.freeze([
      ...new Set(
        [...contracts, ...(result.contract ? [result.contract] : [])].map(
          defineIconCapabilities,
        ),
      ),
    ]),
  );
  if (malformed) {
    malformedPolicies.add(snapshot);
  }
  return snapshot;
}
/** @internal Carry boundary failure evidence on a new snapshot, never a serialized field. */
export function markIconThemePolicyMalformed(
  policy?: IconThemeCapabilities,
): IconThemeCapabilities {
  const safe = readIconThemeCapabilities(
    policy,
    getIconThemeContracts(policy),
    () => {},
  );
  const snapshot = freezeCopy(safe ?? {});
  normalizedPolicies.add(snapshot);
  malformedPolicies.add(snapshot);
  policyContracts.set(
    snapshot,
    Object.freeze([...getIconThemeContracts(safe)]),
  );
  return snapshot;
}
