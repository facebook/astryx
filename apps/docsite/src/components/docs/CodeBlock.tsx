// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
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
    <XDSVStack gap={1}>
      {label && (
        <XDSText type="supporting" color="secondary">
          {label}
        </XDSText>
      )}
      <CodeExampleBlock
        code={code}
        language={lang}
        hasCopyButton
        xstyle={styles.root}
      />
    </XDSVStack>
  );
}
