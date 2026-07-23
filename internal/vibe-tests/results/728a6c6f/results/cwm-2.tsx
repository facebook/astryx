// Copyright (c) Meta Platforms, Inc. and affiliates.

import React, {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Badge} from '@/components/ui/badge';

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

  const filtered = LABELS.filter(l => l.name.toLowerCase().includes(search.toLowerCase()));
  const toggle = (id: string) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <Card className="w-80">
      <CardHeader><CardTitle className="text-sm">Apply labels</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <Input placeholder="Filter labels" value={search} onChange={e => setSearch(e.target.value)} />
        <div className="space-y-1">
          {filtered.map(label => (
            <button
              key={label.id}
              onClick={() => toggle(label.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded w-full text-left text-sm hover:bg-accent ${selected.includes(label.id) ? 'bg-accent' : ''}`}
            >
              <span className="w-3.5 h-3.5 rounded-full shrink-0 border" style={{backgroundColor: label.color}} />
              <div>
                <div className="font-medium">{label.name}</div>
                <div className="text-xs text-muted-foreground">{label.description}</div>
              </div>
              {selected.includes(label.id) && <span className="ml-auto">✓</span>}
            </button>
          ))}
        </div>
        {selected.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {selected.map(id => {
              const label = LABELS.find(l => l.id === id)!;
              return <Badge key={id} variant="secondary">{label.name}</Badge>;
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
