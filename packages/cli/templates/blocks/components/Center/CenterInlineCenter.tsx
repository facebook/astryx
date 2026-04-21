'use client';

import {XDSCenter} from '@xds/core/Center';
import {XDSCard} from '@xds/core/Card';
import {XDSIcon} from '@xds/core/Icon';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const STEPS = [
  {
    icon: CheckCircleIcon,
    color: 'positive' as const,
    text: 'Dependencies installed',
  },
  {icon: CheckCircleIcon, color: 'positive' as const, text: 'Linting passed'},
  {
    icon: CheckCircleIcon,
    color: 'positive' as const,
    text: 'Tests passed (47/47)',
  },
  {
    icon: ArrowPathIcon,
    color: 'secondary' as const,
    text: 'Building production bundle...',
  },
  {icon: ClockIcon, color: 'secondary' as const, text: 'Deploy to staging'},
  {
    icon: XCircleIcon,
    color: 'negative' as const,
    text: 'Deploy to production — blocked',
  },
];

export default function CenterInlineCenter() {
  return (
    <XDSCard width={360}>
      <XDSStack direction="vertical" gap={2}>
        <XDSText type="body" weight="bold">
          Pipeline Status
        </XDSText>
        {STEPS.map(step => (
          <XDSText key={step.text} type="body">
            <XDSCenter isInline>
              <XDSIcon icon={step.icon} size="sm" color={step.color} />
            </XDSCenter>{' '}
            {step.text}
          </XDSText>
        ))}
      </XDSStack>
    </XDSCard>
  );
}
