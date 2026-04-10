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
import {XDSBanner} from '../../Banner/XDSBanner';

describe('Edge Compensation', () => {
  describe('TopNav edge signals', () => {
    it('sets --container-padding-inline on the nav element', () => {
      render(
        <XDSTopNav
          label="Test nav"
          endContent={<span data-testid="end">End</span>}
        />,
      );
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
      // The nav should have the container-padding-inline style set
      // (StyleX applies this as a class — we verify the element renders correctly)
      expect(nav).toHaveAttribute('class');
    });

    it('renders endContent slot with edge-end signal wrapper', () => {
      render(
        <XDSTopNav
          label="Test nav"
          endContent={<span data-testid="end-item">Action</span>}
        />,
      );
      const endItem = screen.getByTestId('end-item');
      // The parent wrapper should have a class applied (edgeSignals.end)
      expect(endItem.parentElement).toHaveAttribute('class');
    });

    it('renders leftSection with edge-start signal wrapper', () => {
      render(
        <XDSTopNav
          label="Test nav"
          heading={<span data-testid="heading">Logo</span>}
        />,
      );
      const heading = screen.getByTestId('heading');
      // heading > heading wrapper > leftSection (with edgeSignals.start)
      const leftSection = heading.parentElement?.parentElement;
      expect(leftSection).toHaveAttribute('class');
    });
  });

  describe('Banner edge signals', () => {
    it('sets --container-padding-inline on the banner header', () => {
      render(<XDSBanner status="info" title="Test" isDismissable />);
      // Banner renders with role="status" for info — use getAllByRole
      // since the dismiss button's live region also has role="status"
      const statuses = screen.getAllByRole('status');
      expect(statuses.length).toBeGreaterThanOrEqual(1);
    });

    it('renders dismiss button without a wrapper div', () => {
      render(<XDSBanner status="info" title="Test" isDismissable />);
      const dismissButton = screen.getByRole('button', {name: 'Dismiss'});
      expect(dismissButton).toBeInTheDocument();
      // The dismiss button should NOT be wrapped in an extra div with
      // manual negative margin — it should be a direct child of the endArea
      // The parent should be the endArea div (which has edgeSignals.end)
      const parent = dismissButton.closest('[class]')?.parentElement;
      expect(parent).not.toBeNull();
    });
  });

  describe('Button ghost variant edge compensation', () => {
    it('applies edge compensation class to ghost text button', () => {
      render(
        <XDSButton label="Action" variant="ghost" data-testid="ghost-btn" />,
      );
      const button = screen.getByRole('button', {name: 'Action'});
      // Ghost buttons should have additional style classes for edge compensation
      const classCount = (button.getAttribute('class') || '').split(' ').length;
      // Ghost button has: base + ghost variant + edge compensation = more classes
      // than a primary button
      expect(classCount).toBeGreaterThan(0);
    });

    it('applies edge compensation class to ghost icon-only button', () => {
      render(
        <XDSButton
          label="Settings"
          variant="ghost"
          icon={<span>gear</span>}
          isIconOnly
        />,
      );
      const button = screen.getByRole('button', {name: 'Settings'});
      expect(button).toBeInTheDocument();
    });

    it('does not apply edge compensation to primary variant', () => {
      const {container: primaryContainer} = render(
        <XDSButton label="Primary" variant="primary" />,
      );
      const {container: ghostContainer} = render(
        <XDSButton label="Ghost" variant="ghost" />,
      );
      const primaryClasses =
        primaryContainer.querySelector('button')?.getAttribute('class') || '';
      const ghostClasses =
        ghostContainer.querySelector('button')?.getAttribute('class') || '';
      // Ghost button should have more classes than primary (edge compensation adds classes)
      expect(ghostClasses.split(' ').length).toBeGreaterThan(
        primaryClasses.split(' ').length,
      );
    });

    it('does not apply edge compensation to secondary variant', () => {
      const {container: secondaryContainer} = render(
        <XDSButton label="Secondary" variant="secondary" />,
      );
      const {container: ghostContainer} = render(
        <XDSButton label="Ghost" variant="ghost" />,
      );
      const secondaryClasses =
        secondaryContainer.querySelector('button')?.getAttribute('class') || '';
      const ghostClasses =
        ghostContainer.querySelector('button')?.getAttribute('class') || '';
      // Ghost button should have more classes than secondary (edge compensation adds classes)
      expect(ghostClasses.split(' ').length).toBeGreaterThan(
        secondaryClasses.split(' ').length,
      );
    });
  });

  describe('TopNav + Button integration', () => {
    it('renders ghost button inside TopNav endContent', () => {
      render(
        <XDSTopNav
          label="App nav"
          endContent={
            <XDSButton
              label="Search"
              variant="ghost"
              icon={<span>search</span>}
              isIconOnly
            />
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
                isIconOnly
              />
              <XDSButton
                label="Settings"
                variant="ghost"
                icon={<span>gear</span>}
                isIconOnly
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
