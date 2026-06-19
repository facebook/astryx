// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {ChatComposer, ChatComposerDrawer} from '@xds/core/Chat';
import {Token} from '@xds/core/Token';
import {Button} from '@xds/core/Button';
import {Icon} from '@xds/core/Icon';
import {Stack} from '@xds/core/Layout';
import {PaperClipIcon} from '@heroicons/react/24/outline';
import * as stylex from '@stylexjs/stylex';
import {colorVars, borderVars, radiusVars} from '@xds/core/theme/tokens.stylex';

const styles = stylex.create({
  drawerBorder: {
    border: `${borderVars['--border-width']} solid ${colorVars['--color-border']}`,
    borderRadius: radiusVars['--radius-chat'],
  },
});

export default function ChatComposerDrawerShowcase() {
  return (
    <Stack direction="vertical" gap={4} width={480}>
      <ChatComposer
        onSubmit={() => {}}
        drawer={
          <ChatComposerDrawer
            count={4}
            label="Attachments"
            xstyle={styles.drawerBorder}>
            <Token label="design-spec.pdf" onRemove={() => {}} />
            <Token label="api-schema.json" onRemove={() => {}} />
            <Token label="screenshot.png" onRemove={() => {}} />
            <Token label="meeting-notes.md" onRemove={() => {}} />
          </ChatComposerDrawer>
        }
        headerActions={
          <Button
            label="Attach"
            variant="ghost"
            size="sm"
            icon={<Icon icon={PaperClipIcon} size="sm" />}
            isIconOnly
            onClick={() => {}}
          />
        }
      />
    </Stack>
  );
}
