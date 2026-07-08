// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {Card} from '@astryxdesign/core/Card';
import {Button} from '@astryxdesign/core/Button';
import {Heading} from '@astryxdesign/core/Heading';

export default function PageHeader() {
  const [icon, setIcon] = useState('\u{1F4DD}');
  const [coverUrl, setCoverUrl] = useState('');

  return (
    <div className="w-full">
      {coverUrl && (
        <div className="h-48 bg-cover bg-center rounded-t-lg" style={{backgroundImage: `url(${coverUrl})`}} />
      )}
      <Card padding={4}>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="text-5xl cursor-pointer">{icon}</span>
            <Button label="Change icon" variant="ghost" size="sm" onClick={() => setIcon('\u{1F680}')} />
          </div>
          <div className="flex gap-2">
            <Button label="Add cover" variant="ghost" size="sm" onClick={() => setCoverUrl('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200')} />
          </div>
          <Heading level={1}>Untitled</Heading>
        </div>
      </Card>
    </div>
  );
}
