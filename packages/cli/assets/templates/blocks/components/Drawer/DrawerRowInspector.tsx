// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Drawer} from '@astryxdesign/core/Drawer';
import {Heading} from '@astryxdesign/core/Heading';
import {Section} from '@astryxdesign/core/Section';
import {VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';

const HOSTS = [
  {id: 'web-01', region: 'us-east-1', status: 'Healthy', cpu: '32%'},
  {id: 'web-02', region: 'us-east-1', status: 'Healthy', cpu: '41%'},
  {id: 'worker-01', region: 'eu-west-1', status: 'Degraded', cpu: '87%'},
];

export default function DrawerRowInspector() {
  const [selected, setSelected] = useState(HOSTS[0]);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <VStack gap={1}>
        {HOSTS.map(host => (
          <Button
            key={host.id}
            label={`${host.id} / ${host.region}`}
            variant="ghost"
            onClick={() => {
              setSelected(host);
              setIsOpen(true);
            }}
          />
        ))}
      </VStack>
      <Drawer
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        label={`Host details: ${selected.id}`}
        hasScrim={false}
        width={360}>
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
              onClick={() => setIsOpen(false)}
            />
          </VStack>
        </Section>
      </Drawer>
    </>
  );
}
