'use client';

import {useState} from 'react';
import stylex from '@stylexjs/stylex';
import {XDSText} from '@xds/core/Text';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSCard} from '@xds/core/Card';
import {XDSTheme} from '@xds/core/theme';
import type {XDSDefinedTheme} from '@xds/core/theme';
import {XDSMarkdown} from '@xds/core/Markdown';
import {XDSCodeBlock} from '@xds/core/CodeBlock';
import {XDSButton} from '@xds/core/Button';
import {XDSPopover} from '@xds/core/Popover';
import {ThemeShowcasePreview} from './ThemeShowcasePreview';

const styles = stylex.create({
  prose: {
    maxWidth: 800,
    marginInline: 'auto',
    width: '100%',
  },
  previewCard: {
    overflow: 'hidden',
  },
});

export interface InstallStep {
  label: string;
  code: string;
  language?: string;
}

interface ThemePackagePageProps {
  name: string;
  description?: string;
  version?: string;
  readme: string | null;
  installSteps: InstallStep[];
  theme: XDSDefinedTheme;
}

export function ThemePackagePage({
  name,
  description,
  version,
  readme,
  installSteps,
  theme,
}: ThemePackagePageProps) {
  const body = readme ? readme.replace(/^# .+\n+/, '') : null;
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  return (
    <XDSVStack gap={8}>
      <XDSVStack gap={2} xstyle={styles.prose}>
        <XDSVStack gap={1}>
          <XDSHStack vAlign="center" hAlign="between">
            <XDSHStack gap={3} vAlign="end">
              <XDSText type="display-3">{name}</XDSText>
              {version && (
                <XDSText type="supporting" color="secondary">
                  {version}
                </XDSText>
              )}
            </XDSHStack>
            <XDSPopover
              width={360}
              content={
                <XDSVStack gap={3}>
                  {installSteps.map((step, i) => (
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
      </XDSVStack>

      <XDSTheme theme={theme} mode={mode}>
        <XDSCard padding={0} variant="muted" xstyle={styles.previewCard}>
          <ThemeShowcasePreview mode={mode} onModeChange={setMode} />
        </XDSCard>
      </XDSTheme>

      {body && (
        <div {...stylex.props(styles.prose)}>
          <XDSMarkdown headingLevelStart={3} contentWidth={800}>
            {body}
          </XDSMarkdown>
        </div>
      )}
    </XDSVStack>
  );
}
