// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSText} from '@xds/core/Text';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSPopover} from '@xds/core/Popover';
import {XDSCodeBlock} from '@xds/core/CodeBlock';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';

export interface InstallStep {
  label: string;
  code: string;
  language?: string;
}

interface PackageActionsProps {
  packageName: string;
  version?: string;
  installSteps?: InstallStep[];
  cta?: {label: string; href: string};
}

/**
 * Package-only affordances rendered in the page body: version label, the
 * Install popover, and an optional CTA. The title and description come from
 * the shared DocPageLayout, so they are intentionally absent here.
 */
export function PackageActions({
  packageName,
  version,
  installSteps,
  cta,
}: PackageActionsProps) {
  const steps = installSteps ?? [
    {label: 'Install the package', code: `npm install ${packageName}`},
    {
      label: 'Import',
      code: `import {...} from '${packageName}';`,
      language: 'typescript',
    },
  ];

  return (
    <XDSHStack gap={2}>
      <XDSPopover
        width={360}
        content={
          <XDSVStack gap={3}>
            {steps.map((step, i) => (
              <XDSVStack key={i} gap={1}>
                <XDSText type="body" weight="bold">
                  {i + 1}. {step.label}
                </XDSText>
                <XDSCard padding={0}>
                  <XDSCodeBlock
                    code={step.code}
                    language={step.language ?? 'bash'}
                    hasCopyButton
                  />
                </XDSCard>
              </XDSVStack>
            ))}
          </XDSVStack>
        }>
        <XDSButton
          label={version ? `Install v${version}` : 'Install'}
          variant="primary"
        />
      </XDSPopover>
      {cta && (
        <XDSButton label={cta.label} href={cta.href} variant="secondary" />
      )}
    </XDSHStack>
  );
}
