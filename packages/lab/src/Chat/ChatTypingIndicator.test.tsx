// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {ChatTypingIndicator} from './ChatTypingIndicator';
import {InternationalizationProvider} from '@astryxdesign/core/i18n';

describe('ChatTypingIndicator', () => {
  it('renders "X is typing…" for one name', () => {
    render(<ChatTypingIndicator names={['Ana']} />);
    expect(screen.getByText('Ana is typing…')).toBeTruthy();
  });

  it('renders both names for two people', () => {
    render(<ChatTypingIndicator names={['Ana', 'Ben']} />);
    expect(screen.getByText('Ana and Ben are typing…')).toBeTruthy();
  });

  it('collapses three or more names to "and N others"', () => {
    render(<ChatTypingIndicator names={['Ana', 'Ben', 'Casey']} />);
    expect(screen.getByText('Ana and 2 others are typing…')).toBeTruthy();
  });

  it('localizes the one-name sentence through the i18n catalog', () => {
    render(
      <InternationalizationProvider
        locale="fr"
        overrides={{
          fr: {
            '@astryx.chatTypingIndicator.one': '{name} est en train d’écrire…',
          },
        }}>
        <ChatTypingIndicator names={['Ana']} />
      </InternationalizationProvider>,
    );
    expect(screen.getByText('Ana est en train d’écrire…')).toBeTruthy();
  });

  it('joins two names with the locale list format', () => {
    render(
      <InternationalizationProvider
        locale="fr"
        overrides={{
          fr: {'@astryx.chatTypingIndicator.many': '{names} écrivent…'},
        }}>
        <ChatTypingIndicator names={['Ana', 'Ben']} />
      </InternationalizationProvider>,
    );
    // Intl.ListFormat('fr') joins with "et", not the English "and".
    expect(screen.getByText('Ana et Ben écrivent…')).toBeTruthy();
  });

  it('localizes the collapsed overflow sentence', () => {
    render(
      <InternationalizationProvider
        locale="fr"
        overrides={{
          fr: {
            '@astryx.chatTypingIndicator.others': '{count, number} autres',
            '@astryx.chatTypingIndicator.many': '{names} écrivent…',
          },
        }}>
        <ChatTypingIndicator names={['Ana', 'Ben', 'Casey']} />
      </InternationalizationProvider>,
    );
    expect(screen.getByText('Ana et 2 autres écrivent…')).toBeTruthy();
  });

  it('renders dots only when names is empty', () => {
    render(<ChatTypingIndicator names={[]} data-testid="typing" />);
    const root = screen.getByTestId('typing');
    expect(root.textContent).toBe('');
    expect(root.querySelector('[aria-hidden="true"]')).toBeTruthy();
  });

  it('renders dots only when names is omitted', () => {
    render(<ChatTypingIndicator data-testid="typing" />);
    expect(screen.getByTestId('typing').textContent).toBe('');
  });

  it('applies the stable class name', () => {
    render(<ChatTypingIndicator names={['Ana']} data-testid="typing" />);
    expect(screen.getByTestId('typing').className).toContain(
      'astryx-chat-typing-indicator',
    );
  });
});
