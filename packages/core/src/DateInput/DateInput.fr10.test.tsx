// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file DateInput.fr10.test.tsx
 * @input Uses vitest, Testing Library, DateInput, FormLayout, and the input-family FR10 test helpers
 * @output Tests that every DateInput surface takes no root styling and routes
 *   base props, container*, and control* to their FR10 targets
 * @position Colocated test for family:input-fields FR10
 */

import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  beforeEach,
  afterEach,
} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {DateInput, type DateInputProps} from './DateInput';
import {FormLayout} from '../FormLayout';
import {expectFieldInputProps} from '../Field/fieldInputFamily.testing';
import {describeFieldInputParts} from '../Field/fieldInputFamily.render-testing';

const SURFACES = [
  ['pointer', 'popover', 'input[role="combobox"]'],
  ['native', 'native', 'input[type="date"]'],
  ['touch', 'bottom-sheet', 'input[role="combobox"]'],
] as const;

// The touch surface's month scroller measures itself and its sheet is a
// modal <dialog>; jsdom implements neither.
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeAll(() => {
  Element.prototype.scrollTo = vi.fn();
  HTMLDialogElement.prototype.showModal = vi.fn(function (
    this: HTMLDialogElement,
  ) {
    this.open = true;
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.open = false;
  });
});

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', MockResizeObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function control(selector: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(selector);
  if (el == null) {
    throw new Error(`no control matching ${selector}`);
  }
  return el;
}

describe('DateInput FR10 styling contract', () => {
  it('has no root styling props and has the container* and control* parts', () => {
    expectFieldInputProps<DateInputProps>();
  });

  it('rejects root xstyle, className, and style at compile time', () => {
    const typeOnly = () => (
      <>
        {/* Control: the same element without root styling compiles. */}
        <DateInput label="L" controlClassName="x" containerClassName="y" />
        {/* @ts-expect-error -- root className is not a DateInput prop (FR10) */}
        <DateInput label="L" className="x" />
        {/* @ts-expect-error -- root style is not a DateInput prop (FR10) */}
        <DateInput label="L" style={{margin: 1}} />
        {/* @ts-expect-error -- root xstyle is not a DateInput prop (FR10) */}
        <DateInput label="L" xstyle={{}} />
      </>
    );
    void typeOnly;
  });
});

for (const [surface, presentation, selector] of SURFACES) {
  describe(`${surface} surface`, () => {
    describeFieldInputParts('DateInput', {
      renderMember: props => (
        <DateInput label="Due" presentation={presentation} {...props} />
      ),
      getControl: () => control(selector),
      inGroup: true,
    });
  });

  describe(`DateInput (${surface}) FR10 details`, () => {
    it('names the control from its label when the caller sets id', () => {
      render(<DateInput label="Due" presentation={presentation} id="due" />);
      expect(control(selector).id).toBe('due');
      expect(document.querySelector('label[for="due"]')).not.toBeNull();
    });

    it("adds a caller's aria-describedby to the component's own", () => {
      render(
        <DateInput
          label="Due"
          description="Pick a weekday"
          presentation={presentation}
          aria-describedby="caller-desc"
        />,
      );
      const ids = control(selector)
        .getAttribute('aria-describedby')
        ?.split(' ');
      expect(ids).toContain('caller-desc');
      expect(ids?.length).toBeGreaterThan(1);
    });

    it('keeps control* on the control box in a horizontal-labels FormLayout', () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      const {container} = render(
        <FormLayout direction="horizontal-labels">
          <DateInput
            label="Due"
            presentation={presentation}
            controlClassName="fr10-control"
          />
        </FormLayout>,
      );
      const box = container.querySelector('.fr10-control');
      expect(box).not.toBeNull();
      expect(box).toContainElement(control(selector));
      expect(box).not.toBe(control(selector));
      vi.restoreAllMocks();
    });
  });
}

describe('DateInput FR10 handler composition', () => {
  it('runs a caller onClick after the pointer field opens its calendar', () => {
    const onClick = vi.fn();
    render(<DateInput label="Due" presentation="popover" onClick={onClick} />);
    const input = screen.getByRole('combobox', {name: 'Due'});
    fireEvent.click(input);
    expect(onClick).toHaveBeenCalledOnce();
    expect(input).toHaveAttribute('aria-expanded', 'true');
  });

  it('runs a caller onKeyDown for keys the field does not consume', () => {
    const onKeyDown = vi.fn();
    render(
      <DateInput label="Due" presentation="popover" onKeyDown={onKeyDown} />,
    );
    fireEvent.keyDown(screen.getByRole('combobox', {name: 'Due'}), {key: 'a'});
    expect(onKeyDown).toHaveBeenCalledOnce();
  });

  it('runs a caller onClick after the touch field opens its sheet', () => {
    const onClick = vi.fn();
    render(
      <DateInput label="Due" presentation="bottom-sheet" onClick={onClick} />,
    );
    const input = screen.getByRole('combobox', {name: 'Due'});
    fireEvent.click(input);
    expect(onClick).toHaveBeenCalledOnce();
    expect(input).toHaveAttribute('aria-expanded', 'true');
  });

  it('runs a caller onBlur on the native field', () => {
    const onBlur = vi.fn();
    render(<DateInput label="Due" presentation="native" onBlur={onBlur} />);
    const input = control('input[type="date"]');
    fireEvent.focus(input);
    fireEvent.blur(input);
    expect(onBlur).toHaveBeenCalledOnce();
  });
});
