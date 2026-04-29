'use client';

import {XDSChatComposer, XDSChatComposerDrawer} from '@xds/core/Chat';
import {XDSToken} from '@xds/core/Token';
import {XDSProgressBar} from '@xds/core/ProgressBar';
import {XDSStack} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {PaperClipIcon, AtSymbolIcon} from '@heroicons/react/24/outline';

export default function ChatComposerDrawerWithProgress() {
  return (
    <XDSStack direction="vertical" gap={4} width={480}>
      <XDSChatComposer
        onSubmit={() => {}}
        drawer={
          <XDSChatComposerDrawer count={3} label="Attachments">
            <XDSToken label="design-spec.pdf" onRemove={() => {}} />
            <XDSToken label="api-schema.json" onRemove={() => {}} />
            <XDSToken label="screenshot.png" onRemove={() => {}} />
          </XDSChatComposerDrawer>
        }
        headerActions={
          <>
            <XDSButton
              label="Mention"
              variant="ghost"
              size="sm"
              icon={<XDSIcon icon={AtSymbolIcon} size="sm" />}
              isIconOnly
              onClick={() => {}}
            />
            <XDSButton
              label="Attach"
              variant="ghost"
              size="sm"
              icon={<XDSIcon icon={PaperClipIcon} size="sm" />}
              isIconOnly
              onClick={() => {}}
            />
          </>
        }
        headerContext={
          <XDSStack direction="horizontal" gap={2} vAlign="center">
            <XDSProgressBar value={42} label="Context usage" isLabelHidden hasValueLabel />
          </XDSStack>
        }
      />
    </XDSStack>
  );
}
