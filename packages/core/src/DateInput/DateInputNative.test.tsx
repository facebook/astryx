// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file DateInputNative.test.tsx
 * @input Uses vitest, @testing-library/react, DateInput, useNativeDatePicker
 * @output Unit tests for DateInput's native (browser/OS) date picker mode
 * @position Testing; validates the `nativePicker` prop and the coarse-pointer
 *   switch in useNativeDatePicker.ts
 *
 * Kept out of DateInput.test.tsx because every test here replaces the global
 * matchMedia to claim a touch device; the main suite asserts the pointer-based
 * default (the Calendar popover) and must keep the setup polyfill.
 *
 * SYNC: When DateInput.tsx or useNativeDatePicker.ts changes, update tests to
 * match new behavior
 */

import {describe, it, expect, vi, afterEach} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {getButton, queryButton} from '../__tests__/fastRoleQueries';
import {DateInput} from './DateInput';
import {supportsNativeDateInput} from './useNativeDatePicker';
import {InternationalizationProvider} from '../i18n';

/**
 * Point `(pointer: coarse)` at a touch or mouse device, keeping the setup
 * polyfill's `(hover: hover) === true` answer for every other query so
 * hover-gated behavior elsewhere in the tree stays alive.
 */
function stubPointer(isCoarse: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: /pointer:\s*coarse/.test(query)
      ? isCoarse
      : /hover:\s*hover/.test(query),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }));
}

/** The field itself — role varies by mode, so query the tag. */
function getInput(): HTMLInputElement {
  const input = document.querySelector('input');
  if (!input) {
    throw new Error('DateInput rendered no input element');
  }
  return input;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('DateInput native picker', () => {
  // ===========================================================================
  // Which control renders
  // ===========================================================================

  it('renders a native date control on a touch device', () => {
    stubPointer(true);
    render(<DateInput label="Date" onChange={() => {}} />);

    const input = getInput();
    expect(input).toHaveAttribute('type', 'date');
    // The native control is not a combobox — it owns its own picker, so the
    // popup-expansion ARIA of the text variant would be a lie.
    expect(input).not.toHaveAttribute('role', 'combobox');
    expect(input).not.toHaveAttribute('aria-expanded');
    expect(input).not.toHaveAttribute('aria-haspopup');
  });

  it('renders the text field with a calendar popover on a mouse device', () => {
    stubPointer(false);
    render(<DateInput label="Date" onChange={() => {}} />);

    const input = getInput();
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('role', 'combobox');
  });

  it('keeps the calendar popover on touch when nativePicker is "never"', () => {
    stubPointer(true);
    render(<DateInput label="Date" nativePicker="never" onChange={() => {}} />);

    expect(getInput()).toHaveAttribute('type', 'text');
  });

  it('treats an explicit nativePicker="touch" as the default', () => {
    stubPointer(true);
    render(<DateInput label="Date" nativePicker="touch" onChange={() => {}} />);

    expect(getInput()).toHaveAttribute('type', 'date');
  });

  it('uses the native control on a mouse device when nativePicker is "always"', () => {
    stubPointer(false);
    render(
      <DateInput label="Date" nativePicker="always" onChange={() => {}} />,
    );

    expect(getInput()).toHaveAttribute('type', 'date');
  });

  it('keeps the calendar popover on touch when dateConstraints are set', () => {
    // A native picker can only express a contiguous min/max range, so an
    // arbitrary per-date predicate has to stay with the Calendar popover.
    stubPointer(true);
    render(
      <DateInput
        label="Date"
        dateConstraints={[date => date.getDay() !== 0]}
        onChange={() => {}}
      />,
    );

    expect(getInput()).toHaveAttribute('type', 'text');
  });

  it('never renders the calendar popover in native mode', () => {
    stubPointer(true);
    render(<DateInput label="Date" onChange={() => {}} />);

    fireEvent.click(getButton('Open calendar'));

    expect(screen.queryByRole('dialog', {hidden: true})).toBeNull();
    // The month grid the popover would mount is absent entirely.
    expect(queryButton('Next month')).toBeNull();
  });

  // ===========================================================================
  // Value round-trip
  // ===========================================================================

  it('keeps the control\u2019s own value ISO', () => {
    stubPointer(true);
    render(
      <DateInput
        label="Date"
        value="2026-01-25"
        format="date_long"
        onChange={() => {}}
      />,
    );

    // ISO is the only form the control accepts, and what the picker reads
    // and writes; `format` rides on the overlay instead.
    expect(getInput()).toHaveValue('2026-01-25');
    expect(screen.getByText('January 25, 2026')).toBeInTheDocument();
  });

  it('fires onChange with the ISO date the control reports', () => {
    stubPointer(true);
    const onChange = vi.fn();
    render(<DateInput label="Date" onChange={onChange} />);

    fireEvent.change(getInput(), {target: {value: '2026-03-21'}});

    expect(onChange).toHaveBeenCalledWith('2026-03-21');
  });

  it('fires onChange with undefined when the control is emptied', () => {
    stubPointer(true);
    const onChange = vi.fn();
    render(<DateInput label="Date" value="2026-03-21" onChange={onChange} />);

    fireEvent.change(getInput(), {target: {value: ''}});

    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('forwards min and max to the native control', () => {
    stubPointer(true);
    render(
      <DateInput
        label="Date"
        min="2026-01-01"
        max="2026-12-31"
        onChange={() => {}}
      />,
    );

    const input = getInput();
    expect(input).toHaveAttribute('min', '2026-01-01');
    expect(input).toHaveAttribute('max', '2026-12-31');
  });

  it('refuses a constrained date and announces the rejection', () => {
    stubPointer(true);
    const onChange = vi.fn();
    render(
      <DateInput
        label="Date"
        nativePicker="always"
        // 2026-03-22 is a Sunday.
        dateConstraints={[date => date.getDay() !== 0]}
        onChange={onChange}
      />,
    );

    fireEvent.change(getInput(), {target: {value: '2026-03-22'}});

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid date');
    expect(getInput()).toHaveAttribute('aria-invalid', 'true');
  });

  it('clears the rejection once an allowed date arrives', () => {
    stubPointer(true);
    const onChange = vi.fn();
    render(
      <DateInput
        label="Date"
        nativePicker="always"
        dateConstraints={[date => date.getDay() !== 0]}
        onChange={onChange}
      />,
    );

    const input = getInput();
    fireEvent.change(input, {target: {value: '2026-03-22'}});
    fireEvent.change(input, {target: {value: '2026-03-23'}});

    expect(onChange).toHaveBeenCalledExactlyOnceWith('2026-03-23');
    expect(screen.getByRole('alert')).toHaveTextContent('');
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('commits a value the engine changed without firing an event', () => {
    // iOS changes a date field's value from inside its picker sheet without
    // always firing an event React observes — its Clear is the case that bit
    // us. React's next render then writes its own stale value back over the
    // engine's, so the clear looks like it did nothing and the old date
    // returns. Assigning `.value` directly is that same silent mutation: it
    // updates React's internal value tracker, so no synthetic change fires.
    stubPointer(true);
    const onChange = vi.fn();
    render(<DateInput label="Date" value="2026-03-21" onChange={onChange} />);

    const input = getInput();
    input.value = '';
    expect(onChange).not.toHaveBeenCalled();

    // Closing the picker blurs the control, which is where we reconcile.
    fireEvent.blur(input);

    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('commits a date the engine set silently', () => {
    stubPointer(true);
    const onChange = vi.fn();
    render(<DateInput label="Date" value="2026-03-21" onChange={onChange} />);

    const input = getInput();
    input.value = '2026-12-25';
    fireEvent.blur(input);

    expect(onChange).toHaveBeenCalledWith('2026-12-25');
  });

  it('stays quiet on blur when nothing changed', () => {
    stubPointer(true);
    const onChange = vi.fn();
    render(<DateInput label="Date" value="2026-03-21" onChange={onChange} />);

    fireEvent.blur(getInput());

    expect(onChange).not.toHaveBeenCalled();
  });

  it('commits an edit React\u2019s synthetic change does not see', () => {
    // The iOS failure, reproduced: the picker edits the field and a native
    // `input` event fires, but React's synthetic `onChange` never runs — so
    // React re-renders and writes its stale value back over the picker's.
    // Assigning `.value` first updates React's internal value tracker, which
    // is what makes React skip the synthetic event; the native listener still
    // sees the real one.
    stubPointer(true);
    const onChange = vi.fn();
    render(<DateInput label="Date" value="2026-03-21" onChange={onChange} />);

    const input = getInput();
    input.value = '2026-03-09';
    input.dispatchEvent(new Event('input', {bubbles: true}));

    expect(onChange).toHaveBeenCalledExactlyOnceWith('2026-03-09');
  });

  it('fires one change when both commit paths see the same edit', () => {
    // React's synthetic change and the native listener both observe an
    // ordinary edit. An async `changeAction` must not run twice for it.
    stubPointer(true);
    const onChange = vi.fn();
    render(<DateInput label="Date" value="2026-03-21" onChange={onChange} />);

    fireEvent.change(getInput(), {target: {value: '2026-03-09'}});

    expect(onChange).toHaveBeenCalledExactlyOnceWith('2026-03-09');
  });

  it('does not write to the control while it has focus', () => {
    // The iOS bug this guards: while the picker sheet is open, ANY
    // programmatic write to the field detaches the sheet from it, and the
    // user's Reset (or pick) silently stops reaching the input. So an
    // external value change must wait until the field is no longer focused.
    stubPointer(true);
    const {rerender} = render(
      <DateInput label="Date" value="2026-03-21" onChange={() => {}} />,
    );
    const input = getInput();

    fireEvent.focus(input);
    rerender(<DateInput label="Date" value="2026-12-25" onChange={() => {}} />);

    expect(input).toHaveValue('2026-03-21');
  });

  it('applies an external value once the control loses focus', () => {
    stubPointer(true);
    const {rerender} = render(
      <DateInput label="Date" value="2026-03-21" onChange={() => {}} />,
    );
    const input = getInput();

    fireEvent.focus(input);
    rerender(<DateInput label="Date" value="2026-12-25" onChange={() => {}} />);
    fireEvent.blur(input);

    expect(input).toHaveValue('2026-12-25');
  });

  it('applies an external value while unfocused', () => {
    stubPointer(true);
    const {rerender} = render(
      <DateInput label="Date" value="2026-03-21" onChange={() => {}} />,
    );

    rerender(<DateInput label="Date" value="2026-12-25" onChange={() => {}} />);

    expect(getInput()).toHaveValue('2026-12-25');
  });

  it('renders the formatted value over the native control', () => {
    // The control's own value stays ISO — that is all it accepts — while
    // `format` rides on the overlay, so a phone reads the same as a desktop.
    stubPointer(true);
    render(
      <DateInput
        label="Date"
        value="2026-01-25"
        format="date_long"
        onChange={() => {}}
      />,
    );

    expect(getInput()).toHaveValue('2026-01-25');
    expect(screen.getByText('January 25, 2026')).toBeInTheDocument();
  });

  it('honours every named format on the native control', () => {
    stubPointer(true);
    const {rerender} = render(
      <DateInput
        label="Date"
        value="2026-01-25"
        format="date"
        onChange={() => {}}
      />,
    );
    expect(screen.getByText('Jan 25, 2026')).toBeInTheDocument();

    rerender(
      <DateInput
        label="Date"
        value="2026-01-25"
        format="date_weekday"
        onChange={() => {}}
      />,
    );
    expect(screen.getByText('Sun, Jan 25, 2026')).toBeInTheDocument();
  });

  it('honours a function format on the native control', () => {
    stubPointer(true);
    render(
      <DateInput
        label="Date"
        value="2026-01-25"
        format={iso => `ships ${iso}`}
        onChange={() => {}}
      />,
    );

    expect(screen.getByText('ships 2026-01-25')).toBeInTheDocument();
  });

  it('swaps the overlay text when a new date is committed', () => {
    stubPointer(true);
    const {rerender} = render(
      <DateInput label="Date" value="2026-01-25" onChange={() => {}} />,
    );
    expect(screen.getByText('January 25, 2026')).toBeInTheDocument();

    rerender(<DateInput label="Date" value="2026-12-25" onChange={() => {}} />);

    expect(screen.getByText('December 25, 2026')).toBeInTheDocument();
    expect(screen.queryByText('January 25, 2026')).toBeNull();
  });

  it('keeps painting the value while a picker-only control has focus', () => {
    // The iOS wheel has no segments to reveal, so `format` holds even with
    // the picker open.
    stubPointer(true);
    render(<DateInput label="Date" value="2026-01-25" onChange={() => {}} />);

    fireEvent.focus(getInput());

    expect(screen.getByText('January 25, 2026')).toBeInTheDocument();
  });

  it('hands the value back to a segment-editable control on focus', () => {
    stubPointer(false);
    render(
      <DateInput
        label="Date"
        nativePicker="always"
        value="2026-01-25"
        onChange={() => {}}
      />,
    );
    const input = getInput();

    fireEvent.focus(input);
    expect(screen.queryByText('January 25, 2026')).toBeNull();

    fireEvent.blur(input);
    expect(screen.getByText('January 25, 2026')).toBeInTheDocument();
  });

  it('hands the value back after a keystroke even on a coarse pointer', () => {
    // The backstop: a Windows tablet reports a coarse pointer while desktop
    // Chrome still renders editable segments. Typing proves segments exist,
    // whatever the pointer said. A picker-only control never gets a keydown.
    stubPointer(true);
    render(<DateInput label="Date" value="2026-01-25" onChange={() => {}} />);
    const input = getInput();

    fireEvent.focus(input);
    expect(screen.getByText('January 25, 2026')).toBeInTheDocument();

    fireEvent.keyDown(input, {key: '3'});

    expect(screen.queryByText('January 25, 2026')).toBeNull();
  });

  it('keeps the value overlay out of the accessibility tree', () => {
    stubPointer(true);
    render(<DateInput label="Date" value="2026-01-25" onChange={() => {}} />);

    expect(screen.getByText('January 25, 2026')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('bounds the overlay so a long date cannot paint past it', () => {
    // The overlay is absolutely positioned, so without an end inset it is
    // shrink-to-fit and a long formatted date runs out of the slot and over
    // whatever follows in the field — measured 24px across the clear button
    // on an iPhone. Both insets keep it inside, and `textOverflow` trims.
    stubPointer(true);
    render(
      <DateInput
        label="Date"
        value="2026-09-30"
        hasClear
        onChange={() => {}}
      />,
    );

    const overlay = screen.getByText('September 30, 2026');
    const classes = new Set(overlay.className.split(/\s+/).filter(Boolean));
    const rules = Array.from(document.styleSheets)
      .flatMap(sheet => {
        try {
          return Array.from(sheet.cssRules);
        } catch {
          return [];
        }
      })
      .map(rule => rule.cssText)
      .filter(text => [...classes].some(cls => text.includes(`.${cls}`)))
      .join(' ');

    expect(rules).toContain('inset-inline-end: 0');
    expect(rules).toContain('text-overflow: ellipsis');
    // `text-overflow` only applies to a BLOCK container: on a flex one a
    // too-long date hard-clips mid-glyph instead (measured identical to
    // `text-overflow: clip` in WebKit and Chromium). Centring then comes
    // from the line box, so the overlay must carry the input's own leading
    // or the text sits ~2.4px high.
    expect(rules).toContain('display: block');
    expect(rules).toContain('line-height: var(--text-body-leading)');
  });

  it('drops the rejection once the field reverts', () => {
    // The refused date is reverted the moment focus leaves, so the field is
    // showing a valid date again. Marking that date invalid — greyed, with
    // `aria-invalid` and a standing "Invalid date" announcement — would be a
    // lie about data the user never chose, and nothing but another edit
    // would clear it.
    stubPointer(true);
    render(
      <DateInput
        label="Date"
        nativePicker="always"
        value="2026-03-23"
        dateConstraints={[date => date.getDay() !== 0]}
        onChange={() => {}}
      />,
    );

    const input = getInput();
    fireEvent.focus(input);
    fireEvent.change(input, {target: {value: '2026-03-22'}}); // a Sunday
    expect(input).toHaveAttribute('aria-invalid', 'true');

    fireEvent.blur(input);

    expect(input).toHaveValue('2026-03-23');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(screen.getByRole('alert')).toHaveTextContent('');
  });

  it('formats the overlay in the provider locale', () => {
    // The overlay runs through the same `formatCommittedValue` as the text
    // variant, so the provider locale reaches the native field too — worth
    // pinning, since the overlay and the locale plumbing arrived separately
    // and nothing else asserts they compose.
    stubPointer(true);
    render(
      <InternationalizationProvider locale="de-DE">
        <DateInput label="Date" value="2026-03-21" onChange={() => {}} />
      </InternationalizationProvider>,
    );

    expect(screen.getByText('21. März 2026')).toBeInTheDocument();
    // The control's own value stays ISO whatever the locale.
    expect(getInput()).toHaveValue('2026-03-21');
  });

  // ===========================================================================
  // Placeholder
  // ===========================================================================

  it('shows the placeholder over an empty native control', () => {
    // The native control has no placeholder of its own — it renders an OS
    // hint (mm/dd/yyyy). DateInput's placeholder takes that space instead.
    stubPointer(true);
    render(<DateInput label="Date" onChange={() => {}} />);

    expect(screen.getByText('Select a date')).toBeInTheDocument();
  });

  it('shows a custom placeholder', () => {
    stubPointer(true);
    render(
      <DateInput
        label="Date"
        placeholder="When does it ship?"
        onChange={() => {}}
      />,
    );

    expect(screen.getByText('When does it ship?')).toBeInTheDocument();
  });

  it('hides the placeholder once a date is set', () => {
    stubPointer(true);
    render(<DateInput label="Date" value="2026-03-21" onChange={() => {}} />);

    expect(screen.queryByText('Select a date')).toBeNull();
  });

  it('brings the placeholder back when the value is cleared', () => {
    stubPointer(true);
    const {rerender} = render(
      <DateInput label="Date" value="2026-03-21" onChange={() => {}} />,
    );
    expect(screen.queryByText('Select a date')).toBeNull();

    rerender(<DateInput label="Date" onChange={() => {}} />);

    expect(screen.getByText('Select a date')).toBeInTheDocument();
  });

  it('holds the placeholder while a picker-only control has focus', () => {
    // On iOS focus IS the picker opening, and an empty focused date control
    // renders only a single space (WebKit's updateInnerTextValue keeps a
    // baseline). There is nothing to yield to, so our placeholder stays.
    stubPointer(true);
    render(<DateInput label="Date" onChange={() => {}} />);
    const input = getInput();

    fireEvent.focus(input);
    expect(screen.getByText('Select a date')).toBeInTheDocument();

    fireEvent.blur(input);
    expect(screen.getByText('Select a date')).toBeInTheDocument();
  });

  it('yields the placeholder to a segment-editable control on focus', () => {
    // A fine-pointer date control is a row of typeable segments; once it has
    // focus the engine owns that text and must be able to show it.
    stubPointer(false);
    render(
      <DateInput label="Date" nativePicker="always" onChange={() => {}} />,
    );
    const input = getInput();

    fireEvent.focus(input);
    expect(screen.queryByText('Select a date')).toBeNull();

    fireEvent.blur(input);
    expect(screen.getByText('Select a date')).toBeInTheDocument();
  });

  it('keeps the placeholder out of the accessibility tree', () => {
    // The field is already named by its label; announcing the placeholder too
    // would just double-speak.
    stubPointer(true);
    render(<DateInput label="Date" onChange={() => {}} />);

    expect(screen.getByText('Select a date')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  // ===========================================================================
  // Toggle button, clear button, disabled state
  // ===========================================================================

  it('asks the browser for its picker from the toggle button', () => {
    stubPointer(true);
    render(<DateInput label="Date" onChange={() => {}} />);

    const input = getInput();
    const showPicker = vi.fn();
    // jsdom implements no picker; attach one so the call is observable.
    (input as HTMLInputElement & {showPicker: () => void}).showPicker =
      showPicker;

    fireEvent.click(getButton('Open calendar'));

    expect(showPicker).toHaveBeenCalledTimes(1);
    expect(input).toHaveFocus();
  });

  it('survives a browser that refuses showPicker', () => {
    stubPointer(true);
    render(<DateInput label="Date" onChange={() => {}} />);

    const input = getInput();
    // Chrome throws NotAllowedError without transient user activation, and
    // InvalidStateError inside a cross-origin iframe. Focus is the fallback.
    (input as HTMLInputElement & {showPicker: () => void}).showPicker = () => {
      throw new DOMException('not allowed', 'NotAllowedError');
    };

    expect(() => fireEvent.click(getButton('Open calendar'))).not.toThrow();
    expect(input).toHaveFocus();
  });

  it('leaves the toggle button in its collapsed label', () => {
    stubPointer(true);
    render(<DateInput label="Date" onChange={() => {}} />);

    fireEvent.click(getButton('Open calendar'));

    // No in-page popover to expand, so the toggle never flips to "Close".
    expect(getButton('Open calendar')).toBeInTheDocument();
    expect(queryButton('Close calendar')).toBeNull();
  });

  it('clears the value from the clear button', () => {
    stubPointer(true);
    const onChange = vi.fn();
    render(
      <DateInput
        label="Date"
        value="2026-03-21"
        hasClear
        onChange={onChange}
      />,
    );

    fireEvent.click(getButton('Clear Date'));

    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('does not take focus back after clearing', () => {
    // Focusing a native date control is what raises the OS picker, so
    // reclaiming focus would pop the wheel the clear tap just dismissed.
    stubPointer(true);
    render(
      <DateInput
        label="Date"
        value="2026-03-21"
        hasClear
        onChange={() => {}}
      />,
    );

    fireEvent.click(getButton('Clear Date'));

    expect(getInput()).not.toHaveFocus();
  });

  it('takes focus back after clearing the text field', () => {
    stubPointer(false);
    render(
      <DateInput
        label="Date"
        value="2026-03-21"
        hasClear
        onChange={() => {}}
      />,
    );

    fireEvent.click(getButton('Clear Date'));

    expect(getInput()).toHaveFocus();
  });

  it('disables the native control and its toggle when isDisabled', () => {
    stubPointer(true);
    render(<DateInput label="Date" isDisabled onChange={() => {}} />);

    expect(getInput()).toBeDisabled();
    expect(getButton('Open calendar')).toBeDisabled();
  });

  it('ignores a change while disabled', () => {
    stubPointer(true);
    const onChange = vi.fn();
    render(
      <DateInput
        label="Date"
        isDisabled
        disabledMessage="Ask an editor"
        onChange={onChange}
      />,
    );

    // With a disabledMessage the field stays focusable via aria-disabled, so
    // the mutation guard is what has to hold.
    fireEvent.change(getInput(), {target: {value: '2026-03-21'}});

    expect(onChange).not.toHaveBeenCalled();
  });

  it('forwards ref to the native control', () => {
    stubPointer(true);
    const ref = vi.fn();
    render(<DateInput ref={ref} label="Date" onChange={() => {}} />);

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
    expect(ref.mock.calls[0][0]).toHaveAttribute('type', 'date');
  });

  it('keeps the field labelled and required-marked', () => {
    stubPointer(true);
    render(<DateInput label="Event date" isRequired onChange={() => {}} />);

    const input = screen.getByLabelText(/Event date/);
    expect(input).toHaveAttribute('type', 'date');
    expect(input).toHaveAttribute('aria-required', 'true');
  });

  // ===========================================================================
  // Feature detection
  // ===========================================================================

  it('treats a browser that ignores type="date" as unsupported', () => {
    const createElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation(
      (tagName: string) => {
        const el = createElement(tagName as 'input');
        if (tagName === 'input') {
          // A browser without date support keeps the field a text input, and
          // a text input holds any value verbatim.
          Object.defineProperty(el, 'type', {
            get: () => 'text',
            configurable: true,
          });
        }
        return el;
      },
    );

    expect(supportsNativeDateInput()).toBe(false);
  });
});
