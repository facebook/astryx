// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Icon} from '@astryxdesign/core/Icon';
import {HStack} from '@astryxdesign/core/Stack';

export default function IconButtonLoadingToggle() {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  function handleClick(id: string) {
    setLoadingId(id);
    setTimeout(() => setLoadingId(null), 1500);
  }

  return (
    <HStack gap={2}>
      <IconButton
        label="Copy"
        icon={<Icon icon="copy" color="inherit" />}
        variant="primary"
        isLoading={loadingId === 'copy'}
        onClick={() => handleClick('copy')}
      />
      <IconButton
        label="Search"
        icon={<Icon icon="search" color="inherit" />}
        isLoading={loadingId === 'search'}
        onClick={() => handleClick('search')}
      />
      <IconButton
        label="Close"
        icon={<Icon icon="close" color="inherit" />}
        variant="ghost"
        isLoading={loadingId === 'close'}
        onClick={() => handleClick('close')}
      />
    </HStack>
  );
}
