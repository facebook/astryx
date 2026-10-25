// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file IconButtonShell.tsx
 * @input Uses the server Button shell
 * @output Exports IconButton: the server shell resolved by the `react-server`
 *   entry (index.server.ts)
 * @position Server-safe IconButton: the server Button with `isIconOnly`, the
 *   same composition IconButton.tsx makes over the client Button. Client parts
 *   load exactly as they do for Button (see Button/ButtonShell.tsx).
 *
 * SYNC: When modified, update IconButton.tsx (same composition).
 */

import type {ReactNode} from 'react';
import {Button} from '../Button/ButtonShell';
import type {IconButtonProps} from './IconButton';

/** An icon-only button. Same API as the client IconButton. */
export function IconButton({icon, ...props}: IconButtonProps): ReactNode {
  return <Button {...props} icon={icon} isIconOnly />;
}

IconButton.displayName = 'IconButton';
