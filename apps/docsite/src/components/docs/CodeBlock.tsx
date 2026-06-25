// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {VStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {CodeExampleBlock} from '../CodeExampleBlock';

const styles = stylex.create({
  root: {width: '100%'},
});

export function CodeBlockRenderer({
  lang,
  code,
  label,
}: {
  lang: string;
  code: string;
  label?: string;
}) {
  return (
    <VStack gap={1}>
      {label && (
        <Text type="supporting" color="secondary">
          {label}
        </Text>
      )}
      <CodeExampleBlock
        code={code}
        language={lang}
        hasCopyButton
        isWrapped
        xstyle={styles.root}
      />
    </VStack>
  );
}
