'use client';

import {useMemo, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSTheme, defineTheme} from '@xds/core/theme';
import {colorVars, radiusVars} from '@xds/core/theme/tokens.stylex';

const s = stylex.create({
  page: {maxWidth: 900, paddingBottom: 80},
  pageDesc: {marginBottom: 32},
  controls: {
    backgroundColor: colorVars['--color-wash'],
    paddingBlock: 16,
    paddingInline: 32,
    marginLeft: -32,
    width: '100vw',
    marginBottom: 32,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  controlsLabel: {
    fontSize: 12, fontWeight: 600,
    color: colorVars['--color-text-secondary'],
    textTransform: 'uppercase', letterSpacing: '0.05em',
  },
  sliderRow: {display: 'flex', alignItems: 'center', gap: 16, maxWidth: 400},
  sliderVal: {
    fontSize: 14, fontWeight: 600, minWidth: 40,
    textAlign: 'right' as const, fontVariantNumeric: 'tabular-nums',
  },
  presets: {display: 'flex', gap: 6},
  presetBtn: {
    paddingBlock: 6, paddingInline: 14, borderRadius: 8,
    borderWidth: 1, borderStyle: 'solid',
    borderColor: colorVars['--color-divider-emphasized'],
    backgroundColor: '#fff', color: colorVars['--color-text-primary'],
    fontSize: 13, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer',
  },
  presetBtnActive: {
    backgroundColor: colorVars['--color-accent'],
    borderColor: colorVars['--color-accent'], color: '#fff',
  },
  tokenBar: {display: 'flex', gap: 8, flexWrap: 'wrap'},
  tokenChip: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    paddingBlock: 4, paddingInline: 10,
    backgroundColor: '#fff',
    borderWidth: 1, borderStyle: 'solid',
    borderColor: colorVars['--color-divider-emphasized'],
    borderRadius: 6, fontFamily: 'monospace', fontSize: 11,
  },
  tokenName: {color: colorVars['--color-text-secondary']},
  tokenVal: {color: colorVars['--color-accent'], fontWeight: 600},
  section: {marginBottom: 48},
  sectionHeader: {display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20},
  sectionTitle: {
    fontSize: 13, fontWeight: 600, textTransform: 'uppercase',
    letterSpacing: 1, color: colorVars['--color-text-secondary'],
  },
  sectionToken: {fontSize: 11, color: colorVars['--color-text-secondary'], fontFamily: 'monospace'},
  sectionNote: {fontSize: 11, color: colorVars['--color-text-secondary'], marginLeft: 'auto'},
  divider: {height: 1, backgroundColor: colorVars['--color-divider'], marginBottom: 48},
  componentRow: {display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start'},
  componentGroup: {display: 'flex', flexDirection: 'column', gap: 8},
  componentLabel: {
    fontSize: 10, color: colorVars['--color-text-secondary'],
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4,
  },
  // radius-none
  table: {
    borderWidth: 1, borderStyle: 'solid', borderColor: colorVars['--color-divider-emphasized'],
    borderRadius: 0, overflow: 'hidden', fontSize: 13, width: 320,
  },
  tableHeader: {
    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
    backgroundColor: colorVars['--color-deemphasized'],
    paddingBlock: 8, paddingInline: 12, fontWeight: 600, fontSize: 11,
    color: colorVars['--color-text-secondary'],
    textTransform: 'uppercase', letterSpacing: 0.5,
    borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: colorVars['--color-divider'],
  },
  tableRow: {
    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
    paddingBlock: 8, paddingInline: 12,
    borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: colorVars['--color-divider'],
  },
  tableRowLast: {
    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', paddingBlock: 8, paddingInline: 12,
  },
  sidePanel: {
    backgroundColor: colorVars['--color-surface'], borderRadius: 0,
    borderWidth: 1, borderStyle: 'solid', borderColor: colorVars['--color-divider-emphasized'],
    padding: 16, width: 180, display: 'flex', flexDirection: 'column', gap: 2,
  },
  sideItem: {
    paddingBlock: 6, paddingInline: 10, fontSize: 12,
    color: colorVars['--color-text-secondary'],
    borderRadius: radiusVars['--radius-element'], cursor: 'pointer',
  },
  sideItemActive: {
    backgroundColor: colorVars['--color-accent-deemphasized'],
    color: colorVars['--color-accent-text'],
  },
  btnGroup: {display: 'flex'},
  btn: {
    paddingBlock: 8, paddingInline: 16, borderRadius: radiusVars['--radius-element'],
    fontSize: 14, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer',
    borderWidth: 1, borderStyle: 'solid', borderColor: 'transparent',
  },
  btnSm: {paddingBlock: 6, paddingInline: 14, fontSize: 13},
  btnPrimary: {backgroundColor: colorVars['--color-accent'], color: '#fff'},
  btnSecondary: {
    backgroundColor: colorVars['--color-deemphasized'],
    color: colorVars['--color-text-primary'],
    borderColor: colorVars['--color-divider-emphasized'],
  },
  btnFlat: {backgroundColor: 'transparent', color: colorVars['--color-text-primary']},
  btnGroupFirst: {
    borderStartStartRadius: radiusVars['--radius-element'],
    borderEndStartRadius: radiusVars['--radius-element'],
    borderStartEndRadius: 0, borderEndEndRadius: 0,
  },
  btnGroupMiddle: {borderRadius: 0, marginLeft: -1},
  btnGroupLast: {
    borderStartStartRadius: 0, borderEndStartRadius: 0,
    borderStartEndRadius: radiusVars['--radius-element'],
    borderEndEndRadius: radiusVars['--radius-element'],
    marginLeft: -1,
  },
  input: {
    paddingBlock: 8, paddingInline: 12, borderRadius: radiusVars['--radius-element'],
    borderWidth: 1, borderStyle: 'solid', borderColor: colorVars['--color-divider-emphasized'],
    backgroundColor: '#fff', color: colorVars['--color-text-primary'],
    fontSize: 14, fontFamily: 'inherit', outline: 'none', width: 180,
  },
  textarea: {
    paddingBlock: 8, paddingInline: 12, borderRadius: radiusVars['--radius-element'],
    borderWidth: 1, borderStyle: 'solid', borderColor: colorVars['--color-divider-emphasized'],
    backgroundColor: '#fff', color: colorVars['--color-text-primary'],
    fontSize: 14, fontFamily: 'inherit', outline: 'none', width: 200, height: 60,
    resize: 'vertical' as const,
  },
  codeBlock: {
    backgroundColor: colorVars['--color-deemphasized'],
    borderWidth: 1, borderStyle: 'solid', borderColor: colorVars['--color-divider'],
    borderRadius: radiusVars['--radius-content'],
    paddingBlock: 12, paddingInline: 14, fontFamily: 'monospace',
    fontSize: 12, color: colorVars['--color-text-secondary'], lineHeight: 1.6, width: 300,
  },
  thumb: {width: 48, height: 48, borderRadius: radiusVars['--radius-content'], flexShrink: 0},
  xdsToken: {
    display: 'inline-flex', alignItems: 'center', gap: 4, paddingInline: 8, height: 24,
    borderRadius: radiusVars['--radius-content'],
    backgroundColor: colorVars['--color-deemphasized'], fontSize: 13, fontWeight: 500,
  },
  xdsTokenX: {fontSize: 13, opacity: 0.5, cursor: 'pointer'},
  xdsCard: {
    backgroundColor: colorVars['--color-card'], borderRadius: radiusVars['--radius-container'],
    borderWidth: 1, borderStyle: 'solid', borderColor: colorVars['--color-divider-emphasized'],
    boxShadow: '0 0 1px rgba(5,54,89,0.1)', overflow: 'hidden', width: 200,
  },
  cardMedia: {width: '100%', height: 100, background: 'linear-gradient(135deg, #0064E0, #5B08D8)'},
  cardBody: {padding: 12},
  cardTitle: {fontWeight: 600, fontSize: 14, marginBottom: 4},
  cardDesc: {fontSize: 12, color: colorVars['--color-text-secondary']},
  modal: {
    backgroundColor: colorVars['--color-surface'],
    borderWidth: 1, borderStyle: 'solid', borderColor: colorVars['--color-divider-emphasized'],
    borderRadius: radiusVars['--radius-container'], width: 260, overflow: 'hidden',
    boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
  },
  modalHeader: {
    paddingTop: 14, paddingBottom: 10, paddingInline: 16,
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  modalTitle: {fontSize: 14, fontWeight: 600},
  modalClose: {color: colorVars['--color-text-secondary'], cursor: 'pointer'},
  modalBody: {paddingInline: 16, paddingBottom: 14, fontSize: 13, color: colorVars['--color-text-secondary'], lineHeight: 1.5},
  modalFooter: {
    paddingBlock: 10, paddingInline: 16,
    borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: colorVars['--color-divider'],
    display: 'flex', justifyContent: 'flex-end', gap: 8,
  },
  dropdown: {
    backgroundColor: colorVars['--color-surface'],
    borderWidth: 1, borderStyle: 'solid', borderColor: colorVars['--color-divider-emphasized'],
    borderRadius: radiusVars['--radius-container'], padding: 4, width: 170,
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
  },
  dropdownItem: {
    paddingBlock: 7, paddingInline: 10, fontSize: 13, cursor: 'pointer',
    borderRadius: `max(0px, calc(${radiusVars['--radius-container']} - 4px))`,
  },
  dropdownItemActive: {backgroundColor: colorVars['--color-hover-overlay']},
  toast: {
    backgroundColor: colorVars['--color-surface'],
    borderWidth: 1, borderStyle: 'solid', borderColor: colorVars['--color-divider-emphasized'],
    borderRadius: radiusVars['--radius-container'],
    paddingBlock: 10, paddingInline: 14, display: 'flex', alignItems: 'center', gap: 10,
    fontSize: 13, width: 240, boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  toastDot: {width: 10, height: 10, borderRadius: '50%', flexShrink: 0},
  badge: {display: 'inline-flex', paddingBlock: 2, paddingInline: 8, borderRadius: radiusVars['--radius-rounded'], fontSize: 11, fontWeight: 600},
  badgeInfo: {backgroundColor: colorVars['--color-blue-background'], color: colorVars['--color-blue-text']},
  badgeSuccess: {backgroundColor: colorVars['--color-green-background'], color: colorVars['--color-green-text']},
  badgeError: {backgroundColor: colorVars['--color-red-background'], color: colorVars['--color-red-text']},
  badgeWarning: {backgroundColor: colorVars['--color-orange-background'], color: colorVars['--color-orange-text']},
  avatar: {
    width: 36, height: 36, borderRadius: radiusVars['--radius-rounded'],
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 600, color: '#fff',
  },
  statusDot: {width: 10, height: 10, borderRadius: '50%'},
  statusRow: {display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: colorVars['--color-text-secondary']},
  switchEl: {width: 40, height: 24, borderRadius: radiusVars['--radius-rounded'], padding: 4, cursor: 'pointer'},
  switchOff: {backgroundColor: 'rgba(10,19,23,0.12)'},
  switchOn: {backgroundColor: colorVars['--color-accent']},
  switchThumb: {width: 16, height: 16, borderRadius: radiusVars['--radius-rounded'], backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'},
  switchThumbOn: {transform: 'translateX(16px)'},
  switchRow: {display: 'flex', alignItems: 'center', gap: 8, fontSize: 14},
  concentricCard: {
    backgroundColor: colorVars['--color-surface'],
    borderWidth: 1, borderStyle: 'solid', borderColor: colorVars['--color-divider-emphasized'],
    borderRadius: radiusVars['--radius-container'], padding: 10, width: 190,
    display: 'flex', flexDirection: 'column',
  },
  concentricMedia: {
    width: '100%', height: 80, background: 'linear-gradient(135deg, #0064E0, #5B08D8)',
    borderRadius: `max(0px, calc(${radiusVars['--radius-container']} - 10px))`, marginBottom: 8,
  },
  concentricMediaTight: {
    width: '100%', height: 80, background: 'linear-gradient(135deg, #0064E0, #5B08D8)',
    borderRadius: `max(0px, calc(${radiusVars['--radius-container']} - 8px))`, marginBottom: 8,
  },
  concentricTitle: {fontSize: 13, fontWeight: 500, marginBottom: 2},
  concentricDetail: {fontSize: 11, fontFamily: 'monospace', color: colorVars['--color-text-secondary'], lineHeight: 1.5},
  concentricBtn: {
    display: 'block', width: '100%', paddingBlock: 6, paddingInline: 14, marginTop: 8,
    backgroundColor: colorVars['--color-accent'], color: '#fff',
    borderWidth: 0, fontSize: 12, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer',
    borderRadius: `max(0px, calc(${radiusVars['--radius-container']} - 10px))`,
  },
  concentricBtnTight: {borderRadius: `max(0px, calc(${radiusVars['--radius-container']} - 8px))`},
  flushCard: {
    backgroundColor: colorVars['--color-surface'],
    borderWidth: 1, borderStyle: 'solid', borderColor: colorVars['--color-divider-emphasized'],
    borderRadius: radiusVars['--radius-container'], width: 190, overflow: 'hidden',
    display: 'flex', flexDirection: 'column',
  },
  flushMedia: {width: '100%', height: 80, background: 'linear-gradient(135deg, #0064E0, #5B08D8)'},
  flushBody: {padding: 4, flex: 1},
  flushBtn: {
    display: 'block', width: 'calc(100% - 8px)', marginTop: 0, marginBottom: 4, marginInline: 4,
    paddingBlock: 6, paddingInline: 14,
    backgroundColor: colorVars['--color-accent'], color: '#fff',
    borderWidth: 0, fontSize: 12, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer',
    borderRadius: `max(0px, calc(${radiusVars['--radius-container']} - 4px))`,
  },
  slider: {flex: 1, height: 4, borderRadius: 2},
});

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
    'radius-none': 0,
    'radius-content': +(BASE.content * m).toFixed(1),
    'radius-element': +(BASE.element * m).toFixed(1),
    'radius-container': +(BASE.container * m).toFixed(1),
    'radius-rounded': 9999,
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

export default function RadiusPage() {
  const [multiplier, setMultiplier] = useState(1);
  const tokens = useMemo(() => computeTokens(multiplier), [multiplier]);
  const theme = useMemo(() => makeTheme(multiplier), [multiplier]);
  const ct = tokens['radius-container'];

  return (
    <div {...stylex.props(s.page)}>
      <XDSHeading level={1}>Corner Radius</XDSHeading>
      <div {...stylex.props(s.pageDesc)}>
        <XDSText type="body" color="secondary">Dynamic radius with semantic usage</XDSText>
      </div>

      <XDSTheme theme={theme}>
        {/* Controls */}
        <div {...stylex.props(s.controls)}>
          <span {...stylex.props(s.controlsLabel)}>Radius Multiplier</span>
          <div {...stylex.props(s.sliderRow)}>
            <input
              {...stylex.props(s.slider)}
              type="range" min={0} max={2} step={0.05} value={multiplier}
              onChange={(e) => setMultiplier(parseFloat(e.target.value))}
              style={{accentColor: 'var(--color-accent)'}}
            />
            <span {...stylex.props(s.sliderVal)}>{multiplier}&times;</span>
          </div>
          <div {...stylex.props(s.presets)}>
            {PRESETS.map((p) => (
              <button key={p.name} {...stylex.props(s.presetBtn, multiplier === p.value && s.presetBtnActive)} onClick={() => setMultiplier(p.value)}>
                {p.name}
              </button>
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
        </div>

        <div {...stylex.props(s.divider)} />

        {/* radius-none */}
        <div {...stylex.props(s.section)}>
          <div {...stylex.props(s.sectionHeader)}>
            <span {...stylex.props(s.sectionTitle)}>radius-none</span>
            <span {...stylex.props(s.sectionToken)}>0dp</span>
            <span {...stylex.props(s.sectionNote)}>Always 0 &middot; ignores multiplier</span>
          </div>
          <div {...stylex.props(s.componentRow)}>
            <div {...stylex.props(s.componentGroup)}>
              <div {...stylex.props(s.componentLabel)}>Table cells</div>
              <div {...stylex.props(s.table)}>
                <div {...stylex.props(s.tableHeader)}><span>Name</span><span>Role</span><span>Status</span></div>
                <div {...stylex.props(s.tableRow)}><span>Alice</span><span>Design</span><span style={{color: 'var(--color-positive)'}}>Active</span></div>
                <div {...stylex.props(s.tableRowLast)}><span>Bob</span><span>Eng</span><span style={{color: 'var(--color-positive)'}}>Active</span></div>
              </div>
            </div>
            <div {...stylex.props(s.componentGroup)}>
              <div {...stylex.props(s.componentLabel)}>Side panel</div>
              <div {...stylex.props(s.sidePanel)}>
                <div {...stylex.props(s.sideItem, s.sideItemActive)}>Dashboard</div>
                <div {...stylex.props(s.sideItem)}>Analytics</div>
                <div {...stylex.props(s.sideItem)}>Settings</div>
              </div>
            </div>
            <div {...stylex.props(s.componentGroup)}>
              <div {...stylex.props(s.componentLabel)}>Shared edges (button group)</div>
              <div {...stylex.props(s.btnGroup)}>
                <button {...stylex.props(s.btn, s.btnSm, s.btnPrimary, s.btnGroupFirst)}>Day</button>
                <button {...stylex.props(s.btn, s.btnSm, s.btnSecondary, s.btnGroupMiddle)}>Week</button>
                <button {...stylex.props(s.btn, s.btnSm, s.btnSecondary, s.btnGroupLast)}>Month</button>
              </div>
            </div>
          </div>
        </div>

        <div {...stylex.props(s.divider)} />

        {/* radius-content */}
        <div {...stylex.props(s.section)}>
          <div {...stylex.props(s.sectionHeader)}>
            <span {...stylex.props(s.sectionTitle)}>radius-content</span>
            <span {...stylex.props(s.sectionToken)}>4dp &times; multiplier</span>
          </div>
          <div {...stylex.props(s.componentRow)}>
            <div {...stylex.props(s.componentGroup)}>
              <div {...stylex.props(s.componentLabel)}>Code block</div>
              <div {...stylex.props(s.codeBlock)}>
                <span style={{color: '#5B08D8'}}>const</span> radius = <span style={{color: '#0064E0'}}>max</span>(<span style={{color: '#E9AF08'}}>0</span>, outer - padding);<br />
                <span style={{color: '#5B08D8'}}>const</span> theme = <span style={{color: '#0D8626'}}>&apos;default&apos;</span>;
              </div>
            </div>
            <div {...stylex.props(s.componentGroup)}>
              <div {...stylex.props(s.componentLabel)}>Thumbnails</div>
              <div style={{display: 'flex', gap: 8}}>
                <div {...stylex.props(s.thumb)} style={{background: 'linear-gradient(135deg,#E9AF08,#E3193B)'}} />
                <div {...stylex.props(s.thumb)} style={{background: 'linear-gradient(135deg,#0064E0,#0D8626)'}} />
                <div {...stylex.props(s.thumb)} style={{background: 'linear-gradient(135deg,#5B08D8,#E3193B)'}} />
                <div {...stylex.props(s.thumb)} style={{background: 'linear-gradient(135deg,#0D8626,#0064E0)'}} />
              </div>
            </div>
          </div>
        </div>

        <div {...stylex.props(s.divider)} />

        {/* radius-element */}
        <div {...stylex.props(s.section)}>
          <div {...stylex.props(s.sectionHeader)}>
            <span {...stylex.props(s.sectionTitle)}>radius-element</span>
            <span {...stylex.props(s.sectionToken)}>8dp &times; multiplier</span>
          </div>
          <div {...stylex.props(s.componentRow)}>
            <div {...stylex.props(s.componentGroup)}>
              <div {...stylex.props(s.componentLabel)}>Buttons</div>
              <div style={{display: 'flex', gap: 8}}>
                <button {...stylex.props(s.btn, s.btnPrimary)}>Primary</button>
                <button {...stylex.props(s.btn, s.btnSecondary)}>Secondary</button>
                <button {...stylex.props(s.btn, s.btnFlat)}>Flat</button>
              </div>
            </div>
            <div {...stylex.props(s.componentGroup)}>
              <div {...stylex.props(s.componentLabel)}>Input</div>
              <input {...stylex.props(s.input)} placeholder="Enter text..." />
            </div>
            <div {...stylex.props(s.componentGroup)}>
              <div {...stylex.props(s.componentLabel)}>Text area</div>
              <textarea {...stylex.props(s.textarea)} placeholder="Write something..." />
            </div>
            <div {...stylex.props(s.componentGroup)}>
              <div {...stylex.props(s.componentLabel)}>Tokens</div>
              <div style={{display: 'flex', gap: 6}}>
                <span {...stylex.props(s.xdsToken)}>Design <span {...stylex.props(s.xdsTokenX)}>&times;</span></span>
                <span {...stylex.props(s.xdsToken)}>System <span {...stylex.props(s.xdsTokenX)}>&times;</span></span>
                <span {...stylex.props(s.xdsToken)}>Radius <span {...stylex.props(s.xdsTokenX)}>&times;</span></span>
              </div>
            </div>
          </div>
        </div>

        <div {...stylex.props(s.divider)} />

        {/* radius-container */}
        <div {...stylex.props(s.section)}>
          <div {...stylex.props(s.sectionHeader)}>
            <span {...stylex.props(s.sectionTitle)}>radius-container</span>
            <span {...stylex.props(s.sectionToken)}>12dp &times; multiplier</span>
          </div>
          <div {...stylex.props(s.componentRow)}>
            <div {...stylex.props(s.componentGroup)}>
              <div {...stylex.props(s.componentLabel)}>Card</div>
              <div {...stylex.props(s.xdsCard)}>
                <div {...stylex.props(s.cardMedia)} />
                <div {...stylex.props(s.cardBody)}>
                  <div {...stylex.props(s.cardTitle)}>Card title</div>
                  <div {...stylex.props(s.cardDesc)}>Grouped content.</div>
                </div>
              </div>
            </div>
            <div {...stylex.props(s.componentGroup)}>
              <div {...stylex.props(s.componentLabel)}>Modal</div>
              <div {...stylex.props(s.modal)}>
                <div {...stylex.props(s.modalHeader)}>
                  <span {...stylex.props(s.modalTitle)}>Confirm action</span>
                  <span {...stylex.props(s.modalClose)}>&times;</span>
                </div>
                <div {...stylex.props(s.modalBody)}>Are you sure? This cannot be undone.</div>
                <div {...stylex.props(s.modalFooter)}>
                  <button {...stylex.props(s.btn, s.btnSm, s.btnSecondary)}>Cancel</button>
                  <button {...stylex.props(s.btn, s.btnSm, s.btnPrimary)}>Confirm</button>
                </div>
              </div>
            </div>
            <div {...stylex.props(s.componentGroup)}>
              <div {...stylex.props(s.componentLabel)}>Dropdown</div>
              <div {...stylex.props(s.dropdown)}>
                <div {...stylex.props(s.dropdownItem, s.dropdownItemActive)}>Dashboard</div>
                <div {...stylex.props(s.dropdownItem)}>Settings</div>
                <div {...stylex.props(s.dropdownItem)}>Profile</div>
                <div {...stylex.props(s.dropdownItem)}>Log out</div>
              </div>
            </div>
            <div {...stylex.props(s.componentGroup)}>
              <div {...stylex.props(s.componentLabel)}>Toasts</div>
              <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                <div {...stylex.props(s.toast)}><div {...stylex.props(s.toastDot)} style={{background: 'var(--color-positive)'}} /><span>Saved successfully</span></div>
                <div {...stylex.props(s.toast)}><div {...stylex.props(s.toastDot)} style={{background: 'var(--color-negative)'}} /><span>Something went wrong</span></div>
              </div>
            </div>
          </div>
        </div>

        <div {...stylex.props(s.divider)} />

        {/* radius-rounded */}
        <div {...stylex.props(s.section)}>
          <div {...stylex.props(s.sectionHeader)}>
            <span {...stylex.props(s.sectionTitle)}>radius-rounded</span>
            <span {...stylex.props(s.sectionToken)}>9999px</span>
            <span {...stylex.props(s.sectionNote)}>Always pill &middot; ignores multiplier</span>
          </div>
          <div {...stylex.props(s.componentRow)}>
            <div {...stylex.props(s.componentGroup)}>
              <div {...stylex.props(s.componentLabel)}>Badges</div>
              <div style={{display: 'flex', gap: 6}}>
                <span {...stylex.props(s.badge, s.badgeInfo)}>New</span>
                <span {...stylex.props(s.badge, s.badgeSuccess)}>Active</span>
                <span {...stylex.props(s.badge, s.badgeError)}>Error</span>
                <span {...stylex.props(s.badge, s.badgeWarning)}>Pending</span>
              </div>
            </div>
            <div {...stylex.props(s.componentGroup)}>
              <div {...stylex.props(s.componentLabel)}>Avatars</div>
              <div style={{display: 'flex', gap: 8}}>
                <div {...stylex.props(s.avatar)} style={{background: 'linear-gradient(135deg,#5B08D8,#E3193B)'}}>JD</div>
                <div {...stylex.props(s.avatar)} style={{background: 'linear-gradient(135deg,#0064E0,#0D8626)'}}>AB</div>
                <div {...stylex.props(s.avatar)} style={{background: 'linear-gradient(135deg,#E9AF08,#E3193B)'}}>KL</div>
              </div>
            </div>
            <div {...stylex.props(s.componentGroup)}>
              <div {...stylex.props(s.componentLabel)}>Status dots</div>
              <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
                <div {...stylex.props(s.statusRow)}><div {...stylex.props(s.statusDot)} style={{background: 'var(--color-positive)'}} />Online</div>
                <div {...stylex.props(s.statusRow)}><div {...stylex.props(s.statusDot)} style={{background: 'var(--color-warning)'}} />Away</div>
                <div {...stylex.props(s.statusRow)}><div {...stylex.props(s.statusDot)} style={{background: 'var(--color-negative)'}} />Busy</div>
              </div>
            </div>
            <div {...stylex.props(s.componentGroup)}>
              <div {...stylex.props(s.componentLabel)}>Toggles</div>
              <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
                <div {...stylex.props(s.switchRow)}><div {...stylex.props(s.switchEl, s.switchOn)}><div {...stylex.props(s.switchThumb, s.switchThumbOn)} /></div><span>Notifications</span></div>
                <div {...stylex.props(s.switchRow)}><div {...stylex.props(s.switchEl, s.switchOff)}><div {...stylex.props(s.switchThumb)} /></div><span>Dark mode</span></div>
              </div>
            </div>
          </div>
        </div>

        <div {...stylex.props(s.divider)} />

        {/* Concentric Radius */}
        <div {...stylex.props(s.section)}>
          <div {...stylex.props(s.sectionHeader)}>
            <span {...stylex.props(s.sectionTitle)}>Concentric Radius</span>
            <span {...stylex.props(s.sectionToken)}>max(0, outerRadius &minus; padding)</span>
          </div>
          <p style={{fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 16}}>Inner radius = outer minus padding. Nested elements get concentric corners.</p>
          <div {...stylex.props(s.componentRow)}>
            <div {...stylex.props(s.componentGroup)}>
              <div {...stylex.props(s.componentLabel)}>Nested elements</div>
              <div style={{display: 'flex', gap: 24, flexWrap: 'wrap'}}>
                <div {...stylex.props(s.concentricCard)}>
                  <div {...stylex.props(s.concentricMedia)} />
                  <div style={{paddingInline: 2, flex: 1}}>
                    <div {...stylex.props(s.concentricTitle)}>Inset media</div>
                    <div {...stylex.props(s.concentricDetail)}>card: {ct}px, pad: 10px<br />&rarr; inner: {Math.max(0, +(ct - 10).toFixed(1))}px</div>
                  </div>
                  <button {...stylex.props(s.concentricBtn)}>Action</button>
                  <div {...stylex.props(s.concentricDetail)} style={{marginTop: 4}}>btn: max(0, {ct} - 10) = {Math.max(0, +(ct - 10).toFixed(1))}px</div>
                </div>
                <div {...stylex.props(s.concentricCard)} style={{padding: 8}}>
                  <div {...stylex.props(s.concentricMediaTight)} />
                  <div style={{paddingInline: 2, flex: 1}}>
                    <div {...stylex.props(s.concentricTitle)}>Tighter pad</div>
                    <div {...stylex.props(s.concentricDetail)}>card: {ct}px, pad: 8px<br />&rarr; inner: {Math.max(0, +(ct - 8).toFixed(1))}px</div>
                  </div>
                  <button {...stylex.props(s.concentricBtn, s.concentricBtnTight)}>Action</button>
                  <div {...stylex.props(s.concentricDetail)} style={{marginTop: 4}}>btn: max(0, {ct} - 8) = {Math.max(0, +(ct - 8).toFixed(1))}px</div>
                </div>
                <div {...stylex.props(s.flushCard)}>
                  <div {...stylex.props(s.flushMedia)} />
                  <div {...stylex.props(s.flushBody)}>
                    <div {...stylex.props(s.concentricTitle)}>Flush media</div>
                    <div {...stylex.props(s.concentricDetail)}>card: {ct}px, pad: 0<br />&rarr; inherits card</div>
                  </div>
                  <button {...stylex.props(s.flushBtn)}>Action</button>
                  <div {...stylex.props(s.concentricDetail)} style={{margin: '4px 4px 0'}}>btn: max(0, {ct} - 4) = {Math.max(0, +(ct - 4).toFixed(1))}px</div>
                </div>
              </div>
            </div>
            <div {...stylex.props(s.componentGroup)}>
              <div {...stylex.props(s.componentLabel)}>Dropdown (4px pad)</div>
              <div {...stylex.props(s.dropdown)} style={{width: 190}}>
                <div {...stylex.props(s.dropdownItem, s.dropdownItemActive)}>Dashboard</div>
                <div {...stylex.props(s.dropdownItem)}>Settings</div>
                <div {...stylex.props(s.dropdownItem)}>Profile</div>
                <div {...stylex.props(s.dropdownItem)}>Log out</div>
              </div>
              <div {...stylex.props(s.concentricDetail)} style={{marginTop: 6}}>menu: {ct}px, pad: 4px<br />&rarr; item: {Math.max(0, +(ct - 4).toFixed(1))}px</div>
            </div>
          </div>
        </div>
      </XDSTheme>
    </div>
  );
}
