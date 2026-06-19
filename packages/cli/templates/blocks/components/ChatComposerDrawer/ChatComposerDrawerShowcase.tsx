// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSChatComposer, XDSChatComposerDrawer} from '@xds/core/Chat';
import {XDSToken} from '@xds/core/Token';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {XDSStack} from '@xds/core/Layout';
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
    <XDSStack direction="vertical" gap={4} width={480}>
      <XDSChatComposer
        onSubmit={() => {}}
        drawer={
          <XDSChatComposerDrawer
            count={4}
            label="Attachments"
            xstyle={styles.drawerBorder}>
            <XDSToken label="design-spec.pdf" onRemove={() => {}} />
            <XDSToken label="api-schema.json" onRemove={() => {}} />
            <XDSToken label="screenshot.png" onRemove={() => {}} />
            <XDSToken label="meeting-notes.md" onRemove={() => {}} />
          </XDSChatComposerDrawer>
        }
        headerActions={
          <XDSButton
            label="Attach"
            variant="ghost"
            size="sm"
            icon={<XDSIcon icon={PaperClipIcon} size="sm" />}
            isIconOnly
            onClick={() => {}}
          />
        }
      />
    </XDSStack>
  );
}
