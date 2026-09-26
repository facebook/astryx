// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useId} from 'react';
import {useCollapsible} from '@astryxdesign/core/Collapsible';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {VStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

export default function CollapsibleHookUsage() {
  const detailsId = useId();
  const disclosure = useCollapsible({
    isCollapsible: {defaultIsOpen: true},
    value: 'release-notes',
  });

  return (
    <Card width={360} padding={4}>
      <VStack gap={3}>
        <Text type="body" weight="bold">
          Release checklist
        </Text>
        <Button
          label={disclosure.isOpen ? 'Hide details' : 'Show details'}
          variant="secondary"
          aria-controls={detailsId}
          aria-expanded={disclosure.isOpen}
          onClick={disclosure.toggle}
        />
        {disclosure.isOpen && (
          <div
            id={detailsId}
            role="region"
            aria-label="Release checklist details">
            <Text type="body" color="secondary">
              Review docs, run visual checks, and confirm keyboard behavior
              before shipping the component update.
            </Text>
          </div>
        )}
      </VStack>
    </Card>
  );
}
