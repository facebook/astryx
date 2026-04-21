'use client';

import {
  XDSChatComposer,
  XDSChatComposerAttachments,
} from '@xds/core/Chat';
import {XDSToken} from '@xds/core/Token';
import {XDSButton} from '@xds/core/Button';
import {XDSProgressBar} from '@xds/core/ProgressBar';

export default function ChatComposerFullFeaturedComposer() {
  return (
    <XDSChatComposer
      onSubmit={() => {}}
      placeholder="Ask me anything..."
      attachments={
        <XDSChatComposerAttachments>
          <XDSToken label="design-spec.pdf" onRemove={() => {}} />
        </XDSChatComposerAttachments>
      }
      headerContext={
        <XDSProgressBar label="Context window" value={3} isLabelHidden />
      }
      footerActions={
        <>
          <XDSButton label="Auto" variant="ghost" size="md" />
          <XDSButton label="Settings" variant="ghost" size="md" />
        </>
      }
    />
  );
}
