'use client';

import {useXDSImperativeAlertDialog} from '@xds/core/AlertDialog';
import {XDSButton} from '@xds/core/Button';

export default function AlertDialogImperativeAlert() {
  const alert = useXDSImperativeAlertDialog();
  return (
    <>
      <XDSButton
        label="Delete item"
        variant="destructive"
        onClick={() =>
          alert.show({
            title: 'Delete item?',
            description: 'This action cannot be undone.',
            actionLabel: 'Delete',
            onAction: () => alert.hide(),
          })
        }
      />
      {alert.element}
    </>
  );
}
