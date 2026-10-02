// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @input Controlled open state and the logical start edge
 * @output A Drawer that opens from the start side of the viewport
 * @position Copyable Lab Drawer example
 */

import {useState} from 'react';
import {Drawer, DrawerHeader} from '@astryxdesign/lab';
import {Button} from '@astryxdesign/core/Button';
import {Section} from '@astryxdesign/core/Section';
import {Text} from '@astryxdesign/core/Text';

export default function DrawerStart() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button label="Open start drawer" onClick={() => setIsOpen(true)} />
      <Drawer
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        label="Navigation"
        side="start">
        <DrawerHeader title="Navigation" onOpenChange={setIsOpen} />
        <Section padding={4}>
          <Text type="body">
            The start edge follows the page's writing direction.
          </Text>
        </Section>
      </Drawer>
    </>
  );
}
