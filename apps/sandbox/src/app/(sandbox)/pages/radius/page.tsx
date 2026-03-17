'use client';

import {useMemo, useState, useCallback} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSHStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
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
    maxWidth: 900,
    padding: 16,
  },

  // Controls card
  controls: {
    padding: 16,
    backgroundColor: colorVars['--color-wash'],
    borderRadius: 12,
    width: '50%',
    minWidth: 340,
    marginTop: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: colorVars['--color-text-secondary'],
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  sliderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  sliderValue: {
    fontSize: 14,
    fontWeight: 600,
    color: colorVars['--color-text-primary'],
    minWidth: 40,
    textAlign: 'right' as const,
    fontVariantNumeric: 'tabular-nums',
  },

  // Token readout
  tokenBar: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 16,
  },
  tokenChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    paddingBlock: 4,
    paddingInline: 10,
    backgroundColor: colorVars['--color-deemphasized'],
    borderRadius: 6,
    fontFamily: 'monospace',
    fontSize: 11,
  },
  tokenName: {color: colorVars['--color-text-secondary']},
  tokenVal: {color: colorVars['--color-accent'], fontWeight: 600},

  // Section styles
  sectionHeader: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colorVars['--color-text-secondary'],
  },
  sectionToken: {
    fontSize: 11,
    color: colorVars['--color-text-secondary'],
    fontFamily: 'monospace',
  },
  sectionNote: {
    fontSize: 11,
    color: colorVars['--color-text-secondary'],
    marginLeft: 'auto',
  },

  // Component layout
  row: {
    display: 'flex',
    gap: 16,
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    marginTop: 16,
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  groupLabel: {
    fontSize: 10,
    color: colorVars['--color-text-secondary'],
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },

  // radius-none: table
  table: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-divider-emphasized'],
    borderRadius: 0,
    overflow: 'hidden',
    fontSize: 13,
    width: 320,
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
  tableRowLast: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    paddingBlock: 8,
    paddingInline: 12,
  },

  // radius-none: side panel
  sidePanel: {
    backgroundColor: colorVars['--color-surface'],
    borderRadius: 0,
    borderRightWidth: 1,
    borderRightStyle: 'solid',
    borderRightColor: colorVars['--color-divider'],
    padding: 16,
    width: 160,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
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

  // radius-content: code block
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
    width: 300,
  },

  // radius-content: thumbnail
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: radiusVars['--radius-content'],
    flexShrink: 0,
  },

  // radius-container: card media
  cardMedia: {
    width: '100%',
    height: 110,
    background: 'linear-gradient(135deg, #0064E0, #5B08D8)',
  },

  // radius-container: modal
  modal: {
    backgroundColor: colorVars['--color-surface'],
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-divider-emphasized'],
    borderRadius: radiusVars['--radius-container'],
    width: 260,
    overflow: 'hidden',
    boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
  },
  modalHeader: {
    paddingTop: 14,
    paddingBottom: 10,
    paddingInline: 16,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalBody: {
    paddingInline: 16,
    paddingBottom: 14,
    fontSize: 13,
    color: colorVars['--color-text-secondary'],
    lineHeight: 1.5,
  },
  modalFooter: {
    paddingBlock: 10,
    paddingInline: 16,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: colorVars['--color-divider'],
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 8,
  },

  // radius-container: dropdown
  dropdown: {
    backgroundColor: colorVars['--color-surface'],
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-divider-emphasized'],
    borderRadius: radiusVars['--radius-container'],
    padding: 4,
    width: 170,
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
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

  // radius-container: toast
  toast: {
    backgroundColor: colorVars['--color-surface'],
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-divider-emphasized'],
    borderRadius: radiusVars['--radius-container'],
    paddingBlock: 10,
    paddingInline: 14,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 13,
    width: 240,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },

  // Concentric demos
  concentricCard: {
    backgroundColor: colorVars['--color-surface'],
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-divider-emphasized'],
    borderRadius: radiusVars['--radius-container'],
    padding: 10,
    width: 190,
    display: 'flex',
    flexDirection: 'column',
  },
  concentricMedia: {
    width: '100%',
    height: 80,
    background: 'linear-gradient(135deg, #0064E0, #5B08D8)',
    borderRadius: `max(0px, calc(${radiusVars['--radius-container']} - 10px))`,
    marginBottom: 8,
  },
  concentricMediaTight: {
    width: '100%',
    height: 80,
    background: 'linear-gradient(135deg, #0064E0, #5B08D8)',
    borderRadius: `max(0px, calc(${radiusVars['--radius-container']} - 8px))`,
    marginBottom: 8,
  },
  concentricDetail: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: colorVars['--color-text-secondary'],
    lineHeight: 1.5,
  },
  concentricBtn: {
    borderRadius: `max(0px, calc(${radiusVars['--radius-container']} - 10px))`,
    width: '100%',
    marginTop: 8,
  },
  concentricBtnTight: {
    borderRadius: `max(0px, calc(${radiusVars['--radius-container']} - 8px))`,
    width: '100%',
    marginTop: 8,
  },
  flushCard: {
    backgroundColor: colorVars['--color-surface'],
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-divider-emphasized'],
    borderRadius: radiusVars['--radius-container'],
    width: 190,
    overflow: 'clip',
    display: 'flex',
    flexDirection: 'column',
  },
  flushMedia: {
    width: '100%',
    height: 80,
    background: 'linear-gradient(135deg, #0064E0, #5B08D8)',
  },
  flushMeta: {padding: 10, flex: 1},
  flushBtn: {
    borderRadius: `max(0px, calc(${radiusVars['--radius-container']} - 10px))`,
    marginInline: 10,
    marginBottom: 10,
    width: 'calc(100% - 20px)',
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
// Page
// =============================================================================

export default function RadiusPage() {
  const [multiplier, setMultiplier] = useState(1);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
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
        <div style={{display: 'flex', flexDirection: 'column', gap: 48}}>
          {/* ── Header ── */}
          <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
            <XDSHeading level={1}>Border Radius</XDSHeading>
            <XDSText type="body" color="secondary">
              Dynamic radius with semantic usage
            </XDSText>
          </div>

          {/* ── Controls ── */}
          <div {...stylex.props(s.controls)}>
            <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
              <div>
                <span {...stylex.props(s.label)}>Radius Multiplier</span>
              </div>
              <div {...stylex.props(s.sliderRow)}>
                <div style={{flex: 1}}>
                  <XDSSlider
                    label="Radius Multiplier"
                    isLabelHidden
                    value={multiplier}
                    onChange={setMultiplier}
                    min={0}
                    max={2}
                    step={0.05}
                  />
                </div>
                <span {...stylex.props(s.sliderValue)}>
                  {multiplier}×
                </span>
              </div>
              <XDSHStack gap={2}>
                {PRESETS.map(p => (
                  <XDSButton
                    key={p.name}
                    label={p.name}
                    size="sm"
                    variant={multiplier === p.value ? 'primary' : 'secondary'}
                    onClick={() => handlePreset(p.value)}
                  />
                ))}
              </XDSHStack>
            </div>
          </div>

          {/* ── Token readout ── */}
          <div {...stylex.props(s.tokenBar)}>
            {Object.entries(tokens).map(([n, val]) => (
              <div key={n} {...stylex.props(s.tokenChip)}>
                <span {...stylex.props(s.tokenName)}>{n}</span>
                <span {...stylex.props(s.tokenVal)}>{val}px</span>
              </div>
            ))}
          </div>

          <XDSDivider />

          {/* ═══ radius-none ═══ */}
          <div>
            <div {...stylex.props(s.sectionHeader)}>
              <span {...stylex.props(s.sectionTitle)}>radius-none</span>
              <span {...stylex.props(s.sectionToken)}>0dp</span>
              <span {...stylex.props(s.sectionNote)}>
                Always 0 · ignores multiplier
              </span>
            </div>
            <div {...stylex.props(s.row)}>
              <div {...stylex.props(s.group)}>
                <div {...stylex.props(s.groupLabel)}>Table cells</div>
                <div {...stylex.props(s.table)}>
                  <div {...stylex.props(s.tableHeader)}>
                    <span>Name</span><span>Role</span><span>Status</span>
                  </div>
                  <div {...stylex.props(s.tableRow)}>
                    <span>Alice</span><span>Design</span>
                    <span style={{color: 'var(--color-positive)'}}>Active</span>
                  </div>
                  <div {...stylex.props(s.tableRowLast)}>
                    <span>Bob</span><span>Eng</span>
                    <span style={{color: 'var(--color-positive)'}}>Active</span>
                  </div>
                </div>
              </div>

              <div {...stylex.props(s.group)}>
                <div {...stylex.props(s.groupLabel)}>Side panel</div>
                <div {...stylex.props(s.sidePanel)}>
                  <div {...stylex.props(s.sidePanelItem, s.sidePanelItemActive)}>
                    Dashboard
                  </div>
                  <div {...stylex.props(s.sidePanelItem)}>Analytics</div>
                  <div {...stylex.props(s.sidePanelItem)}>Settings</div>
                </div>
              </div>

              <div {...stylex.props(s.group)}>
                <div {...stylex.props(s.groupLabel)}>Button group</div>
                <div style={{display: 'flex'}}>
                  <XDSButton label="Day" variant="primary" size="sm" />
                  <XDSButton label="Week" variant="secondary" size="sm" />
                  <XDSButton label="Month" variant="secondary" size="sm" />
                </div>
              </div>
            </div>
          </div>

          <XDSDivider />

          {/* ═══ radius-content ═══ */}
          <div>
            <div {...stylex.props(s.sectionHeader)}>
              <span {...stylex.props(s.sectionTitle)}>radius-content</span>
              <span {...stylex.props(s.sectionToken)}>4dp × multiplier</span>
            </div>
            <div {...stylex.props(s.row)}>
              <div {...stylex.props(s.group)}>
                <div {...stylex.props(s.groupLabel)}>Code block</div>
                <div {...stylex.props(s.codeBlock)}>
                  <span style={{color: '#5B08D8'}}>const</span> radius ={' '}
                  <span style={{color: '#0064E0'}}>max</span>(
                  <span style={{color: '#E9AF08'}}>0</span>, outer - padding);
                  <br />
                  <span style={{color: '#5B08D8'}}>const</span> theme ={' '}
                  <span style={{color: '#0D8626'}}>&apos;default&apos;</span>;
                </div>
              </div>

              <div {...stylex.props(s.group)}>
                <div {...stylex.props(s.groupLabel)}>Thumbnails</div>
                <div style={{display: 'flex', gap: 8}}>
                  <div {...stylex.props(s.thumbnail)} style={{background: 'linear-gradient(135deg, #E9AF08, #E3193B)'}} />
                  <div {...stylex.props(s.thumbnail)} style={{background: 'linear-gradient(135deg, #0064E0, #0D8626)'}} />
                  <div {...stylex.props(s.thumbnail)} style={{background: 'linear-gradient(135deg, #5B08D8, #E3193B)'}} />
                  <div {...stylex.props(s.thumbnail)} style={{background: 'linear-gradient(135deg, #0D8626, #0064E0)'}} />
                </div>
              </div>

              <div {...stylex.props(s.group)}>
                <div {...stylex.props(s.groupLabel)}>Checkboxes</div>
                <XDSCheckboxInput label="Enabled" value={checked1} onChange={setChecked1} />
                <XDSCheckboxInput label="Disabled" value={checked2} onChange={setChecked2} />
              </div>
            </div>
          </div>

          <XDSDivider />

          {/* ═══ radius-element ═══ */}
          <div>
            <div {...stylex.props(s.sectionHeader)}>
              <span {...stylex.props(s.sectionTitle)}>radius-element</span>
              <span {...stylex.props(s.sectionToken)}>8dp × multiplier</span>
            </div>
            <div {...stylex.props(s.row)}>
              <div {...stylex.props(s.group)}>
                <div {...stylex.props(s.groupLabel)}>Buttons</div>
                <div style={{display: 'flex', gap: 8}}>
                  <XDSButton label="Primary" variant="primary" />
                  <XDSButton label="Secondary" variant="secondary" />
                  <XDSButton label="Ghost" variant="ghost" />
                </div>
              </div>

              <div {...stylex.props(s.group)}>
                <div {...stylex.props(s.groupLabel)}>Input</div>
                <XDSTextInput label="Name" isLabelHidden placeholder="Enter text..." value={name} onChange={setName} />
              </div>

              <div {...stylex.props(s.group)}>
                <div {...stylex.props(s.groupLabel)}>Text area</div>
                <XDSTextArea label="Message" isLabelHidden placeholder="Write something..." value={message} onChange={setMessage} />
              </div>

              <div {...stylex.props(s.group)}>
                <div {...stylex.props(s.groupLabel)}>Tokens</div>
                <div style={{display: 'flex', gap: 6}}>
                  <XDSToken label="Design" onRemove={() => {}} />
                  <XDSToken label="System" onRemove={() => {}} />
                  <XDSToken label="Radius" onRemove={() => {}} />
                </div>
              </div>
            </div>
          </div>

          <XDSDivider />

          {/* ═══ radius-container ═══ */}
          <div>
            <div {...stylex.props(s.sectionHeader)}>
              <span {...stylex.props(s.sectionTitle)}>radius-container</span>
              <span {...stylex.props(s.sectionToken)}>12dp × multiplier</span>
            </div>
            <div {...stylex.props(s.row)}>
              <div {...stylex.props(s.group)}>
                <div {...stylex.props(s.groupLabel)}>Card</div>
                <XDSCard width={200} padding={0}>
                  <div {...stylex.props(s.cardMedia)} />
                  <div style={{padding: 12}}>
                    <XDSText type="body" weight="bold">Card title</XDSText>
                    <XDSText type="supporting" color="secondary">Grouped content.</XDSText>
                  </div>
                </XDSCard>
              </div>

              <div {...stylex.props(s.group)}>
                <div {...stylex.props(s.groupLabel)}>Modal</div>
                <div {...stylex.props(s.modal)}>
                  <div {...stylex.props(s.modalHeader)}>
                    <span style={{fontSize: 14, fontWeight: 600}}>Confirm action</span>
                    <span style={{color: 'var(--color-text-secondary)', cursor: 'pointer'}}>✕</span>
                  </div>
                  <div {...stylex.props(s.modalBody)}>
                    Are you sure? This cannot be undone.
                  </div>
                  <div {...stylex.props(s.modalFooter)}>
                    <XDSButton label="Cancel" variant="secondary" size="sm" />
                    <XDSButton label="Confirm" variant="primary" size="sm" />
                  </div>
                </div>
              </div>

              <div {...stylex.props(s.group)}>
                <div {...stylex.props(s.groupLabel)}>Dropdown</div>
                <div {...stylex.props(s.dropdown)}>
                  <div {...stylex.props(s.dropdownItem, s.dropdownItemActive)}>Dashboard</div>
                  <div {...stylex.props(s.dropdownItem)}>Settings</div>
                  <div {...stylex.props(s.dropdownItem)}>Profile</div>
                  <div {...stylex.props(s.dropdownItem)}>Log out</div>
                </div>
              </div>

              <div {...stylex.props(s.group)}>
                <div {...stylex.props(s.groupLabel)}>Toasts</div>
                <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                  <div {...stylex.props(s.toast)}>
                    <XDSStatusDot variant="positive" label="Success" />
                    <span>Saved successfully</span>
                  </div>
                  <div {...stylex.props(s.toast)}>
                    <XDSStatusDot variant="negative" label="Error" />
                    <span>Something went wrong</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <XDSDivider />

          {/* ═══ radius-rounded ═══ */}
          <div>
            <div {...stylex.props(s.sectionHeader)}>
              <span {...stylex.props(s.sectionTitle)}>radius-rounded</span>
              <span {...stylex.props(s.sectionToken)}>9999px</span>
              <span {...stylex.props(s.sectionNote)}>
                Always pill · ignores multiplier
              </span>
            </div>
            <div {...stylex.props(s.row)}>
              <div {...stylex.props(s.group)}>
                <div {...stylex.props(s.groupLabel)}>Badges</div>
                <div style={{display: 'flex', gap: 6}}>
                  <XDSBadge variant="info">New</XDSBadge>
                  <XDSBadge variant="success">Active</XDSBadge>
                  <XDSBadge variant="error">Error</XDSBadge>
                  <XDSBadge variant="warning">Pending</XDSBadge>
                </div>
              </div>

              <div {...stylex.props(s.group)}>
                <div {...stylex.props(s.groupLabel)}>Avatars</div>
                <div style={{display: 'flex', gap: 8}}>
                  <XDSAvatar name="John Doe" />
                  <XDSAvatar name="Alice Brown" />
                  <XDSAvatar name="Kim Lee" />
                </div>
              </div>

              <div {...stylex.props(s.group)}>
                <div {...stylex.props(s.groupLabel)}>Status dots</div>
                <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                  <XDSHStack gap={2} vAlign="center">
                    <XDSStatusDot variant="positive" label="Online" />
                    <XDSText type="supporting" color="secondary">Online</XDSText>
                  </XDSHStack>
                  <XDSHStack gap={2} vAlign="center">
                    <XDSStatusDot variant="warning" label="Away" />
                    <XDSText type="supporting" color="secondary">Away</XDSText>
                  </XDSHStack>
                  <XDSHStack gap={2} vAlign="center">
                    <XDSStatusDot variant="negative" label="Busy" />
                    <XDSText type="supporting" color="secondary">Busy</XDSText>
                  </XDSHStack>
                </div>
              </div>

              <div {...stylex.props(s.group)}>
                <div {...stylex.props(s.groupLabel)}>Toggles</div>
                <XDSSwitch label="Notifications" value={switchOn} onChange={setSwitchOn} />
                <XDSSwitch label="Dark mode" value={switchOff} onChange={setSwitchOff} />
              </div>
            </div>
          </div>

          <XDSDivider />

          {/* ═══ Concentric Radius ═══ */}
          <div>
            <div {...stylex.props(s.sectionHeader)}>
              <span {...stylex.props(s.sectionTitle)}>Concentric Radius</span>
              <span {...stylex.props(s.sectionToken)}>
                max(0, outerRadius − padding)
              </span>
            </div>
            <XDSText type="supporting" color="secondary">
              Inner radius = outer minus padding. Nested elements get concentric corners.
            </XDSText>
            <div {...stylex.props(s.row)} style={{marginTop: 16}}>
              {/* Inset media */}
              <div {...stylex.props(s.concentricCard)}>
                <div {...stylex.props(s.concentricMedia)} />
                <div style={{paddingInline: 2, flex: 1}}>
                  <XDSText type="body" weight="semibold">Inset media</XDSText>
                  <div {...stylex.props(s.concentricDetail)}>
                    card: {tokens.container}px, pad: 10px<br />
                    → inner: {Math.max(0, +(tokens.container - 10).toFixed(1))}px
                  </div>
                </div>
                <XDSButton label="Action" variant="primary" size="sm" xstyle={s.concentricBtn} />
              </div>

              {/* Tighter padding */}
              <div {...stylex.props(s.concentricCard)} style={{padding: 8}}>
                <div {...stylex.props(s.concentricMediaTight)} />
                <div style={{paddingInline: 2, flex: 1}}>
                  <XDSText type="body" weight="semibold">Tighter pad</XDSText>
                  <div {...stylex.props(s.concentricDetail)}>
                    card: {tokens.container}px, pad: 8px<br />
                    → inner: {Math.max(0, +(tokens.container - 8).toFixed(1))}px
                  </div>
                </div>
                <XDSButton label="Action" variant="primary" size="sm" xstyle={s.concentricBtnTight} />
              </div>

              {/* Flush media */}
              <div {...stylex.props(s.flushCard)}>
                <div {...stylex.props(s.flushMedia)} />
                <div {...stylex.props(s.flushMeta)}>
                  <XDSText type="body" weight="semibold">Flush media</XDSText>
                  <div {...stylex.props(s.concentricDetail)}>
                    card: {tokens.container}px, pad: 0<br />
                    → inherits card
                  </div>
                </div>
                <XDSButton label="Action" variant="primary" size="sm" xstyle={s.flushBtn} />
              </div>

              {/* Dropdown concentric */}
              <div {...stylex.props(s.group)}>
                <div {...stylex.props(s.groupLabel)}>Dropdown (4px pad)</div>
                <div {...stylex.props(s.dropdown)} style={{width: 190}}>
                  <div {...stylex.props(s.dropdownItem, s.dropdownItemActive)}>Dashboard</div>
                  <div {...stylex.props(s.dropdownItem)}>Settings</div>
                  <div {...stylex.props(s.dropdownItem)}>Profile</div>
                  <div {...stylex.props(s.dropdownItem)}>Log out</div>
                </div>
                <div {...stylex.props(s.concentricDetail)} style={{marginTop: 6}}>
                  menu: {tokens.container}px, pad: 4px<br />
                  → item: {Math.max(0, +(tokens.container - 4).toFixed(1))}px
                </div>
              </div>
            </div>
          </div>
        </div>
      </XDSTheme>
    </div>
  );
}
