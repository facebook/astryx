'use client';

import {useState, useCallback} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars} from '@xds/core/theme/tokens.stylex';
import {XDSButton} from '@xds/core/Button';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSHStack, XDSVStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSTextArea} from '@xds/core/TextArea';
import {XDSToolbar} from '@xds/core/Toolbar';
import {XDSCard} from '@xds/core/Card';
import {XDSDivider} from '@xds/core/Divider';
import {XDSSelector} from '@xds/core/Selector';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {
  XDSSegmentedControl,
  XDSSegmentedControlItem,
} from '@xds/core/SegmentedControl';

// ---------------------------------------------------------------------------
// Inline SVG Icons (16×16 unless noted)
// ---------------------------------------------------------------------------

const LayoutIcon = () => (
  <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
    <rect
      x={1}
      y={1}
      width={14}
      height={5}
      rx={1}
      stroke="currentColor"
      strokeWidth={1.5}
    />
    <rect
      x={1}
      y={9}
      width={6}
      height={6}
      rx={1}
      stroke="currentColor"
      strokeWidth={1.5}
    />
    <rect
      x={9}
      y={9}
      width={6}
      height={6}
      rx={1}
      stroke="currentColor"
      strokeWidth={1.5}
    />
  </svg>
);

const TypeIcon = () => (
  <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
    <path
      d="M3 3h10M8 3v10M5.5 13h5"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </svg>
);

const ImageIcon = () => (
  <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
    <rect
      x={1.5}
      y={2.5}
      width={13}
      height={11}
      rx={1.5}
      stroke="currentColor"
      strokeWidth={1.5}
    />
    <circle cx={5} cy={6} r={1.5} stroke="currentColor" strokeWidth={1.2} />
    <path
      d="M1.5 11l3.5-3 3 2.5 2-1.5 4.5 3"
      stroke="currentColor"
      strokeWidth={1.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ButtonIcon = () => (
  <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
    <rect
      x={1}
      y={4}
      width={14}
      height={8}
      rx={3}
      stroke="currentColor"
      strokeWidth={1.5}
    />
    <line
      x1={5}
      y1={8}
      x2={11}
      y2={8}
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </svg>
);

const SidebarCollapseIcon = () => (
  <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
    <rect
      x={1}
      y={2}
      width={14}
      height={12}
      rx={2}
      stroke="currentColor"
      strokeWidth={1.5}
    />
    <line
      x1={6}
      y1={2}
      x2={6}
      y2={14}
      stroke="currentColor"
      strokeWidth={1.5}
    />
    <path
      d="M10 7L8.5 8l1.5 1"
      stroke="currentColor"
      strokeWidth={1.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SidebarExpandIcon = () => (
  <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
    <rect
      x={1}
      y={2}
      width={14}
      height={12}
      rx={2}
      stroke="currentColor"
      strokeWidth={1.5}
    />
    <line
      x1={6}
      y1={2}
      x2={6}
      y2={14}
      stroke="currentColor"
      strokeWidth={1.5}
    />
    <path
      d="M8.5 7L10 8l-1.5 1"
      stroke="currentColor"
      strokeWidth={1.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const GridIcon = () => (
  <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
    <rect
      x={1}
      y={1}
      width={6}
      height={6}
      rx={1}
      stroke="currentColor"
      strokeWidth={1.5}
    />
    <rect
      x={9}
      y={1}
      width={6}
      height={6}
      rx={1}
      stroke="currentColor"
      strokeWidth={1.5}
    />
    <rect
      x={1}
      y={9}
      width={6}
      height={6}
      rx={1}
      stroke="currentColor"
      strokeWidth={1.5}
    />
    <rect
      x={9}
      y={9}
      width={6}
      height={6}
      rx={1}
      stroke="currentColor"
      strokeWidth={1.5}
    />
  </svg>
);

const StarIcon = () => (
  <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
    <path
      d="M8 1l2.1 4.3 4.7.7-3.4 3.3.8 4.7L8 11.8 3.8 14l.8-4.7L1.2 6l4.7-.7z"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinejoin="round"
    />
  </svg>
);

const MegaphoneIcon = () => (
  <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
    <path
      d="M12 3v10M12 4c-2 1-5 1-7 1H4a2 2 0 0 0 0 4h1c2 0 5 0 7 1"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5 9v3a1 1 0 0 0 1 1h1"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    <line
      x1={14}
      y1={6}
      x2={14}
      y2={10}
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </svg>
);

const PlusIcon = () => (
  <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
    <path
      d="M8 3v10M3 8h10"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </svg>
);

const TrashIcon = () => (
  <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
    <path
      d="M3 4h10M5.5 4V3a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1M6 7v4M8 7v4M10 7v4"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="round"
    />
    <path
      d="M4 4l.5 9a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1L12 4"
      stroke="currentColor"
      strokeWidth={1.3}
    />
  </svg>
);

const ChevronUpIcon = () => (
  <svg width={12} height={12} viewBox="0 0 12 12" fill="none">
    <path
      d="M3 7.5l3-3 3 3"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width={12} height={12} viewBox="0 0 12 12" fill="none">
    <path
      d="M3 4.5l3 3 3-3"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DesktopIcon = () => (
  <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
    <rect
      x={1}
      y={2}
      width={14}
      height={9}
      rx={1.5}
      stroke="currentColor"
      strokeWidth={1.5}
    />
    <path
      d="M5 14h6M8 11v3"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </svg>
);

const TabletIcon = () => (
  <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
    <rect
      x={3}
      y={1}
      width={10}
      height={14}
      rx={1.5}
      stroke="currentColor"
      strokeWidth={1.5}
    />
    <line
      x1={6.5}
      y1={12.5}
      x2={9.5}
      y2={12.5}
      stroke="currentColor"
      strokeWidth={1.2}
      strokeLinecap="round"
    />
  </svg>
);

const PhoneIcon = () => (
  <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
    <rect
      x={4}
      y={1}
      width={8}
      height={14}
      rx={1.5}
      stroke="currentColor"
      strokeWidth={1.5}
    />
    <line
      x1={6.5}
      y1={12.5}
      x2={9.5}
      y2={12.5}
      stroke="currentColor"
      strokeWidth={1.2}
      strokeLinecap="round"
    />
  </svg>
);

const EyeIcon = () => (
  <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
    <path
      d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8s-2.5 4.5-6.5 4.5S1.5 8 1.5 8z"
      stroke="currentColor"
      strokeWidth={1.5}
    />
    <circle cx={8} cy={8} r={2} stroke="currentColor" strokeWidth={1.5} />
  </svg>
);

// ---------------------------------------------------------------------------
// Types & helpers
// ---------------------------------------------------------------------------

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

const BLOCK_TYPE_META: Record<
  BlockType,
  {label: string; icon: React.ReactNode}
> = {
  hero: {label: 'Hero', icon: <LayoutIcon />},
  text: {label: 'Text', icon: <TypeIcon />},
  image: {label: 'Image', icon: <ImageIcon />},
  button: {label: 'Button', icon: <ButtonIcon />},
  cards: {label: 'Cards', icon: <GridIcon />},
  features: {label: 'Features', icon: <StarIcon />},
  cta: {label: 'CTA', icon: <MegaphoneIcon />},
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

const VIEWPORT_MAX: Record<ViewportSize, number> = {
  desktop: 960,
  tablet: 768,
  phone: 375,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const editorStyles = stylex.create({
  body: {backgroundColor: colorVars['--color-background-body']},
  card: {backgroundColor: colorVars['--color-background-card']},
});

export default function EditorPage() {
  const [blocks, setBlocks] = useState<Block[]>(DEFAULT_BLOCKS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('blocks');
  const [pageTitle, setPageTitle] = useState('Page Editor');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDragStart = useCallback((id: string) => {
    setDragId(id);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(id);
  }, []);

  const handleDrop = useCallback(
    (targetId: string) => {
      if (!dragId || dragId === targetId) {
        setDragId(null);
        setDragOverId(null);
        return;
      }
      setBlocks(prev => {
        const fromIdx = prev.findIndex(b => b.id === dragId);
        const toIdx = prev.findIndex(b => b.id === targetId);
        if (fromIdx === -1 || toIdx === -1) return prev;
        const next = [...prev];
        const [moved] = next.splice(fromIdx, 1);
        next.splice(toIdx, 0, moved);
        return next;
      });
      setDragId(null);
      setDragOverId(null);
    },
    [dragId],
  );

  const handleDragEnd = useCallback(() => {
    setDragId(null);
    setDragOverId(null);
  }, []);

  const selectedBlock = blocks.find(b => b.id === selectedId) ?? null;

  // --- block helpers -------------------------------------------------------

  const updateBlock = useCallback(
    (id: string, updater: (b: Block) => Block) => {
      setBlocks(prev => prev.map(b => (b.id === id ? updater(b) : b)));
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
    const meta = BLOCK_TYPE_META[type];
    const id = uid();
    const newBlock: Block = {id, type, label: meta.label, props: {}};

    switch (type) {
      case 'hero':
        newBlock.props = {
          heading: 'New Hero',
          subheading: 'Subtitle goes here',
          buttonLabel: 'Click Me',
          alignment: 'center',
        };
        break;
      case 'text':
        newBlock.props = {content: 'Enter your text here.'};
        break;
      case 'image':
        newBlock.props = {};
        break;
      case 'button':
        newBlock.props = {label: 'Button', variant: 'primary', size: 'md'};
        break;
      case 'cards':
        newBlock.props = {
          cards: [
            {title: 'Card 1', description: 'Description'},
            {title: 'Card 2', description: 'Description'},
          ],
        };
        break;
      case 'features':
        newBlock.props = {
          cards: [{title: 'Feature', description: 'Description'}],
        };
        break;
      case 'cta':
        newBlock.props = {
          heading: 'Call to Action',
          description: 'Description text',
          primaryLabel: 'Primary',
          secondaryLabel: 'Secondary',
        };
        break;
    }

    setBlocks(prev => [...prev, newBlock]);
    setSelectedId(id);
    setSidebarTab('properties');
  }, []);

  const selectBlock = useCallback((id: string) => {
    setSelectedId(id);
    setSidebarTab('properties');
  }, []);

  // --- sidebar renderers ---------------------------------------------------

  const renderBlocksTab = () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 16,
        padding: '16px 8px',
      }}>
      {/* Add Block */}
      <div>
        <XDSHeading
          level={4}
          style={{marginBottom: 4, paddingLeft: 8, paddingRight: 8}}>
          Add Block
        </XDSHeading>
        <XDSList density="compact" hasDividers={false}>
          {(Object.keys(BLOCK_TYPE_META) as BlockType[]).map(type => (
            <XDSListItem
              key={type}
              label={BLOCK_TYPE_META[type].label}
              startContent={
                <span
                  style={{
                    display: 'inline-flex',
                    color: 'var(--xds-color-text-secondary, #666)',
                  }}>
                  {BLOCK_TYPE_META[type].icon}
                </span>
              }
              onClick={() => addBlock(type)}
            />
          ))}
        </XDSList>
      </div>

      {/* Layers */}
      <div>
        <XDSHeading
          level={4}
          style={{marginBottom: 4, paddingLeft: 8, paddingRight: 8}}>
          Layers
        </XDSHeading>
        <XDSList density="compact" hasDividers={false}>
          {blocks.map(block => (
            <XDSListItem
              key={block.id}
              label={block.label}
              isSelected={block.id === selectedId}
              onClick={() =>
                selectBlock(
                  block.id === selectedId
                    ? (null as unknown as string)
                    : block.id,
                )
              }
              startContent={
                <span
                  style={{
                    display: 'inline-flex',
                    color: 'var(--xds-color-text-secondary, #666)',
                  }}>
                  {BLOCK_TYPE_META[block.type].icon}
                </span>
              }
              endContent={
                <XDSHStack gap={1}>
                  <XDSButton
                    label="Move up"
                    icon={<ChevronUpIcon />}
                    variant="ghost"
                    size="sm"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      moveBlock(block.id, -1);
                    }}
                  />
                  <XDSButton
                    label="Move down"
                    icon={<ChevronDownIcon />}
                    variant="ghost"
                    size="sm"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      moveBlock(block.id, 1);
                    }}
                  />
                  <XDSButton
                    label="Delete"
                    icon={<TrashIcon />}
                    variant="ghost"
                    size="sm"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      deleteBlock(block.id);
                    }}
                  />
                </XDSHStack>
              }
            />
          ))}
        </XDSList>
      </div>
    </div>
  );

  const renderPropertiesTab = () => {
    if (!selectedBlock) {
      return (
        <div style={{padding: 16}}>
          <XDSText type="body" color="secondary">
            Select a block to edit its properties.
          </XDSText>
        </div>
      );
    }

    const {id, type, label, props} = selectedBlock;
    const set = (key: string, value: unknown) =>
      updateBlock(id, b => ({...b, props: {...b.props, [key]: value}}));

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column' as const,
          gap: 16,
          padding: '16px 8px',
        }}>
        <XDSHStack gap={2} vAlign="center">
          <XDSText type="label">{label}</XDSText>
        </XDSHStack>

        {type === 'hero' && (
          <>
            <XDSTextInput
              label="Heading"
              value={(props.heading as string) ?? ''}
              onChange={(v: string) => set('heading', v)}
            />
            <XDSTextArea
              label="Subheading"
              value={(props.subheading as string) ?? ''}
              onChange={(v: string) => set('subheading', v)}
            />
            <XDSTextInput
              label="Button Label"
              value={(props.buttonLabel as string) ?? ''}
              onChange={(v: string) => set('buttonLabel', v)}
            />
            <XDSSelector
              label="Alignment"
              value={(props.alignment as string) ?? 'center'}
              onChange={(v: string) => set('alignment', v)}
              options={[
                {label: 'Left', value: 'left'},
                {label: 'Center', value: 'center'},
                {label: 'Right', value: 'right'},
              ]}
            />
          </>
        )}

        {type === 'text' && (
          <XDSTextArea
            label="Content"
            value={(props.content as string) ?? ''}
            onChange={(v: string) => set('content', v)}
          />
        )}

        {type === 'cta' && (
          <>
            <XDSTextInput
              label="Heading"
              value={(props.heading as string) ?? ''}
              onChange={(v: string) => set('heading', v)}
            />
            <XDSTextArea
              label="Description"
              value={(props.description as string) ?? ''}
              onChange={(v: string) => set('description', v)}
            />
            <XDSTextInput
              label="Primary Button"
              value={(props.primaryLabel as string) ?? ''}
              onChange={(v: string) => set('primaryLabel', v)}
            />
            <XDSTextInput
              label="Secondary Button"
              value={(props.secondaryLabel as string) ?? ''}
              onChange={(v: string) => set('secondaryLabel', v)}
            />
          </>
        )}

        {type === 'button' && (
          <>
            <XDSTextInput
              label="Label"
              value={(props.label as string) ?? ''}
              onChange={(v: string) => set('label', v)}
            />
            <XDSSelector
              label="Variant"
              value={(props.variant as string) ?? 'primary'}
              onChange={(v: string) => set('variant', v)}
              options={[
                {label: 'Primary', value: 'primary'},
                {label: 'Secondary', value: 'secondary'},
                {label: 'Ghost', value: 'ghost'},
              ]}
            />
            <XDSSelector
              label="Size"
              value={(props.size as string) ?? 'md'}
              onChange={(v: string) => set('size', v)}
              options={[
                {label: 'Small', value: 'sm'},
                {label: 'Medium', value: 'md'},
                {label: 'Large', value: 'lg'},
              ]}
            />
          </>
        )}

        {type === 'image' && (
          <XDSText type="body" color="secondary">
            No configurable properties
          </XDSText>
        )}

        {type === 'cards' && (
          <XDSText type="body" color="secondary">
            No configurable properties
          </XDSText>
        )}

        {type === 'features' && (
          <XDSText type="body" color="secondary">
            No configurable properties
          </XDSText>
        )}
      </div>
    );
  };

  // --- block preview renderers ---------------------------------------------

  const renderBlockPreview = (block: Block) => {
    const {type, props} = block;
    const isSelected = block.id === selectedId;
    const outline = isSelected
      ? '2px solid var(--xds-color-accent, #0066ff)'
      : '2px solid transparent';

    switch (type) {
      case 'hero': {
        const align = (props.alignment as string) ?? 'center';
        return (
          <div
            key={block.id}
            onClick={() =>
              selectBlock(
                block.id === selectedId
                  ? (null as unknown as string)
                  : block.id,
              )
            }
            style={{
              outline,
              borderRadius: 12,
              padding: 48,
              textAlign: align as 'left' | 'center' | 'right',
              ...stylex.props(editorStyles.body).style,
              cursor: 'pointer',
            }}>
            <XDSHeading level={2}>{(props.heading as string) ?? ''}</XDSHeading>
            <XDSText
              type="body"
              color="secondary"
              style={{
                marginTop: 12,
                maxWidth: 600,
                marginLeft: align === 'center' ? 'auto' : undefined,
                marginRight: align === 'center' ? 'auto' : undefined,
              }}>
              {(props.subheading as string) ?? ''}
            </XDSText>
            {(props.buttonLabel as string) && (
              <div style={{marginTop: 20}}>
                <XDSButton label={props.buttonLabel as string} />
              </div>
            )}
          </div>
        );
      }

      case 'features': {
        const cards =
          (props.cards as {title: string; description: string}[]) ?? [];
        return (
          <div
            key={block.id}
            onClick={() =>
              selectBlock(
                block.id === selectedId
                  ? (null as unknown as string)
                  : block.id,
              )
            }
            style={{outline, borderRadius: 12, padding: 24, cursor: 'pointer'}}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(cards.length, 3)}, 1fr)`,
                gap: 16,
              }}>
              {cards.map((card, i) => (
                <XDSCard key={i}>
                  <XDSVStack gap={2}>
                    <XDSText type="label">{card.title}</XDSText>
                    <XDSText type="body" color="secondary">
                      {card.description}
                    </XDSText>
                  </XDSVStack>
                </XDSCard>
              ))}
            </div>
          </div>
        );
      }

      case 'text':
        return (
          <div
            key={block.id}
            onClick={() =>
              selectBlock(
                block.id === selectedId
                  ? (null as unknown as string)
                  : block.id,
              )
            }
            style={{outline, borderRadius: 12, padding: 24, cursor: 'pointer'}}>
            <XDSText type="body">{(props.content as string) ?? ''}</XDSText>
          </div>
        );

      case 'image':
        return (
          <div
            key={block.id}
            onClick={() =>
              selectBlock(
                block.id === selectedId
                  ? (null as unknown as string)
                  : block.id,
              )
            }
            style={{outline, borderRadius: 12, cursor: 'pointer'}}>
            <div
              style={{
                width: '100%',
                height: 400,
                background: 'var(--xds-color-background-secondary, #e8e8e8)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center' as const,
                justifyContent: 'center' as const,
                color: 'var(--xds-color-text-secondary, #999)',
              }}>
              <XDSText type="body" color="secondary">
                800 × 400
              </XDSText>
            </div>
          </div>
        );

      case 'button':
        return (
          <div
            key={block.id}
            onClick={() =>
              selectBlock(
                block.id === selectedId
                  ? (null as unknown as string)
                  : block.id,
              )
            }
            style={{outline, borderRadius: 12, padding: 24, cursor: 'pointer'}}>
            <XDSButton
              label={(props.label as string) ?? 'Button'}
              variant={
                ((props.variant as string) ?? 'primary') as
                  | 'primary'
                  | 'secondary'
                  | 'ghost'
              }
              size={((props.size as string) ?? 'md') as 'sm' | 'md' | 'lg'}
            />
          </div>
        );

      case 'cta':
        return (
          <div
            key={block.id}
            onClick={() =>
              selectBlock(
                block.id === selectedId
                  ? (null as unknown as string)
                  : block.id,
              )
            }
            style={{outline, borderRadius: 12, cursor: 'pointer'}}>
            <XDSCard>
              <XDSVStack gap={3} hAlign="center">
                <XDSHeading level={3}>
                  {(props.heading as string) ?? ''}
                </XDSHeading>
                <XDSText
                  type="body"
                  color="secondary"
                  style={{maxWidth: 480, textAlign: 'center' as const}}>
                  {(props.description as string) ?? ''}
                </XDSText>
                <XDSHStack gap={2} hAlign="center">
                  <XDSButton
                    label={(props.primaryLabel as string) ?? 'Primary'}
                  />
                  <XDSButton
                    label={(props.secondaryLabel as string) ?? 'Secondary'}
                    variant="secondary"
                  />
                </XDSHStack>
              </XDSVStack>
            </XDSCard>
          </div>
        );

      case 'cards': {
        const cards = (props.cards as {
          title: string;
          description: string;
        }[]) ?? [
          {title: 'Card 1', description: 'Description'},
          {title: 'Card 2', description: 'Description'},
        ];
        return (
          <div
            key={block.id}
            onClick={() =>
              selectBlock(
                block.id === selectedId
                  ? (null as unknown as string)
                  : block.id,
              )
            }
            style={{outline, borderRadius: 12, padding: 24, cursor: 'pointer'}}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
              }}>
              {cards.map((card, i) => (
                <XDSCard key={i}>
                  <XDSVStack gap={2}>
                    <div
                      style={{
                        width: '100%',
                        height: 120,
                        background:
                          'var(--xds-color-background-secondary, #e8e8e8)',
                        borderRadius: 8,
                        marginBottom: 8,
                      }}
                    />
                    <XDSText type="label">{card.title}</XDSText>
                    <XDSText type="body" color="secondary">
                      {card.description}
                    </XDSText>
                  </XDSVStack>
                </XDSCard>
              ))}
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  // --- main render ---------------------------------------------------------

  return (
    <div
      style={{
        position: 'fixed' as const,
        inset: 0,
        display: 'flex',
        flexDirection: 'column' as const,
        color: 'var(--xds-color-text-primary, #1a1a1a)',
        ...stylex.props(editorStyles.body).style,
      }}>
      {/* Body: Sidebar + Preview */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden' as const,
          position: 'relative' as const,
        }}>
        {/* Floating Sidebar */}
        <div
          style={{
            position: 'absolute' as const,
            top: 16,
            left: 16,
            bottom: isPanelCollapsed ? 'auto' : 16,
            width: 320,
            zIndex: 10,
            ...stylex.props(editorStyles.card).style,
            borderRadius: 12,
            boxShadow:
              '0 2px 8px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06)',
            display: 'flex',
            flexDirection: 'column' as const,
            overflow: 'hidden' as const,
          }}>
          {/* Header */}
          <div style={{padding: 16}}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}>
              <div style={{flex: 1}}>
                {isEditingTitle ? (
                  <input
                    value={pageTitle}
                    onChange={e => setPageTitle(e.target.value)}
                    onBlur={() => setIsEditingTitle(false)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') setIsEditingTitle(false);
                    }}
                    autoFocus
                    aria-label="Page title"
                    style={{
                      font: 'inherit',
                      fontSize: 18,
                      fontWeight: 600,
                      border: '1px solid var(--xds-color-border, #ccc)',
                      borderRadius: 6,
                      padding: '4px 8px',
                      outline: 'none',
                      background: 'var(--xds-color-background-card, #fff)',
                      color: 'inherit',
                      width: 160,
                    }}
                  />
                ) : (
                  <span
                    style={{cursor: 'pointer'}}
                    onClick={() => setIsEditingTitle(true)}>
                    <XDSHeading level={2}>{pageTitle}</XDSHeading>
                  </span>
                )}
              </div>
              <XDSButton
                label={isPanelCollapsed ? 'Expand panel' : 'Collapse panel'}
                icon={
                  isPanelCollapsed ? (
                    <SidebarExpandIcon />
                  ) : (
                    <SidebarCollapseIcon />
                  )
                }
                variant="ghost"
                size="sm"
                onClick={() => setIsPanelCollapsed(v => !v)}
              />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
              }}>
              <XDSSegmentedControl
                label="Viewport size"
                value={viewport}
                onChange={(v: string) => setViewport(v as ViewportSize)}>
                <XDSSegmentedControlItem
                  value="desktop"
                  label="Desktop"
                  icon={<DesktopIcon />}
                  isLabelHidden
                />
                <XDSSegmentedControlItem
                  value="tablet"
                  label="Tablet"
                  icon={<TabletIcon />}
                  isLabelHidden
                />
                <XDSSegmentedControlItem
                  value="phone"
                  label="Phone"
                  icon={<PhoneIcon />}
                  isLabelHidden
                />
              </XDSSegmentedControl>
              <XDSHStack gap={2}>
                <XDSButton
                  label="Preview"
                  icon={<EyeIcon />}
                  variant="secondary"
                  size="sm"
                />
                <XDSButton label="Publish" variant="primary" size="sm" />
              </XDSHStack>
            </div>
          </div>
          {!isPanelCollapsed && (
            <>
              <XDSDivider />
              <div className="full-width-tabs" style={{padding: 0}}>
                <style>{`
                  .full-width-tabs nav { width: 100%; }
                  .full-width-tabs nav > button,
                  .full-width-tabs nav > a { flex: 1; justify-content: center; }
                `}</style>
                <XDSTabList
                  value={sidebarTab}
                  onChange={(v: string) => setSidebarTab(v as SidebarTab)}>
                  <XDSTab value="blocks" label="Blocks" />
                  <XDSTab value="properties" label="Properties" />
                </XDSTabList>
              </div>
              <XDSDivider />
              <div style={{flex: 1, overflowY: 'auto' as const}}>
                {sidebarTab === 'blocks'
                  ? renderBlocksTab()
                  : renderPropertiesTab()}
              </div>
            </>
          )}
        </div>

        {/* Preview */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto' as const,
            padding: 32,
            paddingLeft: 368,
            display: 'flex',
            justifyContent: 'center' as const,
            alignItems: 'flex-start' as const,
          }}>
          <div
            style={{
              width: '100%',
              maxWidth: VIEWPORT_MAX[viewport],
              ...stylex.props(editorStyles.body).style,
              borderRadius: 12,
              padding: 24,
              transition: 'max-width 0.3s ease',
            }}>
            <XDSVStack gap={4}>
              {blocks.map(block => renderBlockPreview(block))}
            </XDSVStack>

            {blocks.length === 0 && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column' as const,
                  alignItems: 'center' as const,
                  justifyContent: 'center' as const,
                  padding: 64,
                  color: 'var(--xds-color-text-secondary, #999)',
                }}>
                <PlusIcon />
                <XDSText type="body" color="secondary" style={{marginTop: 8}}>
                  Add blocks from the sidebar to get started
                </XDSText>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
