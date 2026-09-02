// Copyright (c) Meta Platforms, Inc. and affiliates.

import {beforeEach, describe, it, expect, vi} from 'vitest';
import {act, render, fireEvent} from '@testing-library/react';
import {useEffect, useRef} from 'react';
import {ChatComposer} from './ChatComposer';
import {useChatComposerContext} from './ChatContext';
import {__resetInteractionModalityForTest} from '../utils/interactionModality';

beforeEach(() => {
  __resetInteractionModalityForTest();
});

// The composer body — the elevated surface — is the div that wraps the input
// area (styles.body). A custom `input` slot renders inside the inputArea div,
// so the body is two ancestors up from the slot marker. Walking from a known
// marker keeps this independent of StyleX's generated class names.
function renderBodyClass(elevation?: 'none' | 'low'): string {
  const {container} = render(
    <ChatComposer
      onSubmit={() => {}}
      elevation={elevation}
      input={<div data-testid="composer-input-marker" />}
    />,
  );
  const marker = container.querySelector(
    '[data-testid="composer-input-marker"]',
  )!;
  const inputArea = marker.parentElement!;
  const body = inputArea.parentElement!;
  return body.className;
}

describe('ChatComposer elevation', () => {
  it('applies a distinct body class for each supported level', () => {
    expect(renderBodyClass('none')).not.toBe(renderBodyClass('low'));
  });

  it("defaults to 'low' (preserves the raised look)", () => {
    expect(renderBodyClass(undefined)).toBe(renderBodyClass('low'));
  });
});

describe('ChatComposer focus indication', () => {
  function renderComposer() {
    const result = render(
      <ChatComposer onSubmit={() => {}} value="Ready to send" />,
    );
    const editor = result.container.querySelector<HTMLElement>(
      '[contenteditable="true"]',
    )!;
    const body = editor.parentElement!.parentElement!.parentElement!;
    const sendButton =
      result.container.querySelector<HTMLButtonElement>('button')!;
    return {...result, body, editor, sendButton};
  }

  it('adds the composer ring when keyboard focus enters the editor', () => {
    const {body, editor} = renderComposer();
    const restingClass = body.className;

    fireEvent.keyDown(document, {key: 'Tab'});
    fireEvent.focus(editor);

    expect(body.className).not.toBe(restingClass);
  });

  it('does not add the composer ring when pointer focus enters the editor', () => {
    const {body, editor} = renderComposer();
    const restingClass = body.className;

    fireEvent.pointerDown(editor);
    fireEvent.focus(editor);

    expect(body.className).toBe(restingClass);
  });

  it('shows the composer ring for programmatic editor focus after keyboard input', () => {
    const {body, editor} = renderComposer();
    const restingClass = body.className;

    fireEvent.keyDown(document, {key: 'Tab'});
    act(() => editor.focus());

    expect(body.className).not.toBe(restingClass);
  });

  it('hides the composer ring for programmatic editor focus after pointer input', () => {
    const {body, editor} = renderComposer();
    const restingClass = body.className;

    fireEvent.pointerDown(document.body);
    act(() => editor.focus());

    expect(body.className).toBe(restingClass);
  });

  it('removes the composer ring when the focused editor receives a pointer press', () => {
    const {body, editor} = renderComposer();
    const restingClass = body.className;

    fireEvent.keyDown(document, {key: 'Tab'});
    fireEvent.focus(editor);
    expect(body.className).not.toBe(restingClass);

    fireEvent.pointerDown(editor);
    expect(body.className).toBe(restingClass);
  });

  it('leaves focus indication on an internal button instead of the composer', () => {
    const {body, sendButton} = renderComposer();
    const restingClass = body.className;

    fireEvent.keyDown(document, {key: 'Tab'});
    fireEvent.focus(sendButton);

    expect(body.className).toBe(restingClass);
  });
});

// A custom input that participates in the composer's composition contract:
// reads value/submit from the exported context, and registers a focus control
// so the shell can drive body-click-to-focus without knowing its DOM shape.
function CustomContextInput({focusSpy}: {focusSpy: () => void}) {
  const ctx = useChatComposerContext();
  const ref = useRef<HTMLInputElement>(null);
  const controlRef = ctx?.inputControlRef;
  useEffect(() => {
    if (!controlRef) {
      return;
    }
    controlRef.current = {
      focus: () => {
        focusSpy();
        ref.current?.focus();
      },
    };
    return () => {
      controlRef.current = null;
    };
  }, [controlRef, focusSpy]);
  return (
    <input
      ref={ref}
      data-testid="custom-input"
      value={ctx?.value ?? ''}
      placeholder={ctx?.placeholder}
      disabled={ctx?.isDisabled}
      onChange={e => ctx?.onChange(e.target.value)}
    />
  );
}

describe('ChatComposer input composition contract', () => {
  it('exposes value/onChange/placeholder/isDisabled to a custom input via context', () => {
    const {getByTestId} = render(
      <ChatComposer
        onSubmit={() => {}}
        value="hello"
        placeholder="Say something"
        isDisabled
        input={<CustomContextInput focusSpy={() => {}} />}
      />,
    );
    const input = getByTestId('custom-input') as HTMLInputElement;
    expect(input.value).toBe('hello');
    expect(input.placeholder).toBe('Say something');
    expect(input.disabled).toBe(true);
  });

  it('focuses a custom input via its registered control on body click', () => {
    const focusSpy = vi.fn();
    const {getByTestId} = render(
      <ChatComposer
        onSubmit={() => {}}
        input={<CustomContextInput focusSpy={focusSpy} />}
      />,
    );
    const marker = getByTestId('custom-input');
    const body = marker.parentElement!.parentElement!;
    fireEvent.click(body);
    expect(focusSpy).toHaveBeenCalled();
  });

  it('falls back to focusing a bare textarea when no control is registered', () => {
    const {getByTestId} = render(
      <ChatComposer
        onSubmit={() => {}}
        input={<textarea data-testid="bare-textarea" />}
      />,
    );
    const textarea = getByTestId('bare-textarea') as HTMLTextAreaElement;
    const body = textarea.parentElement!.parentElement!;
    fireEvent.click(body);
    expect(document.activeElement).toBe(textarea);
  });
});
