'use client';

import {XDSChatComposer, XDSChatComposerDrawer} from '@xds/core/Chat';
import {XDSToken} from '@xds/core/Token';
import {XDSProgressBar} from '@xds/core/ProgressBar';

export default function ChatComposerComposerWithDrawer() {
  return (
    <XDSChatComposer
      onSubmit={() => {}}
      drawer={
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
