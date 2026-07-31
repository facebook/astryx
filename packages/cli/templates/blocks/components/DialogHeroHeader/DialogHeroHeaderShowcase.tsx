// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Dialog, DialogHeroHeader} from '@astryxdesign/core/Dialog';
import {Layout, LayoutContent, Card} from '@astryxdesign/core/Layout';
import {Icon} from '@astryxdesign/core/Icon';
import {Text} from '@astryxdesign/core/Text';

export default function DialogHeroHeaderShowcase() {
  return (
    <Dialog isOpen isInline onOpenChange={() => {}}>
      <Layout
        header={
          <DialogHeroHeader
            media={<Icon icon="success" size="lg" color="accent" />}
            eyebrow="Payment received"
            title="Thanks for your order"
            subtitle="A receipt has been sent to your email. Your plan is now active."
            onOpenChange={() => {}}
          />
        }
        content={
          <LayoutContent>
            <Card variant="muted">
              <Text type="body" color="secondary">
                Dialog body content goes here.
              </Text>
            </Card>
          </LayoutContent>
        }
      />
    </Dialog>
  );
}
