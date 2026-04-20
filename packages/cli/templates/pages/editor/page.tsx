'use client';

import {useState, useCallback} from 'react';
import {XDSAppShell} from '@xds/core/AppShell';
import {
  XDSSideNav,
  XDSSideNavSection,
  XDSSideNavItem,
} from '@xds/core/SideNav';
import {XDSTopNav, XDSTopNavHeading} from '@xds/core/TopNav';
import {XDSNavIcon} from '@xds/core/NavIcon';
import {XDSHStack, XDSVStack} from '@xds/core/Layout';
import {XDSCenter} from '@xds/core/Center';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSCard} from '@xds/core/Card';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSTextArea} from '@xds/core/TextArea';
import {XDSSelector} from '@xds/core/Selector';
import {
  XDSSegmentedControl,
  XDSSegmentedControlItem,
} from '@xds/core/SegmentedControl';
import {XDSDivider} from '@xds/core/Divider';
import {XDSGrid} from '@xds/core/Grid';
import {XDSEmptyState} from '@xds/core/EmptyState';
import {XDSToolbar} from '@xds/core/Toolbar';
import {XDSBadge} from '@xds/core/Badge';
import {XDSSection} from '@xds/core/Section';
import {
  Squares2X2Icon,
  DocumentTextIcon,
  PhotoIcon,
  CursorArrowRaysIcon,
  ViewColumnsIcon,
  SparklesIcon,
  MegaphoneIcon,
  PlusCircleIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ComputerDesktopIcon,
  DeviceTabletIcon,
  DevicePhoneMobileIcon,
  EyeIcon,
  XMarkIcon,
  PencilSquareIcon,
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

const VIEWPORT_WIDTH: Record<ViewportSize, number> = {
  desktop: 960,
  tablet: 768,
  phone: 375,
};

let nextId = 5;
function uid() {
  return String(nextId++);
}

const INITIAL_BLOCKS: Block[] = [
  {
    id: '1',
    type: 'hero',
    label: 'Hero',
    props: {
      heading: 'Build something amazing',
      subheading:
        'A modern page builder powered by XDS components. Customize blocks to create beautiful pages in minutes.',
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
          description:
            'Optimised for performance with zero runtime overhead.',
        },
        {
          title: 'Flexible',
          description:
            'Adapts to any design system with configurable tokens.',
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
          {title: 'Pricing', description: 'Flexible plans for every team size.'},
          {title: 'Support', description: 'Get help whenever you need it.'},
        ],
      };
    case 'features':
      return {
        cards: [
          {title: 'Lightning Fast', description: 'Sub-second load times out of the box.'},
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
      return (
        <XDSEmptyState title="No configurable properties" isCompact />
      );
  }
}

function BlockPreview({
  block,
  isSelected,
}: {
  block: Block;
  isSelected: boolean;
}) {
  const {type, props} = block;
  const variant = isSelected ? 'blue' : 'default';

  switch (type) {
    case 'hero':
      return (
        <XDSCard variant={variant}>
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
      return (
        <XDSCard variant={variant}>
          <XDSText type="body">
            {(props.content as string) || 'Text content goes here'}
          </XDSText>
        </XDSCard>
      );

    case 'image':
      return (
        <XDSCard variant={variant}>
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
        <XDSCard variant={variant} padding={6}>
          <XDSButton
            label={(props.label as string) || 'Button'}
            variant={
              (props.variant as 'primary' | 'secondary' | 'ghost') ||
              'primary'
            }
            size={(props.size as 'sm' | 'md' | 'lg') || 'md'}
          />
        </XDSCard>
      );

    case 'features': {
      const featureCards =
        (props.cards as Array<{title: string; description: string}>) || [];
      return (
        <XDSCard variant={variant}>
          <XDSVStack gap={4}>
            <XDSHeading level={3}>Features</XDSHeading>
            <XDSGrid columns={{minWidth: 200}} gap={4}>
              {featureCards.map((card, i) => (
                <XDSSection key={i} variant="wash" padding={4}>
                  <XDSVStack gap={2}>
                    <XDSIcon icon={SparklesIcon} color="accent" />
                    <XDSHeading level={4}>{card.title}</XDSHeading>
                    <XDSText type="supporting" color="secondary">{card.description}</XDSText>
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
        <XDSCard variant={variant}>
          <XDSVStack gap={4}>
            <XDSHeading level={3}>Cards</XDSHeading>
            <XDSGrid columns={{minWidth: 200}} gap={4}>
              {cardItems.map((card, i) => (
                <XDSSection key={i} variant="wash" padding={4}>
                  <XDSVStack gap={2}>
                    <XDSHeading level={4}>{card.title}</XDSHeading>
                    <XDSText type="supporting" color="secondary">{card.description}</XDSText>
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
        <XDSCard variant={variant}>
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
        </XDSCard>
      );

    default:
      return null;
  }
}

export default function EditorPage() {
  const [blocks, setBlocks] = useState<Block[]>(INITIAL_BLOCKS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
  }, []);

  return (
    <XDSAppShell
      topNav={
        <XDSTopNav
          label="Page Editor"
          heading={
            <XDSTopNavHeading
              heading="Page Editor"
              logo={
                <XDSNavIcon
                  icon={<XDSIcon icon={PencilSquareIcon} />}
                />
              }
            />
          }
          endContent={
            <XDSHStack gap={3} vAlign="center">
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
              <XDSButton
                label="Preview"
                icon={<XDSIcon icon={EyeIcon} size="sm" />}
                variant="secondary"
                isIconOnly
              />
              <XDSButton label="Publish" variant="primary" />
            </XDSHStack>
          }
        />
      }
      sideNav={
        <XDSSideNav>
          <XDSSideNavSection title="Add Block">
            {(Object.keys(BLOCK_META) as BlockType[]).map(type => (
              <XDSSideNavItem
                key={type}
                label={BLOCK_META[type].label}
                icon={BLOCK_META[type].icon}
                onClick={() => addBlock(type)}
              />
            ))}
          </XDSSideNavSection>
          <XDSSideNavSection title="Page Layers">
            {blocks.map(block => (
              <XDSSideNavItem
                key={block.id}
                label={block.label}
                icon={BLOCK_META[block.type].icon}
                isSelected={block.id === selectedId}
                onClick={() =>
                  setSelectedId(prev =>
                    prev === block.id ? null : block.id,
                  )
                }
                endContent={
                  <XDSBadge label={BLOCK_META[block.type].label} />
                }
              />
            ))}
          </XDSSideNavSection>
        </XDSSideNav>
      }
      variant="elevated"
      contentPadding={6}
      height="auto">
      <XDSVStack gap={6}>
        {selectedBlock && (
          <XDSCard>
            <XDSVStack gap={4}>
              <XDSToolbar
                label="Block properties"
                startContent={
                  <XDSHeading level={4}>
                    {selectedBlock.label} Properties
                  </XDSHeading>
                }
                endContent={
                  <XDSHStack gap={2}>
                    <XDSButton
                      label="Move up"
                      icon={
                        <XDSIcon icon={ChevronUpIcon} size="sm" />
                      }
                      variant="ghost"
                      size="sm"
                      isIconOnly
                      onClick={() =>
                        moveBlock(selectedBlock.id, -1)
                      }
                    />
                    <XDSButton
                      label="Move down"
                      icon={
                        <XDSIcon icon={ChevronDownIcon} size="sm" />
                      }
                      variant="ghost"
                      size="sm"
                      isIconOnly
                      onClick={() =>
                        moveBlock(selectedBlock.id, 1)
                      }
                    />
                    <XDSButton
                      label="Delete block"
                      icon={<XDSIcon icon={TrashIcon} size="sm" />}
                      variant="ghost"
                      size="sm"
                      isIconOnly
                      onClick={() =>
                        deleteBlock(selectedBlock.id)
                      }
                    />
                    <XDSButton
                      label="Deselect"
                      icon={<XDSIcon icon={XMarkIcon} size="sm" />}
                      variant="ghost"
                      size="sm"
                      isIconOnly
                      onClick={() => setSelectedId(null)}
                    />
                  </XDSHStack>
                }
              />
              <XDSDivider />
              <PropertiesForm
                block={selectedBlock}
                onUpdate={(key, value) =>
                  updateBlockProp(selectedBlock.id, key, value)
                }
              />
            </XDSVStack>
          </XDSCard>
        )}

        <XDSCenter axis="horizontal" width="100%">
          <XDSCard
            width="100%"
            maxWidth={VIEWPORT_WIDTH[viewport]}
            padding={4}
            variant="muted">
            {blocks.length > 0 ? (
              <XDSVStack gap={4}>
                {blocks.map(block => (
                  <BlockPreview
                    key={block.id}
                    block={block}
                    isSelected={block.id === selectedId}
                  />
                ))}
              </XDSVStack>
            ) : (
              <XDSEmptyState
                title="No blocks yet"
                description="Add blocks from the sidebar to start building your page"
                icon={<XDSIcon icon={PlusCircleIcon} />}
              />
            )}
          </XDSCard>
        </XDSCenter>
      </XDSVStack>
    </XDSAppShell>
  );
}
