// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {InputGroup, InputGroupText} from '@xds/core/InputGroup';
import {TextInput} from '@xds/core/TextInput';
import {Stack} from '@xds/core/Layout';

export default function InputGroupShowcase() {
  const [price, setPrice] = useState('');
  const [url, setUrl] = useState('');

  return (
    <Stack direction="vertical" gap={4} width="100%" style={{maxWidth: 400}}>
      <InputGroup label="Price">
        <InputGroupText>$</InputGroupText>
        <TextInput
          label="Amount"
          isLabelHidden
          value={price}
          onChange={setPrice}
          placeholder="0.00"
        />
      </InputGroup>
      <InputGroup label="Website">
        <InputGroupText>https://</InputGroupText>
        <TextInput
          label="URL"
          isLabelHidden
          value={url}
          onChange={setUrl}
          placeholder="example"
        />
        <InputGroupText>.com</InputGroupText>
      </InputGroup>
    </Stack>
  );
}
