import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {XDSChatMessageTokenizedText} from './XDSChatMessageTokenizedText';

describe('XDSChatMessageTokenizedText', () => {
  it('renders plain text when no tokens provided', () => {
    render(
      <XDSChatMessageTokenizedText>Hello world</XDSChatMessageTokenizedText>,
    );
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders plain text when tokens array is empty', () => {
    render(
      <XDSChatMessageTokenizedText tokens={[]}>
        Hello world
      </XDSChatMessageTokenizedText>,
    );
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('replaces a single token with a badge', () => {
    render(
      <XDSChatMessageTokenizedText
        tokens={[{pattern: '@cindy', label: '@Cindy Zhang', variant: 'blue'}]}>
        Hey @cindy!
      </XDSChatMessageTokenizedText>,
    );
    expect(screen.getByText('@Cindy Zhang')).toBeInTheDocument();
    expect(screen.queryByText('@cindy')).not.toBeInTheDocument();
  });

  it('replaces multiple different tokens', () => {
    render(
      <XDSChatMessageTokenizedText
        tokens={[
          {pattern: '@cindy', label: '@Cindy Zhang', variant: 'blue'},
          {pattern: '@navi', label: '@Navi', variant: 'blue'},
        ]}>
        Hey @cindy, can @navi help?
      </XDSChatMessageTokenizedText>,
    );
    expect(screen.getByText('@Cindy Zhang')).toBeInTheDocument();
    expect(screen.getByText('@Navi')).toBeInTheDocument();
  });

  it('handles repeated occurrences of the same token', () => {
    render(
      <XDSChatMessageTokenizedText
        tokens={[{pattern: '@cindy', label: '@Cindy Zhang'}]}>
        @cindy and @cindy again
      </XDSChatMessageTokenizedText>,
    );
    expect(screen.getAllByText('@Cindy Zhang')).toHaveLength(2);
  });

  it('renders text with no matching tokens as plain text', () => {
    render(
      <XDSChatMessageTokenizedText
        tokens={[{pattern: '@cindy', label: '@Cindy Zhang'}]}>
        Hello world
      </XDSChatMessageTokenizedText>,
    );
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('handles tokens with special regex characters in pattern', () => {
    render(
      <XDSChatMessageTokenizedText
        tokens={[{pattern: '/search', label: '/search'}]}>
        Run /search now
      </XDSChatMessageTokenizedText>,
    );
    // The badge should render with the label
    expect(screen.getByText('/search')).toBeInTheDocument();
  });

  it('preserves surrounding text', () => {
    const {container} = render(
      <XDSChatMessageTokenizedText
        tokens={[{pattern: '@cindy', label: '@Cindy Zhang'}]}>
        Before @cindy after
      </XDSChatMessageTokenizedText>,
    );
    expect(container.textContent).toContain('Before');
    expect(container.textContent).toContain('after');
    expect(container.textContent).toContain('@Cindy Zhang');
  });
});
