'use client';

import {useState} from 'react';
import {XDSNumberInput} from '@xds/core/NumberInput';

export default function NumberInputBasic() {
  const [quantity, setQuantity] = useState<number | null>(0);

  return (
    <XDSNumberInput label="Quantity" value={quantity} onChange={setQuantity} />
  );
}
