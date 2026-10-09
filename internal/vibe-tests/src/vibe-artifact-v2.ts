// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Versioned producer-to-evaluator contract for vibe-test artifacts.
 * @input Unknown JSON-compatible values emitted by vibe-test producers.
 * @output Validated VibeArtifactV2 records and producer-neutral receipt types.
 * @position The delivery-agnostic boundary between vibe-test producers and the
 *   shared evaluator described by AST-067.
 */

import type {ExecutionProvenanceV1} from './provenance';
import {parseExecutionProvenanceV1} from './provenance';

export type VibeArtifactViewKindV2 = 'static' | 'build' | 'serve' | 'url';
export type VibeArtifactProducerKindV2 =
  'component-adapter' | 'project' | 'hosted';
export type VibeArtifactNetworkModeV2 = 'deny' | 'record' | 'replay';

export interface VibeDigestV2 {
  algorithm: 'sha256';
  value: string;
}

export interface VibeArtifactVersionsV2 {
  producerContract: string;
  evaluator: string;
  capturePolicy: string;
  metricSet: string;
  judgePrompt: string;
}

export interface VibeArtifactProducerV2 {
  kind: VibeArtifactProducerKindV2;
  runner: string;
  deliveryMode: VibeArtifactViewKindV2;
}

export interface VibeArtifactEmptyBaselineV2 {
  kind: 'empty';
  digest: VibeDigestV2;
}

export interface VibeArtifactTreeBaselineV2 {
  kind: 'bundle-tree' | 'git-tree';
  root: string;
  digest: VibeDigestV2;
}

export type VibeArtifactBaselineV2 =
  VibeArtifactEmptyBaselineV2 | VibeArtifactTreeBaselineV2;

export interface VibeArtifactSourceV2 {
  root: string;
  baseline: VibeArtifactBaselineV2;
  entryHints?: string[];
}

export interface VibeArtifactStaticViewV2 {
  kind: 'static';
  root: string;
  entry: string;
}

export interface VibeArtifactInstallV2 {
  argv: string[];
  lockfile: string;
  frozen: true;
}

export interface VibeArtifactBuildViewV2 {
  kind: 'build';
  cwd: string;
  argv: string[];
  output: string;
  entry: string;
  install?: VibeArtifactInstallV2;
}

export interface VibeArtifactServeViewV2 {
  kind: 'serve';
  cwd: string;
  argv: string[];
  readinessPath?: string;
}

export interface VibeArtifactUrlViewV2 {
  kind: 'url';
  url: string;
}

export type VibeArtifactViewV2 =
  | VibeArtifactStaticViewV2
  | VibeArtifactBuildViewV2
  | VibeArtifactServeViewV2
  | VibeArtifactUrlViewV2;

export interface VibeArtifactIntegrityV2 {
  sourceTree: VibeDigestV2;
  viewInput: VibeDigestV2;
}

export interface VibeArtifactNetworkV2 {
  mode: VibeArtifactNetworkModeV2;
  allowedOrigins: string[];
  receipt?: string;
}

export interface VibeArtifactStateV2 {
  name: string;
  navigation:
    {kind: 'query'; value: string} | {kind: 'fragment'; value: string};
}

export interface VibeArtifactProvenanceV2 {
  execution: ExecutionProvenanceV1;
  transcript?: string;
  usage?: string;
}

export interface VibeArtifactV2 {
  schema: 'VibeArtifactV2';
  schemaVersion: 2;
  artifactId: string;
  prompt: {
    id: string;
    digest: VibeDigestV2;
  };
  producer: VibeArtifactProducerV2;
  versions: VibeArtifactVersionsV2;
  source: VibeArtifactSourceV2;
  view: VibeArtifactViewV2;
  integrity: VibeArtifactIntegrityV2;
  network: VibeArtifactNetworkV2;
  states?: VibeArtifactStateV2[];
  provenance: VibeArtifactProvenanceV2;
}

export type VibeMaterializationFailureCodeV2 =
  | 'invalid_artifact'
  | 'unsafe_path'
  | 'digest_mismatch'
  | 'missing_entry'
  | 'build_failed'
  | 'unsupported_view';

export interface VibeMaterializationFailureV2 {
  code: VibeMaterializationFailureCodeV2;
  message: string;
  field?: string;
}

export interface VibeMaterializationReceiptV2 {
  schema: 'VibeMaterializationReceiptV2';
  schemaVersion: 2;
  artifactId: string;
  versions: VibeArtifactVersionsV2;
  status: 'materialized' | 'materialization_failed';
  materializedView: {
    kind: VibeArtifactViewKindV2;
    digest: VibeDigestV2;
  } | null;
  primaryFailure: VibeMaterializationFailureV2 | null;
}

export class VibeArtifactValidationError extends Error {
  constructor(
    message: string,
    readonly field = '$',
  ) {
    super(`${field}: ${message}`);
    this.name = 'VibeArtifactValidationError';
  }
}

export const EMPTY_TREE_SHA256_V2 =
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

const SHA256 = /^[a-f0-9]{64}$/;
const WINDOWS_ABSOLUTE_PATH = /^[a-zA-Z]:[\\/]/;
const SHELL_EXECUTABLES = new Set([
  'bash',
  'cmd',
  'cmd.exe',
  'csh',
  'dash',
  'fish',
  'ksh',
  'powershell',
  'powershell.exe',
  'pwsh',
  'sh',
  'tcsh',
  'zsh',
]);
const EVAL_EXECUTABLES = new Set([
  'node',
  'node.exe',
  'perl',
  'php',
  'python',
  'python3',
  'ruby',
]);

function fail(field: string, message: string): never {
  throw new VibeArtifactValidationError(message, field);
}

function objectAt(value: unknown, field: string): Record<string, unknown> {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    fail(field, 'must be an object');
  }
  return value as Record<string, unknown>;
}

function exactKeys(
  object: Record<string, unknown>,
  keys: readonly string[],
  field: string,
): void {
  const allowed = new Set(keys);
  for (const key of Object.keys(object)) {
    if (!allowed.has(key)) {
      fail(`${field}.${key}`, 'is not allowed');
    }
  }
}

function requiredString(
  object: Record<string, unknown>,
  key: string,
  field: string,
): string {
  const value = object[key];
  if (typeof value !== 'string' || value.trim().length === 0) {
    fail(`${field}.${key}`, 'must be a non-empty string');
  }
  if (/\p{Cc}/u.test(value)) {
    fail(`${field}.${key}`, 'must not contain control characters');
  }
  return value;
}

function optionalString(
  object: Record<string, unknown>,
  key: string,
  field: string,
): string | undefined {
  if (object[key] === undefined) {
    return undefined;
  }
  return requiredString(object, key, field);
}

function enumString<T extends string>(
  object: Record<string, unknown>,
  key: string,
  field: string,
  values: readonly T[],
): T {
  const value = requiredString(object, key, field);
  if (!values.includes(value as T)) {
    fail(`${field}.${key}`, `must be one of ${values.join(', ')}`);
  }
  return value as T;
}

function validateDigest(value: unknown, field: string): void {
  const digest = objectAt(value, field);
  exactKeys(digest, ['algorithm', 'value'], field);
  if (digest.algorithm !== 'sha256') {
    fail(`${field}.algorithm`, 'must be sha256');
  }
  const hash = requiredString(digest, 'value', field);
  if (!SHA256.test(hash)) {
    fail(`${field}.value`, 'must be a lowercase 64-character SHA-256 digest');
  }
}

export function assertBundlePathV2(value: string, field = '$'): void {
  if (
    value.startsWith('/') ||
    value.startsWith('//') ||
    WINDOWS_ABSOLUTE_PATH.test(value)
  ) {
    fail(field, 'must be relative to the bundle root');
  }
  if (value.includes('\\')) {
    fail(field, 'must use POSIX separators');
  }
  if (value === '.') {
    return;
  }
  const segments = value.split('/');
  if (
    segments.some(
      segment => segment.length === 0 || segment === '.' || segment === '..',
    )
  ) {
    fail(field, 'must be a canonical bundle-relative path without traversal');
  }
  if (segments.some(segment => /\p{Cc}/u.test(segment))) {
    fail(field, 'must not contain control characters');
  }
}

function requiredBundlePath(
  object: Record<string, unknown>,
  key: string,
  field: string,
): string {
  const value = requiredString(object, key, field);
  assertBundlePathV2(value, `${field}.${key}`);
  return value;
}

function isWithin(root: string, candidate: string): boolean {
  return root === '.' || candidate === root || candidate.startsWith(`${root}/`);
}

function requireWithin(
  root: string,
  candidate: string,
  field: string,
  rootField: string,
): void {
  if (!isWithin(root, candidate)) {
    fail(field, `must be inside ${rootField}`);
  }
}

function validateArgv(value: unknown, field: string): void {
  if (!Array.isArray(value) || value.length === 0) {
    fail(field, 'must be a non-empty argv array');
  }
  for (const [index, argument] of value.entries()) {
    if (
      typeof argument !== 'string' ||
      argument.length === 0 ||
      argument.includes('\0') ||
      /[\r\n]/u.test(argument)
    ) {
      fail(`${field}[${index}]`, 'must be a non-empty single-line string');
    }
  }

  const executable = value[0] as string;
  const basename = executable.split(/[\\/]/u).at(-1)?.toLowerCase() ?? '';
  if (SHELL_EXECUTABLES.has(basename)) {
    fail(field, 'must not invoke a shell or command parser');
  }
  if (
    EVAL_EXECUTABLES.has(basename) &&
    ['-c', '-e'].includes((value[1] as string | undefined) ?? '')
  ) {
    fail(field, 'must not reinterpret authored command text');
  }
}

function validateVersions(value: unknown): void {
  const versions = objectAt(value, '$.versions');
  const fields = [
    'producerContract',
    'evaluator',
    'capturePolicy',
    'metricSet',
    'judgePrompt',
  ] as const;
  exactKeys(versions, fields, '$.versions');
  for (const field of fields) {
    requiredString(versions, field, '$.versions');
  }
}

function validateSource(value: unknown): void {
  const source = objectAt(value, '$.source');
  exactKeys(source, ['root', 'baseline', 'entryHints'], '$.source');
  const sourceRoot = requiredBundlePath(source, 'root', '$.source');

  const baseline = objectAt(source.baseline, '$.source.baseline');
  const kind = enumString(baseline, 'kind', '$.source.baseline', [
    'empty',
    'bundle-tree',
    'git-tree',
  ] as const);
  if (kind === 'empty') {
    exactKeys(baseline, ['kind', 'digest'], '$.source.baseline');
    validateDigest(baseline.digest, '$.source.baseline.digest');
    const digest = objectAt(baseline.digest, '$.source.baseline.digest').value;
    if (digest !== EMPTY_TREE_SHA256_V2) {
      fail(
        '$.source.baseline.digest.value',
        'must equal the canonical empty-tree SHA-256 digest',
      );
    }
  } else {
    exactKeys(baseline, ['kind', 'root', 'digest'], '$.source.baseline');
    requiredBundlePath(baseline, 'root', '$.source.baseline');
    validateDigest(baseline.digest, '$.source.baseline.digest');
  }

  if (source.entryHints !== undefined) {
    if (!Array.isArray(source.entryHints)) {
      fail('$.source.entryHints', 'must be an array');
    }
    const seen = new Set<string>();
    for (const [index, value] of source.entryHints.entries()) {
      if (typeof value !== 'string' || value.length === 0) {
        fail(`$.source.entryHints[${index}]`, 'must be a non-empty string');
      }
      assertBundlePathV2(value, `$.source.entryHints[${index}]`);
      requireWithin(
        sourceRoot,
        value,
        `$.source.entryHints[${index}]`,
        '$.source.root',
      );
      if (seen.has(value)) {
        fail(`$.source.entryHints[${index}]`, 'must be unique');
      }
      seen.add(value);
    }
  }
}

function validateInstall(value: unknown, cwd: string): void {
  const install = objectAt(value, '$.view.install');
  exactKeys(install, ['argv', 'lockfile', 'frozen'], '$.view.install');
  validateArgv(install.argv, '$.view.install.argv');
  const lockfile = requiredBundlePath(install, 'lockfile', '$.view.install');
  requireWithin(cwd, lockfile, '$.view.install.lockfile', '$.view.cwd');
  if (install.frozen !== true) {
    fail('$.view.install.frozen', 'must be true');
  }
}

function validateHttpsUrl(value: string, field: string): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    fail(field, 'must be a valid HTTPS URL');
  }
  if (url.protocol !== 'https:' || url.username || url.password) {
    fail(field, 'must be an HTTPS URL without credentials');
  }
  return url;
}

function validateView(value: unknown): VibeArtifactViewKindV2 {
  const view = objectAt(value, '$.view');
  const kind = enumString(view, 'kind', '$.view', [
    'static',
    'build',
    'serve',
    'url',
  ] as const);

  if (kind === 'static') {
    exactKeys(view, ['kind', 'root', 'entry'], '$.view');
    const root = requiredBundlePath(view, 'root', '$.view');
    const entry = requiredBundlePath(view, 'entry', '$.view');
    requireWithin(root, entry, '$.view.entry', '$.view.root');
  } else if (kind === 'build') {
    exactKeys(
      view,
      ['kind', 'cwd', 'argv', 'output', 'entry', 'install'],
      '$.view',
    );
    const cwd = requiredBundlePath(view, 'cwd', '$.view');
    validateArgv(view.argv, '$.view.argv');
    const output = requiredBundlePath(view, 'output', '$.view');
    const entry = requiredBundlePath(view, 'entry', '$.view');
    requireWithin(cwd, output, '$.view.output', '$.view.cwd');
    requireWithin(output, entry, '$.view.entry', '$.view.output');
    if (view.install !== undefined) {
      validateInstall(view.install, cwd);
    }
  } else if (kind === 'serve') {
    exactKeys(view, ['kind', 'cwd', 'argv', 'readinessPath'], '$.view');
    requiredBundlePath(view, 'cwd', '$.view');
    validateArgv(view.argv, '$.view.argv');
    const readinessPath = optionalString(view, 'readinessPath', '$.view');
    if (
      readinessPath !== undefined &&
      (!readinessPath.startsWith('/') ||
        readinessPath.startsWith('//') ||
        readinessPath.includes('\\'))
    ) {
      fail(
        '$.view.readinessPath',
        'must be an origin-relative URL path beginning with one slash',
      );
    }
  } else {
    exactKeys(view, ['kind', 'url'], '$.view');
    validateHttpsUrl(requiredString(view, 'url', '$.view'), '$.view.url');
  }

  return kind;
}

function validateNetwork(value: unknown): void {
  const network = objectAt(value, '$.network');
  exactKeys(network, ['mode', 'allowedOrigins', 'receipt'], '$.network');
  enumString(network, 'mode', '$.network', [
    'deny',
    'record',
    'replay',
  ] as const);
  if (!Array.isArray(network.allowedOrigins)) {
    fail('$.network.allowedOrigins', 'must be an array');
  }
  const seen = new Set<string>();
  for (const [index, value] of network.allowedOrigins.entries()) {
    if (typeof value !== 'string') {
      fail(`$.network.allowedOrigins[${index}]`, 'must be a string');
    }
    const url = validateHttpsUrl(value, `$.network.allowedOrigins[${index}]`);
    if (value !== url.origin) {
      fail(
        `$.network.allowedOrigins[${index}]`,
        'must be an exact HTTPS origin without a path, query, or fragment',
      );
    }
    if (seen.has(value)) {
      fail(`$.network.allowedOrigins[${index}]`, 'must be unique');
    }
    seen.add(value);
  }
  if (network.receipt !== undefined) {
    requiredBundlePath(network, 'receipt', '$.network');
  }
}

function validateStates(value: unknown): void {
  if (!Array.isArray(value)) {
    fail('$.states', 'must be an array');
  }
  if (value.length > 4) {
    fail('$.states', 'must contain at most four states');
  }
  const names = new Set<string>();
  for (const [index, item] of value.entries()) {
    const field = `$.states[${index}]`;
    const state = objectAt(item, field);
    exactKeys(state, ['name', 'navigation'], field);
    const name = requiredString(state, 'name', field);
    if (names.has(name)) {
      fail(`${field}.name`, 'must be unique');
    }
    names.add(name);

    const navigation = objectAt(state.navigation, `${field}.navigation`);
    exactKeys(navigation, ['kind', 'value'], `${field}.navigation`);
    const kind = enumString(navigation, 'kind', `${field}.navigation`, [
      'query',
      'fragment',
    ] as const);
    const navigationValue = requiredString(
      navigation,
      'value',
      `${field}.navigation`,
    );
    if (kind === 'query' && !navigationValue.startsWith('?')) {
      fail(`${field}.navigation.value`, 'query navigation must begin with ?');
    }
    if (kind === 'fragment' && !navigationValue.startsWith('#')) {
      fail(
        `${field}.navigation.value`,
        'fragment navigation must begin with #',
      );
    }
  }
}

function validateProvenance(value: unknown): void {
  const provenance = objectAt(value, '$.provenance');
  exactKeys(provenance, ['execution', 'transcript', 'usage'], '$.provenance');
  if (provenance.execution === undefined) {
    fail('$.provenance.execution', 'is required');
  }
  parseExecutionProvenanceV1(provenance.execution);
  for (const key of ['transcript', 'usage'] as const) {
    if (provenance[key] !== undefined) {
      requiredBundlePath(provenance, key, '$.provenance');
    }
  }
}

export function parseVibeArtifactV2(input: unknown): VibeArtifactV2 {
  const value = objectAt(input, '$');
  exactKeys(
    value,
    [
      'schema',
      'schemaVersion',
      'artifactId',
      'prompt',
      'producer',
      'versions',
      'source',
      'view',
      'integrity',
      'network',
      'states',
      'provenance',
    ],
    '$',
  );
  if (value.schema !== 'VibeArtifactV2') {
    fail('$.schema', 'must be VibeArtifactV2');
  }
  if (value.schemaVersion !== 2) {
    fail('$.schemaVersion', 'must be 2');
  }
  requiredString(value, 'artifactId', '$');

  const prompt = objectAt(value.prompt, '$.prompt');
  exactKeys(prompt, ['id', 'digest'], '$.prompt');
  requiredString(prompt, 'id', '$.prompt');
  validateDigest(prompt.digest, '$.prompt.digest');

  const producer = objectAt(value.producer, '$.producer');
  exactKeys(producer, ['kind', 'runner', 'deliveryMode'], '$.producer');
  enumString(producer, 'kind', '$.producer', [
    'component-adapter',
    'project',
    'hosted',
  ] as const);
  requiredString(producer, 'runner', '$.producer');
  const deliveryMode = enumString(producer, 'deliveryMode', '$.producer', [
    'static',
    'build',
    'serve',
    'url',
  ] as const);

  validateVersions(value.versions);
  validateSource(value.source);
  const viewKind = validateView(value.view);
  if (deliveryMode !== viewKind) {
    fail('$.producer.deliveryMode', 'must match $.view.kind');
  }

  const integrity = objectAt(value.integrity, '$.integrity');
  exactKeys(integrity, ['sourceTree', 'viewInput'], '$.integrity');
  validateDigest(integrity.sourceTree, '$.integrity.sourceTree');
  validateDigest(integrity.viewInput, '$.integrity.viewInput');

  validateNetwork(value.network);
  if (value.states !== undefined) {
    validateStates(value.states);
  }
  validateProvenance(value.provenance);

  return value as unknown as VibeArtifactV2;
}
