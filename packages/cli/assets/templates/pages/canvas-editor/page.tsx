// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useCallback, useState} from 'react';
import * as stylex from '@stylexjs/stylex';

import {AspectRatio} from '@astryxdesign/core/AspectRatio';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Center} from '@astryxdesign/core/Center';
import {Divider} from '@astryxdesign/core/Divider';
import {DropdownMenu} from '@astryxdesign/core/DropdownMenu';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {InputGroup, InputGroupText} from '@astryxdesign/core/InputGroup';
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
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ArrowsRightLeftIcon,
  ArrowsUpDownIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  Bars3BottomLeftIcon,
  LockClosedIcon,
  PhotoIcon,
  RectangleGroupIcon,
  Square3Stack3DIcon,
  SwatchIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

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

const PHOTO_LAYER_SRC = '/template-assets/moody-scene-vertical-1.png';

type LayerKind = 'text' | 'image';

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

const LAYER_ICON = {text: Bars3BottomLeftIcon, image: PhotoIcon} as const;

const ZOOM_OPTIONS = [
  {value: '0.25', label: '25%'},
  {value: '0.4', label: '40%'},
  {value: '0.6', label: '60%'},
  {value: '1', label: '100%'},
];

const FONT_OPTIONS = ['Anton', 'Archivo Black', 'Bebas Neue', 'Inter Tight'];
const WEIGHT_OPTIONS = ['Regular', 'Medium', 'Semibold', 'Bold'];

const FILE_MENU = [
  {label: 'New artboard'},
  {label: 'Duplicate artboard'},
  {type: 'divider' as const},
  {label: 'Import image…'},
  {label: 'Reset canvas', variant: 'destructive' as const},
];

const EXPORT_MENU = [
  {label: 'PNG · 1080 × 1920'},
  {label: 'JPG · 1080 × 1920'},
  {label: 'PDF · print ready'},
];

// =============================================================================
// Styles
// =============================================================================

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
  // Card rounds to --radius-container; the canvas tool bar is a pill.
  toolPill: {borderRadius: 'var(--radius-full)'},
});

// =============================================================================
// Panel building blocks
// =============================================================================

/** One inspector row: a fixed label column, then the controls for it. */
function InspectorRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <HStack gap={3} vAlign="center">
      <HStack width={62}>
        <Text type="supporting" color="secondary" maxLines={1}>
          {label}
        </Text>
      </HStack>
      <StackItem size="fill">
        <HStack gap={1.5} vAlign="center">
          {children}
        </HStack>
      </StackItem>
    </HStack>
  );
}

/** A numeric field carrying its axis letter as a prefix addon, like X 40. */
function AxisInput({
  axis,
  label,
  value,
  onChange,
}: {
  axis: string;
  label: string;
  value: number;
  onChange: (next: number) => void;
}) {
  return (
    <StackItem size="fill">
      {/* InputGroup announces its own label plus the inner one, so the inner
          label is the axis letter: "Horizontal position X", not a stutter. */}
      <InputGroup label={label} isLabelHidden size="sm">
        <InputGroupText>{axis}</InputGroupText>
        <NumberInput
          label={axis}
          isLabelHidden
          value={value}
          onChange={onChange}
          isWheelEnabled={false}
        />
      </InputGroup>
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
 * A style slot that is either unset or carries a value plus a colour: a value
 * field, a swatch that opens the picker, and a clear.
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
        <InputGroup label={label} isLabelHidden size="sm">
          <TextInput
            label="Value"
            isLabelHidden
            value={value ?? ''}
            placeholder={placeholder}
          />
          <IconButton
            label={`Pick ${label.toLowerCase()} colour`}
            tooltip="Pick colour"
            size="sm"
            variant="ghost"
            icon={<Icon icon={SwatchIcon} />}
          />
        </InputGroup>
      </StackItem>
      <IconButton
        label={`Clear ${label.toLowerCase()}`}
        tooltip="Clear"
        size="sm"
        isDisabled={value === undefined}
        icon={<Icon icon={XMarkIcon} />}
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

  return (
    <Layout
      height="fill"
      padding={0}
      header={
        <Toolbar
          label="Document actions"
          size="sm"
          dividers={['bottom']}
          startContent={
            <DropdownMenu
              button={{label: 'Menu', variant: 'secondary', size: 'sm'}}
              items={FILE_MENU}
            />
          }
          endContent={
            <>
              <Text type="supporting" color="secondary">
                Saved · 2 min ago
              </Text>
              <DropdownMenu
                button={{
                  label: 'Export',
                  variant: 'primary',
                  size: 'sm',
                  icon: <Icon icon={ArrowDownTrayIcon} size="xsm" />,
                }}
                alignment="end"
                items={EXPORT_MENU}
              />
            </>
          }
        />
      }
      content={
        <LayoutContent padding={0}>
          <Layout
            height="fill"
            start={
              <LayoutPanel
                width={216}
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
                    <SegmentedControlItem label="Layers" value="layers" />
                    <SegmentedControlItem label="Library" value="library" />
                  </SegmentedControl>
                  {panel === 'layers' ? (
                    <List density="compact">
                      {layers.map(layer => (
                        <ListItem
                          key={layer.id}
                          label={layer.name}
                          isSelected={layer.id === selectedID}
                          onClick={() => setSelectedID(layer.id)}
                          startContent={
                            <Icon icon={LAYER_ICON[layer.kind]} size="xsm" />
                          }
                          endContent={
                            layer.isLocked ? (
                              <Icon
                                icon={LockClosedIcon}
                                size="xsm"
                                color="secondary"
                              />
                            ) : undefined
                          }
                        />
                      ))}
                    </List>
                  ) : (
                    <List density="compact">
                      {['Grain overlay', 'Halftone', 'Duotone teal'].map(
                        preset => (
                          <ListItem
                            key={preset}
                            label={preset}
                            startContent={<Icon icon={SwatchIcon} size="xsm" />}
                          />
                        ),
                      )}
                    </List>
                  )}
                </VStack>
              </LayoutPanel>
            }
            content={
              <LayoutContent padding={0}>
                <Section variant="muted" padding={0} height="100%">
                  <Layout
                    height="fill"
                    content={
                      <LayoutContent padding={6}>
                        <Center>
                          <Card
                            padding={0}
                            elevation="med"
                            width={FRAME.width * scale}
                            height={FRAME.height * scale}>
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
                      <LayoutFooter>
                        <Center>
                          <Card
                            padding={1}
                            elevation="high"
                            xstyle={styles.toolPill}>
                            <Toolbar
                              label="Canvas tools"
                              size="sm"
                              startContent={
                                <>
                                  <IconButton
                                    label="Undo"
                                    tooltip="Undo"
                                    variant="ghost"
                                    icon={<Icon icon={ArrowUturnLeftIcon} />}
                                  />
                                  <IconButton
                                    label="Redo"
                                    tooltip="Redo"
                                    variant="ghost"
                                    icon={<Icon icon={ArrowUturnRightIcon} />}
                                  />
                                  <Divider orientation="vertical" />
                                  <IconButton
                                    label="Add frame"
                                    tooltip="Add frame"
                                    variant="ghost"
                                    icon={<Icon icon={RectangleGroupIcon} />}
                                  />
                                  <IconButton
                                    label="Add text"
                                    tooltip="Add text"
                                    variant="ghost"
                                    icon={<Icon icon={Bars3BottomLeftIcon} />}
                                  />
                                  <IconButton
                                    label="Add image"
                                    tooltip="Add image"
                                    variant="ghost"
                                    icon={<Icon icon={PhotoIcon} />}
                                  />
                                  <Divider orientation="vertical" />
                                  <Selector
                                    label="Zoom"
                                    isLabelHidden
                                    variant="ghost"
                                    value={zoom}
                                    onChange={setZoom}
                                    options={ZOOM_OPTIONS}
                                    placement="above"
                                    width={92}
                                  />
                                </>
                              }
                            />
                          </Card>
                        </Center>
                      </LayoutFooter>
                    }
                  />
                </Section>
              </LayoutContent>
            }
            end={
              <LayoutPanel
                width={272}
                hasDivider
                padding={0}
                isScrollable
                label={`${selected.name} properties`}>
                <InspectorSection title="Layout">
                  <InspectorRow label="Padding">
                    <AxisInput
                      axis="P"
                      label="Padding"
                      value={selected.padding}
                      onChange={next => updateSelected({padding: next})}
                    />
                    <IconButton
                      label="Set padding per side"
                      tooltip="Per side"
                      size="sm"
                      icon={<Icon icon={Square3Stack3DIcon} />}
                    />
                  </InspectorRow>
                </InspectorSection>

                <InspectorSection title="Layer">
                  <InspectorRow label="Position">
                    <AxisInput
                      axis="X"
                      label="Horizontal position"
                      value={selected.x}
                      onChange={next => updateSelected({x: next})}
                    />
                    <AxisInput
                      axis="Y"
                      label="Vertical position"
                      value={selected.y}
                      onChange={next => updateSelected({y: next})}
                    />
                  </InspectorRow>
                  <InspectorRow label="Size">
                    <AxisInput
                      axis="W"
                      label="Width"
                      value={selected.width}
                      onChange={next => updateSelected({width: next})}
                    />
                    <AxisInput
                      axis="H"
                      label="Height"
                      value={selected.height}
                      onChange={next => updateSelected({height: next})}
                    />
                  </InspectorRow>
                </InspectorSection>

                <InspectorSection title="Styles">
                  <InspectorRow label="Radius">
                    <AxisInput
                      axis="R"
                      label="Corner radius"
                      value={selected.radius}
                      onChange={next => updateSelected({radius: next})}
                    />
                    <IconButton
                      label="Set radius per corner"
                      tooltip="Per corner"
                      size="sm"
                      icon={<Icon icon={Square3Stack3DIcon} />}
                    />
                  </InspectorRow>
                  <StyleRow label="Border" value="0" placeholder="0" />
                  <StyleRow label="Shadow" placeholder="Add…" />
                  <StyleRow label="Fill" placeholder="Add…" />
                </InspectorSection>

                <InspectorSection title="Transforms">
                  <InspectorRow label="Rotate">
                    <AxisInput
                      axis="°"
                      label="Rotation"
                      value={selected.rotation}
                      onChange={next => updateSelected({rotation: next})}
                    />
                    <IconButton
                      label="Rotate 90° clockwise"
                      tooltip="Rotate 90°"
                      size="sm"
                      onClick={() =>
                        updateSelected({
                          rotation: (selected.rotation + 90) % 360,
                        })
                      }
                      icon={<Icon icon={ArrowPathIcon} />}
                    />
                  </InspectorRow>
                  <InspectorRow label="Flip">
                    <IconButton
                      label="Flip horizontally"
                      tooltip="Flip horizontally"
                      size="sm"
                      icon={<Icon icon={ArrowsRightLeftIcon} />}
                    />
                    <IconButton
                      label="Flip vertically"
                      tooltip="Flip vertically"
                      size="sm"
                      icon={<Icon icon={ArrowsUpDownIcon} />}
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
                          onChange={next => updateSelected({family: next})}
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
                          onChange={next => updateSelected({weight: next})}
                          options={WEIGHT_OPTIONS}
                        />
                      </StackItem>
                    </InspectorRow>
                    <InspectorRow label="Size">
                      <AxisInput
                        axis="Aa"
                        label="Font size"
                        value={selected.size ?? 0}
                        onChange={next => updateSelected({size: next})}
                      />
                      <AxisInput
                        axis="AV"
                        label="Letter spacing"
                        value={selected.tracking ?? 0}
                        onChange={next => updateSelected({tracking: next})}
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
            }
          />
        </LayoutContent>
      }
    />
  );
}
