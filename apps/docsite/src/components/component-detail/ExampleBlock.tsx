// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useEffect, useState, type ComponentType} from 'react';
import {XDSCard} from '@xds/core/Card';
import {XDSSection} from '@xds/core/Section';
import {XDSCenter} from '@xds/core/Center';
import {XDSText} from '@xds/core/Text';
import {CodeExampleBlock} from '../CodeExampleBlock';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSSpinner} from '@xds/core/Spinner';
import {XDSButton} from '@xds/core/Button';
import {XDSHStack} from '@xds/core/Layout';
import type {ExampleEntry} from '../../generated/exampleRegistry';
import {ComponentPreviewTheme} from './ComponentPreviewTheme';
import {buildPlaygroundHref} from '../playgroundLink';
import {trackOpenPlayground} from '../../lib/analytics';

function LivePreview({entry}: {entry: ExampleEntry}) {
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
  );
}

interface ExampleBlockProps {
  entry: ExampleEntry;
}

export function ExampleBlock({entry}: ExampleBlockProps) {
  const [tab, setTab] = useState<string>('description');

  return (
    <ComponentPreviewTheme>
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
                  trackOpenPlayground({page: 'components', item: entry.name});
                  window.location.href = buildPlaygroundHref(entry.source);
                }}
              />
            )}
          </XDSHStack>
        </XDSSection>
        <XDSSection variant="muted" padding={tab === 'code' ? 0 : 4}>
          {tab === 'description' ? (
            <XDSText type="body">
              {entry.description || 'No description available.'}
            </XDSText>
          ) : (
            <CodeExampleBlock
              code={entry.source}
              language="tsx"
              hasCopyButton
              container="section"
              width="100%"
            />
          )}
        </XDSSection>
      </XDSCard>
    </ComponentPreviewTheme>
  );
}
