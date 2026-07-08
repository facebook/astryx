// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {Rating} from '@astryxdesign/core/Rating';

export default function RatingShowcase() {
  const [value, setValue] = useState(4);
  return <Rating label="Rate this article" value={value} onChange={setValue} />;
}
