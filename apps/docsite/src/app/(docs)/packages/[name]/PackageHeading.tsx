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

interface PackageHeadingProps {
  packageName: string;
  description?: string;
  version?: string;
  installSteps?: InstallStep[];
}

export function PackageHeading({
  packageName,
  description,
  version,
  installSteps,
}: PackageHeadingProps) {
  const steps = installSteps ?? [
    {label: 'Install the package', code: `npm install ${packageName}`},
    {
      label: 'Import',
      code: `import {...} from '${packageName}';`,
      language: 'typescript',
    },
  ];

  return (
    <XDSVStack gap={1}>
      {version && (
        <XDSText type="supporting" color="secondary">
          v{version}
        </XDSText>
      )}
      <XDSHStack vAlign="center" hAlign="between">
        <XDSText type="display-1">{packageName}</XDSText>
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
          <XDSButton label="Install" variant="primary" />
        </XDSPopover>
      </XDSHStack>
      {description && (
        <XDSText type="body" color="secondary">
          {description}
        </XDSText>
      )}
    </XDSVStack>
  );
}
