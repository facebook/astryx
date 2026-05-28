// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useEffect, useState, type ComponentType} from 'react';
import {XDSCard} from '@xds/core/Card';
import {XDSSection} from '@xds/core/Section';
import {XDSCenter} from '@xds/core/Center';
import {XDSText} from '@xds/core/Text';
import {XDSCodeBlock} from '@xds/core/CodeBlock';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSSpinner} from '@xds/core/Spinner';
import {XDSButton} from '@xds/core/Button';
import {XDSHStack} from '@xds/core/Layout';
import {XDSTheme} from '@xds/core/theme';
import {neutralTheme} from '@xds/theme-neutral/built';
import {useThemeMode} from '../../app/providers';
import type {ExampleEntry} from '../../generated/exampleRegistry';
import {buildPlaygroundHref} from '../playgroundLink';

function LivePreview({entry}: {entry: ExampleEntry}) {
  const {mode} = useThemeMode();
  const [Component, setComponent] = useState<ComponentType | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    entry
      .load()
      .then(mod => setComponent(() => mod.default))
      .catch(() => setError(true));
  }, [entry]);

  if (error) {
    return (
      <XDSCenter style={{minHeight: 200, width: '100%'}}>
        <XDSText type="supporting" color="secondary">
          Preview not available
        </XDSText>
      </XDSCenter>
    );
  }

  if (!Component) {
    return (
      <XDSCenter style={{minHeight: 200, width: '100%'}}>
        <XDSSpinner size="md" />
      </XDSCenter>
    );
  }

  return (
    <XDSTheme theme={neutralTheme} mode={mode}>
      <div
        style={{
          width: '100%',
          overflow: 'auto',
          minHeight: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <div style={{minWidth: 'fit-content', padding: 'var(--spacing-4)'}}>
          <Component />
        </div>
      </div>
    </XDSTheme>
  );
}

interface ExampleBlockProps {
  entry: ExampleEntry;
}

export function ExampleBlock({entry}: ExampleBlockProps) {
  const [tab, setTab] = useState<string>('description');

  return (
    <XDSCard padding={3}>
      <XDSText type="body" weight="medium">
        {entry.name}
      </XDSText>

      <LivePreview entry={entry} />

      <XDSSection variant="muted" padding={1} dividers={['top']}>
        <XDSHStack
          gap={1}
          style={{justifyContent: 'space-between', alignItems: 'center'}}>
          <XDSTabList value={tab} onChange={setTab} size="sm">
            <XDSTab value="description" label="Description" />
            <XDSTab value="code" label="Code" />
          </XDSTabList>
          {entry.source && (
            <XDSButton
              label="Open in Playground"
              variant="ghost"
              size="sm"
              onClick={() => {
                window.location.href = buildPlaygroundHref(entry.source);
              }}
            />
          )}
        </XDSHStack>
      </XDSSection>
      <XDSSection variant="muted">
        {tab === 'description' ? (
          <XDSText type="body">
            {entry.description || 'No description available.'}
          </XDSText>
        ) : (
          <XDSCodeBlock code={entry.source} language="tsx" hasCopyButton />
        )}
      </XDSSection>
    </XDSCard>
  );
}
