// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file FileInput.test.tsx
 * @input Uses vitest, @testing-library/react, FileInput component
 * @output Unit tests for FileInput component behavior
 * @position Testing; validates FileInput.tsx implementation
 *
 * SYNC: When FileInput.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, afterEach, beforeEach} from 'vitest';
import {
  render,
  screen,
  fireEvent,
  createEvent,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {FileInput} from './FileInput';
import {__resetLiveRegionsForTest} from '../hooks/useAnnounce';

afterEach(() => {
  __resetLiveRegionsForTest();
});

// Mock showPopover/hidePopover since jsdom does not implement them. Used by the
// disabledMessage tooltip.
beforeEach(() => {
  HTMLElement.prototype.showPopover = vi.fn(function (this: HTMLElement) {
    this.setAttribute('popover-open', '');
    const event = new Event('toggle', {bubbles: false});
    Object.defineProperty(event, 'newState', {value: 'open'});
    this.dispatchEvent(event);
  });
  HTMLElement.prototype.hidePopover = vi.fn(function (this: HTMLElement) {
    this.removeAttribute('popover-open');
    const event = new Event('toggle', {bubbles: false});
    Object.defineProperty(event, 'newState', {value: 'closed'});
    this.dispatchEvent(event);
  });
  const originalMatches = HTMLElement.prototype.matches;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).matches = function (
    selector: string,
  ): boolean {
    if (selector === ':popover-open') {
      return this.hasAttribute('popover-open');
    }
    // jsdom does not resolve :focus-visible for role="button" divs the way a
    // browser does after keyboard focus; treat the active element as
    // focus-visible so the tooltip's keyboard-focus path is exercised.
    if (selector === ':focus-visible') {
      return this === document.activeElement;
    }
    return originalMatches.call(this, selector);
  };
});

// jsdom popover content is in the DOM but may not be "visible" in the
// accessibility tree. Use hidden: true to find it.
const h = {hidden: true} as const;

function politeRegion(): HTMLElement | null {
  return document.querySelector('[data-astryx-live-region="polite"]');
}

function fileInputEl(): HTMLInputElement {
  const el = document.querySelector('input[type="file"]');
  if (!(el instanceof HTMLInputElement)) {
    throw new Error('file input not found');
  }
  return el;
}

function createFile(
  name: string,
  size: number,
  type: string = 'text/plain',
): File {
  const content = new Uint8Array(size);
  return new File([content], name, {type});
}

describe('FileInput', () => {
  it('renders with label', () => {
    render(<FileInput label="Resume" value={null} onChange={() => {}} />);
    expect(screen.getByText('Resume')).toBeInTheDocument();
  });

  it('renders default placeholder for single file', () => {
    render(<FileInput label="File" value={null} onChange={() => {}} />);
    expect(screen.getByText('Choose file')).toBeInTheDocument();
  });

  it('renders default placeholder for multiple files', () => {
    render(
      <FileInput label="Files" value={null} onChange={() => {}} isMultiple />,
    );
    expect(screen.getByText('Choose files')).toBeInTheDocument();
  });

  it('renders custom placeholder', () => {
    render(
      <FileInput
        label="Upload"
        value={null}
        onChange={() => {}}
        placeholder="Drop here"
      />,
    );
    expect(screen.getByText('Drop here')).toBeInTheDocument();
  });

  it('displays selected file name', () => {
    const file = createFile('report.pdf', 1024, 'application/pdf');
    render(<FileInput label="Document" value={file} onChange={() => {}} />);
    expect(screen.getByText('report.pdf')).toBeInTheDocument();
  });

  it('displays multiple file names', () => {
    const files = [createFile('a.txt', 100), createFile('b.txt', 200)];
    render(
      <FileInput label="Files" value={files} onChange={() => {}} isMultiple />,
    );
    expect(screen.getByText('a.txt, b.txt')).toBeInTheDocument();
  });

  it('forwards ref to the native input', () => {
    const ref = vi.fn();
    render(
      <FileInput ref={ref} label="Upload" value={null} onChange={() => {}} />,
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
  });

  it('visually hides label when isLabelHidden is true', () => {
    render(
      <FileInput
        label="Upload"
        isLabelHidden
        value={null}
        onChange={() => {}}
      />,
    );
    expect(screen.getByText('Upload')).toBeInTheDocument();
  });

  it('sets aria-required when isRequired is true', () => {
    render(
      <FileInput label="Resume" isRequired value={null} onChange={() => {}} />,
    );
    // aria-required lives on the focusable role="button" wrapper, not the
    // hidden file input (forms-6).
    expect(screen.getByRole('button', {name: 'Resume'})).toHaveAttribute(
      'aria-required',
      'true',
    );
  });

  it('places aria-describedby on the focusable button, not the hidden input (forms-6)', () => {
    render(
      <FileInput
        label="Resume"
        description="PDF only"
        value={null}
        onChange={() => {}}
      />,
    );
    const button = screen.getByRole('button', {name: 'Resume'});
    expect(button).toHaveAttribute('aria-describedby');
    // The hidden file input no longer carries the describedby/required/invalid.
    const input = document.querySelector('input[type="file"]')!;
    expect(input).not.toHaveAttribute('aria-describedby');
    expect(input).toHaveAttribute('aria-hidden', 'true');
  });

  it('does not set aria-required by default', () => {
    render(<FileInput label="Resume" value={null} onChange={() => {}} />);
    expect(screen.getByRole('button', {name: 'Resume'})).not.toHaveAttribute(
      'aria-required',
    );
  });

  it('sets disabled attribute when isDisabled is true', () => {
    render(
      <FileInput label="Upload" isDisabled value={null} onChange={() => {}} />,
    );
    const input = document.querySelector('input[type="file"]')!;
    expect(input).toBeDisabled();
  });

  it('sets aria-invalid when status type is error', () => {
    render(
      <FileInput
        label="Upload"
        value={null}
        onChange={() => {}}
        status={{type: 'error', message: 'Something went wrong'}}
      />,
    );
    expect(screen.getByRole('button', {name: 'Upload'})).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('does not set aria-invalid for warning status', () => {
    render(
      <FileInput
        label="Upload"
        value={null}
        onChange={() => {}}
        status={{type: 'warning'}}
      />,
    );
    expect(screen.getByRole('button', {name: 'Upload'})).not.toHaveAttribute(
      'aria-invalid',
    );
  });

  it('renders status message when provided', () => {
    render(
      <FileInput
        label="Upload"
        value={null}
        onChange={() => {}}
        status={{type: 'error', message: 'File too large'}}
      />,
    );
    expect(screen.getByText('File too large')).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(
      <FileInput
        label="Upload"
        value={null}
        onChange={() => {}}
        description="Max 5MB"
      />,
    );
    expect(screen.getByText('Max 5MB')).toBeInTheDocument();
  });

  describe('file selection via native input', () => {
    it('calls onChange when a file is selected', () => {
      const handleChange = vi.fn();
      render(<FileInput label="Upload" value={null} onChange={handleChange} />);
      const input = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      const file = createFile('test.txt', 100);
      fireEvent.change(input, {target: {files: [file]}});
      expect(handleChange).toHaveBeenCalledWith(file);
    });

    it('calls onChange with File[] when isMultiple', () => {
      const handleChange = vi.fn();
      render(
        <FileInput
          label="Upload"
          value={null}
          onChange={handleChange}
          isMultiple
        />,
      );
      const input = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      const files = [createFile('a.txt', 100), createFile('b.txt', 200)];
      fireEvent.change(input, {target: {files}});
      expect(handleChange).toHaveBeenCalledWith(files);
    });

    it('sets accept attribute on native input', () => {
      render(
        <FileInput
          label="Upload"
          value={null}
          onChange={() => {}}
          accept=".pdf,.doc"
        />,
      );
      const input = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      expect(input).toHaveAttribute('accept', '.pdf,.doc');
    });

    it('sets multiple attribute when isMultiple', () => {
      render(
        <FileInput
          label="Upload"
          value={null}
          onChange={() => {}}
          isMultiple
        />,
      );
      const input = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      expect(input).toHaveAttribute('multiple');
    });
  });

  describe('announcements', () => {
    it('announces a single file selection politely', async () => {
      render(<FileInput label="Upload" value={null} onChange={() => {}} />);
      fireEvent.change(fileInputEl(), {
        target: {files: [createFile('report.pdf', 100)]},
      });
      await waitFor(() => {
        expect(politeRegion()).toHaveTextContent('1 file selected: report.pdf');
      });
    });

    it('announces a multi-file count politely', async () => {
      render(
        <FileInput
          label="Upload"
          value={null}
          onChange={() => {}}
          isMultiple
        />,
      );
      const files = [
        createFile('a.txt', 100),
        createFile('b.txt', 200),
        createFile('c.txt', 300),
      ];
      fireEvent.change(fileInputEl(), {target: {files}});
      await waitFor(() => {
        expect(politeRegion()).toHaveTextContent('3 files selected');
      });
    });

    it('does not announce a selection when validation rejects all files', async () => {
      render(
        <FileInput
          label="Upload"
          value={null}
          onChange={() => {}}
          accept=".pdf"
        />,
      );
      fireEvent.change(fileInputEl(), {
        target: {files: [createFile('note.txt', 100)]},
      });
      // A rejected selection announces nothing politely. (The region pair may
      // exist because the validation error itself is announced assertively via
      // FieldStatus, but the polite channel must stay empty.)
      expect(politeRegion()?.textContent ?? '').toBe('');
    });
  });

  describe('validation', () => {
    it('rejects files exceeding maxSize', () => {
      const handleChange = vi.fn();
      render(
        <FileInput
          label="Upload"
          value={null}
          onChange={handleChange}
          maxSize={1024}
        />,
      );
      const input = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      const largeFile = createFile('big.txt', 2048);
      fireEvent.change(input, {target: {files: [largeFile]}});
      expect(handleChange).toHaveBeenCalledWith(null);
    });

    it('accepts files within maxSize', () => {
      const handleChange = vi.fn();
      render(
        <FileInput
          label="Upload"
          value={null}
          onChange={handleChange}
          maxSize={1024}
        />,
      );
      const input = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      const file = createFile('small.txt', 512);
      fireEvent.change(input, {target: {files: [file]}});
      expect(handleChange).toHaveBeenCalledWith(file);
    });

    it('limits files to maxFiles', () => {
      const handleChange = vi.fn();
      render(
        <FileInput
          label="Upload"
          value={null}
          onChange={handleChange}
          isMultiple
          maxFiles={2}
        />,
      );
      const input = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      const files = [
        createFile('a.txt', 100),
        createFile('b.txt', 100),
        createFile('c.txt', 100),
      ];
      fireEvent.change(input, {target: {files}});
      expect(handleChange).toHaveBeenCalledWith([
        expect.objectContaining({name: 'a.txt'}),
        expect.objectContaining({name: 'b.txt'}),
      ]);
    });

    it('rejects files with non-matching accept types', () => {
      const handleChange = vi.fn();
      render(
        <FileInput
          label="Upload"
          value={null}
          onChange={handleChange}
          accept=".pdf"
        />,
      );
      const input = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      const file = createFile('image.png', 100, 'image/png');
      fireEvent.change(input, {target: {files: [file]}});
      expect(handleChange).toHaveBeenCalledWith(null);
    });

    it('accepts files matching wildcard accept types', () => {
      const handleChange = vi.fn();
      render(
        <FileInput
          label="Upload"
          value={null}
          onChange={handleChange}
          accept="image/*"
        />,
      );
      const input = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      const file = createFile('photo.jpg', 100, 'image/jpeg');
      fireEvent.change(input, {target: {files: [file]}});
      expect(handleChange).toHaveBeenCalledWith(file);
    });
  });

  describe('clear button', () => {
    it('shows clear button when files are selected', () => {
      const file = createFile('test.txt', 100);
      render(<FileInput label="Upload" value={file} onChange={() => {}} />);
      expect(
        screen.getByRole('button', {name: 'Clear Upload'}),
      ).toBeInTheDocument();
    });

    it('does not show clear button when no files selected', () => {
      render(<FileInput label="Upload" value={null} onChange={() => {}} />);
      expect(
        screen.queryByRole('button', {name: 'Clear Upload'}),
      ).not.toBeInTheDocument();
    });

    it('does not show clear button when disabled', () => {
      const file = createFile('test.txt', 100);
      render(
        <FileInput
          label="Upload"
          value={file}
          onChange={() => {}}
          isDisabled
        />,
      );
      expect(
        screen.queryByRole('button', {name: 'Clear Upload'}),
      ).not.toBeInTheDocument();
    });

    it('calls onChange with null when clear is clicked', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const file = createFile('test.txt', 100);
      render(<FileInput label="Upload" value={file} onChange={handleChange} />);
      await user.click(screen.getByRole('button', {name: 'Clear Upload'}));
      expect(handleChange).toHaveBeenCalledWith(null);
    });

    it('does not show clear button during loading', () => {
      const file = createFile('test.txt', 100);
      render(
        <FileInput label="Upload" value={file} onChange={() => {}} isLoading />,
      );
      expect(
        screen.queryByRole('button', {name: 'Clear Upload'}),
      ).not.toBeInTheDocument();
    });
  });

  describe('drag and drop', () => {
    it('calls onChange when files are dropped in dropzone mode', () => {
      const handleChange = vi.fn();
      render(
        <FileInput
          label="Upload"
          value={null}
          onChange={handleChange}
          mode="dropzone"
        />,
      );
      const dropzone = screen.getByRole('button', {name: 'Upload'});
      const file = createFile('dropped.txt', 100);
      fireEvent.drop(dropzone, {
        dataTransfer: {files: [file]},
      });
      expect(handleChange).toHaveBeenCalledWith(file);
    });

    it('does not handle drop in input mode', () => {
      const handleChange = vi.fn();
      render(<FileInput label="Upload" value={null} onChange={handleChange} />);
      const dropzone = screen.getByRole('button', {name: 'Upload'});
      const file = createFile('dropped.txt', 100);
      fireEvent.drop(dropzone, {
        dataTransfer: {files: [file]},
      });
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('does not handle drop when disabled', () => {
      const handleChange = vi.fn();
      render(
        <FileInput
          label="Upload"
          value={null}
          onChange={handleChange}
          mode="dropzone"
          isDisabled
        />,
      );
      const dropzone = screen.getByRole('button', {name: 'Upload'});
      const file = createFile('dropped.txt', 100);
      fireEvent.drop(dropzone, {
        dataTransfer: {files: [file]},
      });
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('keyboard interaction', () => {
    it('opens file picker on Enter key', () => {
      render(<FileInput label="Upload" value={null} onChange={() => {}} />);
      const dropzone = screen.getByRole('button', {name: 'Upload'});
      const input = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      const clickSpy = vi.spyOn(input, 'click');
      fireEvent.keyDown(dropzone, {key: 'Enter'});
      expect(clickSpy).toHaveBeenCalled();
      clickSpy.mockRestore();
    });

    it('opens file picker on Space key', () => {
      render(<FileInput label="Upload" value={null} onChange={() => {}} />);
      const dropzone = screen.getByRole('button', {name: 'Upload'});
      const input = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      const clickSpy = vi.spyOn(input, 'click');
      fireEvent.keyDown(dropzone, {key: ' '});
      expect(clickSpy).toHaveBeenCalled();
      clickSpy.mockRestore();
    });
  });

  describe('dropzone mode', () => {
    it('renders in dropzone mode', () => {
      render(
        <FileInput
          label="Upload"
          value={null}
          onChange={() => {}}
          mode="dropzone"
        />,
      );
      expect(screen.getByText('Choose file')).toBeInTheDocument();
    });

    it('keeps the drag-over state while dragging over the dropzone children', () => {
      render(
        <FileInput
          label="Upload"
          value={null}
          onChange={() => {}}
          mode="dropzone"
        />,
      );
      const dropzone = screen.getByRole('button', {name: 'Upload'});
      fireEvent.dragEnter(dropzone);
      expect(screen.getByText('Drop files here')).toBeInTheDocument();

      // Moving from the container onto one of its own children fires a
      // dragleave on the container with the child as relatedTarget — the
      // highlight must not flicker off while still inside the dropzone.
      // (jsdom's DragEvent init drops relatedTarget, so set it directly.)
      const child = screen.getByText('Drop files here');
      const leaveToChild = createEvent.dragLeave(dropzone);
      Object.defineProperty(leaveToChild, 'relatedTarget', {value: child});
      fireEvent(dropzone, leaveToChild);
      expect(screen.getByText('Drop files here')).toBeInTheDocument();

      // Actually leaving the dropzone ends the drag-over state.
      const leaveToOutside = createEvent.dragLeave(dropzone);
      Object.defineProperty(leaveToOutside, 'relatedTarget', {
        value: document.body,
      });
      fireEvent(dropzone, leaveToOutside);
      expect(screen.queryByText('Drop files here')).not.toBeInTheDocument();
      expect(screen.getByText('Choose file')).toBeInTheDocument();
    });

    it('displays file name in dropzone mode', () => {
      const file = createFile('doc.pdf', 100, 'application/pdf');
      render(
        <FileInput
          label="Upload"
          value={file}
          onChange={() => {}}
          mode="dropzone"
        />,
      );
      expect(screen.getByText('doc.pdf')).toBeInTheDocument();
    });
  });

  describe('trigger accessible name', () => {
    it('includes the selected file name in the trigger name', () => {
      const file = createFile('report.pdf', 1024, 'application/pdf');
      render(<FileInput label="Document" value={file} onChange={() => {}} />);
      expect(
        screen.getByRole('button', {name: 'Document, report.pdf'}),
      ).toBeInTheDocument();
    });

    it('includes all selected file names when multiple files are selected', () => {
      const files = [createFile('a.txt', 100), createFile('b.txt', 200)];
      render(
        <FileInput
          label="Files"
          value={files}
          onChange={() => {}}
          isMultiple
        />,
      );
      expect(
        screen.getByRole('button', {name: 'Files, a.txt, b.txt'}),
      ).toBeInTheDocument();
    });

    it('uses exactly the label when no files are selected', () => {
      render(<FileInput label="Document" value={null} onChange={() => {}} />);
      expect(screen.getByRole('button', {name: 'Document'})).toHaveAttribute(
        'aria-label',
        'Document',
      );
    });

    it('includes the selected file name in dropzone mode', () => {
      const file = createFile('doc.pdf', 100, 'application/pdf');
      render(
        <FileInput
          label="Upload"
          value={file}
          onChange={() => {}}
          mode="dropzone"
        />,
      );
      expect(
        screen.getByRole('button', {name: 'Upload, doc.pdf'}),
      ).toBeInTheDocument();
    });
  });

  describe('data-testid', () => {
    it('passes data-testid to native input', () => {
      render(
        <FileInput
          label="Upload"
          value={null}
          onChange={() => {}}
          data-testid="file-upload"
        />,
      );
      const input = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      expect(input).toHaveAttribute('data-testid', 'file-upload');
    });
  });

  describe('disabledMessage', () => {
    it('shows the reason tooltip on hover when disabled with a reason', async () => {
      render(
        <FileInput
          label="Resume"
          value={null}
          onChange={() => {}}
          isDisabled
          disabledMessage="You need the Editor role"
        />,
      );

      const trigger = screen.getByRole('button');
      const tooltip = screen.getByRole('tooltip', h);
      expect(tooltip).toHaveTextContent('You need the Editor role');

      fireEvent.mouseEnter(trigger);
      await waitFor(() => {
        expect(tooltip).toHaveAttribute('popover-open');
      });

      fireEvent.mouseLeave(trigger);
      await waitFor(() => {
        expect(tooltip).not.toHaveAttribute('popover-open');
      });
    });

    it('shows the reason tooltip on keyboard focus', async () => {
      const user = userEvent.setup();
      render(
        <FileInput
          label="Resume"
          value={null}
          onChange={() => {}}
          isDisabled
          disabledMessage="You need the Editor role"
        />,
      );

      const tooltip = screen.getByRole('tooltip', h);
      await user.tab();
      expect(screen.getByRole('button')).toHaveFocus();
      await waitFor(() => {
        expect(tooltip).toHaveAttribute('popover-open');
      });
    });

    it('does not render a tooltip when not disabled', () => {
      render(
        <FileInput
          label="Resume"
          value={null}
          onChange={() => {}}
          disabledMessage="You need the Editor role"
        />,
      );
      expect(screen.queryByRole('tooltip', h)).not.toBeInTheDocument();
    });

    it('does not render a tooltip when disabled without a reason', () => {
      render(
        <FileInput
          label="Resume"
          value={null}
          onChange={() => {}}
          isDisabled
        />,
      );
      expect(screen.queryByRole('tooltip', h)).not.toBeInTheDocument();
    });

    it('keeps the trigger focusable via aria-disabled when a reason is provided', () => {
      render(
        <FileInput
          label="Resume"
          value={null}
          onChange={() => {}}
          isDisabled
          disabledMessage="You need the Editor role"
        />,
      );
      const trigger = screen.getByRole('button');
      expect(trigger).toHaveAttribute('aria-disabled', 'true');
      expect(trigger).toHaveAttribute('tabindex', '0');
    });

    it('links the reason tooltip from the trigger via aria-describedby', () => {
      render(
        <FileInput
          label="Resume"
          value={null}
          onChange={() => {}}
          isDisabled
          disabledMessage="You need the Editor role"
        />,
      );
      const trigger = screen.getByRole('button');
      const tooltip = screen.getByRole('tooltip', h);
      expect(trigger.getAttribute('aria-describedby')).toContain(tooltip.id);
    });

    it('blocks opening the file picker while focusable-disabled', async () => {
      const user = userEvent.setup();
      render(
        <FileInput
          label="Resume"
          value={null}
          onChange={() => {}}
          isDisabled
          disabledMessage="You need the Editor role"
        />,
      );

      const trigger = screen.getByRole('button');
      const input = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      const clickSpy = vi.spyOn(input, 'click');

      await user.click(trigger);
      trigger.focus();
      await user.keyboard('{Enter}');
      await user.keyboard(' ');

      expect(clickSpy).not.toHaveBeenCalled();
    });

    it('keeps the trigger non-focusable when disabled without a reason', () => {
      render(
        <FileInput
          label="Resume"
          value={null}
          onChange={() => {}}
          isDisabled
        />,
      );
      const trigger = screen.getByRole('button');
      expect(trigger).toHaveAttribute('tabindex', '-1');
      expect(trigger).not.toHaveAttribute('aria-disabled');
    });
  });
});
