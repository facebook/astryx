'use client';

import {useState, useCallback} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars, radiusVars, shadowVars} from '@xds/core/theme/tokens.stylex';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSCenter} from '@xds/core/Center';
import {XDSDivider} from '@xds/core/Divider';
import {XDSEmptyState} from '@xds/core/EmptyState';
import {XDSHStack, XDSVStack} from '@xds/core/Layout';
import {XDSIcon} from '@xds/core/Icon';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSTable} from '@xds/core/Table';
import type {XDSTableColumn} from '@xds/core/Table';
import {XDSSection} from '@xds/core/Section';
import {
  XDSSegmentedControl,
  XDSSegmentedControlItem,
} from '@xds/core/SegmentedControl';
import {XDSSelector} from '@xds/core/Selector';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSTextArea} from '@xds/core/TextArea';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSToolbar} from '@xds/core/Toolbar';
import {
  Squares2X2Icon,
  DocumentTextIcon,
  PhotoIcon,
  CursorArrowRaysIcon,
  ViewColumnsIcon,
  SparklesIcon,
  MegaphoneIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ComputerDesktopIcon,
  DeviceTabletIcon,
  DevicePhoneMobileIcon,
  EyeIcon,
  PlusCircleIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  BanknotesIcon,
  ChatBubbleLeftIcon,
  PlayCircleIcon,
  EllipsisHorizontalIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import {XDSSpinner} from '@xds/core/Spinner';

type BlockType =
  | 'hero'
  | 'text'
  | 'image'
  | 'button'
  | 'cards'
  | 'features'
  | 'cta';

interface Block {
  id: string;
  type: BlockType;
  label: string;
  props: Record<string, unknown>;
}

type ViewportSize = 'desktop' | 'tablet' | 'phone';
type SidebarTab = 'blocks' | 'properties';
type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

const BLOCK_META: Record<BlockType, {label: string; icon: IconComponent}> = {
  hero: {label: 'Hero', icon: Squares2X2Icon},
  text: {label: 'Text', icon: DocumentTextIcon},
  image: {label: 'Image', icon: PhotoIcon},
  button: {label: 'Button', icon: CursorArrowRaysIcon},
  cards: {label: 'Cards', icon: ViewColumnsIcon},
  features: {label: 'Features', icon: SparklesIcon},
  cta: {label: 'CTA', icon: MegaphoneIcon},
};

type Transaction = {
  id: string;
  name: string;
  category: string;
  date: string;
  amount: string;
  isPositive?: boolean;
};

const CATEGORY_ICONS: Record<string, IconComponent> = {
  'Food & Drink': ShoppingBagIcon,
  Groceries: ShoppingCartIcon,
  Income: BanknotesIcon,
  Transport: ChatBubbleLeftIcon,
  Entertainment: PlayCircleIcon,
};

const TRANSACTION_COLUMNS: XDSTableColumn<Transaction>[] = [
  {
    key: 'name',
    header: 'Transaction',
    renderCell: (item: Transaction) => (
      <XDSHStack gap={3} vAlign="center">
        <XDSIcon icon={CATEGORY_ICONS[item.category] || SparklesIcon} />
        <XDSVStack gap={0}>
          <XDSText type="label" weight="semibold">
            {item.name}
          </XDSText>
          <XDSText type="supporting" color="secondary">
            {item.category}
          </XDSText>
        </XDSVStack>
      </XDSHStack>
    ),
  },
  {
    key: 'date',
    header: 'Date',
    renderCell: (item: Transaction) => (
      <XDSText type="body" color="secondary">
        {item.date}
      </XDSText>
    ),
  },
  {
    key: 'amount',
    header: 'Amount',
    renderCell: (item: Transaction) => (
      <XDSText
        type="label"
        weight="semibold"
        color={undefined}
        hasTabularNumbers>
        {item.amount}
      </XDSText>
    ),
  },
  {
    key: 'actions',
    header: '',
    renderCell: () => (
      <XDSButton
        label="More"
        icon={<XDSIcon icon={EllipsisHorizontalIcon} size="sm" />}
        variant="ghost"
        size="sm"
        isIconOnly
      />
    ),
  },
];

const VIEWPORT_MAX: Record<ViewportSize, number> = {
  desktop: 960,
  tablet: 768,
  phone: 375,
};

let nextId = 5;
function uid() {
  return String(nextId++);
}

const DEFAULT_BLOCKS: Block[] = [
  {
    id: '2',
    type: 'features',
    label: 'Recent Transactions',
    props: {
      heading: 'Recent Transactions',
      description: 'Your latest account activity.',
      items: [
        {
          id: 't1',
          name: 'Blue Bottle Coffee',
          category: 'Food & Drink',
          date: 'Today, 10:24 AM',
          amount: '-$6.50',
        },
        {
          id: 't2',
          name: 'Whole Foods Market',
          category: 'Groceries',
          date: 'Yesterday',
          amount: '-$142.30',
        },
        {
          id: 't3',
          name: 'Stripe Payout',
          category: 'Income',
          date: 'Oct 12',
          amount: '+$4,200.00',
          isPositive: true,
        },
        {
          id: 't4',
          name: 'Uber Technologies',
          category: 'Transport',
          date: 'Oct 11',
          amount: '-$24.10',
        },
        {
          id: 't5',
          name: 'Netflix Subscription',
          category: 'Entertainment',
          date: 'Oct 10',
          amount: '-$19.99',
        },
      ],
    },
  },
  {
    id: '3',
    type: 'text',
    label: 'Syncing State',
    props: {
      heading: 'Syncing your accounts',
      description:
        "We're pulling in your latest transactions.\nThis usually takes a few seconds.",
      buttonLabel: 'Cancel',
    },
  },
  {
    id: '4',
    type: 'cta',
    label: 'Trust Notice',
    props: {
      heading: 'Adding devices from people you trust',
      description:
        "When you approve a request, you grant someone full access to your account. They'll be able to change reservations and send messages on your behalf.",
    },
  },
];

function defaultProps(type: BlockType): Record<string, unknown> {
  switch (type) {
    case 'hero':
      return {
        heading: 'New Hero',
        subheading: 'Subtitle goes here',
        buttonLabel: 'Click Me',
        alignment: 'center',
      };
    case 'text':
      return {content: 'Enter your text here.'};
    case 'image':
      return {};
    case 'button':
      return {label: 'Button', variant: 'primary', size: 'md'};
    case 'cards':
      return {
        cards: [
          {
            title: 'Pricing',
            description: 'Flexible plans for every team size.',
          },
          {
            title: 'Support',
            description: 'Get help whenever you need it.',
          },
        ],
      };
    case 'features':
      return {
        heading: 'Activity',
        description: '',
        items: [
          {
            id: 't1',
            name: 'New Item',
            category: 'General',
            date: 'Today',
            amount: '$0.00',
          },
        ],
      };
    case 'cta':
      return {
        heading: 'Call to Action',
        description: 'Description text',
        primaryLabel: 'Primary',
        secondaryLabel: 'Secondary',
      };
  }
}

// ---------------------------------------------------------------------------
// Styles — floating sidebar requires custom positioning
// ---------------------------------------------------------------------------

const editorStyles = stylex.create({
  shell: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colorVars['--color-background-body'],
  },
  bodyRow: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  floatingPanel: {
    position: 'absolute',
    top: 16,
    left: 16,
    bottom: 16,
    width: 320,
    zIndex: 10,
    backgroundColor: colorVars['--color-background-card'],
    borderRadius: radiusVars['--radius-container'],
    boxShadow: shadowVars['--shadow-low'],
    overflow: 'hidden',
  },
  floatingPanelCollapsed: {
    bottom: 'auto',
    paddingBlockEnd: 16,
  },
  panelScroll: {
    flex: 1,
    overflowY: 'auto',
  },
  previewArea: {
    flex: 1,
    overflowY: 'auto',
    padding: 32,
    paddingLeft: 368,
  },
  canvas: (maxWidth: number) => ({
    maxWidth,
    width: '100%',
    marginInline: 'auto',
    transition: 'max-width 0.3s ease',
  }),
  clickable: {
    cursor: 'pointer',
  },
  selectedCard: {
    outline: '2px solid',
    outlineColor: colorVars['--color-border-blue'],
    outlineOffset: -2,
  },
  flex1: {
    flex: 1,
  },
  sectionHeadingInline: {
    paddingInline: 0,
  },
  iconCircle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: '50%',
    backgroundColor: colorVars['--color-background-muted'],
    flexShrink: 0,
  },
  tabListWrapper: {
    paddingInline: 4,
  },
  panelContentPadding: {
    paddingInline: 16,
    paddingBlockEnd: 16,
  },
  tabFill: {
    flex: 1,
    textAlign: 'center',
  },
});

// ---------------------------------------------------------------------------
// Properties Form
// ---------------------------------------------------------------------------

function PropertiesForm({
  block,
  onUpdate,
}: {
  block: Block;
  onUpdate: (key: string, value: unknown) => void;
}) {
  const {type, props} = block;

  switch (type) {
    case 'hero':
      return (
        <XDSVStack gap={4}>
          <XDSTextInput
            label="Heading"
            value={(props.heading as string) ?? ''}
            onChange={(v: string) => onUpdate('heading', v)}
          />
          <XDSTextArea
            label="Subheading"
            value={(props.subheading as string) ?? ''}
            onChange={(v: string) => onUpdate('subheading', v)}
          />
          <XDSTextInput
            label="Button Label"
            value={(props.buttonLabel as string) ?? ''}
            onChange={(v: string) => onUpdate('buttonLabel', v)}
          />
          <XDSSelector
            label="Alignment"
            value={(props.alignment as string) ?? 'center'}
            onChange={(v: string) => onUpdate('alignment', v)}
            options={[
              {label: 'Left', value: 'left'},
              {label: 'Center', value: 'center'},
              {label: 'Right', value: 'right'},
            ]}
          />
        </XDSVStack>
      );

    case 'text':
      return (
        <XDSVStack gap={4}>
          <XDSTextInput
            label="Heading"
            value={(props.heading as string) ?? ''}
            onChange={(v: string) => onUpdate('heading', v)}
          />
          <XDSTextArea
            label="Description"
            value={(props.description as string) ?? ''}
            onChange={(v: string) => onUpdate('description', v)}
          />
          <XDSTextInput
            label="Button Label"
            value={(props.buttonLabel as string) ?? ''}
            onChange={(v: string) => onUpdate('buttonLabel', v)}
          />
        </XDSVStack>
      );

    case 'features':
    case 'cta':
      return (
        <XDSVStack gap={4}>
          <XDSTextInput
            label="Heading"
            value={(props.heading as string) ?? ''}
            onChange={(v: string) => onUpdate('heading', v)}
          />
          <XDSTextArea
            label="Description"
            value={(props.description as string) ?? ''}
            onChange={(v: string) => onUpdate('description', v)}
          />
        </XDSVStack>
      );

    case 'button':
      return (
        <XDSVStack gap={4}>
          <XDSTextInput
            label="Label"
            value={(props.label as string) ?? ''}
            onChange={(v: string) => onUpdate('label', v)}
          />
          <XDSSelector
            label="Variant"
            value={(props.variant as string) ?? 'primary'}
            onChange={(v: string) => onUpdate('variant', v)}
            options={[
              {label: 'Primary', value: 'primary'},
              {label: 'Secondary', value: 'secondary'},
              {label: 'Ghost', value: 'ghost'},
            ]}
          />
          <XDSSelector
            label="Size"
            value={(props.size as string) ?? 'md'}
            onChange={(v: string) => onUpdate('size', v)}
            options={[
              {label: 'Small', value: 'sm'},
              {label: 'Medium', value: 'md'},
              {label: 'Large', value: 'lg'},
            ]}
          />
        </XDSVStack>
      );

    default:
      return <XDSEmptyState title="No configurable properties" isCompact />;
  }
}

// ---------------------------------------------------------------------------
// Block Preview
// ---------------------------------------------------------------------------

function BlockPreview({
  block,
  isSelected,
  onSelect,
}: {
  block: Block;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const {type, props} = block;
  const cardXstyle = [
    editorStyles.clickable,
    isSelected && editorStyles.selectedCard,
  ];

  switch (type) {
    case 'hero':
      return (
        <XDSCard padding={6} xstyle={cardXstyle} onClick={onSelect}>
          <XDSVStack gap={4}>
            <XDSHeading level={2}>
              {(props.heading as string) || 'Hero Heading'}
            </XDSHeading>
            <XDSText type="supporting" color="secondary">
              {(props.subheading as string) || 'Subtitle text goes here'}
            </XDSText>
            {(props.buttonLabel as string) && (
              <XDSButton label={props.buttonLabel as string} />
            )}
          </XDSVStack>
        </XDSCard>
      );

    case 'text':
      if (props.heading) {
        return (
          <XDSCard padding={6} xstyle={cardXstyle} onClick={onSelect}>
            <XDSEmptyState
              title={props.heading as string}
              description={props.description as string}
              icon={<XDSSpinner />}
              actions={
                (props.buttonLabel as string) ? (
                  <XDSButton
                    label={props.buttonLabel as string}
                    variant="secondary"
                  />
                ) : undefined
              }
            />
          </XDSCard>
        );
      }
      return (
        <XDSCard xstyle={cardXstyle} onClick={onSelect}>
          <XDSText type="body">
            {(props.content as string) || 'Text content goes here'}
          </XDSText>
        </XDSCard>
      );

    case 'image':
      return (
        <XDSCard xstyle={cardXstyle} onClick={onSelect}>
          <XDSEmptyState
            title="Image Block"
            description="Drop an image or enter a URL"
            icon={<XDSIcon icon={PhotoIcon} />}
            isCompact
          />
        </XDSCard>
      );

    case 'button':
      return (
        <XDSCard padding={6} xstyle={cardXstyle} onClick={onSelect}>
          <XDSCenter>
            <XDSButton
              label={(props.label as string) || 'Button'}
              variant={
                (props.variant as 'primary' | 'secondary' | 'ghost') ||
                'primary'
              }
              size={(props.size as 'sm' | 'md' | 'lg') || 'md'}
            />
          </XDSCenter>
        </XDSCard>
      );

    case 'features': {
      const items = (props.items as Transaction[]) || [];
      return (
        <XDSCard padding={6} xstyle={cardXstyle} onClick={onSelect}>
          <XDSVStack gap={4}>
            <XDSHStack gap={3} vAlign="start">
              <XDSVStack gap={1} xstyle={editorStyles.flex1}>
                <XDSHeading level={3}>
                  {(props.heading as string) || 'Features'}
                </XDSHeading>
                {(props.description as string) && (
                  <XDSText type="supporting" color="secondary">
                    {props.description as string}
                  </XDSText>
                )}
              </XDSVStack>
              <XDSButton label="View All" variant="secondary" size="sm" />
            </XDSHStack>
            <XDSTable
              data={items}
              columns={TRANSACTION_COLUMNS}
              idKey="id"
              hasHover
            />
          </XDSVStack>
        </XDSCard>
      );
    }

    case 'cards': {
      const cardItems =
        (props.cards as Array<{title: string; description: string}>) || [];
      return (
        <XDSCard xstyle={cardXstyle} onClick={onSelect}>
          <XDSVStack gap={4}>
            <XDSHeading level={3}>Cards</XDSHeading>
            <XDSDivider />
            <XDSList density="balanced" hasDividers={false}>
              {cardItems.map((card, i) => (
                <XDSListItem
                  key={i}
                  label={card.title}
                  description={card.description}
                />
              ))}
            </XDSList>
          </XDSVStack>
        </XDSCard>
      );
    }

    case 'cta':
      return (
        <XDSCard padding={6} xstyle={cardXstyle} onClick={onSelect}>
          <XDSHStack gap={4} vAlign="start">
            <div {...stylex.props(editorStyles.iconCircle)}>
              <XDSIcon icon={LockClosedIcon} color="secondary" />
            </div>
            <XDSVStack gap={1}>
              <XDSText type="label" weight="semibold">
                {(props.heading as string) || 'Notice'}
              </XDSText>
              <XDSText type="supporting" color="secondary">
                {(props.description as string) || 'Description text'}
              </XDSText>
            </XDSVStack>
          </XDSHStack>
        </XDSCard>
      );

    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Editor Page
// ---------------------------------------------------------------------------

export default function EditorPage() {
  const [blocks, setBlocks] = useState<Block[]>(DEFAULT_BLOCKS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('blocks');
  const [pageTitle, setPageTitle] = useState('Page Editor');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [viewport, setViewport] = useState<ViewportSize>('desktop');

  const selectedBlock = blocks.find(b => b.id === selectedId) ?? null;

  const updateBlockProp = useCallback(
    (id: string, key: string, value: unknown) => {
      setBlocks(prev =>
        prev.map(b =>
          b.id === id ? {...b, props: {...b.props, [key]: value}} : b,
        ),
      );
    },
    [],
  );

  const moveBlock = useCallback((id: string, dir: -1 | 1) => {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id);
      if (idx < 0) return prev;
      const target = idx + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }, []);

  const deleteBlock = useCallback(
    (id: string) => {
      setBlocks(prev => prev.filter(b => b.id !== id));
      if (selectedId === id) setSelectedId(null);
    },
    [selectedId],
  );

  const addBlock = useCallback((type: BlockType) => {
    const id = uid();
    const newBlock: Block = {
      id,
      type,
      label: BLOCK_META[type].label,
      props: defaultProps(type),
    };
    setBlocks(prev => [...prev, newBlock]);
    setSelectedId(id);
    setSidebarTab('properties');
  }, []);

  const selectBlock = useCallback((id: string) => {
    setSelectedId(prev => (prev === id ? null : id));
    setSidebarTab('properties');
  }, []);

  // --- sidebar content ---

  const blocksTabContent = (
    <XDSVStack gap={2}>
      <XDSVStack gap={1}>
        <XDSSection
          variant="transparent"
          padding={2}
          xstyle={editorStyles.sectionHeadingInline}>
          <XDSHeading level={4}>Add Block</XDSHeading>
        </XDSSection>
        <XDSList density="balanced" hasDividers={false}>
          {(Object.keys(BLOCK_META) as BlockType[]).map(type => (
            <XDSListItem
              key={type}
              label={BLOCK_META[type].label}
              startContent={
                <XDSIcon icon={BLOCK_META[type].icon} color="secondary" />
              }
              onClick={() => addBlock(type)}
            />
          ))}
        </XDSList>
      </XDSVStack>

      <XDSVStack gap={1}>
        <XDSSection
          variant="transparent"
          padding={2}
          xstyle={editorStyles.sectionHeadingInline}>
          <XDSHeading level={4}>Layers</XDSHeading>
        </XDSSection>
        <XDSList density="balanced" hasDividers={false}>
          {blocks.map(block => (
            <XDSListItem
              key={block.id}
              label={block.label}
              isSelected={block.id === selectedId}
              onClick={() => selectBlock(block.id)}
              startContent={
                <XDSIcon icon={BLOCK_META[block.type].icon} color="secondary" />
              }
              endContent={
                <XDSHStack gap={1}>
                  <XDSButton
                    label="Move up"
                    icon={<XDSIcon icon={ChevronUpIcon} size="sm" />}
                    variant="ghost"
                    size="sm"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      moveBlock(block.id, -1);
                    }}
                    isIconOnly
                  />
                  <XDSButton
                    label="Move down"
                    icon={<XDSIcon icon={ChevronDownIcon} size="sm" />}
                    variant="ghost"
                    size="sm"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      moveBlock(block.id, 1);
                    }}
                    isIconOnly
                  />
                  <XDSButton
                    label="Delete"
                    icon={<XDSIcon icon={TrashIcon} size="sm" />}
                    variant="ghost"
                    size="sm"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      deleteBlock(block.id);
                    }}
                    isIconOnly
                  />
                </XDSHStack>
              }
            />
          ))}
        </XDSList>
      </XDSVStack>
    </XDSVStack>
  );

  const propertiesTabContent = selectedBlock ? (
    <PropertiesForm
      block={selectedBlock}
      onUpdate={(key, value) => updateBlockProp(selectedBlock.id, key, value)}
    />
  ) : (
    <XDSEmptyState
      title="No block selected"
      description="Select a block to edit its properties"
      isCompact
    />
  );

  return (
    <XDSVStack xstyle={editorStyles.shell}>
      <XDSHStack xstyle={editorStyles.bodyRow}>
        {/* Floating Sidebar */}
        <XDSVStack
          gap={4}
          xstyle={[
            editorStyles.floatingPanel,
            isPanelCollapsed && editorStyles.floatingPanelCollapsed,
          ]}>
          {/* Panel Header */}
          <XDSSection variant="transparent" padding={4}>
            <XDSVStack gap={4}>
              <XDSHStack gap={3} vAlign="center">
                <XDSVStack gap={0} xstyle={editorStyles.flex1}>
                  {isEditingTitle ? (
                    <XDSTextInput
                      label="Page title"
                      isLabelHidden
                      value={pageTitle}
                      onChange={setPageTitle}
                      onKeyDown={(e: React.KeyboardEvent) => {
                        if (e.key === 'Enter') setIsEditingTitle(false);
                      }}
                      hasAutoFocus
                      onBlur={() => setIsEditingTitle(false)}
                    />
                  ) : (
                    <XDSHeading level={2}>{pageTitle}</XDSHeading>
                  )}
                </XDSVStack>
                <XDSHStack gap={1}>
                  <XDSButton
                    label={isPanelCollapsed ? 'Expand panel' : 'Collapse panel'}
                    icon={
                      <XDSIcon icon={isPanelCollapsed ? ChevronDownIcon : ChevronUpIcon} size="sm" />
                    }
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsPanelCollapsed(v => !v)}
                    isIconOnly
                  />
                </XDSHStack>
              </XDSHStack>

              <XDSToolbar
                label="Viewport and actions"
                startContent={
                  <XDSSegmentedControl
                    label="Viewport size"
                    value={viewport}
                    onChange={(v: string) => setViewport(v as ViewportSize)}>
                    <XDSSegmentedControlItem
                      value="desktop"
                      label="Desktop"
                      icon={<XDSIcon icon={ComputerDesktopIcon} size="sm" />}
                      isLabelHidden
                    />
                    <XDSSegmentedControlItem
                      value="tablet"
                      label="Tablet"
                      icon={<XDSIcon icon={DeviceTabletIcon} size="sm" />}
                      isLabelHidden
                    />
                    <XDSSegmentedControlItem
                      value="phone"
                      label="Phone"
                      icon={<XDSIcon icon={DevicePhoneMobileIcon} size="sm" />}
                      isLabelHidden
                    />
                  </XDSSegmentedControl>
                }
                endContent={
                  <XDSHStack gap={2}>
                    <XDSButton
                      label="Preview"
                      icon={<XDSIcon icon={EyeIcon} size="sm" />}
                      variant="ghost"
                      isIconOnly
                    />
                    <XDSButton label="Publish" variant="primary" />
                  </XDSHStack>
                }
              />
            </XDSVStack>
          </XDSSection>

          {!isPanelCollapsed && (
            <>
              <XDSVStack gap={0} xstyle={editorStyles.tabListWrapper}>
                <XDSTabList
                  value={sidebarTab}
                  onChange={(v: string) => setSidebarTab(v as SidebarTab)}>
                  <XDSTab
                    value="blocks"
                    label="Blocks"
                    xstyle={editorStyles.tabFill}
                  />
                  <XDSTab
                    value="properties"
                    label="Properties"
                    xstyle={editorStyles.tabFill}
                  />
                </XDSTabList>
                <XDSDivider />
              </XDSVStack>
              <XDSSection
                variant="transparent"
                padding={0}
                xstyle={[
                  editorStyles.panelScroll,
                  editorStyles.panelContentPadding,
                ]}>
                {sidebarTab === 'blocks'
                  ? blocksTabContent
                  : propertiesTabContent}
              </XDSSection>
            </>
          )}
        </XDSVStack>

        {/* Preview Canvas */}
        <XDSVStack xstyle={editorStyles.previewArea}>
          <XDSVStack
            gap={4}
            xstyle={editorStyles.canvas(VIEWPORT_MAX[viewport])}>
            {blocks.length > 0 ? (
              blocks.map(block => (
                <BlockPreview
                  key={block.id}
                  block={block}
                  isSelected={block.id === selectedId}
                  onSelect={() => selectBlock(block.id)}
                />
              ))
            ) : (
              <XDSEmptyState
                title="No blocks yet"
                description="Add blocks from the sidebar to start building your page"
                icon={<XDSIcon icon={PlusCircleIcon} />}
              />
            )}
          </XDSVStack>
        </XDSVStack>
      </XDSHStack>
    </XDSVStack>
  );
}
