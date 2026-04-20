'use client';

import {XDSCenter} from '@xds/core/Center';
import {XDSCard} from '@xds/core/Card';
import {XDSText} from '@xds/core/Text';

function CheckIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  );
}

export default function CenterInlineCenter() {
  return (
    <XDSCard>
      <XDSText type="body">
        Text with inline centered icon:{' '}
        <XDSCenter isInline>
          <CheckIcon />
        </XDSCenter>{' '}
        and more text after.
      </XDSText>
    </XDSCard>
  );
}
