// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {XDSInputGroup, XDSInputGroupText} from '@xds/core/InputGroup';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSStack} from '@xds/core/Layout';

export default function InputGroupShowcase() {
  const [price, setPrice] = useState('');
  const [url, setUrl] = useState('');

  return (
    <XDSStack direction="vertical" gap={4} width="100%" style={{maxWidth: 400}}>
      <XDSInputGroup label="Price">
        <XDSInputGroupText>$</XDSInputGroupText>
        <XDSTextInput
          label="Amount"
          isLabelHidden
          value={price}
          onChange={setPrice}
          placeholder="0.00"
        />
      </XDSInputGroup>
      <XDSInputGroup label="Website">
        <XDSInputGroupText>https://</XDSInputGroupText>
        <XDSTextInput
          label="URL"
          isLabelHidden
          value={url}
          onChange={setUrl}
          placeholder="example"
        />
        <XDSInputGroupText>.com</XDSInputGroupText>
      </XDSInputGroup>
    </XDSStack>
  );
}
