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
        <div
          style={{
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            flex: 1,
            padding: 24,
            textAlign: 'center' as const,
            gap: 8,
            height: '100%',
          }}>
          <svg width={32} height={32} viewBox="0 0 24 24" fill="none">
            <rect
              x={3}
              y={3}
              width={8}
              height={8}
              rx={1.5}
              stroke="currentColor"
              strokeWidth={1.5}
              opacity={0.4}
            />
            <rect
              x={13}
              y={3}
              width={8}
              height={8}
              rx={1.5}
              stroke="currentColor"
              strokeWidth={1.5}
              opacity={0.4}
            />
            <rect
              x={3}
              y={13}
              width={8}
              height={8}
              rx={1.5}
              stroke="currentColor"
              strokeWidth={1.5}
              opacity={0.4}
            />
            <rect
              x={13}
              y={13}
              width={8}
              height={8}
              rx={1.5}
              stroke="currentColor"
              strokeWidth={1.5}
              opacity={0.4}
            />
          </svg>
          <XDSText type="body" color="secondary">
            Select a block to edit its properties
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
          padding: 16,
        }}>
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
          <div
            style={{
              display: 'flex',
              flexDirection: 'column' as const,
              alignItems: 'center' as const,
              justifyContent: 'center' as const,
              padding: 24,
              gap: 8,
              textAlign: 'center' as const,
            }}>
            <XDSText type="body" color="secondary">
              No configurable properties
            </XDSText>
          </div>
        )}

        {type === 'cards' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column' as const,
              alignItems: 'center' as const,
              justifyContent: 'center' as const,
              padding: 24,
              gap: 8,
              textAlign: 'center' as const,
            }}>
            <XDSText type="body" color="secondary">
              No configurable properties
            </XDSText>
          </div>
        )}

        {type === 'features' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column' as const,
              alignItems: 'center' as const,
              justifyContent: 'center' as const,
              padding: 24,
              gap: 8,
              textAlign: 'center' as const,
            }}>
            <XDSText type="body" color="secondary">
              No configurable properties
            </XDSText>
          </div>
        )}
      </div>
    );
  };

  // --- block preview renderers ---------------------------------------------

  const renderBlockPreview = (block: Block) => {
    const {type, props} = block;
    const isSelected = block.id === selectedId;
    const ring = isSelected
      ? '0 0 0 2px var(--xds-color-accent, #0066ff)'
      : 'none';
    const handleClick = () =>
      selectBlock(
        block.id === selectedId ? (null as unknown as string) : block.id,
      );
    const cream = '#f5f3ef';
    const dark = '#1a1a1a';

    switch (type) {
      case 'hero': {
        const align = (props.alignment as string) ?? 'left';
        return (
          <div
            key={block.id}
            onClick={handleClick}
            style={{
              boxShadow: ring,
              borderRadius: 16,
              overflow: 'hidden' as const,
              cursor: 'pointer' as const,
              background: cream,
              padding: '64px 56px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 48,
              alignItems: 'center' as const,
            }}>
            <div>
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.05,
                  color: dark,
                  marginBottom: 20,
                }}>
                {(props.heading as string) ??
                  'Invest your way, commission-free'}
              </div>
              <div
                style={{
                  fontSize: 15,
                  lineHeight: 1.6,
                  color: 'rgba(0,0,0,0.55)',
                  marginBottom: 32,
                  maxWidth: 380,
                }}>
                {(props.subheading as string) ??
                  'Build your own portfolio with thousands of stocks, ETFs, and options — all on our powerful platform.'}
              </div>
              {(props.buttonLabel as string) && (
                <div
                  style={{
                    display: 'inline-block',
                    background: dark,
                    color: '#fff',
                    borderRadius: 100,
                    padding: '11px 24px',
                    fontSize: 14,
                    fontWeight: 600,
                  }}>
                  {props.buttonLabel as string}
                </div>
              )}
            </div>
            <div
              style={{
                background:
                  'linear-gradient(160deg, #c8dce8 0%, #b5cfa8 50%, #d4b896 100%)',
                borderRadius: 12,
                aspectRatio: '4/3',
                display: 'flex',
                alignItems: 'center' as const,
                justifyContent: 'center' as const,
                overflow: 'hidden' as const,
              }}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.85)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: 10,
                  padding: 16,
                  width: 180,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                }}>
                <div
                  style={{
                    fontSize: 11,
                    color: 'rgba(0,0,0,0.4)',
                    marginBottom: 10,
                  }}>
                  Portfolio
                </div>
                {['AAPL', 'TSLA', 'VFV'].map((t, i) => (
                  <div
                    key={t}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 8,
                    }}>
                    <span style={{fontSize: 12, fontWeight: 600}}>{t}</span>
                    <span
                      style={{
                        fontSize: 11,
                        color: i === 1 ? '#d63' : '#2a7',
                        fontWeight: 500,
                      }}>
                      {i === 1 ? '-1.2%' : '+3.4%'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case 'text':
        return (
          <div
            key={block.id}
            onClick={handleClick}
            style={{
              boxShadow: ring,
              borderRadius: 16,
              cursor: 'pointer' as const,
              background: cream,
              padding: '56px',
            }}>
            <div
              style={{
                maxWidth: 680,
                fontSize: 17,
                lineHeight: 1.8,
                color: dark,
              }}>
              {(props.content as string) ??
                'Your text content goes here. Clean, readable body copy with generous line height and a comfortable measure for easy scanning.'}
            </div>
          </div>
        );

      case 'image':
        return (
          <div
            key={block.id}
            onClick={handleClick}
            style={{
              boxShadow: ring,
              borderRadius: 16,
              overflow: 'hidden' as const,
              cursor: 'pointer' as const,
              background:
                'linear-gradient(160deg, #c8dce8 0%, #c5d5b0 60%, #d4b896 100%)',
              aspectRatio: '16/7',
              display: 'flex',
              alignItems: 'center' as const,
              justifyContent: 'center' as const,
            }}>
            <div
              style={{
                background: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(12px)',
                borderRadius: 8,
                padding: '10px 16px',
                fontSize: 12,
                color: 'rgba(0,0,0,0.4)',
                letterSpacing: '0.04em',
              }}>
              Image
            </div>
          </div>
        );

      case 'button':
        return (
          <div
            key={block.id}
            onClick={handleClick}
            style={{
              boxShadow: ring,
              borderRadius: 16,
              cursor: 'pointer' as const,
              background: cream,
              padding: '40px 56px',
              display: 'flex',
              justifyContent: 'flex-start' as const,
            }}>
            <div
              style={{
                background:
                  (props.variant as string) === 'ghost'
                    ? 'transparent'
                    : (props.variant as string) === 'secondary'
                      ? 'transparent'
                      : dark,
                color:
                  (props.variant as string) === 'secondary' ||
                  (props.variant as string) === 'ghost'
                    ? dark
                    : '#fff',
                border:
                  (props.variant as string) !== 'primary'
                    ? `1px solid ${dark}`
                    : 'none',
                borderRadius: 100,
                padding:
                  (props.size as string) === 'lg'
                    ? '13px 32px'
                    : (props.size as string) === 'sm'
                      ? '8px 18px'
                      : '11px 24px',
                fontSize:
                  (props.size as string) === 'lg'
                    ? 16
                    : (props.size as string) === 'sm'
                      ? 13
                      : 14,
                fontWeight: 600,
              }}>
              {(props.label as string) ?? 'Get started'}
            </div>
          </div>
        );

      case 'features': {
        const featureCards = (props.cards as {
          title: string;
          description: string;
        }[]) ?? [
          {
            title: 'Low fees, more value',
            description:
              'The more assets you have with us, the better your perks. Pay lower option trading and FX fees as a Premium or Generation client.',
          },
          {
            title: 'Fast and flexible',
            description:
              'Start trading on your terms and timeline. Instant transfers and extended hours keep you ready for any market moment.',
          },
          {
            title: 'Everything you need to trade',
            description:
              'Buy and sell all common stocks, ETFs, and options on mobile or web, with multiple different accounts to choose from.',
          },
        ];
        return (
          <div
            key={block.id}
            onClick={handleClick}
            style={{
              boxShadow: ring,
              borderRadius: 16,
              cursor: 'pointer' as const,
              background: cream,
              padding: '56px',
            }}>
            <div
              style={{
                fontSize: 40,
                fontWeight: 700,
                letterSpacing: '-0.025em',
                lineHeight: 1.1,
                color: dark,
                marginBottom: 48,
                maxWidth: 480,
              }}>
              Self-directed trading that earns you more
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(featureCards.length, 3)}, 1fr)`,
                gap: 32,
              }}>
              {featureCards.map((card, i) => (
                <div key={i}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: dark,
                      marginBottom: 8,
                    }}>
                    {card.title}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      lineHeight: 1.65,
                      color: 'rgba(0,0,0,0.5)',
                    }}>
                    {card.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'cards': {
        const cardItems = (props.cards as {
          title: string;
          description: string;
        }[]) ?? [
          {title: '$0 commission trading', description: 'Stocks & ETFs'},
          {
            title: 'Trade options for $0 — a first in Canada',
            description: 'Options',
          },
          {
            title: 'Get margin rates lower than your bank',
            description: 'Margin',
          },
        ];
        const cardBg = ['#c8d8b0', '#b5c8a0', '#c0b090'];
        return (
          <div
            key={block.id}
            onClick={handleClick}
            style={{
              boxShadow: ring,
              borderRadius: 16,
              overflow: 'hidden' as const,
              cursor: 'pointer' as const,
              background: cream,
              padding: '56px',
            }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                marginBottom: 32,
              }}>
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 700,
                  letterSpacing: '-0.025em',
                  lineHeight: 1.1,
                  color: dark,
                  maxWidth: 400,
                }}>
                Strategies to suit any portfolio
              </div>
              <div
                style={{
                  border: '1px solid rgba(0,0,0,0.2)',
                  borderRadius: 100,
                  padding: '9px 20px',
                  fontSize: 13,
                  fontWeight: 500,
                  color: dark,
                  flexShrink: 0,
                }}>
                Invest now
              </div>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(cardItems.length, 3)}, 1fr)`,
                gap: 12,
              }}>
              {cardItems.map((card, i) => (
                <div
                  key={i}
                  style={{
                    background: cardBg[i % cardBg.length],
                    borderRadius: 12,
                    padding: '24px 20px 20px',
                    display: 'flex',
                    flexDirection: 'column' as const,
                    justifyContent: 'space-between',
                    minHeight: 200,
                  }}>
                  <div
                    style={{
                      width: '100%',
                      height: 80,
                      borderRadius: 8,
                      background: 'rgba(255,255,255,0.25)',
                      marginBottom: 24,
                    }}
                  />
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        color: 'rgba(0,0,0,0.45)',
                        marginBottom: 6,
                      }}>
                      {card.description}
                    </div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: dark,
                        lineHeight: 1.25,
                      }}>
                      {card.title}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'cta':
        return (
          <div
            key={block.id}
            onClick={handleClick}
            style={{
              boxShadow: ring,
              borderRadius: 16,
              overflow: 'hidden' as const,
              cursor: 'pointer' as const,
              background: cream,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 0,
            }}>
            <div
              style={{
                background:
                  'linear-gradient(160deg, #c8dce8 0%, #c5d5b0 60%, #d4b896 100%)',
                padding: 40,
                minHeight: 260,
                display: 'flex',
                alignItems: 'center' as const,
                justifyContent: 'center' as const,
              }}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: 10,
                  padding: 20,
                  width: '80%',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                }}>
                {[
                  ['NVDA', '$500.00 USD'],
                  ['Recurring investments', '●'],
                  ['Dividend reinvestments', '●'],
                ].map(([label, val], i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom:
                        i < 2 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                    }}>
                    <span
                      style={{fontSize: 12, fontWeight: i === 0 ? 600 : 400}}>
                      {label}
                    </span>
                    <span
                      style={{
                        fontSize: i === 0 ? 12 : 18,
                        color: i > 0 ? '#2a7' : 'rgba(0,0,0,0.5)',
                      }}>
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{padding: '48px 40px'}}>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  letterSpacing: '-0.025em',
                  lineHeight: 1.1,
                  color: dark,
                  marginBottom: 32,
                }}>
                {(props.heading as string) ??
                  'Automation for smarter investing'}
              </div>
              {[
                {
                  title:
                    (props.primaryLabel as string) || 'Recurring investments',
                  body:
                    (props.description as string) ||
                    'Auto-buy your favourite stocks and ETFs on your schedule.',
                },
                {
                  title:
                    (props.secondaryLabel as string) || 'Dividend reinvestment',
                  body: 'Keep growing by reinvesting 100% of your earnings with zero commissions.',
                },
              ].map((item, i) => (
                <div key={i} style={{marginBottom: 20}}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: dark,
                      marginBottom: 4,
                    }}>
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      lineHeight: 1.6,
                      color: 'rgba(0,0,0,0.5)',
                    }}>
                    {item.body}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

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
                marginBottom: 16,
              }}>
              <div style={{flex: 1}}>
                {isEditingTitle ? (
                  <div onBlurCapture={() => setIsEditingTitle(false)}>
                    <XDSTextInput
                      label="Page title"
                      isLabelHidden
                      value={pageTitle}
                      onChange={setPageTitle}
                      onKeyDown={(e: React.KeyboardEvent) => {
                        if (e.key === 'Enter') setIsEditingTitle(false);
                      }}
                      hasAutoFocus
                    />
                  </div>
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
                style={{marginRight: -8, marginTop: -8}}
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
                <XDSButton label="Preview" icon={<EyeIcon />} variant="ghost" />
                <XDSButton label="Publish" variant="primary" />
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
                  minHeight: 400,
                  gap: 12,
                  color: 'var(--xds-color-text-secondary, #999)',
                }}>
                <PlusIcon />
                <XDSText type="body" color="secondary">
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
