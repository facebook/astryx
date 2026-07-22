// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Sheet} from '@astryxdesign/core/Sheet';
import {Button} from '@astryxdesign/core/Button';
import {Text} from '@astryxdesign/core/Text';
import {
  Layout,
  LayoutContent,
  LayoutFooter,
  VStack,
} from '@astryxdesign/core/Layout';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  wrapper: {
    padding: 24,
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
  },
  wide: {
    minWidth: 200,
  },
  sheetContent: {
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  todoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  todoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 6,
    cursor: 'pointer',
  },
});

const meta: Meta<typeof Sheet> = {
  title: 'Core/Sheet',
  component: Sheet,
  tags: ['autodocs'],
  argTypes: {
    side: {
      control: 'select',
      options: ['start', 'end', 'top', 'bottom'],
      description: 'Which edge the sheet slides from',
    },
    hasScrim: {
      control: 'boolean',
      description: 'Whether to render a modal scrim',
    },
    hasDragHandle: {
      control: 'boolean',
      description: 'Opt-in mobile swipe-to-dismiss (bottom/top only)',
    },
    size: {
      control: 'text',
      description:
        'Size budget along the slide axis (number = px, string = CSS)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Sheet>;

/**
 * Modal bottom sheet with a drag handle for mobile swipe-to-dismiss.
 */
function BottomSheetExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        label="Open filters"
        variant="secondary"
        onClick={() => setIsOpen(true)}
      />
      <Sheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        label="Filters"
        side="bottom"
        size="40dvh"
        hasDragHandle>
        <Layout
          header={null}
          content={
            <LayoutContent>
              <div {...stylex.props(styles.sheetContent)}>
                <Text type="heading" element="h3">
                  Filter options
                </Text>
                <Text type="body">
                  Swipe the handle above or press Escape to close. On mobile,
                  drag the handle downward to dismiss.
                </Text>
              </div>
            </LayoutContent>
          }
          footer={
            <LayoutFooter hasDivider>
              <Button
                label="Apply"
                variant="primary"
                onClick={() => setIsOpen(false)}
              />
              <Button
                label="Cancel"
                variant="secondary"
                onClick={() => setIsOpen(false)}
              />
            </LayoutFooter>
          }
        />
      </Sheet>
    </>
  );
}

export const BottomSheet: Story = {
  render: () => <BottomSheetExample />,
  name: 'Bottom sheet with drag handle',
};

/**
 * Modal side panel (end/right edge) — the inspector convention.
 */
function InspectorExample() {
  const [selected, setSelected] = useState<number | null>(null);
  const items = [
    {id: 1, name: 'Host us-east-1', status: 'OK'},
    {id: 2, name: 'Host us-west-2', status: 'Degraded'},
    {id: 3, name: 'Host eu-central-1', status: 'OK'},
    {id: 4, name: 'Host ap-southeast-1', status: 'Down'},
  ];

  return (
    <div {...stylex.props(styles.wrapper)}>
      <div {...stylex.props(styles.todoList)} role="listbox" aria-label="Hosts">
        {items.map(item => (
          <div
            key={item.id}
            role="option"
            aria-selected={selected === item.id}
            onClick={() => setSelected(item.id)}
            {...stylex.props(styles.todoItem, {
              ':hover': {backgroundColor: 'var(--color-background-muted)'},
            })}>
            <Text type="body">
              <strong>{item.name}</strong>
              {' — '}
              {item.status}
            </Text>
          </div>
        ))}
      </div>
      <Sheet
        isOpen={selected != null}
        onClose={() => setSelected(null)}
        label={`Details: ${items.find(i => i.id === selected)?.name ?? ''}`}>
        <Layout
          header={null}
          content={
            <LayoutContent>
              <div {...stylex.props(styles.sheetContent)}>
                {selected != null && (
                  <>
                    <Text type="heading" element="h3">
                      {items.find(i => i.id === selected)?.name}
                    </Text>
                    <Text type="body">
                      Status: {items.find(i => i.id === selected)?.status}
                    </Text>
                    <Text type="body" color="secondary">
                      Detailed information about this host would appear here.
                      Click another row or press Escape to switch selection.
                    </Text>
                  </>
                )}
              </div>
            </LayoutContent>
          }
        />
      </Sheet>
    </div>
  );
}

export const Inspector: Story = {
  render: () => <InspectorExample />,
  name: 'Side inspector panel (end)',
};

/**
 * Non-modal side panel — master-detail flow.
 */
function NonModalExample() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div {...stylex.props(styles.wrapper)}>
      <div {...stylex.props(styles.wide)}>
        <Text type="heading" element="h3">
          Detail view
        </Text>
        <Text type="body">
          This page stays interactive while the side panel is open (non-modal,
          hasScrim=false). Try clicking buttons and interacting with this area.
        </Text>
        <div>
          <Button
            label={isOpen ? 'Close panel' : 'Open panel'}
            variant="secondary"
            onClick={() => setIsOpen(!isOpen)}
          />
        </div>
      </div>
      <Sheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        label="Detail view"
        hasScrim={false}
        size={320}>
        <Layout
          header={null}
          content={
            <LayoutContent>
              <div {...stylex.props(styles.sheetContent)}>
                <Text type="heading" element="h3">
                  Entity details
                </Text>
                <Text type="body">
                  This non-modal panel keeps the page interactive. Click outside
                  or use the close button to dismiss.
                </Text>
              </div>
            </LayoutContent>
          }
        />
      </Sheet>
    </div>
  );
}

export const NonModal: Story = {
  render: () => <NonModalExample />,
  name: 'Non-modal side panel',
};

/**
 * Top sheet (full-width banner).
 */
function TopSheetExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        label="Show notification bar"
        variant="secondary"
        onClick={() => setIsOpen(true)}
      />
      <Sheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        label="Notifications"
        side="top"
        size={160}>
        <Layout
          header={null}
          content={
            <LayoutContent>
              <div {...stylex.props(styles.sheetContent)}>
                <Text type="heading" element="h3">
                  Notifications
                </Text>
                <Text type="body">
                  This top sheet slides down from the top edge. Useful for
                  notification bars, banners, or quick-access controls.
                </Text>
              </div>
            </LayoutContent>
          }
        />
      </Sheet>
    </>
  );
}

export const TopSheet: Story = {
  render: () => <TopSheetExample />,
  name: 'Top sheet (full-width)',
};

/**
 * Stacked sheets — rendered as siblings, not nested.
 */
function StackedExample() {
  const [outerOpen, setOuterOpen] = useState(false);
  const [innerOpen, setInnerOpen] = useState(false);

  return (
    <>
      <div {...stylex.props(styles.wrapper)}>
        <Button
          label="Open outer sheet"
          variant="secondary"
          onClick={() => setOuterOpen(true)}
        />
        <Button
          label="Open inner sheet"
          variant="secondary"
          onClick={() => setInnerOpen(true)}
        />
      </div>
      <Sheet
        isOpen={outerOpen}
        onClose={() => setOuterOpen(false)}
        label="Outer"
        hasScrim={false}
        size={360}>
        <Layout
          header={null}
          content={
            <LayoutContent>
              <div {...stylex.props(styles.sheetContent)}>
                <Text type="heading" element="h3">
                  Outer sheet
                </Text>
                <Text type="body">
                  This is the outer sheet. Open the inner sheet to see stacking.
                  Escape closes the top-most sheet first.
                </Text>
              </div>
            </LayoutContent>
          }
        />
      </Sheet>
      <Sheet
        isOpen={innerOpen}
        onClose={() => setInnerOpen(false)}
        label="Inner"
        hasScrim={false}
        size={320}>
        <Layout
          header={null}
          content={
            <LayoutContent>
              <div {...stylex.props(styles.sheetContent)}>
                <Text type="heading" element="h3">
                  Inner sheet
                </Text>
                <Text type="body">
                  Last-opened stacks on top. Press Escape to close me first.
                </Text>
              </div>
            </LayoutContent>
          }
        />
      </Sheet>
    </>
  );
}

export const Stacked: Story = {
  render: () => <StackedExample />,
  name: 'Stacked sheets (siblings)',
};
