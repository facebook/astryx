// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import stylex from '@stylexjs/stylex';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {XDSMarkdown} from '@xds/core/Markdown';
import {PackageHeading, type InstallStep} from './PackageHeading';

const styles = stylex.create({
  container: {
    maxWidth: 800,
    marginInline: 'auto',
  },
});

interface PackageStubPageProps {
  name: string;
  description?: string;
  version?: string;
  readme: string | null;
  installSteps?: InstallStep[];
  cta?: {label: string; href: string};
  /** Markdown section headings (## level) to strip from the README */
  stripSections?: string[];
}

export function PackageStubPage({
  name,
  description,
  version,
  readme,
  installSteps,
  cta,
  stripSections,
}: PackageStubPageProps) {
  let body = readme ? readme.replace(/^# .+\n+/, '') : null;

  if (body && stripSections && stripSections.length > 0) {
    for (const section of stripSections) {
      // Remove ## Section through to the next ## or end of string
      const pattern = new RegExp(
        `## ${section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\n[\\s\\S]*?(?=\\n## |$)`,
      );
      body = body.replace(pattern, '');
    }
    // Clean up extra blank lines
    body = body.replace(/\n{3,}/g, '\n\n').trim();
  }

  return (
    <XDSVStack gap={8} xstyle={styles.container}>
      <PackageHeading
        packageName={name}
        version={version}
        description={description}
        installSteps={installSteps}
        cta={cta}
      />
      {body ? (
        <XDSMarkdown headingLevelStart={3} contentWidth={800}>
          {body}
        </XDSMarkdown>
      ) : (
        <XDSText type="body" color="secondary">
          No README available.
        </XDSText>
      )}
    </XDSVStack>
  );
}
