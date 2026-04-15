'use client';

import {useState} from 'react';
import {XDSSlider} from '@xds/core/Slider';

export default function SliderVerticalOrientation() {
  const [level, setLevel] = useState(50);

  return (
    <XDSSlider
      label="Level"
      value={60}
      onChange={setLevel}
      orientation="vertical"
    />
  );
}
