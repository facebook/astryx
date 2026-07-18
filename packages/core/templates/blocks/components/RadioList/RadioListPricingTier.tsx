// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {RadioList, RadioListItem} from '@astryxdesign/core/RadioList';
import {Text} from '@astryxdesign/core/Text';

export default function RadioListPricingTier() {
  const [value, setValue] = useState('');

  return (
    <RadioList label="Plan" value={value} onChange={setValue}>
      <RadioListItem
        label="Free"
        value="free"
        endContent={
          <Text type="body" color="secondary">
            $0/mo
          </Text>
        }
      />
      <RadioListItem
        label="Pro"
        value="pro"
        endContent={
          <Text type="body" color="secondary">
            $9/mo
          </Text>
        }
      />
      <RadioListItem
        label="Enterprise"
        value="enterprise"
        endContent={
          <Text type="body" color="secondary">
            Custom
          </Text>
        }
      />
    </RadioList>
  );
}
