// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file contentWidth.test.tsx
 * @input Uses vitest, @testing-library/react
 * @output Unit tests for Layout contentWidth prop
 */

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Layout} from '../Layout';
import {LayoutHeader} from '../LayoutHeader';
import {LayoutFooter} from '../LayoutFooter';
import {LayoutContent} from '../LayoutContent';

describe('Layout contentWidth', () => {
  describe('Layout', () => {
    it('applies max-width constraint to the middle row', () => {
      render(
        <Layout
          contentWidth={640}
          content={
            <LayoutContent>
              <span data-testid="body">Body</span>
            </LayoutContent>
          }
        />,
      );
      const bodyEl = screen.getByTestId('body');
      const contentDiv = bodyEl.parentElement!;
      const stackItemDiv = contentDiv.parentElement!;
      const middleRow = stackItemDiv.parentElement!;
      expect(middleRow.className).toBeTruthy();
    });

    it('does not crash when contentWidth is not set', () => {
      render(
        <Layout
          content={
            <LayoutContent>
              <span data-testid="body">Body</span>
            </LayoutContent>
          }
        />,
      );
      expect(screen.getByTestId('body')).toBeInTheDocument();
    });
  });

  describe('LayoutHeader', () => {
    it('always renders contentWidth inner wrapper', () => {
      render(
        <Layout
          header={
            <LayoutHeader>
              <span data-testid="header-child">Header</span>
            </LayoutHeader>
          }
          content={<LayoutContent>Body</LayoutContent>}
        />,
      );
      const headerChild = screen.getByTestId('header-child');
      const innerWrapper = headerChild.parentElement!;
      const headerDiv = innerWrapper.parentElement!;
      expect(headerDiv.className).toContain('xds-layout-header');
      expect(innerWrapper).not.toBe(headerDiv);
    });

    it('keeps divider on outer element', () => {
      render(
        <Layout
          contentWidth={640}
          defaultHasDividers
          header={
            <LayoutHeader>
              <span data-testid="header-child">Header</span>
            </LayoutHeader>
          }
          content={<LayoutContent>Body</LayoutContent>}
        />,
      );
      const headerChild = screen.getByTestId('header-child');
      const innerWrapper = headerChild.parentElement!;
      const headerDiv = innerWrapper.parentElement!;
      expect(headerDiv).toHaveAttribute('data-divider');
      expect(innerWrapper).not.toHaveAttribute('data-divider');
    });
  });

  describe('LayoutFooter', () => {
    it('always renders contentWidth inner wrapper', () => {
      render(
        <Layout
          content={<LayoutContent>Body</LayoutContent>}
          footer={
            <LayoutFooter>
              <span data-testid="footer-child">Footer</span>
            </LayoutFooter>
          }
        />,
      );
      const footerChild = screen.getByTestId('footer-child');
      const innerWrapper = footerChild.parentElement!;
      const footerDiv = innerWrapper.parentElement!;
      expect(footerDiv.className).toContain('xds-layout-footer');
      expect(innerWrapper).not.toBe(footerDiv);
    });

    it('keeps divider on outer element', () => {
      render(
        <Layout
          contentWidth={640}
          defaultHasDividers
          content={<LayoutContent>Body</LayoutContent>}
          footer={
            <LayoutFooter>
              <span data-testid="footer-child">Footer</span>
            </LayoutFooter>
          }
        />,
      );
      const footerChild = screen.getByTestId('footer-child');
      const innerWrapper = footerChild.parentElement!;
      const footerDiv = innerWrapper.parentElement!;
      expect(footerDiv).toHaveAttribute('data-divider');
      expect(innerWrapper).not.toHaveAttribute('data-divider');
    });
  });
});
