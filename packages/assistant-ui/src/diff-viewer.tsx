// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file diff-viewer.tsx
 * @input Uses Astryx CodeBlock and Grid
 * @output Exports DiffViewer
 * @position Isolated diff presentation entrypoint without a parser dependency
 */

import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {Grid} from '@astryxdesign/core/Grid';

export interface DiffViewerProps {
  diff?: string;
  before?: string;
  after?: string;
  language?: string;
  maxHeight?: number | string;
}

export function DiffViewer({
  diff,
  before,
  after,
  language = 'plaintext',
  maxHeight = 480,
}: DiffViewerProps) {
  if (diff != null) {
    return (
      <CodeBlock
        code={diff}
        language="diff"
        maxHeight={maxHeight}
        title="Changes"
        width="100%"
      />
    );
  }
  return (
    <Grid columns={{minWidth: 260, max: 2, repeat: 'fit'}} gap={2} width="100%">
      <CodeBlock
        code={before ?? ''}
        language={language}
        maxHeight={maxHeight}
        title="Before"
        width="100%"
      />
      <CodeBlock
        code={after ?? ''}
        language={language}
        maxHeight={maxHeight}
        title="After"
        width="100%"
      />
    </Grid>
  );
}
