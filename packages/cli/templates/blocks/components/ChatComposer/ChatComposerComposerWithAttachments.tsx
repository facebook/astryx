'use client';

import {XDSChatComposer, XDSChatComposerDrawer} from '@xds/core/Chat';
import {XDSToken} from '@xds/core/Token';
import {XDSProgressBar} from '@xds/core/ProgressBar';

export default function ChatComposerComposerWithAttachments() {
  return (
    <XDSChatComposer
      onSubmit={() => {}}
      attachments={
        <XDSChatComposerDrawer>
          <XDSToken label="report.pdf" onRemove={() => {}} />
          <XDSToken label="data.csv" onRemove={() => {}} />
        </XDSChatComposerDrawer>
      }
      headerContext={
        <XDSProgressBar label="Context window" value={3} isLabelHidden />
      }
    />
  );
}
