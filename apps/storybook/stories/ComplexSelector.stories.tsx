// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {useEffect, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {ComplexSelector} from '@astryxdesign/core/ComplexSelector';
import {Text} from '@astryxdesign/core/Text';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {useGridFocus} from '@astryxdesign/core/hooks';
import {
  borderVars,
  colorVars,
  durationVars,
  easeVars,
  fontWeightVars,
  radiusVars,
  spacingVars,
  typeScaleVars,
} from '@astryxdesign/core/theme/tokens.stylex';

const GRID_CELL_SELECTOR = '[role="gridcell"]';

const meta: Meta<typeof ComplexSelector> = {
  title: 'Core/ComplexSelector',
  component: ComplexSelector,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A high-level selector shell for rich custom content. The component owns the field, trigger, popover, focus restore, and async changeAction flow while consumers render the content.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ComplexSelector>;

type Fruit = 'Apple' | 'Pear' | 'Peach' | 'Plum';
type Ripeness = 'Crisp' | 'Tender' | 'Juicy' | 'Peak';

type FruitValue = {
  fruit: Fruit;
  ripeness: Ripeness;
};

const fruits: Array<{
  id: Fruit;
  emoji: string;
  description: string;
}> = [
  {id: 'Apple', emoji: '🍎', description: 'Bright and balanced'},
  {id: 'Pear', emoji: '🍐', description: 'Soft floral sweetness'},
  {id: 'Peach', emoji: '🍑', description: 'Round summer flavor'},
  {id: 'Plum', emoji: '🟣', description: 'Jammy and tart'},
];

const ripenessLevels: Array<{
  id: Ripeness;
  shortLabel: string;
  description: string;
}> = [
  {id: 'Crisp', shortLabel: 'C', description: 'Snappy bite'},
  {id: 'Tender', shortLabel: 'T', description: 'Easy bite'},
  {id: 'Juicy', shortLabel: 'J', description: 'Full juice'},
  {id: 'Peak', shortLabel: 'P', description: 'Most intense'},
];

const styles = stylex.create({
  wrapper: {
    width: 340,
  },
  content: {
    width: 520,
  },
  intro: {
    marginBlockEnd: spacingVars['--spacing-3'],
  },
  headerGrid: {
    display: 'grid',
    gridTemplateColumns: '132px repeat(4, 1fr)',
    gap: spacingVars['--spacing-2'],
    alignItems: 'center',
    marginBlockEnd: spacingVars['--spacing-2'],
  },
  columnHeading: {
    textAlign: 'center',
    color: colorVars['--color-text-secondary'],
    fontSize: typeScaleVars['--text-supporting-size'],
    fontWeight: fontWeightVars['--font-weight-medium'],
  },
  matrix: {
    display: 'grid',
    gridTemplateColumns: '132px repeat(4, 1fr)',
    gap: spacingVars['--spacing-2'],
    alignItems: 'stretch',
  },
  rowHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-2'],
    color: colorVars['--color-text-primary'],
  },
  fruitEmoji: {
    fontSize: 20,
  },
  fruitName: {
    fontSize: typeScaleVars['--text-label-size'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
  },
  fruitDescription: {
    color: colorVars['--color-text-secondary'],
    fontSize: typeScaleVars['--text-supporting-size'],
  },
  cell: {
    minHeight: 72,
    borderWidth: borderVars['--border-width'],
    borderStyle: 'solid',
    borderColor: colorVars['--color-border'],
    borderRadius: radiusVars['--radius-container'],
    backgroundColor: colorVars['--color-background-card'],
    color: colorVars['--color-text-primary'],
    padding: spacingVars['--spacing-2'],
    cursor: 'pointer',
    transitionProperty: 'background-color, border-color, box-shadow, transform',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
    outline: {
      default: 'none',
      ':focus-visible': `2px solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: 2,
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: colorVars['--color-background-muted'],
        borderColor: colorVars['--color-border-emphasized'],
      },
    },
    ':active': {
      transform: 'scale(0.98)',
    },
  },
  selectedCell: {
    borderColor: colorVars['--color-accent'],
    boxShadow: `inset 0 0 0 2px ${colorVars['--color-accent']}`,
  },
  cellLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    fontSize: typeScaleVars['--text-label-size'],
  },
  cellDescription: {
    marginBlockStart: spacingVars['--spacing-1'],
    color: colorVars['--color-text-secondary'],
    fontSize: typeScaleVars['--text-supporting-size'],
    textAlign: 'start',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
    borderRadius: radiusVars['--radius-full'],
    backgroundColor: colorVars['--color-accent'],
    color: colorVars['--color-on-accent'],
    fontSize: 11,
    fontWeight: fontWeightVars['--font-weight-bold'],
  },
  keyboardHint: {
    marginBlockStart: spacingVars['--spacing-3'],
    paddingBlockStart: spacingVars['--spacing-3'],
    borderBlockStartWidth: borderVars['--border-width'],
    borderBlockStartStyle: 'solid',
    borderBlockStartColor: colorVars['--color-border'],
  },
});

function formatValue(value: FruitValue) {
  return `${value.fruit} · ${value.ripeness}`;
}

function FruitRipenessMatrix({
  value,
  onChange,
}: {
  value: FruitValue;
  onChange: (value: FruitValue) => void;
}) {
  const {gridRef, handleKeyDown, handleFocus, focusCell} =
    useGridFocus<HTMLDivElement>({
      columns: ripenessLevels.length,
      cellSelector: GRID_CELL_SELECTOR,
      hasRovingTabIndex: true,
    });

  useEffect(() => {
    const rowIndex = fruits.findIndex(fruit => fruit.id === value.fruit);
    const columnIndex = ripenessLevels.findIndex(
      level => level.id === value.ripeness,
    );
    requestAnimationFrame(() => {
      focusCell(
        rowIndex >= 0 && columnIndex >= 0
          ? rowIndex * ripenessLevels.length + columnIndex
          : 0,
      );
    });
  }, [focusCell, value]);

  return (
    <div>
      <div {...stylex.props(styles.headerGrid)} aria-hidden="true">
        <div />
        {ripenessLevels.map(level => (
          <div key={level.id} {...stylex.props(styles.columnHeading)}>
            {level.id}
          </div>
        ))}
      </div>

      <div
        ref={gridRef}
        role="grid"
        aria-label="Fruit ripeness choices"
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        {...stylex.props(styles.matrix)}>
        {fruits.flatMap(fruit => [
          <div key={`${fruit.id}-label`} {...stylex.props(styles.rowHeader)}>
            <span {...stylex.props(styles.fruitEmoji)}>{fruit.emoji}</span>
            <VStack gap={0}>
              <span {...stylex.props(styles.fruitName)}>{fruit.id}</span>
              <span {...stylex.props(styles.fruitDescription)}>
                {fruit.description}
              </span>
            </VStack>
          </div>,
          ...ripenessLevels.map(level => {
            const nextValue = {fruit: fruit.id, ripeness: level.id};
            const isSelected =
              value.fruit === fruit.id && value.ripeness === level.id;

            return (
              <button
                key={`${fruit.id}-${level.id}`}
                type="button"
                role="gridcell"
                aria-label={`${fruit.id}, ${level.id}: ${level.description}`}
                aria-selected={isSelected || undefined}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => onChange(nextValue)}
                {...stylex.props(
                  styles.cell,
                  isSelected && styles.selectedCell,
                )}>
                <span {...stylex.props(styles.cellLabel)}>
                  {level.id}
                  <span {...stylex.props(styles.badge)}>
                    {level.shortLabel}
                  </span>
                </span>
                <span {...stylex.props(styles.cellDescription)}>
                  {level.description}
                </span>
              </button>
            );
          }),
        ])}
      </div>
    </div>
  );
}

export const FruitRipenessGrid: Story = {
  name: 'Fruit ripeness grid',
  render: () => {
    const [value, setValue] = useState<FruitValue>({
      fruit: 'Apple',
      ripeness: 'Juicy',
    });

    return (
      <VStack gap={4} xstyle={styles.wrapper}>
        <ComplexSelector<FruitValue>
          label="Fruit blend"
          description="Choose a fruit and ripeness level in one selector. Arrow down preserves the ripeness column."
          value={value}
          onChange={setValue}
          triggerLabel={formatValue(value)}
          contentXstyle={styles.content}>
          {(selectedValue, onChange, close) => (
            <div>
              <div {...stylex.props(styles.intro)}>
                <Text type="supporting" color="secondary">
                  Pick a blend profile. Keyboard users can move across ripeness
                  levels with left/right and preserve the same ripeness when
                  moving between fruit rows with up/down.
                </Text>
              </div>

              <FruitRipenessMatrix
                value={selectedValue}
                onChange={nextValue => {
                  onChange(nextValue);
                  close();
                }}
              />

              <div {...stylex.props(styles.keyboardHint)}>
                <HStack gap={2} wrap="wrap">
                  <Text type="supporting" color="secondary">
                    Try keyboard:
                  </Text>
                  <Text type="supporting">
                    ↓ from Apple Juicy lands on Pear Juicy.
                  </Text>
                </HStack>
              </div>
            </div>
          )}
        </ComplexSelector>
      </VStack>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'A fruit-themed stand-in for a rich two-axis selector. ComplexSelector owns the trigger, popover, focus restore, and change flow; the custom content owns its grid semantics.',
      },
    },
  },
};
