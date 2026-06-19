// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {FieldLabel} from '@xds/core/Field';
import {VStack} from '@xds/core/Layout';

const LockIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export default function FieldLabelShowcase() {
  return (
    <VStack gap={4}>
      <FieldLabel
        label="Email address"
        inputID="email-input"
        isRequired
      />
      <FieldLabel
        label="Phone number"
        inputID="phone-input"
        isOptional
        description="Include country code for international numbers"
      />
      <FieldLabel
        label="API key"
        inputID="api-input"
        labelTooltip="Your API key can be found in the developer settings"
        labelIcon={LockIcon}
      />
      <FieldLabel
        label="Disabled field"
        inputID="disabled-input"
        isDisabled
      />
    </VStack>
  );
}
