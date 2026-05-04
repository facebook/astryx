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
import {groupComponents} from '../../../../lib/groupComponents';

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
  const {items} = groupComponents(pkgComponents);
  const totalCount = items.reduce(
    (sum, item) => sum + (item.type === 'group' ? item.entries.length : 1),
    0,
  );

  const descriptionMap = new Map<string, string>();
  for (const c of pkgComponents) {
    descriptionMap.set(c.name, c.description);
  }

  if (items.length === 0) {
    return (
      <XDSText type="body" color="secondary">
        No components documented yet.
      </XDSText>
    );
  }

  return (
    <XDSVStack gap={4}>
      <XDSHeading level={2}>Components ({totalCount})</XDSHeading>
      <XDSGrid columns={{minWidth: 260}} gap={4} rowGap={6}>
        {items.map(item => {
          const name = item.type === 'group' ? item.label : item.name;
          const href = item.type === 'group' ? item.entries[0].href : item.href;
          const groupSize = item.type === 'group' ? item.entries.length : 1;
          return (
            <ComponentPreviewCard
              key={name}
              name={name}
              href={href}
              description={descriptionMap.get(name) ?? ''}
              groupSize={groupSize}
            />
          );
        })}
      </XDSGrid>
    </XDSVStack>
  );
}
