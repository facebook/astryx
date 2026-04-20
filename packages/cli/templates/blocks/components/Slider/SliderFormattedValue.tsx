'use client';

import {useState} from 'react';
import {XDSSlider} from '@xds/core/Slider';

export default function SliderFormattedValue() {
  const [value, setValue] = useState(72);
  return (
    <XDSSlider
      label="Temperature"
      value={value}
      onChange={setValue}
      valueDisplay="text"
      min={60}
      max={90}
      step={1}
      formatValue={(v: number) => `${v}\u00B0F`}
    />
  );
}
