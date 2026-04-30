'use client';

import {XDSChatReasoning} from '@xds/lab';
import {XDSMarkdown} from '@xds/core/Markdown';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function ChatReasoningExpanded() {
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Plain text content
        </XDSText>
        <XDSChatReasoning duration="8s" defaultIsExpanded>
          First, I need to understand the constraints. Three fields, three crops
          (wheat, corn, soy). No adjacent fields can have the same crop. No
          field can repeat its crop from the previous year. For Year 1 there are
          12 valid arrangements.
        </XDSChatReasoning>
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Rich content with Markdown
        </XDSText>
        <XDSChatReasoning duration="15s" defaultIsExpanded>
          <XDSMarkdown density="compact">{`First, I need to understand the constraints:
1. Three fields, three crops (wheat, corn, soy)
2. No adjacent fields can have the same crop
3. No field can repeat its crop from the previous year

For **Year 1**: 3 × 2 × 2 = 12 arrangements.`}</XDSMarkdown>
        </XDSChatReasoning>
      </XDSStack>
    </XDSStack>
  );
}
