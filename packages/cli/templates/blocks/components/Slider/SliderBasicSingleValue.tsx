'use client';

import {useState} from 'react';
import {XDSSlider} from '@xds/core/Slider';

export default function SliderBasicSingleValue() {
  const [value, setValue] = useState(50);

  return (
    <XDSSlider label="Volume" value={50} onChange={setValue} />
  );
}
