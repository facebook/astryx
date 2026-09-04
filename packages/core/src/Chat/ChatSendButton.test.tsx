// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ChatSendButton.test.tsx
 * @input Uses vitest, @testing-library/react, the global icon registry
 * @output Unit tests for ChatSendButton
 * @position Colocated unit test; covers the send/stop labels and icons, the
 *   disabled rules, click routing, and the ChatComposer context defaults
 */

import {describe, it, expect, vi, afterEach} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {ChatSendButton} from './ChatSendButton';
import {ChatComposer} from './ChatComposer';
import {Button} from '../Button';
import {registerIcons, resetIcons} from '../Icon';
import {TestIcon} from '../__tests__/TestIcon';
import {declaredValue} from '../__tests__/stylexDeclarations';

describe('ChatSendButton', () => {
  afterEach(() => {
    resetIcons();
  });

  describe('send state', () => {
    it('names the button "Send" from the en message catalog', () => {
      render(<ChatSendButton />);
      expect(screen.getByRole('button')).toHaveAccessibleName('Send');
    });

    it('is disabled with no composer context and no isDisabled prop', () => {
      render(<ChatSendButton />);
      expect(screen.getByRole('button', {name: 'Send'})).toBeDisabled();
    });

    it('is enabled when isDisabled is explicitly false', () => {
      render(<ChatSendButton isDisabled={false} onSend={() => {}} />);
      expect(screen.getByRole('button', {name: 'Send'})).toBeEnabled();
    });

    it('calls onSend when clicked', () => {
      const onSend = vi.fn();
      render(<ChatSendButton isDisabled={false} onSend={onSend} />);
      fireEvent.click(screen.getByRole('button', {name: 'Send'}));
      expect(onSend).toHaveBeenCalledTimes(1);
    });

    it('swallows the click while disabled', () => {
      // isDisabled already defaults true here (no composer context), so this
      // pins the click routing through a disabled Button, not the prop.
      const onSend = vi.fn();
      render(<ChatSendButton onSend={onSend} />);
      fireEvent.click(screen.getByRole('button', {name: 'Send'}));
      expect(onSend).not.toHaveBeenCalled();
    });

    it('styles the send state as a primary button', () => {
      const {container} = render(<ChatSendButton />);
      const send = container.querySelector('button')!;
      const {container: primaryRef} = render(
        <Button
          label="reference"
          variant="primary"
          isIconOnly
          icon={<TestIcon />}
        />,
      );
      const {container: secondaryRef} = render(
        <Button
          label="reference"
          variant="secondary"
          isIconOnly
          icon={<TestIcon />}
        />,
      );
      const primary = declaredValue(
        primaryRef.querySelector('button')!,
        'background-color',
      );
      expect(primary).not.toBeNull();
      expect(
        declaredValue(
          secondaryRef.querySelector('button')!,
          'background-color',
        ),
      ).not.toBe(primary);
      expect(declaredValue(send, 'background-color')).toBe(primary);
    });

    it('resolves its default icon from the registry arrowUp entry', () => {
      registerIcons({
        arrowUp: (
          <svg data-testid="registry-arrow-up">
            <path d="M0 0" />
          </svg>
        ),
      });
      render(<ChatSendButton />);
      expect(screen.getByTestId('registry-arrow-up')).toBeInTheDocument();
    });

    it('renders an explicit sendIcon instead of the registry icon', () => {
      registerIcons({
        arrowUp: (
          <svg data-testid="registry-arrow-up">
            <path d="M0 0" />
          </svg>
        ),
      });
      render(<ChatSendButton sendIcon={<TestIcon data-testid="my-send" />} />);
      expect(screen.getByTestId('my-send')).toBeInTheDocument();
      expect(screen.queryByTestId('registry-arrow-up')).not.toBeInTheDocument();
    });
  });

  describe('stop state', () => {
    it('names the button "Stop" from the en message catalog', () => {
      render(<ChatSendButton isStopShown />);
      expect(screen.getByRole('button')).toHaveAccessibleName('Stop');
    });

    it('stays enabled even when isDisabled is set', () => {
      render(<ChatSendButton isStopShown isDisabled onStop={() => {}} />);
      expect(screen.getByRole('button', {name: 'Stop'})).toBeEnabled();
    });

    it('routes the click to onStop and never to onSend', () => {
      const onSend = vi.fn();
      const onStop = vi.fn();
      render(<ChatSendButton isStopShown onSend={onSend} onStop={onStop} />);
      fireEvent.click(screen.getByRole('button', {name: 'Stop'}));
      expect(onStop).toHaveBeenCalledTimes(1);
      expect(onSend).not.toHaveBeenCalled();
    });

    it('resolves its default icon from the registry stop entry', () => {
      registerIcons({
        stop: (
          <svg data-testid="registry-stop">
            <rect />
          </svg>
        ),
      });
      render(<ChatSendButton isStopShown />);
      expect(screen.getByTestId('registry-stop')).toBeInTheDocument();
    });

    it('renders an explicit stopIcon instead of the registry icon', () => {
      registerIcons({
        stop: (
          <svg data-testid="registry-stop">
            <rect />
          </svg>
        ),
      });
      render(
        <ChatSendButton
          isStopShown
          stopIcon={<TestIcon data-testid="my-stop" />}
        />,
      );
      expect(screen.getByTestId('my-stop')).toBeInTheDocument();
      expect(screen.queryByTestId('registry-stop')).not.toBeInTheDocument();
    });
  });

  describe('inside ChatComposer', () => {
    it('takes canSend and onSubmit from the composer context', () => {
      const onSubmit = vi.fn();
      const {rerender} = render(
        <ChatComposer onSubmit={onSubmit} value="" input={<div />} />,
      );
      // Empty composer — nothing to send.
      expect(screen.getByRole('button', {name: 'Send'})).toBeDisabled();

      rerender(
        <ChatComposer onSubmit={onSubmit} value="hello" input={<div />} />,
      );
      const send = screen.getByRole('button', {name: 'Send'});
      expect(send).toBeEnabled();

      fireEvent.click(send);
      // Only that the click reaches the composer's submit path is this
      // button's behavior. The submitted value comes from the composer's own
      // state, not from here, so asserting it would pin ChatComposer instead.
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });
});
