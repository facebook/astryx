import {readFile} from 'node:fs/promises';
import * as path from 'node:path';
import {ChangelogView} from '../../components/ChangelogView';
import {components} from '../../generated/componentRegistry';
import {packages} from '../../generated/packageRegistry';

async function readChangelog(pkg: {
  name: string;
  packagePath: string;
}): Promise<{pkg: string; content: string} | null> {
  const changelogPath = path.resolve(
    process.cwd(),
    '..',
    '..',
    pkg.packagePath,
    'CHANGELOG.md',
  );
  try {
    const content = await readFile(changelogPath, 'utf-8');
    return {pkg: pkg.name, content};
  } catch {
    return null;
  }
}

export default async function ChangelogPage() {
  const withChangelog = packages.filter(p => p.hasChangelog);
  const results = await Promise.all(withChangelog.map(readChangelog));
  const changelogs = results.filter(
    (c): c is {pkg: string; content: string} => c != null,
  );

  const componentNames = Object.values(components)
    .flat()
    .map(c => c.name);

  return (
    <ChangelogView changelogs={changelogs} componentNames={componentNames} />
  );
}
