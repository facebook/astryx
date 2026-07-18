// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {ChatComposer, ChatComposerDrawer} from '@astryxdesign/core/Chat';
import {Token} from '@astryxdesign/core/Token';
import {Stack} from '@astryxdesign/core/Layout';

export default function ChatComposerAttachments() {
  return (
    <Stack direction="vertical" style={{width: '100%', maxWidth: 450}}>
      <ChatComposer
        onSubmit={value => {
          console.log('Sent:', value);
        }}
        drawer={
          <ChatComposerDrawer count={6}>
            <Token label="feature-prd.docx" onRemove={() => {}} />
            <Token label="2026-roadmap.pdf" onRemove={() => {}} />
            <Token label="user-flow.fig" onRemove={() => {}} />
            <Token label="launch-plan.docx" onRemove={() => {}} />
            <Token label="user-feedback.csv" onRemove={() => {}} />
            <Token label="analytics-kpis.csv" onRemove={() => {}} />
          </ChatComposerDrawer>
        }
      />
    </Stack>
  );
}
