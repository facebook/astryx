// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {ProseBlock} from './ProseBlock';
import {CodeBlockRenderer} from './CodeBlock';
import {TableBlock} from './TableBlock';
import {ListBlock} from './ListBlock';
import type {ContentBlock} from '../../generated/docsRegistry';

export function ContentBlockRenderer({block}: {block: ContentBlock}) {
  switch (block.type) {
    case 'prose':
      return <ProseBlock text={block.text ?? ''} />;
    case 'code':
      return (
        <CodeBlockRenderer
          lang={block.lang ?? 'text'}
          code={block.code ?? ''}
          label={block.label}
        />
      );
    case 'table':
      return (
        <TableBlock headers={block.headers ?? []} rows={block.rows ?? []} />
      );
    case 'list':
      return <ListBlock items={block.items ?? []} listStyle={block.style} />;
    default:
      return null;
  }
}
