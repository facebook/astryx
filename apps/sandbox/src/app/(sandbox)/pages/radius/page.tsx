'use client';

import {useMemo, useState, useCallback} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSTextInput} from '@xds/core/TextInput';
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
    maxWidth: 900,
    width: '100%',
    paddingBottom: 80,
  },
  controlBar: {
    position: 'sticky',
    top: 16,
    zIndex: 10,
    backgroundColor: colorVars['--color-surface'],
    paddingBlock: 20,
    paddingInline: 24,
    borderRadius: radiusVars['--radius-container'],
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-divider-emphasized'],
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
  },
  sliderWrap: {
    flex: 1,
    maxWidth: 360,
    minWidth: 200,
  },
  multiplierVal: {
    minWidth: 48,
    textAlign: 'right' as const,
    fontVariantNumeric: 'tabular-nums',
  },
  presets: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
  },
  tokenBar: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  tokenChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    paddingBlock: 4,
    paddingInline: 10,
    backgroundColor: colorVars['--color-deemphasized'],
    borderRadius: radiusVars['--radius-content'],
    fontFamily: 'monospace',
    fontSize: 11,
  },
  tokenName: {color: colorVars['--color-text-secondary']},
  tokenVal: {color: colorVars['--color-accent-text'], fontWeight: 600},
  sectionNote: {fontFamily: 'monospace', fontSize: 11},
  row: {
    display: 'flex',
    gap: 20,
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  formula: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: colorVars['--color-accent-text'],
    backgroundColor: colorVars['--color-accent-deemphasized'],
    paddingBlock: 2,
    paddingInline: 6,
    borderRadius: radiusVars['--radius-content'],
  },
  // radius-content demos
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
    whiteSpace: 'pre',
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: radiusVars['--radius-content'],
    flexShrink: 0,
  },
  // radius-container demos
  cardMedia: {
    width: '100%',
    height: 110,
    background: 'linear-gradient(135deg, #0064E0, #5B08D8)',
  },
  // Concentric demos
  concentricCard: {
    backgroundColor: colorVars['--color-surface'],
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-divider-emphasized'],
    borderRadius: radiusVars['--radius-container'],
    padding: 10,
    width: 200,
    display: 'flex',
    flexDirection: 'column',
  },
  concentricMedia: {
    width: '100%',
    height: 90,
    background: 'linear-gradient(135deg, #0064E0, #5B08D8)',
    borderRadius: `max(0px, calc(${radiusVars['--radius-container']} - 10px))`,
    marginBottom: 10,
  },
  concentricMediaTight: {
    width: '100%',
    height: 90,
    background: 'linear-gradient(135deg, #0064E0, #5B08D8)',
    borderRadius: `max(0px, calc(${radiusVars['--radius-container']} - 8px))`,
    marginBottom: 10,
  },
  concentricDetail: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: colorVars['--color-text-secondary'],
    lineHeight: 1.5,
    marginTop: 4,
  },
  concentricBtnInset: {
    borderRadius: `max(0px, calc(${radiusVars['--radius-container']} - 10px))`,
    width: '100%',
  },
  concentricBtnTight: {
    borderRadius: `max(0px, calc(${radiusVars['--radius-container']} - 8px))`,
    width: '100%',
  },
  flushCard: {
    backgroundColor: colorVars['--color-surface'],
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-divider-emphasized'],
    borderRadius: radiusVars['--radius-container'],
    width: 200,
    overflow: 'clip',
    display: 'flex',
    flexDirection: 'column',
  },
  flushMedia: {
    width: '100%',
    height: 90,
    background: 'linear-gradient(135deg, #0064E0, #5B08D8)',
  },
  flushBody: {padding: 10, flex: 1},
  flushBtn: {
    borderRadius: `max(0px, calc(${radiusVars['--radius-container']} - 10px))`,
    marginInline: 10,
    marginBottom: 10,
    width: 'calc(100% - 20px)',
  },
  // Dropdown demo (concentric)
  dropdownMenu: {
    backgroundColor: colorVars['--color-surface'],
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-divider-emphasized'],
    borderRadius: radiusVars['--radius-container'],
    padding: 4,
    width: 180,
    boxShadow: `0 4px 12px ${colorVars['--color-shadow-elevation']}`,
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
});

// =============================================================================
// Constants
// =============================================================================

const PRESETS = [
  {name: 'Sharp', value: 0},
  {name: 'Subtle', value: 0.5},
  {name: 'Default', value: 1},
  {name: 'Rounded', value: 1.5},
  {name: 'Pill', value: 2},
] as const;

const BASE = {content: 4, element: 8, container: 12};

function computeTokens(m: number) {
  return {
    none: 0,
    content: +(BASE.content * m).toFixed(1),
    element: +(BASE.element * m).toFixed(1),
    container: +(BASE.container * m).toFixed(1),
    rounded: 9999,
  };
}

function makeTheme(m: number) {
  return defineTheme({
    name: `radius-${m}`,
    tokens: {
      '--radius-content': `${BASE.content * m}px`,
      '--radius-element': `${BASE.element * m}px`,
      '--radius-container': `${BASE.container * m}px`,
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
      {note != null && (
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

export default function RadiusPage() {
  const [multiplier, setMultiplier] = useState(1);
  const [name, setName] = useState('');
  const [checked1, setChecked1] = useState(true);
  const [checked2, setChecked2] = useState(false);
  const [switchOn, setSwitchOn] = useState(true);
  const [switchOff, setSwitchOff] = useState(false);

  const tokens = useMemo(() => computeTokens(multiplier), [multiplier]);
  const theme = useMemo(() => makeTheme(multiplier), [multiplier]);

  const handlePreset = useCallback((v: number) => setMultiplier(v), []);

  return (
    <div {...stylex.props(s.page)}>
      <XDSTheme theme={theme}>
        <XDSVStack gap={10}>
          {/* Header */}
          <XDSVStack gap={3}>
            <XDSHeading level={1}>Dynamic Radius System</XDSHeading>
            <XDSText type="body" color="secondary">
              Five semantic tokens — hierarchy-based, not size-based. A
              continuous multiplier scales the middle three while{' '}
              <code>none</code> and <code>rounded</code> stay fixed. Nested
              elements use the concentric function:{' '}
              <span {...stylex.props(s.formula)}>max(0, outer − padding)</span>
            </XDSText>
          </XDSVStack>

          {/* Controls */}
          <div {...stylex.props(s.controlBar)}>
            <XDSVStack gap={4}>
              <XDSHStack gap={4} vAlign="center">
                <div {...stylex.props(s.sliderWrap)}>
                  <XDSSlider
                    label="Radius Multiplier"
                    value={multiplier}
                    onChange={setMultiplier}
                    min={0}
                    max={2}
                    step={0.05}
                  />
                </div>
                <div {...stylex.props(s.multiplierVal)}>
                  <XDSText type="large" weight="bold" color="active">
                    {multiplier}×
                  </XDSText>
                </div>
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
                {Object.entries(tokens).map(([n, val]) => (
                  <div key={n} {...stylex.props(s.tokenChip)}>
                    <span {...stylex.props(s.tokenName)}>{n}</span>
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
            <XDSText type="supporting" color="secondary">
              Dividers, table cells, side panels, shared edges (button groups)
            </XDSText>
            <div {...stylex.props(s.row)}>
              <div {...stylex.props(s.group)}>
                <XDSText type="supporting" color="secondary" weight="bold">
                  Divider
                </XDSText>
                <XDSDivider />
              </div>
              <div {...stylex.props(s.group)}>
                <XDSText type="supporting" color="secondary" weight="bold">
                  Button group (shared edges)
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
            <XDSText type="supporting" color="secondary">
              Code blocks, thumbnails, checkboxes
            </XDSText>
            <div {...stylex.props(s.row)}>
              <div {...stylex.props(s.group)}>
                <XDSText type="supporting" color="secondary" weight="bold">
                  Code block
                </XDSText>
                <div {...stylex.props(s.codeBlock)}>
                  {
                    'const radius = max(0, outer - padding);\nconst theme = "default";'
                  }
                </div>
              </div>

              <div {...stylex.props(s.group)}>
                <XDSText type="supporting" color="secondary" weight="bold">
                  Thumbnails
                </XDSText>
                <XDSHStack gap={2}>
                  <div
                    {...stylex.props(s.thumbnail)}
                    style={{
                      background: 'linear-gradient(135deg, #E9AF08, #E3193B)',
                    }}
                  />
                  <div
                    {...stylex.props(s.thumbnail)}
                    style={{
                      background: 'linear-gradient(135deg, #0064E0, #0D8626)',
                    }}
                  />
                  <div
                    {...stylex.props(s.thumbnail)}
                    style={{
                      background: 'linear-gradient(135deg, #5B08D8, #E3193B)',
                    }}
                  />
                </XDSHStack>
              </div>

              <div {...stylex.props(s.group)}>
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
            <XDSText type="supporting" color="secondary">
              Buttons, inputs, selects, tokens
            </XDSText>
            <div {...stylex.props(s.row)}>
              <div {...stylex.props(s.group)}>
                <XDSText type="supporting" color="secondary" weight="bold">
                  Buttons
                </XDSText>
                <XDSHStack gap={2}>
                  <XDSButton label="Primary" variant="primary" />
                  <XDSButton label="Secondary" variant="secondary" />
                  <XDSButton label="Ghost" variant="ghost" />
                </XDSHStack>
              </div>

              <div {...stylex.props(s.group)}>
                <XDSText type="supporting" color="secondary" weight="bold">
                  Input
                </XDSText>
                <XDSTextInput
                  label="Name"
                  isLabelHidden
                  placeholder="Enter text..."
                  value={name}
                  onChange={setName}
                />
              </div>

              <div {...stylex.props(s.group)}>
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
            <XDSText type="supporting" color="secondary">
              Cards, modals, popovers, dropdown menus, toasts
            </XDSText>
            <div {...stylex.props(s.row)}>
              <div {...stylex.props(s.group)}>
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
                      A container for grouped content.
                    </XDSText>
                  </div>
                </XDSCard>
              </div>

              <div {...stylex.props(s.group)}>
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
            <XDSText type="supporting" color="secondary">
              Badges, avatars, status dots, toggles
            </XDSText>
            <div {...stylex.props(s.row)}>
              <div {...stylex.props(s.group)}>
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

              <div {...stylex.props(s.group)}>
                <XDSText type="supporting" color="secondary" weight="bold">
                  Avatars
                </XDSText>
                <XDSHStack gap={2}>
                  <XDSAvatar name="John Doe" />
                  <XDSAvatar name="Alice Brown" />
                  <XDSAvatar name="Kim Lee" />
                </XDSHStack>
              </div>

              <div {...stylex.props(s.group)}>
                <XDSText type="supporting" color="secondary" weight="bold">
                  Status dots
                </XDSText>
                <XDSHStack gap={3}>
                  <XDSStatusDot variant="positive" label="Online" />
                  <XDSStatusDot variant="warning" label="Away" />
                  <XDSStatusDot variant="negative" label="Busy" />
                </XDSHStack>
              </div>

              <div {...stylex.props(s.group)}>
                <XDSText type="supporting" color="secondary" weight="bold">
                  Toggles
                </XDSText>
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
              </div>
            </div>
          </XDSVStack>

          <XDSDivider />

          {/* ═══ Concentric Radius ═══ */}
          <XDSVStack gap={4}>
            <SectionHeader
              title="Concentric Radius"
              token="max(0, outer − padding)"
            />
            <XDSText type="body" color="secondary">
              Inner radius = outer radius minus padding. Nested elements get
              visually concentric corners. Works in CSS:{' '}
              <span {...stylex.props(s.formula)}>
                calc(max(0px, var(--radius-container) - 10px))
              </span>
            </XDSText>

            <div {...stylex.props(s.row)}>
              {/* Inset media */}
              <div {...stylex.props(s.group)}>
                <XDSText type="supporting" color="secondary" weight="bold">
                  Inset media (10px pad)
                </XDSText>
                <div {...stylex.props(s.concentricCard)}>
                  <div {...stylex.props(s.concentricMedia)} />
                  <div style={{paddingInline: 2, flex: 1}}>
                    <XDSText type="body" weight="semibold">
                      Inset media
                    </XDSText>
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

              {/* Tighter padding */}
              <div {...stylex.props(s.group)}>
                <XDSText type="supporting" color="secondary" weight="bold">
                  Tighter padding (8px pad)
                </XDSText>
                <div {...stylex.props(s.concentricCard)} style={{padding: 8}}>
                  <div {...stylex.props(s.concentricMediaTight)} />
                  <div style={{paddingInline: 2, flex: 1}}>
                    <XDSText type="body" weight="semibold">
                      Tighter padding
                    </XDSText>
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

              {/* Flush media */}
              <div {...stylex.props(s.group)}>
                <XDSText type="supporting" color="secondary" weight="bold">
                  Flush media (0px pad)
                </XDSText>
                <div {...stylex.props(s.flushCard)}>
                  <div {...stylex.props(s.flushMedia)} />
                  <div {...stylex.props(s.flushBody)}>
                    <XDSText type="body" weight="semibold">
                      Flush media
                    </XDSText>
                    <div {...stylex.props(s.concentricDetail)}>
                      card: {tokens.container}px, pad: 0px
                      <br />→ media: inherits card
                    </div>
                  </div>
                  <XDSButton
                    label="Action"
                    variant="primary"
                    size="sm"
                    xstyle={s.flushBtn}
                  />
                </div>
              </div>

              {/* Dropdown concentric */}
              <div {...stylex.props(s.group)}>
                <XDSText type="supporting" color="secondary" weight="bold">
                  Dropdown (4px pad)
                </XDSText>
                <div {...stylex.props(s.dropdownMenu)}>
                  <div {...stylex.props(s.dropdownItem, s.dropdownItemActive)}>
                    Dashboard
                  </div>
                  <div {...stylex.props(s.dropdownItem)}>Settings</div>
                  <div {...stylex.props(s.dropdownItem)}>Profile</div>
                  <div {...stylex.props(s.dropdownItem)}>Log out</div>
                </div>
                <div {...stylex.props(s.concentricDetail)}>
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
