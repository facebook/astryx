// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Button} from '@astryxdesign/core/Button';
import {buildPlaygroundHref} from './playgroundLink';

interface PlaygroundButtonProps {
  source: string;
  label?: string;
}

export function PlaygroundButton({
  source,
  label = 'Open in Playground',
}: PlaygroundButtonProps) {
  const href = buildPlaygroundHref(source);

  return (
    <Button
      label={label}
      variant="secondary"
      size="sm"
      onClick={() => {
        window.location.href = href;
      }}
    />
  );
}
