// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file MobileNavEntryAnimation.test.tsx
 * @input Uses vitest, @testing-library/react, the TypeScript compiler API
 * @output Regression tests keeping the drawer's slide-in and scrim fade-in
 * @position Testing; guards the open path of MobileNav.tsx
 *
 * The drawer used to open with no animation at all while closing smoothly.
 *
 * The dialog is `display: none` until `isOpen`, so nothing inside it is
 * rendered while closed. React commits the open `display` and the open
 * `transform` in the same pass, which means the first frame the drawer is ever
 * rendered in already holds the open transform: a transition has no earlier
 * value to run from and the drawer simply appears. Closing looked fine because
 * both values exist by then — `display` stays in the transition with
 * `allow-discrete`, so the element is still rendered as the transform animates
 * out.
 *
 * `@starting-style` supplies that before-change style — the off-screen
 * transform for the drawer, transparent for the `::backdrop`.
 *
 * That alone is NOT enough, and the second half is the part that is easy to
 * undo by accident. The dialog used `overflow: hidden`, which makes it a
 * SCROLL CONTAINER. A scroll container in the top layer whose subtree holds
 * another scroller — here the drawer's own content area — does not paint a
 * `@starting-style` entry transition for its descendants in Chromium: the
 * transition ticks in the CSSOM (`getComputedStyle` interpolates perfectly)
 * while every painted frame shows the end value. Measuring the CSSOM says
 * "animating"; the screen says "snapped". `overflow: clip` clips the
 * off-screen drawer exactly as `hidden` did without creating a scroll
 * container, and the slide-in paints.
 *
 * Reproduced minimally: dialog `overflow: hidden` + a scrolling child inside
 * the drawer snaps; either one alone animates.
 *
 * Note on scope: jsdom has no top layer, no transitions, no `@starting-style`
 * evaluation and no compositor, so none of this is observable here. These
 * tests pin the three declarations the behaviour rests on. Verified in
 * Chromium by screencasting painted frames (not computed style) at both edges,
 * LTR and RTL: open and close each paint ~60-100 distinct intermediate
 * positions, and reduced motion collapses to a 10ms transition.
 */

import {describe, it, expect, beforeAll} from 'vitest';
import {render, screen} from '@testing-library/react';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import ts from 'typescript';
import {MobileNav} from './MobileNav';

// jsdom doesn't implement showModal/close on <dialog>, so we mock them
beforeAll(() => {
  HTMLDialogElement.prototype.showModal =
    HTMLDialogElement.prototype.showModal ||
    function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    };
  HTMLDialogElement.prototype.close =
    HTMLDialogElement.prototype.close ||
    function (this: HTMLDialogElement) {
      this.removeAttribute('open');
    };
});

/** Every CSS rule StyleX has injected into the document, as text. */
function injectedRules(): string[] {
  const rules: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    let cssRules: CSSRuleList;
    try {
      cssRules = sheet.cssRules;
    } catch {
      continue;
    }
    for (const rule of Array.from(cssRules)) {
      rules.push(rule.cssText);
    }
  }
  return rules;
}

describe('MobileNav scrim fades in', () => {
  it('gives the ::backdrop a transparent starting style', () => {
    render(
      <MobileNav isOpen onOpenChange={() => {}} data-testid="mobile-nav">
        <span>Nav content</span>
      </MobileNav>,
    );

    const classes = Array.from(screen.getByTestId('mobile-nav').classList);
    // Without this the scrim is opaque in the frame the dialog enters the top
    // layer, so it has nothing to fade from and snaps in behind the drawer.
    const startingStyleForThisDialog = injectedRules().filter(
      rule =>
        rule.startsWith('@starting-style') &&
        rule.includes('::backdrop') &&
        classes.some(cls => rule.includes(`.${cls}`)),
    );

    expect(startingStyleForThisDialog).toHaveLength(1);
    expect(startingStyleForThisDialog[0]).toMatch(/opacity:\s*0/);
  });
});

// =============================================================================
// Drawer slide-in — asserted on the style definition
// =============================================================================

const SOURCE = readFileSync(join(__dirname, 'MobileNav.tsx'), 'utf8');

/**
 * The object literal a `styles.<name>` key is defined with, e.g. the value of
 * `drawerStartOpen` inside the file's `stylex.create({...})` call.
 */
function styleDefinition(name: string): ts.ObjectLiteralExpression {
  const file = ts.createSourceFile(
    'MobileNav.tsx',
    SOURCE,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );

  let found: ts.ObjectLiteralExpression | undefined;
  const visit = (node: ts.Node) => {
    if (
      ts.isPropertyAssignment(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === name &&
      ts.isObjectLiteralExpression(node.initializer)
    ) {
      found = node.initializer;
    }
    ts.forEachChild(node, visit);
  };
  visit(file);

  if (!found) {
    throw new Error(`No style named "${name}" in MobileNav.tsx`);
  }
  return found;
}

/** The value of one property of a style definition, as source text. */
function property(style: ts.ObjectLiteralExpression, key: string): string {
  const prop = style.properties.find(
    p =>
      ts.isPropertyAssignment(p) &&
      (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) &&
      p.name.text === key,
  );

  if (!prop) {
    throw new Error(`No "${key}" in ${style.getText().slice(0, 40)}…`);
  }
  return (prop as ts.PropertyAssignment).initializer.getText();
}

describe('MobileNav dialog does not become a scroll container', () => {
  it('clips the off-screen drawer with `clip`, not `hidden`', () => {
    // This is the half of the fix with no visible declaration of its own
    // purpose: `hidden` looks like a pure clipping choice and clips exactly as
    // well, so it is an easy "harmless tidy-up" to make. It is not harmless —
    // it makes the dialog a scroll container, and the entry animation then
    // ticks in the CSSOM without ever painting. See the file header.
    expect(property(styleDefinition('dialog'), 'overflow')).toBe("'clip'");
  });
});

describe.each([
  {
    name: 'drawerStartOpen',
    offscreen: 'translateX(-100%)',
    offscreenRtl: 'translateX(100%)',
  },
  {
    name: 'drawerEndOpen',
    offscreen: 'translateX(100%)',
    offscreenRtl: 'translateX(-100%)',
  },
])('MobileNav drawer slides in ($name)', ({name, offscreen, offscreenRtl}) => {
  it('opens to the on-screen transform', () => {
    expect(property(styleDefinition(name), 'transform')).toContain(
      'translateX(0)',
    );
  });

  it('starts off-screen so the open transform has something to run from', () => {
    const transform = property(styleDefinition(name), 'transform');

    // The whole point: the first rendered frame needs the closed transform.
    // Drop this and the drawer is simply there, fully open, on frame one —
    // while the close still animates, which is what made the bug look like a
    // missing entry animation rather than a missing starting style.
    expect(transform).toContain('@starting-style');
    expect(transform).toContain(offscreen);
    // Mirrored, like the closed styles it has to match: sliding in from the
    // wrong edge in RTL is as broken as not sliding at all.
    expect(transform).toContain(offscreenRtl);
  });

  it('starts from the same edge the closed style parks it at', () => {
    const closed = property(
      styleDefinition(name.replace('Open', '')),
      'transform',
    );

    expect(closed).toContain(offscreen);
    expect(closed).toContain(offscreenRtl);
  });
});
