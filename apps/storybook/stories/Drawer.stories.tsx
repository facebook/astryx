// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {useState} from 'react';
import {Drawer} from '@astryxdesign/lab';
import {Button} from '@astryxdesign/core/Button';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Divider} from '@astryxdesign/core/Divider';
import {Heading} from '@astryxdesign/core/Heading';
import {Section} from '@astryxdesign/core/Section';
import {VStack, HStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';

const meta: Meta<typeof Drawer> = {
  title: 'Lab/Drawer',
  component: Drawer,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: [
          'A side panel that **floats above** page content — it overlays the',
          'layout instead of reflowing it, which is what separates a drawer',
          'from a docked panel.',
          '',
          '- Anchors to the **inline start or end** edge only (left/right in',
          '  LTR); block-axis sheets are `BottomSheet`.',
          '- Works on **desktop and touch**: `width` is the desktop budget',
          '  budget, and below 640px the panel preserves a 56px reveal',
          '  without exceeding that budget (`isFullWidthOnMobile` makes it',
          '  edge to edge).',
          '- **Scrim optional**: modal with a scrim by default, or',
          '  `hasScrim={false}` for a non-modal overlay that leaves the page',
          '  behind interactive.',
          '- **Square corners** (0px radius) — the panel is flush with three',
          '  viewport edges.',
        ].join('\n'),
      },
    },
  },
  decorators: [
    Story => (
      <div style={{width: 560, minHeight: 360, padding: 32}}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Drawer>;

const HOSTS = [
  {id: 'web-01', region: 'us-east-1', status: 'Healthy', cpu: '32%'},
  {id: 'web-02', region: 'us-east-1', status: 'Healthy', cpu: '41%'},
  {id: 'worker-01', region: 'eu-west-1', status: 'Degraded', cpu: '87%'},
];

const REGIONS = ['us-east-1', 'eu-west-1', 'ap-south-1'];

export const Showcase: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button label="Open inspector" onClick={() => setIsOpen(true)} />
        <Drawer
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          label="Deployment details"
          width={400}>
          <Section padding={4}>
            <VStack gap={4}>
              <VStack gap={1}>
                <Heading level={3}>web-prod-04</Heading>
                <Text type="supporting" color="secondary">
                  us-east-1, deployed 12 min ago
                </Text>
              </VStack>
              <Divider />
              <VStack gap={2}>
                <Text type="label">Status</Text>
                <Text type="body">
                  Healthy - all 6 instances passing readiness checks.
                </Text>
              </VStack>
              <VStack gap={2}>
                <Text type="label">Build</Text>
                <Text type="body">#4821 - main @ 03536f1</Text>
              </VStack>
            </VStack>
          </Section>
        </Drawer>
      </>
    );
  },
};

export const RowInspector: Story = {
  render: () => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const selected = HOSTS.find(host => host.id === selectedId);
    return (
      <>
        <VStack gap={1}>
          {HOSTS.map(host => (
            <Button
              key={host.id}
              variant="ghost"
              label={`${host.id} / ${host.region}`}
              onClick={() => setSelectedId(host.id)}
            />
          ))}
        </VStack>
        <Drawer
          isOpen={selected != null}
          onOpenChange={isOpen => !isOpen && setSelectedId(null)}
          label={selected ? `Host details: ${selected.id}` : 'Host details'}
          hasScrim={false}
          width={360}>
          {selected != null && (
            <Section padding={4}>
              <VStack gap={4}>
                <VStack gap={1}>
                  <Heading level={3}>{selected.id}</Heading>
                  <Text type="supporting" color="secondary">
                    {selected.region}
                  </Text>
                </VStack>
                <Divider />
                <VStack gap={2}>
                  <Text type="label">Status</Text>
                  <Text type="body">{selected.status}</Text>
                  <Text type="label">CPU</Text>
                  <Text type="body">{selected.cpu}</Text>
                </VStack>
                <Button
                  label="Close inspector"
                  variant="secondary"
                  onClick={() => setSelectedId(null)}
                />
              </VStack>
            </Section>
          )}
        </Drawer>
      </>
    );
  },
};

/**
 * Both edges. `side="start"` is left in LTR (and right in RTL) — use it for
 * navigation-adjacent content; `end` is the inspector convention.
 */
export const Sides: Story = {
  render: () => {
    const [side, setSide] = useState<'start' | 'end' | null>(null);
    return (
      <>
        <HStack gap={2}>
          <Button label="Open from start" onClick={() => setSide('start')} />
          <Button label="Open from end" onClick={() => setSide('end')} />
        </HStack>
        <Drawer
          isOpen={side != null}
          onOpenChange={isOpen => !isOpen && setSide(null)}
          label={`Filters (${side ?? 'end'})`}
          side={side ?? 'end'}>
          <Section padding={4}>
            <VStack gap={4}>
              <Heading level={3}>Filter by region</Heading>
              <Text type="supporting" color="secondary">
                Sliding in from the {side} edge.
              </Text>
            </VStack>
          </Section>
        </Drawer>
      </>
    );
  },
};

/**
 * `width` is the desktop budget: a number of pixels or any CSS length.
 * Narrow the browser below 640px: each width remains an upper bound while
 * the drawer preserves a 56px reveal of the page behind.
 */
export const Widths: Story = {
  render: () => {
    const [width, setWidth] = useState<number | string | null>(null);
    return (
      <>
        <HStack gap={2}>
          <Button label="320px" onClick={() => setWidth(320)} />
          <Button label="480px" onClick={() => setWidth(480)} />
          <Button label="50%" onClick={() => setWidth('50%')} />
        </HStack>
        <Drawer
          isOpen={width != null}
          onOpenChange={isOpen => !isOpen && setWidth(null)}
          label="Details"
          width={width ?? 400}>
          <Section padding={4}>
            <VStack gap={4}>
              <Heading level={3}>web-prod-04</Heading>
              <Text type="body">Desktop width budget: {String(width)}</Text>
            </VStack>
          </Section>
        </Drawer>
      </>
    );
  },
};

/**
 * On touch viewports (below 640px) the drawer preserves a 56px reveal of the
 * page behind without exceeding its width budget; `isFullWidthOnMobile` makes
 * it edge to edge. Resize the preview below 640px to compare.
 */
export const MobileWidth: Story = {
  render: () => {
    const [openFull, setOpenFull] = useState(false);
    const [openPartial, setOpenPartial] = useState(false);
    const [selected, setSelected] = useState<string[]>(REGIONS.slice(0, 1));
    const filters = (
      <Section padding={4}>
        <VStack gap={4}>
          <VStack gap={1}>
            <Heading level={3}>Filter by region</Heading>
            <Text type="supporting" color="secondary">
              Showing hosts in {selected.length} of {REGIONS.length} regions
            </Text>
          </VStack>
          <VStack gap={2}>
            {REGIONS.map(region => (
              <CheckboxInput
                key={region}
                label={region}
                value={selected.includes(region)}
                onChange={checked =>
                  setSelected(current =>
                    checked
                      ? [...current, region]
                      : current.filter(r => r !== region),
                  )
                }
              />
            ))}
          </VStack>
          <Button
            label="Apply filters"
            onClick={() => {
              setOpenFull(false);
              setOpenPartial(false);
            }}
            data-autofocus
          />
        </VStack>
      </Section>
    );
    return (
      <>
        <HStack gap={2}>
          <Button
            label="56px reveal on mobile"
            onClick={() => setOpenPartial(true)}
          />
          <Button
            label="Full width on mobile"
            variant="secondary"
            onClick={() => setOpenFull(true)}
          />
        </HStack>
        <Drawer
          isOpen={openPartial}
          onOpenChange={setOpenPartial}
          label="Region filters">
          {filters}
        </Drawer>
        <Drawer
          isOpen={openFull}
          onOpenChange={setOpenFull}
          label="Region filters (full width)"
          isFullWidthOnMobile>
          {filters}
        </Drawer>
      </>
    );
  },
};

/**
 * A drawer floats above the page: the content underneath keeps its layout
 * and never reflows to make room, which is the difference between a drawer
 * and a docked panel. Compare the text column with the drawer open and
 * closed — nothing behind it moves.
 */
export const FloatsOverContent: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <VStack gap={3}>
          <Button
            label={isOpen ? 'Close drawer' : 'Open drawer'}
            onClick={() => setIsOpen(open => !open)}
          />
          <Heading level={3}>Deployment log</Heading>
          {[
            'The page keeps its full width while the drawer is open.',
            'No column reflows, no content jumps, nothing is pushed aside.',
            'The drawer is painted on top and the layout underneath is',
            'untouched — which is exactly what a docked panel would not do.',
          ].map(line => (
            <Text key={line} type="body">
              {line}
            </Text>
          ))}
        </VStack>
        <Drawer
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          label="Deployment details"
          hasScrim={false}>
          <Section padding={4}>
            <VStack gap={4}>
              <Heading level={3}>web-prod-04</Heading>
              <Text type="supporting" color="secondary">
                Floating above the page, not docked beside it.
              </Text>
            </VStack>
          </Section>
        </Drawer>
      </>
    );
  },
};

/**
 * With a scrim (default) the drawer is modal: the page behind dims, focus is
 * trapped, and clicking the scrim closes it. Without one it is a plain
 * overlay — no dimming, no focus trap, and the page behind stays clickable,
 * which is what master-detail flows want.
 */
export const Scrim: Story = {
  render: () => {
    const [openWith, setOpenWith] = useState(false);
    const [openWithout, setOpenWithout] = useState(false);
    return (
      <>
        <VStack gap={3}>
          <HStack gap={2}>
            <Button label="With scrim" onClick={() => setOpenWith(true)} />
            <Button
              label="Without scrim"
              variant="secondary"
              onClick={() => setOpenWithout(true)}
            />
          </HStack>
          <Text type="supporting" color="secondary">
            These buttons stay clickable while the scrim-less drawer is open.
          </Text>
        </VStack>
        <Drawer
          isOpen={openWith}
          onOpenChange={setOpenWith}
          label="Modal details">
          <Section padding={4}>
            <VStack gap={4}>
              <Heading level={3}>Modal</Heading>
              <Text type="body">
                Scrim dims the page, focus is trapped, Escape or a scrim click
                closes.
              </Text>
            </VStack>
          </Section>
        </Drawer>
        <Drawer
          isOpen={openWithout}
          onOpenChange={setOpenWithout}
          label="Non-modal details"
          hasScrim={false}
          hasCloseButton>
          <Section padding={4}>
            <VStack gap={4}>
              <Heading level={3}>Non-modal</Heading>
              <Text type="body">
                No scrim, no focus trap. The page behind keeps working while
                this stays open.
              </Text>
            </VStack>
          </Section>
        </Drawer>
      </>
    );
  },
};
