// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CraftPanel.tsx
 * @output Disabled AI "Craft" chat with a coming-soon empty state
 * @position Playground left panel — "Craft" tab (placeholder for future AI).
 */

'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSChatMessageList, XDSChatComposer} from '@xds/core/Chat';
import {XDSEmptyState} from '@xds/core/EmptyState';
import {Sparkles} from 'lucide-react';

const s = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
  },
  list: {
    flex: 1,
    minHeight: 0,
    overflow: 'auto',
  },
  composer: {
    flexShrink: 0,
    padding: 'var(--spacing-3)',
  },
  icon: {
    transform: 'scale(2)',
    display: 'inline-flex',
    color: 'var(--color-text-secondary)',
    paddingBottom: 'var(--spacing-1)',
  },
});

export function CraftPanel() {
  return (
    <div {...stylex.props(s.root)}>
      <XDSChatMessageList
        density="compact"
        xstyle={s.list}
        emptyState={
          <XDSEmptyState
            icon={
              <span aria-hidden="true" {...stylex.props(s.icon)}>
                <Sparkles size={24} />
              </span>
            }
            title="Craft with AI"
            description="This feature is coming later."
            headingLevel={3}
          />
        }>
        {[]}
      </XDSChatMessageList>
      <div {...stylex.props(s.composer)}>
        <XDSChatComposer
          isDisabled
          value=""
          onChange={() => {}}
          onSubmit={() => {}}
          placeholder="Coming soon…"
        />
      </div>
    </div>
  );
}
