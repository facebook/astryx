'use client';

import {
  XDSChatComposer,
  XDSChatComposerAttachments,
} from '@xds/core/Chat';
import {XDSToken} from '@xds/core/Token';
import {XDSProgressBar} from '@xds/core/ProgressBar';

export default function ChatComposerComposerWithAttachments() {
  return (
    <XDSChatComposer
      onSubmit={() => {}}
      attachments={
        <XDSChatComposerAttachments>
          <XDSToken label="report.pdf" onRemove={() => {}} />
          <XDSToken label="data.csv" onRemove={() => {}} />
        </XDSChatComposerAttachments>
      }
      headerContext={
        <XDSProgressBar label="Context window" value={3} isLabelHidden />
      }
    />
  );
}
