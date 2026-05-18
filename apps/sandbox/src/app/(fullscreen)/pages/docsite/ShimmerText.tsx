// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import React, {useState, useEffect} from 'react';
import {XDSSkeleton} from '@xds/core/Skeleton';
import {XDSText} from '@xds/core/Text';

export function ShimmerText({isActive}: {isActive: boolean}) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!isActive) return;
    const id = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(id);
  }, [isActive]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 8,
        opacity: isActive ? 1 : 0,
        transition: 'opacity 600ms ease',
      }}>
      <XDSSkeleton width="90%" height={14} radius={3} index={0} />
      <XDSSkeleton width="75%" height={14} radius={3} index={1} />
      <XDSSkeleton width="60%" height={14} radius={3} index={2} />
      <XDSText type="supporting" color="secondary">
        {isActive ? `Generating templates${dots}` : 'Done'}
      </XDSText>
    </div>
  );
}
