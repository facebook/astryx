// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {Text} from '@astryxdesign/core/Text';
import {renderInlineCode} from './renderInlineCode';
import {layout} from '../../layout.stylex';

const styles = stylex.create({
  // marginBlock: 0 — the <p> UA margin would otherwise double up with the
  // VStack gap that already spaces blocks apart.
  prose: {maxWidth: layout.proseMaxWidth, marginBlock: 0},
});

export function ProseBlock({text}: {text: string}) {
  return (
    <Text as="p" display="block" xstyle={styles.prose}>
      {renderInlineCode(text)}
    </Text>
  );
}
