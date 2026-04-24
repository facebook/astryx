'use client';

import {
  XDSChatComposer,
  XDSChatComposerDrawer,
} from '@xds/core/Chat';
import {XDSToken} from '@xds/core/Token';

export default function ChatComposerDrawerShowcase() {
  return (
    <XDSChatComposer
      onSubmit={() => {}}
      drawer={
        <XDSChatComposerDrawer count={5}>
          <XDSToken label="design-spec.pdf" onRemove={() => {}} />
          <XDSToken label="api-schema.json" onRemove={() => {}} />
          <XDSToken label="screenshot.png" onRemove={() => {}} />
          <XDSToken label="meeting-notes.md" onRemove={() => {}} />
          <XDSToken label="test-results.csv" onRemove={() => {}} />
        </XDSChatComposerDrawer>
      }
    />
  );
}
