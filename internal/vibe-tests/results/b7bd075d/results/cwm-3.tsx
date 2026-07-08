// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {Card, CardContent} from '@/components/ui/card';
import {Button} from '@/components/ui/button';

export default function PageHeader() {
  const [icon, setIcon] = useState('\u{1F4DD}');
  const [coverUrl, setCoverUrl] = useState('');

  return (
    <div className="w-full">
      {coverUrl && (
        <div className="h-48 bg-cover bg-center rounded-t-lg" style={{backgroundImage: `url(${coverUrl})`}} />
      )}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="text-5xl cursor-pointer">{icon}</span>
              <Button variant="ghost" size="sm" onClick={() => setIcon('\u{1F680}')}>Change icon</Button>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setCoverUrl('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200')}>Add cover</Button>
            </div>
            <h1 className="text-4xl font-bold">Untitled</h1>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
