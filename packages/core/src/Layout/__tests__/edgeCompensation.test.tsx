// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file edgeCompensation.test.tsx
 * @input Uses vitest, @testing-library/react
 * @output Unit tests for container-driven edge compensation pattern
 * @position Testing; validates data-astryx-edge-comp attribute on components
 *   and container-driven compensation via :has() selectors
 */

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Button} from '../../Button/Button';
import {Banner} from '../../Banner/Banner';
import {Toolbar} from '../../Toolbar/Toolbar';
import {Tab} from '../../TabList/Tab';
import {TabList} from '../../TabList/TabList';
import {EDGE_COMP_ATTR} from '../edgeCompensation.stylex';

describe('Edge Compensation', () => {
  describe('Button data attribute', () => {
    it('applies edge comp attribute to ghost button', () => {
      render(<Button label="Action" variant="ghost" />);
      const button = screen.getByRole('button', {name: 'Action'});
      expect(button).toHaveAttribute(EDGE_COMP_ATTR);
    });

    it('applies edge comp attribute to ghost icon-only button', () => {
      render(
        <Button
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
      render(<Button label="Primary" variant="primary" />);
      const button = screen.getByRole('button', {name: 'Primary'});
      expect(button).not.toHaveAttribute(EDGE_COMP_ATTR);
    });

    it('does not apply edge comp attribute to secondary variant', () => {
      render(<Button label="Secondary" variant="secondary" />);
      const button = screen.getByRole('button', {name: 'Secondary'});
      expect(button).not.toHaveAttribute(EDGE_COMP_ATTR);
    });

    it('does not apply edge comp attribute to danger variant', () => {
      render(<Button label="Delete" variant="destructive" />);
      const button = screen.getByRole('button', {name: 'Delete'});
      expect(button).not.toHaveAttribute(EDGE_COMP_ATTR);
    });
  });

  describe('Tab data attribute', () => {
    it('applies edge comp attribute to tab', () => {
      render(
        <TabList value="" onChange={() => {}} aria-label="Tabs">
          <Tab value="tab1" label="Tab 1" />
        </TabList>,
      );
      const tab = screen.getByRole('button', {name: 'Tab 1'});
      expect(tab).toHaveAttribute(EDGE_COMP_ATTR);
    });

    it('applies edge comp attribute to TabList wrapper', () => {
      render(
        <TabList value="" onChange={() => {}} aria-label="Tabs">
          <Tab value="tab1" label="Tab 1" />
        </TabList>,
      );
      const nav = screen.getByRole('navigation', {name: 'Tabs'});
      expect(nav).toHaveAttribute(EDGE_COMP_ATTR);
    });
  });

  describe('Toolbar container compensation', () => {
    it('renders ghost buttons inside toolbar slots', () => {
      render(
        <Toolbar
          label="Actions"
          startContent={<Button label="Cut" variant="ghost" />}
          endContent={<Button label="Paste" variant="ghost" />}
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
        <Toolbar
          label="Actions"
          endContent={<Button label="Save" variant="primary" />}
        />,
      );
      expect(screen.getByRole('button', {name: 'Save'})).not.toHaveAttribute(
        EDGE_COMP_ATTR,
      );
    });
  });

  describe('Banner container compensation', () => {
    it('renders dismissable banner with ghost dismiss button', () => {
      render(<Banner status="info" title="Test" isDismissable />);
      const dismissButton = screen.getByRole('button', {name: 'Dismiss'});
      expect(dismissButton).toHaveAttribute(EDGE_COMP_ATTR);
    });
  });
});
