// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {TransferList} from '@astryxdesign/lab';
import type {TransferListOption} from '@astryxdesign/lab';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Heading} from '@astryxdesign/core/Heading';
import {Popover} from '@astryxdesign/core/Popover';
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

const meta: Meta<typeof TransferList> = {
  title: 'Lab/TransferList',
  component: TransferList,
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

function BasicExample() {
  const defaults = ['name', 'owner', 'status'];
  const [value, setValue] = useState<readonly string[]>(defaults);

  return (
    <TransferList
      label="Visible fields"
      description="Choose which fields appear, then drag the selected fields into display order."
      options={BASIC_OPTIONS}
      value={value}
      onChange={setValue}
      selectedLabel="Visible fields"
      availableLabel="Available fields"
      hasSelectAll
      hasClear
      onReset={() => setValue(defaults)}
    />
  );
}

export const Basic: Story = {
  render: () => <BasicExample />,
};

const GROUPED_OPTIONS: ReadonlyArray<TransferListOption<string>> = [
  {
    value: 'name',
    label: 'Name',
    description: 'Required identity field',
    group: 'Identity',
    isDisabled: true,
    disabledMessage: 'Name is required and cannot be removed.',
  },
  {
    value: 'owner',
    label: 'Owner',
    description: 'Person responsible for the work',
    group: 'Identity',
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
    <TransferList
      label="Record fields"
      description="Fields are grouped by purpose. Required fields stay selected and explain why they are locked."
      options={GROUPED_OPTIONS}
      value={value}
      onChange={setValue}
      selectedLabel="Shown"
      availableLabel="Hidden"
      hasSelectAll
      hasClear
      onReset={() => setValue(defaults)}
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
    <TransferList
      label="Included filters"
      description="Use an unordered transfer list when selection matters but display order does not."
      options={BASIC_OPTIONS}
      value={value}
      onChange={setValue}
      selectedLabel="Included"
      availableLabel="Not included"
      isReorderable={false}
      hasSearch={false}
      hasSelectAll
      hasClear
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
    <Section width={360} padding={0} variant="transparent">
      <TransferList
        label="Mobile field settings"
        description="The two panels stack when horizontal space is limited."
        options={BASIC_OPTIONS}
        value={value}
        onChange={setValue}
        selectedLabel="Visible"
        availableLabel="Available"
        hasSelectAll
        hasClear
      />
    </Section>
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
    <TransferList
      label="Report fields"
      description="Search a pool of 200 options while preserving the chosen display order."
      options={LARGE_POOL_OPTIONS}
      value={value}
      onChange={setValue}
      selectedLabel="In report"
      availableLabel="Available"
      searchPlaceholder="Search 200 fields"
      hasSelectAll
      hasClear
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
  isDisabled: option.isAlwaysVisible,
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

function TableColumnSettingsExample() {
  const [appliedColumns, setAppliedColumns] = useState<
    ReadonlyArray<ProjectColumnKey>
  >(DEFAULT_PROJECT_COLUMNS);
  const [draftColumns, setDraftColumns] = useState<
    ReadonlyArray<ProjectColumnKey>
  >(DEFAULT_PROJECT_COLUMNS);
  const [savedView, setSavedView] = useState('standard');
  const [isOpen, setIsOpen] = useState(true);

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

  const selectSavedView = (nextValue: string) => {
    const nextView = SAVED_VIEWS.find(view => view.value === nextValue);
    if (nextView == null) {
      return;
    }
    setSavedView(nextValue);
    setDraftColumns(nextView.columns);
  };

  const handleOpenChange = (nextIsOpen: boolean) => {
    if (nextIsOpen) {
      setDraftColumns(appliedColumns);
    }
    setIsOpen(nextIsOpen);
  };

  const cancelChanges = () => {
    setDraftColumns(appliedColumns);
    setIsOpen(false);
  };

  const applyChanges = () => {
    setAppliedColumns(draftColumns);
    setIsOpen(false);
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
        <Popover
          label="Customize table columns"
          placement="below"
          alignment="end"
          width={760}
          isOpen={isOpen}
          onOpenChange={handleOpenChange}
          hasAutoFocus={false}
          content={
            <VStack gap={3}>
              <VStack gap={0.5}>
                <Heading level={3}>Customize columns</Heading>
                <Text type="supporting" color="secondary">
                  Start from a saved view, then choose and order the columns for
                  this table.
                </Text>
              </VStack>
              <Selector
                label="Saved view"
                options={SAVED_VIEWS.map(view => ({
                  value: view.value,
                  label: view.label,
                }))}
                value={savedView}
                onChange={selectSavedView}
                width="100%"
              />
              <Divider />
              <TransferList
                label="Table columns"
                isLabelHidden
                options={PROJECT_TRANSFER_OPTIONS}
                value={draftColumns}
                onChange={setDraftColumns}
                selectedLabel="Shown columns"
                availableLabel="Hidden columns"
                hasSelectAll
                hasClear
                onReset={() => {
                  setSavedView('standard');
                  setDraftColumns(DEFAULT_PROJECT_COLUMNS);
                }}
              />
              <Divider />
              <HStack gap={2} hAlign="end" vAlign="center" wrap="wrap">
                <Button
                  label="Reset columns"
                  variant="ghost"
                  onClick={() => {
                    setSavedView('standard');
                    setDraftColumns(DEFAULT_PROJECT_COLUMNS);
                  }}
                />
                <Button
                  label="Cancel column changes"
                  variant="secondary"
                  onClick={cancelChanges}>
                  Cancel
                </Button>
                <Button
                  label="Apply column changes"
                  variant="primary"
                  onClick={applyChanges}>
                  Apply
                </Button>
              </HStack>
            </VStack>
          }>
          <Button
            label={`Customize columns, ${appliedColumns.length} visible`}
            variant="secondary">
            {`Columns · ${appliedColumns.length}`}
          </Button>
        </Popover>
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
  render: () => <TableColumnSettingsExample />,
};
