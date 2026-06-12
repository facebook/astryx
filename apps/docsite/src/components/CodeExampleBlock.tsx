// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file CodeExampleBlock.tsx
 * @input XDSCodeBlock props for docsite-rendered examples
 * @output XDSCodeBlock with docsite-only source cleanup applied
 * @position Shared docsite wrapper for displayed/copyable code snippets
 */

import {XDSCodeBlock, type XDSCodeBlockProps} from '@xds/core/CodeBlock';
import {stripCodeExampleCopyrightHeader} from '../lib/codeExamples';

export function CodeExampleBlock({code, ...props}: XDSCodeBlockProps) {
  return (
    <XDSCodeBlock {...props} code={stripCodeExampleCopyrightHeader(code)} />
  );
}
