// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {Card} from '@astryxdesign/core/Card';
import {Button} from '@astryxdesign/core/Button';
import {Heading} from '@astryxdesign/core/Heading';
import {HStack} from '@astryxdesign/core/HStack';
import {VStack} from '@astryxdesign/core/VStack';

export default function PageHeader() {
  const [icon, setIcon] = useState('\u{1F4DD}');
  const [coverUrl, setCoverUrl] = useState('');

  return (
    <VStack gap={0}>
      {coverUrl && (
        <div style={{height: 200, backgroundImage: `url(${coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '8px 8px 0 0'}} />
      )}
      <Card padding={4}>
        <VStack gap={2}>
          <HStack gap={2} vAlign="center">
            <span style={{fontSize: 48, cursor: 'pointer'}}>{icon}</span>
            <Button label="Change icon" variant="ghost" size="sm" onClick={() => setIcon('\u{1F680}')} />
          </HStack>
          <HStack gap={2}>
            <Button label="Add cover" variant="ghost" size="sm" onClick={() => setCoverUrl('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200')} />
          </HStack>
          <Heading level={1}>Untitled</Heading>
        </VStack>
      </Card>
    </VStack>
  );
}
