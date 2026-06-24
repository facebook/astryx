// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Send, Check} from 'lucide-react';
import {VStack, HStack} from '@astryxdesign/core/Layout';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Text} from '@astryxdesign/core/Text';
import {
  colorVars,
  spacingVars,
  radiusVars,
  shadowVars,
} from '@astryxdesign/core/theme/tokens.stylex';

const styles = stylex.create({
  root: {
    width: '100%',
    maxWidth: 360,
    marginInline: 'auto',
  },
  helper: {
    paddingInlineStart: spacingVars['--spacing-3'],
  },
  pill: {
    width: '100%',
    backgroundColor: colorVars['--color-background-surface'],
    borderRadius: radiusVars['--radius-full'],
    boxShadow: shadowVars['--shadow-low'],
    paddingBlock: spacingVars['--spacing-2'],
    paddingInlineStart: spacingVars['--spacing-5'],
    paddingInlineEnd: spacingVars['--spacing-2'],
  },
  message: {
    minWidth: 0,
    flex: 1,
  },
  sendButton: {
    borderRadius: radiusVars['--radius-full'],
    flexShrink: 0,
    backgroundColor: colorVars['--color-background-inverted'],
    color: colorVars['--color-background-surface'],
  },
});

export function CliPreview() {
  const [sent, setSent] = useState(false);

  return (
    <VStack gap={3} align="stretch" xstyle={styles.root}>
      <Text type="supporting" color="secondary" xstyle={styles.helper}>
        How can i help you today?
      </Text>

      <HStack gap={2} vAlign="center" hAlign="between" xstyle={styles.pill}>
        <Text type="body" color="primary" maxLines={1} xstyle={styles.message}>
          Can you create me a table page
        </Text>
        <IconButton
          label={sent ? 'Message sent' : 'Send message'}
          icon={sent ? <Check size={16} /> : <Send size={16} />}
          size="md"
          onClick={() => {
            setSent(true);
            window.setTimeout(() => setSent(false), 600);
          }}
          xstyle={styles.sendButton}
        />
      </HStack>
    </VStack>
  );
}
