'use client';

import {useState} from 'react';
import {XDSNumberInput} from '@xds/core/NumberInput';

export default function NumberInputWithMinMaxConstraints() {
  const [rating, setRating] = useState<number | null>(3);

  return (
    <XDSNumberInput
      label="Rating"
      value={rating}
      onChange={setRating}
      min={1}
      max={5}
    />
  );
}
