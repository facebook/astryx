// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useMemo, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {PlaygroundCodeEditor} from './PlaygroundCodeEditor';
import {detectComponentName} from './contentTypeDetector';

const s = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
  },
  tabs: {
    display: 'flex',
    gap: 0,
    borderBottom: '1px solid var(--color-border-default, #e5e5e5)',
    flexShrink: 0,
  },
  tab: {
    paddingInline: 16,
    paddingBlock: 8,
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    borderBottom: '2px solid transparent',
    transition: 'color 0.15s, border-color 0.15s',
  },
  tabActive: {
    color: 'var(--color-text-primary)',
    borderBottomColor: 'var(--color-border-focus, #0066ff)',
  },
  content: {
    display: 'flex',
    flex: 1,
    minHeight: 0,
  },
  placeholder: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
});

interface ComponentEditorPanelProps {
  code: string;
  onChange: (code: string) => void;
}

export function ComponentEditorPanel({
  code,
  onChange,
}: ComponentEditorPanelProps) {
  const [activeTab, setActiveTab] = useState<'code' | 'properties'>('code');
  const componentName = useMemo(() => detectComponentName(code), [code]);

  return (
    <div {...stylex.props(s.root)}>
      <div {...stylex.props(s.tabs)}>
        <button
          {...stylex.props(s.tab, activeTab === 'code' && s.tabActive)}
          onClick={() => setActiveTab('code')}>
          Code
        </button>
        <button
          {...stylex.props(s.tab, activeTab === 'properties' && s.tabActive)}
          onClick={() => setActiveTab('properties')}>
          Properties
        </button>
      </div>
      <div {...stylex.props(s.content)}>
        {activeTab === 'code' ? (
          <PlaygroundCodeEditor value={code} onChange={onChange} />
        ) : (
          <div {...stylex.props(s.placeholder)}>
            <XDSVStack gap={4} hAlign="center">
              <XDSHeading level={4}>
                {componentName ? `XDS${componentName}` : 'Component'} Properties
              </XDSHeading>
              <XDSText color="secondary">
                Interactive property controls coming soon.
                {componentName && (
                  <>
                    {' '}
                    Visit the component detail page for interactive controls.
                  </>
                )}
              </XDSText>
            </XDSVStack>
          </div>
        )}
      </div>
    </div>
  );
}
