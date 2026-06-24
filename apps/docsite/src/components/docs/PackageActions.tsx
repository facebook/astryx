// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Text} from '@astryxdesign/core/Text';
import {VStack, HStack} from '@astryxdesign/core/Layout';
import {Popover} from '@astryxdesign/core/Popover';
import {CodeExampleBlock} from '../CodeExampleBlock';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';

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
    <HStack gap={2}>
      <Popover
        width={360}
        content={
          <VStack gap={3}>
            {steps.map((step, i) => (
              <VStack key={i} gap={1}>
                <Text type="body" weight="bold">
                  {i + 1}. {step.label}
                </Text>
                <Card padding={0}>
                  <CodeExampleBlock
                    code={step.code}
                    language={step.language ?? 'bash'}
                    hasCopyButton
                  />
                </Card>
              </VStack>
            ))}
          </VStack>
        }>
        <Button
          label={version ? `Install v${version}` : 'Install'}
          variant="primary"
        />
      </Popover>
      {cta && (
        <Button label={cta.label} href={cta.href} variant="secondary" />
      )}
    </HStack>
  );
}
