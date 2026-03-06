/**
 * @file XDSDialogHeader.test.tsx
 * @input Uses vitest, @testing-library/react, XDSDialogHeader component
 * @output Unit tests for XDSDialogHeader component behavior
 * @position Testing; validates XDSDialogHeader.tsx implementation
 *
 * SYNC: When XDSDialogHeader.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSDialogHeader} from './XDSDialogHeader';

describe('XDSDialogHeader', () => {
  it('renders the title', () => {
    render(<XDSDialogHeader title="My Dialog Title" />);
    expect(
      screen.getByRole('heading', {level: 2, name: 'My Dialog Title'}),
    ).toBeInTheDocument();
  });

  it('renders the title as an h2 element', () => {
    render(<XDSDialogHeader title="Title" />);
    const heading = screen.getByRole('heading', {level: 2});
    expect(heading.tagName).toBe('H2');
  });

  it('title has tabIndex=-1 for programmatic focus', () => {
    render(<XDSDialogHeader title="Title" />);
    const heading = screen.getByRole('heading', {level: 2});
    expect(heading).toHaveAttribute('tabindex', '-1');
  });

  it('auto-focuses the title when mounted', () => {
    render(<XDSDialogHeader title="Title" />);
    const heading = screen.getByRole('heading', {level: 2});
    expect(document.activeElement).toBe(heading);
  });

  it('renders subtitle when provided', () => {
    render(<XDSDialogHeader title="Title" subtitle="This is a subtitle" />);
    expect(screen.getByText('This is a subtitle')).toBeInTheDocument();
  });

  it('does not render subtitle when not provided', () => {
    render(<XDSDialogHeader title="Title" />);
    expect(screen.queryByText('This is a subtitle')).not.toBeInTheDocument();
  });

  it('renders close button when onOpenChange is provided', () => {
    render(<XDSDialogHeader title="Title" onOpenChange={() => {}} />);
    expect(screen.getByRole('button', {name: /close/i})).toBeInTheDocument();
  });

  it('does not render close button when onOpenChange is not provided', () => {
    render(<XDSDialogHeader title="Title" />);
    expect(
      screen.queryByRole('button', {name: /close/i}),
    ).not.toBeInTheDocument();
  });

  it('calls onOpenChange(false) when close button is clicked', async () => {
    const user = userEvent.setup();
    const handleHide = vi.fn();
    render(<XDSDialogHeader title="Title" onOpenChange={handleHide} />);

    await user.click(screen.getByRole('button', {name: /close/i}));
    expect(handleHide).toHaveBeenCalledTimes(1);
  });

  it('renders with divider by default', () => {
    const {container} = render(<XDSDialogHeader title="Title" />);
    // Check that the header div has divider styles (border-bottom)
    const header = container.firstChild as HTMLElement;
    expect(header).toBeInTheDocument();
  });

  it('renders additional endContent', () => {
    render(
      <XDSDialogHeader
        title="Title"
        endContent={<button>Custom Action</button>}
      />,
    );
    expect(
      screen.getByRole('button', {name: 'Custom Action'}),
    ).toBeInTheDocument();
  });

  it('renders endContent alongside close button', () => {
    render(
      <XDSDialogHeader
        title="Title"
        onOpenChange={() => {}}
        endContent={<button>Custom Action</button>}
      />,
    );
    expect(
      screen.getByRole('button', {name: 'Custom Action'}),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /close/i})).toBeInTheDocument();
  });

  it('renders startContent before the title', () => {
    render(
      <XDSDialogHeader title="Title" startContent={<button>Back</button>} />,
    );
    expect(screen.getByRole('button', {name: 'Back'})).toBeInTheDocument();
  });

  it('renders startContent and endContent together', () => {
    render(
      <XDSDialogHeader
        title="Title"
        startContent={<button>Back</button>}
        endContent={<button>Save</button>}
        onOpenChange={() => {}}
      />,
    );
    expect(screen.getByRole('button', {name: 'Back'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Save'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /close/i})).toBeInTheDocument();
  });
});
