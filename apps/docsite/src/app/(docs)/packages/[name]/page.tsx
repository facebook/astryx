// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Page type: package
 * Adapts based on the package type:
 * - component-pkg (@xds/core): stub page with CTA to browse components
 * - theme-pkg (@xds/theme-*): redirects to the canonical /themes/<name>
 *   page on the themes side of the site (one URL per theme).
 * - generic (@xds/cli, etc.): README rendered via XDSMarkdown
 */

import {notFound, redirect} from 'next/navigation';
import {XDSSection} from '@xds/core/Section';
import {packages} from '../../../../generated/packageRegistry';
import {type InstallStep} from './PackageHeading';
import {themeObjects} from '../../../../generated/themeRegistry';
import {PackageStubPage} from './PackageStubPage';

function slugToPackageName(slug: string): string {
  return `@xds/${slug}`;
}

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

/** Sections to remove from the @xds/core README on the package page. */
const CORE_STRIP_SECTIONS = ['Quick Start', 'Resources', 'XDS CLI'];

/**
 * Rewrite the @xds/core README intro to incorporate the package description
 * and remove the now-dead Quick Start cross-reference.
 */
function rewriteCoreReadme(readme: string | null): string | null {
  if (!readme) {
    return null;
  }
  return readme.replace(
    /Core UI components, theme system, and utilities for the XDS design system\..*?(?=\n)/,
    'Accessible, themeable React components with built-in spacing, dark mode, and StyleX styling — the core building blocks of the Astryx design system.',
  );
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
  if (!pkg) {
    notFound();
  }

  const isTheme = pkg.name.includes('theme-');
  const isComponentPkg = pkg.name === '@xds/core';

  // Theme packages live on /themes/<name> — the canonical surface for
  // each theme, hosting the full ThemeShowcasePreview alongside the
  // install affordance and README. Redirect every /packages/theme-*
  // hit (incoming links, search results, bookmarks) to that page so
  // there is one URL per theme.
  if (isTheme && themeObjects[pkg.name]) {
    const themeSlug = pkg.name.replace('@xds/theme-', '');
    redirect(`/themes/${themeSlug}`);
  }

  if (!isComponentPkg) {
    return (
      <XDSSection maxWidth="lg" padding={6}>
        <PackageStubPage
          name={pkg.name}
          version={pkg.version}
          readme={pkg.readme}
          installSteps={getInstallSteps(pkg.name)}
        />
      </XDSSection>
    );
  }

  return (
    <XDSSection maxWidth="lg" padding={6}>
      <PackageStubPage
        name={pkg.name}
        version={pkg.version}
        readme={rewriteCoreReadme(pkg.readme)}
        installSteps={getInstallSteps(pkg.name)}
        cta={{label: 'View Components', href: '/components/Button'}}
        stripSections={CORE_STRIP_SECTIONS}
      />
    </XDSSection>
  );
}
