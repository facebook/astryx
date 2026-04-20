'use client';

import {XDSChatReasoning} from '@xds/lab';
import {XDSMarkdown} from '@xds/core/Markdown';

export default function ExpandedReasoning() {
  return (
    <XDSChatReasoning duration="8s" defaultIsExpanded>
      <XDSMarkdown density="compact">{`First, I need to understand the constraints:
1. Three fields, three crops (wheat, corn, soy)
2. No adjacent fields can have the same crop
3. No field can repeat its crop from the previous year

For **Year 1**: 3 \u00d7 2 \u00d7 2 = 12 arrangements...`}</XDSMarkdown>
    </XDSChatReasoning>
  );
}
