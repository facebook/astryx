'use client';

import {XDSCard} from '@xds/core/Card';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {XDSCodeBlock} from '@xds/core/CodeBlock';
import type {BlockEntry} from '../../generated/blockRegistry';

interface ExampleBlockProps {
  block: BlockEntry;
}

export function ExampleBlock({block}: ExampleBlockProps) {
  return (
    <XDSCard padding={0}>
      <XDSVStack gap={0}>
        <div style={{padding: 'var(--spacing-3) var(--spacing-4)'}}>
          <XDSVStack gap={1}>
            <XDSText type="body" weight="bold">
              {block.name}
            </XDSText>
            {block.description && (
              <XDSText type="supporting" color="secondary">
                {block.description}
              </XDSText>
            )}
          </XDSVStack>
        </div>
        <XDSCodeBlock code={block.source} language="tsx" hasCopyButton />
      </XDSVStack>
    </XDSCard>
  );
}
