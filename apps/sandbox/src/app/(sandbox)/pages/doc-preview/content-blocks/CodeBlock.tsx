'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {XDSCodeBlock} from '@xds/core/CodeBlock';
import {XDSCard} from '@xds/core/Card';

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
    <XDSVStack gap={1}>
      {label && (
        <XDSText type="supporting" color="secondary">
          {label}
        </XDSText>
      )}
      <XDSCard variant="muted" xstyle={styles.root}>
        <XDSCodeBlock
          code={code}
          language={lang}
          hasCopyButton
          style={{
            '--color-syntax-background': 'transparent',
            width: '100%',
          } as React.CSSProperties}
        />
      </XDSCard>
    </XDSVStack>
  );
}
