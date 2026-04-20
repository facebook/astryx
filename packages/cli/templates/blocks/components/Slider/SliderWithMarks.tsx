'use client';

import {useState} from 'react';
import {XDSSlider} from '@xds/core/Slider';

export default function SliderWithMarks() {
  const [value, setValue] = useState(50);
  return (
    <XDSSlider
      label="Volume"
      value={value}
      onChange={setValue}
      marks={[
        {value: 0, label: '0'},
        {value: 25, label: '25'},
        {value: 50, label: '50'},
        {value: 75, label: '75'},
        {value: 100, label: '100'},
      ]}
    />
  );
}
