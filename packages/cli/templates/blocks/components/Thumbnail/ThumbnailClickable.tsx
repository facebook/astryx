'use client';

import {XDSThumbnail} from '@xds/core/Thumbnail';

const openLightbox = () => {};

export default function ThumbnailClickable() {
  return (
    <XDSThumbnail src="/preview.png" alt="Preview" onClick={openLightbox} />
  );
}
