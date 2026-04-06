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

  describe('hasClear', () => {
    it('shows clear button when hasClear is true and value is non-empty', () => {
      render(
        <XDSTextInput
          label="Name"
          value="hello"
          onChange={() => {}}
          hasClear
        />,
      );
      expect(
        screen.getByRole('button', {name: 'Clear Name'}),
      ).toBeInTheDocument();
    });

    it('does not show clear button when value is empty', () => {
      render(
        <XDSTextInput label="Name" value="" onChange={() => {}} hasClear />,
      );
      expect(
        screen.queryByRole('button', {name: 'Clear Name'}),
      ).not.toBeInTheDocument();
    });

    it('does not show clear button when hasClear is false', () => {
      render(<XDSTextInput label="Name" value="hello" onChange={() => {}} />);
      expect(
        screen.queryByRole('button', {name: 'Clear Name'}),
      ).not.toBeInTheDocument();
    });

    it('does not show clear button when disabled', () => {
      render(
        <XDSTextInput
          label="Name"
          value="hello"
          onChange={() => {}}
          hasClear
          isDisabled
        />,
      );
      expect(
        screen.queryByRole('button', {name: 'Clear Name'}),
      ).not.toBeInTheDocument();
    });

    it('calls onChange with empty string when clear is clicked', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <XDSTextInput
          label="Name"
          value="hello"
          onChange={onChange}
          hasClear
        />,
      );
      await user.click(screen.getByRole('button', {name: 'Clear Name'}));
      expect(onChange).toHaveBeenCalledWith('', null);
    });
  });
});
