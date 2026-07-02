// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Metadata} from 'next';
import {ChangelogView} from '../../../components/ChangelogView';
import {components} from '../../../generated/componentRegistry';
import {packages} from '../../../generated/packageRegistry';
import {pageMetadata} from '../../../lib/pageMetadata';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

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

  return (
    <ChangelogView changelogs={changelogs} componentNames={componentNames} />
  );
}
