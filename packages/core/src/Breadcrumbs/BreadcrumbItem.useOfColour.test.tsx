// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file WCAG 2.1 A 1.4.1 (Use of Color) for BreadcrumbItem.
 *
 * The current page has to be tellable from the navigable crumbs without
 * relying on colour. `aria-current="page"` covers assistive tech; these tests
 * cover the visual channel, which is what 1.4.1 is about.
 *
 * The `supporting` variant is the sharp case: it paints links and the current
 * crumb with the SAME token, so before this guard colour conveyed nothing at
 * all there and there was no other cue to fall back on.
 *
 * @input Rendered Breadcrumbs in both variants.
 * @output Fails when the current crumb is distinguished by colour alone.
 * @position Colocated with Breadcrumbs.test.tsx, which covers behaviour.
 */

import {describe, it, expect} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import {Breadcrumbs} from './Breadcrumbs';
import {BreadcrumbItem} from './BreadcrumbItem';

/**
 * Collapse the values that render identically to `null`.
 *
 * jsdom reports an unset property as `''` and an unresolved `inherit` as
 * `'inherit'`. Those are different strings but the same pixels, so comparing
 * raw computed values would report a difference where a sighted user sees
 * none — the exact false pass this file exists to prevent.
 */
function cue(value: string) {
  return value === '' || value === 'inherit' || value === 'none' ? null : value;
}

/** The declarations a sighted user can use to tell two crumbs apart. */
function visualStyle(el: Element) {
  const s = window.getComputedStyle(el);
  return {
    color: cue(s.color),
    fontWeight: cue(s.fontWeight),
    textDecorationLine: cue(s.textDecorationLine),
    fontStyle: cue(s.fontStyle),
  };
}

/**
 * True when the two crumbs differ by a rendered cue that is not colour — i.e.
 * one carries a non-colour cue the other does not, or they carry different
 * ones.
 */
function differsBeyondColour(a: Element, b: Element) {
  const x = visualStyle(a);
  const y = visualStyle(b);
  return (
    x.fontWeight !== y.fontWeight ||
    x.textDecorationLine !== y.textDecorationLine ||
    x.fontStyle !== y.fontStyle
  );
}

describe('BreadcrumbItem — WCAG 1.4.1 use of colour', () => {
  it('marks the current page with more than colour in the default variant', () => {
    render(
      <Breadcrumbs>
        <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
        <BreadcrumbItem isCurrent>Detail</BreadcrumbItem>
      </Breadcrumbs>,
    );

    const link = screen.getByRole('link', {name: 'Projects'});
    const current = screen.getByText('Detail');

    expect(current).toHaveAttribute('aria-current', 'page');
    expect(differsBeyondColour(current, link)).toBe(true);
  });

  it('marks the current page with more than colour in the supporting variant', () => {
    render(
      <Breadcrumbs variant="supporting">
        <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
        <BreadcrumbItem isCurrent>Detail</BreadcrumbItem>
      </Breadcrumbs>,
    );

    const link = screen.getByRole('link', {name: 'Projects'});
    const current = screen.getByText('Detail');

    // This variant paints both with the same colour token, so colour carries
    // no information here at all — the non-colour cue is the only cue.
    expect(visualStyle(current).color).toBe(visualStyle(link).color);
    expect(differsBeyondColour(current, link)).toBe(true);
  });

  it('resolves the current crumb to a real weight, not "inherit"', () => {
    render(
      <Breadcrumbs>
        <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
        <BreadcrumbItem isCurrent>Detail</BreadcrumbItem>
      </Breadcrumbs>,
    );

    // `inherit` and unset both collapse to null: neither renders as a cue.
    expect(visualStyle(screen.getByText('Detail')).fontWeight).not.toBeNull();
  });

  it('applies the cue to an auto-detected current crumb', async () => {
    render(
      <Breadcrumbs>
        <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
        <BreadcrumbItem>Detail</BreadcrumbItem>
      </Breadcrumbs>,
    );

    const current = screen.getByText('Detail');
    await waitFor(() =>
      expect(current).toHaveAttribute('aria-current', 'page'),
    );
    expect(
      differsBeyondColour(
        current,
        screen.getByRole('link', {name: 'Projects'}),
      ),
    ).toBe(true);
  });

  it('applies the cue to a current crumb that is a menu trigger', () => {
    render(
      <Breadcrumbs>
        <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
        <BreadcrumbItem isCurrent menu={[{label: 'Alpha'}]}>
          Detail
        </BreadcrumbItem>
      </Breadcrumbs>,
    );

    const trigger = screen.getByRole('button', {name: /Detail/});
    expect(trigger).toHaveAttribute('aria-current', 'page');
    expect(
      differsBeyondColour(
        trigger,
        screen.getByRole('link', {name: 'Projects'}),
      ),
    ).toBe(true);
  });

  it('leaves navigable crumbs alone', () => {
    // The cue belongs to the current page; links keep their own treatment so
    // a breadcrumb trail does not turn into a row of identical bold text.
    render(
      <Breadcrumbs>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
        <BreadcrumbItem isCurrent>Detail</BreadcrumbItem>
      </Breadcrumbs>,
    );

    const home = screen.getByRole('link', {name: 'Home'});
    const projects = screen.getByRole('link', {name: 'Projects'});
    expect(visualStyle(home)).toEqual(visualStyle(projects));
    expect(differsBeyondColour(home, projects)).toBe(false);
  });
});
