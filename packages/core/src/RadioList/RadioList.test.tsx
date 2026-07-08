// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file RadioList.test.tsx
 * @input Uses vitest, @testing-library/react, RadioList, RadioListItem
 * @output Unit tests for RadioList and RadioListItem behavior
 * @position Testing; validates RadioList.tsx and RadioListItem.tsx implementation
 *
 * SYNC: When RadioList.tsx or RadioListItem.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {RadioList} from './RadioList';
import {RadioListItem} from './RadioListItem';

// Mock showPopover/hidePopover (not implemented in jsdom) so the tooltip layer
// reflects its open state via a `popover-open` attribute the tests can assert.
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
    return originalMatches.call(this, selector);
  };
});

describe('RadioList', () => {
  it('renders with label', () => {
    render(
      <RadioList label="Preference" value="" onChange={() => {}}>
        <RadioListItem label="Option A" value="a" />
      </RadioList>,
    );
    expect(screen.getByText('Preference')).toBeInTheDocument();
  });

  it('renders radio items', () => {
    render(
      <RadioList label="Preference" value="" onChange={() => {}}>
        <RadioListItem label="Option A" value="a" />
        <RadioListItem label="Option B" value="b" />
        <RadioListItem label="Option C" value="c" />
      </RadioList>,
    );
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  it('renders radiogroup role', () => {
    render(
      <RadioList label="Preference" value="" onChange={() => {}}>
        <RadioListItem label="Option A" value="a" />
      </RadioList>,
    );
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });

  it('selects the correct radio based on value prop', () => {
    render(
      <RadioList label="Preference" value="b" onChange={() => {}}>
        <RadioListItem label="Option A" value="a" />
        <RadioListItem label="Option B" value="b" />
        <RadioListItem label="Option C" value="c" />
      </RadioList>,
    );
    const radios = screen.getAllByRole('radio');
    expect(radios[0]).not.toBeChecked();
    expect(radios[1]).toBeChecked();
    expect(radios[2]).not.toBeChecked();
  });

  it('calls onChange with value string when clicking a radio', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <RadioList label="Preference" value="a" onChange={handleChange}>
        <RadioListItem label="Option A" value="a" />
        <RadioListItem label="Option B" value="b" />
      </RadioList>,
    );

    await user.click(screen.getByLabelText('Option B'));
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('b');
  });

  it('calls onChange when clicking on a label', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <RadioList label="Preference" value="a" onChange={handleChange}>
        <RadioListItem label="Option A" value="a" />
        <RadioListItem label="Option B" value="b" />
      </RadioList>,
    );

    await user.click(screen.getByText('Option B'));
    expect(handleChange).toHaveBeenCalledWith('b');
  });

  it('disables all radios when group isDisabled is true', () => {
    render(
      <RadioList label="Preference" value="" onChange={() => {}} isDisabled>
        <RadioListItem label="Option A" value="a" />
        <RadioListItem label="Option B" value="b" />
      </RadioList>,
    );
    const radios = screen.getAllByRole('radio');
    expect(radios[0]).toBeDisabled();
    expect(radios[1]).toBeDisabled();
  });

  it('does not call onChange when group is disabled', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <RadioList label="Preference" value="" onChange={handleChange} isDisabled>
        <RadioListItem label="Option A" value="a" />
      </RadioList>,
    );

    await user.click(screen.getByLabelText('Option A'));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('disables individual item when item isDisabled is true', () => {
    render(
      <RadioList label="Preference" value="" onChange={() => {}}>
        <RadioListItem label="Option A" value="a" />
        <RadioListItem label="Option B" value="b" isDisabled />
      </RadioList>,
    );
    const radios = screen.getAllByRole('radio');
    expect(radios[0]).not.toBeDisabled();
    expect(radios[1]).toBeDisabled();
  });

  it('does not call onChange when individual item is disabled', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <RadioList label="Preference" value="" onChange={handleChange}>
        <RadioListItem label="Option A" value="a" isDisabled />
      </RadioList>,
    );

    await user.click(screen.getByLabelText('Option A'));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('shows Required indicator when isRequired is true', () => {
    render(
      <RadioList label="Preference" value="" onChange={() => {}} isRequired>
        <RadioListItem label="Option A" value="a" />
      </RadioList>,
    );
    expect(screen.getByText(/Required/)).toBeInTheDocument();
  });

  it('shows Optional indicator when isOptional is true', () => {
    render(
      <RadioList label="Preference" value="" onChange={() => {}} isOptional>
        <RadioListItem label="Option A" value="a" />
      </RadioList>,
    );
    expect(screen.getByText(/Optional/)).toBeInTheDocument();
  });

  it('renders error status message', () => {
    render(
      <RadioList
        label="Preference"
        value=""
        onChange={() => {}}
        status={{type: 'error', message: 'Please select an option'}}>
        <RadioListItem label="Option A" value="a" />
      </RadioList>,
    );
    expect(screen.getByText('Please select an option')).toBeInTheDocument();
  });

  it('renders warning status message', () => {
    render(
      <RadioList
        label="Preference"
        value="a"
        onChange={() => {}}
        status={{type: 'warning', message: 'This may change later'}}>
        <RadioListItem label="Option A" value="a" />
      </RadioList>,
    );
    expect(screen.getByText('This may change later')).toBeInTheDocument();
  });

  it('renders success status message', () => {
    render(
      <RadioList
        label="Preference"
        value="a"
        onChange={() => {}}
        status={{type: 'success', message: 'Great choice!'}}>
        <RadioListItem label="Option A" value="a" />
      </RadioList>,
    );
    expect(screen.getByText('Great choice!')).toBeInTheDocument();
  });

  it('sets aria-invalid on radiogroup when status is error', () => {
    render(
      <RadioList
        label="Preference"
        value=""
        onChange={() => {}}
        status={{type: 'error', message: 'Required'}}>
        <RadioListItem label="Option A" value="a" />
      </RadioList>,
    );
    expect(screen.getByRole('radiogroup')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('renders startContent', () => {
    render(
      <RadioList label="Preference" value="" onChange={() => {}}>
        <RadioListItem
          label="Option A"
          value="a"
          startContent={<span data-testid="start">★</span>}
        />
      </RadioList>,
    );
    expect(screen.getByTestId('start')).toBeInTheDocument();
  });

  it('renders endContent', () => {
    render(
      <RadioList label="Preference" value="" onChange={() => {}}>
        <RadioListItem
          label="Option A"
          value="a"
          endContent={<span data-testid="end">Badge</span>}
        />
      </RadioList>,
    );
    expect(screen.getByTestId('end')).toBeInTheDocument();
  });

  it('supports data-testid on RadioList', () => {
    render(
      <RadioList
        label="Preference"
        value=""
        onChange={() => {}}
        data-testid="my-radio-list">
        <RadioListItem label="Option A" value="a" />
      </RadioList>,
    );
    expect(screen.getByTestId('my-radio-list')).toBeInTheDocument();
  });

  it('supports data-testid on RadioListItem', () => {
    render(
      <RadioList label="Preference" value="" onChange={() => {}}>
        <RadioListItem label="Option A" value="a" data-testid="my-radio-item" />
      </RadioList>,
    );
    expect(screen.getByTestId('my-radio-item')).toBeInTheDocument();
  });

  it('visually hides label when isLabelHidden is true', () => {
    render(
      <RadioList
        label="Hidden label"
        isLabelHidden
        value=""
        onChange={() => {}}>
        <RadioListItem label="Option A" value="a" />
      </RadioList>,
    );
    const label = screen.getByText('Hidden label');
    expect(label).toBeInTheDocument();
    // The radiogroup is named by the label element via aria-labelledby (not a
    // duplicated aria-label), so its accessible name is still "Hidden label".
    expect(
      screen.getByRole('radiogroup', {name: 'Hidden label'}),
    ).toBeInTheDocument();
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-labelledby');
    expect(screen.getByRole('radiogroup')).not.toHaveAttribute('aria-label');
  });

  it('renders the group label as a span, not a label element (forms-14)', () => {
    render(
      <RadioList label="Plan" value="" onChange={() => {}}>
        <RadioListItem label="Free" value="free" />
        <RadioListItem label="Pro" value="pro" />
      </RadioList>,
    );
    // A radiogroup's accessible name must not come from a literal `<label>`
    // element — a `<label>` names a single control and can't be associated
    // with a group. It is rendered as a `<span>` and referenced via
    // aria-labelledby (with no orphaned htmlFor).
    const labelEl = screen.getByText('Plan');
    expect(labelEl.tagName).toBe('SPAN');
    expect(labelEl.closest('label')).toBeNull();
    expect(labelEl).not.toHaveAttribute('for');
    const group = screen.getByRole('radiogroup', {name: 'Plan'});
    expect(group.getAttribute('aria-labelledby')).toBe(labelEl.id);
  });

  it('renders description on items', () => {
    render(
      <RadioList label="Preference" value="" onChange={() => {}}>
        <RadioListItem
          label="Option A"
          value="a"
          description="This is option A"
        />
      </RadioList>,
    );
    expect(screen.getByText('This is option A')).toBeInTheDocument();
  });

  it('renders description on the radio list group', () => {
    render(
      <RadioList
        label="Preference"
        description="Choose your preference"
        value=""
        onChange={() => {}}>
        <RadioListItem label="Option A" value="a" />
      </RadioList>,
    );
    expect(screen.getByText('Choose your preference')).toBeInTheDocument();
  });

  it('applies horizontal orientation', () => {
    render(
      <RadioList
        label="Preference"
        value=""
        onChange={() => {}}
        orientation="horizontal">
        <RadioListItem label="Option A" value="a" />
        <RadioListItem label="Option B" value="b" />
      </RadioList>,
    );
    // The radiogroup should exist and contain items
    const radiogroup = screen.getByRole('radiogroup');
    expect(radiogroup).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(2);
  });

  it('sets aria-required on radiogroup when isRequired is true', () => {
    render(
      <RadioList label="Preference" value="" onChange={() => {}} isRequired>
        <RadioListItem label="Option A" value="a" />
      </RadioList>,
    );
    expect(screen.getByRole('radiogroup')).toHaveAttribute(
      'aria-required',
      'true',
    );
  });

  describe('focus management (no-selection tab stop)', () => {
    it('keeps focus on the selected radio when a value is selected', () => {
      render(
        <RadioList label="Preference" value="b" onChange={() => {}}>
          <RadioListItem label="Option A" value="a" />
          <RadioListItem label="Option B" value="b" />
          <RadioListItem label="Option C" value="c" />
        </RadioList>,
      );
      const selected = screen.getByLabelText('Option B');
      // A selected value provides a deterministic native tab stop; focusing it
      // must not be redirected elsewhere.
      selected.focus();
      expect(selected).toHaveFocus();
    });

    it('redirects to the first radio when focus enters an unselected group forward', () => {
      render(
        <>
          <button type="button">before</button>
          <RadioList label="Preference" value="" onChange={() => {}}>
            <RadioListItem label="Option A" value="a" />
            <RadioListItem label="Option B" value="b" />
            <RadioListItem label="Option C" value="c" />
          </RadioList>
        </>,
      );
      const radios = screen.getAllByRole('radio');
      const outside = screen.getByText('before');
      outside.focus();
      // Forward entry: the browser lands on a leading radio; the group keeps the
      // first radio as the deterministic tab stop.
      radios[0].focus();
      expect(radios[0]).toHaveFocus();

      // Landing on a middle radio from outside is normalized to the first.
      outside.focus();
      radios[1].focus();
      expect(radios[0]).toHaveFocus();
    });

    it('redirects to the last radio when focus enters an unselected group backward', () => {
      render(
        <>
          <RadioList label="Preference" value="" onChange={() => {}}>
            <RadioListItem label="Option A" value="a" />
            <RadioListItem label="Option B" value="b" />
            <RadioListItem label="Option C" value="c" />
          </RadioList>
          <button type="button">after</button>
        </>,
      );
      const radios = screen.getAllByRole('radio');
      const outside = screen.getByText('after');
      outside.focus();
      // Backward (Shift+Tab) entry: the browser focuses the last radio; the
      // group keeps it as the deterministic tab stop rather than jumping away.
      radios[radios.length - 1].focus();
      expect(radios[radios.length - 1]).toHaveFocus();
    });

    it('does not hijack focus moving between radios within the group', () => {
      render(
        <RadioList label="Preference" value="" onChange={() => {}}>
          <RadioListItem label="Option A" value="a" />
          <RadioListItem label="Option B" value="b" />
          <RadioListItem label="Option C" value="c" />
        </RadioList>,
      );
      const radios = screen.getAllByRole('radio');
      // Enter the group from outside, then move to a middle radio as arrow-key
      // navigation would. Intra-group movement must not be redirected back.
      radios[0].focus();
      radios[1].focus();
      expect(radios[1]).toHaveFocus();
      radios[2].focus();
      expect(radios[2]).toHaveFocus();
    });

    it('skips disabled radios when choosing the deterministic tab stop', () => {
      render(
        <>
          <button type="button">before</button>
          <RadioList label="Preference" value="" onChange={() => {}}>
            <RadioListItem label="Option A" value="a" isDisabled />
            <RadioListItem label="Option B" value="b" />
            <RadioListItem label="Option C" value="c" />
            <RadioListItem label="Option D" value="d" />
          </RadioList>
        </>,
      );
      const outside = screen.getByText('before');
      const optionB = screen.getByLabelText('Option B');
      const optionC = screen.getByLabelText('Option C');
      // A middle enabled radio (C) entered from outside is normalized to the
      // first *enabled* radio (B) — the disabled Option A is skipped.
      outside.focus();
      optionC.focus();
      expect(optionB).toHaveFocus();
    });
  });

  describe('disabledMessage', () => {
    const h = {hidden: true} as const;

    function renderGroup(props?: {onChange?: (v: string) => void}) {
      return render(
        <RadioList
          label="Plan"
          value="free"
          onChange={props?.onChange ?? (() => {})}
          isDisabled
          disabledMessage="Upgrade your account to change plans">
          <RadioListItem label="Free" value="free" />
          <RadioListItem label="Pro" value="pro" />
        </RadioList>,
      );
    }

    it('shows the reason tooltip on hover when the group is disabled with a reason', async () => {
      renderGroup();
      const tooltip = screen.getByRole('tooltip', h);
      expect(tooltip).toHaveTextContent('Upgrade your account to change plans');
      const group = screen.getByRole('radiogroup');
      fireEvent.mouseEnter(group);
      await waitFor(() => expect(tooltip).toHaveAttribute('popover-open'));
      fireEvent.mouseLeave(group);
      await waitFor(() => expect(tooltip).not.toHaveAttribute('popover-open'));
    });

    it('shows the reason tooltip on keyboard focus', async () => {
      const user = userEvent.setup();
      renderGroup();
      const tooltip = screen.getByRole('tooltip', h);
      await user.tab();
      await waitFor(() => expect(tooltip).toHaveAttribute('popover-open'));
    });

    it('does not render a tooltip when not disabled', () => {
      render(
        <RadioList
          label="Plan"
          value="free"
          onChange={() => {}}
          disabledMessage="Upgrade your account to change plans">
          <RadioListItem label="Free" value="free" />
        </RadioList>,
      );
      expect(screen.queryByRole('tooltip', h)).not.toBeInTheDocument();
    });

    it('does not render a tooltip when disabled without a reason', () => {
      render(
        <RadioList label="Plan" value="free" onChange={() => {}} isDisabled>
          <RadioListItem label="Free" value="free" />
        </RadioList>,
      );
      expect(screen.queryByRole('tooltip', h)).not.toBeInTheDocument();
    });

    it('keeps radios focusable via aria-disabled when a reason is provided', () => {
      renderGroup();
      for (const radio of screen.getAllByRole('radio', h)) {
        expect(radio).not.toBeDisabled();
        expect(radio).toHaveAttribute('aria-disabled', 'true');
      }
    });

    it('links the reason tooltip from the group via aria-describedby', () => {
      renderGroup();
      const group = screen.getByRole('radiogroup');
      const tooltip = screen.getByRole('tooltip', h);
      expect(group.getAttribute('aria-describedby')).toContain(tooltip.id);
    });

    it('blocks selection while focusable-disabled', () => {
      const onChange = vi.fn();
      renderGroup({onChange});
      const pro = screen.getByRole('radio', {name: 'Pro', hidden: true});
      fireEvent.click(pro);
      expect(onChange).not.toHaveBeenCalled();
    });

    it('keeps radios natively disabled when disabled without a reason', () => {
      render(
        <RadioList label="Plan" value="free" onChange={() => {}} isDisabled>
          <RadioListItem label="Free" value="free" />
          <RadioListItem label="Pro" value="pro" />
        </RadioList>,
      );
      for (const radio of screen.getAllByRole('radio', h)) {
        expect(radio).toBeDisabled();
      }
    });
  });
  describe('form participation', () => {
    it('submits the selected value under htmlName', () => {
      const {container} = render(
        <form>
          <RadioList label="Preference" htmlName="pref" value="b" onChange={() => {}}>
            <RadioListItem label="Option A" value="a" />
            <RadioListItem label="Option B" value="b" />
          </RadioList>
        </form>,
      );
      const data = new FormData(container.querySelector('form')!);
      expect(data.get('pref')).toBe('b');
    });

    it('is excluded from form data when disabled, even with a disabledMessage', () => {
      const {container} = render(
        <form>
          <RadioList
            label="Preference"
            htmlName="pref"
            value="a"
            onChange={() => {}}
            isDisabled
            disabledMessage="Locked"
          >
            <RadioListItem label="Option A" value="a" />
          </RadioList>
        </form>,
      );
      expect([...new FormData(container.querySelector('form')!).keys()]).toEqual([]);
    });

    it('keeps working as an isolated group when htmlName is omitted', () => {
      const {container} = render(
        <form>
          <RadioList label="Preference" value="a" onChange={() => {}}>
            <RadioListItem label="Option A" value="a" />
          </RadioList>
        </form>,
      );
      // Auto-generated internal name still groups the radios, but the field
      // name is not part of the public form contract.
      const input = container.querySelector('input[type="radio"]')!;
      expect(input.getAttribute('name')).toBeTruthy();
    });
  });
});
