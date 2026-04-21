'use client';

import {useState} from 'react';
import {XDSThumbnail} from '@xds/core/Thumbnail';

export default function ThumbnailPlaceholder() {
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
      label="report.pdf"
      onRemove={() => setVisible(false)}
    />
  );
}
