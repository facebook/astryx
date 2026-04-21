'use client';

import {useState} from 'react';
import {XDSIconButton} from '@xds/core/IconButton';
import {XDSIcon} from '@xds/core/Icon';
import {XDSHStack} from '@xds/core/Layout';

export default function IconButtonLoadingToggle() {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  function handleClick(id: string) {
    setLoadingId(id);
    setTimeout(() => setLoadingId(null), 1500);
  }

  return (
    <XDSHStack gap={2}>
      <XDSIconButton
        label="Copy"
        icon={<XDSIcon icon="copy" color="inherit" />}
        variant="primary"
        isLoading={loadingId === 'copy'}
        onClick={() => handleClick('copy')}
      />
      <XDSIconButton
        label="Search"
        icon={<XDSIcon icon="search" color="inherit" />}
        isLoading={loadingId === 'search'}
        onClick={() => handleClick('search')}
      />
      <XDSIconButton
        label="Close"
        icon={<XDSIcon icon="close" color="inherit" />}
        variant="ghost"
        isLoading={loadingId === 'close'}
        onClick={() => handleClick('close')}
      />
    </XDSHStack>
  );
}
