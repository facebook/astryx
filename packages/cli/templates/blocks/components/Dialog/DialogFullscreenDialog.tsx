// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {Dialog, DialogHeader} from '@xds/core/Dialog';
import {
  Layout,
  LayoutContent,
  LayoutFooter,
  HStack,
  VStack,
} from '@xds/core/Layout';
import {Button} from '@xds/core/Button';
import {Text} from '@xds/core/Text';
import {Card} from '@xds/core/Card';

const SECTIONS = [
  {
    title: 'Getting started',
    body: 'Create your first project by clicking New Project in the sidebar. Choose a template or start from scratch.',
  },
  {
    title: 'Team members',
    body: 'Invite collaborators from Settings > Team. Each member can have Admin, Editor, or Viewer permissions.',
  },
  {
    title: 'Billing',
    body: 'Free plans include up to 3 projects. Upgrade to Pro for unlimited projects and priority support.',
  },
  {
    title: 'API access',
    body: 'Generate API keys from Settings > Developer. Rate limits are 1,000 requests per minute on free plans.',
  },
  {
    title: 'Data export',
    body: 'Export your data anytime from Settings > Data. Exports are available as CSV or JSON within 24 hours.',
  },
];

export default function DialogFullscreenDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card>
      <VStack gap={3}>
        <VStack gap={1}>
          <Text type="body" weight="bold">
            Help &amp; Documentation
          </Text>
          <Text type="supporting" color="secondary">
            5 articles · Last updated Apr 2026
          </Text>
        </VStack>
        <Button
          label="Open documentation"
          variant="secondary"
          onClick={() => setIsOpen(true)}
        />
      </VStack>
      <Dialog isOpen={isOpen} onOpenChange={setIsOpen} variant="fullscreen">
        <Layout
          header={
            <DialogHeader
              title="Documentation"
              subtitle="Everything you need to get started"
              onOpenChange={setIsOpen}
            />
          }
          content={
            <LayoutContent>
              <VStack gap={4}>
                {SECTIONS.map(({title, body}) => (
                  <VStack key={title} gap={1}>
                    <Text type="body" weight="bold">
                      {title}
                    </Text>
                    <Text type="body">{body}</Text>
                  </VStack>
                ))}
              </VStack>
            </LayoutContent>
          }
          footer={
            <LayoutFooter>
              <HStack hAlign="end">
                <Button
                  label="Close"
                  variant="primary"
                  onClick={() => setIsOpen(false)}
                />
              </HStack>
            </LayoutFooter>
          }
        />
      </Dialog>
    </Card>
  );
}
