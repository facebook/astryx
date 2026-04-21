'use client';

import {useState} from 'react';
import {XDSDialog, XDSDialogHeader} from '@xds/core/Dialog';
import {
  XDSLayout,
  XDSLayoutContent,
  XDSLayoutFooter,
  XDSHStack,
  XDSVStack,
} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSText} from '@xds/core/Text';

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
    <XDSVStack gap={3}>
      <XDSButton
        label="Open documentation"
        variant="secondary"
        onClick={() => setIsOpen(true)}
      />
      <XDSDialog isOpen={isOpen} onOpenChange={setIsOpen} variant="fullscreen">
        <XDSLayout
          header={
            <XDSDialogHeader
              title="Documentation"
              subtitle="Everything you need to get started"
              onOpenChange={setIsOpen}
            />
          }
          content={
            <XDSLayoutContent>
              <XDSVStack gap={4}>
                {SECTIONS.map(({title, body}) => (
                  <XDSVStack key={title} gap={1}>
                    <XDSText type="bodyBold">{title}</XDSText>
                    <XDSText type="body">{body}</XDSText>
                  </XDSVStack>
                ))}
              </XDSVStack>
            </XDSLayoutContent>
          }
          footer={
            <XDSLayoutFooter>
              <XDSHStack hAlign="end">
                <XDSButton
                  label="Close"
                  variant="primary"
                  onClick={() => setIsOpen(false)}
                />
              </XDSHStack>
            </XDSLayoutFooter>
          }
        />
      </XDSDialog>
    </XDSVStack>
  );
}
