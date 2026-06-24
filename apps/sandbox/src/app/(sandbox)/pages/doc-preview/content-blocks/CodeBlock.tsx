// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {VStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {CodeBlock as CoreCodeBlock} from '@astryxdesign/core/CodeBlock';
import {Card} from '@astryxdesign/core/Card';

const styles = stylex.create({
  root: {
    width: '100%',
  },
});

export function CodeBlock({
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
      <Card variant="muted" xstyle={styles.root}>
        <CoreCodeBlock
          code={code}
          language={lang}
          hasCopyButton
          style={
            {
              '--color-syntax-background': 'transparent',
              width: '100%',
            } satisfies React.CSSProperties
          }
        />
      </Card>
    </VStack>
  );
}
