'use client';

import {XDSSection} from '@xds/core/Section';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {CheckIcon} from '@heroicons/react/24/solid';

const FEATURES = [
  '10 team members',
  'Unlimited projects',
  'Priority support',
  'Advanced analytics',
];

export default function SectionDefaultWithWash() {
  return (
    <XDSStack direction="vertical" gap={2}>
      <XDSSection variant="section" padding={4}>
        <XDSStack direction="vertical" gap={3} hAlign="center">
          <XDSStack direction="vertical" gap={1} hAlign="center">
            <XDSText type="display-3">Pro Plan</XDSText>
            <XDSText type="body" color="secondary">
              Everything you need to scale your team.
            </XDSText>
          </XDSStack>
          <XDSStack direction="vertical" gap={2}>
            {FEATURES.map(feature => (
              <XDSStack
                key={feature}
                direction="horizontal"
                gap={2}
                vAlign="center">
                <XDSIcon icon={CheckIcon} size="sm" />
                <XDSText type="body">{feature}</XDSText>
              </XDSStack>
            ))}
          </XDSStack>
        </XDSStack>
      </XDSSection>
      <XDSSection variant="wash" padding={6}>
        <XDSStack direction="vertical" gap={2} hAlign="center">
          <XDSStack direction="horizontal" gap={2} vAlign="center">
            <XDSText type="display-3">$49</XDSText>
            <XDSText type="supporting" color="secondary">
              / month
            </XDSText>
          </XDSStack>
          <XDSButton label="Upgrade" variant="primary" />
        </XDSStack>
      </XDSSection>
    </XDSStack>
  );
}
