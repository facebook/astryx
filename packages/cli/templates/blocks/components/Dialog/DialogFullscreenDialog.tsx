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

export default function DialogFullscreenDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <XDSButton
        label="Open Fullscreen Modal"
        variant="secondary"
        onClick={() => setIsOpen(true)}
      />
      <XDSDialog isOpen={isOpen} onOpenChange={setIsOpen} variant="fullscreen">
        <XDSLayout
          header={
            <XDSDialogHeader
              title="Fullscreen Modal"
              onOpenChange={setIsOpen}
            />
          }
          content={
            <XDSLayoutContent>
              <div
                style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                <XDSText type="body">
                  This modal takes up the entire viewport. The width, maxHeight,
                  and position props are ignored in fullscreen mode.
                </XDSText>
                {Array.from({length: 10}, (_, i) => (
                  <XDSText type="body" key={i}>
                    {i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing
                    elit. Sed do eiusmod tempor incididunt ut labore et dolore
                    magna aliqua.
                  </XDSText>
                ))}
              </div>
            </XDSLayoutContent>
          }
          footer={
            <XDSLayoutFooter>
              <XDSHStack hAlign="end">
                <XDSButton
                  label="Close"
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
