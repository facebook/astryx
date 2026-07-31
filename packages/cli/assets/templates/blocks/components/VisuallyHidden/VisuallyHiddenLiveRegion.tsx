// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {VisuallyHidden} from '@astryxdesign/core/VisuallyHidden';
import {Button} from '@astryxdesign/core/Button';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

const columns = ['Backlog', 'In progress', 'Done'] as const;

export default function VisuallyHiddenLiveRegion() {
  const [column, setColumn] = useState(0);
  const current = columns[column];

  function move() {
    setColumn(c => (c + 1) % columns.length);
  }

  return (
    <VStack gap={4} hAlign="start">
      <Text type="supporting" color="secondary">
        Drag-and-drop and other visual-only changes are silent to screen
        readers. A live region narrates them.
      </Text>
      <HStack gap={3} vAlign="center">
        <Button label="Move task" variant="secondary" onClick={move} />
        <Text type="body">
          Task is in{' '}
          <Text as="span" weight="bold">
            {current}
          </Text>
        </Text>
      </HStack>
      <VisuallyHidden as="div" aria-live="polite">
        {`Task moved to ${current}`}
      </VisuallyHidden>
    </VStack>
  );
}
