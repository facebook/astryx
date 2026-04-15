'use client';

import {XDSIconButton} from '@xds/core/IconButton';

export default function IconButtonEmoji() {
  return (
    <XDSIconButton
      label="Emoji"
      icon={<span>🚀</span>}
      variant="ghost"
      size="sm"
    />
  );
}
