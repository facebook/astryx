// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
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
      <ChatReasoning>Some reasoning text about constraints</ChatReasoning>,
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

  it('wires the trigger to the content region via aria-controls', () => {
    render(<ChatReasoning>Full reasoning body</ChatReasoning>);
    const button = screen.getByRole('button');
    const controlsId = button.getAttribute('aria-controls');
    expect(controlsId).toBeTruthy();
    const region = document.getElementById(controlsId as string);
    expect(region).not.toBeNull();
    expect(region).toHaveTextContent('Full reasoning body');
  });

  it('marks the collapsed content inert and lifts it when expanded', () => {
    render(<ChatReasoning>Hidden reasoning</ChatReasoning>);
    const button = screen.getByRole('button');
    const region = document.getElementById(
      button.getAttribute('aria-controls') as string,
    ) as HTMLElement;
    // Collapsed: visually clipped by the 0fr grid row, so it must also be
    // removed from the accessibility tree.
    expect(region).toHaveAttribute('inert');
    fireEvent.click(button);
    expect(region).not.toHaveAttribute('inert');
    fireEvent.click(button);
    expect(region).toHaveAttribute('inert');
  });
});
