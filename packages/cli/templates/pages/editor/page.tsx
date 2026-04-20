'use client';

import {useState, useCallback} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars} from '@xds/core/theme/tokens.stylex';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSCenter} from '@xds/core/Center';
import {XDSDivider} from '@xds/core/Divider';
import {XDSEmptyState} from '@xds/core/EmptyState';
import {XDSGrid} from '@xds/core/Grid';
import {XDSHStack, XDSVStack} from '@xds/core/Layout';
import {XDSIcon} from '@xds/core/Icon';
import {XDSList, XDSListItem} from '@xds/core/List';
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
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/react/24/outline';

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
    id: '1',
    type: 'hero',
    label: 'Hero',
    props: {
      heading: 'Build something amazing',
      subheading:
        'A modern page builder powered by XDS components. Drag, drop, and customize blocks to create beautiful pages in minutes.',
      buttonLabel: 'Get Started',
      alignment: 'center',
    },
  },
  {
    id: '2',
    type: 'features',
    label: 'Features',
    props: {
      cards: [
        {
          title: 'Fast',
          description: 'Optimised for performance with zero runtime overhead.',
        },
        {
          title: 'Flexible',
          description: 'Adapts to any design system with configurable tokens.',
        },
        {
          title: 'Accessible',
          description: 'Built-in ARIA support and keyboard navigation.',
        },
      ],
    },
  },
  {
    id: '3',
    type: 'text',
    label: 'Text Block',
    props: {
      content:
        'XDS is a flexible design system that helps teams build consistent, accessible, and performant user interfaces. Use these blocks as starting points and customise them to fit your needs.',
    },
  },
  {
    id: '4',
    type: 'cta',
    label: 'Call to Action',
    props: {
      heading: 'Ready to get started?',
      description:
        'Jump in and start building your page today. No configuration required.',
      primaryLabel: 'Start Building',
      secondaryLabel: 'Learn More',
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
        cards: [
          {
            title: 'Lightning Fast',
            description: 'Sub-second load times out of the box.',
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
    position: 'fixed',
    inset: 0,
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
    borderRadius: 12,
    boxShadow:
      '0 2px 8px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06)',
    overflow: 'hidden',
  },
  floatingPanelCollapsed: {
    bottom: 'auto',
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
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  canvas: (maxWidth: number) => ({
    maxWidth,
    transition: 'max-width 0.3s ease',
  }),
  clickable: {
    cursor: 'pointer',
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
        <XDSTextArea
          label="Content"
          value={(props.content as string) ?? ''}
          onChange={(v: string) => onUpdate('content', v)}
        />
      );

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
          <XDSTextInput
            label="Primary Button"
            value={(props.primaryLabel as string) ?? ''}
            onChange={(v: string) => onUpdate('primaryLabel', v)}
          />
          <XDSTextInput
            label="Secondary Button"
            value={(props.secondaryLabel as string) ?? ''}
            onChange={(v: string) => onUpdate('secondaryLabel', v)}
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
  const variant = isSelected ? 'blue' : 'default';

  switch (type) {
    case 'hero':
      return (
        <XDSCard
          variant={variant}
          xstyle={editorStyles.clickable}
          onClick={onSelect}>
          <XDSGrid columns={2} gap={6}>
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
            <XDSSection variant="wash" padding={6}>
              <XDSCenter>
                <XDSCard padding={4}>
                  <XDSVStack gap={2}>
                    <XDSText type="supporting" color="secondary">
                      Portfolio
                    </XDSText>
                    {['AAPL', 'TSLA', 'VFV'].map((ticker, i) => (
                      <XDSHStack key={ticker} gap={3} vAlign="center">
                        <XDSText type="label" weight="semibold">
                          {ticker}
                        </XDSText>
                        <XDSText
                          type="supporting"
                          color={i === 1 ? 'secondary' : 'active'}>
                          {i === 1 ? '−1.2%' : '+3.4%'}
                        </XDSText>
                      </XDSHStack>
                    ))}
                  </XDSVStack>
                </XDSCard>
              </XDSCenter>
            </XDSSection>
          </XDSGrid>
        </XDSCard>
      );

    case 'text':
      return (
        <XDSCard
          variant={variant}
          xstyle={editorStyles.clickable}
          onClick={onSelect}>
          <XDSText type="body">
            {(props.content as string) || 'Text content goes here'}
          </XDSText>
        </XDSCard>
      );

    case 'image':
      return (
        <XDSCard
          variant={variant}
          xstyle={editorStyles.clickable}
          onClick={onSelect}>
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
        <XDSCard
          variant={variant}
          padding={6}
          xstyle={editorStyles.clickable}
          onClick={onSelect}>
          <XDSButton
            label={(props.label as string) || 'Button'}
            variant={
              (props.variant as 'primary' | 'secondary' | 'ghost') || 'primary'
            }
            size={(props.size as 'sm' | 'md' | 'lg') || 'md'}
          />
        </XDSCard>
      );

    case 'features': {
      const featureCards =
        (props.cards as Array<{title: string; description: string}>) || [];
      return (
        <XDSCard
          variant={variant}
          xstyle={editorStyles.clickable}
          onClick={onSelect}>
          <XDSVStack gap={4}>
            <XDSHeading level={3}>Features</XDSHeading>
            <XDSGrid columns={{minWidth: 200}} gap={4}>
              {featureCards.map((card, i) => (
                <XDSSection key={i} variant="wash" padding={4}>
                  <XDSVStack gap={2}>
                    <XDSIcon icon={SparklesIcon} color="accent" />
                    <XDSHeading level={4}>{card.title}</XDSHeading>
                    <XDSText type="supporting" color="secondary">
                      {card.description}
                    </XDSText>
                  </XDSVStack>
                </XDSSection>
              ))}
            </XDSGrid>
          </XDSVStack>
        </XDSCard>
      );
    }

    case 'cards': {
      const cardItems =
        (props.cards as Array<{title: string; description: string}>) || [];
      return (
        <XDSCard
          variant={variant}
          xstyle={editorStyles.clickable}
          onClick={onSelect}>
          <XDSVStack gap={4}>
            <XDSHStack gap={4} vAlign="center">
              <XDSHeading level={3}>Cards</XDSHeading>
            </XDSHStack>
            <XDSGrid columns={{minWidth: 200}} gap={4}>
              {cardItems.map((card, i) => (
                <XDSSection key={i} variant="wash" padding={4}>
                  <XDSVStack gap={2}>
                    <XDSHeading level={4}>{card.title}</XDSHeading>
                    <XDSText type="supporting" color="secondary">
                      {card.description}
                    </XDSText>
                  </XDSVStack>
                </XDSSection>
              ))}
            </XDSGrid>
          </XDSVStack>
        </XDSCard>
      );
    }

    case 'cta':
      return (
        <XDSCard
          variant={variant}
          xstyle={editorStyles.clickable}
          onClick={onSelect}>
          <XDSGrid columns={2} gap={6}>
            <XDSSection variant="wash" padding={6}>
              <XDSCenter>
                <XDSCard padding={4}>
                  <XDSVStack gap={3}>
                    {[
                      ['NVDA', '$500.00 USD'],
                      ['Recurring investments', '●'],
                      ['Dividend reinvestments', '●'],
                    ].map(([label, val], i) => (
                      <XDSHStack key={i} gap={3} vAlign="center">
                        <XDSText
                          type="label"
                          weight={i === 0 ? 'semibold' : 'normal'}>
                          {label}
                        </XDSText>
                        <XDSText
                          type="supporting"
                          color={i > 0 ? 'active' : 'secondary'}>
                          {val}
                        </XDSText>
                      </XDSHStack>
                    ))}
                  </XDSVStack>
                </XDSCard>
              </XDSCenter>
            </XDSSection>
            <XDSVStack gap={4}>
              <XDSHeading level={3}>
                {(props.heading as string) || 'Call to Action'}
              </XDSHeading>
              <XDSText type="supporting" color="secondary">
                {(props.description as string) || 'Description text'}
              </XDSText>
              <XDSHStack gap={3}>
                <XDSButton
                  label={(props.primaryLabel as string) || 'Primary'}
                />
                <XDSButton
                  label={(props.secondaryLabel as string) || 'Secondary'}
                  variant="secondary"
                />
              </XDSHStack>
            </XDSVStack>
          </XDSGrid>
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
    <XDSVStack gap={4}>
      <XDSVStack gap={1}>
        <XDSSection variant="transparent" padding={4}>
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
        <XDSSection variant="transparent" padding={3}>
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
                <XDSIcon
                  icon={BLOCK_META[block.type].icon}
                  color="secondary"
                />
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
    <XDSVStack gap={4}>
      <XDSToolbar
        label="Block properties"
        startContent={
          <XDSHeading level={4}>
            {selectedBlock.label} Properties
          </XDSHeading>
        }
      />
      <PropertiesForm
        block={selectedBlock}
        onUpdate={(key, value) =>
          updateBlockProp(selectedBlock.id, key, value)
        }
      />
    </XDSVStack>
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
          xstyle={[
            editorStyles.floatingPanel,
            isPanelCollapsed && editorStyles.floatingPanelCollapsed,
          ]}>
          {/* Panel Header */}
          <XDSSection variant="transparent" padding={4}>
            <XDSVStack gap={4}>
              <XDSHStack gap={3} vAlign="center">
                <XDSVStack gap={0} xstyle={{flex: 1}}>
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
                  {!isEditingTitle && (
                    <XDSButton
                      label="Edit title"
                      icon={
                        <XDSIcon icon={DocumentTextIcon} size="sm" />
                      }
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingTitle(true)}
                      isIconOnly
                    />
                  )}
                  <XDSButton
                    label={
                      isPanelCollapsed ? 'Expand panel' : 'Collapse panel'
                    }
                    icon={
                      <XDSIcon
                        icon={
                          isPanelCollapsed
                            ? ChevronDoubleRightIcon
                            : ChevronDoubleLeftIcon
                        }
                        size="sm"
                      />
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
                    onChange={(v: string) =>
                      setViewport(v as ViewportSize)
                    }>
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
                      icon={
                        <XDSIcon icon={DevicePhoneMobileIcon} size="sm" />
                      }
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
              <XDSTabList
                value={sidebarTab}
                onChange={(v: string) => setSidebarTab(v as SidebarTab)}>
                <XDSTab value="blocks" label="Blocks" />
                <XDSTab value="properties" label="Properties" />
              </XDSTabList>
              <XDSDivider />
              <XDSSection
                variant="transparent"
                padding={4}
                xstyle={editorStyles.panelScroll}>
                {sidebarTab === 'blocks'
                  ? blocksTabContent
                  : propertiesTabContent}
              </XDSSection>
            </>
          )}
        </XDSVStack>

        {/* Preview Canvas */}
        <XDSVStack
          gap={4}
          xstyle={editorStyles.previewArea}
          maxWidth={VIEWPORT_MAX[viewport]}>
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
      </XDSHStack>
    </XDSVStack>
  );
}
