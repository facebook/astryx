// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @input Controlled open state for a non-modal Drawer
 * @output A single-trigger inspector with the page behind it available
 * @position Lab Drawer's docsite showcase and copyable CLI block
 */

import {useState} from 'react';
import {Drawer} from '@astryxdesign/lab';
import {Button} from '@astryxdesign/core/Button';
import {Section} from '@astryxdesign/core/Section';
import {VStack} from '@astryxdesign/core/Stack';
import {Heading, Text} from '@astryxdesign/core/Text';

export default function DrawerShowcase() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button label="Open drawer" onClick={() => setIsOpen(true)} />
      <Drawer
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        label="Details"
        hasScrim={false}
        width={360}>
        <Section padding={4}>
          <VStack gap={2}>
            <Heading level={3}>Details</Heading>
            <Text type="body">The page behind stays interactive.</Text>
            <Button
              label="Close"
              variant="secondary"
              onClick={() => setIsOpen(false)}
            />
          </VStack>
        </Section>
      </Drawer>
    </>
  );
}
