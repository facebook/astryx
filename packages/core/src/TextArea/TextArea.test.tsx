// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TextArea.test.tsx
 * @input Uses vitest, @testing-library/react, TextArea component
 * @output Unit tests for TextArea component behavior
 * @position Testing; validates TextArea.tsx implementation
 *
 * SYNC: When TextArea.tsx changes, update tests to match new behavior
 */

import {useState} from 'react';
import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MagnifyingGlassIcon} from '@heroicons/react/24/outline';
import {TextArea} from './TextArea';

describe('TextArea', () => {
  it('renders with label', () => {
    render(<TextArea label="Description" value="" onChange={() => {}} />);
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(
      <TextArea
        label="Description"
        value=""
        onChange={() => {}}
        placeholder="Enter description"
      />,
    );
    expect(
      screen.getByPlaceholderText('Enter description'),
    ).toBeInTheDocument();
  });

  it('calls onChange with value and event when typing', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <TextArea label="Description" value="" onChange={handleChange} />,
    );

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Hi');
    expect(handleChange).toHaveBeenCalledTimes(2);
    expect(handleChange).toHaveBeenLastCalledWith('i', expect.any(Object));
  });

  it('works with state setter function directly', async () => {
    const user = userEvent.setup();
    const setValue = vi.fn();
    render(<TextArea label="Description" value="" onChange={setValue} />);

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'A');
    expect(setValue).toHaveBeenCalledWith('A', expect.any(Object));
  });

  it('displays controlled value', () => {
    render(
      <TextArea
        label="Description"
        value="Controlled value"
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('textbox')).toHaveValue('Controlled value');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(
      <TextArea
        ref={ref}
        label="Description"
        value=""
        onChange={() => {}}
      />,
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLTextAreaElement));
  });

  it('visually hides label when isLabelHidden is true', () => {
    render(
      <TextArea
        label="Comments"
        isLabelHidden
        value=""
        onChange={() => {}}
      />,
    );
    const label = screen.getByText('Comments');
    expect(label).toBeInTheDocument();
    // Label should still be accessible
    expect(screen.getByLabelText('Comments')).toBeInTheDocument();
  });

  it('shows label visually by default', () => {
    render(<TextArea label="Notes" value="" onChange={() => {}} />);
    const label = screen.getByText('Notes');
    expect(label).toBeVisible();
  });

  it('sets aria-required when isRequired is true', () => {
    render(
      <TextArea label="Feedback" isRequired value="" onChange={() => {}} />,
    );
    expect(screen.getByRole('textbox')).toHaveAttribute(
      'aria-required',
      'true',
    );
  });

  it('does not set aria-required when isRequired is false', () => {
    render(<TextArea label="Feedback" value="" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-required');
  });

  it('renders with custom rows', () => {
    render(
      <TextArea label="Description" value="" onChange={() => {}} rows={5} />,
    );
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '5');
  });

  it('renders with default rows of 3', () => {
    render(<TextArea label="Description" value="" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '3');
  });

  it('is disabled when isDisabled is true', () => {
    render(
      <TextArea
        label="Description"
        isDisabled
        value=""
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('is not disabled by default', () => {
    render(<TextArea label="Description" value="" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).not.toBeDisabled();
  });

  it('shows aria-busy when isLoading is true', () => {
    render(
      <TextArea
        label="Description"
        isLoading
        value=""
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('textbox')).not.toBeDisabled();
  });

  it('does not call onChange when disabled', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <TextArea
        label="Description"
        isDisabled
        value=""
        onChange={handleChange}
      />,
    );

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Hi');
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('renders with startIcon', () => {
    render(
      <TextArea
        label="Description"
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
      <TextArea label="Description" value="" onChange={() => {}} />,
    );
    // No SVG should be present
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  describe('status prop', () => {
    it('renders with error status icon', () => {
      const {container} = render(
        <TextArea
          label="Description"
          value=""
          onChange={() => {}}
          status={{type: 'error'}}
        />,
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('renders with warning status icon', () => {
      const {container} = render(
        <TextArea
          label="Description"
          value=""
          onChange={() => {}}
          status={{type: 'warning'}}
        />,
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('renders with success status icon', () => {
      const {container} = render(
        <TextArea
          label="Description"
          value=""
          onChange={() => {}}
          status={{type: 'success'}}
        />,
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('renders status message when provided', () => {
      render(
        <TextArea
          label="Description"
          value=""
          onChange={() => {}}
          status={{type: 'error', message: 'Description is required'}}
        />,
      );
      expect(screen.getByText('Description is required')).toBeInTheDocument();
    });

    it('does not render status message when not provided', () => {
      render(
        <TextArea
          label="Description"
          value=""
          onChange={() => {}}
          status={{type: 'error'}}
        />,
      );
      expect(screen.queryByText(/required/i)).not.toBeInTheDocument();
    });

    it('sets aria-invalid when status type is error', () => {
      render(
        <TextArea
          label="Description"
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
        <TextArea
          label="Description"
          value=""
          onChange={() => {}}
          status={{type: 'warning'}}
        />,
      );
      expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid');
    });

    it('does not set aria-invalid for success status', () => {
      render(
        <TextArea
          label="Description"
          value=""
          onChange={() => {}}
          status={{type: 'success'}}
        />,
      );
      expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid');
    });

    it('includes status message in aria-describedby', () => {
      render(
        <TextArea
          label="Description"
          value=""
          onChange={() => {}}
          status={{type: 'error', message: 'Too short'}}
        />,
      );
      const textarea = screen.getByRole('textbox');
      const describedBy = textarea.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
      // The status message should be reachable via the described-by ID
      const messageElement = screen.getByText('Too short');
      expect(messageElement).toHaveAttribute('id');
      expect(describedBy).toContain(messageElement.id);
    });
  });

  it('renders tooltip info icon when labelTooltip is provided', () => {
    render(
      <TextArea
        label="Description"
        value=""
        onChange={() => {}}
        labelTooltip="Enter a detailed description"
      />,
    );
    // Info icon should be present
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('does not render tooltip icon when labelTooltip is not provided', () => {
    render(<TextArea label="Description" value="" onChange={() => {}} />);
    expect(document.querySelector('svg')).not.toBeInTheDocument();
  });

  it('renders with size="lg"', () => {
    render(
      <TextArea
        label="Description"
        value=""
        onChange={() => {}}
        size="lg"
      />,
    );
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  describe('hasSpellCheck prop', () => {
    it('enables spellcheck by default', () => {
      render(<TextArea label="Description" value="" onChange={() => {}} />);
      expect(screen.getByRole('textbox')).toHaveAttribute('spellcheck', 'true');
    });

    it('enables spellcheck when hasSpellCheck is true', () => {
      render(
        <TextArea
          label="Description"
          value=""
          onChange={() => {}}
          hasSpellCheck={true}
        />,
      );
      expect(screen.getByRole('textbox')).toHaveAttribute('spellcheck', 'true');
    });

    it('disables spellcheck when hasSpellCheck is false', () => {
      render(
        <TextArea
          label="Description"
          value=""
          onChange={() => {}}
          hasSpellCheck={false}
        />,
      );
      expect(screen.getByRole('textbox')).toHaveAttribute(
        'spellcheck',
        'false',
      );
    });
  });

  describe('onPaste prop', () => {
    it('calls onPaste when content is pasted', () => {
      const handlePaste = vi.fn();
      render(
        <TextArea
          label="Description"
          value=""
          onChange={() => {}}
          onPaste={handlePaste}
        />,
      );

      const textarea = screen.getByRole('textbox');
      fireEvent.paste(textarea, {
        clipboardData: {getData: () => 'pasted text'},
      });
      expect(handlePaste).toHaveBeenCalledTimes(1);
    });

    it('does not throw when onPaste is not provided', () => {
      render(<TextArea label="Description" value="" onChange={() => {}} />);

      const textarea = screen.getByRole('textbox');
      expect(() => {
        fireEvent.paste(textarea, {
          clipboardData: {getData: () => 'pasted text'},
        });
      }).not.toThrow();
    });
  });

  describe('maxLength prop', () => {
    it('displays character counter when maxLength is provided', () => {
      render(
        <TextArea
          label="Description"
          value="Hello"
          onChange={() => {}}
          maxLength={20}
        />,
      );
      expect(screen.getByText('5/20')).toBeInTheDocument();
    });

    it('does not display counter when maxLength is not provided', () => {
      render(
        <TextArea label="Description" value="Hello" onChange={() => {}} />,
      );
      expect(screen.queryByText(/\/\d+/)).not.toBeInTheDocument();
    });

    it('updates counter as value changes', () => {
      const {rerender} = render(
        <TextArea
          label="Description"
          value=""
          onChange={() => {}}
          maxLength={100}
        />,
      );
      expect(screen.getByText('0/100')).toBeInTheDocument();

      rerender(
        <TextArea
          label="Description"
          value="Hello World"
          onChange={() => {}}
          maxLength={100}
        />,
      );
      expect(screen.getByText('11/100')).toBeInTheDocument();
    });

    it('does not set native maxLength attribute (counter is visual-only)', () => {
      render(
        <TextArea
          label="Description"
          value=""
          onChange={() => {}}
          maxLength={50}
        />,
      );
      expect(screen.getByRole('textbox')).not.toHaveAttribute('maxlength');
      expect(screen.getByText('0/50')).toBeInTheDocument();
    });

    it('does not set maxLength attribute when not provided', () => {
      render(<TextArea label="Description" value="" onChange={() => {}} />);
      expect(screen.getByRole('textbox')).not.toHaveAttribute('maxlength');
    });

    it('counter updates as user types (controlled)', async () => {
      const user = userEvent.setup();
      function Wrapper() {
        const [val, setVal] = useState('');
        return (
          <TextArea
            label="Description"
            value={val}
            onChange={setVal}
            maxLength={50}
          />
        );
      }
      render(<Wrapper />);
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello');
      expect(screen.getByText('5/50')).toBeInTheDocument();
    });

    it('counter has aria-live region for screen reader announcements', () => {
      render(
        <TextArea
          label="Description"
          value={'x'.repeat(45)}
          onChange={() => {}}
          maxLength={50}
        />,
      );
      const liveRegion = document.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveTextContent('5 characters remaining');
    });

    it('counter is linked to textarea via aria-describedby', () => {
      render(
        <TextArea
          label="Description"
          value="Hello"
          onChange={() => {}}
          maxLength={50}
        />,
      );
      const textarea = screen.getByRole('textbox');
      const describedBy = textarea.getAttribute('aria-describedby');
      const counter = screen.getByText('5/50');
      expect(counter).toHaveAttribute('id');
      expect(describedBy).toContain(counter.id);
    });
  });

  describe('hasAutoFocus prop', () => {
    it('sets autofocus attribute when hasAutoFocus is true', () => {
      render(
        <TextArea
          label="Description"
          value=""
          onChange={() => {}}
          hasAutoFocus
        />,
      );
      expect(screen.getByRole('textbox')).toHaveFocus();
    });

    it('does not set autofocus when hasAutoFocus is false', () => {
      render(<TextArea label="Description" value="" onChange={() => {}} />);
      expect(screen.getByRole('textbox')).not.toHaveFocus();
    });
  });

  describe('htmlName prop', () => {
    it('sets name attribute when htmlName is provided', () => {
      render(
        <TextArea
          label="Description"
          value=""
          onChange={() => {}}
          htmlName="description"
        />,
      );
      expect(screen.getByRole('textbox')).toHaveAttribute(
        'name',
        'description',
      );
    });

    it('does not set name attribute when htmlName is not provided', () => {
      render(<TextArea label="Description" value="" onChange={() => {}} />);
      expect(screen.getByRole('textbox')).not.toHaveAttribute('name');
    });
  });

  describe('click-to-focus', () => {
    it('focuses textarea when clicking the start icon', () => {
      render(
        <TextArea
          label="Notes"
          value=""
          onChange={() => {}}
          startIcon={<MagnifyingGlassIcon />}
        />,
      );

      const textarea = screen.getByRole('textbox');
      const wrapper = textarea.parentElement!;
      const iconElement = wrapper.querySelector('svg')!;

      fireEvent.click(iconElement);
      expect(textarea).toHaveFocus();
    });

    it('focuses textarea when clicking the wrapper padding', () => {
      render(<TextArea label="Notes" value="" onChange={() => {}} />);

      const textarea = screen.getByRole('textbox');
      const wrapper = textarea.parentElement!;

      fireEvent.click(wrapper);
      expect(textarea).toHaveFocus();
    });
  });
});
