// Copyright (c) Meta Platforms, Inc. and affiliates.

import {DocsShell} from '../../components/DocsShell';
import {SiteFooter} from '../../components/SiteFooter';
import {getCopyrightYear} from '../../lib/copyrightYear';
import {packages} from '../../generated/packageRegistry';
import {docTopics} from '../../generated/docsRegistry';

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const year = await getCopyrightYear();

  return (
    <DocsShell packages={packages} docTopics={docTopics}>
      {children}
      <SiteFooter year={year} />
    </DocsShell>
  );
}
