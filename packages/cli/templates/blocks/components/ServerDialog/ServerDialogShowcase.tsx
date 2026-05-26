// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useXDSServerDialog} from '@xds/core/ServerDialog';
import {XDSButton} from '@xds/core/Button';
import {fetchUserDialog} from './serverDialogAction';

export default function ServerDialogShowcase() {
  const [showDialog, preloadDialog, dialogElement] =
    useXDSServerDialog(fetchUserDialog);

  return (
    <>
      <XDSButton
        label="Show Server Dialog"
        onMouseEnter={() => preloadDialog({userId: '42'}, {})}
        onClick={() => showDialog({userId: '42'}, {})}
      />
      {dialogElement}
    </>
  );
}
