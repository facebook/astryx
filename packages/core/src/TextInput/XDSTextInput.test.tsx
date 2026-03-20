/**
 * @file XDSTextInput.test.tsx
 * @input Uses vitest, @testing-library/react, XDSTextInput component
 * @output Unit tests for XDSTextInput component behavior
 * @position Testing; validates XDSTextInput.tsx implementation
 *
 * SYNC: When XDSTextInput.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as stylex from '@stylexjs/stylex';
import {MagnifyingGlassIcon} from '@heroicons/react/24/outline';
import {XDSTextInput} from './XDSTextInput';

describe('XDSTextInput', () => {
  it('renders with label', () => {
    render(<XDSTextInput label="Name" value="" onChange={() => {}} />);
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(
      <XDSTextInput
        label="Name"
        value=""
        onChange={() => {}}
        placeholder="Enter text"
      />,
    );
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('calls onChange with value and event when typing', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<XDSTextInput label="Name" value="" onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'Hi');
    expect(handleChange).toHaveBeenCalledTimes(2);
    expect(handleChange).toHaveBeenLastCalledWith('i', expect.any(Object));
  });

  it('works with state setter function directly', async () => {
    const user = userEvent.setup();
    const setValue = vi.fn();
    render(<XDSTextInput label="Name" value="" onChange={setValue} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'A');
    expect(setValue).toHaveBeenCalledWith('A', expect.any(Object));
  });

  it('displays controlled value', () => {
    render(
      <XDSTextInput
        label="Name"
        value="Controlled value"
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('textbox')).toHaveValue('Controlled value');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(
      <XDSTextInput ref={ref} label="Name" value="" onChange={() => {}} />,
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
  });

  it('visually hides label when isLabelHidden is true', () => {
    render(
      <XDSTextInput
        label="Search"
        isLabelHidden
        value=""
        onChange={() => {}}
      />,
    );
    const label = screen.getByText('Search');
    expect(label).toBeInTheDocument();
    // Label should still be accessible
    expect(screen.getByLabelText('Search')).toBeInTheDocument();
  });

  it('shows label visually by default', () => {
    render(<XDSTextInput label="Email" value="" onChange={() => {}} />);
    const label = screen.getByText('Email');
    expect(label).toBeVisible();
  });

  it('focuses input when label is clicked', async () => {
    const user = userEvent.setup();
    render(<XDSTextInput label="Username" value="" onChange={() => {}} />);

    await user.click(screen.getByText('Username'));
    expect(screen.getByRole('textbox')).toHaveFocus();
  });

  it('renders labelIcon when provided', () => {
    render(
      <XDSTextInput
        label="Search"
        value=""
        onChange={() => {}}
        labelIcon={MagnifyingGlassIcon}
      />,
    );
    expect(document.querySelector('svg')).toBeInTheDocument();
    expect(screen.getByLabelText('Search')).toBeInTheDocument();
  });

  it('shows "Optional" text when isOptional is true', () => {
    render(
      <XDSTextInput label="Nickname" isOptional value="" onChange={() => {}} />,
    );
    expect(screen.getByText(/Optional/)).toBeInTheDocument();
  });

  it('shows "Required" text when isRequired is true', () => {
    render(
      <XDSTextInput label="Username" isRequired value="" onChange={() => {}} />,
    );
    expect(screen.getByText(/Required/)).toBeInTheDocument();
  });

  it('sets aria-required when isRequired is true', () => {
    render(
      <XDSTextInput label="Username" isRequired value="" onChange={() => {}} />,
    );
    expect(screen.getByRole('textbox')).toHaveAttribute(
      'aria-required',
      'true',
    );
  });

  it('does not set aria-required when isRequired is false', () => {
    render(<XDSTextInput label="Username" value="" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-required');
  });

  it('sets disabled attribute when isDisabled is true', () => {
    render(
      <XDSTextInput label="Name" isDisabled value="" onChange={() => {}} />,
    );
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('does not fire onChange when disabled', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <XDSTextInput label="Name" isDisabled value="" onChange={handleChange} />,
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'test');
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('is not disabled by default', () => {
    render(<XDSTextInput label="Name" value="" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).not.toBeDisabled();
  });

  it('renders with startIcon', () => {
    render(
      <XDSTextInput
        label="Search"
        value=""
        onChange={() => {}}
        startIcon={MagnifyingGlassIcon}
      />,
    );
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    // Icon should be rendered (as an SVG element)
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders without icon wrapper when startIcon is not provided', () => {
    const {container} = render(
      <XDSTextInput label="Name" value="" onChange={() => {}} />,
    );
    // No SVG should be present
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  describe('status prop', () => {
    it('renders with error status icon', () => {
      const {container} = render(
        <XDSTextInput
          label="Email"
          value=""
          onChange={() => {}}
          status={{type: 'error'}}
        />,
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('renders with warning status icon', () => {
      const {container} = render(
        <XDSTextInput
          label="Email"
          value=""
          onChange={() => {}}
          status={{type: 'warning'}}
        />,
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('renders with success status icon', () => {
      const {container} = render(
        <XDSTextInput
          label="Email"
          value=""
          onChange={() => {}}
          status={{type: 'success'}}
        />,
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('renders status message when provided', () => {
      render(
        <XDSTextInput
          label="Email"
          value=""
          onChange={() => {}}
          status={{type: 'error', message: 'Invalid email address'}}
        />,
      );
      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    });

    it('does not render status message when not provided', () => {
      render(
        <XDSTextInput
          label="Email"
          value=""
          onChange={() => {}}
          status={{type: 'error'}}
        />,
      );
      expect(screen.queryByText(/invalid/i)).not.toBeInTheDocument();
    });

    it('sets aria-invalid when status type is error', () => {
      render(
        <XDSTextInput
          label="Email"
          value=""
          onChange={() => {}}
          status={{type: 'error'}}
        />,
      );
      expect(screen.getByRole('textbox')).toHaveAttribute(
        'aria-invalid',
        'true',
      );
    });

    it('does not set aria-invalid for warning status', () => {
      render(
        <XDSTextInput
          label="Email"
          value=""
          onChange={() => {}}
          status={{type: 'warning'}}
        />,
      );
      expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid');
    });

    it('does not set aria-invalid for success status', () => {
      render(
        <XDSTextInput
          label="Email"
          value=""
          onChange={() => {}}
          status={{type: 'success'}}
        />,
      );
      expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid');
    });

    it('includes status message in aria-describedby', () => {
      render(
        <XDSTextInput
          label="Email"
          value=""
          onChange={() => {}}
          status={{type: 'error', message: 'Invalid email'}}
        />,
      );
      const input = screen.getByRole('textbox');
      const describedBy = input.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
      // The status message should be reachable via the described-by ID
      const messageElement = screen.getByText('Invalid email');
      expect(messageElement).toHaveAttribute('id');
      expect(describedBy).toContain(messageElement.id);
    });
  });

  it('renders tooltip info icon when labelTooltip is provided', () => {
    render(
      <XDSTextInput
        label="Help"
        value=""
        onChange={() => {}}
        labelTooltip="Helpful info"
      />,
    );
    // Info icon should be present
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('does not render tooltip icon when labelTooltip is not provided', () => {
    render(<XDSTextInput label="Name" value="" onChange={() => {}} />);
    expect(document.querySelector('svg')).not.toBeInTheDocument();
  });

  describe('hasAutoFocus prop', () => {
    it('focuses the input when hasAutoFocus is true', () => {
      render(
        <XDSTextInput label="Name" value="" onChange={() => {}} hasAutoFocus />,
      );
      expect(screen.getByRole('textbox')).toHaveFocus();
    });

    it('does not focus when hasAutoFocus is false', () => {
      render(<XDSTextInput label="Name" value="" onChange={() => {}} />);
      expect(screen.getByRole('textbox')).not.toHaveFocus();
    });
  });

  describe('htmlName prop', () => {
    it('sets name attribute when htmlName is provided', () => {
      render(
        <XDSTextInput
          label="Name"
          value=""
          onChange={() => {}}
          htmlName="username"
        />,
      );
      expect(screen.getByRole('textbox')).toHaveAttribute('name', 'username');
    });

    it('does not set name attribute when htmlName is not provided', () => {
      render(<XDSTextInput label="Name" value="" onChange={() => {}} />);
      expect(screen.getByRole('textbox')).not.toHaveAttribute('name');
    });
  });

  describe('description prop', () => {
    it('renders description text', () => {
      render(
        <XDSTextInput
          label="Email"
          value=""
          onChange={() => {}}
          description="We'll never share your email"
        />,
      );
      expect(
        screen.getByText("We'll never share your email"),
      ).toBeInTheDocument();
    });

    it('includes description in aria-describedby', () => {
      render(
        <XDSTextInput
          label="Email"
          value=""
          onChange={() => {}}
          description="Some help text"
        />,
      );
      const input = screen.getByRole('textbox');
      const describedBy = input.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
      const descriptionEl = screen.getByText('Some help text');
      expect(describedBy).toContain(descriptionEl.id);
    });
  });

  describe('isLoading / isBusy', () => {
    it('disables input when isLoading is true', () => {
      render(
        <XDSTextInput label="Name" value="" onChange={() => {}} isLoading />,
      );
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('sets aria-busy when isLoading is true', () => {
      render(
        <XDSTextInput label="Name" value="" onChange={() => {}} isLoading />,
      );
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-busy', 'true');
    });

    it('does not set aria-busy when not loading', () => {
      render(<XDSTextInput label="Name" value="" onChange={() => {}} />);
      expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-busy');
    });

    it('does not fire onChange when isLoading is true', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <XDSTextInput
          label="Name"
          isLoading
          value=""
          onChange={handleChange}
        />,
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'test');
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('hides status icon when isBusy shows spinner', () => {
      const {container} = render(
        <XDSTextInput
          label="Name"
          value=""
          onChange={() => {}}
          isLoading
          status={{type: 'error'}}
        />,
      );
      // Should show spinner but not status icon — only spinner SVG
      const svgs = container.querySelectorAll('svg');
      // Spinner renders as its own element; status icon should be hidden
      expect(svgs.length).toBeLessThanOrEqual(1);
    });
  });

  describe('onChangeAction', () => {
    it('calls onChangeAction after onChange', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const handleAction = vi.fn();
      render(
        <XDSTextInput
          label="Name"
          value=""
          onChange={handleChange}
          onChangeAction={handleAction}
        />,
      );

      await user.type(screen.getByRole('textbox'), 'A');
      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleAction).toHaveBeenCalledTimes(1);
      expect(handleAction).toHaveBeenCalledWith('A', expect.any(Object));
    });

    it('does not call onChangeAction when onChange calls preventDefault', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn((_val: string, e: React.ChangeEvent) => {
        e.preventDefault();
      });
      const handleAction = vi.fn();
      render(
        <XDSTextInput
          label="Name"
          value=""
          onChange={handleChange}
          onChangeAction={handleAction}
        />,
      );

      await user.type(screen.getByRole('textbox'), 'A');
      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleAction).not.toHaveBeenCalled();
    });
  });

  describe('size variants', () => {
    it('renders with sm size', () => {
      const {container} = render(
        <XDSTextInput label="Name" value="" onChange={() => {}} size="sm" />,
      );
      const wrapper = container.querySelector('.xds-text-input');
      expect(wrapper).toBeInTheDocument();
    });

    it('renders with md size (default)', () => {
      const {container} = render(
        <XDSTextInput label="Name" value="" onChange={() => {}} />,
      );
      const wrapper = container.querySelector('.xds-text-input');
      expect(wrapper).toBeInTheDocument();
    });

    it('renders with lg size', () => {
      const {container} = render(
        <XDSTextInput label="Name" value="" onChange={() => {}} size="lg" />,
      );
      const wrapper = container.querySelector('.xds-text-input');
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe('xstyle, className, style props', () => {
    it('applies xstyle to the wrapper', () => {
      const overrides = stylex.create({root: {opacity: 0.9}});
      const {container} = render(
        <XDSTextInput
          label="Name"
          value=""
          onChange={() => {}}
          xstyle={overrides.root}
        />,
      );
      const wrapper = container.querySelector('.xds-text-input');
      expect(wrapper).toBeInTheDocument();
    });

    it('applies className to the wrapper', () => {
      const {container} = render(
        <XDSTextInput
          label="Name"
          value=""
          onChange={() => {}}
          className="custom-class"
        />,
      );
      const wrapper = container.querySelector('.xds-text-input');
      expect(wrapper).toHaveClass('custom-class');
    });

    it('applies inline style to the wrapper', () => {
      const {container} = render(
        <XDSTextInput
          label="Name"
          value=""
          onChange={() => {}}
          style={{color: 'red'}}
        />,
      );
      const wrapper = container.querySelector('.xds-text-input');
      expect(wrapper).toHaveStyle({color: 'rgb(255, 0, 0)'});
    });
  });

  describe('isOptional + isRequired conflict', () => {
    it('does not set aria-required when both isOptional and isRequired are true', () => {
      render(
        <XDSTextInput
          label="Field"
          value=""
          onChange={() => {}}
          isOptional
          isRequired
        />,
      );
      expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-required');
    });
  });

  describe('autoComplete prop', () => {
    it('sets autocomplete attribute', () => {
      render(
        <XDSTextInput
          label="Email"
          value=""
          onChange={() => {}}
          autoComplete="email"
        />,
      );
      expect(screen.getByRole('textbox')).toHaveAttribute(
        'autocomplete',
        'email',
      );
    });
  });

  describe('onFocus and onBlur props', () => {
    it('calls onFocus when input receives focus', async () => {
      const user = userEvent.setup();
      const handleFocus = vi.fn();
      render(
        <XDSTextInput
          label="Name"
          value=""
          onChange={() => {}}
          onFocus={handleFocus}
        />,
      );

      await user.click(screen.getByRole('textbox'));
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('calls onBlur when input loses focus', async () => {
      const user = userEvent.setup();
      const handleBlur = vi.fn();
      render(
        <XDSTextInput
          label="Name"
          value=""
          onChange={() => {}}
          onBlur={handleBlur}
        />,
      );

      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.tab();
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('onEnter prop', () => {
    it('calls onEnter when Enter key is pressed', async () => {
      const user = userEvent.setup();
      const handleEnter = vi.fn();
      render(
        <XDSTextInput
          label="Name"
          value=""
          onChange={() => {}}
          onEnter={handleEnter}
        />,
      );

      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.keyboard('{Enter}');
      expect(handleEnter).toHaveBeenCalledTimes(1);
    });

    it('does not call onEnter for other keys', async () => {
      const user = userEvent.setup();
      const handleEnter = vi.fn();
      render(
        <XDSTextInput
          label="Name"
          value=""
          onChange={() => {}}
          onEnter={handleEnter}
        />,
      );

      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.keyboard('a');
      expect(handleEnter).not.toHaveBeenCalled();
    });
  });

  describe('XDSBaseProps rest spreading', () => {
    it('spreads data attributes to the wrapper div', () => {
      const {container} = render(
        <XDSTextInput
          label="Name"
          value=""
          onChange={() => {}}
          data-testid="my-input"
        />,
      );
      const wrapper = container.querySelector(
        '[data-testid="my-input"]',
      );
      expect(wrapper).toBeInTheDocument();
    });

    it('spreads aria attributes to the wrapper div', () => {
      const {container} = render(
        <XDSTextInput
          label="Name"
          value=""
          onChange={() => {}}
          aria-label="custom-label"
        />,
      );
      const wrapper = container.querySelector('.xds-text-input');
      expect(wrapper).toHaveAttribute('aria-label', 'custom-label');
    });
  });
});
