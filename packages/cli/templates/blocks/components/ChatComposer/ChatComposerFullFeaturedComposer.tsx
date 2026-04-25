'use client';

import {XDSChatComposer, XDSChatComposerDrawer} from '@xds/core/Chat';
import {XDSToken} from '@xds/core/Token';
import {XDSButton} from '@xds/core/Button';
import {XDSProgressBar} from '@xds/core/ProgressBar';

export default function ChatComposerFullFeaturedComposer() {
  return (
    <XDSChatComposer
      onSubmit={() => {}}
      placeholder="Ask me anything..."
      drawer={
        <XDSChatComposerDrawer>
          <XDSToken label="design-spec.pdf" onRemove={() => {}} />
        </XDSChatComposerDrawer>
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
