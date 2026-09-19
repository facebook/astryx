// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {ChatMessageMetadata} from './ChatMessageMetadata';

describe('ChatMessageMetadata', () => {
  it('renders metadata content', () => {
    render(
      <ChatMessageMetadata
        timestamp="12:00"
        status="read"
        data-testid="meta"
      />,
    );
    expect(screen.getByTestId('meta')).toBeTruthy();
  });

  it('forwards rest props (data-*, aria-*, id) to the root element', () => {
    render(
      <ChatMessageMetadata
        timestamp="12:00"
        data-testid="meta"
        data-custom="x"
        id="meta-1"
      />,
    );
    const root = screen.getByTestId('meta');
    expect(root).toHaveAttribute('data-custom', 'x');
    expect(root).toHaveAttribute('id', 'meta-1');
  });
});
