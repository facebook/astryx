// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {ChatTokenizedText} from './ChatTokenizedText';

describe('ChatTokenizedText', () => {
  it('renders plain text when no tokens provided', () => {
    render(<ChatTokenizedText>Hello world</ChatTokenizedText>);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders plain text when tokens array is empty', () => {
    render(<ChatTokenizedText tokens={[]}>Hello world</ChatTokenizedText>);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('replaces a single token with a badge', () => {
    render(
      <ChatTokenizedText
        tokens={[{value: '@cindy', label: '@Cindy Zhang', variant: 'blue'}]}>
        Hey @cindy!
      </ChatTokenizedText>,
    );
    expect(screen.getByText('@Cindy Zhang')).toBeInTheDocument();
    expect(screen.queryByText('@cindy')).not.toBeInTheDocument();
  });

  it('replaces multiple different tokens', () => {
    render(
      <ChatTokenizedText
        tokens={[
          {value: '@cindy', label: '@Cindy Zhang', variant: 'blue'},
          {value: '@navi', label: '@Navi', variant: 'blue'},
        ]}>
        Hey @cindy, can @navi help?
      </ChatTokenizedText>,
    );
    expect(screen.getByText('@Cindy Zhang')).toBeInTheDocument();
    expect(screen.getByText('@Navi')).toBeInTheDocument();
  });

  it('handles repeated occurrences of the same token', () => {
    render(
      <ChatTokenizedText tokens={[{value: '@cindy', label: '@Cindy Zhang'}]}>
        @cindy and @cindy again
      </ChatTokenizedText>,
    );
    expect(screen.getAllByText('@Cindy Zhang')).toHaveLength(2);
  });

  it('renders text with no matching tokens as plain text', () => {
    render(
      <ChatTokenizedText tokens={[{value: '@cindy', label: '@Cindy Zhang'}]}>
        Hello world
      </ChatTokenizedText>,
    );
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('handles tokens with special regex characters in pattern', () => {
    render(
      <ChatTokenizedText tokens={[{value: '/search', label: '/search'}]}>
        Run /search now
      </ChatTokenizedText>,
    );
    // The badge should render with the label
    expect(screen.getByText('/search')).toBeInTheDocument();
  });

  it('preserves surrounding text', () => {
    const {container} = render(
      <ChatTokenizedText tokens={[{value: '@cindy', label: '@Cindy Zhang'}]}>
        Before @cindy after
      </ChatTokenizedText>,
    );
    expect(container.textContent).toContain('Before');
    expect(container.textContent).toContain('after');
    expect(container.textContent).toContain('@Cindy Zhang');
  });

  it('forwards rest props (data-*, id) to the root element', () => {
    render(
      <ChatTokenizedText data-testid="tokenized" data-custom="x" id="tok-1">
        Plain text
      </ChatTokenizedText>,
    );
    const root = screen.getByTestId('tokenized');
    expect(root).toHaveAttribute('data-custom', 'x');
    expect(root).toHaveAttribute('id', 'tok-1');
  });

  it('forwards rest props when rendering tokens', () => {
    render(
      <ChatTokenizedText
        tokens={[{value: '@cindy', label: '@Cindy Zhang'}]}
        data-testid="tokenized"
        data-custom="x">
        Hi @cindy
      </ChatTokenizedText>,
    );
    expect(screen.getByTestId('tokenized')).toHaveAttribute('data-custom', 'x');
  });
});
