'use client';

import {XDSChatComposer, XDSChatComposerDrawer} from '@xds/core/Chat';
import {XDSToken} from '@xds/core/Token';
import {XDSStack} from '@xds/core/Layout';

export default function ChatComposerDrawerAttachments() {
  return (
    <XDSStack direction="vertical" gap={4} width={480}>
      <XDSChatComposer
        onSubmit={() => {}}
        drawer={
          <XDSChatComposerDrawer>
            <XDSToken label="quarterly-report.pdf" onRemove={() => {}} />
            <XDSToken label="budget-forecast.xlsx" onRemove={() => {}} />
          </XDSChatComposerDrawer>
        }
      />
    </XDSStack>
  );
}
