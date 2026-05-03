/**
 * @file edgeCompensation.test.tsx
 * @input Uses vitest, @testing-library/react
 * @output Unit tests for container-driven edge compensation pattern
 * @position Testing; validates data-xds-edge-comp attribute on components
 *   and container-driven compensation via :has() selectors
 */

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {XDSButton} from '../../Button/XDSButton';
import {XDSBanner} from '../../Banner/XDSBanner';
import {XDSToolbar} from '../../Toolbar/XDSToolbar';
import {XDSTab} from '../../TabList/XDSTab';
import {XDSTabList} from '../../TabList/XDSTabList';
import {EDGE_COMP_ATTR} from '../edgeCompensation.stylex';

describe('Edge Compensation', () => {
  describe('Button data attribute', () => {
    it('applies edge comp attribute to ghost button', () => {
      render(<XDSButton label="Action" variant="ghost" />);
      const button = screen.getByRole('button', {name: 'Action'});
      expect(button).toHaveAttribute(EDGE_COMP_ATTR);
    });

    it('applies edge comp attribute to ghost icon-only button', () => {
      render(
        <XDSButton
          label="Settings"
          variant="ghost"
          icon={<span>gear</span>}
          isIconOnly
        />,
      );
      const button = screen.getByRole('button', {name: 'Settings'});
      expect(button).toHaveAttribute(EDGE_COMP_ATTR);
    });

    it('does not apply edge comp attribute to primary variant', () => {
      render(<XDSButton label="Primary" variant="primary" />);
      const button = screen.getByRole('button', {name: 'Primary'});
      expect(button).not.toHaveAttribute(EDGE_COMP_ATTR);
    });

    it('does not apply edge comp attribute to secondary variant', () => {
      render(<XDSButton label="Secondary" variant="secondary" />);
      const button = screen.getByRole('button', {name: 'Secondary'});
      expect(button).not.toHaveAttribute(EDGE_COMP_ATTR);
    });

    it('does not apply edge comp attribute to danger variant', () => {
      render(<XDSButton label="Delete" variant="danger" />);
      const button = screen.getByRole('button', {name: 'Delete'});
      expect(button).not.toHaveAttribute(EDGE_COMP_ATTR);
    });
  });

  describe('Tab data attribute', () => {
    it('applies edge comp attribute to tab', () => {
      render(
        <XDSTabList label="Tabs">
          <XDSTab label="Tab 1" />
        </XDSTabList>,
      );
      const tab = screen.getByRole('button', {name: 'Tab 1'});
      expect(tab).toHaveAttribute(EDGE_COMP_ATTR);
    });

    it('applies edge comp attribute to TabList wrapper', () => {
      render(
        <XDSTabList label="Tabs">
          <XDSTab label="Tab 1" />
        </XDSTabList>,
      );
      const nav = screen.getByRole('navigation', {name: 'Tabs'});
      expect(nav).toHaveAttribute(EDGE_COMP_ATTR);
    });
  });

  describe('Toolbar container compensation', () => {
    it('renders ghost buttons inside toolbar slots', () => {
      render(
        <XDSToolbar
          label="Actions"
          startContent={<XDSButton label="Cut" variant="ghost" />}
          endContent={<XDSButton label="Paste" variant="ghost" />}
        />,
      );
      expect(screen.getByRole('button', {name: 'Cut'})).toHaveAttribute(
        EDGE_COMP_ATTR,
      );
      expect(screen.getByRole('button', {name: 'Paste'})).toHaveAttribute(
        EDGE_COMP_ATTR,
      );
    });

    it('does not add edge comp attribute to non-ghost buttons in toolbar', () => {
      render(
        <XDSToolbar
          label="Actions"
          endContent={<XDSButton label="Save" variant="primary" />}
        />,
      );
      expect(screen.getByRole('button', {name: 'Save'})).not.toHaveAttribute(
        EDGE_COMP_ATTR,
      );
    });
  });

  describe('Banner container compensation', () => {
    it('renders dismissable banner with ghost dismiss button', () => {
      render(<XDSBanner status="info" title="Test" isDismissable />);
      const dismissButton = screen.getByRole('button', {name: 'Dismiss'});
      expect(dismissButton).toHaveAttribute(EDGE_COMP_ATTR);
    });
  });
});
