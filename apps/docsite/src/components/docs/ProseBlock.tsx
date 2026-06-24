// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {Text} from '@astryxdesign/core/Text';
import {renderInlineMarkdown} from './inlineMarkdown';
import {layout} from '../../layout.stylex';

const styles = stylex.create({
  prose: {maxWidth: layout.proseMaxWidth},
});

export function ProseBlock({text}: {text: string}) {
  return <Text xstyle={styles.prose}>{renderInlineMarkdown(text)}</Text>;
}
