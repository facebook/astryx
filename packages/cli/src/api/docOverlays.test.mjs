// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Guards the --dense / --zh reference-doc overlays against drift (#2182).
 * @input packages/cli/docs/{topic}.doc.mjs and its .doc.dense.mjs / .doc.zh.mjs overlays.
 * @output Vitest failures naming any overlay section that does not anchor to a
 *   real base section, or whose content overrides land on the wrong block type.
 * @position Regression gate for the docs API. Sits with the loader it guards.
 *
 * The overlays used to be applied BY ARRAY POSITION, so an overlay whose
 * sections were ordered differently from the base grafted every title onto the
 * wrong body. `docs tokens --dense` printed the entire colour table under a
 * heading that said "## Spacing", above prose reading "gap props use
 * space0-space12" — teaching any agent that spacing tokens are named
 * `--color-*`. CLAUDE.md tells every agent to run that exact command at
 * bootstrap, which is what made a doc bug into a codegen bug.
 *
 * Overlays now anchor to a base section by title, so a reordered or
 * partial overlay is correct by construction. These tests keep it that way.
 */

import {describe, it, expect} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {pathToFileURL} from 'node:url';
import {docs} from './docs.mjs';

const DOCS_DIR = path.join(import.meta.dirname, '..', '..', 'docs');

/** Every base reference doc that has at least one overlay. */
function overlayPairs() {
  const pairs = [];
  for (const file of fs.readdirSync(DOCS_DIR)) {
    const m = file.match(/^(.+)\.doc\.(dense|zh)\.mjs$/);
    if (!m) continue;
    const [, topic, variant] = m;
    pairs.push({
      topic,
      variant,
      basePath: path.join(DOCS_DIR, `${topic}.doc.mjs`),
      overlayPath: path.join(DOCS_DIR, file),
    });
  }
  return pairs;
}

async function load(p) {
  return await import(pathToFileURL(p).href);
}

describe('reference doc overlays (#2182)', () => {
  const pairs = overlayPairs();

  it('finds overlays to check', () => {
    // A rename that stops overlays being discovered must not silently pass.
    expect(pairs.length).toBeGreaterThan(0);
  });

  for (const {topic, variant, basePath, overlayPath} of pairs) {
    it(`${topic} --${variant}: every overlay section anchors to a real base section`, async () => {
      const base = await load(basePath);
      const overlayMod = await load(overlayPath);
      const overlay = overlayMod.docsDense || overlayMod.docsZh;

      const baseTitles = base.docs.sections.map(s => s.title);
      const unanchored = (overlay.sections || [])
        .filter(s => s.section == null || !baseTitles.includes(s.section))
        .map(s => s.section ?? `(no anchor) "${s.title}"`);

      expect(
        unanchored,
        `${topic}.doc.${variant}.mjs has section entries that do not name a ` +
          `base section via \`section:\`. Without an anchor the overlay is ` +
          `applied by array position, which silently grafts each title onto ` +
          `the wrong body. Base sections are: ${baseTitles.join(', ')}.`,
      ).toEqual([]);
    });

    it(`${topic} --${variant}: no base section is overridden twice`, async () => {
      const overlayMod = await load(overlayPath);
      const overlay = overlayMod.docsDense || overlayMod.docsZh;
      const anchors = (overlay.sections || []).map(s => s.section);
      const dupes = anchors.filter((a, i) => anchors.indexOf(a) !== i);
      expect(dupes, `${topic}.doc.${variant}.mjs overrides the same base section twice`).toEqual([]);
    });
  }
});

describe('the reported defect: docs tokens --dense (#2182)', () => {
  it('does not print the colour table under the Spacing heading', async () => {
    const result = await docs('tokens', null, {dense: true});
    const spacing = result.data.sections.find(s => /spacing/i.test(s.title));
    expect(spacing, 'tokens docs should have a spacing section').toBeTruthy();

    const text = JSON.stringify(spacing);
    expect(
      text.includes('--color-'),
      `The "${spacing.title}" section of \`docs tokens --dense\` contains ` +
        `colour tokens. An agent reading this learns that spacing tokens are ` +
        `named --color-*.`,
    ).toBe(false);
    expect(text).toContain('--spacing-');
  });

  it('keeps every base section reachable, even without an overlay entry', async () => {
    // The tokens overlay compresses only 6 of 13 sections. The other 7 must
    // still render (in English), not vanish or absorb a neighbour's title.
    const full = await docs('tokens', null, {});
    const dense = await docs('tokens', null, {dense: true});
    expect(dense.data.sections.length).toBe(full.data.sections.length);
  });

  it('does not lose the Extending a Theme section from docs theme --dense', async () => {
    const dense = await docs('theme', null, {dense: true});
    const titles = dense.data.sections.map(s => s.title);
    expect(titles).toContain('Extending a Theme');
  });

  it('does not emit a duplicate useTheme heading in docs theme --dense', async () => {
    const dense = await docs('theme', null, {dense: true});
    const titles = dense.data.sections.map(s => s.title.toLowerCase());
    const useTheme = titles.filter(t => t.includes('usetheme'));
    expect(useTheme.length).toBe(1);
  });

  it('does not leak English headings into docs theme --zh', async () => {
    const zh = await docs('theme', null, {zh: true});
    const titles = zh.data.sections.map(s => s.title);
    // Every section the overlay translates must appear once, in Chinese only.
    expect(titles).not.toContain('Light/Dark Mode');
    expect(titles).toContain('亮/暗模式');
  });
});

describe('reference overlays are id-anchored and prose-only (bulletproof, #2182)', () => {
  const pairs = overlayPairs();

  for (const {topic, variant, basePath, overlayPath} of pairs) {
    it(`${topic} --${variant}: block overrides anchor to real base block ids, prose-only`, async () => {
      const base = (await load(basePath)).docs;
      const overlayMod = await load(overlayPath);
      const overlay = overlayMod.docsDense || overlayMod.docsZh;
      const baseSections = new Map(base.sections.map(s => [s.title, s]));

      const problems = [];
      for (const os of overlay.sections || []) {
        // The legacy positional `content` shape is forbidden — it is the exact
        // footgun this system removes. Overlays must use id-keyed `blocks`.
        if ('content' in os) {
          problems.push(
            `section "${os.section}" uses legacy positional \`content\`; use id-keyed \`blocks\``,
          );
        }
        const cs = baseSections.get(os.section);
        if (!cs) continue; // unresolved sections are caught by the anchor test above
        const baseBlocks = new Map(
          (cs.content || []).filter(b => b.id != null).map(b => [b.id, b]),
        );
        for (const ob of os.blocks || []) {
          if (ob.id == null) {
            problems.push(`section "${os.section}" has a block override with no \`id\``);
            continue;
          }
          const bb = baseBlocks.get(ob.id);
          if (!bb) {
            problems.push(`section "${os.section}" overrides unknown block id "${ob.id}"`);
            continue;
          }
          // Prose-only: an override may carry only id + text/items, and its
          // shape must match the base block type. It can never introduce a
          // type, code, table, or any other structural field.
          const extra = Object.keys(ob).filter(k => !['id', 'text', 'items'].includes(k));
          if (extra.length) {
            problems.push(`block "${ob.id}" in "${os.section}" carries non-prose keys: ${extra.join(', ')}`);
          }
          if ('text' in ob && bb.type !== 'prose') {
            problems.push(`block "${ob.id}" supplies \`text\` but base block is "${bb.type}", not prose`);
          }
          if ('items' in ob && bb.type !== 'list') {
            problems.push(`block "${ob.id}" supplies \`items\` but base block is "${bb.type}", not list`);
          }
        }
      }

      expect(
        problems,
        `${topic}.doc.${variant}.mjs has overlay issues that could drop or ` +
          `misrepresent canonical content:\n  ${problems.join('\n  ')}`,
      ).toEqual([]);
    });

    it(`${topic} --${variant}: every base block that can be overridden has a unique id`, async () => {
      // Overlays can only reach blocks that carry an id, so a doc with overlays
      // should give its prose/list blocks stable, unique ids.
      const base = (await load(basePath)).docs;
      const dupes = [];
      for (const section of base.sections) {
        const ids = (section.content || []).map(b => b.id).filter(Boolean);
        const seen = new Set();
        for (const id of ids) {
          if (seen.has(id)) dupes.push(`${section.title} → ${id}`);
          seen.add(id);
        }
      }
      expect(dupes, `${topic}.doc.mjs has duplicate block ids: ${dupes.join(', ')}`).toEqual([]);
    });
  }
});

describe('every reference doc block has a required, unique id (#2182)', () => {
  // id is required on ContentBlock so any block is addressable by an overlay.
  // Docs are JSDoc-typed .mjs (not strictly type-checked), so this is the real
  // enforcement: every block in every reference doc must carry a unique id.
  const canonical = fs.readdirSync(DOCS_DIR).filter(f => /\.doc\.mjs$/.test(f));

  it('discovers canonical reference docs', () => {
    expect(canonical.length).toBeGreaterThan(0);
  });

  for (const file of canonical) {
    it(`${file}: every block has an id, unique within its section`, async () => {
      const mod = await load(path.join(DOCS_DIR, file));
      const doc = mod.docs;
      const problems = [];
      for (const section of doc.sections || []) {
        const seen = new Set();
        (section.content || []).forEach((b, i) => {
          if (b == null) return;
          if (b.id == null) {
            problems.push(`section "${section.title}" block #${i} (${b.type}) has no id`);
          } else if (seen.has(b.id)) {
            problems.push(`section "${section.title}" has a duplicate id "${b.id}"`);
          } else {
            seen.add(b.id);
          }
        });
      }
      expect(
        problems,
        `${file} has blocks without a stable, unique id (id is required so every ` +
          `block is addressable by an overlay):\n  ${problems.join('\n  ')}`,
      ).toEqual([]);
    });
  }
});
