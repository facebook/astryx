// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {useEffect, useMemo, useState, type ComponentProps} from 'react';
import * as stylex from '@stylexjs/stylex';
import {ComplexSelector} from '@astryxdesign/core/ComplexSelector';
import {Button} from '@astryxdesign/core/Button';
import {Text} from '@astryxdesign/core/Text';
import {TextInput} from '@astryxdesign/core/TextInput';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Token} from '@astryxdesign/core/Token';
import {TreeList, type TreeListItemData} from '@astryxdesign/core/TreeList';
import {useGridFocus} from '@astryxdesign/core/hooks';
import {
  borderVars,
  colorVars,
  durationVars,
  easeVars,
  fontWeightVars,
  radiusVars,
  shadowVars,
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
          'A high-level selector shell for rich custom content. The component owns the field, trigger, popover, focus restore, and async changeAction flow while consumers render the content. Custom content should use Astryx focus hooks where appropriate and be evaluated against WCAG 2.2.',
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

type DestinationValue = {
  id: string;
  label: string;
  path: string;
};

interface DestinationNode {
  id: string;
  label: string;
  path: string;
  kind: 'folder' | 'space' | 'team';
  isExpanded?: boolean;
  children?: DestinationNode[];
}

const destinationTree: DestinationNode[] = [
  {
    id: 'workspace',
    label: 'Workspace',
    path: '/Workspace',
    kind: 'space',
    children: [
      {
        id: 'workspace-research',
        label: 'Research',
        path: '/Workspace/Research',
        kind: 'folder',
        children: [
          {
            id: 'workspace-research-field-notes',
            label: 'Field notes',
            path: '/Workspace/Research/Field notes',
            kind: 'folder',
          },
          {
            id: 'workspace-research-interviews',
            label: 'Interviews',
            path: '/Workspace/Research/Interviews',
            kind: 'folder',
          },
        ],
      },
      {
        id: 'workspace-roadmap',
        label: 'Roadmap',
        path: '/Workspace/Roadmap',
        kind: 'folder',
      },
    ],
  },
  {
    id: 'teams',
    label: 'Teams',
    path: '/Teams',
    kind: 'space',
    children: [
      {
        id: 'teams-design-systems',
        label: 'Design systems',
        path: '/Teams/Design systems',
        kind: 'team',
        children: [
          {
            id: 'teams-design-systems-components',
            label: 'Components',
            path: '/Teams/Design systems/Components',
            kind: 'folder',
          },
          {
            id: 'teams-design-systems-accessibility',
            label: 'Accessibility',
            path: '/Teams/Design systems/Accessibility',
            kind: 'folder',
          },
        ],
      },
      {
        id: 'teams-growth',
        label: 'Growth',
        path: '/Teams/Growth',
        kind: 'team',
      },
    ],
  },
  {
    id: 'archive',
    label: 'Archive',
    path: '/Archive',
    kind: 'space',
    children: [
      {
        id: 'archive-2025',
        label: '2025 projects',
        path: '/Archive/2025 projects',
        kind: 'folder',
      },
    ],
  },
];

const categoryTree: DestinationNode[] = [
  {
    id: 'produce',
    label: 'Produce',
    path: 'Produce',
    kind: 'space',
    children: [
      {
        id: 'produce-fruit',
        label: 'Fruit',
        path: 'Produce / Fruit',
        kind: 'folder',
        children: [
          {
            id: 'produce-fruit-citrus',
            label: 'Citrus',
            path: 'Produce / Fruit / Citrus',
            kind: 'folder',
          },
          {
            id: 'produce-fruit-stone',
            label: 'Stone fruit',
            path: 'Produce / Fruit / Stone fruit',
            kind: 'folder',
          },
        ],
      },
      {
        id: 'produce-vegetables',
        label: 'Vegetables',
        path: 'Produce / Vegetables',
        kind: 'folder',
      },
    ],
  },
  {
    id: 'pantry',
    label: 'Pantry',
    path: 'Pantry',
    kind: 'space',
    children: [
      {
        id: 'pantry-grains',
        label: 'Grains',
        path: 'Pantry / Grains',
        kind: 'folder',
      },
      {
        id: 'pantry-snacks',
        label: 'Snacks',
        path: 'Pantry / Snacks',
        kind: 'folder',
      },
    ],
  },
];

const styles = stylex.create({
  wrapper: {
    width: 340,
  },
  fruitContent: {
    width: 500,
    padding: spacingVars['--spacing-2'],
  },
  treeContent: {
    width: 420,
    padding: spacingVars['--spacing-3'],
  },
  intro: {
    marginBlockEnd: spacingVars['--spacing-3'],
  },
  thinkingSurface: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-1'],
  },
  thinkingRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(156px, 1fr) repeat(4, 56px)',
    alignItems: 'center',
    columnGap: spacingVars['--spacing-1'],
    minHeight: 48,
    paddingBlock: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-2'],
    borderRadius: radiusVars['--radius-container'],
    backgroundColor: {
      default: 'transparent',
      ':hover': {
        '@media (hover: hover)': colorVars['--color-background-muted'],
      },
      ':focus-within': colorVars['--color-background-muted'],
    },
  },
  fruitSummary: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    minWidth: 0,
  },
  fruitEmoji: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: radiusVars['--radius-full'],
    backgroundColor: colorVars['--color-background-muted'],
    fontSize: 17,
    flexShrink: 0,
  },
  fruitText: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  fruitName: {
    color: colorVars['--color-text-primary'],
    fontSize: typeScaleVars['--text-label-size'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  fruitDescription: {
    color: colorVars['--color-text-secondary'],
    fontSize: typeScaleVars['--text-supporting-size'],
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  levelButton: {
    borderWidth: borderVars['--border-width'],
    borderStyle: 'solid',
    borderColor: colorVars['--color-border'],
    borderRadius: radiusVars['--radius-full'],
    backgroundColor: colorVars['--color-background-card'],
    color: colorVars['--color-text-secondary'],
    minHeight: 30,
    paddingInline: spacingVars['--spacing-2'],
    fontFamily: 'inherit',
    fontSize: typeScaleVars['--text-supporting-size'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    cursor: 'pointer',
    opacity: 0.68,
    transitionProperty:
      'opacity, background-color, border-color, color, box-shadow',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
    outline: {
      default: 'none',
      ':focus-visible': `2px solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: 2,
    ':hover': {
      '@media (hover: hover)': {
        opacity: 1,
        borderColor: colorVars['--color-border-emphasized'],
        color: colorVars['--color-text-primary'],
      },
    },
  },
  selectedLevelButton: {
    opacity: 1,
    borderColor: colorVars['--color-accent'],
    backgroundColor: colorVars['--color-accent'],
    color: colorVars['--color-on-accent'],
    boxShadow: shadowVars['--shadow-low'],
  },
  keyboardHint: {
    marginBlockStart: spacingVars['--spacing-3'],
    paddingBlockStart: spacingVars['--spacing-3'],
    borderBlockStartWidth: borderVars['--border-width'],
    borderBlockStartStyle: 'solid',
    borderBlockStartColor: colorVars['--color-border'],
  },
  searchArea: {
    marginBlockEnd: spacingVars['--spacing-3'],
  },
  treePanel: {
    maxHeight: 280,
    overflow: 'auto',
    borderWidth: borderVars['--border-width'],
    borderStyle: 'solid',
    borderColor: colorVars['--color-border'],
    borderRadius: radiusVars['--radius-container'],
    padding: spacingVars['--spacing-1'],
  },
  selectedSummary: {
    marginBlockStart: spacingVars['--spacing-3'],
    paddingBlockStart: spacingVars['--spacing-3'],
    borderBlockStartWidth: borderVars['--border-width'],
    borderBlockStartStyle: 'solid',
    borderBlockStartColor: colorVars['--color-border'],
  },
  emptyState: {
    padding: spacingVars['--spacing-3'],
    color: colorVars['--color-text-secondary'],
    textAlign: 'center',
  },
});

function formatFruitValue(value: FruitValue) {
  return `${value.fruit} · ${value.ripeness}`;
}

function formatDestinationValue(value: DestinationValue) {
  return value.path;
}

function nodeMatchesQuery(node: DestinationNode, normalizedQuery: string) {
  return (
    node.label.toLowerCase().includes(normalizedQuery) ||
    node.path.toLowerCase().includes(normalizedQuery)
  );
}

function filterDestinationTree(
  nodes: DestinationNode[],
  query: string,
): DestinationNode[] {
  const normalizedQuery = query.trim().toLowerCase();
  const result: DestinationNode[] = [];

  for (const node of nodes) {
    const filteredChildren = node.children
      ? filterDestinationTree(node.children, query)
      : undefined;
    const isMatch =
      normalizedQuery.length === 0 || nodeMatchesQuery(node, normalizedQuery);

    if (!isMatch && (!filteredChildren || filteredChildren.length === 0)) {
      continue;
    }

    result.push({
      ...node,
      isExpanded: normalizedQuery.length > 0 || node.children != null,
      children: filteredChildren,
    });
  }

  return result;
}

function toTreeListItems(
  nodes: DestinationNode[],
  selectedId: string,
  onSelect: (value: DestinationValue) => void,
): TreeListItemData[] {
  return nodes.map(node => {
    const hasChildren = node.children != null && node.children.length > 0;
    return {
      id: node.id,
      label: node.label,
      description: node.path,
      isExpanded: hasChildren,
      isSelected: !hasChildren && node.id === selectedId,
      endContent:
        node.kind === 'team' ? (
          <Token label="Team" size="sm" color="blue" />
        ) : undefined,
      onClick: hasChildren
        ? undefined
        : () => onSelect({id: node.id, label: node.label, path: node.path}),
      children: hasChildren
        ? toTreeListItems(node.children ?? [], selectedId, onSelect)
        : undefined,
    };
  });
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
    <div
      ref={gridRef}
      role="grid"
      aria-label="Fruit ripeness choices"
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      {...stylex.props(styles.thinkingSurface)}>
      {fruits.map(fruit => (
        <div key={fruit.id} role="row" {...stylex.props(styles.thinkingRow)}>
          <div role="rowheader" {...stylex.props(styles.fruitSummary)}>
            <span aria-hidden="true" {...stylex.props(styles.fruitEmoji)}>
              {fruit.emoji}
            </span>
            <span {...stylex.props(styles.fruitText)}>
              <span {...stylex.props(styles.fruitName)}>{fruit.id}</span>
              <span {...stylex.props(styles.fruitDescription)}>
                {fruit.description}
              </span>
            </span>
          </div>
          {ripenessLevels.map(level => {
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
                  styles.levelButton,
                  isSelected && styles.selectedLevelButton,
                )}>
                {level.shortLabel}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function TreeSearchContent({
  label,
  value,
  tree,
  searchPlaceholder,
  onChange,
  close,
}: {
  label: string;
  value: DestinationValue;
  tree: DestinationNode[];
  searchPlaceholder: string;
  onChange: (value: DestinationValue) => void;
  close: () => void;
}) {
  const [query, setQuery] = useState('');
  const filteredTree = useMemo(
    () => filterDestinationTree(tree, query),
    [query, tree],
  );
  const treeItems = useMemo(
    () =>
      toTreeListItems(filteredTree, value.id, nextValue => {
        onChange(nextValue);
        close();
      }),
    [close, filteredTree, onChange, value.id],
  );

  return (
    <VStack gap={3}>
      <div {...stylex.props(styles.searchArea)}>
        <TextInput
          label={`Search ${label}`}
          isLabelHidden
          value={query}
          onChange={setQuery}
          hasClear
          placeholder={searchPlaceholder}
        />
      </div>
      <div {...stylex.props(styles.treePanel)}>
        {treeItems.length > 0 ? (
          <TreeList items={treeItems} density="compact" />
        ) : (
          <div role="status" {...stylex.props(styles.emptyState)}>
            <Text type="supporting" color="secondary">
              No matching destinations.
            </Text>
          </div>
        )}
      </div>
      <div {...stylex.props(styles.selectedSummary)}>
        <HStack gap={2} wrap="wrap">
          <Text type="supporting" color="secondary">
            Current:
          </Text>
          <Token label={value.path} size="sm" color="blue" />
        </HStack>
      </div>
    </VStack>
  );
}

export const FruitRipenessGrid: Story = {
  name: 'Fruit ripeness selector',
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
          triggerLabel={formatFruitValue(value)}
          contentXstyle={styles.fruitContent}>
          {(selectedValue, onChange, close) => (
            <div>
              <div {...stylex.props(styles.intro)}>
                <Text type="supporting" color="secondary">
                  Pick a blend profile. The compact pills mirror a hover-rich
                  selector while staying available to keyboard users.
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
                  <Text type="supporting">↓ from Apple J lands on Pear J.</Text>
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

export const TreeListWithSearch: Story = {
  name: 'Tree list with search',
  render: () => {
    const [value, setValue] = useState<DestinationValue>({
      id: 'teams-design-systems-accessibility',
      label: 'Accessibility',
      path: '/Teams/Design systems/Accessibility',
    });

    return (
      <VStack gap={4} xstyle={styles.wrapper}>
        <ComplexSelector<DestinationValue>
          label="Project destination"
          description="Search and browse nested folders from one selector."
          value={value}
          onChange={setValue}
          triggerLabel={formatDestinationValue(value)}
          contentXstyle={styles.treeContent}>
          {(selectedValue, onChange, close) => (
            <TreeSearchContent
              label="destinations"
              value={selectedValue}
              tree={destinationTree}
              searchPlaceholder="Search folders or teams"
              onChange={onChange}
              close={close}
            />
          )}
        </ComplexSelector>
      </VStack>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'A complex selector that combines TextInput search with TreeList hierarchy. TreeList owns tree keyboard navigation while ComplexSelector owns the trigger and popover shell. Evaluate the composed content against WCAG 2.2 keyboard, focus, name/role, label, and contrast criteria.',
      },
    },
  },
};

export const CategoryTreeSelector: Story = {
  name: 'Category tree selector',
  render: () => {
    const [value, setValue] = useState<DestinationValue>({
      id: 'produce-fruit-citrus',
      label: 'Citrus',
      path: 'Produce / Fruit / Citrus',
    });

    return (
      <VStack gap={4} xstyle={styles.wrapper}>
        <ComplexSelector<DestinationValue>
          label="Product category"
          description="Search or browse a category tree."
          value={value}
          onChange={setValue}
          triggerLabel={value.path}
          contentXstyle={styles.treeContent}>
          {(selectedValue, onChange, close) => (
            <TreeSearchContent
              label="categories"
              value={selectedValue}
              tree={categoryTree}
              searchPlaceholder="Search categories"
              onChange={onChange}
              close={close}
            />
          )}
        </ComplexSelector>
        <Button label="Save category" variant="primary" />
      </VStack>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'A second tree-search example showing the same ComplexSelector shell with different hierarchical data and a form action nearby. The custom content relies on TreeList focus behavior and should be checked against WCAG 2.2.',
      },
    },
  },
};

// --- State coverage stories (hardening #4710) ---

const MOODS = ['Focused', 'Playful', 'Calm'] as const;
type Mood = (typeof MOODS)[number];

function MoodList({
  value,
  onChange,
}: {
  value: Mood | null;
  onChange: (value: Mood) => void;
}) {
  return (
    <VStack gap={1}>
      {MOODS.map(mood => (
        <Button
          key={mood}
          variant={value === mood ? 'primary' : 'ghost'}
          label={mood}
          onClick={() => onChange(mood)}
        />
      ))}
    </VStack>
  );
}

function MoodSelector({
  value: initialValue = 'Focused',
  ...props
}: Partial<
  Omit<
    ComponentProps<typeof ComplexSelector<Mood | null>>,
    'value' | 'children'
  >
> & {value?: Mood | null}) {
  const [value, setValue] = useState<Mood | null>(initialValue);
  return (
    <ComplexSelector<Mood | null>
      label="Mood"
      value={value}
      onChange={setValue}
      triggerLabel={value ?? undefined}
      {...props}>
      {(selectedValue, onChange, close) => (
        <MoodList
          value={selectedValue}
          onChange={nextValue => {
            onChange(nextValue);
            close();
          }}
        />
      )}
    </ComplexSelector>
  );
}

export const SizeVariants: Story = {
  name: 'Size variants',
  render: () => (
    <VStack gap={4} xstyle={styles.wrapper}>
      <MoodSelector size="sm" label="Small" />
      <MoodSelector size="md" label="Medium" />
      <MoodSelector size="lg" label="Large" />
    </VStack>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'The trigger honors the shared input size scale. Inside a SizeContext container the size cascades like every other input.',
      },
    },
  },
};

export const WithStatus: Story = {
  name: 'With status',
  render: () => (
    <VStack gap={4} xstyle={styles.wrapper}>
      <MoodSelector
        label="Error"
        status={{type: 'error', message: 'A mood is required.'}}
      />
      <MoodSelector
        label="Warning"
        status={{
          type: 'warning',
          message: 'This mood may clash with the room.',
        }}
      />
      <MoodSelector
        label="Success"
        status={{type: 'success', message: 'Great pick.'}}
      />
    </VStack>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Status colors the trigger border with the shared input status treatment and swaps the chevron for a status icon, matching Selector and MultiSelector.',
      },
    },
  },
};

export const StatusVariantComparison: Story = {
  name: 'Status variant comparison',
  render: () => (
    <VStack gap={4} xstyle={styles.wrapper}>
      <MoodSelector
        label="Attached"
        status={{type: 'error', message: 'Attached below the input.'}}
        statusVariant="attached"
      />
      <MoodSelector
        label="Detached"
        status={{type: 'error', message: 'Detached with a gap.'}}
        statusVariant="detached"
      />
      <MoodSelector
        label="Tooltip"
        status={{type: 'error', message: 'Shown in a tooltip.'}}
        statusVariant="tooltip"
      />
    </VStack>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'The three status message placements. The tooltip variant renders the status icon as a focusable button that reveals the message.',
      },
    },
  },
};

export const Disabled: Story = {
  name: 'Disabled',
  render: () => (
    <VStack gap={4} xstyle={styles.wrapper}>
      <MoodSelector label="Disabled" isDisabled />
      <MoodSelector
        label="Disabled with status"
        isDisabled
        status={{type: 'error', message: 'Still shown while disabled.'}}
      />
    </VStack>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Disabled mutes the trigger and blocks opening. A status border still shows so validation context is not lost.',
      },
    },
  },
};

export const Loading: Story = {
  name: 'Loading',
  render: () => (
    <VStack gap={4} xstyle={styles.wrapper}>
      <MoodSelector label="Loading" isLoading />
    </VStack>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'isLoading shows a spinner beside the trigger text and sets aria-busy. Opening stays available, matching sibling selectors.',
      },
    },
  },
};

export const Placeholder: Story = {
  name: 'Placeholder (empty)',
  render: () => (
    <VStack gap={4} xstyle={styles.wrapper}>
      <MoodSelector label="No value yet" value={null} />
    </VStack>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'With no triggerLabel the localized placeholder renders in secondary text, and screen readers announce it as the current value.',
      },
    },
  },
};

export const LongTriggerText: Story = {
  name: 'Long trigger text',
  render: () => {
    const [value, setValue] = useState(
      'A very long selection label that cannot possibly fit in the closed trigger and must truncate',
    );
    return (
      <VStack gap={4} xstyle={styles.wrapper}>
        <ComplexSelector<string>
          label="Overflow"
          value={value}
          onChange={setValue}
          triggerLabel={value}>
          {(_selectedValue, onChange, close) => (
            <Button
              label="Pick the long option again"
              onClick={() => {
                onChange(
                  'A very long selection label that cannot possibly fit in the closed trigger and must truncate',
                );
                close();
              }}
            />
          )}
        </ComplexSelector>
      </VStack>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Long trigger content truncates with an ellipsis instead of breaking the field layout.',
      },
    },
  },
};

export const FormComposition: Story = {
  name: 'Form composition',
  render: () => {
    const [roomName, setRoomName] = useState('');
    return (
      <VStack gap={4} xstyle={styles.wrapper}>
        <TextInput
          label="Room name"
          placeholder="e.g. Library"
          value={roomName}
          onChange={setRoomName}
        />
        <MoodSelector
          label="Room mood"
          description="Sets the default lighting scene."
          isRequired
        />
        <HStack gap={2}>
          <Button label="Save" variant="primary" />
          <Button label="Cancel" variant="secondary" />
        </HStack>
      </VStack>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'ComplexSelector aligned with sibling inputs in a form: shared label, description, required marker, and width behavior.',
      },
    },
  },
};
