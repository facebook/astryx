'use client';

import {XDSChatComposer, XDSChatComposerDrawer} from '@xds/core/Chat';
import {XDSToken} from '@xds/core/Token';
import {XDSProgressBar} from '@xds/core/ProgressBar';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {PaperClipIcon, AtSymbolIcon} from '@heroicons/react/24/outline';

export default function ChatComposerDrawer() {
  return (
    <XDSStack direction="vertical" gap={4} width={450}>
      <XDSChatComposer
        onSubmit={() => {}}
        drawer={
          <XDSChatComposerDrawer count={2}>
            <XDSToken label="report.pdf" onRemove={() => {}} />
            <XDSToken label="data.csv" onRemove={() => {}} />
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
      />
    </XDSStack>
  );
}
