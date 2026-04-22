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

const TERMS = [
  'You agree to use the service only for lawful purposes and in compliance with all applicable laws.',
  'Your account credentials are your responsibility. Notify us immediately if you suspect unauthorized access.',
  'We reserve the right to suspend accounts that violate these terms or engage in abusive behavior.',
  'Content you upload remains your property. You grant us a license to host and display it within the service.',
  'We may update these terms at any time. Continued use after changes constitutes acceptance.',
  'The service is provided as-is without warranties. We are not liable for data loss or service interruptions.',
  'You may cancel your account at any time. Your data will be deleted within 30 days of cancellation.',
  'Disputes will be resolved through binding arbitration in accordance with applicable regulations.',
];

export default function DialogScrollingContent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <XDSCard>
      <XDSVStack gap={3}>
        <XDSVStack gap={1}>
          <XDSText type="body" weight="bold">
            Terms and Conditions
          </XDSText>
          <XDSText type="supporting" color="secondary">
            Last updated March 2026 · 8 clauses
          </XDSText>
        </XDSVStack>
        <XDSButton
          label="Review terms"
          variant="secondary"
          onClick={() => setIsOpen(true)}
        />
      </XDSVStack>
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
              <XDSVStack gap={3}>
                {TERMS.map((term, i) => (
                  <XDSText type="body" key={i}>
                    {i + 1}. {term}
                  </XDSText>
                ))}
              </XDSVStack>
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
    </XDSCard>
  );
}
