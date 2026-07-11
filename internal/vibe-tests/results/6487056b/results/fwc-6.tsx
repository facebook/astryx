// Copyright (c) Meta Platforms, Inc. and affiliates.

import { RadioList, RadioListItem } from '@astryxdesign/core/RadioList';
import { Card } from '@astryxdesign/core/Card';
import { Text } from '@astryxdesign/core/Text';
import { Stack } from '@astryxdesign/core/Stack';
import { useState } from 'react';

export default function ShippingMethodSelector() {
  const [selected, setSelected] = useState<string>('standard');

  return (
    <Card padding={3}>
      <Stack gap={3}>
        <Text type="label" weight="semibold">Shipping Method</Text>
        <RadioList
          label="Choose shipping method"
          value={selected}
          onChange={setSelected}
        >
          <RadioListItem
            label="Standard"
            value="standard"
            description="Free - 5-7 business days"
          />
          <RadioListItem
            label="Express"
            value="express"
            description="$9.99 - 2-3 business days"
          />
          <RadioListItem
            label="Overnight"
            value="overnight"
            description="$24.99 - Next day delivery"
          />
        </RadioList>
      </Stack>
    </Card>
  );
}
