// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useMemo, useState, type CSSProperties} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {NumberInput} from '@astryxdesign/core/NumberInput';
import {Section} from '@astryxdesign/core/Section';
import {Table} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {Text, Heading} from '@astryxdesign/core/Text';
import {TextInput} from '@astryxdesign/core/TextInput';
import {ToggleButton, ToggleButtonGroup} from '@astryxdesign/core/ToggleButton';

type ViewMode = 'template' | 'scale' | 'components';
type Viewport = 'mobile' | 'tablet' | 'desktop';
type Behavior = 'current' | 'proposal';
type CssVars = CSSProperties & Record<`--${string}`, string | number>;

type SemanticTokenId =
  | 'layout-padding-inline'
  | 'layout-padding-block'
  | 'section-padding'
  | 'section-gap'
  | 'card-padding'
  | 'container-region-gap'
  | 'dialog-padding'
  | 'overlay-region-gap';

interface SemanticTokenSpec {
  id: SemanticTokenId;
  label: string;
  cssVariables: ReadonlyArray<`--${string}`>;
  components: string;
  currentMultiplier: number;
  shownInPreview: string;
}

interface ScaleRow extends Record<string, unknown> {
  id: string;
  token: string;
  use: string;
  components: string;
  current: string;
  mobile: string;
  change: string;
  shownInPreview: string;
}

interface FormulaRow extends Record<string, unknown> {
  id: string;
  token: string;
  small: string;
  medium: string;
  large: string;
  xlarge: string;
  note: string;
}

const SPACING_PRESETS = [
  {label: 'S', value: 2},
  {label: 'M', value: 4},
  {label: 'L', value: 6},
  {label: 'XL', value: 8},
] as const;

const VIEWPORTS: Record<
  Viewport,
  {label: string; width: number; height: number}
> = {
  mobile: {label: 'Mobile · 390 × 844', width: 390, height: 844},
  tablet: {label: 'Tablet · 768 × 1024', width: 768, height: 1024},
  desktop: {label: 'Desktop · 1440 × 900', width: 1440, height: 900},
};

const FORMULA_STEPS = [0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MOBILE_RATIO = Math.SQRT2;
const MOBILE_GRID = 2;

const SEMANTIC_TOKENS: ReadonlyArray<SemanticTokenSpec> = [
  {
    id: 'layout-padding-inline',
    label: 'Horizontal page/layout padding',
    cssVariables: ['--astryx-layout-padding-inline'],
    components: 'LayoutHeader, LayoutContent, LayoutFooter, LayoutPanel',
    currentMultiplier: 4,
    shownInPreview: 'Product frame + component specimen',
  },
  {
    id: 'layout-padding-block',
    label: 'Vertical page/layout padding',
    cssVariables: ['--astryx-layout-padding-block'],
    components: 'LayoutHeader, LayoutContent, LayoutFooter, LayoutPanel',
    currentMultiplier: 4,
    shownInPreview: 'Product frame + component specimen',
  },
  {
    id: 'section-padding',
    label: 'Section padding',
    cssVariables: [
      '--astryx-section-padding',
      '--astryx-section-padding-inline',
      '--astryx-section-padding-block-start',
      '--astryx-section-padding-block-end',
    ],
    components: 'Section',
    currentMultiplier: 4,
    shownInPreview: 'Component specimen',
  },
  {
    id: 'section-gap',
    label: 'Major page/section gap',
    cssVariables: ['--astryx-mobile-section-gap'],
    components: 'Explicit opt-in Stack/Grid between major sections',
    currentMultiplier: 6,
    shownInPreview: 'Component specimen',
  },
  {
    id: 'card-padding',
    label: 'Card/panel padding',
    cssVariables: ['--astryx-card-padding'],
    components: 'Card, ClickableCard, SelectableCard',
    currentMultiplier: 4,
    shownInPreview: 'Component specimen',
  },
  {
    id: 'container-region-gap',
    label: 'Owned container region gap',
    cssVariables: ['--astryx-mobile-container-region-gap'],
    components: 'Owned regions inside cards/panels',
    currentMultiplier: 3,
    shownInPreview: 'Component specimen',
  },
  {
    id: 'dialog-padding',
    label: 'Dialog/drawer padding',
    cssVariables: ['--astryx-dialog-padding'],
    components: 'Dialog, Drawer, Bottom Sheet',
    currentMultiplier: 4,
    shownInPreview: 'Table only',
  },
  {
    id: 'overlay-region-gap',
    label: 'Owned overlay region gap',
    cssVariables: ['--astryx-mobile-overlay-region-gap'],
    components: 'Owned regions inside dialogs/drawers/sheets',
    currentMultiplier: 3,
    shownInPreview: 'Table only',
  },
] as const;

const EXPLICIT_MOBILE_PROFILES: Record<
  number,
  Record<SemanticTokenId, number>
> = {
  2: {
    'layout-padding-inline': 6,
    'layout-padding-block': 6,
    'section-padding': 6,
    'section-gap': 8,
    'card-padding': 6,
    'container-region-gap': 4,
    'dialog-padding': 6,
    'overlay-region-gap': 4,
  },
  4: {
    'layout-padding-inline': 12,
    'layout-padding-block': 12,
    'section-padding': 12,
    'section-gap': 16,
    'card-padding': 12,
    'container-region-gap': 8,
    'dialog-padding': 12,
    'overlay-region-gap': 8,
  },
  6: {
    'layout-padding-inline': 16,
    'layout-padding-block': 16,
    'section-padding': 16,
    'section-gap': 26,
    'card-padding': 16,
    'container-region-gap': 12,
    'dialog-padding': 16,
    'overlay-region-gap': 12,
  },
  8: {
    'layout-padding-inline': 22,
    'layout-padding-block': 22,
    'section-padding': 22,
    'section-gap': 34,
    'card-padding': 22,
    'container-region-gap': 16,
    'dialog-padding': 22,
    'overlay-region-gap': 16,
  },
};

const styles = stylex.create({
  page: {
    minHeight: '100vh',
    backgroundColor: 'var(--color-background-card)',
  },
  toolbar: {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
  },
  controls: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 20,
    alignItems: 'end',
  },
  stage: {
    minHeight: 'calc(100vh - 172px)',
    padding: 24,
    overflow: 'auto',
    backgroundColor: 'var(--color-background-card)',
    backgroundImage:
      'linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)',
    backgroundSize: '8px 8px',
  },
  frame: {
    marginInline: 'auto',
    overflow: 'auto',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: 'var(--shadow-raised)',
  },
  previewIframe: {
    display: 'block',
    width: '100%',
    height: '100%',
    borderWidth: 0,
    backgroundColor: 'var(--color-background-card)',
  },
  panel: {
    width: 'min(100%, 1180px)',
    marginInline: 'auto',
    padding: 24,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: 'var(--shadow-raised)',
  },
  formulaPanel: {
    padding: 16,
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)',
  },
  changedValue: {
    color: 'var(--color-text-accent)',
    fontWeight: 600,
  },
  warningValue: {
    color: 'var(--color-text-warning)',
    fontWeight: 600,
  },
  componentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(520px, 1fr))',
    gap: 16,
  },
  componentScaleCard: {
    padding: 16,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
  },
  componentColumns: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 12,
  },
  componentColumn: {
    minWidth: 0,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--color-border)',
    borderRadius: 'var(--radius-container)',
    overflow: 'clip',
    backgroundColor: 'var(--color-background-card)',
  },
  componentColumnHeader: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
  },
  componentSpecimen: {
    padding: 12,
  },
  layoutFrame: {
    padding:
      'var(--astryx-layout-padding-block) var(--astryx-layout-padding-inline)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)',
  },
  componentOwnedRegions: {
    display: 'grid',
    gap: 'var(--astryx-mobile-container-region-gap)',
  },
  sectionGapStack: {
    display: 'grid',
    gap: 'var(--astryx-mobile-section-gap)',
  },
  componentMetric: {
    paddingBlock: 6,
    paddingInline: 8,
    borderRadius: 'var(--radius-element)',
    backgroundColor: 'var(--color-background-surface)',
  },
});

function roundToGrid(value: number): number {
  return MOBILE_GRID * Math.round(value / MOBILE_GRID);
}

function getFormulaValue(value: number): number {
  return roundToGrid(value / MOBILE_RATIO);
}

function getMobileProfile(
  spacingBase: number,
): Record<SemanticTokenId, number> {
  const explicitProfile = EXPLICIT_MOBILE_PROFILES[spacingBase];
  if (explicitProfile != null) {
    return explicitProfile;
  }

  return Object.fromEntries(
    SEMANTIC_TOKENS.map(item => [
      item.id,
      getFormulaValue(spacingBase * item.currentMultiplier),
    ]),
  ) as Record<SemanticTokenId, number>;
}

function getSpacingVariables(
  spacingBase: number,
  behavior: Behavior,
): CSSProperties {
  const mobileProfile = getMobileProfile(spacingBase);
  const vars: CssVars = {};

  for (const item of SEMANTIC_TOKENS) {
    const value =
      behavior === 'proposal'
        ? mobileProfile[item.id]
        : spacingBase * item.currentMultiplier;

    for (const cssVariable of item.cssVariables) {
      vars[cssVariable] = `${value}px`;
    }
  }

  return vars;
}

function getScaleRows(spacingBase: number): ScaleRow[] {
  const mobileProfile = getMobileProfile(spacingBase);

  return SEMANTIC_TOKENS.flatMap(item => {
    const current = spacingBase * item.currentMultiplier;
    const mobile = mobileProfile[item.id];

    return item.cssVariables.map(cssVariable => ({
      id: cssVariable,
      token: cssVariable,
      use: item.label,
      components: item.components,
      current: `${current}px`,
      mobile: `${mobile}px`,
      change: `−${current - mobile}px`,
      shownInPreview: item.shownInPreview,
    }));
  });
}

function getFormulaRows(): FormulaRow[] {
  return FORMULA_STEPS.map((step, index) => {
    const values = SPACING_PRESETS.map(({value}) =>
      getFormulaValue(Math.round(value * step)),
    );
    const previousStep = FORMULA_STEPS[index - 1];
    const hasDuplicate =
      previousStep != null &&
      SPACING_PRESETS.some(({value}, presetIndex) => {
        return (
          getFormulaValue(Math.round(value * previousStep)) ===
          values[presetIndex]
        );
      });

    return {
      id: String(step),
      token: `spacing-${String(step).replace('.', '-')}`,
      small: `${Math.round(2 * step)}px → ${values[0]}px`,
      medium: `${Math.round(4 * step)}px → ${values[1]}px`,
      large: `${Math.round(6 * step)}px → ${values[2]}px`,
      xlarge: `${Math.round(8 * step)}px → ${values[3]}px`,
      note: hasDuplicate ? 'Needs hand tuning' : 'Distinct',
    };
  });
}

function ChoiceGroup<T extends string>({
  items,
  value,
  onChange,
}: {
  items: Array<{value: T; label: string}>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <HStack gap={1} wrap="wrap">
      {items.map(item => (
        <Button
          key={item.value}
          label={item.label}
          size="sm"
          variant={item.value === value ? 'primary' : 'secondary'}
          onClick={() => onChange(item.value)}
        />
      ))}
    </HStack>
  );
}

function SpacingControl({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const selectedPreset = SPACING_PRESETS.some(option => option.value === value)
    ? String(value)
    : null;

  return (
    <HStack gap={2} vAlign="center" justify="between">
      <ToggleButtonGroup
        label="Source spacing preset"
        type="single"
        size="sm"
        value={selectedPreset}
        onChange={(next: string | null) => {
          if (next != null) {
            onChange(Number(next));
          }
        }}>
        {SPACING_PRESETS.map(option => (
          <ToggleButton
            key={option.value}
            label={option.label}
            value={String(option.value)}
          />
        ))}
      </ToggleButtonGroup>
      <NumberInput
        label="Source spacing base"
        isLabelHidden
        value={value}
        min={0}
        max={16}
        step={2}
        units="px"
        size="sm"
        width={188}
        isWheelEnabled={false}
        onChange={onChange}
      />
    </HStack>
  );
}

function ComponentScaleColumn({
  label,
  spacingBase,
  behavior,
}: {
  label: string;
  spacingBase: number;
  behavior: Behavior;
}) {
  const variables = getSpacingVariables(spacingBase, behavior);
  const profile = getMobileProfile(spacingBase);
  const sectionPadding =
    behavior === 'proposal' ? profile['section-padding'] : spacingBase * 4;
  const cardPadding =
    behavior === 'proposal' ? profile['card-padding'] : spacingBase * 4;
  const sectionGap =
    behavior === 'proposal' ? profile['section-gap'] : spacingBase * 6;
  const regionGap =
    behavior === 'proposal' ? profile['container-region-gap'] : spacingBase * 3;

  return (
    <div {...stylex.props(styles.componentColumn)} style={variables}>
      <div {...stylex.props(styles.componentColumnHeader)}>
        <VStack gap={0.5}>
          <Text type="label">{label}</Text>
          <Text type="body" color="secondary">
            Section {sectionPadding}px · Card {cardPadding}px · Gap {regionGap}
            px
          </Text>
        </VStack>
      </div>
      <div {...stylex.props(styles.componentSpecimen)}>
        <div {...stylex.props(styles.layoutFrame)}>
          <div {...stylex.props(styles.sectionGapStack)}>
            <Section variant="muted">
              <Card>
                <div {...stylex.props(styles.componentOwnedRegions)}>
                  <VStack gap={1}>
                    <Heading level={4}>Plan details</Heading>
                    <Text type="body" color="secondary">
                      Section and card padding are semantic container values.
                    </Text>
                  </VStack>
                  <VStack gap={2}>
                    <TextInput
                      label="Project name"
                      value="Mobile theme"
                      onChange={() => {}}
                    />
                    <HStack gap={2} wrap="wrap">
                      <Button label="Primary action" size="sm" />
                      <Button label="Secondary" size="sm" variant="secondary" />
                    </HStack>
                  </VStack>
                  <div {...stylex.props(styles.componentMetric)}>
                    <Text type="body" color="secondary">
                      Owned card region gap: {regionGap}px. Control internals
                      are not compressed.
                    </Text>
                  </div>
                </div>
              </Card>
            </Section>
            <Card variant="muted">
              <Text type="body" color="secondary">
                Major section gap: {sectionGap}px
              </Text>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComponentScaleCard({
  label,
  spacingBase,
}: {
  label: string;
  spacingBase: number;
}) {
  const currentCard = spacingBase * 4;
  const mobileCard = getMobileProfile(spacingBase)['card-padding'];

  return (
    <div {...stylex.props(styles.componentScaleCard)}>
      <VStack gap={3}>
        <HStack gap={2} justify="between" vAlign="start">
          <VStack gap={0.5}>
            <Heading level={3}>{label}</Heading>
            <Text type="body" color="secondary">
              Card/container default: {currentCard}px → {mobileCard}px
            </Text>
          </VStack>
          <Text type="code">
            {Math.round((mobileCard / currentCard) * 100)}%
          </Text>
        </HStack>
        <div {...stylex.props(styles.componentColumns)}>
          <ComponentScaleColumn
            label="Current Astryx"
            spacingBase={spacingBase}
            behavior="current"
          />
          <ComponentScaleColumn
            label="Mobile proposal"
            spacingBase={spacingBase}
            behavior="proposal"
          />
        </div>
      </VStack>
    </div>
  );
}

const scaleColumns: TableColumn<ScaleRow>[] = [
  {
    key: 'token',
    header: 'Mobile spacing token',
    renderCell: row => <Text type="code">{row.token}</Text>,
  },
  {key: 'use', header: 'What it controls'},
  {key: 'components', header: 'Component scope'},
  {key: 'shownInPreview', header: 'Shown here'},
  {key: 'current', header: 'Current Astryx'},
  {
    key: 'mobile',
    header: 'Mobile value',
    renderCell: row => (
      <span {...stylex.props(styles.changedValue)}>{row.mobile}</span>
    ),
  },
  {
    key: 'change',
    header: 'Change',
    renderCell: row => (
      <span {...stylex.props(styles.changedValue)}>{row.change}</span>
    ),
  },
];

const formulaColumns: TableColumn<FormulaRow>[] = [
  {
    key: 'token',
    header: 'Primitive token',
    renderCell: row => <Text type="code">{row.token}</Text>,
  },
  {key: 'small', header: 'S · 2px base'},
  {key: 'medium', header: 'M · 4px base'},
  {key: 'large', header: 'L · 6px base'},
  {key: 'xlarge', header: 'XL · 8px base'},
  {
    key: 'note',
    header: 'Publish as-is?',
    renderCell: row => (
      <span
        {...stylex.props(
          row.note === 'Distinct' ? undefined : styles.warningValue,
        )}>
        {row.note}
      </span>
    ),
  },
];

export default function MobileSpacingPage() {
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const [behavior, setBehavior] = useState<Behavior>('current');
  const [viewMode, setViewMode] = useState<ViewMode>('components');
  const [spacingBase, setSpacingBase] = useState(4);
  const effectiveBehavior = viewport === 'mobile' ? behavior : 'current';
  const templateStyle = useMemo(
    () => getSpacingVariables(spacingBase, effectiveBehavior),
    [spacingBase, effectiveBehavior],
  );

  return (
    <div {...stylex.props(styles.page)}>
      <div {...stylex.props(styles.toolbar)}>
        <VStack gap={4}>
          <VStack gap={1}>
            <Heading level={1}>Mobile spacing scale preview</Heading>
            <Text type="body" color="secondary">
              Draft sandbox for evaluating a mobile-only semantic spacing
              profile. It compares real components across the Astryx spacing
              defaults and keeps component internals out of scope.
            </Text>
          </VStack>

          <div {...stylex.props(styles.controls)}>
            <VStack gap={1}>
              <Text type="label">View</Text>
              <ChoiceGroup
                items={[
                  {value: 'components', label: 'Component scales'},
                  {value: 'template', label: 'Product preview'},
                  {value: 'scale', label: 'Scale table'},
                ]}
                value={viewMode}
                onChange={setViewMode}
              />
            </VStack>
            <VStack gap={1}>
              <Text type="label">Viewport</Text>
              <ChoiceGroup
                items={(Object.keys(VIEWPORTS) as Viewport[]).map(value => ({
                  value,
                  label: VIEWPORTS[value].label,
                }))}
                value={viewport}
                onChange={nextViewport => {
                  setViewport(nextViewport);
                  if (nextViewport !== 'mobile') {
                    setBehavior('current');
                  }
                }}
              />
            </VStack>
            <VStack gap={1}>
              <Text type="label">Mobile behavior</Text>
              {viewport === 'mobile' ? (
                <ChoiceGroup
                  items={[
                    {value: 'current', label: 'Current Astryx'},
                    {value: 'proposal', label: 'Mobile proposal'},
                  ]}
                  value={behavior}
                  onChange={setBehavior}
                />
              ) : (
                <Text type="body" color="secondary">
                  Mobile proposal is inactive on tablet and desktop.
                </Text>
              )}
            </VStack>
            <VStack gap={1}>
              <Text type="label">Source spacing preset</Text>
              <SpacingControl value={spacingBase} onChange={setSpacingBase} />
            </VStack>
          </div>
        </VStack>
      </div>

      <div {...stylex.props(styles.stage)}>
        {viewMode === 'template' ? (
          <div
            {...stylex.props(styles.frame)}
            style={{
              ...templateStyle,
              width: VIEWPORTS[viewport].width,
              height: VIEWPORTS[viewport].height,
              maxWidth: '100%',
            }}>
            <iframe
              title={`Product Detail · ${VIEWPORTS[viewport].label}`}
              src="/templates/product-detail/?embed=1"
              sandbox="allow-scripts allow-same-origin"
              {...stylex.props(styles.previewIframe)}
            />
          </div>
        ) : viewMode === 'scale' ? (
          <div {...stylex.props(styles.panel)}>
            <VStack gap={4}>
              <VStack gap={1}>
                <Heading level={2}>Spacing formula and mobile tokens</Heading>
                <Text type="body" color="secondary">
                  The formula is used to generate candidates from the existing
                  linear spacing defaults. Repeated or awkward candidates are
                  hand-tuned into explicit semantic mobile tokens before
                  publishing.
                </Text>
              </VStack>
              <div {...stylex.props(styles.formulaPanel)}>
                <VStack gap={1}>
                  <Text type="label">Candidate formula</Text>
                  <Text type="code">mobile(s) = roundTo2px(s ÷ √2)</Text>
                  <Text type="body" color="secondary">
                    Plainly: divide the current layout/container spacing by
                    1.414, then round to the nearest 2px. The shipped theme
                    should use explicit semantic values, not run this formula at
                    runtime.
                  </Text>
                </VStack>
              </div>
              <VStack gap={2}>
                <Heading level={3}>Full spacing-ramp candidates</Heading>
                <Table<FormulaRow>
                  data={getFormulaRows()}
                  columns={formulaColumns}
                  idKey="id"
                  density="spacious"
                  dividers="rows"
                />
              </VStack>
              <VStack gap={2}>
                <Heading level={3}>
                  Semantic mobile tokens for {spacingBase}px source spacing
                </Heading>
                <Table<ScaleRow>
                  data={getScaleRows(spacingBase)}
                  columns={scaleColumns}
                  idKey="id"
                  density="spacious"
                  dividers="rows"
                />
              </VStack>
            </VStack>
          </div>
        ) : (
          <div {...stylex.props(styles.panel)}>
            <VStack gap={4}>
              <VStack gap={1}>
                <Heading level={2}>Component scale comparison</Heading>
                <Text type="body" color="secondary">
                  Each card uses real Astryx Section, Card, TextInput, and
                  Button components. The mobile proposal changes semantic
                  container spacing only: layout padding, section padding, card
                  padding, section gap, and owned container-region gap.
                </Text>
              </VStack>
              <div {...stylex.props(styles.componentGrid)}>
                {SPACING_PRESETS.map(preset => (
                  <ComponentScaleCard
                    key={preset.label}
                    label={`${preset.label} · ${preset.value}px base`}
                    spacingBase={preset.value}
                  />
                ))}
              </div>
            </VStack>
          </div>
        )}
      </div>
    </div>
  );
}
