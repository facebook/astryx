// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file shellWidth.test.tsx
 * @input Uses vitest, @testing-library/react
 * @output Unit tests for Layout shellWidth prop
 */

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Layout} from '../Layout';
import {LayoutHeader} from '../LayoutHeader';
import {LayoutFooter} from '../LayoutFooter';
import {LayoutContent} from '../LayoutContent';

/**
 * Walks up from the content body element to the inner shell wrapper — the
 * common parent of header, middle row, and footer (the element shellWidth
 * attaches to). Structure: body -> LayoutContent -> stackItem -> middle row
 * -> inner wrapper.
 */
function getInnerWrapper(bodyEl: HTMLElement): HTMLElement {
  const contentDiv = bodyEl.parentElement!;
  const stackItemDiv = contentDiv.parentElement!;
  const middleRow = stackItemDiv.parentElement!;
  return middleRow.parentElement!;
}

describe('Layout shellWidth', () => {
  it('applies the width constraint to the inner shell wrapper', () => {
    render(
      <Layout
        shellWidth={640}
        header={
          <LayoutHeader>
            <span data-testid="header-child">Header</span>
          </LayoutHeader>
        }
        content={
          <LayoutContent>
            <span data-testid="body">Body</span>
          </LayoutContent>
        }
        footer={
          <LayoutFooter>
            <span data-testid="footer-child">Footer</span>
          </LayoutFooter>
        }
      />,
    );
    const innerWrapper = getInnerWrapper(screen.getByTestId('body'));
    // The inner wrapper is the common parent of header, middle, and footer,
    // so the cap applies to the whole shell including dividers.
    expect(innerWrapper).toContainElement(screen.getByTestId('header-child'));
    expect(innerWrapper).toContainElement(screen.getByTestId('footer-child'));
    // Its parent is the Layout root (which owns the negative-margin escape).
    expect(innerWrapper.parentElement!.className).toContain('astryx-layout');
    // Dynamic styles surface the value through the inline style attribute.
    expect(innerWrapper.getAttribute('style') ?? '').toContain('640px');
    expect(innerWrapper.className).toBeTruthy();
  });

  it('is a no-op when not set', () => {
    const {unmount} = render(
      <Layout
        content={
          <LayoutContent>
            <span data-testid="body">Body</span>
          </LayoutContent>
        }
      />,
    );
    const plainWrapper = getInnerWrapper(screen.getByTestId('body'));
    const plainClassName = plainWrapper.className;
    expect(plainWrapper.getAttribute('style') ?? '').not.toContain('640px');
    unmount();

    render(
      <Layout
        shellWidth={640}
        content={
          <LayoutContent>
            <span data-testid="body">Body</span>
          </LayoutContent>
        }
      />,
    );
    const cappedWrapper = getInnerWrapper(screen.getByTestId('body'));
    // The unset render keeps its base classes; setting shellWidth only adds.
    for (const cls of plainClassName.split(/\s+/).filter(Boolean)) {
      expect(cappedWrapper.className).toContain(cls);
    }
    expect(cappedWrapper.className).not.toBe(plainClassName);
  });

  it('composes with contentWidth (both applied)', () => {
    render(
      <Layout
        shellWidth={960}
        contentWidth={640}
        header={
          <LayoutHeader>
            <span data-testid="header-child">Header</span>
          </LayoutHeader>
        }
        content={
          <LayoutContent>
            <span data-testid="body">Body</span>
          </LayoutContent>
        }
      />,
    );
    const bodyEl = screen.getByTestId('body');
    const innerWrapper = getInnerWrapper(bodyEl);
    // shellWidth caps the whole shell...
    expect(innerWrapper.getAttribute('style') ?? '').toContain('960px');
    // ...while contentWidth still constrains the middle row and sets the
    // slot-level content width variable.
    const middleRow = bodyEl.parentElement!.parentElement!.parentElement!;
    expect(middleRow.getAttribute('style') ?? '').toContain('640px');
    expect(innerWrapper.getAttribute('style') ?? '').toContain('640px');
  });

  it('accepts number values as pixels', () => {
    render(
      <Layout
        shellWidth={1440}
        content={
          <LayoutContent>
            <span data-testid="body">Body</span>
          </LayoutContent>
        }
      />,
    );
    const innerWrapper = getInnerWrapper(screen.getByTestId('body'));
    expect(innerWrapper.getAttribute('style') ?? '').toContain('1440px');
  });

  it('accepts string values as-is', () => {
    render(
      <Layout
        shellWidth="90rem"
        content={
          <LayoutContent>
            <span data-testid="body">Body</span>
          </LayoutContent>
        }
      />,
    );
    const innerWrapper = getInnerWrapper(screen.getByTestId('body'));
    expect(innerWrapper.getAttribute('style') ?? '').toContain('90rem');
  });

  it('works combined with height="auto" and padding={0}', () => {
    render(
      <Layout
        shellWidth={640}
        height="auto"
        padding={0}
        header={
          <LayoutHeader>
            <span data-testid="header-child">Header</span>
          </LayoutHeader>
        }
        content={
          <LayoutContent>
            <span data-testid="body">Body</span>
          </LayoutContent>
        }
      />,
    );
    const innerWrapper = getInnerWrapper(screen.getByTestId('body'));
    expect(screen.getByTestId('body')).toBeInTheDocument();
    expect(screen.getByTestId('header-child')).toBeInTheDocument();
    expect(innerWrapper.getAttribute('style') ?? '').toContain('640px');
  });
});
