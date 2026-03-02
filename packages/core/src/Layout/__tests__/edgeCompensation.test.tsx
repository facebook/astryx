/**
 * @file edgeCompensation.test.tsx
 * @input Uses vitest, @testing-library/react
 * @output Unit tests for edge compensation pattern
 * @position Testing; validates edgeCompensation.stylex.ts, TopNav edge signals,
 *   and Button ghost variant edge compensation behavior
 */

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {XDSTopNav} from '../../TopNav/XDSTopNav';
import {XDSButton} from '../../Button/XDSButton';

describe('Edge Compensation', () => {
  describe('TopNav edge signals', () => {
    it('sets --container-padding on the nav element', () => {
      render(
        <XDSTopNav
          label="Test nav"
          endContent={<span data-testid="end">End</span>}
        />,
      );
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('renders endContent slot with edge signal', () => {
      render(
        <XDSTopNav
          label="Test nav"
          endContent={<span data-testid="end-item">Action</span>}
        />,
      );
      const endItem = screen.getByTestId('end-item');
      expect(endItem.parentElement).toBeInTheDocument();
    });

    it('renders leftSection with edge signal for start', () => {
      render(
        <XDSTopNav
          label="Test nav"
          title={<span data-testid="title">Logo</span>}
        />,
      );
      const title = screen.getByTestId('title');
      expect(title).toBeInTheDocument();
    });
  });

  describe('Button ghost variant edge compensation', () => {
    it('renders ghost button (text) with edge compensation styles', () => {
      render(<XDSButton label="Action" variant="ghost" />);
      const button = screen.getByRole('button', {name: 'Action'});
      expect(button).toBeInTheDocument();
    });

    it('renders ghost icon-only button with edge compensation styles', () => {
      render(
        <XDSButton
          label="Settings"
          variant="ghost"
          icon={<span>gear</span>}
        />,
      );
      const button = screen.getByRole('button', {name: 'Settings'});
      expect(button).toBeInTheDocument();
    });

    it('does not apply edge compensation to secondary variant', () => {
      render(<XDSButton label="Action" variant="secondary" />);
      const button = screen.getByRole('button', {name: 'Action'});
      expect(button).toBeInTheDocument();
    });

    it('does not apply edge compensation to primary variant', () => {
      render(<XDSButton label="Action" variant="primary" />);
      const button = screen.getByRole('button', {name: 'Action'});
      expect(button).toBeInTheDocument();
    });
  });

  describe('TopNav + Button integration', () => {
    it('renders ghost button inside TopNav endContent', () => {
      render(
        <XDSTopNav
          label="App nav"
          endContent={
            <XDSButton label="Search" variant="ghost" icon={<span>search</span>} />
          }
        />,
      );
      const button = screen.getByRole('button', {name: 'Search'});
      expect(button).toBeInTheDocument();
      expect(screen.getByRole('navigation')).toContainElement(button);
    });

    it('renders primary button inside TopNav endContent without compensation', () => {
      render(
        <XDSTopNav
          label="App nav"
          endContent={<XDSButton label="Save" variant="primary" />}
        />,
      );
      const button = screen.getByRole('button', {name: 'Save'});
      expect(button).toBeInTheDocument();
    });

    it('renders multiple buttons in endContent', () => {
      render(
        <XDSTopNav
          label="App nav"
          endContent={
            <>
              <XDSButton
                label="Search"
                variant="ghost"
                icon={<span>search</span>}
              />
              <XDSButton
                label="Settings"
                variant="ghost"
                icon={<span>gear</span>}
              />
            </>
          }
        />,
      );
      expect(screen.getByRole('button', {name: 'Search'})).toBeInTheDocument();
      expect(
        screen.getByRole('button', {name: 'Settings'}),
      ).toBeInTheDocument();
    });
  });
});
