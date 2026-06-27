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

  // Render a real anchor (Button renders as <a> when given href) so
  // right-click / Cmd-click / middle-click "open in new tab" work, instead
  // of an onClick that hard-navigates the current tab.
  return <Button label={label} variant="secondary" size="sm" href={href} />;
}
