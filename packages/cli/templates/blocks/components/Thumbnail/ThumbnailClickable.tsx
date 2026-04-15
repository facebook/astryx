'use client';

import {XDSThumbnail} from '@xds/core/Thumbnail';

export default function ThumbnailClickable() {
  return (
    <XDSThumbnail src="/preview.png" alt="Preview" onClick={openLightbox} />
  );
}
