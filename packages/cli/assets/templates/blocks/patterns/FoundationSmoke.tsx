// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file One-screen foundation smoke check, adapted from TableInCard.
 * @input Existing Button, TextInput, Card and Table APIs; the host's CSS foundation.
 * @output A labelled Button with default padding and three companion primitives.
 * @position Shipped CLI scaffold; reused by Sandbox and Storybook.
 */

import {useState} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Table, proportional, type TableColumn} from '@astryxdesign/core/Table';
import {Heading, Text} from '@astryxdesign/core/Text';
import {TextInput} from '@astryxdesign/core/TextInput';

interface Check extends Record<string, unknown> {
  id: string;
  component: string;
  purpose: string;
}

const checks: Check[] = [
  {id: 'button', component: 'Button', purpose: 'Default control padding'},
  {id: 'input', component: 'TextInput', purpose: 'Label and control spacing'},
  {id: 'card', component: 'Card', purpose: 'Container padding'},
  {id: 'table', component: 'Table', purpose: 'Header and cell spacing'},
];
const columns: TableColumn<Check>[] = [
  {key: 'component', header: 'Component', width: proportional(1)},
  {key: 'purpose', header: 'Check', width: proportional(2)},
];

export default function FoundationSmoke() {
  const [name, setName] = useState('Demo workspace');
  return (
    <VStack gap={4} data-testid="foundation-smoke">
      <Heading level={1}>Foundation smoke check</Heading>
      <Text>
        Run the browser guard before building screens. The labelled Button must
        retain non-zero padding; this is a smoke check, not a full CSS audit.
      </Text>
      <Card data-testid="foundation-smoke-card">
        <VStack gap={3}>
          <Heading level={2}>Workspace</Heading>
          <TextInput label="Workspace name" value={name} onChange={setName} />
          <HStack>
            <Button
              label="Check foundation"
              data-testid="foundation-smoke-button"
            />
          </HStack>
        </VStack>
      </Card>
      <Table data={checks} columns={columns} idKey="id" />
    </VStack>
  );
}
