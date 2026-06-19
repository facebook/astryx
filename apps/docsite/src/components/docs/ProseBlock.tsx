// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {Text} from '@xds/core/Text';
import {renderInlineCode} from './renderInlineCode';

const styles = stylex.create({
  prose: {maxWidth: 800},
});

export function ProseBlock({text}: {text: string}) {
  return <Text xstyle={styles.prose}>{renderInlineCode(text)}</Text>;
}
