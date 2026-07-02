// Copyright (c) Meta Platforms, Inc. and affiliates.

import {DocsShell} from '../../components/DocsShell';
import {SiteFooter} from '../../components/SiteFooter';
import {getCopyrightYear} from '../../lib/copyrightYear';
import {components} from '../../generated/componentRegistry';
import {packages} from '../../generated/packageRegistry';
import {docTopics} from '../../generated/docsRegistry';
import {templates} from '../../generated/templateRegistry';

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const year = await getCopyrightYear();

  return (
    <DocsShell
      components={components}
      packages={packages}
      docTopics={docTopics}
      templates={templates}>
      {children}
      <SiteFooter year={year} />
    </DocsShell>
  );
}
