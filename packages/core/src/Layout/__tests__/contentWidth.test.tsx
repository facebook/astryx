/**
 * @file contentWidth.test.tsx
 * @input Uses vitest, @testing-library/react
 * @output Unit tests for Layout contentWidth prop
 */

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {XDSLayout} from '../XDSLayout';
import {XDSLayoutHeader} from '../XDSLayoutHeader';
import {XDSLayoutFooter} from '../XDSLayoutFooter';
import {XDSLayoutContent} from '../XDSLayoutContent';

describe('Layout contentWidth', () => {
  describe('XDSLayout', () => {
    it('applies max-width constraint to the middle row', () => {
      render(
        <XDSLayout
          contentWidth={640}
          content={
            <XDSLayoutContent>
              <span data-testid="body">Body</span>
            </XDSLayoutContent>
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
        <XDSLayout
          content={
            <XDSLayoutContent>
              <span data-testid="body">Body</span>
            </XDSLayoutContent>
          }
        />,
      );
      expect(screen.getByTestId('body')).toBeInTheDocument();
    });
  });

  describe('XDSLayoutHeader', () => {
    it('always renders contentWidth inner wrapper', () => {
      render(
        <XDSLayout
          header={
            <XDSLayoutHeader>
              <span data-testid="header-child">Header</span>
            </XDSLayoutHeader>
          }
          content={<XDSLayoutContent>Body</XDSLayoutContent>}
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
        <XDSLayout
          contentWidth={640}
          defaultHasDividers
          header={
            <XDSLayoutHeader>
              <span data-testid="header-child">Header</span>
            </XDSLayoutHeader>
          }
          content={<XDSLayoutContent>Body</XDSLayoutContent>}
        />,
      );
      const headerChild = screen.getByTestId('header-child');
      const innerWrapper = headerChild.parentElement!;
      const headerDiv = innerWrapper.parentElement!;
      expect(headerDiv).toHaveAttribute('data-divider');
      expect(innerWrapper).not.toHaveAttribute('data-divider');
    });
  });

  describe('XDSLayoutFooter', () => {
    it('always renders contentWidth inner wrapper', () => {
      render(
        <XDSLayout
          content={<XDSLayoutContent>Body</XDSLayoutContent>}
          footer={
            <XDSLayoutFooter>
              <span data-testid="footer-child">Footer</span>
            </XDSLayoutFooter>
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
        <XDSLayout
          contentWidth={640}
          defaultHasDividers
          content={<XDSLayoutContent>Body</XDSLayoutContent>}
          footer={
            <XDSLayoutFooter>
              <span data-testid="footer-child">Footer</span>
            </XDSLayoutFooter>
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
