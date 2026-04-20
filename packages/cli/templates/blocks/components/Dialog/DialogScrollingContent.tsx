'use client';

import {useState} from 'react';
import {XDSDialog, XDSDialogHeader} from '@xds/core/Dialog';
import {
  XDSLayout,
  XDSLayoutContent,
  XDSLayoutFooter,
  XDSHStack,
} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSText} from '@xds/core/Text';

export default function DialogScrollingContent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <XDSButton
        label="Open Scrolling Modal"
        variant="secondary"
        onClick={() => setIsOpen(true)}
      />
      <XDSDialog isOpen={isOpen} onOpenChange={setIsOpen} maxHeight="50vh">
        <XDSLayout
          header={
            <XDSDialogHeader
              title="Terms and Conditions"
              onOpenChange={setIsOpen}
            />
          }
          content={
            <XDSLayoutContent>
              <div
                style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                {Array.from({length: 20}, (_, i) => (
                  <XDSText type="body" key={i}>
                    {i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing
                    elit. Sed do eiusmod tempor incididunt ut labore et dolore
                    magna aliqua. Ut enim ad minim veniam, quis nostrud
                    exercitation ullamco laboris nisi ut aliquip ex ea commodo
                    consequat.
                  </XDSText>
                ))}
              </div>
            </XDSLayoutContent>
          }
          footer={
            <XDSLayoutFooter>
              <XDSHStack gap={2} hAlign="end">
                <XDSButton
                  label="Decline"
                  variant="secondary"
                  onClick={() => setIsOpen(false)}
                />
                <XDSButton
                  label="Accept"
                  variant="primary"
                  onClick={() => setIsOpen(false)}
                />
              </XDSHStack>
            </XDSLayoutFooter>
          }
        />
      </XDSDialog>
    </>
  );
}
