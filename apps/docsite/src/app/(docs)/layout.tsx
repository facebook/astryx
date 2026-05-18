// Copyright (c) Meta Platforms, Inc. and affiliates.

import {headers} from 'next/headers';
import {DocsShell} from '../../components/DocsShell';
import {components} from '../../generated/componentRegistry';
import {packages} from '../../generated/packageRegistry';
import {docTopics} from '../../generated/docsRegistry';
import {templates} from '../../generated/templateRegistry';

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const ua = headersList.get('user-agent') ?? '';
  const defaultIsMobile = /mobile|android|iphone|ipad/i.test(ua);

  return (
    <DocsShell
      components={components}
      packages={packages}
      docTopics={docTopics}
      templates={templates}
      defaultIsMobile={defaultIsMobile}>
      {children}
    </DocsShell>
  );
}
