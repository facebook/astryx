// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file XLE component registry — built from @xds/core .doc.mjs metadata.
 *
 * Everything the layout language knows about components (valid names,
 * aliases, props, enums, slots) is derived from the same .doc.mjs files
 * that power `xds component`, so the notation can never drift from the
 * branch's actual API. Nothing in here is hand-maintained except the
 * alias table, and aliases that don't resolve to a real component on
 * this branch are dropped at build time.
 *
 * @input  packages/core/src/(star)/(star).doc.mjs via component-discovery
 * @output buildRegistry() → { components, aliases, blocks }
 * @position lib/xle — shared by parse/validate/expand; no CLI concerns here
 */

import {findCoreDir} from '../../utils/paths.mjs';
import {
  discoverComponents,
  findComponentReadme,
  resolveImportPath,
} from '../component-discovery.mjs';
import {loadDocs} from '../component-loader.mjs';

/**
 * Curated alias table (from the XLE research, paste P2376666892 §2).
 * Single letters reserved for the highest-frequency structural set.
 * Collision policy: case-only pairs forbidden; HTML mnemonics win the
 * Table family; form-frequency wins contested pairs (CB, NI).
 *
 * Aliases are validated against the discovered registry — an alias whose
 * component doesn't exist on this branch is silently dropped.
 */
export const ALIAS_TABLE = {
  // Layout core
  A: 'AppShell', L: 'Layout', LH: 'LayoutHeader', LC: 'LayoutContent',
  LF: 'LayoutFooter', LP: 'LayoutPanel', V: 'VStack', H: 'HStack',
  SI: 'StackItem', G: 'Grid', GS: 'GridSpan', S: 'Section', Ctr: 'Center',
  F: 'FormLayout', D: 'Divider', Tbar: 'Toolbar', AR: 'AspectRatio',
  // Navigation
  TN: 'TopNav', TNH: 'TopNavHeading', TNI: 'TopNavItem',
  SN: 'SideNav', SNI: 'SideNavItem', SNS: 'SideNavSection', SNH: 'SideNavHeading',
  MN: 'MobileNav', MNT: 'MobileNavToggle',
  BC: 'Breadcrumbs', BCI: 'BreadcrumbItem',
  TL: 'TabList', Tab: 'Tab', PG: 'Pagination',
  SG: 'SegmentedControl', SGI: 'SegmentedControlItem',
  // Data display
  T: 'Table', TH: 'TableHeader', TB: 'TableBody', TF: 'TableFooter',
  TR: 'TableRow', TC: 'TableCell', TD: 'TableCell', THC: 'TableHeaderCell',
  UL: 'List', LI: 'ListItem', ML: 'MetadataList', MLI: 'MetadataListItem',
  C: 'Card', CC: 'ClickableCard', ES: 'EmptyState', Bd: 'Badge',
  SD: 'StatusDot', Av: 'Avatar', AvG: 'AvatarGroup', Tmb: 'Thumbnail',
  Ts: 'Timestamp', OFL: 'OverflowList', Cs: 'Carousel', It: 'Item',
  // Forms & inputs
  Fd: 'Field', IG: 'InputGroup', IGT: 'InputGroupText',
  TI: 'TextInput', TA: 'TextArea', NI: 'NumberInput',
  DI: 'DateInput', DR: 'DateRangeInput', DT: 'DateTimeInput', TM: 'TimeInput',
  FI: 'FileInput', CB: 'CheckboxInput', CL: 'CheckboxList', CLI: 'CheckboxListItem',
  RL: 'RadioList', RLI: 'RadioListItem', SW: 'Switch', SL: 'Slider',
  SE: 'Selector', MS: 'MultiSelector', TY: 'Typeahead', Tkz: 'Tokenizer',
  PS: 'PowerSearch', CAL: 'Calendar',
  // Overlay & feedback
  Dlg: 'Dialog', DH: 'DialogHeader', AD: 'AlertDialog',
  Po: 'Popover', HC: 'HoverCard', Tt: 'Tooltip', Bn: 'Banner', Ov: 'Overlay',
  CM: 'ContextMenu', DM: 'DropdownMenu', MM: 'MoreMenu', CP: 'CommandPalette',
  Col: 'Collapsible', ColG: 'CollapsibleGroup',
  Sp: 'Spinner', PB: 'ProgressBar', Sk: 'Skeleton',
  // Content & chat
  Tx: 'Text', Hd: 'Heading', MD: 'Markdown', Cd: 'CodeBlock', BQ: 'Blockquote',
  K: 'Kbd', Ic: 'Icon', Lk: 'Link', Tk: 'Token',
  B: 'Button', IB: 'IconButton', BG: 'ButtonGroup', Tg: 'ToggleButton', TgG: 'ToggleButtonGroup',
  ChL: 'ChatLayout', ChML: 'ChatMessageList', ChM: 'ChatMessage',
  ChB: 'ChatMessageBubble', ChC: 'ChatComposer', ChCD: 'ChatComposerDrawer',
  ChS: 'ChatSystemMessage', ChT: 'ChatToolCalls',
};

/** SpacingStep — the canonical spacing enum (matches the doc.mjs prose). */
export const SPACING_STEPS = [0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10];

/**
 * Parse enum values from a doc.mjs prop type string.
 * "'a' | 'b' | 'c'" → ['a','b','c'];  "1|2|3" → [1,2,3];
 * "SpacingStep" → SPACING_STEPS. Mixed/non-enum types → null.
 */
export function parseEnumValues(type) {
  if (!type || typeof type !== 'string') return null;
  const t = type.trim();
  if (t === 'SpacingStep' || /^0\|0\.5\|/.test(t.replace(/\s+/g, ''))) {
    return SPACING_STEPS;
  }
  const parts = t.split('|').map(p => p.trim());
  if (parts.length < 2) return null;
  const values = [];
  for (const part of parts) {
    const str = part.match(/^'([^']*)'$/) || part.match(/^"([^"]*)"$/);
    if (str) { values.push(str[1]); continue; }
    if (/^\d+(\.\d+)?$/.test(part)) { values.push(Number(part)); continue; }
    return null; // union of non-literal types (e.g. number|string) — not an enum
  }
  return values;
}

function normalizeName(name) {
  return name.replace(/^XDS/, '');
}

function findDirFor(grouped, member) {
  for (const [dir, members] of Object.entries(grouped)) {
    if (members.includes(member)) return dir;
  }
  return null;
}

/**
 * Index one doc entry's props into the registry component shape.
 */
function toComponentEntry(name, props, dirName, importPath) {
  const propMap = new Map();
  for (const p of props || []) {
    propMap.set(p.name, {
      name: p.name,
      type: p.type || '',
      required: p.required === true,
      enumValues: parseEnumValues(p.type),
      isBoolean: (p.type || '').trim() === 'boolean',
      isFunction: /^\(/.test((p.type || '').trim()),
      isNode: /ReactNode|ReactElement/.test(p.type || ''),
    });
  }
  return {name, exportName: `XDS${name}`, dirName, importPath, props: propMap};
}

let cachedRegistry = null;

/**
 * Build (and cache) the registry: every documented component keyed by its
 * un-prefixed name, plus the validated alias map.
 *
 * @param {object} [options]
 * @param {string} [options.cwd]
 * @returns {Promise<{components: Map<string, object>, aliases: Map<string, string>, componentNames: string[]}>}
 */
export async function buildRegistry({cwd = process.cwd()} = {}) {
  if (cachedRegistry) return cachedRegistry;

  const coreDir = findCoreDir(cwd);
  if (!coreDir) {
    throw new Error('Could not find @xds/core package — run from an XDS workspace');
  }

  const components = new Map();
  const grouped = discoverComponents(coreDir);
  const dirNames = [...new Set(Object.values(grouped).flat())];

  for (const dirName of dirNames) {
    const readme = findComponentReadme(coreDir, dirName);
    if (!readme || !readme.endsWith('.doc.mjs')) continue;
    let docs;
    try {
      docs = await loadDocs(readme, {});
    } catch {
      continue; // a malformed doc must not take down the whole language
    }
    const importPath = resolveImportPath(coreDir, dirName);

    const register = (rawName, props) => {
      const name = normalizeName(rawName);
      const entry = toComponentEntry(name, props, dirName, importPath);
      const existing = components.get(name);
      // Some docs list related components with empty prop arrays
      // (e.g. Layout's references to Card) — prefer the richer entry.
      if (!existing || entry.props.size > existing.props.size) {
        components.set(name, entry);
      }
    };

    if (docs.props) register(docs.name || dirName, docs.props);
    for (const sub of docs.components || []) {
      if (sub?.name) register(sub.name, sub.props);
    }
  }

  // Exported components without their own doc entry (e.g. TableHeader,
  // TableBody) still get minimal registry entries so they can be named in
  // expressions — the validator warns rather than validates their props.
  for (const [, members] of Object.entries(grouped)) {
    for (const member of members) {
      const name = normalizeName(member);
      if (components.has(name)) continue;
      const entry = toComponentEntry(name, [], findDirFor(grouped, member) || name, resolveImportPath(coreDir, member));
      entry.undocumented = true;
      components.set(name, entry);
    }
  }

  const aliases = new Map();
  for (const [alias, target] of Object.entries(ALIAS_TABLE)) {
    if (components.has(target)) aliases.set(alias, target);
  }

  cachedRegistry = {
    components,
    aliases,
    componentNames: [...components.keys()].sort(),
  };
  return cachedRegistry;
}

/** Test seam — drop the module-level cache. */
export function resetRegistryCache() {
  cachedRegistry = null;
}

/**
 * Resolve a node name (alias, bare name, or XDS-prefixed name) to a
 * registry component entry, or null.
 */
export function resolveComponent(registry, name) {
  const viaAlias = registry.aliases.get(name);
  if (viaAlias) return registry.components.get(viaAlias);
  const bare = normalizeName(name);
  return registry.components.get(bare) || null;
}
