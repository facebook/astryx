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
}

export function PackageStubPage({
  name,
  version,
  readme,
  installSteps,
}: PackageStubPageProps) {
  const body = readme ? readme.replace(/^# .+\n+/, '') : null;

  return (
    <XDSVStack gap={8} xstyle={styles.container}>
      <PackageHeading
        packageName={name}
        version={version}
        installSteps={installSteps}
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
