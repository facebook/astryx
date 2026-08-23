// Copyright (c) Meta Platforms, Inc. and affiliates.

/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * @file Guards playground descriptors in doc files (#2008).
 *
 * Scans every {Name}.doc.mjs for `playground` config and ElementDescriptor
 * (`__element`) usage and verifies:
 *
 * 1. Every `playground.defaults` key names a documented prop of the entry
 *    that declares it (for compound docs whose props live on components[]
 *    sub-entries, the union of those). A defaults key with no matching prop
 *    is dead state: the docsite silently applies the value to the preview
 *    with no knob and no prop documentation.
 * 2. Every `__element` name (slotElements and playground defaults, however
 *    deeply nested) resolves the way the docsite resolver does: bare export
 *    from the package index, legacy `XDS`-prefixed export, or an intrinsic
 *    lowercase HTML tag. A typo ('XDSIcn') would otherwise silently render
 *    as an unknown DOM tag in the docsite playground.
 * 3. The #2008 slice components carry playground defaults and slot coverage
 *    for their ReactNode props.
 */

import {describe, it, expect} from 'vitest';
import {readdirSync} from 'node:fs';
import {join, relative} from 'node:path';
import * as Core from './index';

const SRC_DIR = __dirname;

interface PropEntry {
  name: string;
  type?: string;
  slotElements?: unknown[];
}

interface DocEntry {
  name?: string;
  props?: PropEntry[];
  playground?: {defaults?: Record<string, unknown>};
  components?: DocEntry[];
}

function findDocFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, {withFileTypes: true})) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findDocFiles(full));
    } else if (entry.name.endsWith('.doc.mjs')) {
      files.push(full);
    }
  }
  return files;
}

/**
 * Mirrors apps/docsite resolveElements.ts getComponent(): strip a leading
 * `XDS`, read the bare export, fall back to the `XDS`-prefixed export, and
 * require a function (component). Names starting lowercase are intrinsic
 * HTML tags (e.g. Field's `input` descriptor) and always resolve.
 */
function elementNameResolves(name: string): boolean {
  if (/^[a-z]/.test(name)) {
    return true;
  }
  const bare = name.replace(/^XDS/, '');
  const exports = Core as Record<string, unknown>;
  return (
    typeof exports[bare] === 'function' ||
    typeof exports[`XDS${bare}`] === 'function'
  );
}

/** Collect every `__element` name reachable from a doc module export. */
function collectElementNames(value: unknown, out: string[]): void {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectElementNames(item, out);
    }
  } else if (value && typeof value === 'object') {
    const element = (value as {__element?: unknown}).__element;
    if (typeof element === 'string') {
      out.push(element);
    }
    for (const item of Object.values(value)) {
      collectElementNames(item, out);
    }
  }
}

/** A doc module export plus its inline sub-component entries. */
function docEntries(value: unknown): DocEntry[] {
  if (!value || typeof value !== 'object') {
    return [];
  }
  const doc = value as DocEntry;
  return [doc, ...(doc.components || [])];
}

const docFiles = findDocFiles(SRC_DIR);

describe('doc playground descriptors', () => {
  it('sanity: discovers doc files with playground config', () => {
    expect(docFiles.length).toBeGreaterThan(0);
    const withPlayground = docFiles.filter(file =>
      docEntries((require(file) as {docs?: unknown}).docs).some(
        entry => entry.playground,
      ),
    );
    expect(withPlayground.length).toBeGreaterThan(0);
  });

  it('every playground.defaults key is a documented prop of its component', () => {
    const violations: string[] = [];
    for (const file of docFiles) {
      const mod = require(file) as Record<string, unknown>;
      for (const exported of Object.values(mod)) {
        for (const entry of docEntries(exported)) {
          const defaults = entry.playground?.defaults;
          if (!defaults) {
            continue;
          }
          // Compound docs (e.g. Toolbar) declare playground on the top-level
          // entry while the props live on a same-named components[] entry —
          // validate against the union so those defaults aren't exempt.
          const props = Array.isArray(entry.props)
            ? entry.props
            : (entry.components || []).flatMap(sub => sub.props || []);
          if (props.length === 0) {
            continue;
          }
          const documented = new Set(props.map(prop => prop.name));
          for (const key of Object.keys(defaults)) {
            if (!documented.has(key)) {
              violations.push(
                `${relative(SRC_DIR, file)}: ${entry.name || '(unnamed)'} ` +
                  `playground.defaults key "${key}" is not a documented prop. ` +
                  `Add it to props[] or remove the default.`,
              );
            }
          }
        }
      }
    }
    expect(violations, violations.join('\n')).toEqual([]);
  });

  it('every __element name resolves to a real exported component', () => {
    const violations: string[] = [];
    for (const file of docFiles) {
      const names: string[] = [];
      collectElementNames(require(file), names);
      for (const name of names) {
        if (!elementNameResolves(name)) {
          violations.push(
            `${relative(SRC_DIR, file)}: __element "${name}" does not ` +
              `resolve to an @astryxdesign/core export (checked "` +
              `${name.replace(/^XDS/, '')}" and "XDS${name.replace(
                /^XDS/,
                '',
              )}"). The docsite playground would createElement an unknown ` +
              `tag. Fix the name or export the component.`,
          );
        }
      }
    }
    expect(violations, violations.join('\n')).toEqual([]);
  });

  describe('#2008 slice: playground coverage for target components', () => {
    const SLICE_COMPONENTS = [
      'Section',
      'FormLayout',
      'Breadcrumbs',
      'List',
      'RadioList',
      'CheckboxList',
      'DropdownMenu',
    ];

    const sliceDocs = SLICE_COMPONENTS.map(name => {
      const file = join(SRC_DIR, name, `${name}.doc.mjs`);
      return {name, docs: (require(file) as {docs?: DocEntry}).docs};
    });

    it('each slice component declares non-empty playground defaults', () => {
      const missing = sliceDocs
        .filter(
          ({docs}) =>
            !docs?.playground?.defaults ||
            Object.keys(docs.playground.defaults).length === 0,
        )
        .map(({name}) => name);
      expect(
        missing,
        `Missing playground.defaults: ${missing.join(', ')}`,
      ).toEqual([]);
    });

    it('each slice ReactNode prop has slotElements or a children default', () => {
      const violations: string[] = [];
      for (const {name, docs} of sliceDocs) {
        for (const prop of docs?.props || []) {
          if (prop.type !== 'ReactNode') {
            continue;
          }
          const hasSlotElements =
            Array.isArray(prop.slotElements) && prop.slotElements.length > 0;
          // Generic-container `children` skips slotElements per #2008; the
          // playground default must supply the content instead.
          const coveredByDefaults =
            prop.name === 'children' &&
            docs?.playground?.defaults?.children != null;
          if (!hasSlotElements && !coveredByDefaults) {
            violations.push(
              `${name}.${prop.name}: ReactNode prop has no slotElements ` +
                `and no playground children default.`,
            );
          }
        }
      }
      expect(violations, violations.join('\n')).toEqual([]);
    });

    it('the inline BreadcrumbItem entry keeps its startIcon slotElements', () => {
      // components[] props sit outside the top-level loop above — pin the
      // slice's one sub-entry slot descriptor explicitly.
      const breadcrumbs = sliceDocs.find(({name}) => name === 'Breadcrumbs');
      const subEntry = breadcrumbs?.docs?.components?.find(
        sub => sub.name === 'BreadcrumbItem',
      );
      const subProps = subEntry?.props || [];
      const startIcon = subProps.find(prop => prop.name === 'startIcon');
      expect(startIcon?.slotElements?.length ?? 0).toBeGreaterThan(0);
    });
  });
});
