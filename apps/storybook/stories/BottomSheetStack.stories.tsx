// Copyright (c) Meta Platforms, Inc. and affiliates.
/**
 * @file BottomSheetStack.stories.tsx
 * @input Uses BottomSheetStack (Lab) with Core BottomSheet and
 *   BottomSheetSwitcher levels at phone width
 * @output Storybook scenarios: a drill-in with Close all, a deep link at
 *   depth 3, a switcher base with a help overlay, a list with a switcher top,
 *   a mapped file browser of unknown depth, sheets rendered anywhere in the
 *   tree (wrapper, Suspense, a row that opens its own detail sheet, a Core
 *   Dialog above the stack), and a nested stack that merges into the outer one
 * @position Lab story; stacked Core bottom sheets
 */
import {Suspense, use, useState, type ReactNode} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {BottomSheet, BottomSheetSwitcher} from '@astryxdesign/core/BottomSheet';
import {Button} from '@astryxdesign/core/Button';
import {Dialog} from '@astryxdesign/core/Dialog';
import {Divider} from '@astryxdesign/core/Divider';
import {Heading} from '@astryxdesign/core/Heading';
import {RadioList, RadioListItem} from '@astryxdesign/core/RadioList';
import {Section} from '@astryxdesign/core/Section';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';
import {TextInput} from '@astryxdesign/core/TextInput';
import {BottomSheetStack} from '@astryxdesign/lab';

const meta: Meta<typeof BottomSheetStack> = {
  title: 'Lab/BottomSheetStack',
  component: BottomSheetStack,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    viewport: {defaultViewport: 'mobile1'},
    docs: {
      story: {inline: false, height: '560px'},
    },
  },
  argTypes: {
    ref: {control: false},
    onCancel: {control: false},
  },
  decorators: [
    Story => (
      <div style={{minHeight: 480, padding: 16}}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BottomSheetStack>;

// ---------------------------------------------------------------------------
// Orders: list → order → edit, with Close all at every level
// ---------------------------------------------------------------------------

const ORDERS = [
  {id: '1042', title: 'Trail runners', status: 'Shipped'},
  {id: '1043', title: 'Rain shell', status: 'Processing'},
  {id: '1044', title: 'Wool socks ×3', status: 'Delivered'},
];

function OrdersFlow({deepLink = false}: {deepLink?: boolean}) {
  const [isListOpen, setIsListOpen] = useState(deepLink);
  const [orderId, setOrderId] = useState<string | null>(
    deepLink ? ORDERS[0].id : null,
  );
  const [isEditing, setIsEditing] = useState(deepLink);
  const [note, setNote] = useState('Leave at the side door');
  const order = ORDERS.find(entry => entry.id === orderId) ?? null;

  const closeAll = () => {
    setIsListOpen(false);
    setOrderId(null);
    setIsEditing(false);
  };

  return (
    <VStack gap={3}>
      <Heading level={2}>Orders</Heading>
      <Text type="supporting" color="secondary">
        A drill-in: the list opens an order, the order opens an editor. Each
        level is a standalone BottomSheet; Close all closes every level in one
        update.
      </Text>
      <Button
        label={deepLink ? 'Open order 1042 editor' : 'Open orders'}
        onClick={() => {
          setIsListOpen(true);
          if (deepLink) {
            setOrderId(ORDERS[0].id);
            setIsEditing(true);
          }
        }}
      />
      <BottomSheetStack>
        <BottomSheet
          isOpen={isListOpen}
          onOpenChange={setIsListOpen}
          label="Orders"
          height="hug"
          data-testid="orders-list">
          <Section padding={4}>
            <VStack gap={3}>
              <Heading level={3}>Your orders</Heading>
              <Divider />
              {ORDERS.map(entry => (
                <HStack key={entry.id} gap={2} vAlign="center">
                  <VStack gap={0.5}>
                    <Text type="label">#{entry.id}</Text>
                    <Text type="supporting" color="secondary">
                      {entry.title} · {entry.status}
                    </Text>
                  </VStack>
                  <Button
                    label="View"
                    variant="secondary"
                    size="sm"
                    onClick={() => setOrderId(entry.id)}
                  />
                </HStack>
              ))}
              <HStack gap={2} hAlign="end">
                <Button label="Close all" variant="ghost" onClick={closeAll} />
                <Button
                  label="Done"
                  variant="secondary"
                  onClick={() => setIsListOpen(false)}
                />
              </HStack>
            </VStack>
          </Section>
        </BottomSheet>
        <BottomSheet
          isOpen={order != null}
          onOpenChange={open => {
            if (!open) {
              setOrderId(null);
            }
          }}
          label={order == null ? 'Order' : `Order ${order.id}`}
          height="hug"
          data-testid="orders-detail">
          <Section padding={4}>
            <VStack gap={3}>
              <Heading level={3}>Order #{order?.id ?? ''}</Heading>
              <Text type="supporting" color="secondary">
                {order?.title} · {order?.status}
              </Text>
              <Divider />
              <Text type="body">Delivery note: {note}</Text>
              <HStack gap={2} hAlign="end">
                <Button label="Close all" variant="ghost" onClick={closeAll} />
                <Button label="Edit note" onClick={() => setIsEditing(true)} />
              </HStack>
            </VStack>
          </Section>
        </BottomSheet>
        <BottomSheet
          isOpen={isEditing}
          onOpenChange={setIsEditing}
          label="Edit delivery note"
          height="hug"
          purpose="form"
          data-testid="orders-edit">
          <Section padding={4}>
            <VStack gap={3}>
              <Heading level={3}>Edit delivery note</Heading>
              <TextInput
                label="Delivery note"
                value={note}
                onChange={setNote}
                data-autofocus
              />
              <HStack gap={2} hAlign="end">
                <Button label="Close all" variant="ghost" onClick={closeAll} />
                <Button label="Save" onClick={() => setIsEditing(false)} />
              </HStack>
            </VStack>
          </Section>
        </BottomSheet>
      </BottomSheetStack>
    </VStack>
  );
}

export const OrdersDrillIn: Story = {
  name: 'Orders drill-in with Close all',
  render: () => <OrdersFlow />,
};

export const DeepLinkDepthThree: Story = {
  name: 'Deep link at depth 3',
  render: () => <OrdersFlow deepLink />,
};

// ---------------------------------------------------------------------------
// Filters: a switcher base (categories → options) with a help overlay
// ---------------------------------------------------------------------------

function FiltersFlow() {
  const [step, setStep] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [category, setCategory] = useState('shoes');
  const [sort, setSort] = useState('newest');

  return (
    <VStack gap={3}>
      <Heading level={2}>Filters</Heading>
      <Text type="supporting" color="secondary">
        The base level is a whole BottomSheetSwitcher that keeps switching in
        place. Help is a standalone level that opens over either step.
      </Text>
      <Button label="Open filters" onClick={() => setStep('categories')} />
      <BottomSheetStack>
        <BottomSheetSwitcher activeSheet={step} onActiveSheetChange={setStep}>
          <BottomSheet
            sheetId="categories"
            label="Categories"
            height="hug"
            data-testid="filters-categories">
            <Section padding={4}>
              <VStack gap={3}>
                <Heading level={3}>Category</Heading>
                <RadioList
                  label="Category"
                  isLabelHidden
                  value={category}
                  onChange={setCategory}>
                  <RadioListItem label="Shoes" value="shoes" />
                  <RadioListItem label="Jackets" value="jackets" />
                  <RadioListItem label="Accessories" value="accessories" />
                </RadioList>
                <HStack gap={2} hAlign="end">
                  <Button
                    label="Help"
                    variant="ghost"
                    onClick={() => setIsHelpOpen(true)}
                  />
                  <Button label="Next" onClick={() => setStep('options')} />
                </HStack>
              </VStack>
            </Section>
          </BottomSheet>
          <BottomSheet
            sheetId="options"
            label="Options"
            height="hug"
            data-testid="filters-options">
            <Section padding={4}>
              <VStack gap={3}>
                <Heading level={3}>Sort</Heading>
                <RadioList
                  label="Sort"
                  isLabelHidden
                  value={sort}
                  onChange={setSort}>
                  <RadioListItem label="Newest" value="newest" />
                  <RadioListItem label="Price: low to high" value="price" />
                  <RadioListItem label="Top rated" value="rating" />
                </RadioList>
                <HStack gap={2} hAlign="end">
                  <Button
                    label="Help"
                    variant="ghost"
                    onClick={() => setIsHelpOpen(true)}
                  />
                  <Button
                    label="Back"
                    variant="secondary"
                    onClick={() => setStep('categories')}
                  />
                  <Button label="Apply" onClick={() => setStep(null)} />
                </HStack>
              </VStack>
            </Section>
          </BottomSheet>
        </BottomSheetSwitcher>
        <BottomSheet
          isOpen={isHelpOpen}
          onOpenChange={setIsHelpOpen}
          label="Help"
          height="hug"
          data-testid="filters-help">
          <Section padding={4}>
            <VStack gap={3}>
              <Heading level={3}>About filters</Heading>
              <Text type="body">
                Pick a category first, then how to sort the results. Your
                choices are kept until you apply or close the filters.
              </Text>
              <HStack gap={2} hAlign="end">
                <Button label="Got it" onClick={() => setIsHelpOpen(false)} />
              </HStack>
            </VStack>
          </Section>
        </BottomSheet>
      </BottomSheetStack>
    </VStack>
  );
}

export const FiltersSwitcherBase: Story = {
  name: 'Filters (switcher base + help overlay)',
  render: () => <FiltersFlow />,
};

// ---------------------------------------------------------------------------
// Contacts: a list with a switcher on top (edit → saved)
// ---------------------------------------------------------------------------

const CONTACTS = ['Ada Lovelace', 'Grace Hopper', 'Katherine Johnson'];

function ContactsFlow() {
  const [isListOpen, setIsListOpen] = useState(false);
  const [editStep, setEditStep] = useState<string | null>(null);
  const [contactIndex, setContactIndex] = useState(0);
  const [names, setNames] = useState(CONTACTS);
  const [draft, setDraft] = useState('');

  const startEdit = (index: number) => {
    setContactIndex(index);
    setDraft(names[index]);
    setEditStep('edit');
  };
  const save = () => {
    setNames(current =>
      current.map((name, index) => (index === contactIndex ? draft : name)),
    );
    setEditStep('saved');
  };

  return (
    <VStack gap={3}>
      <Heading level={2}>Contacts</Heading>
      <Text type="supporting" color="secondary">
        The top level is a BottomSheetSwitcher: Save replaces the editor with a
        confirmation in place, and Back returns to the list beneath.
      </Text>
      <Button label="Open contacts" onClick={() => setIsListOpen(true)} />
      <BottomSheetStack>
        <BottomSheet
          isOpen={isListOpen}
          onOpenChange={setIsListOpen}
          label="Contacts"
          height="hug"
          data-testid="contacts-list">
          <Section padding={4}>
            <VStack gap={3}>
              <Heading level={3}>Contacts</Heading>
              <Divider />
              {names.map((name, index) => (
                <HStack key={CONTACTS[index]} gap={2} vAlign="center">
                  <Text type="body">{name}</Text>
                  <Button
                    label="Edit"
                    variant="secondary"
                    size="sm"
                    onClick={() => startEdit(index)}
                  />
                </HStack>
              ))}
              <HStack gap={2} hAlign="end">
                <Button
                  label="Done"
                  variant="secondary"
                  onClick={() => setIsListOpen(false)}
                />
              </HStack>
            </VStack>
          </Section>
        </BottomSheet>
        <BottomSheetSwitcher
          activeSheet={editStep}
          onActiveSheetChange={setEditStep}>
          <BottomSheet
            sheetId="edit"
            label="Edit contact"
            height="hug"
            purpose="form"
            data-testid="contacts-edit">
            <Section padding={4}>
              <VStack gap={3}>
                <Heading level={3}>Edit contact</Heading>
                <TextInput
                  label="Name"
                  value={draft}
                  onChange={setDraft}
                  data-autofocus
                />
                <HStack gap={2} hAlign="end">
                  <Button
                    label="Cancel"
                    variant="secondary"
                    onClick={() => setEditStep(null)}
                  />
                  <Button label="Save" onClick={save} />
                </HStack>
              </VStack>
            </Section>
          </BottomSheet>
          <BottomSheet
            sheetId="saved"
            label="Saved"
            height="hug"
            data-testid="contacts-saved">
            <Section padding={4}>
              <VStack gap={3}>
                <Heading level={3}>Saved</Heading>
                <Text type="body">{draft} was updated.</Text>
                <HStack gap={2} hAlign="end">
                  <Button label="Back" onClick={() => setEditStep(null)} />
                </HStack>
              </VStack>
            </Section>
          </BottomSheet>
        </BottomSheetSwitcher>
      </BottomSheetStack>
    </VStack>
  );
}

export const ContactsSwitcherTop: Story = {
  name: 'Contacts (list + switcher top: edit → saved)',
  render: () => <ContactsFlow />,
};

// ---------------------------------------------------------------------------
// File browser: mapped children of unknown depth
// ---------------------------------------------------------------------------

interface Folder {
  name: string;
  children: Folder[];
}

const ROOT: Folder = {
  name: 'Home',
  children: [
    {
      name: 'Photos',
      children: [
        {name: 'Trips', children: [{name: 'Alps', children: []}]},
        {name: 'Family', children: []},
      ],
    },
    {
      name: 'Documents',
      children: [{name: 'Taxes', children: [{name: '2025', children: []}]}],
    },
    {name: 'Music', children: []},
  ],
};

function FileBrowserFlow() {
  // `path` is the history of visited folders; `openDepth` says how many of
  // them are open. Closed entries stay mounted until their exit finishes and
  // are replaced the next time a folder opens at that depth.
  const [path, setPath] = useState<Folder[]>([ROOT]);
  const [openDepth, setOpenDepth] = useState(0);

  const openChild = (level: number, child: Folder) => {
    setPath([...path.slice(0, level + 1), child]);
    setOpenDepth(level + 2);
  };

  return (
    <VStack gap={3}>
      <Heading level={2}>Files</Heading>
      <Text type="supporting" color="secondary">
        One mapped BottomSheet per visited folder; the stack flattens the array,
        so the depth is whatever the person browses to.
      </Text>
      <Button label="Browse files" onClick={() => setOpenDepth(1)} />
      <BottomSheetStack>
        {path.map((folder, level) => (
          <BottomSheet
            key={`${level}:${folder.name}`}
            isOpen={level < openDepth}
            onOpenChange={open => {
              if (!open) {
                setOpenDepth(level);
              }
            }}
            label={folder.name}
            height="hug"
            data-testid={`folder-${level}`}>
            <Section padding={4}>
              <VStack gap={3}>
                <Heading level={3}>{folder.name}</Heading>
                <Text type="supporting" color="secondary">
                  {path
                    .slice(0, level + 1)
                    .map(entry => entry.name)
                    .join(' / ')}
                </Text>
                <Divider />
                {folder.children.length === 0 ? (
                  <Text type="body">This folder is empty.</Text>
                ) : (
                  folder.children.map(child => (
                    <HStack key={child.name} gap={2} vAlign="center">
                      <Text type="body">{child.name}</Text>
                      <Button
                        label="Open"
                        variant="secondary"
                        size="sm"
                        onClick={() => openChild(level, child)}
                      />
                    </HStack>
                  ))
                )}
                <HStack gap={2} hAlign="end">
                  <Button
                    label="Close all"
                    variant="ghost"
                    onClick={() => setOpenDepth(0)}
                  />
                  <Button
                    label={level === 0 ? 'Done' : 'Back'}
                    variant="secondary"
                    onClick={() => setOpenDepth(level)}
                  />
                </HStack>
              </VStack>
            </Section>
          </BottomSheet>
        ))}
      </BottomSheetStack>
    </VStack>
  );
}

export const FileBrowserMapped: Story = {
  name: 'File browser (mapped, unknown depth)',
  render: () => <FileBrowserFlow />,
};

// ---------------------------------------------------------------------------
// Sheets anywhere: a wrapper with its own prop names, a Suspense boundary, a
// row that renders its own detail sheet, and a Core Dialog above the stack
// ---------------------------------------------------------------------------

const PLACES = [
  {id: 'lisbon', name: 'Lisbon', note: 'Tram 28 at dawn'},
  {id: 'kyoto', name: 'Kyoto', note: 'Philosopher’s Path'},
  {id: 'oaxaca', name: 'Oaxaca', note: 'Mercado 20 de Noviembre'},
];

/** A product component: the stack never sees its props. */
function PlacesSheet({
  shown,
  onHide,
  children,
}: {
  shown: boolean;
  onHide: () => void;
  children: ReactNode;
}) {
  return (
    <BottomSheet
      isOpen={shown}
      onOpenChange={open => {
        if (!open) {
          onHide();
        }
      }}
      label="Places"
      height="hug"
      data-testid="places-list">
      <Section padding={4}>
        <VStack gap={3}>
          <Heading level={3}>Places</Heading>
          <Divider />
          {children}
        </VStack>
      </Section>
    </BottomSheet>
  );
}

/** Each row owns its detail sheet: a level right above the list. */
function PlaceRow({place}: {place: (typeof PLACES)[number]}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  return (
    <>
      <HStack gap={2} vAlign="center">
        <Text type="label">{place.name}</Text>
        <Button
          label="Details"
          variant="secondary"
          size="sm"
          onClick={() => setIsOpen(true)}
        />
      </HStack>
      <BottomSheet
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        label={place.name}
        height="hug"
        data-testid={`place-${place.id}`}>
        <Section padding={4}>
          <VStack gap={3}>
            <Heading level={3}>{place.name}</Heading>
            <Text type="supporting" color="secondary">
              {place.note}
            </Text>
            <HStack gap={2} hAlign="end">
              <Button
                label="Remove"
                variant="secondary"
                onClick={() => setIsConfirmOpen(true)}
              />
              <Button label="Done" onClick={() => setIsOpen(false)} />
            </HStack>
          </VStack>
        </Section>
        {/* A Core Dialog opens above the stack; a sheet inside it is a
            standalone sheet above the Dialog, not a level. */}
        <Dialog
          isOpen={isConfirmOpen}
          onOpenChange={setIsConfirmOpen}
          aria-label={`Remove ${place.name}?`}
          data-testid="confirm-dialog">
          <VStack gap={3}>
            <Heading level={3}>Remove {place.name}?</Heading>
            <HStack gap={2} hAlign="end">
              <Button
                label="Why?"
                variant="secondary"
                onClick={() => setIsNoteOpen(true)}
              />
              <Button label="Keep" onClick={() => setIsConfirmOpen(false)} />
            </HStack>
          </VStack>
          <BottomSheet
            isOpen={isNoteOpen}
            onOpenChange={setIsNoteOpen}
            label="About removing"
            height="hug"
            data-testid="dialog-sheet">
            <Section padding={4}>
              <VStack gap={2}>
                <Text type="body">
                  Removing a place only hides it from this list.
                </Text>
                <Button label="Got it" onClick={() => setIsNoteOpen(false)} />
              </VStack>
            </Section>
          </BottomSheet>
        </Dialog>
      </BottomSheet>
    </>
  );
}

const tipsPromise = new Promise<string>(resolve => {
  setTimeout(
    () => resolve('Tip: swipe the handle down to close a sheet.'),
    600,
  );
});

function TipsSheet({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const tip = use(tipsPromise);
  return (
    <BottomSheet
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      label="Tips"
      height="hug"
      data-testid="tips">
      <Section padding={4}>
        <VStack gap={2}>
          <Heading level={3}>Tips</Heading>
          <Text type="body">{tip}</Text>
          <Button label="Close" onClick={() => onOpenChange(false)} />
        </VStack>
      </Section>
    </BottomSheet>
  );
}

function SheetsAnywhereFlow() {
  const [isListShown, setIsListShown] = useState(false);
  const [isTipsOpen, setIsTipsOpen] = useState(false);
  // An app-level React handler above the stack: clicks inside any level,
  // nested ones included, still reach it.
  const [clicks, setClicks] = useState(0);
  return (
    <VStack gap={3} onClick={() => setClicks(count => count + 1)}>
      <Text type="supporting" color="secondary" data-testid="click-count">
        Clicks seen above the stack: {clicks}
      </Text>
      <Heading level={2}>Sheets anywhere</Heading>
      <Text type="supporting" color="secondary">
        The list is a product component with its own prop names; each row
        renders its own detail sheet, which stacks above the list; Tips lives
        behind a Suspense boundary. Every sheet is a level, in tree order.
      </Text>
      <HStack gap={2}>
        <Button label="Open places" onClick={() => setIsListShown(true)} />
        <Button
          label="Tips"
          variant="secondary"
          onClick={() => setIsTipsOpen(true)}
        />
      </HStack>
      <BottomSheetStack>
        <PlacesSheet shown={isListShown} onHide={() => setIsListShown(false)}>
          {PLACES.map(place => (
            <PlaceRow key={place.id} place={place} />
          ))}
        </PlacesSheet>
        <Suspense fallback={null}>
          <TipsSheet isOpen={isTipsOpen} onOpenChange={setIsTipsOpen} />
        </Suspense>
      </BottomSheetStack>
    </VStack>
  );
}

export const SheetsAnywhere: Story = {
  name: 'Sheets anywhere (wrapper, Suspense, row-owned detail, Dialog above)',
  render: () => <SheetsAnywhereFlow />,
};

// ---------------------------------------------------------------------------
// Nested stack: a reusable flow that brings its own BottomSheetStack merges
// into the page's stack
// ---------------------------------------------------------------------------

/** A reusable flow shipped with its own stack, dropped into another stack. */
function ShareFlow({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  return (
    <BottomSheetStack hasScrim={false}>
      <BottomSheet
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        label="Share"
        height="hug"
        data-testid="share">
        <Section padding={4}>
          <VStack gap={3}>
            <Heading level={3}>Share</Heading>
            <Button label="Copy link" onClick={() => setIsLinkOpen(true)} />
            <Button
              label="Done"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            />
          </VStack>
        </Section>
      </BottomSheet>
      <BottomSheet
        isOpen={isLinkOpen}
        onOpenChange={setIsLinkOpen}
        label="Link copied"
        height="hug"
        data-testid="share-link">
        <Section padding={4}>
          <VStack gap={2}>
            <Text type="body">Link copied to the clipboard.</Text>
            <Button label="OK" onClick={() => setIsLinkOpen(false)} />
          </VStack>
        </Section>
      </BottomSheet>
    </BottomSheetStack>
  );
}

function NestedStackFlow() {
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  return (
    <VStack gap={3}>
      <Heading level={2}>Nested stack</Heading>
      <Text type="supporting" color="secondary">
        The Share flow ships with its own BottomSheetStack. Inside the page’s
        stack it merges: one dialog, one scrim, its sheets are levels of the
        outer stack, and its hasScrim is ignored (with a development warning).
      </Text>
      <Button label="Open photo" onClick={() => setIsPhotoOpen(true)} />
      <BottomSheetStack>
        <BottomSheet
          isOpen={isPhotoOpen}
          onOpenChange={setIsPhotoOpen}
          label="Photo"
          height="hug"
          data-testid="photo">
          <Section padding={4}>
            <VStack gap={3}>
              <Heading level={3}>Photo</Heading>
              <Text type="supporting" color="secondary">
                Taken at the coast, last spring.
              </Text>
              <HStack gap={2} hAlign="end">
                <Button
                  label="Share"
                  variant="secondary"
                  onClick={() => setIsShareOpen(true)}
                />
                <Button label="Done" onClick={() => setIsPhotoOpen(false)} />
              </HStack>
            </VStack>
          </Section>
          <ShareFlow isOpen={isShareOpen} onOpenChange={setIsShareOpen} />
        </BottomSheet>
      </BottomSheetStack>
    </VStack>
  );
}

export const NestedStackMerges: Story = {
  name: 'Nested stack merges into the outer one',
  render: () => <NestedStackFlow />,
};
