'use client';

import {XDSThumbnail} from '@xds/core/Thumbnail';

export default function ThumbnailShowcase() {
  return (
    <XDSThumbnail
      src="https://picsum.photos/id/1043/200/200"
      alt="Sample image"
      label="photo.jpg"
    />
  );
}
