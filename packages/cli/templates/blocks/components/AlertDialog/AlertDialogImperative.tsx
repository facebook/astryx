'use client';

import {useXDSImperativeAlertDialog} from '@xds/core/AlertDialog';

export default function AlertDialogImperative() {
  const alert = useXDSImperativeAlertDialog();
  return (
    <>
      <button
        onClick={() =>
          alert.show({
            title: 'Delete?',
            description: 'This cannot be undone.',
            actionLabel: 'Delete',
            onAction: () => alert.hide(),
          })
        }>
        Delete
      </button>
      {alert.element}
    </>
  );
}
