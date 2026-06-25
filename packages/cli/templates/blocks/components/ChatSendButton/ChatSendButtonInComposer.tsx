// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {ChatComposer} from '@astryxdesign/core/Chat';
import {Stack} from '@astryxdesign/core/Layout';

const styles = stylex.create({
  root: {
    maxWidth: 450,
  },
});

export default function ChatSendButtonInComposer() {
  return (
    <Stack direction="vertical" width="100%" xstyle={styles.root}>
      <ChatComposer
        onSubmit={() => {}}
        value="Hello, how can you help?"
        onChange={() => {}}
      />
    </Stack>
  );
}
