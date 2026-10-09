// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @input A wide desktop budget and isFullWidthOnMobile
 * @output A Drawer that fills the viewport on mobile
 * @position Copyable Lab Drawer example
 */

import {useState} from 'react';
import {Drawer, DrawerHeader} from '@astryxdesign/lab';
import {Button} from '@astryxdesign/core/Button';
import {Layout, LayoutContent} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

export default function DrawerFullWidthMobile() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button label="Open wide drawer" onClick={() => setIsOpen(true)} />
      <Drawer
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        label="Wide panel"
        width={560}
        isFullWidthOnMobile>
        <Layout
          header={<DrawerHeader title="Wide panel" onOpenChange={setIsOpen} />}
          content={
            <LayoutContent>
              <Text type="body">
                A wide panel on desktop, the full viewport width on mobile.
              </Text>
            </LayoutContent>
          }
        />
      </Drawer>
    </>
  );
}
