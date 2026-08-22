// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file BottomSheetSafeArea.test.tsx
 * @input Uses vitest, Testing Library, the TypeScript compiler API
 * @output Pins the sheet's viewport anchoring, bottom gutter and height ceiling
 * @position Testing; guards the safe-area geometry of the BottomSheet overlay
 *
 * Two things sit at the bottom edge of a phone screen: the home indicator, and
 * iOS Safari's translucent address bar. They are handled by OPPOSITE means, and
 * the trap is that the obvious fix for the second one breaks it.
 *
 * The address bar needs no CSS of its own. Safari keeps the layout viewport
 * entirely above the bar and, for an overlay that is FLUSH with that viewport's
 * bottom edge, extends the overlay's own surface down behind the bar -- so the
 * sheet is what shows through it. What the sheet has to do is stay flush, in
 * BOTH bar states, and there are two ways to fail that:
 *
 *   - `100lvh` (the whole screen) overshoots the current viewport, and Safari
 *     then stops extending and clips at the viewport instead. Bisected in the
 *     iOS 26 simulator with the dialog height as the only variable: at `100dvh`
 *     the sheet's surface reaches the physical screen bottom (874pt); at
 *     `100lvh` it stops at 776pt and the page shows through.
 *
 *   - `100%` resolves against the initial containing block, which on iOS is the
 *     SMALL viewport and does NOT grow when the address bar retracts. The
 *     non-modal overlay used to be sized this way, so with the bar expanded it
 *     was flush and correct, and the moment the bar went compact it was a bar's
 *     height short -- page visible in the strip below the sheet. Reported from
 *     a physical device against the no-scrim demo; the modal path, already
 *     `100dvh`, was unaffected, which is what made it look like a no-scrim bug.
 *
 * So `height: '100dvh'` on both dialogs is load-bearing, and it looks exactly
 * like the thing you would "fix" to make the sheet taller.
 *
 * The home indicator is the opposite: it DOES overlap the sheet, and needs a
 * real gutter. `env(safe-area-inset-bottom)` reads 0 while the address bar is
 * out -- Safari is already keeping the viewport clear -- and becomes the
 * indicator's height once the bar retracts, which is exactly when the sheet
 * needs the room. So the bare inset is the right measure and a term for the
 * browser chrome would only waste a bar's height.
 *
 * jsdom resolves neither `env()` nor the viewport units, so none of that
 * geometry is observable here. What these tests pin is the CSS the declarations
 * produce, which is worth pinning for its own sake: StyleX's dev-time runtime
 * rewrites `env()` with a fallback into invalid CSS when it sits inside a
 * larger expression -- `calc(env(safe-area-inset-bottom, 0px) + 48px)` injects
 * as `calc(48px + env(0px * , * safe-area-inset-bottom))` -- and folds a
 * `min()` of two literal lengths down to one operand. Holding the two
 * expressions in custom properties avoids both. Inline either back into the
 * rule that uses it and the compiler's output stays correct while every
 * dev-mode build silently drops the declaration.
 */
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {render, screen} from '@testing-library/react';
import ts from 'typescript';
import {beforeEach, afterEach, describe, expect, it, vi} from 'vitest';
import {BottomSheetPanel} from './BottomSheetPanel';

beforeEach(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({
      matches: false,
      media: '',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/** Every CSS rule StyleX has injected for the rendered sheet, as text. */
function sheetRules(): string[] {
  const classes = Array.from(screen.getByTestId('sheet').classList);
  const rules: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    let cssRules: CSSRuleList;
    try {
      cssRules = sheet.cssRules;
    } catch {
      continue;
    }
    for (const rule of Array.from(cssRules)) {
      if (classes.some(cls => rule.cssText.includes(`.${cls}`))) {
        rules.push(rule.cssText);
      }
    }
  }
  return rules;
}

/** The declared value of one property on the sheet, with spacing normalized. */
function declaration(property: string): string {
  const pattern = new RegExp(`[{;]\\s*${property}:\\s*([^;}]+)`);
  for (const rule of sheetRules()) {
    const match = pattern.exec(rule);
    if (match) {
      return match[1].trim().replace(/,\s*/g, ', ');
    }
  }
  throw new Error(`No "${property}" declared on the sheet`);
}

function renderSheet(height: 'capped' | 'hug') {
  render(
    <BottomSheetPanel
      data-testid="sheet"
      state={{kind: 'open', entering: false}}
      height={height}
      onDismiss={() => {}}
      onScrimOpacity={() => {}}>
      Sheet content
    </BottomSheetPanel>,
  );
}

describe('BottomSheet overlay stays flush with the layout viewport', () => {
  // The host renders the dialog, and jsdom gives a <dialog> no layout at all,
  // so this one is read off the style definition (as MobileNav's entry
  // animation tests do). It is the declaration that decides whether Safari
  // extends the sheet behind the address bar or clips it at the viewport.
  const source = readFileSync(join(__dirname, 'BottomSheet.tsx'), 'utf8');

  /** The value of one property inside a named `stylex.create` style. */
  function property(style: string, key: string): string {
    const file = ts.createSourceFile(
      'BottomSheet.tsx',
      source,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );

    let found: ts.ObjectLiteralExpression | undefined;
    const visit = (node: ts.Node) => {
      if (
        ts.isPropertyAssignment(node) &&
        ts.isIdentifier(node.name) &&
        node.name.text === style &&
        ts.isObjectLiteralExpression(node.initializer)
      ) {
        found = node.initializer;
      }
      ts.forEachChild(node, visit);
    };
    visit(file);
    if (!found) {
      throw new Error(`No style named "${style}" in BottomSheet.tsx`);
    }

    const prop = found.properties.find(
      p =>
        ts.isPropertyAssignment(p) &&
        (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) &&
        p.name.text === key,
    );
    if (!prop) {
      throw new Error(`No "${key}" in ${style}`);
    }
    return (prop as ts.PropertyAssignment).initializer.getText();
  }

  it.each(['dialog', 'dialogNonModal'])(
    'sizes the %s to the dynamic viewport, never a percentage or the large one',
    style => {
      // Two ways to get this wrong, and both look reasonable.
      //
      // `100lvh` reads like "cover the whole screen", but it overshoots the
      // current viewport and Safari stops extending -- see the file header.
      //
      // `100%` reads like "fill the dialog's box", but a percentage on a fixed
      // element resolves against the initial containing block, which on iOS is
      // the SMALL viewport and does not grow when the address bar retracts. The
      // non-modal sheet used to do this, so once the bar went compact its
      // overlay was a bar's height short, no longer flush, and the page showed
      // through below it -- while the modal one, already `100dvh`, was fine.
      //
      // `100dvh` is the only spelling that is flush in BOTH bar states.
      expect(property(style, 'height')).toBe("'100dvh'");
    },
  );

  it('pins the sheet to the viewport, not to the dialog it lives in', () => {
    // `absolute` here means "the dialog's bottom edge", which is a computed
    // `100dvh` length -- and that length goes stale on iOS while Safari's
    // address bar animates, leaving the sheet a bar's height off the bottom
    // and the page visible through the bar. `fixed` resolves against the
    // viewport at paint time, so there is no number to go stale.
    expect(property('positioner', 'position')).toBe("'fixed'");
  });
});

describe('BottomSheet bottom gutter', () => {
  it('clears the home indicator, and nothing else', () => {
    renderSheet('capped');

    // The bare inset, deliberately: it is 0 while the address bar is out
    // (Safari holds the viewport above the bar) and the indicator's height
    // once the bar retracts. Adding a `100lvh - 100dvh` term for the chrome
    // would reserve a bar's height of dead space that nothing occupies. The
    // fallback matters as much as the inset: a browser that does not know the
    // keyword would otherwise drop the whole expression.
    expect(declaration('--_sheet-bottom-gutter')).toBe(
      'calc(16px + env(safe-area-inset-bottom, 0px))',
    );
  });

  it('reserves the gutter below the content, above the offscreen overscroll', () => {
    renderSheet('capped');

    expect(declaration('padding-bottom')).toBe(
      'calc(var(--_sheet-bottom-gutter) + 48px)',
    );
  });
});

describe('BottomSheet height budget', () => {
  it.each(['capped', 'hug'] as const)(
    'adds the gutter to the %s budget instead of spending the budget on it',
    height => {
      renderSheet(height);

      // `height` for a fixed budget, `max-height` for a content-hugging sheet;
      // both are the same expression, so both grow by the indicator.
      const declared = declaration(height === 'hug' ? 'max-height' : 'height');
      expect(declared).toContain(
        'calc(var(--_sheet-budget) + var(--_sheet-bottom-gutter))',
      );
      expect(declared).toContain('+ 48px');
    },
  );

  it('measures its ceiling from the same viewport the overlay spans', () => {
    renderSheet('capped');

    // Matches the dialog's `100dvh`, so the taller sheet can never push past
    // the overlay it lives in; the top inset keeps its rounded top edge out
    // from under the status bar or the notch.
    expect(declaration('--_sheet-max-height')).toBe(
      'calc(100dvh - env(safe-area-inset-top, 0px))',
    );
    expect(declaration('height')).toContain('var(--_sheet-max-height)');
    expect(declaration('height')).toContain('min(');
  });
});
