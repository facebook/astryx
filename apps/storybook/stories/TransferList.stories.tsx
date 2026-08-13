// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TransferList.stories.tsx
 * @input TransferListSelector option data, commit behavior, and advanced Core selector and table primitives
 * @output Storybook examples for immediate/staged selectors plus advanced TransferList composition
 * @position Lab Storybook documentation and visual validation
 *
 * SYNC: When selector commit behavior or TransferList interaction changes, update source, docs, and tests.
 */

import {useEffect, useRef, useState, type SVGProps} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {TransferList, TransferListSelector} from '@astryxdesign/lab';
import type {TransferListOption, TransferListProps} from '@astryxdesign/lab';
import {Button} from '@astryxdesign/core/Button';
import {ComplexSelector} from '@astryxdesign/core/ComplexSelector';
import {Divider} from '@astryxdesign/core/Divider';
import {Heading} from '@astryxdesign/core/Heading';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Section} from '@astryxdesign/core/Section';
import {Selector} from '@astryxdesign/core/Selector';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {
  Table,
  pixel,
  proportional,
  useTableColumnSettings,
  useTableColumnSettingsState,
} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {Text} from '@astryxdesign/core/Text';
import {
  colorVars,
  radiusVars,
  spacingVars,
} from '@astryxdesign/core/theme/tokens.stylex';
function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

const styles = stylex.create({
  viewOptionsTrigger: {
    backgroundColor: colorVars['--color-background-muted'],
    borderRadius: radiusVars['--radius-element'],
  },
  viewOptionsContent: {
    width: 'min(760px, calc(100vw - 32px))',
    maxWidth: 'calc(100vw - 32px)',
    maxHeight: 'min(680px, calc(100vh - 32px))',
    padding: 0,
    overflow: 'hidden',
  },
  narrowSelectorContent: {
    width: 'min(360px, calc(100vw - 32px))',
    maxWidth: 'min(360px, calc(100vw - 32px))',
    maxHeight: 'calc(100vh - 32px)',
    padding: 0,
  },
  viewOptionsSurface: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    maxHeight: 'min(680px, calc(100vh - 32px))',
  },
  viewOptionsHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-3'],
  },
  presetsRow: {
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr) auto',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-3'],
  },
  transferListSection: {
    minHeight: 0,
    overflowY: 'auto',
    overscrollBehavior: 'contain',
  },
  viewOptionsFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-3'],
  },
});

const meta: Meta<typeof TransferListSelector> = {
  title: 'Lab/TransferListSelector',
  component: TransferListSelector,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    Story => (
      <div
        style={{
          width: 'min(900px, calc(100vw - 64px))',
          minHeight: 480,
        }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const BASIC_OPTIONS: ReadonlyArray<TransferListOption<string>> = [
  {
    value: 'name',
    label: 'Name',
    description: 'Primary display name for the record',
  },
  {
    value: 'owner',
    label: 'Owner',
    description: 'Person responsible for the record',
  },
  {
    value: 'status',
    label: 'Status',
    description: 'Current workflow state',
  },
  {
    value: 'priority',
    label: 'Priority',
    description: 'Relative urgency',
  },
  {
    value: 'team',
    label: 'Team',
    description: 'Owning team',
  },
  {
    value: 'updated',
    label: 'Last updated',
    description: 'Most recent change time',
  },
  {
    value: 'created',
    label: 'Created',
    description: 'Original creation time',
  },
];

const BASIC_DESCRIPTION =
  'Choose which fields appear. Changes take effect immediately, and drag reorder commits on release.';

const BASIC_TRANSFER_LIST_PROPS = {
  label: 'Visible fields',
  options: BASIC_OPTIONS,
  selectedLabel: 'Visible fields',
  availableLabel: 'Available fields',
  hasSelectAll: true,
  hasClear: true,
} satisfies Omit<TransferListProps<string>, 'value' | 'onChange'>;

function DefaultExample() {
  const defaults = ['name', 'owner', 'status'];
  const [value, setValue] = useState<readonly string[]>(defaults);
  return (
    <TransferListSelector
      {...BASIC_TRANSFER_LIST_PROPS}
      description={BASIC_DESCRIPTION}
      value={value}
      onChange={setValue}
      triggerLabel={`${value.length} visible fields`}
    />
  );
}

export const Default: Story = {
  render: () => <DefaultExample />,
};

function StagedChangesExample() {
  const defaults = ['name', 'owner', 'status'];
  const [value, setValue] = useState<readonly string[]>(defaults);
  return (
    <TransferListSelector
      {...BASIC_TRANSFER_LIST_PROPS}
      description="Review the complete field selection before applying it."
      value={value}
      onChange={setValue}
      commitBehavior="staged"
      triggerLabel={`${value.length} visible fields`}
    />
  );
}

export const StagedChanges: Story = {
  render: () => <StagedChangesExample />,
};

const GROUPED_OPTIONS: ReadonlyArray<TransferListOption<string>> = [
  {
    value: 'name',
    label: 'Name',
    description: 'Required identity field',
    group: 'Identity',
    isTransferDisabled: true,
    isReorderDisabled: true,
    disabledMessage: 'Name is required and fixed in position.',
  },
  {
    value: 'owner',
    label: 'Owner',
    description: 'Person responsible for the work',
    group: 'Identity',
    isTransferDisabled: true,
    disabledMessage: 'Owner must remain visible but can be reordered.',
  },
  {
    value: 'team',
    label: 'Team',
    description: 'Owning team',
    group: 'Identity',
  },
  {
    value: 'status',
    label: 'Status',
    description: 'Current workflow state',
    group: 'Planning',
    isReorderDisabled: true,
    disabledMessage:
      'Status can be hidden but its current position is fixed while selected.',
  },
  {
    value: 'priority',
    label: 'Priority',
    description: 'Relative urgency',
    group: 'Planning',
  },
  {
    value: 'due',
    label: 'Due date',
    description: 'Planned completion date',
    group: 'Planning',
  },
  {
    value: 'updated',
    label: 'Last updated',
    description: 'Most recent change time',
    group: 'Activity',
  },
  {
    value: 'created',
    label: 'Created',
    description: 'Original creation time',
    group: 'Activity',
  },
];

function GroupedAndLockedExample() {
  const defaults = ['name', 'owner', 'status', 'updated'];
  const [value, setValue] = useState<readonly string[]>(defaults);

  return (
    <TransferListSelector
      label="Record fields"
      description="Fields are grouped by purpose. Removal and reordering constraints can be applied independently."
      options={GROUPED_OPTIONS}
      value={value}
      onChange={setValue}
      selectedLabel="Shown"
      availableLabel="Hidden"
      hasSelectAll
      hasClear
      triggerLabel={`${value.length} shown fields`}
    />
  );
}

export const GroupedAndLocked: Story = {
  render: () => <GroupedAndLockedExample />,
};

function UnorderedExample() {
  const [value, setValue] = useState<readonly string[]>([
    'status',
    'priority',
    'team',
  ]);

  return (
    <TransferListSelector
      label="Included filters"
      description="Use an unordered transfer list when selection matters but display order does not."
      options={BASIC_OPTIONS}
      value={value}
      onChange={setValue}
      selectedLabel="Included"
      availableLabel="Not included"
      isReorderable={false}
      hasSelectAll
      hasClear
      triggerLabel={`${value.length} included filters`}
    />
  );
}

export const Unordered: Story = {
  render: () => <UnorderedExample />,
};

function NarrowContainerExample() {
  const [value, setValue] = useState<readonly string[]>([
    'name',
    'owner',
    'status',
  ]);
  return (
    <TransferListSelector
      label="Mobile field settings"
      description="The two panels stack when horizontal space is limited."
      options={BASIC_OPTIONS}
      value={value}
      onChange={setValue}
      triggerLabel={`${value.length} visible fields`}
      width="min(360px, calc(100vw - 32px))"
      placement="below"
      contentXstyle={styles.narrowSelectorContent}
      selectedLabel="Visible"
      availableLabel="Available"
      isReorderable={false}
      hasSelectAll
      hasClear
    />
  );
}

export const NarrowContainer: Story = {
  render: () => <NarrowContainerExample />,
};

const LARGE_POOL_OPTIONS: ReadonlyArray<TransferListOption<string>> =
  Array.from({length: 200}, (_, index) => {
    const number = index + 1;
    return {
      value: `field-${number}`,
      label: `Field ${String(number).padStart(3, '0')}`,
      description: `Configurable field ${number}`,
      group: `Group ${Math.floor(index / 40) + 1}`,
    };
  });

function LargePoolExample() {
  const [value, setValue] = useState<readonly string[]>(
    LARGE_POOL_OPTIONS.slice(0, 12).map(option => option.value),
  );

  return (
    <TransferListSelector
      label="Report fields"
      description="Search a pool of 200 options while preserving the chosen display order."
      options={LARGE_POOL_OPTIONS}
      value={value}
      onChange={setValue}
      selectedLabel="In report"
      availableLabel="Available"
      hasSearch
      searchPlaceholder="Search 200 fields"
      hasSelectAll
      hasClear
      triggerLabel={`${value.length} report fields`}
    />
  );
}

export const LargePool: Story = {
  render: () => <LargePoolExample />,
};

interface ProjectRow extends Record<string, unknown> {
  id: string;
  name: string;
  owner: string;
  status: string;
  priority: string;
  team: string;
  updated: string;
}

type ProjectColumnKey =
  'name' | 'owner' | 'status' | 'priority' | 'team' | 'updated';

const PROJECTS: ProjectRow[] = [
  {
    id: 'p-1',
    name: 'Account migration',
    owner: 'Mina Patel',
    status: 'On track',
    priority: 'High',
    team: 'Platform',
    updated: '12 min ago',
  },
  {
    id: 'p-2',
    name: 'Mobile refresh',
    owner: 'Theo Martin',
    status: 'At risk',
    priority: 'High',
    team: 'Product',
    updated: '1 hr ago',
  },
  {
    id: 'p-3',
    name: 'Quarterly planning',
    owner: 'Sam Lee',
    status: 'In review',
    priority: 'Medium',
    team: 'Operations',
    updated: 'Yesterday',
  },
  {
    id: 'p-4',
    name: 'Search improvements',
    owner: 'Avery Chen',
    status: 'On track',
    priority: 'Medium',
    team: 'Product',
    updated: '2 days ago',
  },
];

const PROJECT_COLUMNS: TableColumn<ProjectRow>[] = [
  {key: 'name', header: 'Project', width: proportional(2)},
  {key: 'owner', header: 'Owner', width: proportional(1)},
  {key: 'status', header: 'Status', width: pixel(112)},
  {key: 'priority', header: 'Priority', width: pixel(96)},
  {key: 'team', header: 'Team', width: proportional(1)},
  {key: 'updated', header: 'Updated', width: pixel(112)},
];

const PROJECT_COLUMN_OPTIONS: ReadonlyArray<{
  key: ProjectColumnKey;
  label: string;
  group?: string;
  isAlwaysVisible?: boolean;
}> = [
  {
    key: 'name',
    label: 'Project',
    group: 'Identity',
    isAlwaysVisible: true,
  },
  {key: 'owner', label: 'Owner', group: 'Identity'},
  {key: 'team', label: 'Team', group: 'Identity'},
  {key: 'status', label: 'Status', group: 'Planning'},
  {key: 'priority', label: 'Priority', group: 'Planning'},
  {key: 'updated', label: 'Updated', group: 'Activity'},
];

const PROJECT_TRANSFER_OPTIONS: ReadonlyArray<
  TransferListOption<ProjectColumnKey>
> = PROJECT_COLUMN_OPTIONS.map(option => ({
  value: option.key,
  label: option.label,
  group: option.group,
  isTransferDisabled: option.isAlwaysVisible,
  disabledMessage: option.isAlwaysVisible
    ? 'Project is the primary identity column and must stay visible.'
    : undefined,
}));

const DEFAULT_PROJECT_COLUMNS: ReadonlyArray<ProjectColumnKey> = [
  'name',
  'owner',
  'status',
  'priority',
  'updated',
];

const SAVED_VIEWS: ReadonlyArray<{
  value: string;
  label: string;
  columns: ReadonlyArray<ProjectColumnKey>;
}> = [
  {
    value: 'standard',
    label: 'Standard view',
    columns: DEFAULT_PROJECT_COLUMNS,
  },
  {
    value: 'ownership',
    label: 'Ownership view',
    columns: ['name', 'owner', 'team', 'status'],
  },
  {
    value: 'planning',
    label: 'Planning view',
    columns: ['name', 'status', 'priority', 'owner', 'updated'],
  },
];

function hasSameOrderedColumns(
  left: ReadonlyArray<ProjectColumnKey>,
  right: ReadonlyArray<ProjectColumnKey>,
): boolean {
  return (
    left.length === right.length &&
    left.every((column, index) => column === right[index])
  );
}

function ResetTableDraftOnOpen({
  isOpen,
  appliedColumns,
  savedViews,
  setDraftColumns,
  setActiveSavedView,
}: {
  isOpen: boolean;
  appliedColumns: ReadonlyArray<ProjectColumnKey>;
  savedViews: ReadonlyArray<(typeof SAVED_VIEWS)[number]>;
  setDraftColumns: (columns: ReadonlyArray<ProjectColumnKey>) => void;
  setActiveSavedView: (value: string) => void;
}) {
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      setDraftColumns([...appliedColumns]);
      setActiveSavedView(
        savedViews.find(view =>
          hasSameOrderedColumns(view.columns, appliedColumns),
        )?.value ?? 'custom',
      );
    }
    wasOpenRef.current = isOpen;
  }, [appliedColumns, isOpen, savedViews, setActiveSavedView, setDraftColumns]);

  return null;
}

function TableColumnSettingsExample() {
  const [appliedColumns, setAppliedColumns] = useState<
    ReadonlyArray<ProjectColumnKey>
  >(DEFAULT_PROJECT_COLUMNS);
  const [draftColumns, setDraftColumns] = useState<
    ReadonlyArray<ProjectColumnKey>
  >(DEFAULT_PROJECT_COLUMNS);
  const [savedViews, setSavedViews] = useState(SAVED_VIEWS);
  const [activeSavedView, setActiveSavedView] = useState('standard');
  const nextSavedViewNumberRef = useRef(1);

  const columnSettingsState = useTableColumnSettingsState<ProjectColumnKey>({
    columns: PROJECT_COLUMN_OPTIONS,
    activeColumnKeys: appliedColumns,
    onChangeActiveColumnKeys: setAppliedColumns,
    defaultColumnKeys: DEFAULT_PROJECT_COLUMNS,
  });
  const columnSettingsPlugin = useTableColumnSettings<
    ProjectRow,
    ProjectColumnKey
  >(columnSettingsState.columnSettingsConfig);

  const savedViewOptions = [
    ...savedViews.map(view => ({value: view.value, label: view.label})),
    {value: 'custom', label: 'Custom', disabled: true},
  ];

  const findSavedViewValue = (
    nextColumns: ReadonlyArray<ProjectColumnKey>,
  ): string =>
    savedViews.find(view => hasSameOrderedColumns(view.columns, nextColumns))
      ?.value ?? 'custom';

  const selectSavedView = (nextValue: string) => {
    const nextView = savedViews.find(view => view.value === nextValue);
    if (nextView == null) {
      return;
    }
    setActiveSavedView(nextView.value);
    setDraftColumns(nextView.columns);
  };

  const changeDraftColumns = (nextColumns: ReadonlyArray<ProjectColumnKey>) => {
    setDraftColumns(nextColumns);
    setActiveSavedView(findSavedViewValue(nextColumns));
  };

  const saveCurrentColumnsAsView = () => {
    const nextNumber = nextSavedViewNumberRef.current;
    nextSavedViewNumberRef.current += 1;
    const nextView = {
      value: `saved-${nextNumber}`,
      label: `Saved view ${nextNumber}`,
      columns: [...draftColumns],
    };
    setSavedViews(currentViews => [...currentViews, nextView]);
    setActiveSavedView(nextView.value);
  };

  return (
    <VStack gap={3} width="100%">
      <HStack gap={3} hAlign="between" vAlign="center">
        <VStack gap={0.5}>
          <Heading level={2}>Projects</Heading>
          <Text type="supporting" color="secondary">
            Customize visible columns without changing the underlying data.
          </Text>
        </VStack>
        <ComplexSelector
          label="View options"
          isLabelHidden
          value={appliedColumns}
          onChange={setAppliedColumns}
          triggerLabel="View Options"
          placement="below"
          xstyle={styles.viewOptionsTrigger}
          contentXstyle={styles.viewOptionsContent}>
          {(_currentColumns, commit, close, state) => (
            <div {...stylex.props(styles.viewOptionsSurface)}>
              <ResetTableDraftOnOpen
                isOpen={state.isOpen}
                appliedColumns={appliedColumns}
                savedViews={savedViews}
                setDraftColumns={setDraftColumns}
                setActiveSavedView={setActiveSavedView}
              />
              <div {...stylex.props(styles.viewOptionsHeader)}>
                <Heading level={3}>View Options</Heading>
                <IconButton
                  label="Close view options"
                  icon={<Icon icon="close" size="sm" color="inherit" />}
                  variant="ghost"
                  size="sm"
                  onClick={close}
                />
              </div>
              <Divider />
              <div {...stylex.props(styles.presetsRow)}>
                <Text type="label" weight="semibold">
                  Presets
                </Text>
                <Selector
                  label="Column preset"
                  isLabelHidden
                  options={savedViewOptions}
                  value={activeSavedView}
                  onChange={selectSavedView}
                  width="100%"
                />
                <IconButton
                  label="Save current columns as a preset"
                  icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
                  variant="secondary"
                  size="sm"
                  onClick={saveCurrentColumnsAsView}
                />
              </div>
              <div {...stylex.props(styles.transferListSection)}>
                <TransferList
                  label="Table columns"
                  isLabelHidden
                  options={PROJECT_TRANSFER_OPTIONS}
                  value={draftColumns}
                  onChange={changeDraftColumns}
                  selectedLabel="Visible fields"
                  availableLabel="Available fields"
                  hasSearch
                  searchPlaceholder="Search columns"
                  hasSelectAll
                  hasClear
                />
              </div>
              <Divider />
              <div {...stylex.props(styles.viewOptionsFooter)}>
                <Button
                  label="Restore columns to default"
                  variant="ghost"
                  onClick={() => {
                    setDraftColumns(DEFAULT_PROJECT_COLUMNS);
                    setActiveSavedView('standard');
                  }}>
                  Restore to default
                </Button>
                <HStack gap={2}>
                  <Button
                    label="Cancel column changes"
                    variant="ghost"
                    onClick={() => {
                      setDraftColumns(appliedColumns);
                      setActiveSavedView(findSavedViewValue(appliedColumns));
                      close();
                    }}>
                    Cancel
                  </Button>
                  <Button
                    label="Apply column changes"
                    variant="primary"
                    onClick={() => {
                      commit(draftColumns);
                      close();
                    }}>
                    Apply
                  </Button>
                </HStack>
              </div>
            </div>
          )}
        </ComplexSelector>
      </HStack>
      <Section padding={0}>
        <Table
          data={PROJECTS}
          columns={PROJECT_COLUMNS}
          idKey="id"
          plugins={{columnSettings: columnSettingsPlugin}}
          hasHover
          textOverflow="truncate"
        />
      </Section>
    </VStack>
  );
}

export const TableColumnSettings: Story = {
  name: 'Advanced: Table column settings',
  render: () => <TableColumnSettingsExample />,
};
