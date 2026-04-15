'use client';

import {useState} from 'react';
import {XDSSlider} from '@xds/core/Slider';

export default function SliderRangeSlider() {
  const [range, setRange] = useState('');

  return (
    <XDSSlider
      label="Price range"
      value={[20, 80]}
      onChange={setRange}
    />
  );
}
