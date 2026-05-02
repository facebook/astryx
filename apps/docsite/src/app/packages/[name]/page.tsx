/**
 * Page type: package
 * Adapts based on the package type:
 * - component-pkg (@xds/core): component grid from componentRegistry
 * - theme-pkg (@xds/theme-*): live theme preview with light/dark toggle
 * - generic (@xds/cli, etc.): README rendered via XDSMarkdown
 */

import {notFound} from 'next/navigation';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSSection} from '@xds/core/Section';
import {XDSBadge} from '@xds/core/Badge';
import {XDSGrid} from '@xds/core/Grid';
import {XDSClickableCard} from '@xds/core/ClickableCard';
import {XDSMarkdown} from '@xds/core/Markdown';
import {XDSDivider} from '@xds/core';
import {packages} from '../../../generated/packageRegistry';
import {
  components,
  type ComponentEntry,
} from '../../../generated/componentRegistry';
import {
  ThemePackagePage,
  type InstallStep,
} from '../../../components/ThemePackagePage';
import {defaultTheme} from '@xds/theme-default/built';
import {neutralTheme} from '@xds/theme-neutral/built';
import {dailyTheme} from '@xds/theme-daily/built';
import {matchaTheme} from '@xds/theme-matcha/built';
import type {XDSDefinedTheme} from '@xds/core/theme';

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

  return (
    <XDSSection maxWidth="lg" padding={6}>
      <XDSVStack gap={6}>
        {/* Header — shared across all package types */}
        <XDSVStack gap={2}>
          <XDSHeading level={1}>{pkg.displayName}</XDSHeading>
          <XDSHStack gap={2} vAlign="center">
            <XDSText type="supporting" color="secondary">
              {pkg.name}
            </XDSText>
            <XDSBadge label={`v${pkg.version}`} variant="info" />
          </XDSHStack>
          <XDSText type="body" color="secondary">
            {pkg.description}
          </XDSText>
        </XDSVStack>

        <XDSDivider />

        {/* Content — adapts by package type */}
        {isComponentPkg ? (
          <ComponentPackageContent components={pkgComponents} />
        ) : (
          <GenericPackageContent readme={pkg.readme} />
        )}
      </XDSVStack>
    </XDSSection>
  );
}

function ComponentPackageContent({
  components: pkgComponents,
}: {
  components: ComponentEntry[];
}) {
  const topLevel = pkgComponents.filter(c => !c.parentDoc);

  if (topLevel.length === 0) {
    return (
      <XDSText type="body" color="secondary">
        No components documented yet.
      </XDSText>
    );
  }

  return (
    <XDSVStack gap={4}>
      <XDSHeading level={2}>Components ({topLevel.length})</XDSHeading>
      <XDSGrid columns={3} gap={4} minChildWidth={200}>
        {topLevel.map(c => (
          <XDSClickableCard
            key={c.name}
            label={c.name}
            href={`/components/${c.name}`}
            padding={4}>
            <XDSVStack gap={1}>
              <XDSText type="body" weight="bold">
                {c.name}
              </XDSText>
              {c.group && <XDSBadge label={c.group} />}
              <XDSText type="supporting" color="secondary">
                {c.description.slice(0, 100)}
                {c.description.length > 100 ? '…' : ''}
              </XDSText>
            </XDSVStack>
          </XDSClickableCard>
        ))}
      </XDSGrid>
    </XDSVStack>
  );
}

function GenericPackageContent({readme}: {readme: string | null}) {
  if (!readme) {
    return (
      <XDSText type="body" color="secondary">
        No README available.
      </XDSText>
    );
  }

  return <XDSMarkdown>{readme}</XDSMarkdown>;
}
