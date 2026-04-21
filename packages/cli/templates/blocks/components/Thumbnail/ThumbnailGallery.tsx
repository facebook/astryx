'use client';

import {useState} from 'react';
import {XDSThumbnail} from '@xds/core/Thumbnail';

const initialItems = [
  {id: 1, src: 'https://picsum.photos/id/1042/200/200', label: 'dark.jpg'},
  {id: 2, src: 'https://picsum.photos/id/1043/200/200', label: 'light.jpg'},
  {id: 3, src: 'https://picsum.photos/id/1044/200/200', label: 'warm.jpg'},
];

export default function ThumbnailGallery() {
  const [items, setItems] = useState(initialItems);

  return (
    <div style={{display: 'flex', gap: 8, alignItems: 'flex-start'}}>
      {items.map(item => (
        <XDSThumbnail
          key={item.id}
          src={item.src}
          alt={item.label}
          label={item.label}
          onRemove={() =>
            setItems(prev => prev.filter(i => i.id !== item.id))
          }
        />
      ))}
      {items.length === 0 && (
        <p style={{color: '#888', fontSize: 12}}>
          All removed.{' '}
          <button onClick={() => setItems(initialItems)}>Reset</button>
        </p>
      )}
    </div>
  );
}
