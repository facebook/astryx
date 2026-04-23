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

export default function DialogWithSubtitle() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <XDSCard>
      <XDSVStack gap={3}>
        <XDSVStack gap={1}>
          <XDSText type="body" weight="bold">
            Project Ownership
          </XDSText>
          <XDSText type="supporting" color="secondary">
            Marketing Dashboard · Owner: You
          </XDSText>
        </XDSVStack>
        <XDSButton
          label="Transfer ownership"
          variant="secondary"
          onClick={() => setIsOpen(true)}
        />
      </XDSVStack>
      <XDSDialog isOpen={isOpen} onOpenChange={setIsOpen} purpose="required">
        <XDSLayout
          header={
            <XDSDialogHeader
              title="Transfer project ownership"
              subtitle="This action requires confirmation from the new owner"
            />
          }
          content={
            <XDSLayoutContent>
              <XDSText type="body">
                You are about to transfer &quot;Marketing Dashboard&quot; to
                Sarah Chen. Once accepted, you will lose admin access.
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
                  label="Transfer"
                  variant="primary"
                  onClick={() => setIsOpen(false)}
                />
              </XDSHStack>
            </XDSLayoutFooter>
          }
        />
      </XDSDialog>
    </XDSCard>
  );
}
