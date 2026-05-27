// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState, useEffect} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Layout';

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
    overflow: 'auto',
  },
  panel: {
    padding: 16,
    flex: 1,
  },
  categorySection: {
    marginBlockEnd: 24,
  },
  colorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: 8,
    marginBlockStart: 8,
  },
  swatch: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingBlock: 6,
    paddingInline: 8,
    borderRadius: 'var(--radius-element, 6px)',
    background: 'var(--color-background-card)',
  },
  swatchColor: {
    width: 24,
    height: 24,
    borderRadius: 'var(--radius-element, 6px)',
    flexShrink: 0,
    border: '1px solid var(--color-border)',
  },
  tokenTable: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tokenRow: {
    borderBlockEnd: '1px solid var(--color-border)',
  },
  tokenCell: {
    paddingBlock: 8,
    paddingInline: 12,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  tokenValue: {
    paddingBlock: 8,
    paddingInline: 12,
    fontSize: 12,
  },
  componentList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: 8,
  },
  componentItem: {
    paddingBlock: 10,
    paddingInline: 14,
    borderRadius: 'var(--radius-element, 6px)',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
  },
});

const COLOR_CATEGORIES: Record<string, string[]> = {
  'Core Semantic': [
    '--color-accent',
    '--color-accent-muted',
    '--color-on-accent',
    '--color-neutral',
    '--color-overlay',
  ],
  Text: [
    '--color-text-primary',
    '--color-text-secondary',
    '--color-text-disabled',
    '--color-text-accent',
  ],
  Icon: [
    '--color-icon-primary',
    '--color-icon-secondary',
    '--color-icon-disabled',
    '--color-icon-accent',
  ],
  Surface: [
    '--color-background-surface',
    '--color-background-body',
    '--color-background-card',
    '--color-background-popover',
    '--color-background-muted',
  ],
  Status: [
    '--color-success',
    '--color-error',
    '--color-warning',
    '--color-success-muted',
    '--color-error-muted',
    '--color-warning-muted',
  ],
  Border: ['--color-border', '--color-border-emphasized'],
};

const COMPONENT_NAMES = [
  'XDSButton',
  'XDSCard',
  'XDSText',
  'XDSHeading',
  'XDSBadge',
  'XDSBanner',
  'XDSTextInput',
  'XDSSelector',
  'XDSSwitch',
  'XDSCheckbox',
  'XDSRadioList',
  'XDSTable',
  'XDSList',
  'XDSDialog',
  'XDSProgressBar',
  'XDSTooltip',
  'XDSPopover',
  'XDSAvatar',
  'XDSIcon',
  'XDSGrid',
  'XDSDivider',
  'XDSSection',
  'XDSTopNav',
  'XDSAppShell',
];

type Tab = 'theme' | 'components' | 'tokens';

function getTokenLabel(tokenName: string): string {
  return tokenName
    .replace(/^--/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/** Gather all unique tokens from all categories into a flat array */
function getAllTokens(): string[] {
  const result: string[] = [];
  for (const tokens of Object.values(COLOR_CATEGORIES)) {
    for (const t of tokens) {
      if (!result.includes(t)) {
        result.push(t);
      }
    }
  }
  return result;
}

interface ThemeEditorPanelProps {
  code: string;
  onChange: (code: string) => void;
}

export function ThemeEditorPanel({code, onChange}: ThemeEditorPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('theme');
  const [tokenValues, setTokenValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const computed = getComputedStyle(document.documentElement);
    const values: Record<string, string> = {};
    for (const tokens of Object.values(COLOR_CATEGORIES)) {
      for (const token of tokens) {
        const val = computed.getPropertyValue(token).trim();
        values[token] = val || '';
      }
    }
    setTokenValues(values);
  }, []);

  const allTokens = getAllTokens();

  return (
    <div {...stylex.props(s.root)}>
      <div {...stylex.props(s.tabs)}>
        <button
          {...stylex.props(s.tab, activeTab === 'theme' && s.tabActive)}
          onClick={() => setActiveTab('theme')}>
          Theme
        </button>
        <button
          {...stylex.props(s.tab, activeTab === 'components' && s.tabActive)}
          onClick={() => setActiveTab('components')}>
          Components
        </button>
        <button
          {...stylex.props(s.tab, activeTab === 'tokens' && s.tabActive)}
          onClick={() => setActiveTab('tokens')}>
          Tokens
        </button>
      </div>
      <div {...stylex.props(s.content)}>
        {activeTab === 'theme' && (
          <div {...stylex.props(s.panel)}>
            <XDSVStack gap={10}>
              {Object.entries(COLOR_CATEGORIES).map(([category, tokens]) => (
                <div key={category} {...stylex.props(s.categorySection)}>
                  <XDSHeading level={5}>{category}</XDSHeading>
                  <div {...stylex.props(s.colorGrid)}>
                    {tokens.map(token => (
                      <div key={token} {...stylex.props(s.swatch)}>
                        <div
                          {...stylex.props(s.swatchColor)}
                          style={{
                            backgroundColor:
                              tokenValues[token] || `var(${token})`,
                          }}
                        />
                        <XDSText type="supporting" color="secondary">
                          {getTokenLabel(token).replace('Color ', '').trim()}
                        </XDSText>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </XDSVStack>
          </div>
        )}
        {activeTab === 'components' && (
          <div {...stylex.props(s.panel)}>
            <XDSVStack gap={8}>
              <XDSHeading level={4}>Components</XDSHeading>
              <XDSText color="secondary">
                Preview how theme tokens affect each component.
              </XDSText>
              <div {...stylex.props(s.componentList)}>
                {COMPONENT_NAMES.map(name => (
                  <div key={name} {...stylex.props(s.componentItem)}>
                    <XDSText type="supporting">{name}</XDSText>
                  </div>
                ))}
              </div>
            </XDSVStack>
          </div>
        )}
        {activeTab === 'tokens' && (
          <div {...stylex.props(s.panel)}>
            <XDSVStack gap={6}>
              <XDSHeading level={4}>Raw Tokens</XDSHeading>
              <XDSText color="secondary">
                CSS custom property names and their current computed values.
              </XDSText>
              <table {...stylex.props(s.tokenTable)}>
                <thead>
                  <tr {...stylex.props(s.tokenRow)}>
                    <th {...stylex.props(s.tokenCell)}>
                      <XDSText type="supporting" weight="bold">
                        Token
                      </XDSText>
                    </th>
                    <th {...stylex.props(s.tokenCell)}>
                      <XDSText type="supporting" weight="bold">
                        Value
                      </XDSText>
                    </th>
                    <th {...stylex.props(s.tokenCell)}>
                      <XDSText type="supporting" weight="bold">
                        Preview
                      </XDSText>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allTokens.map(token => (
                    <tr key={token} {...stylex.props(s.tokenRow)}>
                      <td {...stylex.props(s.tokenCell)}>
                        <XDSText type="code">{token}</XDSText>
                      </td>
                      <td {...stylex.props(s.tokenValue)}>
                        <XDSText type="code" color="secondary">
                          {tokenValues[token] || '\u2014'}
                        </XDSText>
                      </td>
                      <td {...stylex.props(s.tokenCell)}>
                        <div
                          {...stylex.props(s.swatchColor)}
                          style={{
                            backgroundColor:
                              tokenValues[token] || `var(${token})`,
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </XDSVStack>
          </div>
        )}
      </div>
    </div>
  );
}
