// Copyright (c) Meta Platforms, Inc. and affiliates.

import {DocsShell} from '../../components/DocsShell';
import {SiteFooter} from '../../components/SiteFooter';
import {getCopyrightYear} from '../../lib/copyrightYear';
import {packages} from '../../generated/packageRegistry';
import {docGuides} from '../../generated/docsRegistry';

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const year = await getCopyrightYear();

  return (
    <DocsShell packages={packages} docGuides={docGuides}>
      {children}
      <SiteFooter year={year} />
    </DocsShell>
  );
}
