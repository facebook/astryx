// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {XDSRadioList, XDSRadioListItem} from '@xds/core/RadioList';
import {XDSText} from '@xds/core/Text';

export default function RadioListPricingTier() {
  const [value, setValue] = useState('');

  return (
    <XDSRadioList label="Plan" value={value} onChange={setValue}>
      <XDSRadioListItem
        label="Free"
        value="free"
        endContent={
          <XDSText type="body" color="secondary">
            $0/mo
          </XDSText>
        }
      />
      <XDSRadioListItem
        label="Pro"
        value="pro"
        endContent={
          <XDSText type="body" color="secondary">
            $9/mo
          </XDSText>
        }
      />
      <XDSRadioListItem
        label="Enterprise"
        value="enterprise"
        endContent={
          <XDSText type="body" color="secondary">
            Custom
          </XDSText>
        }
      />
    </XDSRadioList>
  );
}
