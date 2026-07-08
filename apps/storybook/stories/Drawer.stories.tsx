// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {useState} from 'react';
import {Drawer} from '@astryxdesign/lab';
import {Button} from '@astryxdesign/core/Button';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Divider} from '@astryxdesign/core/Divider';
import {Heading} from '@astryxdesign/core/Heading';
import {Section} from '@astryxdesign/core/Section';
import {VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';

const meta: Meta<typeof Drawer> = {
  title: 'Lab/Drawer',
  component: Drawer,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
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
          onClose={() => setIsOpen(false)}
          label="Deployment details"
          size={400}>
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
          onClose={() => setSelectedId(null)}
          label={selected ? `Host details: ${selected.id}` : 'Host details'}
          hasScrim={false}
          size={360}>
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

export const BottomSheet: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState<string[]>(REGIONS.slice(0, 1));
    return (
      <>
        <Button label="Filter regions" onClick={() => setIsOpen(true)} />
        <Drawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          label="Region filters"
          side="bottom"
          size="40dvh">
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
                onClick={() => setIsOpen(false)}
                data-autofocus
              />
            </VStack>
          </Section>
        </Drawer>
      </>
    );
  },
};
