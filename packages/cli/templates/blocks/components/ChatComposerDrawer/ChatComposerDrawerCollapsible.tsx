// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSChatComposer, XDSChatComposerDrawer} from '@xds/core/Chat';
import {XDSToken} from '@xds/core/Token';
import {XDSStack} from '@xds/core/Layout';

export default function ChatComposerDrawerCollapsible() {
  return (
    <XDSStack direction="vertical" gap={4} width={480}>
      <XDSChatComposer
        onSubmit={() => {}}
        drawer={
          <XDSChatComposerDrawer count={6} label="Files">
            <XDSToken label="design-spec.pdf" onRemove={() => {}} />
            <XDSToken label="api-schema.json" onRemove={() => {}} />
            <XDSToken label="screenshot.png" onRemove={() => {}} />
            <XDSToken label="meeting-notes.md" onRemove={() => {}} />
            <XDSToken label="test-results.csv" onRemove={() => {}} />
            <XDSToken label="deploy-log.txt" onRemove={() => {}} />
          </XDSChatComposerDrawer>
        }
      />
    </XDSStack>
  );
}
