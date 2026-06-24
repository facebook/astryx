// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Unified docs-section template. Serves two kinds of slug:
 * - long-form-doc: guide/foundation topics from docsRegistry, rendered via
 *   ContentBlockRenderer (TokensDocView for live token tables, otherwise
 *   ReferenceDocView).
 * - package: non-theme @astryxdesign packages (e.g. @astryxdesign/core, @astryxdesign/cli), rendered as
 *   a README stub via PackageStubPage with install steps and an optional CTA.
 * Theme packages are NOT served here — they live at /themes/<name>.
 */

import {notFound} from 'next/navigation';
import {docTopics} from '../../../../generated/docsRegistry';
import {packages} from '../../../../generated/packageRegistry';
import {ReferenceDocView} from '../../../../components/docs/ReferenceDocView';
import {TokensDocView} from '../../../../components/docs/TokensDocView';
import {PackageStubPage} from '../../../../components/docs/PackageStubPage';
import {type InstallStep} from '../../../../components/docs/PackageActions';

const TOKEN_TOPICS = new Set([
  'tokens',
  'color',
  'elevation',
  'motion',
  'shape',
  'spacing',
  'typography',
]);

function slugToPackageName(slug: string): string {
  return `@astryxdesign/${slug}`;
}

function isThemePackage(name: string): boolean {
  return name.includes('theme-');
}

function getInstallSteps(pkgName: string): InstallStep[] {
  if (pkgName.endsWith('/cli')) {
    return [
      {label: 'Install the CLI', code: `npm install -D ${pkgName}`},
      {label: 'Run a command', code: `npx astryx component --list`},
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

/** Sections to remove from the @astryxdesign/core README on the package page. */
const CORE_STRIP_SECTIONS = ['Quick Start', 'Resources', 'XDS CLI'];

export function generateStaticParams() {
  return [
    ...docTopics.map(d => ({topic: d.topic})),
    ...packages
      .filter(p => !isThemePackage(p.name))
      .map(p => ({topic: p.name.replace('@astryxdesign/', '')})),
  ];
}

export default async function DocPage({
  params,
}: {
  params: Promise<{topic: string}>;
}) {
  const {topic: slug} = await params;

  const topic = docTopics.find(d => d.topic === slug);
  if (topic) {
    const isTokenTopic =
      topic.category === 'foundations' && TOKEN_TOPICS.has(topic.topic);

    return isTokenTopic ? (
      <TokensDocView
        title={topic.title}
        description={topic.description}
        sections={topic.sections}
        topic={topic.topic}
      />
    ) : (
      <ReferenceDocView
        title={topic.title}
        description={topic.description}
        sections={topic.sections}
      />
    );
  }

  const pkgName = slugToPackageName(slug);
  const pkg = packages.find(p => p.name === pkgName && !isThemePackage(p.name));
  if (!pkg) {
    notFound();
  }

  const isComponentPkg = pkg.name === '@astryxdesign/core';

  return (
    <PackageStubPage
      name={pkg.name}
      description={pkg.description}
      version={pkg.version}
      readme={pkg.readme}
      installSteps={getInstallSteps(pkg.name)}
      cta={
        isComponentPkg
          ? {label: 'View Components', href: '/components/Button'}
          : undefined
      }
      stripSections={isComponentPkg ? CORE_STRIP_SECTIONS : undefined}
      stripIntro={isComponentPkg}
    />
  );
}
