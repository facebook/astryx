// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file css.mjs
 * @input Factored complete family plans
 * @output One native layered stylesheet for every selected member
 * @position AST-034 family CSS packaging and zero-specificity boundary
 */

/** @param {string} value */
function quoteAttribute(value) {
  return value.replaceAll('\\', '\\\\').replaceAll('"', '\\"');
}

/** @param {string} selector */
function splitSelectorList(selector) {
  const parts = [];
  let start = 0;
  let round = 0;
  let square = 0;
  let quote = null;
  let escaped = false;
  for (let index = 0; index < selector.length; index++) {
    const char = selector[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === '\\') {
      escaped = true;
      continue;
    }
    if (quote) {
      if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === '(') round += 1;
    else if (char === ')') round = Math.max(0, round - 1);
    else if (char === '[') square += 1;
    else if (char === ']') square = Math.max(0, square - 1);
    else if (char === ',' && round === 0 && square === 0) {
      parts.push(selector.slice(start, index).trim());
      start = index + 1;
    }
  }
  parts.push(selector.slice(start).trim());
  return parts;
}

/** @param {string} selector */
function pseudoElementIndex(selector) {
  let round = 0;
  let square = 0;
  let quote = null;
  let escaped = false;
  for (let index = 0; index < selector.length - 1; index++) {
    const char = selector[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === '\\') {
      escaped = true;
      continue;
    }
    if (quote) {
      if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === '(') round += 1;
    else if (char === ')') round = Math.max(0, round - 1);
    else if (char === '[') square += 1;
    else if (char === ']') square = Math.max(0, square - 1);
    else if (
      char === ':' &&
      selector[index + 1] === ':' &&
      round === 0 &&
      square === 0
    ) {
      return index;
    }
  }
  return -1;
}

/**
 * Zero one selector's specificity without placing a pseudo-element inside the
 * forgiving :where() list, which browsers silently discard.
 * @param {string} selector
 */
function zeroSelector(selector) {
  if (selector.trimStart().startsWith(':where(')) return selector;
  return splitSelectorList(selector)
    .map(part => {
      const pseudoIndex = pseudoElementIndex(part);
      const head = pseudoIndex === -1 ? part : part.slice(0, pseudoIndex);
      const tail = pseudoIndex === -1 ? '' : part.slice(pseudoIndex);
      return `:where(${head})${tail}`;
    })
    .join(', ');
}

/** @param {any} group */
function renderGroup(group) {
  const {unit} = group;
  let selector = unit.selector;
  if (group.shared && unit.scope === 'member') {
    selector =
      unit.selectorKind === 'token' ? ':where(:scope)' : zeroSelector(selector);
  }
  const important = unit.important ? ' !important' : '';
  let body = `${selector} {\n  ${unit.property}: ${unit.value}${important};\n}`;

  if (unit.scope === 'member') {
    const starts = group.members
      .map(
        /** @param {string} name */
        name => `[data-astryx-theme="${quoteAttribute(name)}"]`,
      )
      .join(', ');
    body = `@scope (${starts}) to ([data-astryx-theme]) {\n${body
      .split('\n')
      .map(line => `  ${line}`)
      .join('\n')}\n}`;
  }

  for (const atRule of [...unit.atRules].reverse()) {
    body = `@${atRule.name} ${atRule.params} {\n${body
      .split('\n')
      .map(line => `  ${line}`)
      .join('\n')}\n}`;
  }

  return `@layer ${unit.layer} {\n${body
    .split('\n')
    .map(line => `  ${line}`)
    .join('\n')}\n}`;
}

/** @param {{groups: any[]}} factored */
export function renderFamilyCSS(factored) {
  const blocks = factored.groups.map(renderGroup);
  return `@layer reset, astryx-base, astryx-theme;\n\n${blocks.join('\n\n')}\n`;
}
