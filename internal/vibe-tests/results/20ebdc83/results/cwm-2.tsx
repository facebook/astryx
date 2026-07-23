// Copyright (c) Meta Platforms, Inc. and affiliates.

import React, {useState} from 'react';

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
    <div style={{width: 320, border: '1px solid #e5e5e5', borderRadius: 8, padding: 16, fontFamily: 'system-ui'}}>
      <p style={{margin: '0 0 8px', fontWeight: 600, fontSize: 14}}>Apply labels</p>
      <input
        placeholder="Filter labels"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{width: '100%', padding: '6px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14, marginBottom: 8}}
      />
      <div>
        {filtered.map(label => (
          <button
            key={label.id}
            onClick={() => toggle(label.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', width: '100%',
              background: selected.includes(label.id) ? '#f0f0ff' : 'transparent',
              border: 'none', cursor: 'pointer', borderRadius: 4, textAlign: 'left',
            }}
          >
            <span style={{width: 14, height: 14, borderRadius: '50%', backgroundColor: label.color, border: '1px solid #ddd'}} />
            <div>
              <div style={{fontSize: 14, fontWeight: 500}}>{label.name}</div>
              <div style={{fontSize: 12, color: '#666'}}>{label.description}</div>
            </div>
            {selected.includes(label.id) && <span style={{marginLeft: 'auto'}}>✓</span>}
          </button>
        ))}
      </div>
      {selected.length > 0 && (
        <div style={{display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8}}>
          {selected.map(id => {
            const label = LABELS.find(l => l.id === id)!;
            return <span key={id} style={{padding: '2px 8px', borderRadius: 12, backgroundColor: '#f0f0f0', fontSize: 12}}>{label.name}</span>;
          })}
        </div>
      )}
    </div>
  );
}
