// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useCallback, useState, type SVGProps} from 'react';
import * as stylex from '@stylexjs/stylex';

import {AspectRatio} from '@astryxdesign/core/AspectRatio';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Center} from '@astryxdesign/core/Center';
import {Divider} from '@astryxdesign/core/Divider';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuDivider,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSubMenu,
} from '@astryxdesign/core/DropdownMenu';
import {Icon, type IconType} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Kbd} from '@astryxdesign/core/Kbd';
import {
  HStack,
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutPanel,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {List, ListItem} from '@astryxdesign/core/List';
import {NumberInput} from '@astryxdesign/core/NumberInput';
import {ResizeHandle, useResizable} from '@astryxdesign/core/Resizable';
import {Section} from '@astryxdesign/core/Section';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {Heading, Text} from '@astryxdesign/core/Text';
import {TextArea} from '@astryxdesign/core/TextArea';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Theme, defineTheme} from '@astryxdesign/core/theme';
import {Toolbar} from '@astryxdesign/core/Toolbar';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';
import {
  Download,
  FlipHorizontal,
  FlipVertical,
  Frame,
  Group,
  Image as ImageIcon,
  Lock,
  LockOpen,
  Palette,
  PanelBottom,
  PanelLeft,
  PanelRight,
  Redo2,
  RotateCcw,
  RotateCw,
  SquareDashed,
  Type,
  Undo2,
  X,
} from 'lucide-react';

// =============================================================================
// Poster theme
// =============================================================================

/**
 * The artboard is artwork, not app chrome, so it runs under its own theme: a
 * heavy condensed display face, poster-scale type, and a light palette pinned
 * with `mode="light"` so the poster holds when the editor goes dark.
 *
 * The theme owns what belongs to the poster as a whole — the face, the
 * leading, the uppercase treatment, the frame margins. Per-layer size and
 * tracking are not here: those belong to a layer, and the inspector edits
 * them.
 *
 * Sizes here are artboard pixels, not screen pixels. The artboard always lays
 * out at its native 1080 x 1920 and the zoom control scales the whole frame,
 * so these stay the numbers a designer would type into the inspector.
 */
const posterTheme = defineTheme({
  name: 'canvas-editor-poster',
  typography: {
    // Anton is the reference face. It and the fallbacks are all single-weight
    // blacks, so display-1 stays at weight 400 and the poster needs no
    // webfont. Order matters: Impact outranks Arial Narrow because Arial
    // Narrow at 400 renders thin, which reads nothing like a poster.
    heading: {
      family: 'Anton',
      fallbacks: 'Haettenschweiler, Impact, "Arial Narrow", sans-serif',
    },
  },
  tokens: {
    '--text-display-1-leading': '1.02',
    // The two spacing steps the poster lockup uses: the frame margin and the
    // gap under the eyebrow.
    '--spacing-6': '56px',
    '--spacing-3': '24px',
  },
  components: {
    heading: {'type:display-1': {textTransform: 'uppercase'}},
    text: {'type:supporting': {textTransform: 'uppercase'}},
  },
});

// =============================================================================
// Document
// =============================================================================

/** Artboard size in design pixels — a 9:16 social poster. */
const FRAME = {width: 1080, height: 1920};

/**
 * Every icon on this page is 16px.
 *
 * Icon's own scale runs 12/16/20/24, and a page that mixes them reads as
 * drift rather than hierarchy: the rail's layer marks, the inspector's
 * buttons, and the canvas tools are all the same rank of thing. Button sizes
 * its icon slot to 16px at `sm` and `md`, so this is also the size that fits
 * the slot exactly instead of being scaled into it.
 */
const ICON = 'sm' as const;

/**
 * Width of the inspector's label column, in pixels.
 *
 * Wide enough for the longest label the panel uses at the label type size,
 * which is what puts every control on a single left edge.
 */
const LABEL_COLUMN = 58;

const PHOTO_LAYER_SRC = '/template-assets/moody-scene-vertical-1.png';

type LayerKind = 'text' | 'image';

/** What the Appearance submenu sets on the editor chrome. */
type ThemeMode = 'light' | 'dark' | 'system';

/** The menubar's menus, left to right. */
type MenuID = 'file' | 'edit' | 'view' | 'object' | 'help';

interface Layer {
  id: string;
  name: string;
  kind: LayerKind;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  padding: number;
  radius: number;
  isLocked: boolean;
  /** Copy for a text layer; the alt text for an image layer. */
  content: string;
  /** Type settings. Only text layers carry them, and only they show them. */
  family?: string;
  weight?: string;
  size?: number;
  tracking?: number;
}

const INITIAL_LAYERS: Layer[] = [
  {
    id: 'headline',
    name: 'Headline',
    kind: 'text',
    x: 56,
    y: 136,
    width: 968,
    height: 300,
    rotation: 0,
    padding: 0,
    radius: 0,
    isLocked: false,
    content: 'A weekend in Salzburg',
    family: 'Anton',
    weight: 'Regular',
    size: 112,
    tracking: -2,
  },
  {
    id: 'dateline',
    name: 'Dateline',
    kind: 'text',
    x: 56,
    y: 56,
    width: 968,
    height: 56,
    rotation: 0,
    padding: 0,
    radius: 0,
    isLocked: false,
    content: 'March 14–16 · Austria',
    family: 'Inter Tight',
    weight: 'Medium',
    size: 26,
    tracking: 32,
  },
  {
    id: 'photo',
    name: 'Photo',
    kind: 'image',
    x: 0,
    y: 0,
    width: 1080,
    height: 1920,
    rotation: 0,
    padding: 0,
    radius: 0,
    isLocked: true,
    content: 'The Salzach river and old town rooftops at dusk',
  },
];

const LAYER_ICON = {text: Type, image: ImageIcon} as const;

// =============================================================================
// Field glyphs
// =============================================================================

/**
 * Draws a letterform sized to the icon grid.
 *
 * A design tool names a numeric field from inside it — the X sits in the box
 * with the number, not in a segment bolted to its edge — so the row reads as
 * one control. That is the input's start-icon slot, which takes an SVG
 * component; Lucide ships no letterforms, so these are drawn on the same 24px
 * grid Lucide uses. They inherit `currentColor` and the slot's sizing, so a
 * letter and an icon are interchangeable in the same position.
 */
function glyph(char: string): IconType {
  const Glyph = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" {...props}>
      <text
        x={12}
        y={12}
        fill="currentColor"
        // Two-letter glyphs get the smaller size so both fit the same box.
        fontSize={char.length > 1 ? 13 : 17}
        fontWeight={500}
        textAnchor="middle"
        dominantBaseline="central">
        {char}
      </text>
    </svg>
  );
  Glyph.displayName = `Glyph(${char})`;
  return Glyph;
}

/** Built once at module scope so each glyph keeps a stable component identity. */
const GLYPH = {
  padding: glyph('P'),
  radius: glyph('R'),
  x: glyph('X'),
  y: glyph('Y'),
  width: glyph('W'),
  height: glyph('H'),
  rotation: glyph('°'),
  fontSize: glyph('A'),
  tracking: glyph('AV'),
} as const;

const ZOOM_OPTIONS = [
  {value: '0.25', label: '25%'},
  {value: '0.4', label: '40%'},
  {value: '0.6', label: '60%'},
  {value: '1', label: '100%'},
];

const FONT_OPTIONS = ['Anton', 'Archivo Black', 'Bebas Neue', 'Inter Tight'];
const WEIGHT_OPTIONS = ['Regular', 'Medium', 'Semibold', 'Bold'];

/** What the Insert submenu can add to the artboard. */
const INSERT_ITEMS: {label: string; icon: IconType}[] = [
  {label: 'Frame', icon: Frame},
  {label: 'Group', icon: Group},
  {label: 'Text', icon: Type},
  {label: 'Image', icon: ImageIcon},
];

/** Written once: the Export button and the File menu offer the same three. */
const EXPORT_FORMATS = [
  'PNG · 1080 × 1920',
  'JPG · 1080 × 1920',
  'PDF · print ready',
];

const EXPORT_MENU = EXPORT_FORMATS.map(label => ({label}));

// =============================================================================
// Styles
// =============================================================================

/**
 * Marks a layer row as the ancestor its hover selectors resolve against.
 *
 * A scoped `defineMarker()` would be the usual choice, but StyleX only hashes
 * one inside a `.stylex.ts` module and a template is a single file. The
 * default marker is safe in its place here: product code compiles markers
 * under its own prefix, so this never answers to the one Layout sets
 * internally. The rows are the only thing in this file that carries it, and
 * they do not nest, so nothing else can trip the selectors below.
 */
const layerRow = stylex.defaultMarker();

const styles = stylex.create({
  // Zoom the way a design tool does: lay the artboard out once at its native
  // size and scale the painted result. Type and spacing stay in artboard
  // pixels, and the poster gets no reflow between zoom steps.
  artboard: (scale: number) => ({
    width: FRAME.width,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  }),
  // Type the inspector owns. Size and tracking can't be theme tokens: they
  // belong to a layer, not to the poster, and they change per keystroke.
  // Tracking is a percentage of the type size, the way a design tool states
  // it, so it holds when the size changes.
  type: (size: number, tracking: number) => ({
    fontSize: `${size}px`,
    letterSpacing: `${tracking / 100}em`,
  }),
  // AspectRatio's `fit` stretches every direct child to fill the box, so a
  // second one would flow below the photo and clip. Taking the text layers
  // out of flow is what stacks them over it, the way they sit on an artboard.
  textLayers: {position: 'absolute', inset: 0},
  // A Card given a height prop turns into a scroll container, which is the
  // right default for a card holding more copy than fits. This one is a
  // viewport onto an artboard that is deliberately larger than its frame —
  // the artboard lays out at 1080 wide at every zoom step and the frame
  // scales it — so it clips instead. `clip` over `hidden`: nothing here
  // should scroll, including the quiet scroll that focusing a clipped child
  // would otherwise cause.
  artboardFrame: {overflow: 'clip'},
  // Concentric corners. The card rounds to --radius-container and holds one
  // spacing step of padding, so the controls inside it round to the
  // difference: an inner corner struck from the same centre as the outer one
  // rather than a rounder curve cutting across it. Stated as the subtraction
  // so it still holds if either token moves.
  toolBarControl: {
    borderRadius: 'calc(var(--radius-container) - var(--spacing-1))',
  },
  // A vertical Divider is `height: 100%`, and a flex row that centres its
  // items gives a percentage height nothing to resolve against — the rule
  // collapses to nothing and the tool bar loses its groups. Stretching the
  // item is what gives it a height; the inset then pulls it back off the
  // buttons so it separates them rather than boxing them in.
  toolBarRule: {
    alignSelf: 'stretch',
    height: 'auto',
    marginBlock: 'var(--spacing-1)',
  },
  // Give the header bar its own inline padding, so the Export button stops
  // at a margin instead of the window edge.
  //
  // The layout under it is set to zero padding — the panels have to reach
  // the edges — and a Toolbar takes its inline padding from whatever
  // container it sits in, so it inherits that zero. The fix has to arrive as
  // Section's padding token rather than as `paddingInline`: Section renders
  // an outer wrapper that escapes its parent's gutter and an inner one that
  // holds the padding, xstyle lands on the outer, and padding set there
  // makes the bar bleed 12px past the window rather than inset its contents.
  // The token is read on the inner element, where it also republishes
  // --container-padding-inline-*. That second effect is the one that
  // matters: it feeds the toolbar's edge compensation, which pulls ghost
  // triggers back out by their own padding so the File *label* lines up on
  // the gutter while its hover box still bleeds into it.
  headerBar: {'--astryx-section-padding-inline': 'var(--spacing-3)'},
  // A layer row keeps its lock quiet until the row is the one being pointed
  // at, so the rail reads as a list of names rather than a grid of buttons.
  // Opacity rather than display: the row must not change width when the
  // control arrives, and the button stays in the tab order so the lock is
  // reachable without a pointer — which is what `:focus-within` shows.
  //
  // Hiding is the unconditional default on purpose. The two reveal arms
  // compile to a doubled class plus `:where(…)`, so they outrank a plain
  // default; make the hidden state conditional instead and it compiles to the
  // same specificity in the same layer, where source order decides and the
  // reveal silently loses.
  rowAction: {
    opacity: {
      default: 0,
      // A touch row has no hover to reveal on, so it shows the lock outright.
      '@media (hover: none)': 1,
      [stylex.when.ancestor(':hover')]: 1,
      [stylex.when.ancestor(':focus-within')]: 1,
    },
    transition: 'opacity 120ms ease',
  },
  // A locked layer says so at rest: the state is a property of the layer, not
  // an action offered on hover.
  rowActionPinned: {opacity: 1},
  // Hold the label column at its set width. The fields beside it carry the
  // flex min-width reset, so without this the row spends its shrinkage on
  // whichever item gives way first and each label ends up a different width —
  // which is exactly the shared left edge the panel is built around.
  labelColumn: {flexShrink: 0},
});

// =============================================================================
// Panel building blocks
// =============================================================================

/**
 * One inspector row: a fixed label column, then the controls for it.
 *
 * The label column is a set width rather than intrinsic so that every control
 * in the panel starts on the same vertical line, whatever its label is
 * called. That shared edge is what lets the eye run down the column and
 * compare values instead of hunting for each field.
 */
function InspectorRow({
  label,
  hAlign,
  children,
}: {
  label: string;
  /** Set to "end" for a row of bare buttons, which have no field to fill. */
  hAlign?: 'start' | 'end';
  children: React.ReactNode;
}) {
  return (
    <HStack gap={2} vAlign="center">
      <HStack width={LABEL_COLUMN} xstyle={styles.labelColumn}>
        <Text type="label" color="secondary" maxLines={1}>
          {label}
        </Text>
      </HStack>
      <StackItem size="fill">
        <HStack gap={1} vAlign="center" hAlign={hAlign}>
          {children}
        </HStack>
      </StackItem>
    </HStack>
  );
}

/** A numeric field that names itself from inside, like X 40. */
function AxisInput({
  icon,
  label,
  value,
  onChange,
}: {
  icon: IconType;
  label: string;
  value: number;
  onChange: (next: number) => void;
}) {
  return (
    <StackItem size="fill">
      <NumberInput
        label={label}
        isLabelHidden
        startIcon={icon}
        size="sm"
        value={value}
        onChange={onChange}
        isWheelEnabled={false}
      />
    </StackItem>
  );
}

/** An inspector group: a caption, its rows, and a closing divider. */
function InspectorSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Section padding={4} dividers={['bottom']}>
      <VStack gap={3}>
        <Text type="label" weight="semibold">
          {title}
        </Text>
        {children}
      </VStack>
    </Section>
  );
}

/**
 * One row of the layer rail: an icon, the layer's name, and a lock.
 *
 * The lock is an action on the row, so it stays out of the way until the row
 * is the one being pointed at — the rail reads as a list of names, and the
 * control arrives where the cursor already is. A locked row is the exception:
 * it shows the closed lock at rest, because that is a fact about the layer
 * rather than an action being offered.
 */
function LayerRow({
  layer,
  isSelected,
  onSelect,
  onToggleLock,
}: {
  layer: Layer;
  isSelected: boolean;
  onSelect: () => void;
  onToggleLock: () => void;
}) {
  return (
    <ListItem
      label={layer.name}
      isSelected={isSelected}
      onClick={onSelect}
      // The marker has to sit on the row itself for the hover selector below
      // to scope to one row. `xstyle` takes style objects and rejects a
      // marker's opaque type, so the class it compiles to goes on through
      // `className`, which ListItem merges onto the same <li>.
      className={stylex.props(layerRow).className}
      startContent={<Icon icon={LAYER_ICON[layer.kind]} size={ICON} />}
      endContent={
        <IconButton
          label={layer.isLocked ? `Unlock ${layer.name}` : `Lock ${layer.name}`}
          tooltip={layer.isLocked ? 'Unlock layer' : 'Lock layer'}
          size="sm"
          variant="ghost"
          onClick={onToggleLock}
          icon={<Icon icon={layer.isLocked ? Lock : LockOpen} size={ICON} />}
          xstyle={[styles.rowAction, layer.isLocked && styles.rowActionPinned]}
        />
      }
    />
  );
}

/**
 * A style slot that is either unset or carries a value: a field led by a
 * swatch that opens the picker, and a clear that only lights up once the slot
 * holds something.
 */
function StyleRow({
  label,
  value,
  placeholder,
}: {
  label: string;
  value?: string;
  placeholder: string;
}) {
  return (
    <InspectorRow label={label}>
      <StackItem size="fill">
        <TextInput
          label={label}
          isLabelHidden
          startIcon={Palette}
          size="sm"
          value={value ?? ''}
          placeholder={placeholder}
        />
      </StackItem>
      <IconButton
        label={`Clear ${label.toLowerCase()}`}
        tooltip="Clear"
        size="sm"
        variant="ghost"
        isDisabled={value === undefined}
        icon={<Icon icon={X} size={ICON} />}
      />
    </InspectorRow>
  );
}

// =============================================================================
// Page
// =============================================================================

export default function CanvasEditor() {
  const [layers, setLayers] = useState(INITIAL_LAYERS);
  const [selectedID, setSelectedID] = useState('headline');
  const [panel, setPanel] = useState('layers');
  const [zoom, setZoom] = useState('0.4');
  // What the View submenu toggles. A design tool trades chrome for canvas, so
  // these drive the real Layout slots rather than standing in for them.
  const [chrome, setChrome] = useState({
    left: true,
    right: true,
    toolbar: true,
  });
  const [appearance, setAppearance] = useState<ThemeMode>('system');
  const [openMenu, setOpenMenu] = useState<MenuID | null>(null);

  // Both rails are drag-sized. The floors are the width each panel stops
  // being useful below — the rail at the point layer names start truncating,
  // the inspector at the point its two-field rows stop fitting side by side —
  // and the ceilings keep either from eating the canvas they exist to serve.
  const rail = useResizable({defaultSize: 216, minSize: 176, maxSize: 320});
  const inspector = useResizable({
    defaultSize: 272,
    minSize: 248,
    maxSize: 400,
  });

  const selected = layers.find(layer => layer.id === selectedID) ?? layers[0];
  const scale = Number(zoom);

  const updateSelected = useCallback(
    (patch: Partial<Layer>) => {
      setLayers(current =>
        current.map(layer =>
          layer.id === selectedID ? {...layer, ...patch} : layer,
        ),
      );
    },
    [selectedID],
  );

  const [headline, dateline] = layers.filter(layer => layer.kind === 'text');
  const photo = layers.filter(layer => layer.kind === 'image')[0];

  /**
   * Trigger props for one menubar title.
   *
   * What separates a menubar from a row of dropdowns is that the bar behaves
   * as one control: once any menu is open, moving across the titles switches
   * between them without a second click. A DropdownMenu holding its own open
   * state cannot do that — it has no way to know a sibling is showing — so
   * the bar keeps the open menu in one place and each title only reports
   * what the pointer crossed.
   */
  const menu = (id: MenuID, label: string) => ({
    button: {
      label,
      variant: 'ghost' as const,
      size: 'sm' as const,
      // Only take the menu when one is already open. Sweeping the bar with
      // everything closed is a cursor crossing buttons, not a request.
      onMouseEnter: () =>
        setOpenMenu(current => (current === null ? null : id)),
    },
    // A menubar title is a word, not a select: the chevron belongs on a
    // control that reports a value.
    hasChevron: false,
    isMenuOpen: openMenu === id,
    // Closing has to be checked against which menu is open, not assumed.
    // Handing the bar to a sibling closes this one on the way out, and a
    // plain `isOpen ? id : null` lets that farewell land after the sibling
    // has already claimed the bar — every switch would blank it instead.
    onOpenChange: (isOpen: boolean) =>
      setOpenMenu(current => (isOpen ? id : current === id ? null : current)),
  });

  return (
    // Appearance drives a Theme around the whole editor, and that Theme needs
    // a surface of its own. Panels and toolbars are transparent, so without
    // one they keep showing the host page's background while their text takes
    // the new mode's colour — light text on a light page. The Section paints
    // the mode's own background, which is what makes the editor consistent.
    <Theme theme={neutralTheme} mode={appearance}>
      <Section variant="section" padding={0} height="100%">
        <Layout
          height="fill"
          padding={0}
          header={
            <Toolbar
              label="Document actions"
              size="sm"
              dividers={['bottom']}
              // Menubar titles sit tight to each other; the status text and
              // Export button on the other end need the room.
              gap={0.5}
              xstyle={styles.headerBar}
              startContent={
                <>
                  <DropdownMenu {...menu('file', 'File')}>
                    <DropdownMenuItem
                      label="New poster"
                      endContent={<Kbd keys="mod+n" />}
                    />
                    <DropdownMenuItem
                      label="Open…"
                      endContent={<Kbd keys="mod+o" />}
                    />
                    <DropdownMenuDivider />
                    <DropdownMenuItem
                      label="Save"
                      endContent={<Kbd keys="mod+s" />}
                    />
                    <DropdownMenuItem
                      label="Save as…"
                      endContent={<Kbd keys="mod+shift+s" />}
                    />
                    <DropdownMenuSubMenu label="Export">
                      {EXPORT_FORMATS.map(format => (
                        <DropdownMenuItem key={format} label={format} />
                      ))}
                    </DropdownMenuSubMenu>
                    <DropdownMenuDivider />
                    <DropdownMenuItem
                      label="Close"
                      endContent={<Kbd keys="mod+w" />}
                    />
                  </DropdownMenu>

                  <DropdownMenu {...menu('edit', 'Edit')}>
                    <DropdownMenuItem
                      label="Undo"
                      endContent={<Kbd keys="mod+z" />}
                    />
                    <DropdownMenuItem
                      label="Redo"
                      endContent={<Kbd keys="mod+shift+z" />}
                    />
                    <DropdownMenuDivider />
                    <DropdownMenuItem
                      label="Cut"
                      endContent={<Kbd keys="mod+x" />}
                    />
                    <DropdownMenuItem
                      label="Copy"
                      endContent={<Kbd keys="mod+c" />}
                    />
                    <DropdownMenuItem
                      label="Paste"
                      endContent={<Kbd keys="mod+v" />}
                    />
                    <DropdownMenuDivider />
                    <DropdownMenuItem
                      label="Duplicate"
                      endContent={<Kbd keys="mod+d" />}
                    />
                    {/* Named, because a menu opened from the bar has lost
                    sight of the rail: the row that would go is worth saying
                    out loud before a destructive item is clicked. */}
                    <DropdownMenuItem
                      label={`Delete ${selected.name}`}
                      variant="destructive"
                      endContent={<Kbd keys="backspace" />}
                    />
                  </DropdownMenu>

                  {/* Checkbox rows, not actions: each reports a state the
                  user can see on the page, and the menu stays open so all
                  three can be set in one visit. */}
                  <DropdownMenu {...menu('view', 'View')}>
                    <DropdownMenuCheckboxItem
                      label="Left panel"
                      icon={PanelLeft}
                      endContent={<Kbd keys="mod+b" />}
                      value={chrome.left}
                      onChange={next => setChrome(c => ({...c, left: next}))}
                    />
                    <DropdownMenuCheckboxItem
                      label="Right panel"
                      icon={PanelRight}
                      endContent={<Kbd keys="mod+shift+b" />}
                      value={chrome.right}
                      onChange={next => setChrome(c => ({...c, right: next}))}
                    />
                    <DropdownMenuCheckboxItem
                      label="Canvas tools"
                      icon={PanelBottom}
                      endContent={<Kbd keys="mod+." />}
                      value={chrome.toolbar}
                      onChange={next => setChrome(c => ({...c, toolbar: next}))}
                    />
                    <DropdownMenuDivider />
                    {/* The same value the tool bar's zoom control holds, so
                    setting it in either place moves the other. */}
                    <DropdownMenuSubMenu label="Zoom">
                      <DropdownMenuRadioGroup
                        label="Zoom"
                        value={zoom}
                        onChange={setZoom}>
                        {ZOOM_OPTIONS.map(option => (
                          <DropdownMenuRadioItem
                            key={option.value}
                            value={option.value}
                            label={option.label}
                          />
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuSubMenu>
                    <DropdownMenuSubMenu label="Appearance">
                      <DropdownMenuRadioGroup
                        label="Appearance"
                        value={appearance}
                        onChange={next => setAppearance(next as ThemeMode)}>
                        <DropdownMenuRadioItem value="light" label="Light" />
                        <DropdownMenuRadioItem value="dark" label="Dark" />
                        <DropdownMenuRadioItem value="system" label="System" />
                      </DropdownMenuRadioGroup>
                    </DropdownMenuSubMenu>
                  </DropdownMenu>

                  <DropdownMenu {...menu('object', 'Object')}>
                    <DropdownMenuSubMenu label="Insert">
                      {INSERT_ITEMS.map(item => (
                        <DropdownMenuItem
                          key={item.label}
                          label={item.label}
                          icon={item.icon}
                        />
                      ))}
                    </DropdownMenuSubMenu>
                    <DropdownMenuDivider />
                    <DropdownMenuItem
                      label="Bring forward"
                      endContent={<Kbd keys="mod+]" />}
                    />
                    <DropdownMenuItem
                      label="Send backward"
                      endContent={<Kbd keys="mod+[" />}
                    />
                    <DropdownMenuDivider />
                    {/* The lock the rail row reveals on hover, reached from
                    the menubar instead — one piece of state, two ways in. */}
                    <DropdownMenuCheckboxItem
                      label={`Lock ${selected.name}`}
                      icon={selected.isLocked ? Lock : LockOpen}
                      endContent={<Kbd keys="mod+shift+l" />}
                      value={selected.isLocked}
                      onChange={next => updateSelected({isLocked: next})}
                    />
                  </DropdownMenu>

                  <DropdownMenu {...menu('help', 'Help')}>
                    <DropdownMenuItem
                      label="Keyboard shortcuts"
                      endContent={<Kbd keys="mod+/" />}
                    />
                    <DropdownMenuItem label="Documentation" />
                    <DropdownMenuDivider />
                    <DropdownMenuItem label="About this editor" />
                  </DropdownMenu>
                </>
              }
              endContent={
                <HStack gap={3} vAlign="center">
                  <Text type="supporting" color="secondary">
                    Saved · 2 min ago
                  </Text>
                  <DropdownMenu
                    button={{
                      label: 'Export',
                      variant: 'primary',
                      size: 'sm',
                      icon: <Icon icon={Download} size={ICON} />,
                    }}
                    alignment="end"
                    items={EXPORT_MENU}
                  />
                </HStack>
              }
            />
          }
          content={
            <LayoutContent padding={0}>
              <Layout
                height="fill"
                start={
                  chrome.left ? (
                    <>
                      <LayoutPanel
                        resizable={rail.props}
                        hasDivider
                        padding={3}
                        label="Layers and assets">
                        <VStack gap={3}>
                          <SegmentedControl
                            label="Left panel"
                            size="sm"
                            layout="fill"
                            value={panel}
                            onChange={setPanel}>
                            <SegmentedControlItem
                              label="Layers"
                              value="layers"
                            />
                            <SegmentedControlItem
                              label="Library"
                              value="library"
                            />
                          </SegmentedControl>
                          {panel === 'layers' ? (
                            <List density="compact">
                              {layers.map(layer => (
                                <LayerRow
                                  key={layer.id}
                                  layer={layer}
                                  isSelected={layer.id === selectedID}
                                  onSelect={() => setSelectedID(layer.id)}
                                  onToggleLock={() =>
                                    setLayers(current =>
                                      current.map(l =>
                                        l.id === layer.id
                                          ? {...l, isLocked: !l.isLocked}
                                          : l,
                                      ),
                                    )
                                  }
                                />
                              ))}
                            </List>
                          ) : (
                            <List density="compact">
                              {[
                                'Grain overlay',
                                'Halftone',
                                'Duotone teal',
                              ].map(preset => (
                                <ListItem
                                  key={preset}
                                  label={preset}
                                  startContent={
                                    <Icon icon={Palette} size={ICON} />
                                  }
                                />
                              ))}
                            </List>
                          )}
                        </VStack>
                      </LayoutPanel>
                      {/* The panel draws the separator, so the handle stays
                    divider-less and keeps its grip hidden until the pointer
                    is on the seam. */}
                      <ResizeHandle
                        resizable={rail.props}
                        isAlwaysVisible={false}
                        label="Resize layers panel"
                      />
                    </>
                  ) : undefined
                }
                content={
                  <LayoutContent padding={0}>
                    <Section variant="muted" padding={0} height="100%">
                      <Layout
                        height="fill"
                        // Lifts the tool bar off the bottom edge: the footer
                        // reads this as its outer padding, so the bar floats
                        // over the backdrop rather than sitting on the sill.
                        padding={4}
                        content={
                          <LayoutContent padding={6}>
                            <Center>
                              <Card
                                padding={0}
                                elevation="med"
                                width={FRAME.width * scale}
                                height={FRAME.height * scale}
                                xstyle={styles.artboardFrame}>
                                <Theme theme={posterTheme} mode="light">
                                  <AspectRatio
                                    ratio={FRAME.width / FRAME.height}
                                    fit="cover"
                                    xstyle={styles.artboard(scale)}>
                                    <img
                                      src={PHOTO_LAYER_SRC}
                                      alt={photo.content}
                                    />
                                    <VStack
                                      padding={6}
                                      gap={3}
                                      xstyle={styles.textLayers}>
                                      <Text
                                        type="supporting"
                                        color="primary"
                                        justify="center"
                                        display="block"
                                        xstyle={styles.type(
                                          dateline.size ?? 0,
                                          dateline.tracking ?? 0,
                                        )}>
                                        {dateline.content}
                                      </Text>
                                      <Heading
                                        level={2}
                                        type="display-1"
                                        justify="center"
                                        textWrap="balance"
                                        xstyle={styles.type(
                                          headline.size ?? 0,
                                          headline.tracking ?? 0,
                                        )}>
                                        {headline.content}
                                      </Heading>
                                    </VStack>
                                  </AspectRatio>
                                </Theme>
                              </Card>
                            </Center>
                          </LayoutContent>
                        }
                        footer={
                          chrome.toolbar ? (
                            <LayoutFooter>
                              <Center>
                                {/* Padding of one step, and the controls
                                inside round to the card's radius less that
                                step — see styles.toolBarControl. */}
                                <Card padding={1} elevation="high">
                                  <Toolbar
                                    label="Canvas tools"
                                    size="sm"
                                    startContent={
                                      <>
                                        <IconButton
                                          label="Undo"
                                          tooltip="Undo"
                                          variant="ghost"
                                          icon={
                                            <Icon icon={Undo2} size={ICON} />
                                          }
                                          xstyle={styles.toolBarControl}
                                        />
                                        <IconButton
                                          label="Redo"
                                          tooltip="Redo"
                                          variant="ghost"
                                          icon={
                                            <Icon icon={Redo2} size={ICON} />
                                          }
                                          xstyle={styles.toolBarControl}
                                        />
                                        <Divider
                                          orientation="vertical"
                                          xstyle={styles.toolBarRule}
                                        />
                                        <IconButton
                                          label="Add frame"
                                          tooltip="Add frame"
                                          variant="ghost"
                                          icon={
                                            <Icon icon={Frame} size={ICON} />
                                          }
                                          xstyle={styles.toolBarControl}
                                        />
                                        <IconButton
                                          label="Add text"
                                          tooltip="Add text"
                                          variant="ghost"
                                          icon={
                                            <Icon icon={Type} size={ICON} />
                                          }
                                          xstyle={styles.toolBarControl}
                                        />
                                        <IconButton
                                          label="Add image"
                                          tooltip="Add image"
                                          variant="ghost"
                                          icon={
                                            <Icon
                                              icon={ImageIcon}
                                              size={ICON}
                                            />
                                          }
                                          xstyle={styles.toolBarControl}
                                        />
                                        <Divider
                                          orientation="vertical"
                                          xstyle={styles.toolBarRule}
                                        />
                                        <Selector
                                          label="Zoom"
                                          isLabelHidden
                                          variant="ghost"
                                          value={zoom}
                                          onChange={setZoom}
                                          options={ZOOM_OPTIONS}
                                          placement="above"
                                          width={92}
                                          xstyle={styles.toolBarControl}
                                        />
                                      </>
                                    }
                                  />
                                </Card>
                              </Center>
                            </LayoutFooter>
                          ) : undefined
                        }
                      />
                    </Section>
                  </LayoutContent>
                }
                end={
                  chrome.right ? (
                    <>
                      <ResizeHandle
                        resizable={inspector.props}
                        isReversed
                        isAlwaysVisible={false}
                        label="Resize properties panel"
                      />
                      <LayoutPanel
                        resizable={inspector.props}
                        hasDivider
                        padding={0}
                        isScrollable
                        label={`${selected.name} properties`}>
                        <InspectorSection title="Layout">
                          <InspectorRow label="Padding">
                            <AxisInput
                              icon={GLYPH.padding}
                              label="Padding"
                              value={selected.padding}
                              onChange={next => updateSelected({padding: next})}
                            />
                            <IconButton
                              label="Set padding per side"
                              tooltip="Per side"
                              size="sm"
                              variant="ghost"
                              icon={<Icon icon={SquareDashed} size={ICON} />}
                            />
                          </InspectorRow>
                        </InspectorSection>

                        <InspectorSection title="Layer">
                          <InspectorRow label="Position">
                            <AxisInput
                              icon={GLYPH.x}
                              label="Horizontal position"
                              value={selected.x}
                              onChange={next => updateSelected({x: next})}
                            />
                            <AxisInput
                              icon={GLYPH.y}
                              label="Vertical position"
                              value={selected.y}
                              onChange={next => updateSelected({y: next})}
                            />
                          </InspectorRow>
                          <InspectorRow label="Size">
                            <AxisInput
                              icon={GLYPH.width}
                              label="Width"
                              value={selected.width}
                              onChange={next => updateSelected({width: next})}
                            />
                            <AxisInput
                              icon={GLYPH.height}
                              label="Height"
                              value={selected.height}
                              onChange={next => updateSelected({height: next})}
                            />
                          </InspectorRow>
                        </InspectorSection>

                        <InspectorSection title="Styles">
                          <InspectorRow label="Radius">
                            <AxisInput
                              icon={GLYPH.radius}
                              label="Corner radius"
                              value={selected.radius}
                              onChange={next => updateSelected({radius: next})}
                            />
                            <IconButton
                              label="Set radius per corner"
                              tooltip="Per corner"
                              size="sm"
                              variant="ghost"
                              icon={<Icon icon={SquareDashed} size={ICON} />}
                            />
                          </InspectorRow>
                          <StyleRow label="Border" value="0" placeholder="0" />
                          <StyleRow label="Shadow" placeholder="Add…" />
                          <StyleRow label="Fill" placeholder="Add…" />
                        </InspectorSection>

                        <InspectorSection title="Transforms">
                          <InspectorRow label="Rotate">
                            <AxisInput
                              icon={GLYPH.rotation}
                              label="Rotation"
                              value={selected.rotation}
                              onChange={next =>
                                updateSelected({rotation: next})
                              }
                            />
                            <IconButton
                              label="Rotate counterclockwise"
                              tooltip="−90°"
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                updateSelected({
                                  rotation: (selected.rotation + 270) % 360,
                                })
                              }
                              icon={<Icon icon={RotateCcw} size={ICON} />}
                            />
                            <IconButton
                              label="Rotate clockwise"
                              tooltip="+90°"
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                updateSelected({
                                  rotation: (selected.rotation + 90) % 360,
                                })
                              }
                              icon={<Icon icon={RotateCw} size={ICON} />}
                            />
                          </InspectorRow>
                          <InspectorRow label="Flip" hAlign="end">
                            <IconButton
                              label="Flip horizontally"
                              tooltip="Flip horizontally"
                              size="sm"
                              variant="ghost"
                              icon={<Icon icon={FlipHorizontal} size={ICON} />}
                            />
                            <IconButton
                              label="Flip vertically"
                              tooltip="Flip vertically"
                              size="sm"
                              variant="ghost"
                              icon={<Icon icon={FlipVertical} size={ICON} />}
                            />
                          </InspectorRow>
                        </InspectorSection>

                        {selected.kind === 'text' ? (
                          <InspectorSection title="Text">
                            <TextArea
                              label="Content"
                              isLabelHidden
                              size="sm"
                              rows={2}
                              value={selected.content}
                              onChange={next => updateSelected({content: next})}
                            />
                            <InspectorRow label="Font">
                              <StackItem size="fill">
                                <Selector
                                  label="Font family"
                                  isLabelHidden
                                  size="sm"
                                  value={selected.family}
                                  onChange={next =>
                                    updateSelected({family: next})
                                  }
                                  options={FONT_OPTIONS}
                                />
                              </StackItem>
                            </InspectorRow>
                            <InspectorRow label="Weight">
                              <StackItem size="fill">
                                <Selector
                                  label="Font weight"
                                  isLabelHidden
                                  size="sm"
                                  value={selected.weight}
                                  onChange={next =>
                                    updateSelected({weight: next})
                                  }
                                  options={WEIGHT_OPTIONS}
                                />
                              </StackItem>
                            </InspectorRow>
                            <InspectorRow label="Size">
                              <AxisInput
                                icon={GLYPH.fontSize}
                                label="Font size"
                                value={selected.size ?? 0}
                                onChange={next => updateSelected({size: next})}
                              />
                              <AxisInput
                                icon={GLYPH.tracking}
                                label="Letter spacing"
                                value={selected.tracking ?? 0}
                                onChange={next =>
                                  updateSelected({tracking: next})
                                }
                              />
                            </InspectorRow>
                          </InspectorSection>
                        ) : (
                          <InspectorSection title="Image">
                            <InspectorRow label="Source">
                              <Text maxLines={1}>{selected.name}.png</Text>
                            </InspectorRow>
                            <InspectorRow label="Fit">
                              <StackItem size="fill">
                                <Selector
                                  label="Image fit"
                                  isLabelHidden
                                  size="sm"
                                  value="Cover"
                                  options={['Cover', 'Contain', 'Fill']}
                                />
                              </StackItem>
                            </InspectorRow>
                            <Button
                              label="Replace image"
                              size="sm"
                              variant="secondary"
                            />
                          </InspectorSection>
                        )}
                      </LayoutPanel>
                    </>
                  ) : undefined
                }
              />
            </LayoutContent>
          }
        />
      </Section>
    </Theme>
  );
}
