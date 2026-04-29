'use client';

import type {ContentBlock} from '@xds/core';
import {ProseBlock} from './ProseBlock';
import {CodeBlock} from './CodeBlock';
import {TableBlock} from './TableBlock';
import {ListBlock} from './ListBlock';

/**
 * Renders a single ContentBlock by dispatching to the appropriate component.
 */
export function ContentBlockRenderer({block}: {block: ContentBlock}) {
  switch (block.type) {
    case 'prose':
      return <ProseBlock text={block.text} />;
    case 'code':
      return <CodeBlock lang={block.lang} code={block.code} label={block.label} />;
    case 'table':
      return <TableBlock headers={block.headers} rows={block.rows} />;
    case 'list':
      return <ListBlock items={block.items} listStyle={block.style} />;
    case 'token-ref':
      return null;
    default:
      return null;
  }
}
