'use client';

import {
  XDSChatComposer,
  XDSChatComposerAttachments,
} from '@xds/core/Chat';
import {XDSToken} from '@xds/core/Token';

export default function ChatComposerAttachmentsShowcase() {
  return (
    <XDSChatComposer
      onSubmit={() => {}}
      attachments={
        <XDSChatComposerAttachments count={5}>
          <XDSToken label="design-spec.pdf" onRemove={() => {}} />
          <XDSToken label="api-schema.json" onRemove={() => {}} />
          <XDSToken label="screenshot.png" onRemove={() => {}} />
          <XDSToken label="meeting-notes.md" onRemove={() => {}} />
          <XDSToken label="test-results.csv" onRemove={() => {}} />
        </XDSChatComposerAttachments>
      }
    />
  );
}
