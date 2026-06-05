// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {XDSMarkdown} from '@xds/core/Markdown';
import {XDSDivider} from '@xds/core/Divider';
import {DocPageLayout} from './DocPageLayout';
import {PackageActions, type InstallStep} from './PackageActions';

interface PackageStubPageProps {
  name: string;
  description?: string;
  version?: string;
  readme: string | null;
  installSteps?: InstallStep[];
  cta?: {label: string; href: string};
  /** Markdown section headings (## level) to strip from the README */
  stripSections?: string[];
  /**
   * Drop the README's leading intro prose (everything before the first `##`
   * section). The canonical short description already renders as the page
   * subtitle via `description`, so this avoids duplicating it — and removes any
   * cross-references in the intro that point at stripped sections.
   */
  stripIntro?: boolean;
}

export function PackageStubPage({
  name,
  description,
  version,
  readme,
  installSteps,
  cta,
  stripSections,
  stripIntro,
}: PackageStubPageProps) {
  let body = readme ? readme.replace(/^# .+\n+/, '') : null;

  if (body && stripIntro) {
    // Remove leading prose up to the first ## section heading.
    body = body.replace(/^[\s\S]*?(?=\n## |^## )/, '').trimStart();
  }

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
    <DocPageLayout title={name} description={description}>
      <XDSVStack gap={10}>
        <PackageActions
          packageName={name}
          version={version}
          installSteps={installSteps}
          cta={cta}
        />
        <XDSDivider />
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
    </DocPageLayout>
  );
}
