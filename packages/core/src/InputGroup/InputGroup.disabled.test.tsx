// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file InputGroup.disabled.test.tsx
 * @input InputGroup and its admitted field children, Testing Library user events
 * @output Regression coverage for inherited disabled interaction and form semantics
 * @position InputGroup integration tests; exercises public component composition
 */

import {afterEach, describe, expect, it, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {createRef, type FormEvent} from 'react';
import userEvent from '@testing-library/user-event';
import {InputGroup} from './InputGroup';
import {TextInput} from '../TextInput';
import {NumberInput} from '../NumberInput';
import {Selector} from '../Selector';
import {MultiSelector} from '../MultiSelector';
import {DateInput} from '../DateInput';
import {TimeInput} from '../TimeInput';
import {Typeahead} from '../Typeahead';
import {Button} from '../Button';
import {LayerContentBoundary} from '../Layer/layerScopedContext';

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

afterEach(() => vi.unstubAllGlobals());

describe('InputGroup disabled members', () => {
  it('blocks child typing, paste, callbacks and Actions', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const changeAction = vi.fn();
    render(
      <InputGroup label="Group" isDisabled>
        <TextInput
          label="Text"
          value="kept"
          onChange={onChange}
          changeAction={changeAction}
        />
      </InputGroup>,
    );

    const input = screen.getByRole('textbox', {name: 'Group Text'});
    await user.type(input, 'X');
    await user.paste('pasted');
    expect(onChange).not.toHaveBeenCalled();
    expect(changeAction).not.toHaveBeenCalled();
    expect(input).toHaveValue('kept');
    expect(input).toHaveAttribute('aria-disabled', 'true');
    expect(input).not.toHaveAttribute('disabled');
  });

  it('excludes the child value from FormData and constraint validation', () => {
    render(
      <form aria-label="Example">
        <InputGroup label="Group" isDisabled>
          <TextInput
            label="Text"
            htmlName="probe"
            type="email"
            value="invalid"
            onChange={() => {}}
          />
        </InputGroup>
      </form>,
    );

    const form = screen.getByRole<HTMLFormElement>('form', {name: 'Example'});
    const input = screen.getByRole<HTMLInputElement>('textbox');
    expect(new FormData(form).has('probe')).toBe(false);
    expect(input.willValidate).toBe(false);
    expect(form.checkValidity()).toBe(true);
  });

  it('keeps the same focused input, ref, tab order and composed descriptions across disablement', async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLInputElement>();
    const onChange = vi.fn();
    const onEnter = vi.fn();
    const onKeyDown = vi.fn();
    const onPaste = vi.fn();
    const onSubmit = vi.fn((e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
    });
    function Example({disabled}: {disabled: boolean}) {
      return (
        <form onSubmit={onSubmit}>
          <InputGroup
            label="Group"
            description="Group help"
            isDisabled={disabled}>
            <TextInput
              ref={ref}
              label="Text"
              value="kept"
              onChange={onChange}
              disabledMessage="Editing unavailable"
              aria-describedby="extra"
              onEnter={onEnter}
              onKeyDown={onKeyDown}
              onPaste={onPaste}
            />
          </InputGroup>
          <span id="extra">Caller help</span>
          <button type="button">Next</button>
        </form>
      );
    }
    const {rerender} = render(<Example disabled={false} />);
    const input = screen.getByRole('textbox', {name: 'Group Text'});
    await user.tab();
    expect(input).toHaveFocus();
    rerender(<Example disabled />);
    expect(screen.getByRole('textbox')).toBe(input);
    expect(ref.current).toBe(input);
    expect(input).toHaveFocus();
    expect(input).toHaveAccessibleDescription(
      'Caller help Group help Editing unavailable',
    );
    await user.keyboard('X{Enter}');
    await user.paste('pasted');
    for (const callback of [onChange, onEnter, onKeyDown, onPaste, onSubmit]) {
      expect(callback).not.toHaveBeenCalled();
    }
    await user.tab();
    expect(screen.getByRole('button', {name: 'Next'})).toHaveFocus();
    await user.tab({shift: true});
    expect(input).toHaveFocus();
  });

  it.each([
    {outer: true, inner: false, child: false, disabled: true},
    {outer: false, inner: true, child: false, disabled: true},
    {outer: false, inner: false, child: true, disabled: true},
    {outer: false, inner: false, child: false, disabled: false},
  ])(
    'combines nested group and explicit child state: %j',
    ({outer, inner, child, disabled}) => {
      render(
        <InputGroup label="Outer" isDisabled={outer}>
          <InputGroup label="Inner" isDisabled={inner}>
            <TextInput
              label="Text"
              value="kept"
              isDisabled={child}
              onChange={() => {}}
            />
          </InputGroup>
        </InputGroup>,
      );
      const input = screen.getByRole<HTMLInputElement>('textbox', {
        name: 'Inner Text',
      });
      expect(input.readOnly).toBe(disabled);
      expect(input.getAttribute('aria-disabled')).toBe(
        disabled ? 'true' : null,
      );
    },
  );

  it('restores enabled form participation and preserves read-only and explicit child disablement', () => {
    function Example({disabled}: {disabled: boolean}) {
      return (
        <form aria-label="Example">
          <InputGroup label="Group" isDisabled={disabled}>
            <TextInput
              label="Read only"
              htmlName="readOnly"
              value="kept"
              isReadOnly
            />
            <TextInput
              label="Explicit"
              htmlName="explicit"
              value="omitted"
              isDisabled
            />
          </InputGroup>
        </form>
      );
    }
    const {rerender} = render(<Example disabled />);
    const form = screen.getByRole<HTMLFormElement>('form');
    expect([...new FormData(form)]).toEqual([]);
    rerender(<Example disabled={false} />);
    expect([...new FormData(form)]).toEqual([['readOnly', 'kept']]);
    expect(
      screen.getByRole('textbox', {name: 'Group Read only'}),
    ).toHaveAttribute('readonly');
    expect(
      screen.getByRole('textbox', {name: 'Group Explicit'}),
    ).toHaveAttribute('aria-disabled', 'true');
  });

  it.each(['single', 'multiple'] as const)(
    'blocks %s selector opening and excludes its form value',
    async kind => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const changeAction = vi.fn();
      render(
        <form aria-label="Example">
          <InputGroup label="Group" isDisabled>
            {kind === 'single' ? (
              <Selector
                label="Fruit"
                options={['Apple', 'Banana']}
                value="Apple"
                htmlName="fruit"
                onChange={onChange}
                changeAction={changeAction}
              />
            ) : (
              <MultiSelector
                label="Fruit"
                options={['Apple', 'Banana']}
                value={['Apple']}
                htmlName="fruit"
                onChange={onChange}
                changeAction={changeAction}
              />
            )}
          </InputGroup>
        </form>,
      );
      const input = screen.getByRole('combobox', {name: 'Group Fruit'});
      await user.tab();
      expect(input).toHaveFocus();
      await user.keyboard('{Enter}{ArrowDown} ');
      await user.click(input);
      expect(input).toHaveAttribute('aria-disabled', 'true');
      expect(input).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(onChange).not.toHaveBeenCalled();
      expect(changeAction).not.toHaveBeenCalled();
      expect([
        ...new FormData(screen.getByRole<HTMLFormElement>('form')),
      ]).toEqual([]);
    },
  );

  it.each([false, true])(
    'blocks number edits, steppers and wheel, including formatted form carriers (%s)',
    async formatted => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <form aria-label="Example">
          <InputGroup label="Group" isDisabled>
            <NumberInput
              label="Amount"
              value={2}
              htmlName="amount"
              onChange={onChange}
              hasNumberSteppers
              formatValue={formatted ? n => `$${n}` : undefined}
            />
          </InputGroup>
        </form>,
      );
      const input = screen.getByRole('spinbutton', {name: 'Group Amount'});
      await user.click(input);
      await user.keyboard('3{ArrowUp}{ArrowDown}{Enter}');
      fireEvent.wheel(input, {deltaY: -100});
      for (const button of screen.getAllByRole('button')) {
        await user.click(button);
      }
      await user.tab();
      expect(onChange).not.toHaveBeenCalled();
      expect(input).toHaveAttribute('aria-disabled', 'true');
      expect(input).not.toHaveAttribute('disabled');
      expect([
        ...new FormData(screen.getByRole<HTMLFormElement>('form')),
      ]).toEqual([]);
    },
  );

  it.each(['popover', 'native', 'bottom-sheet'] as const)(
    'projects disablement to DateInput %s',
    async presentation => {
      vi.stubGlobal('ResizeObserver', MockResizeObserver);
      const user = userEvent.setup();
      const onChange = vi.fn();
      const changeAction = vi.fn();
      render(
        <InputGroup label="Group" isDisabled>
          <DateInput
            label="Date"
            value="2026-10-15"
            presentation={presentation}
            onChange={onChange}
            changeAction={changeAction}
          />
        </InputGroup>,
      );
      const input = screen.getByLabelText('Group Date');
      await user.tab();
      if (presentation === 'popover') {
        // The calendar button precedes the input in the enabled tab order too.
        expect(
          screen.getByRole('button', {name: 'Open calendar'}),
        ).toHaveFocus();
        await user.tab();
      }
      expect(input).toHaveFocus();
      await user.keyboard('{ArrowUp}{Alt>}{ArrowDown}{/Alt}{Enter}');
      await user.click(screen.getByRole('button', {name: 'Open calendar'}));
      expect(input).toHaveAttribute('aria-disabled', 'true');
      expect(input).not.toHaveAttribute('disabled');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(onChange).not.toHaveBeenCalled();
      expect(changeAction).not.toHaveBeenCalled();
    },
  );

  it.each(['text-input', 'native', 'bottom-sheet'] as const)(
    'projects disablement to TimeInput %s',
    async presentation => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const changeAction = vi.fn();
      render(
        <InputGroup label="Group" isDisabled>
          <TimeInput
            label="Time"
            data-testid="time"
            presentation={presentation}
            onChange={onChange}
            changeAction={changeAction}
          />
        </InputGroup>,
      );
      const input = screen.getByTestId('time');
      await user.tab();
      expect(input).toHaveFocus();
      await user.keyboard('1200{ArrowUp}{Enter}');
      await user.click(input);
      expect(input).toHaveAttribute('aria-disabled', 'true');
      expect(input).not.toHaveAttribute('disabled');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(onChange).not.toHaveBeenCalled();
      expect(changeAction).not.toHaveBeenCalled();
    },
  );

  it('passes group disablement to the Typeahead engine without changing its own policy', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onChangeQuery = vi.fn();
    const searchSource = {
      search: () => [{id: 'apple', label: 'Apple'}],
      bootstrap: () => [{id: 'apple', label: 'Apple'}],
    };
    render(
      <InputGroup label="Group" isDisabled>
        <Typeahead
          label="Fruit"
          value={null}
          searchSource={searchSource}
          onChange={onChange}
          onChangeQuery={onChangeQuery}
        />
      </InputGroup>,
    );
    await user.type(
      screen.getByRole('combobox', {name: 'Group Fruit'}),
      'Apple',
    );
    expect(onChange).not.toHaveBeenCalled();
    expect(onChangeQuery).not.toHaveBeenCalled();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('blocks Button addon callbacks and Actions', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const clickAction = vi.fn();
    render(
      <InputGroup label="Group" isDisabled>
        <TextInput label="Text" value="kept" />
        <Button label="Save" onClick={onClick} clickAction={clickAction} />
      </InputGroup>,
    );
    await user.click(screen.getByRole('button', {name: 'Save'}));
    expect(onClick).not.toHaveBeenCalled();
    expect(clickAction).not.toHaveBeenCalled();
  });

  it('does not clone caller slots or disable unrelated siblings and layer content', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onClick = vi.fn();
    function WrappedInput() {
      return (
        <>
          <TextInput label="Wrapped" value="" onChange={onChange} />
          <span>Wrapped addon</span>
        </>
      );
    }
    render(
      <>
        <InputGroup label="Group" isDisabled>
          <WrappedInput />
          <button type="button" onClick={onClick}>
            Caller slot
          </button>
          <LayerContentBoundary>
            <TextInput label="Layer field" value="" onChange={onChange} />
            <InputGroup label="Local" isDisabled>
              <TextInput label="Child" value="" />
            </InputGroup>
          </LayerContentBoundary>
        </InputGroup>
        <TextInput label="Sibling" value="" onChange={onChange} />
      </>,
    );
    const wrapped = screen.getByRole('textbox', {name: 'Group Wrapped'});
    expect(wrapped).toHaveAttribute('aria-disabled', 'true');
    await user.type(wrapped, 'X');
    expect(onChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', {name: 'Caller slot'}));
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.getByRole('textbox', {name: 'Local Child'})).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    for (const name of ['Layer field', 'Sibling']) {
      const input = screen.getByRole('textbox', {name});
      expect(input).not.toHaveAttribute('aria-disabled');
      await user.type(input, 'X');
    }
    expect(onChange).toHaveBeenCalledTimes(2);
  });
});
