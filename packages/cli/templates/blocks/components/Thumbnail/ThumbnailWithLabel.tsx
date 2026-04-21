'use client';

import {XDSThumbnail} from '@xds/core/Thumbnail';

export default function ThumbnailWithLabel() {
  return (
    <XDSThumbnail
      src="https://picsum.photos/id/1044/200/200"
      alt="Vacation photo"
      label="vacation.jpg"
    />
  );
}
