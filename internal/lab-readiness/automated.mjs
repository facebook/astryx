// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file automated.mjs
 * @description Derives the readiness checks that can be proven from the repo
 *   itself — source layout, exports, stories, tests, docs, token usage, and
 *   whether the component is actually reachable by the CI accessibility and
 *   RTL gates. Everything that needs a human, an RFC, or a CI run is declared
 *   in `manifest.mjs` instead.
 * @input repoRoot + a candidate descriptor from `manifest.mjs`
 * @output `Record<checkKey, {state, note, evidence[]}>` for the derivable subset
 * @position Called by `audit.mjs`, which merges these results over the
 *   manifest's declared states. A derived result always wins over a declared
 *   one: the point of the tooling is that the repo can contradict the claim.
 *
 * Every derivation is deliberately shallow — regex and file existence, no AST.
 * A check here answers "is the evidence present and wired up", never "is it
 * good". Quality judgements belong to the human review stage.
 */

import fs from 'node:fs';
import path from 'node:path';

const LAB_SRC = 'packages/lab/src';
const STORIES_DIR = 'apps/storybook/stories';
const CI_WORKFLOW = '.github/workflows/ci.yml';
const RTL_AUDIT = 'apps/storybook/rtl-audit/rtl-audit.mjs';

/** Read a repo-relative file, or null when it does not exist. */
function read(repoRoot, relPath) {
  try {
    return fs.readFileSync(path.join(repoRoot, relPath), 'utf8');
  } catch {
    return null;
  }
}

function exists(repoRoot, relPath) {
  return fs.existsSync(path.join(repoRoot, relPath));
}

/** A single piece of machine-derived evidence. */
function ev(description, filePath, line) {
  return {description, path: filePath ?? null, line: line ?? null, url: null};
}

/** Find the 1-based line number of the first regex match, or null. */
function lineOf(content, pattern) {
  if (!content) return null;
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (pattern.test(lines[i])) return i + 1;
  }
  return null;
}

/**
 * Resolve every path a candidate owns. `sourceDir` is the directory name under
 * `packages/lab/src`, which is also how analyze-pr.js names the component.
 */
function paths(candidate) {
  const dir = `${LAB_SRC}/${candidate.sourceDir}`;
  return {
    dir,
    source: `${dir}/${candidate.sourceDir}.tsx`,
    barrel: `${dir}/index.ts`,
    doc: `${dir}/${candidate.sourceDir}.doc.mjs`,
    test: `${dir}/${candidate.sourceDir}.test.tsx`,
    stories: `${STORIES_DIR}/${candidate.sourceDir}.stories.tsx`,
  };
}

/** Named story exports in a stories file. */
function storyExports(content) {
  if (!content) return [];
  return [...content.matchAll(/^export const (\w+):\s*Story\b/gm)].map(
    m => m[1],
  );
}

/** Every `title: 'X/Y'` in a stories file. */
function storyTitles(content) {
  if (!content) return [];
  return [...content.matchAll(/title:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
}

/**
 * The component name `pr-a11y` derives from a story title, mirroring
 * accessibility-audit.js: second title segment, `XDS` stripped, lowercased.
 */
function a11yComponentFromTitle(title) {
  const parts = title.split('/');
  const componentPart = parts.length > 1 ? parts[1] : parts[0];
  return componentPart.replace(/^XDS/i, '').toLowerCase();
}

/** Roots the ci.yml `check-components` gate diffs against. */
function ciComponentRoots(repoRoot) {
  const ci = read(repoRoot, CI_WORKFLOW);
  if (!ci) return [];
  const match = ci.match(/git diff --name-only [^\n]*?\.\.\.HEAD --([^|\n]+)/);
  if (!match) return [];
  return match[1].trim().split(/\s+/).filter(Boolean);
}

/** Story-id prefixes the RTL auto-discovery sweep covers. */
function rtlAuditedPrefixes(repoRoot) {
  const rtl = read(repoRoot, RTL_AUDIT);
  if (!rtl) return [];
  const match = rtl.match(/AUDITED_STORY_PREFIXES\s*=\s*\[([^\]]+)\]/);
  if (!match) return [];
  return [...match[1].matchAll(/['"]([^'"]+)['"]/g)].map(m => m[1]);
}

/** Pass/fail helper: `passed` when every requirement holds, else `in_progress`. */
function verdict(failures) {
  return failures.length === 0 ? 'passed' : 'in_progress';
}

/**
 * Derive every provable check for one candidate.
 *
 * @param {string} repoRoot
 * @param {object} candidate
 * @returns {Record<string, {state: string, note: string, evidence: object[]}>}
 */
export function deriveChecks(repoRoot, candidate) {
  const p = paths(candidate);
  const source = read(repoRoot, p.source);
  const barrel = read(repoRoot, p.barrel);
  const doc = read(repoRoot, p.doc);
  const test = read(repoRoot, p.test);
  const stories = read(repoRoot, p.stories);
  const labBarrel = read(repoRoot, `${LAB_SRC}/index.ts`);

  const results = {};
  const add = (key, state, note, evidence = []) => {
    results[key] = {state, note, evidence};
  };

  /* ---------------------------------------------------------- build ---- */

  {
    const failures = [];
    const evidence = [];
    if (!source) {
      failures.push('source file missing');
      evidence.push(ev('Expected component source is absent.', p.source));
    } else {
      evidence.push(
        ev('Component source.', p.source, lineOf(source, /^export /m)),
      );
    }
    const missingExports = candidate.publicExports.filter(
      name => !barrel || !new RegExp(`\\b${name}\\b`).test(barrel),
    );
    if (missingExports.length > 0) {
      failures.push(`barrel omits ${missingExports.join(', ')}`);
      evidence.push(ev('Component barrel.', p.barrel));
    }
    add(
      'implementation',
      verdict(failures),
      failures.length === 0
        ? 'Source is present and every declared public export is re-exported.'
        : `Contract incomplete: ${failures.join('; ')}.`,
      evidence,
    );
  }

  {
    const failures = [];
    const evidence = [];
    if (source) {
      if (!/@astryxdesign\/core\//.test(source)) {
        failures.push('composes no core primitive');
      }
      const portalLine = lineOf(source, /createPortal/);
      if (portalLine) {
        failures.push('portals directly instead of composing Layer');
        evidence.push(
          ev(
            'Direct createPortal use; the shared Layer behavior is the supported path.',
            p.source,
            portalLine,
          ),
        );
      }
      const ariaLiveLine = lineOf(source, /aria-live/);
      if (ariaLiveLine && !/useAnnounce/.test(source)) {
        failures.push('hand-rolls a live region instead of useAnnounce');
        evidence.push(
          ev('Ad hoc aria-live node.', p.source, ariaLiveLine),
        );
      }
      const inlineSvgLine = lineOf(source, /<svg\b/);
      if (inlineSvgLine) {
        failures.push('renders raw SVG instead of the Icon primitive');
        evidence.push(ev('Inline SVG element.', p.source, inlineSvgLine));
      }
    }
    add(
      'systemIntegration',
      verdict(failures),
      failures.length === 0
        ? 'Composes core primitives and shared behaviors rather than re-implementing them.'
        : `Bypasses shared primitives: ${failures.join('; ')}.`,
      evidence,
    );
  }

  {
    const names = storyExports(stories);
    const titles = storyTitles(stories);
    const failures = [];
    if (names.length === 0) failures.push('no exported stories');
    if (!titles.includes(candidate.storyTitle)) {
      failures.push(`no story titled ${candidate.storyTitle}`);
    }
    add(
      'stories',
      verdict(failures),
      failures.length === 0
        ? `${names.length} stories under ${candidate.storyTitle}.`
        : `Story set incomplete: ${failures.join('; ')}.`,
      [ev(`Exported stories: ${names.join(', ') || 'none'}.`, p.stories)],
    );
  }

  {
    const count = test ? (test.match(/\bit\(/g) || []).length : 0;
    add(
      'tests',
      count > 0 ? 'passed' : 'not_started',
      count > 0
        ? `${count} focused tests colocated with the source.`
        : 'No colocated test file.',
      [ev(`${count} test cases.`, p.test)],
    );
  }

  {
    const failures = [];
    if (!doc) failures.push('no .doc.mjs');
    else {
      if (!/\bprops:\s*\[/.test(doc)) failures.push('no props inventory');
      if (!/\busage:\s*\{/.test(doc)) failures.push('no usage guidance');
      if (!/\bexamples:\s*\[/.test(doc)) failures.push('no examples');
    }
    add(
      'documentation',
      verdict(failures),
      failures.length === 0
        ? 'Component doc declares props, usage, and examples.'
        : `Documentation incomplete: ${failures.join('; ')}.`,
      [ev('Component documentation.', p.doc)],
    );
  }

  /* --------------------------------------------------- harden: audit ---- */

  {
    const failures = [];
    const evidence = [];
    if (!doc || !/\btheming:\s*\{/.test(doc)) {
      failures.push('no theming.targets inventory');
      evidence.push(
        ev(
          'The theme builder derives a component\u2019s known visual props from its doc; without a theming block it is invisible to `astryx theme build`.',
          p.doc,
        ),
      );
    }
    if (source) {
      const hexLine = lineOf(source, /:\s*'#[0-9a-fA-F]{3,8}'/);
      if (hexLine) {
        failures.push('hardcoded hex color');
        evidence.push(ev('Raw hex instead of a color token.', p.source, hexLine));
      }
    }
    add(
      'tokensTheming',
      verdict(failures),
      failures.length === 0
        ? 'Theme targets are declared and colors come from tokens.'
        : `Theming incomplete: ${failures.join('; ')}.`,
      evidence,
    );
  }

  {
    const failures = [];
    const badNames = candidate.publicExports.filter(
      name => !/^[A-Z]/.test(name) && !name.endsWith('Vars'),
    );
    if (badNames.length > 0) {
      failures.push(`non-conventional export names: ${badNames.join(', ')}`);
    }
    if (source && /<svg\b/.test(source)) {
      failures.push('raw SVG bypasses the Icon primitive');
    }
    add(
      'reuseNaming',
      verdict(failures),
      failures.length === 0
        ? 'Public names follow convention and shared primitives are reused.'
        : `Reuse or naming issue: ${failures.join('; ')}.`,
      [],
    );
  }

  {
    const failures = [];
    if (!barrel) failures.push('no index.ts barrel');
    // Both spellings are conventional: a dedicated `export type {...}` block,
    // or inline `type` modifiers inside a value export block.
    else if (!/export type\s*\{|\{[^}]*\btype\s+\w/s.test(barrel)) {
      failures.push('barrel exports no public types');
    }
    add(
      'structureTypes',
      verdict(failures),
      failures.length === 0
        ? 'Conventional barrel exporting both the component and its public types.'
        : `Structure incomplete: ${failures.join('; ')}.`,
      [ev('Component barrel.', p.barrel)],
    );
  }

  {
    // The gate this component must clear before axe ever sees it. Both halves
    // have silently excluded lab components before, so both are asserted.
    const failures = [];
    const evidence = [];
    const roots = ciComponentRoots(repoRoot);
    if (!roots.some(root => root.startsWith(`${LAB_SRC}`))) {
      failures.push('ci.yml change detection excludes packages/lab/src');
      evidence.push(
        ev(
          `check-components diffs only ${roots.join(' ') || '(unparsed)'}, so a lab-only PR skips pr-a11y entirely.`,
          CI_WORKFLOW,
          lineOf(read(repoRoot, CI_WORKFLOW), /git diff --name-only/),
        ),
      );
    }
    const titles = storyTitles(stories);
    const resolves = titles.some(
      t => a11yComponentFromTitle(t) === candidate.sourceDir.toLowerCase(),
    );
    if (!resolves) {
      failures.push(
        `no story title resolves to the analyzer's component name "${candidate.sourceDir}"`,
      );
      evidence.push(
        ev(
          `pr-a11y matches a story's title segment against the changed component name; found ${titles.join(', ') || 'no titles'}.`,
          p.stories,
        ),
      );
    }
    add(
      'accessibilityContracts',
      verdict(failures),
      failures.length === 0
        ? 'Reachable by the automated accessibility gate.'
        : `Not reachable by the accessibility gate: ${failures.join('; ')}.`,
      evidence,
    );
  }

  {
    const failures = [];
    const exported =
      labBarrel &&
      candidate.publicExports.every(name =>
        new RegExp(`\\b${name}\\b`).test(labBarrel),
      );
    if (!exported) failures.push('not exported from the lab package barrel');
    add(
      'exportsAuditCI',
      verdict(failures),
      failures.length === 0
        ? 'Public exports reach the package barrel.'
        : `Export gap: ${failures.join('; ')}.`,
      [ev('Lab package barrel.', `${LAB_SRC}/index.ts`)],
    );
  }

  /* ------------------------------------------------ harden: objective ---- */

  {
    // Every state the component advertises must be exercised somewhere a
    // reviewer can see it (a story) and somewhere regression-proof (a test).
    const missing = [];
    for (const state of candidate.stateProps) {
      const inStories = stories ? new RegExp(`\\b${state}\\b`).test(stories) : false;
      const inTests = test ? new RegExp(`\\b${state}\\b`).test(test) : false;
      if (!inStories || !inTests) {
        missing.push(
          `${state} (${!inStories ? 'no story' : ''}${!inStories && !inTests ? ', ' : ''}${!inTests ? 'no test' : ''})`,
        );
      }
    }
    add(
      'stateCoverage',
      verdict(missing),
      missing.length === 0
        ? `All ${candidate.stateProps.length} advertised states are covered by a story and a test.`
        : `Uncovered states: ${missing.join('; ')}.`,
      [ev('Stories.', p.stories), ev('Tests.', p.test)],
    );
  }

  {
    const names = storyExports(stories);
    const hasThemeStory = names.some(n => /theme/i.test(n));
    add(
      'visualThemes',
      hasThemeStory ? 'passed' : 'in_progress',
      hasThemeStory
        ? 'A pinned theme story fixes light, dark, and nested rendering.'
        : 'No pinned theme story; theme rendering is only reachable through the global toolbar toggle.',
      [ev(`Story names: ${names.join(', ') || 'none'}.`, p.stories)],
    );
  }

  {
    const failures = [];
    const evidence = [];
    if (!test || !/\bkeyboard\b|\bArrow|\bTab\b|\bEnter\b|\bEscape\b/i.test(test)) {
      failures.push('no keyboard interaction tests');
    }
    const prefixes = rtlAuditedPrefixes(repoRoot);
    if (!prefixes.includes('lab-')) {
      failures.push('RTL auto-discovery skips lab stories');
      evidence.push(
        ev(
          `The RTL sweep only walks ${prefixes.join(', ') || '(unparsed)'} story ids.`,
          RTL_AUDIT,
        ),
      );
    }
    add(
      'keyboardAccessibility',
      verdict(failures),
      failures.length === 0
        ? 'Keyboard behavior is tested and the component is inside the RTL sweep.'
        : `Keyboard or direction coverage incomplete: ${failures.join('; ')}.`,
      evidence,
    );
  }

  {
    const names = storyExports(stories).join(' ');
    const missing = ['empty', 'loading', 'disabled'].filter(
      kind => !new RegExp(kind, 'i').test(names),
    );
    add(
      'edgeCases',
      verdict(missing),
      missing.length === 0
        ? 'Empty, loading, and disabled cases each have a dedicated story.'
        : `No dedicated story for: ${missing.join(', ')}.`,
      [ev(`Story names: ${names || 'none'}.`, p.stories)],
    );
  }

  {
    // Story completeness is the roll-up of the three story-shaped checks — it
    // passes only when the matrix a reviewer needs is actually reviewable.
    const dependencies = ['stories', 'visualThemes', 'edgeCases', 'stateCoverage'];
    const unmet = dependencies.filter(key => results[key]?.state !== 'passed');
    add(
      'storyCompleteness',
      verdict(unmet),
      unmet.length === 0
        ? 'The full state, edge-case, and theme matrix is reviewable in Storybook.'
        : `Matrix incomplete because these are unmet: ${unmet.join(', ')}.`,
      [],
    );
  }

  return results;
}

/** Exported for tests. */
export const _internal = {
  a11yComponentFromTitle,
  ciComponentRoots,
  rtlAuditedPrefixes,
  storyExports,
  storyTitles,
};
