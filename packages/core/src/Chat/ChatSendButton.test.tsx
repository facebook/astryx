// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {ChatSendButton} from './ChatSendButton';

describe('ChatSendButton', () => {
  it('renders its stable theme class', () => {
    // `themeProps('chat-send-button')` was spread and then overwritten by a
    // later `className={className}`, so the theme target never reached the
    // DOM — `.astryx-chat-send-button` matched nothing and the target was
    // unthemeable.
    render(<ChatSendButton data-testid="send" />);
    expect(screen.getByTestId('send')).toHaveClass('astryx-chat-send-button');
  });

  it('keeps the theme class when a consumer className is passed', () => {
    render(<ChatSendButton className="consumer" data-testid="send" />);
    const root = screen.getByTestId('send');
    expect(root).toHaveClass('astryx-chat-send-button');
    expect(root).toHaveClass('consumer');
  });

  it('still applies a consumer style', () => {
    render(<ChatSendButton style={{opacity: '0.5'}} data-testid="send" />);
    expect(screen.getByTestId('send')).toHaveStyle({opacity: '0.5'});
  });
});
