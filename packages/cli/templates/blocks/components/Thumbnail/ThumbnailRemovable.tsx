'use client';

import {useState} from 'react';
import {XDSThumbnail} from '@xds/core/Thumbnail';

export default function ThumbnailRemovable() {
  const [visible, setVisible] = useState(true);

  if (!visible) {
    return (
      <p style={{color: '#888', fontSize: 12}}>
        Removed.{' '}
        <button onClick={() => setVisible(true)}>Undo</button>
      </p>
    );
  }

  return (
    <XDSThumbnail
      src="https://picsum.photos/id/1043/200/200"
      alt="Removable thumbnail"
      label="photo.png"
      onRemove={() => setVisible(false)}
    />
  );
}
