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
import {XDSCard} from '@xds/core/Card';

export default function DialogConfirmationDialog() {
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = () => {
    setIsOpen(false);
  };

  return (
    <XDSCard>
      <XDSVStack gap={3}>
        <XDSVStack gap={1}>
          <XDSText type="body" weight="bold">
            Marketing Dashboard
          </XDSText>
          <XDSText type="supporting" color="secondary">
            Created Jan 12, 2026 · 14 pages · 3 collaborators
          </XDSText>
        </XDSVStack>
        <XDSHStack gap={2}>
          <XDSButton label="Edit" variant="secondary" onClick={() => {}} />
          <XDSButton
            label="Delete project"
            variant="destructive"
            onClick={() => setIsOpen(true)}
          />
        </XDSHStack>
      </XDSVStack>
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
    </XDSCard>
  );
}
