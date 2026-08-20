// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file InputMask.test.tsx
 * @input Tests InputMask with testing-library + userEvent in jsdom
 * @output Regression coverage for masked typing, caret, paste, a11y (RFC #4946)
 * @position Colocated tests for the InputMask lab component
 *
 * SYNC: When modified, update:
 * - /packages/lab/src/InputMask/InputMask.tsx
 * - /packages/lab/src/InputMask/maskEngine.ts
 */

import {useState} from 'react';
import {act, fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';

import {InputMask, type InputMaskProps} from './InputMask';

// Common shapes from the RFC, as plain patterns — there are no named presets.
const PHONE = {pattern: '(###) ###-####'};
const SSN = {pattern: '###-##-####'};

type HarnessProps = Omit<InputMaskProps, 'value' | 'onChange'> & {
  initialValue?: string;
  onChange?: InputMaskProps['onChange'];
};

function Controlled({initialValue = '', onChange, ...props}: HarnessProps) {
  const [value, setValue] = useState(initialValue);
  return (
    <InputMask
      {...props}
      value={value}
      onChange={(next, e) => {
        setValue(next);
        onChange?.(next, e);
      }}
    />
  );
}

function getInput(label = 'Phone') {
  return screen.getByLabelText(label) as HTMLInputElement;
}

describe('InputMask rendering', () => {
  it('renders a labeled input with numeric inputMode and autocomplete off', () => {
    render(<Controlled mask={PHONE} label="Phone" />);
    const input = getInput();
    expect(input).toHaveAttribute('inputmode', 'numeric');
    expect(input).toHaveAttribute('autocomplete', 'off');
  });

  it('passes an explicit autoComplete through to the input', () => {
    render(
      <Controlled mask={PHONE} label="Phone" autoComplete="tel-national" />,
    );
    expect(getInput()).toHaveAttribute('autocomplete', 'tel-national');
  });
});

describe('InputMask typing', () => {
  it('formats digits as they are typed and inserts literals eagerly', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled mask={PHONE} label="Phone" onChange={onChange} />);
    const input = getInput();

    await user.type(input, '555');

    expect(input).toHaveValue('(555) ');
    expect(onChange.mock.calls.map(call => call[0])).toEqual([
      '5',
      '55',
      '555',
    ]);
    expect(input.selectionStart).toBe(6);
  });

  it('formats a complete phone number', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled mask={PHONE} label="Phone" onChange={onChange} />);
    const input = getInput();

    await user.type(input, '5551234567');

    expect(input).toHaveValue('(555) 123-4567');
    expect(onChange).toHaveBeenLastCalledWith('5551234567', expect.anything());
  });

  it('ignores non-digit keystrokes entirely', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled mask={PHONE} label="Phone" onChange={onChange} />);
    const input = getInput();

    await user.type(input, 'abc');

    expect(input).toHaveValue('');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('ignores digits typed beyond the mask capacity', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Controlled
        mask={PHONE}
        label="Phone"
        initialValue="5551234567"
        onChange={onChange}
      />,
    );
    const input = getInput();

    await user.type(input, '9');

    expect(input).toHaveValue('(555) 123-4567');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('inserts a digit mid-value and keeps the caret after it', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Controlled
        mask={PHONE}
        label="Phone"
        initialValue="555123"
        onChange={onChange}
      />,
    );
    const input = getInput();
    expect(input).toHaveValue('(555) 123-');

    await user.type(input, '9', {
      initialSelectionStart: 2,
      initialSelectionEnd: 2,
    });

    expect(input).toHaveValue('(595) 512-3');
    expect(onChange).toHaveBeenLastCalledWith('5955123', expect.anything());
    expect(input.selectionStart).toBe(3);
  });
});

describe('InputMask deleting', () => {
  it('backspacing over a literal run deletes the digit before it', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Controlled
        mask={PHONE}
        label="Phone"
        initialValue="555123"
        onChange={onChange}
      />,
    );
    const input = getInput();

    await user.type(input, '{Backspace}', {
      initialSelectionStart: 6,
      initialSelectionEnd: 6,
    });

    expect(input).toHaveValue('(551) 23');
    expect(onChange).toHaveBeenLastCalledWith('55123', expect.anything());
    expect(input.selectionStart).toBe(3);
  });

  it('select-all + backspace clears the value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Controlled
        mask={PHONE}
        label="Phone"
        initialValue="555123"
        onChange={onChange}
      />,
    );
    const input = getInput();

    await user.type(input, '{Backspace}', {
      initialSelectionStart: 0,
      initialSelectionEnd: 10,
    });

    expect(input).toHaveValue('');
    expect(onChange).toHaveBeenLastCalledWith('', expect.anything());
  });
});

describe('InputMask paste', () => {
  it('pastes an already-formatted value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled mask={PHONE} label="Phone" onChange={onChange} />);
    const input = getInput();

    await user.click(input);
    await user.paste('(555) 123-4567');

    expect(input).toHaveValue('(555) 123-4567');
    expect(onChange).toHaveBeenLastCalledWith('5551234567', expect.anything());
  });

  it('strips junk from a messy paste and clamps to capacity', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled mask={SSN} label="SSN" onChange={onChange} />);
    const input = getInput('SSN');

    await user.click(input);
    await user.paste('id: 123-45-6789 (verified)');

    expect(input).toHaveValue('123-45-6789');
    expect(onChange).toHaveBeenLastCalledWith('123456789', expect.anything());
  });
});

function describedByTexts(input: HTMLElement): string[] {
  return (input.getAttribute('aria-describedby') ?? '')
    .split(' ')
    .filter(Boolean)
    .map(id => document.getElementById(id)?.textContent ?? '');
}

describe('InputMask a11y & Field', () => {
  it('wires the description and the auto-generated format hint into aria-describedby', () => {
    render(
      <Controlled
        mask={PHONE}
        label="Phone"
        description="Work number preferred"
      />,
    );
    const texts = describedByTexts(getInput());
    expect(texts).toContain('Work number preferred');
    expect(texts).toContain('Format: (555) 555-5555');
  });

  it('accepts a custom format hint text', () => {
    render(
      <Controlled
        mask={SSN}
        label="SSN"
        formatHint="Nine digits, dashes optional"
      />,
    );
    expect(describedByTexts(getInput('SSN'))).toContain(
      'Nine digits, dashes optional',
    );
    expect(screen.queryByText(/^Format:/)).not.toBeInTheDocument();
  });

  it('omits the format hint when formatHint is false', () => {
    render(<Controlled mask={SSN} label="SSN" formatHint={false} />);
    expect(screen.queryByText(/^Format:/)).not.toBeInTheDocument();
  });

  it('shows the remaining mask as an aria-hidden ghost while typing', () => {
    render(<Controlled mask={PHONE} label="Phone" initialValue="555" />);
    const ghost = document.querySelector('[data-inputmask-ghost]');
    expect(ghost?.textContent).toBe('___-____');
    expect(ghost?.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it('ghost shows the full pattern when the value is empty', () => {
    render(<Controlled mask={PHONE} label="Phone" />);
    expect(document.querySelector('[data-inputmask-ghost]')?.textContent).toBe(
      '(___) ___-____',
    );
  });

  it('sets aria-invalid and describes the input by the status message', () => {
    render(
      <Controlled
        mask={PHONE}
        label="Phone"
        status={{type: 'error', message: 'Enter 10 digits'}}
      />,
    );
    const input = getInput();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(
      describedByTexts(input).some(text => text.includes('Enter 10 digits')),
    ).toBe(true);
  });

  it('marks the themed wrapper with the input-mask class', () => {
    const {container} = render(<Controlled mask={PHONE} label="Phone" />);
    expect(container.querySelector('.astryx-input-mask')).not.toBeNull();
  });
});

describe('InputMask states', () => {
  it('disables natively with isDisabled', () => {
    render(<Controlled mask={PHONE} label="Phone" isDisabled />);
    expect(getInput()).toBeDisabled();
  });

  it('stays focusable with a disabledMessage and blocks edits', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Controlled
        mask={PHONE}
        label="Phone"
        isDisabled
        disabledMessage="No editing during sync"
        onChange={onChange}
      />,
    );
    const input = getInput();
    expect(input).not.toBeDisabled();
    expect(input).toHaveAttribute('aria-disabled', 'true');
    await user.type(input, '5');
    expect(input).toHaveValue('');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('blocks edits when read-only', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Controlled
        mask={PHONE}
        label="Phone"
        isReadOnly
        initialValue="555"
        onChange={onChange}
      />,
    );
    const input = getInput();
    expect(input).toHaveAttribute('readonly');
    await user.type(input, '9');
    expect(input).toHaveValue('(555) ');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('clears the value and refocuses via the clear button', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Controlled
        mask={PHONE}
        label="Phone"
        hasClear
        initialValue="5551234567"
        onChange={onChange}
      />,
    );
    await user.click(screen.getByRole('button', {name: /clear phone/i}));
    // The clear path passes null as the event, matching TextInput's contract.
    expect(onChange).toHaveBeenLastCalledWith('', null);
    expect(getInput()).toHaveValue('');
    expect(getInput()).toHaveFocus();
  });

  it('fires onEnter on Enter and passes form plumbing through', async () => {
    const user = userEvent.setup();
    const onEnter = vi.fn();
    render(
      <Controlled
        mask={PHONE}
        label="Phone"
        onEnter={onEnter}
        htmlName="phone"
      />,
    );
    const input = getInput();
    expect(input).toHaveAttribute('name', 'phone');
    await user.type(input, '{Enter}');
    expect(onEnter).toHaveBeenCalledTimes(1);
  });
});

describe('InputMask changeAction', () => {
  it('optimistically shows the typed value while pending and reverts when the parent does not commit', async () => {
    const user = userEvent.setup();
    let resolveAction: () => void = () => {};
    const changeAction = vi.fn(
      () =>
        new Promise<void>(resolve => {
          resolveAction = resolve;
        }),
    );
    render(
      <InputMask
        mask={PHONE}
        label="Phone"
        value=""
        changeAction={changeAction}
      />,
    );
    const input = getInput();

    await user.type(input, '5');

    expect(changeAction).toHaveBeenCalledWith('5', expect.anything());
    expect(input).toHaveValue('(5');
    expect(input).toHaveAttribute('aria-busy', 'true');

    await act(async () => {
      resolveAction();
      await Promise.resolve();
    });

    expect(input).toHaveValue('');
    expect(input).not.toHaveAttribute('aria-busy');
  });

  it('recovers from a rejected action: settles, reports via devError, stays usable', async () => {
    const user = userEvent.setup();
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    let rejectAction: (error: unknown) => void = () => {};
    const changeAction = vi.fn(
      () =>
        new Promise<void>((_, reject) => {
          rejectAction = reject;
        }),
    );
    render(
      <InputMask
        mask={PHONE}
        label="Phone"
        value=""
        changeAction={changeAction}
      />,
    );
    const input = getInput();

    await user.type(input, '5');
    expect(input).toHaveAttribute('aria-busy', 'true');

    await act(async () => {
      rejectAction(new Error('boom'));
      await Promise.resolve();
    });

    expect(input).not.toHaveAttribute('aria-busy');
    expect(input).toHaveValue('');
    expect(
      errorSpy.mock.calls.some(call => String(call[0]).includes('InputMask')),
    ).toBe(true);
    errorSpy.mockRestore();
  });
});

describe('InputMask uncontrolled', () => {
  it('types and formats without value or onChange', async () => {
    const user = userEvent.setup();
    render(<InputMask mask={PHONE} label="Phone" />);
    const input = getInput();

    await user.type(input, '5551234567');

    expect(input).toHaveValue('(555) 123-4567');
  });

  it('seeds from defaultValue and still reports raw digits to onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <InputMask
        mask={PHONE}
        label="Phone"
        defaultValue="555"
        onChange={onChange}
      />,
    );
    const input = getInput();
    expect(input).toHaveValue('(555) ');

    await user.type(input, '123');

    expect(input).toHaveValue('(555) 123-');
    expect(onChange).toHaveBeenLastCalledWith('555123', expect.anything());
  });

  it('a provided value wins over defaultValue and stays authoritative', async () => {
    const user = userEvent.setup();
    render(
      <InputMask
        mask={PHONE}
        label="Phone"
        value="1234567890"
        defaultValue="555"
      />,
    );
    const input = getInput();
    expect(input).toHaveValue('(123) 456-7890');

    await user.type(input, '9', {
      initialSelectionStart: 0,
      initialSelectionEnd: 0,
    });

    expect(input).toHaveValue('(123) 456-7890');
  });

  it('clears via the clear button without an onChange owner', async () => {
    const user = userEvent.setup();
    render(
      <InputMask
        mask={PHONE}
        label="Phone"
        hasClear
        defaultValue="5551234567"
      />,
    );

    await user.click(screen.getByRole('button', {name: /clear phone/i}));

    expect(getInput()).toHaveValue('');
    expect(getInput()).toHaveFocus();
  });

  it('keeps the typed value after changeAction settles and shows busy while pending', async () => {
    const user = userEvent.setup();
    let resolveAction: () => void = () => {};
    const changeAction = vi.fn(
      () =>
        new Promise<void>(resolve => {
          resolveAction = resolve;
        }),
    );
    render(
      <InputMask mask={PHONE} label="Phone" changeAction={changeAction} />,
    );
    const input = getInput();

    await user.type(input, '5');

    expect(changeAction).toHaveBeenCalledWith('5', expect.anything());
    expect(input).toHaveValue('(5');
    expect(input).toHaveAttribute('aria-busy', 'true');

    await act(async () => {
      resolveAction();
      await Promise.resolve();
    });

    expect(input).toHaveValue('(5');
    expect(input).not.toHaveAttribute('aria-busy');
  });
});

describe('InputMask composition', () => {
  it('suspends masking during IME composition and normalizes on compositionend', () => {
    const onChange = vi.fn();
    render(<Controlled mask={PHONE} label="Phone" onChange={onChange} />);
    const input = getInput();

    fireEvent.compositionStart(input);
    fireEvent.change(input, {target: {value: '123abc'}});
    expect(input).toHaveValue('123abc');

    fireEvent.compositionEnd(input, {data: '123abc'});
    expect(input).toHaveValue('(123) ');
    expect(onChange).toHaveBeenLastCalledWith('123', expect.anything());
  });
});
