// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSButton} from '@xds/core/Button';
import {buildPlaygroundHref} from './playgroundLink';

interface PlaygroundButtonProps {
  source: string;
  label?: string;
}

export function PlaygroundButton({
  source,
  label = 'Open in Playground',
}: PlaygroundButtonProps) {
  return (
    <XDSButton
      label={label}
      variant="secondary"
      size="sm"
      href={buildPlaygroundHref(source)}
    />
  );
}
