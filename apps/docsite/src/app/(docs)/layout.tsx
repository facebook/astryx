// Copyright (c) Meta Platforms, Inc. and affiliates.

import {headers} from 'next/headers';
import {DocsShell} from '../../components/DocsShell';
import {SiteFooter} from '../../components/SiteFooter';
import {components} from '../../generated/componentRegistry';
import {packages} from '../../generated/packageRegistry';
import {docTopics} from '../../generated/docsRegistry';
import {templates} from '../../generated/templateRegistry';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

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
      <SiteFooter />
    </DocsShell>
  );
}
