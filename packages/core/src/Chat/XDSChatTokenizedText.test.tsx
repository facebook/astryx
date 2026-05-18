// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {XDSChatTokenizedText} from './XDSChatTokenizedText';

describe('XDSChatTokenizedText', () => {
  it('renders plain text when no tokens provided', () => {
    render(
      <XDSChatTokenizedText>Hello world</XDSChatTokenizedText>,
    );
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders plain text when tokens array is empty', () => {
    render(
      <XDSChatTokenizedText tokens={[]}>
        Hello world
      </XDSChatTokenizedText>,
    );
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('replaces a single token with a badge', () => {
    render(
      <XDSChatTokenizedText
        tokens={[{value: '@cindy', label: '@Cindy Zhang', variant: 'blue'}]}>
        Hey @cindy!
      </XDSChatTokenizedText>,
    );
    expect(screen.getByText('@Cindy Zhang')).toBeInTheDocument();
    expect(screen.queryByText('@cindy')).not.toBeInTheDocument();
  });

  it('replaces multiple different tokens', () => {
    render(
      <XDSChatTokenizedText
        tokens={[
          {value: '@cindy', label: '@Cindy Zhang', variant: 'blue'},
          {value: '@navi', label: '@Navi', variant: 'blue'},
        ]}>
        Hey @cindy, can @navi help?
      </XDSChatTokenizedText>,
    );
    expect(screen.getByText('@Cindy Zhang')).toBeInTheDocument();
    expect(screen.getByText('@Navi')).toBeInTheDocument();
  });

  it('handles repeated occurrences of the same token', () => {
    render(
      <XDSChatTokenizedText
        tokens={[{value: '@cindy', label: '@Cindy Zhang'}]}>
        @cindy and @cindy again
      </XDSChatTokenizedText>,
    );
    expect(screen.getAllByText('@Cindy Zhang')).toHaveLength(2);
  });

  it('renders text with no matching tokens as plain text', () => {
    render(
      <XDSChatTokenizedText
        tokens={[{value: '@cindy', label: '@Cindy Zhang'}]}>
        Hello world
      </XDSChatTokenizedText>,
    );
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('handles tokens with special regex characters in pattern', () => {
    render(
      <XDSChatTokenizedText
        tokens={[{value: '/search', label: '/search'}]}>
        Run /search now
      </XDSChatTokenizedText>,
    );
    // The badge should render with the label
    expect(screen.getByText('/search')).toBeInTheDocument();
  });

  it('preserves surrounding text', () => {
    const {container} = render(
      <XDSChatTokenizedText
        tokens={[{value: '@cindy', label: '@Cindy Zhang'}]}>
        Before @cindy after
      </XDSChatTokenizedText>,
    );
    expect(container.textContent).toContain('Before');
    expect(container.textContent).toContain('after');
    expect(container.textContent).toContain('@Cindy Zhang');
  });
});
