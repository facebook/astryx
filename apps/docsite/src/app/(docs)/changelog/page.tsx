// Copyright (c) Meta Platforms, Inc. and affiliates.

import {ChangelogView} from '../../../components/ChangelogView';
import {components} from '../../../generated/componentRegistry';
import {packages} from '../../../generated/packageRegistry';

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
