// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file globalIconRegistry.tsx
 * @input Released global artwork overrides or an explicit theme source
 * @output ReactNode-valued registry reads with local adaptive source fallback
 * @position Server/client registry; global registration never admits capability contracts
 *
 * This module has NO 'use client' directive. Source binding and resolution are
 * synchronous, and normalized theme IR is kept separate from the node read view.
 */
import type {ReactNode} from 'react';
import {defaultIcons} from './defaultIcons';
import type {DefinedTheme} from '../theme/defineTheme';
import {getRegisteredTheme} from '../theme/themeRegistry';
import {warnOnce} from '../utils/devWarning';
import {getOwnIconData} from './iconCapabilities';
import {
  normalizeIconEntry,
  prepareIconEntries,
  type IconEntry,
} from './adaptiveIcons';
import {resolveIconWithContext, type IconDiagnostic} from './iconResolution';

// SYNC: packages/cli/assets/docs/icons.doc.mjs — update USAGE_HINTS when adding names
export type IconName =
  | 'close'
  | 'chevronDown'
  | 'chevronLeft'
  | 'chevronRight'
  | 'chevronsLeft'
  | 'chevronsRight'
  | 'check'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'calendar'
  | 'clock'
  | 'externalLink'
  | 'menu'
  | 'moreHorizontal'
  | 'search'
  | 'upload'
  | 'arrowUp'
  | 'arrowDown'
  | 'arrowsUpDown'
  | 'funnel'
  | 'eyeSlash'
  | 'viewColumns'
  | 'copy'
  | 'checkDouble'
  | 'wrench'
  | 'stop'
  | 'microphone';
/** A glyph owned by a component/library rather than the system. */
export type NamespacedIconName = `${string}:${string}`;
/** Keep semantic names in autocomplete while admitting application read keys. */
export type ExtendedIconName = IconName | (string & {});
/** Actual node read contract. Source IR is never disguised as ReactNode. */
export type IconRegistry = Record<Exclude<IconName, 'upload'>, ReactNode> &
  Partial<Record<'upload', ReactNode>>;
export type IconRegistrySource = DefinedTheme | string | null | undefined;
let globalRegistry: Record<string, IconEntry> = {};

function getTheme(source: IconRegistrySource): DefinedTheme | null | undefined {
  return typeof source === 'string' ? getRegisteredTheme(source) : source;
}
/** @internal Own descriptors leave policy and capability metadata untouched on fixed reads. */
// eslint-disable-next-line @typescript-eslint/promise-function-async -- Opaque registry data is read synchronously and never awaited or wrapped.
function getThemeEntries(source: IconRegistrySource): unknown {
  const theme = getTheme(source);
  return (
    getOwnIconData(theme, '__iconSources') ?? getOwnIconData(theme, 'icons')
  );
}
/** Global registration retains its one-argument ReactNode artwork contract. */
export function registerIcons(
  icons: Partial<Record<ExtendedIconName, ReactNode>>,
): void {
  const prepared = prepareIconEntries(icons);
  warnOnce(
    'icon-registry:global-register-icons',
    'Icon',
    '`registerIcons()` applies icon overrides globally. Prefer `defineTheme({ icons })` for theme-scoped icon overrides.',
  );
  globalRegistry = {...globalRegistry, ...prepared.entries};
}
/** @internal Resolve only the selected source, validating foreign data before use. */
export function getIconSourceEntry(
  name: ExtendedIconName,
  source?: IconRegistrySource,
): {
  entry?: IconEntry;
  provenance: 'theme' | 'global' | 'default' | 'missing';
  diagnostics: IconDiagnostic[];
} {
  const diagnostics: IconDiagnostic[] = [];
  const invalid = () => {
    diagnostics.push({
      code: 'malformed-entry',
      // eslint-disable-next-line @astryx/no-hardcoded-i18n-string -- Private developer diagnostic, never rendered UI.
      message: 'Malformed runtime icon artwork was ignored.',
    });
  };
  const sources: {
    entry: unknown;
    provenance: 'theme' | 'global' | 'default';
  }[] = [];
  try {
    const themeEntry = getOwnIconData(getThemeEntries(source), name);
    if (themeEntry != null) {
      sources.push({entry: themeEntry, provenance: 'theme'});
    }
  } catch {
    invalid();
  }
  sources.push(
    {entry: globalRegistry[name], provenance: 'global'},
    {entry: defaultIcons[name as IconName], provenance: 'default'},
  );
  for (const candidate of sources) {
    if (candidate.entry == null) {
      continue;
    }
    try {
      return {
        entry: normalizeIconEntry(candidate.entry),
        provenance: candidate.provenance,
        diagnostics,
      };
    } catch {
      invalid();
    }
  }
  return {provenance: 'missing', diagnostics};
}
const needsResolution = Symbol(
  'Icon source requires adaptive or malformed-data resolution',
);
/**
 * Fixed reads skip all policy/contract inspection. Valid immutable React nodes
 * and primitives take only source selection and own-field reads.
 */
function getFixedRead(
  name: ExtendedIconName,
  source?: IconRegistrySource,
): ReactNode | typeof needsResolution {
  let entry: unknown;
  try {
    entry =
      getOwnIconData(getThemeEntries(source), name) ??
      globalRegistry[name] ??
      defaultIcons[name as IconName];
    if (
      entry === undefined ||
      entry === null ||
      typeof entry === 'string' ||
      typeof entry === 'number' ||
      typeof entry === 'boolean' ||
      typeof entry === 'bigint'
    ) {
      return entry as ReactNode;
    }
    const tag = getOwnIconData(entry, '$$typeof');
    if (
      tag === Symbol.for('react.transitional.element') ||
      tag === Symbol.for('react.element') ||
      tag === Symbol.for('react.portal')
    ) {
      return entry as ReactNode;
    }
    // Opaque fixed containers are validated without inspecting theme policy.
    if (Array.isArray(entry)) {
      return normalizeIconEntry(entry) as ReactNode;
    }
  } catch {
    return needsResolution;
  }
  return needsResolution;
}
/** Snapshot of built-in names only, with actual selected ReactNode values. */
export function getIconRegistry(
  source?: IconRegistrySource,
): Readonly<Record<IconName, ReactNode>> {
  const registry: Record<string, ReactNode> = {};
  for (const name of Object.keys(defaultIcons) as IconName[]) {
    if (!name.includes(':')) {
      registry[name] = getIcon(name, source);
    }
  }
  // Preserve released snapshots' non-namespaced theme extension keys.
  try {
    const entries = getThemeEntries(source);
    if (entries && typeof entries === 'object') {
      for (const key of Reflect.ownKeys(entries)) {
        if (typeof key === 'string' && !key.includes(':')) {
          registry[key] = getIcon(key, source);
        }
      }
    }
  } catch {
    // A malformed theme source cannot poison defaults/global artwork.
  }
  return registry as Record<IconName, ReactNode>;
}
/** Read one icon; no additional request or capability parameters. */
export function getIcon(
  name: ExtendedIconName,
  source?: IconRegistrySource,
): ReactNode {
  const fixed = getFixedRead(name, source);
  return fixed === needsResolution
    ? resolveIconWithContext(name, {}, source).node
    : fixed;
}
/** Library-owned extension fallback retains the released fallback/source ordering. */
export function getExtendedIcon(
  name: ExtendedIconName,
  fallback?: ReactNode,
  source?: IconRegistrySource,
): ReactNode {
  return getIcon(name, source) ?? fallback;
}
/** @internal Testing-only reset clears artwork overrides, never contract snapshots. */
export function resetIcons(): void {
  globalRegistry = {};
}
