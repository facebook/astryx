'use client';

import {useMemo, useState, useCallback} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSButton} from '@xds/core/Button';
import {XDSText} from '@xds/core/Text';
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
import {XDSTheme, defineTheme} from '@xds/core/theme';
import {colorVars, radiusVars} from '@xds/core/theme/tokens.stylex';

// =============================================================================
// Styles — matching the original HTML demo layout exactly
// =============================================================================

const s = stylex.create({
  page: {
    maxWidth: 1100,
    width: '100%',
    paddingBottom: 80,
  },

  // ─── Controls ───
  controls: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backgroundColor: colorVars['--color-wash'],
    paddingBlock: 20,
    paddingInline: 0,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colorVars['--color-divider'],
    marginBottom: 40,
  },
  controlsInner: {
    display: 'flex',
    alignItems: 'center',
    gap: 24,
  },
  controlsLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: colorVars['--color-text-secondary'],
    whiteSpace: 'nowrap',
  },
  sliderWrap: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    maxWidth: 400,
  },
  multiplierVal: {
    fontSize: 16,
    fontWeight: 700,
    color: colorVars['--color-accent'],
    minWidth: 36,
    textAlign: 'right' as const,
    fontVariantNumeric: 'tabular-nums',
  },
  presets: {
    display: 'flex',
    gap: 4,
  },

  // ─── Token bar ───
  tokenBar: {
    display: 'flex',
    gap: 6,
    marginBottom: 40,
    flexWrap: 'wrap',
  },
  tokenChip: {
    display: 'flex',
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

  // ─── Sections ───
  section: {
    marginBottom: 48,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
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

  // ─── Component rows ───
  componentRow: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  componentGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  componentLabel: {
    fontSize: 10,
    color: colorVars['--color-text-secondary'],
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },

  // ─── radius-none demos ───
  divider: {
    height: 1,
    backgroundColor: colorVars['--color-divider-emphasized'],
    borderRadius: 0,
    width: 200,
  },
  table: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-divider-emphasized'],
    borderRadius: 0,
    overflow: 'hidden',
    fontSize: 13,
    width: 340,
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
  fullBleed: {
    backgroundColor: colorVars['--color-deemphasized'],
    borderRadius: 0,
    paddingBlock: 16,
    paddingInline: 20,
    fontSize: 13,
    color: colorVars['--color-text-secondary'],
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: colorVars['--color-divider'],
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colorVars['--color-divider'],
    width: 340,
  },
  sidePanel: {
    backgroundColor: colorVars['--color-surface'],
    borderRadius: 0,
    borderRightWidth: 1,
    borderRightStyle: 'solid',
    borderRightColor: colorVars['--color-divider'],
    padding: 16,
    width: 180,
    height: 140,
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

  // ─── radius-content demos ───
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
    width: 320,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: radiusVars['--radius-content'],
    flexShrink: 0,
  },

  // ─── radius-container demos ───
  cardMedia: {
    width: '100%',
    height: 110,
    background: 'linear-gradient(135deg, #0064E0, #5B08D8)',
  },
  modal: {
    backgroundColor: colorVars['--color-surface'],
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-divider-emphasized'],
    borderRadius: radiusVars['--radius-container'],
    width: 280,
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
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
  popover: {
    backgroundColor: colorVars['--color-surface'],
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-divider-emphasized'],
    borderRadius: radiusVars['--radius-container'],
    paddingBlock: 14,
    paddingInline: 16,
    width: 200,
    boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
  },
  dropdown: {
    backgroundColor: colorVars['--color-surface'],
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-divider-emphasized'],
    borderRadius: radiusVars['--radius-container'],
    padding: 4,
    width: 170,
    boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
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
    width: 260,
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  },
  toastIcon: {
    width: 22,
    height: 22,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 700,
    flexShrink: 0,
  },
  toastIconSuccess: {
    backgroundColor: colorVars['--color-positive-deemphasized'],
    color: colorVars['--color-positive'],
  },
  toastIconError: {
    backgroundColor: colorVars['--color-negative-deemphasized'],
    color: colorVars['--color-negative'],
  },
  toastIconWarning: {
    backgroundColor: colorVars['--color-warning-deemphasized'],
    color: colorVars['--color-warning'],
  },

  // ─── Concentric demos ───
  concentricGrid: {
    display: 'flex',
    gap: 16,
    flexWrap: 'wrap',
  },
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
    padding: 0,
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
  flushMeta: {
    padding: 10,
    flex: 1,
  },
  flushBtn: {
    borderRadius: `max(0px, calc(${radiusVars['--radius-container']} - 10px))`,
    marginInline: 10,
    marginBottom: 10,
    width: 'calc(100% - 20px)',
  },
  sep: {
    width: '100%',
    height: 1,
    backgroundColor: colorVars['--color-divider'],
    marginBlock: 8,
  },
});

// =============================================================================
// Constants & helpers
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
  const [email, setEmail] = useState('');
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
        {/* ─── Controls ─── */}
        <div {...stylex.props(s.controls)}>
          <div {...stylex.props(s.controlsInner)}>
            <span {...stylex.props(s.controlsLabel)}>Radius Multiplier</span>
            <div {...stylex.props(s.sliderWrap)}>
              <XDSSlider
                label="Radius Multiplier"
                isLabelHidden
                value={multiplier}
                onChange={setMultiplier}
                min={0}
                max={2}
                step={0.05}
              />
              <span {...stylex.props(s.multiplierVal)}>{multiplier}×</span>
            </div>
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
          </div>
        </div>

        {/* ─── Token readout ─── */}
        <div {...stylex.props(s.tokenBar)}>
          {Object.entries(tokens).map(([n, val]) => (
            <div key={n} {...stylex.props(s.tokenChip)}>
              <span {...stylex.props(s.tokenName)}>{n}</span>
              <span {...stylex.props(s.tokenVal)}>{val}px</span>
            </div>
          ))}
        </div>

        {/* ═══════════════════════════════════════════
            radius-none
            ═══════════════════════════════════════════ */}
        <div {...stylex.props(s.section)}>
          <div {...stylex.props(s.sectionHeader)}>
            <span {...stylex.props(s.sectionTitle)}>radius-none</span>
            <span {...stylex.props(s.sectionToken)}>0dp</span>
            <span {...stylex.props(s.sectionNote)}>
              Always 0 · ignores multiplier
            </span>
          </div>
          <div {...stylex.props(s.componentRow)}>
            <div {...stylex.props(s.componentGroup)}>
              <div {...stylex.props(s.componentLabel)}>Divider</div>
              <div {...stylex.props(s.divider)} />
            </div>

            <div {...stylex.props(s.componentGroup)}>
              <div {...stylex.props(s.componentLabel)}>Table cells</div>
              <div {...stylex.props(s.table)}>
                <div {...stylex.props(s.tableHeader)}>
                  <span>Name</span>
                  <span>Role</span>
                  <span>Status</span>
                </div>
                <div {...stylex.props(s.tableRow)}>
                  <span>Alice</span>
                  <span>Design</span>
                  <span style={{color: 'var(--color-positive)'}}>Active</span>
                </div>
                <div {...stylex.props(s.tableRow)}>
                  <span>Bob</span>
                  <span>Eng</span>
                  <span style={{color: 'var(--color-positive)'}}>Active</span>
                </div>
                <div {...stylex.props(s.tableRowLast)}>
                  <span>Charlie</span>
                  <span>PM</span>
                  <span style={{color: 'var(--color-warning)'}}>Away</span>
                </div>
              </div>
            </div>

            <div {...stylex.props(s.componentGroup)}>
              <div {...stylex.props(s.componentLabel)}>Full-bleed section</div>
              <div {...stylex.props(s.fullBleed)}>
                Full-bleed content section — no radius
              </div>
            </div>

            <div {...stylex.props(s.componentGroup)}>
              <div {...stylex.props(s.componentLabel)}>Side panel</div>
              <div {...stylex.props(s.sidePanel)}>
                <div {...stylex.props(s.sidePanelItem, s.sidePanelItemActive)}>
                  Dashboard
                </div>
                <div {...stylex.props(s.sidePanelItem)}>Analytics</div>
                <div {...stylex.props(s.sidePanelItem)}>Settings</div>
                <div {...stylex.props(s.sidePanelItem)}>Team</div>
              </div>
            </div>

            <div {...stylex.props(s.componentGroup)}>
              <div {...stylex.props(s.componentLabel)}>
                Shared edges (button group)
              </div>
              <div style={{display: 'flex'}}>
                <XDSButton label="Day" variant="primary" size="sm" />
                <XDSButton label="Week" variant="secondary" size="sm" />
                <XDSButton label="Month" variant="secondary" size="sm" />
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            radius-content
            ═══════════════════════════════════════════ */}
        <div {...stylex.props(s.section)}>
          <div {...stylex.props(s.sectionHeader)}>
            <span {...stylex.props(s.sectionTitle)}>radius-content</span>
            <span {...stylex.props(s.sectionToken)}>4dp × multiplier</span>
          </div>
          <div {...stylex.props(s.componentRow)}>
            <div {...stylex.props(s.componentGroup)}>
              <div {...stylex.props(s.componentLabel)}>Code block</div>
              <div {...stylex.props(s.codeBlock)}>
                <span style={{color: '#5B08D8'}}>const</span> radius ={' '}
                <span style={{color: '#0064E0'}}>max</span>(
                <span style={{color: '#E9AF08'}}>0</span>, outer - padding);
                <br />
                <span style={{color: '#5B08D8'}}>const</span> theme ={' '}
                <span style={{color: '#0D8626'}}>&apos;default&apos;</span>;
              </div>
            </div>

            <div {...stylex.props(s.componentGroup)}>
              <div {...stylex.props(s.componentLabel)}>Thumbnails</div>
              <div style={{display: 'flex', gap: 8}}>
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
                <div
                  {...stylex.props(s.thumbnail)}
                  style={{
                    background: 'linear-gradient(135deg, #0D8626, #0064E0)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            radius-element
            ═══════════════════════════════════════════ */}
        <div {...stylex.props(s.section)}>
          <div {...stylex.props(s.sectionHeader)}>
            <span {...stylex.props(s.sectionTitle)}>radius-element</span>
            <span {...stylex.props(s.sectionToken)}>8dp × multiplier</span>
          </div>
          <div {...stylex.props(s.componentRow)}>
            <div {...stylex.props(s.componentGroup)}>
              <div {...stylex.props(s.componentLabel)}>Buttons</div>
              <div style={{display: 'flex', gap: 8}}>
                <XDSButton label="Primary" variant="primary" />
                <XDSButton label="Secondary" variant="secondary" />
                <XDSButton label="Ghost" variant="ghost" />
              </div>
            </div>

            <div {...stylex.props(s.componentGroup)}>
              <div {...stylex.props(s.componentLabel)}>Inputs</div>
              <XDSTextInput
                label="Name"
                isLabelHidden
                placeholder="Enter text..."
                value={name}
                onChange={setName}
              />
            </div>

            <div {...stylex.props(s.componentGroup)}>
              <div {...stylex.props(s.componentLabel)}>Text areas</div>
              <XDSTextArea
                label="Message"
                isLabelHidden
                placeholder="Write something..."
                value={message}
                onChange={setMessage}
              />
            </div>

            <div {...stylex.props(s.componentGroup)}>
              <div {...stylex.props(s.componentLabel)}>Tokens</div>
              <div style={{display: 'flex', gap: 6}}>
                <XDSToken label="Design" onRemove={() => {}} />
                <XDSToken label="System" onRemove={() => {}} />
                <XDSToken label="Radius" onRemove={() => {}} />
              </div>
            </div>

            <div {...stylex.props(s.componentGroup)}>
              <div {...stylex.props(s.componentLabel)}>Checkboxes</div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}>
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
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            radius-container
            ═══════════════════════════════════════════ */}
        <div {...stylex.props(s.section)}>
          <div {...stylex.props(s.sectionHeader)}>
            <span {...stylex.props(s.sectionTitle)}>radius-container</span>
            <span {...stylex.props(s.sectionToken)}>12dp × multiplier</span>
          </div>
          <div {...stylex.props(s.componentRow)}>
            <div {...stylex.props(s.componentGroup)}>
              <div {...stylex.props(s.componentLabel)}>Card</div>
              <XDSCard width={220} padding={0}>
                <div {...stylex.props(s.cardMedia)} />
                <div style={{padding: 14}}>
                  <div style={{fontWeight: 600, marginBottom: 4, fontSize: 14}}>
                    Card title
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.4,
                    }}>
                    A container for grouped content and actions.
                  </div>
                </div>
              </XDSCard>
            </div>

            <div {...stylex.props(s.componentGroup)}>
              <div {...stylex.props(s.componentLabel)}>Modal</div>
              <div {...stylex.props(s.modal)}>
                <div {...stylex.props(s.modalHeader)}>
                  <span style={{fontSize: 15, fontWeight: 600}}>
                    Confirm action
                  </span>
                  <span
                    style={{
                      color: 'var(--color-text-secondary)',
                      cursor: 'pointer',
                      fontSize: 16,
                    }}>
                    ✕
                  </span>
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
              <div {...stylex.props(s.componentLabel)}>Popover</div>
              <div {...stylex.props(s.popover)}>
                <div style={{fontSize: 13, fontWeight: 600, marginBottom: 4}}>
                  Popover title
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.4,
                  }}>
                  Additional context or actions shown on hover or click.
                </div>
              </div>
            </div>

            <div {...stylex.props(s.componentGroup)}>
              <div {...stylex.props(s.componentLabel)}>Dropdown menu</div>
              <div {...stylex.props(s.dropdown)}>
                <div {...stylex.props(s.dropdownItem, s.dropdownItemActive)}>
                  Dashboard
                </div>
                <div {...stylex.props(s.dropdownItem)}>Settings</div>
                <div {...stylex.props(s.dropdownItem)}>Profile</div>
                <div {...stylex.props(s.dropdownItem)}>Log out</div>
              </div>
            </div>

            <div {...stylex.props(s.componentGroup)}>
              <div {...stylex.props(s.componentLabel)}>Toasts</div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}>
                <div {...stylex.props(s.toast)}>
                  <div {...stylex.props(s.toastIcon, s.toastIconSuccess)}>
                    ✓
                  </div>
                  <span>Saved successfully</span>
                </div>
                <div {...stylex.props(s.toast)}>
                  <div {...stylex.props(s.toastIcon, s.toastIconError)}>✕</div>
                  <span>Something went wrong</span>
                </div>
                <div {...stylex.props(s.toast)}>
                  <div {...stylex.props(s.toastIcon, s.toastIconWarning)}>
                    !
                  </div>
                  <span>Unsaved changes</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            radius-rounded
            ═══════════════════════════════════════════ */}
        <div {...stylex.props(s.section)}>
          <div {...stylex.props(s.sectionHeader)}>
            <span {...stylex.props(s.sectionTitle)}>radius-rounded</span>
            <span {...stylex.props(s.sectionToken)}>9999px</span>
            <span {...stylex.props(s.sectionNote)}>
              Always pill · ignores multiplier
            </span>
          </div>
          <div {...stylex.props(s.componentRow)}>
            <div {...stylex.props(s.componentGroup)}>
              <div {...stylex.props(s.componentLabel)}>Badges</div>
              <div style={{display: 'flex', gap: 6}}>
                <XDSBadge variant="info">New</XDSBadge>
                <XDSBadge variant="success">Active</XDSBadge>
                <XDSBadge variant="error">Error</XDSBadge>
                <XDSBadge variant="warning">Pending</XDSBadge>
              </div>
            </div>

            <div {...stylex.props(s.componentGroup)}>
              <div {...stylex.props(s.componentLabel)}>Avatars</div>
              <div style={{display: 'flex', gap: 8}}>
                <XDSAvatar name="John Doe" />
                <XDSAvatar name="Alice Brown" />
                <XDSAvatar name="Kim Lee" />
              </div>
            </div>

            <div {...stylex.props(s.componentGroup)}>
              <div {...stylex.props(s.componentLabel)}>Status dots</div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}>
                <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
                  <XDSStatusDot variant="positive" label="Online" />
                  <span
                    style={{
                      fontSize: 12,
                      color: 'var(--color-text-secondary)',
                    }}>
                    Online
                  </span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
                  <XDSStatusDot variant="warning" label="Away" />
                  <span
                    style={{
                      fontSize: 12,
                      color: 'var(--color-text-secondary)',
                    }}>
                    Away
                  </span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
                  <XDSStatusDot variant="negative" label="Busy" />
                  <span
                    style={{
                      fontSize: 12,
                      color: 'var(--color-text-secondary)',
                    }}>
                    Busy
                  </span>
                </div>
              </div>
            </div>

            <div {...stylex.props(s.componentGroup)}>
              <div {...stylex.props(s.componentLabel)}>Toggles</div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}>
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
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            Concentric Radius
            ═══════════════════════════════════════════ */}
        <div {...stylex.props(s.section)}>
          <div {...stylex.props(s.sectionHeader)}>
            <span {...stylex.props(s.sectionTitle)}>Concentric Radius</span>
            <span {...stylex.props(s.sectionToken)}>
              max(0, outerRadius − padding)
            </span>
          </div>
          <div {...stylex.props(s.concentricGrid)}>
            {/* Inset media */}
            <div {...stylex.props(s.concentricCard)}>
              <div {...stylex.props(s.concentricMedia)} />
              <div style={{paddingInline: 2, flex: 1}}>
                <div {...stylex.props(s.concentricTitle)}>Inset media</div>
                <div {...stylex.props(s.concentricDetail)}>
                  card: {tokens.container}px, pad: 10px
                  <br />→ inner:{' '}
                  {Math.max(0, +(tokens.container - 10).toFixed(1))}px
                </div>
              </div>
              <XDSButton
                label="Action"
                variant="primary"
                size="sm"
                xstyle={s.concentricBtn}
              />
            </div>

            {/* Tighter padding */}
            <div {...stylex.props(s.concentricCard)} style={{padding: 8}}>
              <div {...stylex.props(s.concentricMediaTight)} />
              <div style={{paddingInline: 2, flex: 1}}>
                <div {...stylex.props(s.concentricTitle)}>Tighter padding</div>
                <div {...stylex.props(s.concentricDetail)}>
                  card: {tokens.container}px, pad: 8px
                  <br />→ inner:{' '}
                  {Math.max(0, +(tokens.container - 8).toFixed(1))}px
                </div>
              </div>
              <XDSButton
                label="Action"
                variant="primary"
                size="sm"
                xstyle={s.concentricBtnTight}
              />
            </div>

            {/* Flush media */}
            <div {...stylex.props(s.flushCard)}>
              <div {...stylex.props(s.flushMedia)} />
              <div {...stylex.props(s.flushMeta)}>
                <div {...stylex.props(s.concentricTitle)}>Flush media</div>
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

            {/* Dropdown menu */}
            <div>
              <div
                {...stylex.props(s.componentLabel)}
                style={{marginBottom: 8}}>
                Dropdown menu
              </div>
              <div {...stylex.props(s.dropdown)} style={{width: 200}}>
                <div {...stylex.props(s.dropdownItem, s.dropdownItemActive)}>
                  Dashboard
                </div>
                <div {...stylex.props(s.dropdownItem)}>Settings</div>
                <div {...stylex.props(s.dropdownItem)}>Profile</div>
                <div {...stylex.props(s.dropdownItem)}>Log out</div>
              </div>
              <div {...stylex.props(s.concentricDetail)} style={{marginTop: 8}}>
                menu: {tokens.container}px, pad: 4px
                <br />→ item: {Math.max(0, +(tokens.container - 4).toFixed(1))}
                px
              </div>
            </div>
          </div>
        </div>
      </XDSTheme>
    </div>
  );
}
