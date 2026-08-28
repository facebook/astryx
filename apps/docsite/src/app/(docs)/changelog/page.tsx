// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Suspense} from 'react';
import type {Metadata} from 'next';
import {
  ChangelogView,
  UrlChangelogView,
} from '../../../components/ChangelogView';
import {components} from '../../../generated/componentRegistry';
import {packages} from '../../../generated/packageRegistry';
import {pageMetadata} from '../../../lib/pageMetadata';

export const metadata: Metadata = pageMetadata({
  title: 'Changelog',
  description:
    'Release notes and version history for Astryx packages and components.',
  path: '/changelog',
});

export default function ChangelogPage() {
  const changelogs = packages
    .filter((p): p is typeof p & {changelog: string} => p.changelog != null)
    .map(p => ({pkg: p.name, content: p.changelog}));

  const componentNames = Object.values(components)
    .flat()
    .map(c => c.name);

  const viewProps = {changelogs, componentNames};

  return (
    <Suspense fallback={<ChangelogView {...viewProps} />}>
      <UrlChangelogView {...viewProps} />
    </Suspense>
  );
}
