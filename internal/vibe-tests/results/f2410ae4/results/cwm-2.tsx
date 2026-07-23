// Copyright (c) Meta Platforms, Inc. and affiliates.

import React, {useState} from 'react';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {VStack} from '@astryxdesign/core/VStack';
import {HStack} from '@astryxdesign/core/HStack';
import {Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';

interface Label {
  id: string;
  name: string;
  color: string;
  description: string;
}

const LABELS: Label[] = [
  {id: '1', name: 'bug', color: '#d73a4a', description: 'Something is broken'},
  {id: '2', name: 'enhancement', color: '#a2eeef', description: 'New feature or request'},
  {id: '3', name: 'documentation', color: '#0075ca', description: 'Improvements to docs'},
  {id: '4', name: 'good first issue', color: '#7057ff', description: 'Good for newcomers'},
  {id: '5', name: 'help wanted', color: '#008672', description: 'Extra attention needed'},
  {id: '6', name: 'wontfix', color: '#ffffff', description: 'This will not be worked on'},
];

export default function LabelPicker() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = LABELS.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.description.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <Card width={320}>
      <VStack gap={3}>
        <Text type="body">Apply labels</Text>
        <TextInput
          label="Filter labels"
          isLabelHidden
          placeholder="Filter labels"
          value={search}
          onChange={setSearch}
        />
        <VStack gap={1}>
          {filtered.map(label => (
            <button
              key={label.id}
              onClick={() => toggle(label.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                background: selected.includes(label.id) ? '#f0f0ff' : 'transparent',
                border: 'none', width: '100%', cursor: 'pointer', borderRadius: 4, textAlign: 'left',
              }}
            >
              <span style={{width: 14, height: 14, borderRadius: '50%', backgroundColor: label.color, border: '1px solid #ddd', flexShrink: 0}} />
              <VStack gap={0}>
                <Text type="body">{label.name}</Text>
                <Text type="supporting">{label.description}</Text>
              </VStack>
              {selected.includes(label.id) && <span style={{marginLeft: 'auto'}}>✓</span>}
            </button>
          ))}
        </VStack>
        {selected.length > 0 && (
          <HStack gap={1}>
            {selected.map(id => {
              const label = LABELS.find(l => l.id === id)!;
              return <Badge key={id} label={label.name} />;
            })}
          </HStack>
        )}
      </VStack>
    </Card>
  );
}
