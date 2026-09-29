// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file pressState.ts
 * @input Uses document.styleSheets (populated by StyleX runtime injection)
 * @output Exports rulesDeclaredFor and expectPressedArm test helpers
 * @position Shared test helper for asserting a control paints a pressed state
 *
 * jsdom does not compute `:active` (there is no real pointer), so a component
 * test asserts the next-best thing: that the StyleX dev runtime injected a
 * rule, keyed to the element's own classes, that paints the design system's
 * pressed overlay token while the control is pressed. The selector shape is
 * deliberately not pinned — a press may be read off the element itself
 * (`.x:active`) or off an ancestor scope marker (`.x:where(.marker:active *)`).
 *
 * SYNC: When modified, update this header.
 */

const PRESSED_TOKEN = '--color-overlay-pressed';

function walk(list: CSSRuleList, visit: (rule: CSSRule) => void): void {
  for (const rule of Array.from(list)) {
    visit(rule);
    const nested = (rule as CSSGroupingRule).cssRules;
    if (nested != null) {
      walk(nested, visit);
    }
  }
}

/**
 * Every injected style rule (rules nested in `@media` included) whose selector
 * names one of the element's classes, as `selector {declarations}` text.
 */
export function rulesDeclaredFor(el: Element): string[] {
  const classes = el.className
    .split(/\s+/)
    .filter(Boolean)
    .map(name => `.${name}`);
  const out: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    walk(rules, rule => {
      if (!(rule instanceof CSSStyleRule)) {
        return;
      }
      const selector = rule.selectorText;
      if (classes.some(cls => selector.startsWith(cls))) {
        out.push(`${selector} {${rule.style.cssText}}`);
      }
    });
  }
  return out;
}

/** The rules on `el` whose selector matches `pseudo` (e.g. `:active`). */
export function rulesWithSelector(el: Element, pseudo: string): string[] {
  return rulesDeclaredFor(el).filter(rule => {
    const selector = rule.slice(0, rule.indexOf('{'));
    return selector.includes(pseudo);
  });
}

/**
 * Does one of the element's own rules paint the pressed overlay token while
 * `pseudo` matches? `pseudo` defaults to `:active`, the arm a mouse press
 * takes.
 */
export function hasPressedArm(el: Element, pseudo = ':active'): boolean {
  return rulesWithSelector(el, pseudo).some(rule =>
    rule.includes(PRESSED_TOKEN),
  );
}

/**
 * Does one of the element's own classes paint the pressed overlay token
 * unconditionally — no pseudo-class, no ancestor scope — because the component
 * applies the class while it holds the press itself (a dragged slider thumb)?
 * StyleX's specificity padding (`:not(#\#)`) is not a condition.
 */
export function declaresPressedOverlay(el: Element): boolean {
  return rulesDeclaredFor(el).some(rule => {
    const selector = rule
      .slice(0, rule.indexOf('{'))
      .replaceAll(':not(#\\#)', '');
    return !selector.includes(':') && rule.includes(PRESSED_TOKEN);
  });
}
