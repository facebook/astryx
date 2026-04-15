'use client';

import {XDSThumbnail} from '@xds/core/Thumbnail';

export default function ThumbnailImageWithRemove() {
  return (
    <XDSThumbnail src="/photo.jpg" alt="Vacation" label="vacation.jpg" onRemove={() => {}} />
  );
}
