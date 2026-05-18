// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSChatComposer, XDSChatComposerDrawer} from '@xds/core/Chat';
import {XDSToken} from '@xds/core/Token';
import {XDSStack} from '@xds/core/Layout';

export default function ChatComposerAttachments() {
  return (
    <XDSStack direction="vertical" style={{width: '100%', maxWidth: 450}}>
      <XDSChatComposer
        onSubmit={value => {
          console.log('Sent:', value);
        }}
        drawer={
          <XDSChatComposerDrawer count={6}>
            <XDSToken label="feature-prd.docx" onRemove={() => {}} />
            <XDSToken label="2026-roadmap.pdf" onRemove={() => {}} />
            <XDSToken label="user-flow.fig" onRemove={() => {}} />
            <XDSToken label="launch-plan.docx" onRemove={() => {}} />
            <XDSToken label="user-feedback.csv" onRemove={() => {}} />
            <XDSToken label="analytics-kpis.csv" onRemove={() => {}} />
          </XDSChatComposerDrawer>
        }
      />
    </XDSStack>
  );
}
