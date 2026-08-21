// Copyright (c) Meta Platforms, Inc. and affiliates.

/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * @file Validates derivedVarRegistry stays in sync with component doc files,
 * AND detects undocumented component CSS custom properties in source files.
 *
 * Three layers of checking:
 * 1. Source scan: finds all component-level CSS vars in .tsx files
 * 2. Doc check: verifies each var is documented in the doc file's vars[]
 * 3. Registry check: verifies themeable vars have derived[] entries that
 *    match the registry
 *
 * Layers 1 and 3 each used to carry a hole that let real vars through:
 *
 * - The source scan skipped every `--_*` name outright, on the theory that a
 *   private var is "internal, not themeable". It is internal, but it is still
 *   documented — `theming.vars[]` takes `private: true` for exactly this
 *   (`--_card-radius`, `--_dropdown-menu-padding`), and the derived-var
 *   pipeline is what theme authors reach it through. Skipping the prefix meant
 *   10 private vars across 12 (component, var) sites were declared in source
 *   and documented nowhere.
 * - Layer 3 narrowed its verdict to vars matching `/radius|padding/`, so any
 *   var whose name did not happen to contain those two words was exempt from
 *   ever needing a derived[] mapping. That is now an explicit allowlist
 *   (VARS_WITHOUT_DERIVED_MAPPING) instead of a name heuristic: a new var must
 *   be given a derived[] entry or be added to the list on purpose.
 */

import {describe, it, expect} from 'vitest';
import {derivedVarRegistry, getDerivedVars} from './derivedVarRegistry';
import {readdirSync, readFileSync} from 'node:fs';
import {join} from 'node:path';

const SRC_DIR = join(__dirname, '..');

type ComponentDocModule = {
  docs?: {
    theming?: {
      vars?: {name: string}[];
      derived?: DerivedDocEntry[];
    };
  };
};

type DerivedDocEntry = {
  property: string;
  vars?: string[];
  expand?: string;
};

// ---------------------------------------------------------------------------
// Source scanning: find CSS custom property declarations in component files
// ---------------------------------------------------------------------------

/**
 * Structural/runtime vars that are NOT component-specific theming vars.
 * These are set by JS at runtime or cascade through layout — they don't
 * belong in derived[] because they aren't things theme authors write.
 */
const STRUCTURAL_VARS = new Set([
  '--container-padding',
  '--container-padding-inline',
  '--container-padding-inline-start',
  '--container-padding-inline-end',
  '--edge-inset-start',
  '--edge-inset-end',
  '--container-padding-block-start',
  '--container-padding-block-end',
  '--container-max-height',
  '--layout-padding-inner-x',
  '--layout-padding-inner-y',
  '--layout-padding-outer-x',
  '--layout-padding-outer-y',
  '--layout-content-width',
  '--appshell-header-height',
  '--dialog-dir-x',
  '--dialog-dir-y',
  '--indicator-color',
  '--indicator-width',
  '--table-resize-height',
  // sticky-columns plugin: opaque backdrop (overridable) + the row overlay it
  // replays on pinned cells. Structural/runtime, not themeable design tokens.
  '--table-sticky-background',
  '--table-row-overlay',
  '--separator-display',
  '--astryx-section-padding',
  // Private counterpart of the public token above: one ancestor Section's
  // padding, propagated down the tree. Structural, never authored by a theme.
  '--_section-padding-propagated',
]);

/**
 * Extract component-specific CSS custom property names from a source file.
 * Matches patterns like '--_card-radius': or '--_chat-composer-padding':
 * Excludes structural/runtime vars and standard token vars (--color-*,
 * --spacing-*, etc.).
 *
 * Private (`--_*`) vars are INCLUDED. They are internal in the sense that a
 * theme author does not set them directly, but they are still part of the
 * documented theming surface (`theming.vars[]` with `private: true`) and are
 * how derived[] entries connect a standard CSS property to a component.
 */
function extractComponentVars(filePath: string): string[] {
  const content = readFileSync(filePath, 'utf-8');
  const varPattern = /['"](--(\w[\w-]*))['"]\s*:/g;
  const vars = new Set<string>();
  let match;

  while ((match = varPattern.exec(content)) !== null) {
    const varName = match[1];
    // Skip token vars (--color-*, --spacing-*, --radius-*, etc.)
    if (
      /^--(color|spacing|radius|shadow|duration|ease|transition|font|text|size)-/.test(
        varName,
      )
    ) {
      continue;
    }
    // Skip structural vars
    if (STRUCTURAL_VARS.has(varName)) {
      continue;
    }
    // Skip vars that start with structural prefixes
    if (/^--(container-|layout-|edge-|component-)/.test(varName)) {
      continue;
    }
    vars.add(varName);
  }
  return [...vars];
}

// ---------------------------------------------------------------------------
// Discovery: scan all component directories
// ---------------------------------------------------------------------------

interface ComponentInfo {
  dir: string;
  sourceVars: string[];
  docVars: string[];
  docDerived: {property: string; vars?: string[]; expand?: string}[];
}

function discoverComponents(): ComponentInfo[] {
  const results: ComponentInfo[] = [];
  const dirs = readdirSync(SRC_DIR, {withFileTypes: true})
    .filter(d => d.isDirectory())
    .map(d => d.name);

  for (const dir of dirs) {
    const dirPath = join(SRC_DIR, dir);
    const dirEntries = readdirSync(dirPath);
    // Find source files with component vars (.tsx and .ts, excluding tests/docs)
    const sourceFiles = dirEntries
      .filter(
        f =>
          (f.endsWith('.tsx') || f.endsWith('.ts')) &&
          !f.includes('.test.') &&
          !f.endsWith('.doc.mjs') &&
          !f.endsWith('.d.ts'),
      )
      .map(f => join(dirPath, f));

    const allVars = new Set<string>();
    for (const f of sourceFiles) {
      for (const v of extractComponentVars(f)) {
        allVars.add(v);
      }
    }

    // Only check component directories (those with a doc file named after the
    // directory). Match against the on-disk listing rather than existsSync so
    // the comparison is case-exact everywhere — on case-insensitive
    // filesystems (macOS, Windows) existsSync('theme/theme.doc.mjs') matches
    // theme/Theme.doc.mjs and pulls in a directory that CI never checks.
    if (!dirEntries.includes(`${dir}.doc.mjs`)) {
      continue;
    }
    const docPath = join(dirPath, `${dir}.doc.mjs`);

    let docVars: string[] = [];
    let docDerived: DerivedDocEntry[] = [];
    try {
      const mod = require(docPath) as ComponentDocModule;
      docVars = (mod.docs?.theming?.vars || []).map(v => v.name);
      docDerived = mod.docs?.theming?.derived || [];
    } catch {
      /* skip */
    }

    // A directory earns a check by declaring a var OR by documenting a
    // derived[] entry. Bailing on the var count alone (as this did) hid every
    // component that is themeable purely through an expansion strategy —
    // `{property: 'padding', expand: 'container'}` names no var, so such a
    // component declares nothing and its registry↔doc consistency check
    // silently never ran.
    if (allVars.size === 0 && docDerived.length === 0) {
      continue;
    }

    results.push({
      dir,
      sourceVars: [...allVars],
      docVars,
      docDerived,
    });
  }
  return results;
}

// ---------------------------------------------------------------------------
// Known mapping: doc dir → registry key
// ---------------------------------------------------------------------------

const DIR_TO_REGISTRY_KEY: Record<string, string> = {
  Banner: 'banner',
  Button: 'button',
  Card: 'card',
  Chat: 'chat',
  ContextMenu: 'context-menu',
  Dialog: 'dialog',
  DropdownMenu: 'dropdown-menu',
  Field: 'field',
  HoverCard: 'hovercard',
  NumberInput: 'number-input',
  Popover: 'popover',
  ProgressBar: 'progressbar-mark',
  Section: 'section',
  SegmentedControl: 'segmented-control',
  TextArea: 'textarea',
};

/**
 * Vars that are intentionally set by one component for use by another
 * (cross-component vars). These are documented in the *consuming* component's
 * doc, not the *setting* component's doc.
 *
 * e.g. Carousel and Thumbnail set --_button-radius for their child Buttons,
 * but --_button-radius is documented in Button's doc.
 */
const CROSS_COMPONENT_VARS: Record<string, string[]> = {
  Carousel: ['--_button-radius'],
  Thumbnail: ['--_button-radius'],
  Chat: ['--_button-radius'],
  // AvatarGroupOverflow sets the overlap for the Avatars it lays out; Avatar
  // owns and documents it (and sets it itself when it is the group root).
  AvatarGroup: ['--_avatar-group-overlap'],
  // BreadcrumbItem tunes the DropdownMenu it opens.
  Breadcrumbs: ['--_dropdown-menu-radius', '--_dropdown-menu-padding'],
  // SelectableCard draws its selection ring through the Card shadow slot.
  SelectableCard: ['--_card-ring'],
  // Toolbar offsets the TabList indicator it hosts.
  Toolbar: ['--_tab-indicator-bottom'],
  // The destructive item variant recolors the Item it renders; Item owns,
  // documents and reads both slots.
  DropdownMenu: ['--_item-label-color', '--_item-description-color'],
};

/**
 * Documented vars that intentionally have NO derived[] entry — a theme author
 * cannot reach them by writing a standard CSS property, only by targeting the
 * component's own theming surface.
 *
 * This replaces a `/radius|padding/` name test that exempted every var whose
 * name did not contain those words. Each entry is a deliberate classification,
 * so a NEW var has to be argued into the list rather than slipping past on its
 * name. The list should shrink over time, not grow.
 */
const VARS_WITHOUT_DERIVED_MAPPING = new Set([
  // No standard CSS property maps onto these — they are component behaviors.
  '--button-focus-offset',
  '--button-icon-only-aspect',
  '--_avatar-group-overlap',
  '--_codeblock-gutter-width',
  '--_tab-indicator-bottom',
  // Hit-area outset on a ::after overlay, and whether that overlay is
  // generated at all — `inset` and `content` on a pseudo-element are not
  // properties a theme author sets on the component.
  '--_thumbnail-hit-inset',
  '--_input-clear-hit-inset',
  '--_input-clear-hit-content',
  // Indentation and row-spacing metrics: --tree-list-indent is the authorable
  // step, --_tree-indent the per-row distance TreeListItem computes from it.
  // --tree-list-row-gap is applied as half a padding-block on each row wrapper,
  // not as gap on the list, so no standard property on the tree-list target
  // maps onto it; a theme sets the var directly.
  '--tree-list-indent',
  '--_tree-indent',
  '--tree-list-row-gap',
  // Composed into a single box-shadow list on the card, so neither maps 1:1
  // onto boxShadow — setting one through a derived entry would clobber the
  // other.
  '--_card-elevation',
  '--_card-ring',
]);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('component CSS vars are documented and themeable', () => {
  const components = discoverComponents();

  for (const {dir, sourceVars, docVars, docDerived} of components) {
    const crossVars = new Set(CROSS_COMPONENT_VARS[dir] || []);

    it(`${dir}: all source vars are in doc file`, () => {
      const undocumented = sourceVars.filter(
        v => !docVars.includes(v) && !crossVars.has(v),
      );
      expect(
        undocumented,
        `${dir} has undocumented CSS vars in source: ${undocumented.join(', ')}. ` +
          `Add them to ${dir}.doc.mjs theming.vars[] and add a derived[] ` +
          `entry mapping the standard CSS property to the internal var.`,
      ).toEqual([]);
    });

    it(`${dir}: documented vars have derived entries for theming`, () => {
      // Every var that maps to a standard CSS property should have a
      // derived entry so theme authors can write standard CSS.
      const derivedVarNames = new Set(docDerived.flatMap(d => d.vars || []));
      const derivedExpands = docDerived
        .filter(d => d.expand)
        .map(d => d.expand);
      const hasContainerExpand = derivedExpands.includes('container');

      const missingDerived = docVars.filter(varName => {
        // Cross-component vars are handled by the owning component
        if (crossVars.has(varName)) {
          return false;
        }
        // Check if this var is covered by a derived entry
        if (derivedVarNames.has(varName)) {
          return false;
        }
        // Container expansion covers padding-related vars
        if (hasContainerExpand && varName.includes('padding')) {
          return false;
        }
        return true;
      });

      // Everything that is not explicitly classified as unmappable must have
      // a derived[] entry. (This was a `/radius|padding/` name test, which
      // exempted any var whose name lacked those words.)
      const themeableVars = missingDerived.filter(
        v => !VARS_WITHOUT_DERIVED_MAPPING.has(v),
      );

      expect(
        themeableVars,
        `${dir} has vars that should be themeable via derived[]: ${themeableVars.join(', ')}. ` +
          `Add derived[] entries in ${dir}.doc.mjs mapping standard CSS ` +
          `properties (borderRadius, padding) to these internal vars — or, if ` +
          `no standard property maps onto them, add them to ` +
          `VARS_WITHOUT_DERIVED_MAPPING with the reason.`,
      ).toEqual([]);
    });
  }
});

describe('derivedVarRegistry ↔ doc file consistency', () => {
  const components = discoverComponents();

  for (const {dir, docDerived} of components) {
    const key = DIR_TO_REGISTRY_KEY[dir];
    if (!key || docDerived.length === 0) {
      continue;
    }

    it(`${dir} (${key}): registry matches doc derived`, () => {
      const registryEntries = derivedVarRegistry[key];
      expect(registryEntries).toBeDefined();
      expect(registryEntries).toEqual(docDerived);
    });
  }

  // Catch new doc files with derived that have no registry key mapping
  it('every doc with theming.derived has a registry mapping', () => {
    const missing: string[] = [];
    for (const {dir, docDerived} of components) {
      if (docDerived.length === 0) {
        continue;
      }
      const key = DIR_TO_REGISTRY_KEY[dir];
      if (!key) {
        missing.push(
          `${dir}: has theming.derived but no DIR_TO_REGISTRY_KEY mapping. ` +
            `Add the mapping and a derivedVarRegistry entry.`,
        );
      } else if (!derivedVarRegistry[key]) {
        missing.push(
          `${dir} (${key}): has theming.derived but no derivedVarRegistry entry.`,
        );
      }
    }
    expect(missing).toEqual([]);
  });

  it('registry has no orphan entries', () => {
    const validKeys = new Set(Object.values(DIR_TO_REGISTRY_KEY));
    const orphans = Object.keys(derivedVarRegistry).filter(
      k => !validKeys.has(k),
    );
    expect(orphans).toEqual([]);
  });
});

describe('getDerivedVars', () => {
  it('returns matching entries for card borderRadius', () => {
    const result = getDerivedVars('card', 'borderRadius');
    expect(result).toHaveLength(1);
    expect(result[0].vars).toEqual(['--_card-radius']);
  });

  it('returns empty for unknown component', () => {
    expect(getDerivedVars('unknown', 'borderRadius')).toEqual([]);
  });

  it('returns empty for unregistered property', () => {
    expect(getDerivedVars('card', 'color')).toEqual([]);
  });

  it('marks textarea paddingInline as replacing the source property', () => {
    const result = getDerivedVars('textarea', 'paddingInline');
    expect(result).toHaveLength(1);
    expect(result[0].vars).toEqual(['--_textarea-inline-padding']);
    expect(result[0].replaces).toBe(true);
  });

  it('marks progressbar-mark width and height as replacing the source property', () => {
    for (const [property, varName] of [
      ['width', '--_progressbar-mark-width'],
      ['height', '--_progressbar-mark-height'],
    ]) {
      const result = getDerivedVars('progressbar-mark', property);
      expect(result).toHaveLength(1);
      expect(result[0].vars).toEqual([varName]);
      expect(result[0].replaces).toBe(true);
    }
  });
});
