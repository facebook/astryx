// Copyright (c) Meta Platforms, Inc. and affiliates.

import {render, screen, fireEvent} from '@testing-library/react';
import {ChatReasoning} from './ChatReasoning';

describe('ChatReasoning', () => {
  it('renders collapsed by default', () => {
    render(<ChatReasoning>Some reasoning text</ChatReasoning>);
    expect(screen.getByText('Thinking')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('shows preview text when collapsed', () => {
    render(
      <ChatReasoning>
        Some reasoning text about constraints
      </ChatReasoning>,
    );
    expect(
      screen.getAllByText('Some reasoning text about constraints').length,
    ).toBeGreaterThanOrEqual(1);
  });

  it('expands on click', () => {
    render(<ChatReasoning>Reasoning content here</ChatReasoning>);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows duration when not streaming', () => {
    render(<ChatReasoning duration="12s">Text</ChatReasoning>);
    expect(screen.getByText('12s')).toBeInTheDocument();
  });

  it('hides duration when streaming', () => {
    render(
      <ChatReasoning duration="12s" isStreaming>
        Text
      </ChatReasoning>,
    );
    expect(screen.queryByText('12s')).not.toBeInTheDocument();
  });

  it('supports custom label', () => {
    render(<ChatReasoning label="Processing">Text</ChatReasoning>);
    expect(screen.getByText('Processing')).toBeInTheDocument();
  });

  it('supports defaultIsExpanded', () => {
    render(<ChatReasoning defaultIsExpanded>Content</ChatReasoning>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  });
});
