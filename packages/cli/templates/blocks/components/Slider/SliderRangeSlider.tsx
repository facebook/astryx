'use client';

import {useState} from 'react';
import {XDSSlider} from '@xds/core/Slider';

export default function SliderRangeSlider() {
  const [value, setValue] = useState<[number, number]>([20, 80]);
  return <XDSSlider label="Price range" value={value} onChange={setValue} />;
}
