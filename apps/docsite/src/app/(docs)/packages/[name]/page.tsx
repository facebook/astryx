/**
 * Page type: package
 * Adapts based on the package type:
 * - component-pkg (@xds/core): component grid from componentRegistry
 * - theme-pkg (@xds/theme-*): live theme preview with light/dark toggle
 * - generic (@xds/cli, etc.): README rendered via XDSMarkdown
 */

import {notFound} from 'next/navigation';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Layout';
import {XDSSection} from '@xds/core/Section';
import {XDSGrid} from '@xds/core/Grid';
import {XDSDivider} from '@xds/core';
import {packages} from '../../../../generated/packageRegistry';
import {
  components,
  type ComponentEntry,
} from '../../../../generated/componentRegistry';
import {
  ThemePackagePage,
  type InstallStep,
} from '../../../../components/ThemePackagePage';
import {defaultTheme} from '@xds/theme-default/built';
import {neutralTheme} from '@xds/theme-neutral/built';
import {dailyTheme} from '@xds/theme-daily/built';
import {matchaTheme} from '@xds/theme-matcha/built';
import type {XDSDefinedTheme} from '@xds/core/theme';
import {PackageHeading} from './PackageHeading';
import {PackageStubPage} from './PackageStubPage';
import {ComponentPreviewCard} from './ComponentPreviewCard';

function slugToPackageName(slug: string): string {
  return `@xds/${slug}`;
}

const THEME_MAP: Record<string, XDSDefinedTheme> = {
  '@xds/theme-default': defaultTheme,
  '@xds/theme-neutral': neutralTheme,
  '@xds/theme-daily': dailyTheme,
  '@xds/theme-matcha': matchaTheme,
};

function getInstallSteps(pkgName: string): InstallStep[] {
  if (pkgName.includes('theme-')) {
    const shortName = pkgName.replace('@xds/theme-', '');
    const varName = shortName + 'Theme';
    return [
      {label: 'Install the theme', code: `npm install ${pkgName}`},
      {
        label: 'Import the built theme',
        code: `import {${varName}} from '${pkgName}/built';`,
        language: 'typescript',
      },
      {
        label: 'Wrap your app',
        code: `<XDSTheme theme={${varName}}>{children}</XDSTheme>`,
        language: 'tsx',
      },
    ];
  }
  if (pkgName.endsWith('/cli')) {
    return [
      {label: 'Install the CLI', code: `npm install -D ${pkgName}`},
      {label: 'Run a command', code: `npx xds component --list`},
    ];
  }
  return [
    {label: 'Install the package', code: `npm install ${pkgName}`},
    {
      label: 'Import a component',
      code: `import {...} from '${pkgName}/ComponentName';`,
      language: 'typescript',
    },
  ];
}

export function generateStaticParams() {
  return packages.map(p => ({name: p.name.replace('@xds/', '')}));
}

export default async function PackagePage({
  params,
}: {
  params: Promise<{name: string}>;
}) {
  const {name: slug} = await params;
  const pkgName = slugToPackageName(slug);
  const pkg = packages.find(p => p.name === pkgName);
  if (!pkg) notFound();

  const isTheme = pkg.name.includes('theme-');
  const isComponentPkg = pkg.name === '@xds/core';
  const pkgComponents = components[pkg.name] || [];

  if (isTheme) {
    const theme = THEME_MAP[pkg.name];
    if (theme) {
      return (
        <XDSSection maxWidth="lg" padding={6}>
          <ThemePackagePage
            name={pkg.name}
            description={pkg.description}
            version={pkg.version}
            readme={pkg.readme}
            installSteps={getInstallSteps(pkg.name)}
            theme={theme}
          />
        </XDSSection>
      );
    }
  }

  if (!isComponentPkg) {
    return (
      <PackageStubPage
        name={pkg.name}
        version={pkg.version}
        readme={pkg.readme}
        installSteps={getInstallSteps(pkg.name)}
      />
    );
  }

  return (
    <XDSSection maxWidth="lg" padding={6}>
      <XDSVStack gap={6}>
        <PackageHeading
          packageName={pkg.name}
          version={pkg.version}
          description={pkg.description}
          installSteps={getInstallSteps(pkg.name)}
        />

        <XDSDivider />

        <ComponentPackageContent components={pkgComponents} />
      </XDSVStack>
    </XDSSection>
  );
}

function ComponentPackageContent({
  components: pkgComponents,
}: {
  components: ComponentEntry[];
}) {
  const visible = pkgComponents.filter(c => !c.hidden);
  const cards = buildComponentCards(visible);

  if (cards.length === 0) {
    return (
      <XDSText type="body" color="secondary">
        No components documented yet.
      </XDSText>
    );
  }

  return (
    <XDSVStack gap={4}>
      <XDSHeading level={2}>Components ({cards.length})</XDSHeading>
      <XDSGrid columns={{minWidth: 260}} gap={4} rowGap={6}>
        {cards.map(c => (
          <ComponentPreviewCard
            key={c.name}
            name={c.name}
            description={c.description}
            groupSize={c.groupSize}
          />
        ))}
      </XDSGrid>
    </XDSVStack>
  );
}

interface CardEntry {
  name: string;
  description: string;
  groupSize: number;
}

function buildComponentCards(entries: ComponentEntry[]): CardEntry[] {
  const groups = new Map<string, ComponentEntry[]>();
  const ungrouped: ComponentEntry[] = [];

  for (const entry of entries) {
    const isHook = entry.name.startsWith('use');
    if (entry.group === 'Utilities' || isHook) continue;

    if (entry.group) {
      if (!groups.has(entry.group)) groups.set(entry.group, []);
      groups.get(entry.group)!.push(entry);
    } else if (!entry.parentDoc) {
      ungrouped.push(entry);
    }
  }

  const cards: Array<{sortKey: string; card: CardEntry}> = [];

  for (const [label, members] of groups) {
    const canonical =
      members.find(m => m.name === label) ||
      members.find(m => !m.parentDoc) ||
      members[0];
    cards.push({
      sortKey: label,
      card: {
        name: canonical.name,
        description: canonical.description,
        groupSize: members.length,
      },
    });
  }

  for (const entry of ungrouped) {
    cards.push({
      sortKey: entry.name,
      card: {
        name: entry.name,
        description: entry.description,
        groupSize: 1,
      },
    });
  }

  cards.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  return cards.map(c => c.card);
}
