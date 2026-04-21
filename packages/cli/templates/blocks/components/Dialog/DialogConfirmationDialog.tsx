'use client';

import {useState} from 'react';
import {XDSDialog, XDSDialogHeader} from '@xds/core/Dialog';
import {
  XDSLayout,
  XDSLayoutContent,
  XDSLayoutFooter,
  XDSHStack,
  XDSVStack,
} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSText} from '@xds/core/Text';

export default function DialogConfirmationDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const handleDelete = () => {
    setDeleted(true);
    setIsOpen(false);
  };

  return (
    <XDSVStack gap={3}>
      <XDSButton
        label="Delete project"
        variant="destructive"
        onClick={() => setIsOpen(true)}
      />
      {deleted && (
        <XDSText type="body" color="primary">
          Project deleted (demo)
        </XDSText>
      )}
      <XDSDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        width={400}
        purpose="form">
        <XDSLayout
          header={
            <XDSDialogHeader title="Delete project?" onOpenChange={setIsOpen} />
          }
          content={
            <XDSLayoutContent>
              <XDSText type="body">
                This will permanently delete &quot;Marketing Dashboard&quot; and
                all of its data. This action cannot be undone.
              </XDSText>
            </XDSLayoutContent>
          }
          footer={
            <XDSLayoutFooter>
              <XDSHStack gap={2} hAlign="end">
                <XDSButton
                  label="Cancel"
                  variant="secondary"
                  onClick={() => setIsOpen(false)}
                />
                <XDSButton
                  label="Delete"
                  variant="destructive"
                  onClick={handleDelete}
                />
              </XDSHStack>
            </XDSLayoutFooter>
          }
        />
      </XDSDialog>
    </XDSVStack>
  );
}
