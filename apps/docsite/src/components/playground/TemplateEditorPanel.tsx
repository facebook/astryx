// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Layout';
import {XDSCard} from '@xds/core/Card';
import {XDSTextInput} from '@xds/core/TextInput';

import {PlaygroundCodeEditor} from './PlaygroundCodeEditor';

const s = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
  },
  tabs: {
    display: 'flex',
    flexShrink: 0,
    paddingInline: 12,
    paddingBlock: 4,
    gap: 4,
  },
  tab: {
    paddingInline: 12,
    paddingBlock: 6,
    borderRadius: 'var(--radius-element, 6px)',
    border: 'none',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
    background: 'transparent',
    color: 'var(--color-text-secondary)',
  },
  tabActive: {
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-primary)',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
  },
  chatPanel: {
    padding: 24,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
  },
  chatEmpty: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatInput: {
    flexShrink: 0,
    paddingBlockStart: 16,
  },
});

type Tab = 'code' | 'chat';

interface TemplateEditorPanelProps {
  code: string;
  onChange: (code: string) => void;
}

export function TemplateEditorPanel({
  code,
  onChange,
}: TemplateEditorPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('code');

  return (
    <div {...stylex.props(s.root)}>
      <div {...stylex.props(s.tabs)}>
        <button
          {...stylex.props(s.tab, activeTab === 'code' && s.tabActive)}
          onClick={() => setActiveTab('code')}>
          Code
        </button>
        <button
          {...stylex.props(s.tab, activeTab === 'chat' && s.tabActive)}
          onClick={() => setActiveTab('chat')}>
          Chat
        </button>
      </div>
      <div {...stylex.props(s.content)}>
        {activeTab === 'code' ? (
          <PlaygroundCodeEditor value={code} onChange={onChange} />
        ) : (
          <div {...stylex.props(s.chatPanel)}>
            <div {...stylex.props(s.chatEmpty)}>
              <XDSCard padding={5}>
                <XDSVStack gap={4} hAlign="center">
                  <XDSHeading level={4}>AI-Assisted Editing</XDSHeading>
                  <XDSText color="secondary">
                    Describe changes to your template using natural language.
                    This feature is coming soon.
                  </XDSText>
                </XDSVStack>
              </XDSCard>
            </div>
            <div {...stylex.props(s.chatInput)}>
              <XDSTextInput
                label="Message"
                isLabelHidden
                placeholder="Describe changes to apply…"
                isDisabled
                value=""
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
