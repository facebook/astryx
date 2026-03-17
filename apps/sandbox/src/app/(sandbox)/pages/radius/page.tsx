'use client';

import {useMemo, useState, useCallback} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSTextArea} from '@xds/core/TextArea';
import {XDSCheckboxInput} from '@xds/core/CheckboxInput';
import {XDSBadge} from '@xds/core/Badge';
import {XDSCard} from '@xds/core/Card';
import {XDSSwitch} from '@xds/core/Switch';
import {XDSToken} from '@xds/core/Token';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSStatusDot} from '@xds/core/StatusDot';
import {XDSSlider} from '@xds/core/Slider';
import {XDSDivider} from '@xds/core';

import {XDSTheme, defineTheme} from '@xds/core/theme';
import {colorVars, radiusVars} from '@xds/core/theme/tokens.stylex';

// =============================================================================
// Styles
// =============================================================================

const s = stylex.create({
  page: {
    maxWidth: 960,
  },
  controlBar: {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    backgroundColor: colorVars['--color-wash'],
    paddingBlock: 16,
    paddingInline: 20,
    borderRadius: radiusVars['--radius-container'],
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-divider'],
  },
  presets: {
    display: 'flex',
    gap: 4,
    flexWrap: 'wrap',
  },
  tokenBar: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
  },
  tokenChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingBlock: 4,
    paddingInline: 10,
    backgroundColor: colorVars['--color-deemphasized'],
    borderRadius: radiusVars['--radius-content'],
    fontFamily: 'monospace',
    fontSize: 11,
  },
  tokenName: {
    color: colorVars['--color-text-secondary'],
  },
  tokenVal: {
    color: colorVars['--color-accent-text'],
    fontWeight: 600,
  },
  sectionNote: {
    fontFamily: 'monospace',
    fontSize: 11,
  },
  componentRow: {
    display: 'flex',
    gap: 16,
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  componentGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  // Table styles (radius-none demo)
  table: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-divider-emphasized'],
    borderRadius: radiusVars['--radius-inner'],
    overflow: 'hidden',
    fontSize: 13,
    width: 300,
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    backgroundColor: colorVars['--color-deemphasized'],
    paddingBlock: 8,
    paddingInline: 12,
    fontWeight: 600,
    fontSize: 11,
    color: colorVars['--color-text-secondary'],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colorVars['--color-divider'],
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    paddingBlock: 8,
    paddingInline: 12,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colorVars['--color-divider'],
  },
  // Side panel (radius-none)
  sidePanel: {
    backgroundColor: colorVars['--color-surface'],
    borderRadius: 0,
    borderRightWidth: 1,
    borderRightStyle: 'solid',
    borderRightColor: colorVars['--color-divider'],
    padding: 12,
    width: 160,
  },
  sidePanelItem: {
    paddingBlock: 6,
    paddingInline: 10,
    fontSize: 12,
    color: colorVars['--color-text-secondary'],
    borderRadius: radiusVars['--radius-element'],
    cursor: 'pointer',
  },
  sidePanelItemActive: {
    backgroundColor: colorVars['--color-accent-deemphasized'],
    color: colorVars['--color-accent-text'],
  },
  // Concentric demos
  concentricCard: {
    backgroundColor: colorVars['--color-surface'],
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-divider'],
    borderRadius: radiusVars['--radius-container'],
    padding: 10,
    width: 200,
    overflow: 'hidden',
  },
  concentricMedia: {
    width: '100%',
    height: 90,
    background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
    borderRadius: `max(0px, calc(${radiusVars['--radius-container']} - 10px))`,
    marginBottom: 10,
  },
  concentricMediaTight: {
    width: '100%',
    height: 90,
    background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
    borderRadius: `max(0px, calc(${radiusVars['--radius-container']} - 8px))`,
    marginBottom: 10,
  },
  concentricTitle: {
    fontSize: 13,
    fontWeight: 500,
    marginBottom: 2,
  },
  concentricDetail: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: colorVars['--color-text-secondary'],
    lineHeight: 1.5,
  },
  concentricBtnInset: {
    borderRadius: `max(0px, calc(${radiusVars['--radius-container']} - 10px))`,
  },
  concentricBtnTight: {
    borderRadius: `max(0px, calc(${radiusVars['--radius-container']} - 8px))`,
  },
  flushCard: {
    backgroundColor: colorVars['--color-surface'],
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-divider'],
    borderRadius: radiusVars['--radius-container'],
    width: 200,
    overflow: 'hidden',
  },
  flushMedia: {
    width: '100%',
    height: 90,
    background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
  },
  flushBody: {
    padding: 10,
  },
  flushBtn: {
    borderRadius: `max(0px, calc(${radiusVars['--radius-container']} - 10px))`,
    marginInline: 10,
    marginBottom: 10,
    width: 'calc(100% - 20px)',
  },
  codeBlock: {
    backgroundColor: colorVars['--color-deemphasized'],
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-divider'],
    borderRadius: radiusVars['--radius-content'],
    paddingBlock: 12,
    paddingInline: 14,
    fontFamily: 'monospace',
    fontSize: 12,
    color: colorVars['--color-text-secondary'],
    lineHeight: 1.6,
    maxWidth: 320,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: radiusVars['--radius-content'],
    flexShrink: 0,
  },
  // Card media demo
  cardMedia: {
    width: '100%',
    height: 110,
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
  },
  // Dropdown menu demo
  dropdownMenu: {
    backgroundColor: colorVars['--color-surface'],
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-divider'],
    borderRadius: radiusVars['--radius-container'],
    padding: 4,
    width: 170,
    boxShadow: `0 8px 30px ${colorVars['--color-shadow-elevation']}`,
  },
  dropdownItem: {
    paddingBlock: 7,
    paddingInline: 10,
    fontSize: 13,
    color: colorVars['--color-text-primary'],
    borderRadius: `max(0px, calc(${radiusVars['--radius-container']} - 4px))`,
    cursor: 'pointer',
  },
  dropdownItemActive: {
    backgroundColor: colorVars['--color-hover-overlay'],
  },
  // Toast
  toast: {
    backgroundColor: colorVars['--color-surface'],
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-divider'],
    borderRadius: radiusVars['--radius-container'],
    paddingBlock: 10,
    paddingInline: 14,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 13,
    width: 260,
    boxShadow: `0 4px 20px ${colorVars['--color-shadow-elevation']}`,
  },
  // Popover
  popover: {
    backgroundColor: colorVars['--color-surface'],
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-divider'],
    borderRadius: radiusVars['--radius-container'],
    paddingBlock: 14,
    paddingInline: 16,
    width: 200,
    boxShadow: `0 8px 30px ${colorVars['--color-shadow-elevation']}`,
  },
  // Modal
  modal: {
    backgroundColor: colorVars['--color-surface'],
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-divider'],
    borderRadius: radiusVars['--radius-container'],
    width: 280,
    overflow: 'hidden',
    boxShadow: `0 20px 60px ${colorVars['--color-shadow-elevation']}`,
  },
  modalHeader: {
    paddingTop: 16,
    paddingBottom: 12,
    paddingInline: 18,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalBody: {
    paddingInline: 18,
    paddingBottom: 16,
    fontSize: 13,
    color: colorVars['--color-text-secondary'],
    lineHeight: 1.5,
  },
  modalFooter: {
    paddingBlock: 12,
    paddingInline: 18,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: colorVars['--color-divider'],
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 8,
  },
  // Formula highlight
  formula: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: colorVars['--color-accent-text'],
    backgroundColor: colorVars['--color-accent-deemphasized'],
    paddingBlock: 2,
    paddingInline: 6,
    borderRadius: radiusVars['--radius-content'],
  },
  banner: {
    backgroundColor: colorVars['--color-accent-deemphasized'],
    borderRadius: radiusVars['--radius-container'],
    paddingBlock: 12,
    paddingInline: 16,
    fontSize: 13,
    color: colorVars['--color-accent-text'],
    maxWidth: 300,
  },
  section: {
    // no-op — just used for grouping
  },
});

// =============================================================================
// Preset definitions
// =============================================================================

const PRESETS = [
  {name: 'Sharp', value: 0},
  {name: 'Subtle', value: 0.5},
  {name: 'Default', value: 1},
  {name: 'Rounded', value: 1.5},
  {name: 'Pill', value: 2},
] as const;

const BASE_CONTENT = 4;
const BASE_ELEMENT = 8;
const BASE_CONTAINER = 12;

// =============================================================================
// Helpers
// =============================================================================

function computeTokens(multiplier: number) {
  return {
    none: 0,
    content: +(BASE_CONTENT * multiplier).toFixed(1),
    element: +(BASE_ELEMENT * multiplier).toFixed(1),
    container: +(BASE_CONTAINER * multiplier).toFixed(1),
    rounded: 9999,
  };
}

function makeRadiusTheme(multiplier: number) {
  return defineTheme({
    name: `radius-demo-${multiplier}`,
    tokens: {
      '--radius-content': `${BASE_CONTENT * multiplier}px`,
      '--radius-element': `${BASE_ELEMENT * multiplier}px`,
      '--radius-container': `${BASE_CONTAINER * multiplier}px`,
      '--radius-rounded': '9999px',
      '--radius-inner': '0px',
      '--radius-page': `${20 * multiplier}px`,
    },
  });
}

// =============================================================================
// Section header
// =============================================================================

function SectionHeader({
  title,
  token,
  note,
}: {
  title: string;
  token: string;
  note?: string;
}) {
  return (
    <XDSHStack gap={3} vAlign="center">
      <XDSHeading level={3}>{title}</XDSHeading>
      <XDSText type="supporting" color="secondary">
        <span {...stylex.props(s.sectionNote)}>{token}</span>
      </XDSText>
      {note && (
        <XDSText type="supporting" color="secondary">
          {note}
        </XDSText>
      )}
    </XDSHStack>
  );
}

// =============================================================================
// Page
// =============================================================================

/**
 * XDS Dynamic Radius System — Interactive Sandbox
 *
 * Demonstrates the five semantic radius tokens and how they respond
 * to a continuous multiplier. Shows:
 *
 * 1. radius-none (0dp) — shared edges, tables, dividers
 * 2. radius-content (4dp × m) — code blocks, thumbnails, checkboxes
 * 3. radius-element (8dp × m) — buttons, inputs, selects, tokens
 * 4. radius-container (12dp × m) — cards, modals, popovers, toasts
 * 5. radius-rounded (9999px) — badges, avatars, status dots, toggles
 * 6. Concentric radius — max(0, outer - padding)
 */
export default function RadiusPage() {
  const [multiplier, setMultiplier] = useState(1);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [checked1, setChecked1] = useState(true);
  const [checked2, setChecked2] = useState(false);
  const [switchOn, setSwitchOn] = useState(true);
  const [switchOff, setSwitchOff] = useState(false);

  const tokens = useMemo(() => computeTokens(multiplier), [multiplier]);
  const theme = useMemo(() => makeRadiusTheme(multiplier), [multiplier]);

  const handlePreset = useCallback((v: number) => setMultiplier(v), []);

  return (
    <div {...stylex.props(s.page)}>
      <XDSTheme theme={theme}>
        <XDSVStack gap={8}>
          {/* ── Header ── */}
          <XDSVStack gap={2}>
            <XDSHeading level={1}>Dynamic Radius System</XDSHeading>
            <XDSText type="body" color="secondary">
              Five semantic tokens — hierarchy-based, not size-based. A
              continuous multiplier scales the middle three while{' '}
              <code>none</code> and <code>rounded</code> stay fixed. Nested
              elements use the concentric function:{' '}
              <span {...stylex.props(s.formula)}>max(0, outer − padding)</span>
            </XDSText>
          </XDSVStack>

          {/* ── Controls ── */}
          <div {...stylex.props(s.controlBar)}>
            <XDSVStack gap={4}>
              <XDSHStack gap={6} vAlign="center">
                <div style={{flex: 1, maxWidth: 400}}>
                  <XDSSlider
                    label="Radius Multiplier"
                    value={multiplier}
                    onChange={setMultiplier}
                    min={0}
                    max={2}
                    step={0.05}
                  />
                </div>
                <XDSText type="large" weight="bold" color="active">
                  {multiplier}×
                </XDSText>
              </XDSHStack>

              <div {...stylex.props(s.presets)}>
                {PRESETS.map(p => (
                  <XDSButton
                    key={p.name}
                    label={p.name}
                    size="sm"
                    variant={multiplier === p.value ? 'primary' : 'secondary'}
                    onClick={() => handlePreset(p.value)}
                  />
                ))}
              </div>

              <div {...stylex.props(s.tokenBar)}>
                {Object.entries(tokens).map(([name, val]) => (
                  <div key={name} {...stylex.props(s.tokenChip)}>
                    <span {...stylex.props(s.tokenName)}>{name}</span>
                    <span {...stylex.props(s.tokenVal)}>{val}px</span>
                  </div>
                ))}
              </div>
            </XDSVStack>
          </div>

          <XDSDivider />

          {/* ═══ radius-none ═══ */}
          <XDSVStack gap={4}>
            <SectionHeader
              title="radius-none"
              token="0dp"
              note="Always 0 · ignores multiplier"
            />
            <div {...stylex.props(s.componentRow)}>
              <div {...stylex.props(s.componentGroup)}>
                <XDSText type="supporting" color="secondary" weight="bold">
                  Divider
                </XDSText>
                <XDSDivider />
              </div>

              <div {...stylex.props(s.componentGroup)}>
                <XDSText type="supporting" color="secondary" weight="bold">
                  Table cells
                </XDSText>
                <div {...stylex.props(s.table)}>
                  <div {...stylex.props(s.tableHeader)}>
                    <span>Name</span>
                    <span>Role</span>
                    <span>Status</span>
                  </div>
                  <div {...stylex.props(s.tableRow)}>
                    <span>Alice</span>
                    <span>Design</span>
                    <span
                      style={{color: 'var(--color-positive)', fontSize: 12}}>
                      Active
                    </span>
                  </div>
                  <div {...stylex.props(s.tableRow)}>
                    <span>Bob</span>
                    <span>Eng</span>
                    <span
                      style={{color: 'var(--color-positive)', fontSize: 12}}>
                      Active
                    </span>
                  </div>
                </div>
              </div>

              <div {...stylex.props(s.componentGroup)}>
                <XDSText type="supporting" color="secondary" weight="bold">
                  Side panel
                </XDSText>
                <div {...stylex.props(s.sidePanel)}>
                  <div
                    {...stylex.props(s.sidePanelItem, s.sidePanelItemActive)}>
                    Dashboard
                  </div>
                  <div {...stylex.props(s.sidePanelItem)}>Analytics</div>
                  <div {...stylex.props(s.sidePanelItem)}>Settings</div>
                </div>
              </div>

              <div {...stylex.props(s.componentGroup)}>
                <XDSText type="supporting" color="secondary" weight="bold">
                  Shared edges (button group)
                </XDSText>
                <XDSHStack gap={0}>
                  <XDSButton label="Day" variant="primary" size="sm" />
                  <XDSButton label="Week" variant="secondary" size="sm" />
                  <XDSButton label="Month" variant="secondary" size="sm" />
                </XDSHStack>
              </div>
            </div>
          </XDSVStack>

          <XDSDivider />

          {/* ═══ radius-content ═══ */}
          <XDSVStack gap={4}>
            <SectionHeader
              title="radius-content"
              token={`${tokens.content}px — 4dp × ${multiplier}`}
            />
            <div {...stylex.props(s.componentRow)}>
              <div {...stylex.props(s.componentGroup)}>
                <XDSText type="supporting" color="secondary" weight="bold">
                  Code block
                </XDSText>
                <div {...stylex.props(s.codeBlock)}>
                  <span style={{color: '#c084fc'}}>const</span> radius ={' '}
                  <span style={{color: '#60a5fa'}}>max</span>(
                  <span style={{color: '#f59e0b'}}>0</span>, outer - padding);
                  {'\n'}
                  <span style={{color: '#c084fc'}}>const</span> theme ={' '}
                  <span style={{color: '#34d399'}}>&apos;default&apos;</span>;
                </div>
              </div>

              <div {...stylex.props(s.componentGroup)}>
                <XDSText type="supporting" color="secondary" weight="bold">
                  Thumbnails
                </XDSText>
                <XDSHStack gap={2}>
                  <div
                    {...stylex.props(s.thumbnail)}
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                    }}
                  />
                  <div
                    {...stylex.props(s.thumbnail)}
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                    }}
                  />
                  <div
                    {...stylex.props(s.thumbnail)}
                    style={{
                      background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                    }}
                  />
                  <div
                    {...stylex.props(s.thumbnail)}
                    style={{
                      background: 'linear-gradient(135deg, #22c55e, #06b6d4)',
                    }}
                  />
                </XDSHStack>
              </div>

              <div {...stylex.props(s.componentGroup)}>
                <XDSText type="supporting" color="secondary" weight="bold">
                  Checkboxes
                </XDSText>
                <XDSCheckboxInput
                  label="Enabled"
                  value={checked1}
                  onChange={setChecked1}
                />
                <XDSCheckboxInput
                  label="Disabled"
                  value={checked2}
                  onChange={setChecked2}
                />
              </div>
            </div>
          </XDSVStack>

          <XDSDivider />

          {/* ═══ radius-element ═══ */}
          <XDSVStack gap={4}>
            <SectionHeader
              title="radius-element"
              token={`${tokens.element}px — 8dp × ${multiplier}`}
            />
            <div {...stylex.props(s.componentRow)}>
              <div {...stylex.props(s.componentGroup)}>
                <XDSText type="supporting" color="secondary" weight="bold">
                  Buttons
                </XDSText>
                <XDSHStack gap={2}>
                  <XDSButton label="Primary" variant="primary" />
                  <XDSButton label="Secondary" variant="secondary" />
                  <XDSButton label="Ghost" variant="ghost" />
                </XDSHStack>
              </div>

              <div {...stylex.props(s.componentGroup)}>
                <XDSText type="supporting" color="secondary" weight="bold">
                  Inputs
                </XDSText>
                <XDSTextInput
                  label="Name"
                  placeholder="Enter text..."
                  value={name}
                  onChange={setName}
                />
              </div>

              <div {...stylex.props(s.componentGroup)}>
                <XDSText type="supporting" color="secondary" weight="bold">
                  Text area
                </XDSText>
                <XDSTextArea
                  label="Message"
                  placeholder="Write something..."
                  value={message}
                  onChange={setMessage}
                />
              </div>

              <div {...stylex.props(s.componentGroup)}>
                <XDSText type="supporting" color="secondary" weight="bold">
                  Tokens
                </XDSText>
                <XDSHStack gap={2}>
                  <XDSToken label="Design" onRemove={() => {}} />
                  <XDSToken label="System" onRemove={() => {}} />
                  <XDSToken label="Radius" color="blue" />
                </XDSHStack>
              </div>
            </div>
          </XDSVStack>

          <XDSDivider />

          {/* ═══ radius-container ═══ */}
          <XDSVStack gap={4}>
            <SectionHeader
              title="radius-container"
              token={`${tokens.container}px — 12dp × ${multiplier}`}
            />
            <div {...stylex.props(s.componentRow)}>
              <div {...stylex.props(s.componentGroup)}>
                <XDSText type="supporting" color="secondary" weight="bold">
                  Card
                </XDSText>
                <XDSCard width={220} padding={0}>
                  <div {...stylex.props(s.cardMedia)} />
                  <div style={{padding: 14}}>
                    <XDSText type="body" weight="bold">
                      Card title
                    </XDSText>
                    <XDSText type="supporting" color="secondary">
                      A container for grouped content and actions.
                    </XDSText>
                  </div>
                </XDSCard>
              </div>

              <div {...stylex.props(s.componentGroup)}>
                <XDSText type="supporting" color="secondary" weight="bold">
                  Modal (static)
                </XDSText>
                <div {...stylex.props(s.modal)}>
                  <div {...stylex.props(s.modalHeader)}>
                    <XDSText type="body" weight="bold">
                      Confirm action
                    </XDSText>
                    <XDSText type="supporting" color="secondary">
                      ✕
                    </XDSText>
                  </div>
                  <div {...stylex.props(s.modalBody)}>
                    Are you sure you want to continue? This action cannot be
                    undone.
                  </div>
                  <div {...stylex.props(s.modalFooter)}>
                    <XDSButton label="Cancel" variant="secondary" size="sm" />
                    <XDSButton label="Confirm" variant="primary" size="sm" />
                  </div>
                </div>
              </div>

              <div {...stylex.props(s.componentGroup)}>
                <XDSText type="supporting" color="secondary" weight="bold">
                  Popover
                </XDSText>
                <div {...stylex.props(s.popover)}>
                  <XDSText type="body" weight="bold">
                    Popover title
                  </XDSText>
                  <XDSText type="supporting" color="secondary">
                    Additional context or actions shown on hover or click.
                  </XDSText>
                </div>
              </div>

              <div {...stylex.props(s.componentGroup)}>
                <XDSText type="supporting" color="secondary" weight="bold">
                  Dropdown menu
                </XDSText>
                <div {...stylex.props(s.dropdownMenu)}>
                  <div {...stylex.props(s.dropdownItem, s.dropdownItemActive)}>
                    Dashboard
                  </div>
                  <div {...stylex.props(s.dropdownItem)}>Settings</div>
                  <div {...stylex.props(s.dropdownItem)}>Profile</div>
                  <div {...stylex.props(s.dropdownItem)}>Log out</div>
                </div>
              </div>

              <div {...stylex.props(s.componentGroup)}>
                <XDSText type="supporting" color="secondary" weight="bold">
                  Toast
                </XDSText>
                <XDSVStack gap={2}>
                  <div {...stylex.props(s.toast)}>
                    <XDSStatusDot variant="positive" label="Success" />
                    <span>Saved successfully</span>
                  </div>
                  <div {...stylex.props(s.toast)}>
                    <XDSStatusDot variant="negative" label="Error" />
                    <span>Something went wrong</span>
                  </div>
                </XDSVStack>
              </div>

              <div {...stylex.props(s.componentGroup)}>
                <XDSText type="supporting" color="secondary" weight="bold">
                  Banner
                </XDSText>
                <div {...stylex.props(s.banner)}>
                  Radius tokens scale with the multiplier.
                </div>
              </div>
            </div>
          </XDSVStack>

          <XDSDivider />

          {/* ═══ radius-rounded ═══ */}
          <XDSVStack gap={4}>
            <SectionHeader
              title="radius-rounded"
              token="9999px"
              note="Always pill · ignores multiplier"
            />
            <div {...stylex.props(s.componentRow)}>
              <div {...stylex.props(s.componentGroup)}>
                <XDSText type="supporting" color="secondary" weight="bold">
                  Badges
                </XDSText>
                <XDSHStack gap={2}>
                  <XDSBadge variant="info">New</XDSBadge>
                  <XDSBadge variant="success">Active</XDSBadge>
                  <XDSBadge variant="error">Error</XDSBadge>
                  <XDSBadge variant="warning">Pending</XDSBadge>
                </XDSHStack>
              </div>

              <div {...stylex.props(s.componentGroup)}>
                <XDSText type="supporting" color="secondary" weight="bold">
                  Avatars
                </XDSText>
                <XDSHStack gap={2}>
                  <XDSAvatar initials="JD" label="John Doe" />
                  <XDSAvatar initials="AB" label="Alice Brown" />
                  <XDSAvatar initials="KL" label="Kim Lee" />
                </XDSHStack>
              </div>

              <div {...stylex.props(s.componentGroup)}>
                <XDSText type="supporting" color="secondary" weight="bold">
                  Status dots
                </XDSText>
                <XDSVStack gap={2}>
                  <XDSHStack gap={2} vAlign="center">
                    <XDSStatusDot variant="positive" label="Online" />
                    <XDSText type="supporting" color="secondary">
                      Online
                    </XDSText>
                  </XDSHStack>
                  <XDSHStack gap={2} vAlign="center">
                    <XDSStatusDot variant="warning" label="Away" />
                    <XDSText type="supporting" color="secondary">
                      Away
                    </XDSText>
                  </XDSHStack>
                  <XDSHStack gap={2} vAlign="center">
                    <XDSStatusDot variant="negative" label="Busy" />
                    <XDSText type="supporting" color="secondary">
                      Busy
                    </XDSText>
                  </XDSHStack>
                </XDSVStack>
              </div>

              <div {...stylex.props(s.componentGroup)}>
                <XDSText type="supporting" color="secondary" weight="bold">
                  Toggles
                </XDSText>
                <XDSVStack gap={2}>
                  <XDSSwitch
                    label="Notifications"
                    value={switchOn}
                    onChange={setSwitchOn}
                  />
                  <XDSSwitch
                    label="Dark mode"
                    value={switchOff}
                    onChange={setSwitchOff}
                  />
                </XDSVStack>
              </div>
            </div>
          </XDSVStack>

          <XDSDivider />

          {/* ═══ Concentric Radius ═══ */}
          <XDSVStack gap={4}>
            <SectionHeader
              title="Concentric Radius"
              token="max(0, outerRadius − padding)"
            />
            <XDSText type="body" color="secondary">
              Inner radius is computed from the outer radius minus the padding.
              This ensures nested elements have visually concentric corners —
              like Apple&apos;s ConcentricRectangle. Works with CSS{' '}
              <code>calc()</code>:{' '}
              <span {...stylex.props(s.formula)}>
                calc(max(0px, var(--radius-container) - 10px))
              </span>
            </XDSText>

            <div {...stylex.props(s.componentRow)}>
              {/* Inset media card */}
              <div {...stylex.props(s.componentGroup)}>
                <XDSText type="supporting" color="secondary" weight="bold">
                  Inset media (10px pad)
                </XDSText>
                <div {...stylex.props(s.concentricCard)}>
                  <div {...stylex.props(s.concentricMedia)} />
                  <div style={{paddingInline: 2}}>
                    <div {...stylex.props(s.concentricTitle)}>Inset media</div>
                    <div {...stylex.props(s.concentricDetail)}>
                      card: {tokens.container}px, pad: 10px
                      <br />→ inner:{' '}
                      {Math.max(0, +(tokens.container - 10).toFixed(1))}px
                    </div>
                  </div>
                  <div style={{marginTop: 8}}>
                    <XDSButton
                      label="Action"
                      variant="primary"
                      size="sm"
                      xstyle={s.concentricBtnInset}
                    />
                  </div>
                </div>
              </div>

              {/* Tighter padding card */}
              <div {...stylex.props(s.componentGroup)}>
                <XDSText type="supporting" color="secondary" weight="bold">
                  Tighter padding (8px pad)
                </XDSText>
                <div {...stylex.props(s.concentricCard)} style={{padding: 8}}>
                  <div {...stylex.props(s.concentricMediaTight)} />
                  <div style={{paddingInline: 2}}>
                    <div {...stylex.props(s.concentricTitle)}>
                      Tighter padding
                    </div>
                    <div {...stylex.props(s.concentricDetail)}>
                      card: {tokens.container}px, pad: 8px
                      <br />→ inner:{' '}
                      {Math.max(0, +(tokens.container - 8).toFixed(1))}px
                    </div>
                  </div>
                  <div style={{marginTop: 8}}>
                    <XDSButton
                      label="Action"
                      variant="primary"
                      size="sm"
                      xstyle={s.concentricBtnTight}
                    />
                  </div>
                </div>
              </div>

              {/* Flush media card */}
              <div {...stylex.props(s.componentGroup)}>
                <XDSText type="supporting" color="secondary" weight="bold">
                  Flush media (0px pad)
                </XDSText>
                <div {...stylex.props(s.flushCard)}>
                  <div {...stylex.props(s.flushMedia)} />
                  <div {...stylex.props(s.flushBody)}>
                    <div {...stylex.props(s.concentricTitle)}>Flush media</div>
                    <div {...stylex.props(s.concentricDetail)}>
                      card: {tokens.container}px, pad: 0px
                      <br />→ media: inherits card
                    </div>
                  </div>
                  <div>
                    <XDSButton
                      label="Action"
                      variant="primary"
                      size="sm"
                      xstyle={s.flushBtn}
                    />
                  </div>
                </div>
              </div>

              {/* Dropdown concentric */}
              <div {...stylex.props(s.componentGroup)}>
                <XDSText type="supporting" color="secondary" weight="bold">
                  Dropdown (4px pad)
                </XDSText>
                <div {...stylex.props(s.dropdownMenu)} style={{width: 200}}>
                  <div {...stylex.props(s.dropdownItem, s.dropdownItemActive)}>
                    Dashboard
                  </div>
                  <div {...stylex.props(s.dropdownItem)}>Settings</div>
                  <div {...stylex.props(s.dropdownItem)}>Profile</div>
                  <div {...stylex.props(s.dropdownItem)}>Log out</div>
                </div>
                <div
                  {...stylex.props(s.concentricDetail)}
                  style={{marginTop: 8}}>
                  menu: {tokens.container}px, pad: 4px
                  <br />→ item:{' '}
                  {Math.max(0, +(tokens.container - 4).toFixed(1))}px
                </div>
              </div>
            </div>
          </XDSVStack>
        </XDSVStack>
      </XDSTheme>
    </div>
  );
}
