'use client';

import {XDSThumbnail} from '@xds/core/Thumbnail';

export default function ThumbnailLoading() {
  return (
    <div style={{display: 'flex', gap: 8, alignItems: 'flex-start'}}>
      <XDSThumbnail isLoading label="uploading.jpg" />
      <XDSThumbnail
        src="https://picsum.photos/id/1044/200/200"
        alt="Uploading preview"
        isLoading
        label="vacation.jpg"
      />
    </div>
  );
}
