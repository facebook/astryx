// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file MobileNavScrollbarGutter.test.tsx
 * @input Uses vitest, @testing-library/react, MobileNav, a stubbed viewport
 * @output Unit tests for the scrollbar gutter MobileNav reserves while open
 * @position Testing; guards MobileNav.tsx against the open-drawer page shift
 *
 * MobileNav clips the document to lock background scroll, which hides a
 * classic scrollbar and widens the layout viewport by its width — the page
 * behind the drawer jumps sideways. The clip has to be paired with a
 * reservation of that width.
 *
 * SYNC: When MobileNav.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, beforeAll, afterEach} from 'vitest';
import {render, cleanup} from '@testing-library/react';
import {MobileNav} from './MobileNav';

beforeAll(() => {
  // jsdom doesn't implement showModal/close on <dialog>
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

/** jsdom does no layout, so both halves of the measurement are stubbed. */
function stubViewport(innerWidth: number, clientWidth: number) {
  Object.defineProperty(window, 'innerWidth', {
    value: innerWidth,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(document.documentElement, 'clientWidth', {
    value: clientWidth,
    configurable: true,
  });
}

const gutterVar = () =>
  document.documentElement.style.getPropertyValue('--astryx-scrollbar-gutter');

describe('MobileNav scrollbar gutter', () => {
  afterEach(() => {
    cleanup();
    document.documentElement.style.cssText = '';
    // @ts-expect-error -- drop the viewport stub so jsdom's own value comes back
    delete document.documentElement.clientWidth;
  });

  it('reserves the hidden scrollbar width while the drawer is open', () => {
    stubViewport(1024, 1009);

    const view = render(
      <MobileNav isOpen={true} onOpenChange={() => {}}>
        <span>Nav content</span>
      </MobileNav>,
    );

    expect(document.documentElement.style.overflow).toBe('clip');
    expect(document.documentElement.style.paddingRight).toBe('15px');
    expect(gutterVar()).toBe('15px');

    view.unmount();

    expect(document.documentElement.style.overflow).toBe('');
    expect(document.documentElement.style.paddingRight).toBe('');
    expect(gutterVar()).toBe('');
  });

  it('gives the reserved width back when the drawer closes', () => {
    stubViewport(1024, 1009);

    const view = render(
      <MobileNav isOpen={true} onOpenChange={() => {}}>
        <span>Nav content</span>
      </MobileNav>,
    );

    expect(document.documentElement.style.paddingRight).toBe('15px');

    view.rerender(
      <MobileNav isOpen={false} onOpenChange={() => {}}>
        <span>Nav content</span>
      </MobileNav>,
    );

    expect(document.documentElement.style.paddingRight).toBe('');
    expect(gutterVar()).toBe('');
  });

  it('reserves nothing when the scrollbar is an overlay one', () => {
    stubViewport(1024, 1024);

    render(
      <MobileNav isOpen={true} onOpenChange={() => {}}>
        <span>Nav content</span>
      </MobileNav>,
    );

    expect(document.documentElement.style.overflow).toBe('clip');
    expect(document.documentElement.style.paddingRight).toBe('');
    expect(gutterVar()).toBe('');
  });
});
