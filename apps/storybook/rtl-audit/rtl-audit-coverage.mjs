// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Shared RTL coverage and directional-decoration helpers.
 * @input Rendered DOM decorations plus D1/D5/D6/curated audit results.
 * @output Contextual decoration candidates, pair verdicts, and per-component
 *   measured / verified-N-A / coverage-gap classifications.
 * @position Pure support layer for rtl-audit.mjs and its unit tests.
 */

const EXPLICIT_GLYPH_PAIRS = new Map([
  ['/', '\\'],
  ['\\', '/'],
  ['→', '←'],
  ['←', '→'],
  ['>', '<'],
  ['<', '>'],
]);

/**
 * Find single-glyph, aria-hidden decorations only when the DOM supplies a
 * directional context. A slash in prose is ignored; a slash attached to one of
 * several repeated list items is a separator and is measured.
 *
 * This function is passed directly to Playwright's page.evaluate(), so every
 * browser-side helper intentionally lives inside its body.
 */
export function collectDirectionalDecorations({
  root = globalThis.document,
  requireVisible = true,
} = {}) {
  if (!root?.querySelectorAll) {
    return [];
  }

  const candidateGlyphs = new Set([
    '/',
    '\\',
    '→',
    '←',
    '>',
    '<',
    '›',
    '‹',
    '»',
    '«',
  ]);
  const autoBidiGlyphs = new Set(['›', '‹', '»', '«']);
  const view =
    root.defaultView ?? root.ownerDocument?.defaultView ?? globalThis;

  function multiply(m, n) {
    return [
      m[0] * n[0] + m[2] * n[1],
      m[1] * n[0] + m[3] * n[1],
      m[0] * n[2] + m[2] * n[3],
      m[1] * n[2] + m[3] * n[3],
    ];
  }

  function composedMatrixFor(start) {
    let matrix = [1, 0, 0, 1];
    let element = start;
    let steps = 0;
    while (element && steps < 6) {
      const transform = view.getComputedStyle?.(element)?.transform;
      const match = transform?.match(/matrix\(([^)]+)\)/);
      if (match) {
        const values = match[1]
          .split(',')
          .map(value => Number.parseFloat(value.trim()));
        matrix = multiply([values[0], values[1], values[2], values[3]], matrix);
      }
      element = element.parentElement;
      steps += 1;
    }
    return matrix;
  }

  function repeatedItemContext(element) {
    const item = element.closest('li,[role="listitem"]');
    const parent = item?.parentElement;
    if (!item || !parent) {
      return null;
    }
    const items = Array.from(parent.children).filter(child =>
      child.matches('li,[role="listitem"]'),
    );
    if (items.length < 2) {
      return null;
    }
    return {
      kind: 'repeated-item',
      itemIndex: items.indexOf(item),
      itemCount: items.length,
    };
  }

  function betweenSiblingsContext(element) {
    const parent = element.parentElement;
    if (!parent) {
      return null;
    }
    const siblings = Array.from(parent.children);
    const index = siblings.indexOf(element);
    if (index <= 0 || index >= siblings.length - 1) {
      return null;
    }
    return {
      kind: 'between-siblings',
      itemIndex: index,
      itemCount: siblings.length,
    };
  }

  const candidates = [];
  for (const element of root.querySelectorAll('[aria-hidden="true"]')) {
    const glyph = element.textContent?.trim() ?? '';
    if (!candidateGlyphs.has(glyph)) {
      continue;
    }
    const context =
      repeatedItemContext(element) ?? betweenSiblingsContext(element);
    if (!context) {
      continue;
    }
    let glyphElement = element;
    while (
      glyphElement.children.length === 1 &&
      glyphElement.children[0].textContent?.trim() === glyph
    ) {
      glyphElement = glyphElement.children[0];
    }
    if (requireVisible) {
      const box = glyphElement.getBoundingClientRect();
      if (box.width < 1 || box.height < 1) {
        continue;
      }
    }
    candidates.push({
      index: candidates.length,
      glyph,
      policy: autoBidiGlyphs.has(glyph) ? 'auto-bidi' : 'explicit',
      context,
      matrix: composedMatrixFor(glyphElement),
    });
  }
  return candidates;
}

function matricesEqual(left, right) {
  return (
    Array.isArray(left) &&
    Array.isArray(right) &&
    left.length === 4 &&
    right.length === 4 &&
    left.every((value, index) => Math.abs(value - right[index]) < 0.01)
  );
}

function isMirrorOf(rtl, ltr) {
  if (!Array.isArray(rtl) || !Array.isArray(ltr)) {
    return false;
  }
  const expected = [-ltr[0], ltr[1], -ltr[2], ltr[3]];
  return expected.every((value, index) => Math.abs(value - rtl[index]) < 0.01);
}

/** Classify one stable LTR/RTL contextual-decoration pair. */
export function classifyDirectionalDecorationPair(ltr, rtl) {
  if (!ltr || !rtl) {
    return {verdict: 'fail', reason: 'decoration is missing in one direction'};
  }

  const mirrored = isMirrorOf(rtl.matrix, ltr.matrix);
  const sameMatrix = matricesEqual(ltr.matrix, rtl.matrix);
  const swapped = EXPLICIT_GLYPH_PAIRS.get(ltr.glyph) === rtl.glyph;

  if (ltr.policy === 'auto-bidi') {
    if (ltr.glyph !== rtl.glyph) {
      return {
        verdict: 'fail',
        reason:
          'Unicode-mirrored glyph was swapped in the DOM (double handling)',
      };
    }
    if (mirrored) {
      return {
        verdict: 'fail',
        reason:
          'Unicode-mirrored glyph also has an RTL transform (double handling)',
      };
    }
    if (!sameMatrix) {
      return {
        verdict: 'fail',
        reason:
          'Unicode-mirrored glyph has an unexpected direction-only transform',
      };
    }
    return {
      verdict: 'pass',
      reason: 'Unicode bidi mirroring handles the unchanged glyph',
    };
  }

  if (mirrored && swapped) {
    return {
      verdict: 'fail',
      reason: 'glyph is both swapped and transformed (double handling)',
    };
  }
  if (mirrored) {
    return {
      verdict: 'pass',
      reason: 'decoration mirrors through its transform',
    };
  }
  if (swapped && sameMatrix) {
    return {verdict: 'pass', reason: 'decoration swaps to its opposite glyph'};
  }
  return {
    verdict: 'fail',
    reason: 'contextual directional decoration neither mirrors nor swaps',
  };
}

/** Roll up all contextual decorations found in one story. */
export function evaluateDirectionalDecorations(ltr, rtl) {
  if (ltr.length === 0 && rtl.length === 0) {
    return {
      verdict: 'N-A',
      results: [],
      notes: ['no contextual directional decorations'],
    };
  }

  const count = Math.max(ltr.length, rtl.length);
  const results = [];
  for (let index = 0; index < count; index += 1) {
    const result = classifyDirectionalDecorationPair(ltr[index], rtl[index]);
    results.push({
      index,
      glyph: ltr[index]?.glyph ?? rtl[index]?.glyph,
      ...result,
    });
  }
  const failures = results.filter(result => result.verdict === 'fail');
  return {
    verdict: failures.length > 0 ? 'fail' : 'pass',
    results,
    notes:
      failures.length > 0
        ? failures.map(failure => `${failure.glyph ?? '?'}: ${failure.reason}`)
        : ['every contextual directional decoration mirrors exactly once'],
  };
}

function resultIsApplicable(result) {
  return result?.verdict === 'pass' || result?.verdict === 'fail';
}

function componentName(component) {
  return component.split('/').at(-1)?.toLowerCase() ?? component.toLowerCase();
}

/**
 * Build the component roster for a scoped audit.
 *
 * Storybook can expose an umbrella story whose name matches the PR analyzer's
 * module name even when no source component has that exact name. Chat is the
 * canonical example: the source directory contains ChatComposer, ChatMessage,
 * and related components, while Storybook also has a `Core/Chat` surface. A
 * matching story must satisfy the filter so the roster does not invent a
 * second `unknown/chat` coverage entry for the same surface.
 */
export function buildAuditedComponentRoster({
  sourceComponents = [],
  storyComponents = [],
  filters = [],
}) {
  const normalizedFilters = filters.map(filter => filter.toLowerCase());
  const knownComponents = [...sourceComponents, ...storyComponents];
  const unmatchedFilters = normalizedFilters
    .filter(
      filter =>
        !knownComponents.some(component => componentName(component) === filter),
    )
    .map(filter => `unknown/${filter}`);

  return Array.from(
    new Map(
      [...knownComponents, ...unmatchedFilters].map(component => [
        component.toLowerCase(),
        component,
      ]),
    ).values(),
  ).filter(
    component =>
      normalizedFilters.length === 0 ||
      normalizedFilters.includes(componentName(component)),
  );
}

/**
 * Classify every component in the audited roster. An unexplained all-N/A result
 * is a coverage gap; a verified-N/A declaration is stale if a detector later
 * finds applicable behavior.
 */
export function buildComponentCoverage({
  components,
  autoResults = [],
  positionalResults = [],
  decorationResults = [],
  curatedResults = [],
  verifiedNa = [],
  enforced = true,
}) {
  const byName = new Map();
  for (const component of components) {
    const key = component.toLowerCase();
    if (!byName.has(key)) {
      byName.set(key, {component, applicable: []});
    }
  }

  const addApplicable = (result, dimension, isApplicable) => {
    if (!isApplicable) {
      return;
    }
    const key = result.component.toLowerCase();
    const entry = byName.get(key) ?? {
      component: result.component,
      applicable: [],
    };
    entry.applicable.push({dimension, storyId: result.storyId});
    byName.set(key, entry);
  };

  for (const result of autoResults) {
    addApplicable(result, 'D1', resultIsApplicable(result));
  }
  for (const result of positionalResults) {
    addApplicable(result, 'D5', resultIsApplicable(result));
  }
  for (const result of decorationResults) {
    addApplicable(result, 'D6', resultIsApplicable(result));
  }
  for (const result of curatedResults) {
    addApplicable(
      result,
      'curated',
      ['RTL-ready', 'not-RTL', 'partial'].includes(result.rollup),
    );
  }

  const verified = new Map();
  for (const declaration of verifiedNa) {
    if (declaration?.component && declaration?.reason?.trim()) {
      verified.set(
        declaration.component.toLowerCase(),
        declaration.reason.trim(),
      );
    }
  }

  const results = Array.from(byName.values())
    .sort((left, right) => left.component.localeCompare(right.component))
    .map(entry => {
      const reason = verified.get(entry.component.toLowerCase());
      if (entry.applicable.length > 0 && reason) {
        return {
          ...entry,
          status: 'stale-verified-na',
          reason,
          note: 'verified-N/A declaration conflicts with applicable RTL behavior',
        };
      }
      if (entry.applicable.length > 0) {
        return {...entry, status: 'measured'};
      }
      if (reason) {
        return {...entry, status: 'verified-na', reason};
      }
      return {
        ...entry,
        status: 'coverage-gap',
        note: 'all dimensions are N-A and no verified-N/A reason is recorded',
      };
    });

  const count = status =>
    results.filter(result => result.status === status).length;
  return {
    enforced,
    total: results.length,
    measured: count('measured'),
    verifiedNa: count('verified-na'),
    gaps: count('coverage-gap'),
    staleVerifiedNa: count('stale-verified-na'),
    results,
  };
}
