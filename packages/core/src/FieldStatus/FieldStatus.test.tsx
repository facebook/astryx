// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file FieldStatus.test.tsx
 * @input Uses vitest, @testing-library/react, FieldStatus component
 * @output Characterization coverage for FieldStatus behavior
 * @position Testing; validates FieldStatus.tsx implementation
 *
 * SYNC: When FieldStatus.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, afterEach} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import * as stylex from '@stylexjs/stylex';
import {FieldStatus} from './FieldStatus';
import {__resetLiveRegionsForTest} from '../hooks/useAnnounce';

const testStyles = stylex.create({
  custom: {color: 'rebeccapurple'},
});

function politeRegion(): HTMLElement | null {
  return document.querySelector('[data-astryx-live-region="polite"]');
}
function assertiveRegion(): HTMLElement | null {
  return document.querySelector('[data-astryx-live-region="assertive"]');
}

afterEach(() => {
  __resetLiveRegionsForTest();
});

describe('FieldStatus', () => {
  it('renders the message text', () => {
    render(<FieldStatus type="error" message="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('renders the message inside a <div>', () => {
    render(<FieldStatus type="error" message="Boom" data-testid="fs" />);
    expect(screen.getByTestId('fs').tagName).toBe('DIV');
  });

  describe('screen-reader announcements', () => {
    // The rendered element is NOT itself a live region: FieldStatus is
    // conditionally mounted by every caller, and live regions born together
    // with their content are not reliably announced. Announcements go through
    // the persistent useAnnounce singletons instead.
    it('does not carry role or aria-live on the rendered element', () => {
      render(<FieldStatus type="error" message="msg" data-testid="fs" />);
      const el = screen.getByTestId('fs');
      expect(el).not.toHaveAttribute('role');
      expect(el).not.toHaveAttribute('aria-live');
    });

    // Errors are urgent — they interrupt via the assertive channel.
    it('announces error messages assertively, including on first mount', async () => {
      render(<FieldStatus type="error" message="This field is required" />);
      await waitFor(() => {
        expect(assertiveRegion()).toHaveTextContent('This field is required');
      });
      expect(politeRegion()).toHaveTextContent('');
    });

    it('announces warning messages politely', async () => {
      render(<FieldStatus type="warning" message="Check this value" />);
      await waitFor(() => {
        expect(politeRegion()).toHaveTextContent('Check this value');
      });
      expect(assertiveRegion()).toHaveTextContent('');
    });

    it('announces success messages politely', async () => {
      render(<FieldStatus type="success" message="Looks good" />);
      await waitFor(() => {
        expect(politeRegion()).toHaveTextContent('Looks good');
      });
    });

    it('announces message changes', async () => {
      const {rerender} = render(<FieldStatus type="error" message="First" />);
      await waitFor(() => {
        expect(assertiveRegion()).toHaveTextContent('First');
      });
      rerender(<FieldStatus type="error" message="Second" />);
      await waitFor(() => {
        expect(assertiveRegion()).toHaveTextContent('Second');
      });
    });

    // Severity changes re-route the announcement to the matching channel.
    it('re-routes to the polite channel when type changes from error', async () => {
      const {rerender} = render(<FieldStatus type="error" message="msg" />);
      await waitFor(() => {
        expect(assertiveRegion()).toHaveTextContent('msg');
      });
      rerender(<FieldStatus type="success" message="msg" />);
      await waitFor(() => {
        expect(politeRegion()).toHaveTextContent('msg');
      });
    });

    it('does not announce an empty message', () => {
      render(<FieldStatus type="error" message="" />);
      // The live regions are created lazily on first announce; an empty
      // message must not trigger one.
      expect(assertiveRegion()).toBeNull();
      expect(politeRegion()).toBeNull();
    });

    // The visible message stays perceivable by assistive tech (it is the
    // aria-describedby target for the input).
    it('does not mark itself aria-hidden', () => {
      render(<FieldStatus type="error" message="msg" data-testid="fs" />);
      expect(screen.getByTestId('fs')).not.toHaveAttribute('aria-hidden');
    });
  });

  describe('theme class + data attribute reflection', () => {
    it('renders the stable astryx-field-status class', () => {
      render(<FieldStatus type="error" message="msg" data-testid="fs" />);
      expect(screen.getByTestId('fs')).toHaveClass('astryx-field-status');
    });

    it('reflects the type as a class token and data-type attribute', () => {
      render(<FieldStatus type="warning" message="msg" data-testid="fs" />);
      const el = screen.getByTestId('fs');
      expect(el).toHaveClass('warning');
      expect(el).toHaveAttribute('data-type', 'warning');
    });

    it('reflects the variant as a class token and data-variant attribute', () => {
      render(
        <FieldStatus
          type="error"
          message="msg"
          variant="detached"
          data-testid="fs"
        />,
      );
      const el = screen.getByTestId('fs');
      expect(el).toHaveClass('detached');
      expect(el).toHaveAttribute('data-variant', 'detached');
    });

    it('defaults data-variant to "attached"', () => {
      render(<FieldStatus type="error" message="msg" data-testid="fs" />);
      const el = screen.getByTestId('fs');
      expect(el).toHaveAttribute('data-variant', 'attached');
      expect(el).toHaveClass('attached');
    });
  });

  describe('color styling per status type', () => {
    // Each status type maps to a distinct color treatment. The rendered class
    // list must therefore differ between types — a regression that collapsed
    // them onto one color would be caught here.
    it('applies distinct StyleX classes for each type', () => {
      const {rerender} = render(
        <FieldStatus type="error" message="msg" data-testid="fs" />,
      );
      const errorClass = screen.getByTestId('fs').getAttribute('class');

      rerender(<FieldStatus type="warning" message="msg" data-testid="fs" />);
      const warningClass = screen.getByTestId('fs').getAttribute('class');

      rerender(<FieldStatus type="success" message="msg" data-testid="fs" />);
      const successClass = screen.getByTestId('fs').getAttribute('class');

      expect(errorClass).not.toEqual(warningClass);
      expect(warningClass).not.toEqual(successClass);
      expect(errorClass).not.toEqual(successClass);
    });

    it('applies distinct StyleX classes for each variant', () => {
      const {rerender} = render(
        <FieldStatus
          type="error"
          message="msg"
          variant="attached"
          data-testid="fs"
        />,
      );
      const attachedClass = screen.getByTestId('fs').getAttribute('class');

      rerender(
        <FieldStatus
          type="error"
          message="msg"
          variant="detached"
          data-testid="fs"
        />,
      );
      const detachedClass = screen.getByTestId('fs').getAttribute('class');

      expect(attachedClass).not.toEqual(detachedClass);
    });
  });

  describe('prop forwarding', () => {
    it('forwards a ref to the root element', () => {
      const ref = vi.fn();
      render(<FieldStatus ref={ref} type="error" message="msg" />);
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
    });

    it('applies the id attribute', () => {
      render(
        <FieldStatus
          type="error"
          message="msg"
          id="email-error"
          data-testid="fs"
        />,
      );
      expect(screen.getByTestId('fs')).toHaveAttribute('id', 'email-error');
    });

    it('passes through arbitrary DOM props', () => {
      render(
        <FieldStatus
          type="error"
          message="msg"
          data-testid="fs"
          data-custom="xyz"
        />,
      );
      expect(screen.getByTestId('fs')).toHaveAttribute('data-custom', 'xyz');
    });

    it('merges a consumer className with the stable class', () => {
      render(
        <FieldStatus
          type="error"
          message="msg"
          className="my-status"
          data-testid="fs"
        />,
      );
      const el = screen.getByTestId('fs');
      expect(el).toHaveClass('my-status');
      expect(el).toHaveClass('astryx-field-status');
    });

    it('merges a consumer inline style', () => {
      render(
        <FieldStatus
          type="error"
          message="msg"
          style={{marginTop: '10px'}}
          data-testid="fs"
        />,
      );
      expect(screen.getByTestId('fs')).toHaveStyle({marginTop: '10px'});
    });

    it('applies an xstyle as an extra class', () => {
      const {rerender} = render(
        <FieldStatus type="error" message="msg" data-testid="fs" />,
      );
      const withoutXstyle = screen.getByTestId('fs').getAttribute('class');

      // xstyle values are compiled StyleX styles; passing one adds classes.
      rerender(
        <FieldStatus
          type="error"
          message="msg"
          data-testid="fs"
          xstyle={testStyles.custom}
        />,
      );
      const withXstyle = screen.getByTestId('fs').getAttribute('class');
      expect(withXstyle).not.toEqual(withoutXstyle);
    });
  });

  describe('dynamic updates', () => {
    it('updates the rendered message on rerender', () => {
      const {rerender} = render(
        <FieldStatus type="error" message="First" data-testid="fs" />,
      );
      expect(screen.getByTestId('fs')).toHaveTextContent('First');

      rerender(<FieldStatus type="error" message="Second" data-testid="fs" />);
      expect(screen.getByTestId('fs')).toHaveTextContent('Second');
    });

    // The element must never regain live-region semantics when the type
    // changes — announcements always flow through the persistent regions.
    it('keeps the element role-free when type changes from error', () => {
      const {rerender} = render(
        <FieldStatus type="error" message="msg" data-testid="fs" />,
      );
      expect(screen.getByTestId('fs')).not.toHaveAttribute('role');

      rerender(<FieldStatus type="success" message="msg" data-testid="fs" />);
      const el = screen.getByTestId('fs');
      expect(el).not.toHaveAttribute('role');
      expect(el).not.toHaveAttribute('aria-live');
    });
  });

  describe('edge cases', () => {
    it('renders an empty message without crashing', () => {
      render(<FieldStatus type="error" message="" data-testid="fs" />);
      const el = screen.getByTestId('fs');
      expect(el).toBeInTheDocument();
      expect(el).toHaveTextContent('');
    });

    it('renders message content verbatim, including whitespace-only strings', () => {
      render(<FieldStatus type="warning" message="   " data-testid="fs" />);
      expect(screen.getByTestId('fs').textContent).toBe('   ');
    });
  });

  it('exposes a displayName for devtools', () => {
    expect(FieldStatus.displayName).toBe('FieldStatus');
  });
});
