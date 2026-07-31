// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Dialog, DialogHeroHeader} from '@astryxdesign/core/Dialog';
import {
  Layout,
  LayoutContent,
  LayoutFooter,
  HStack,
} from '@astryxdesign/core/Layout';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {Text} from '@astryxdesign/core/Text';

export default function DialogHeroHeaderBasic() {
  return (
    <Dialog isOpen isInline onOpenChange={() => {}}>
      <Layout
        header={
          <DialogHeroHeader
            media={<Icon icon="success" size="lg" color="accent" />}
            eyebrow="Welcome"
            title="You're all set up"
            subtitle="Your workspace is ready. Invite your team to start collaborating."
            onOpenChange={() => {}}
          />
        }
        content={
          <LayoutContent>
            <Text type="body" color="secondary">
              Dialog body content goes here.
            </Text>
          </LayoutContent>
        }
        footer={
          <LayoutFooter>
            <HStack gap={2} hAlign="end">
              <Button label="Maybe later" variant="secondary" />
              <Button label="Invite team" variant="primary" />
            </HStack>
          </LayoutFooter>
        }
      />
    </Dialog>
  );
}
