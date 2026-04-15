'use client';

import {useState} from 'react';
import {XDSSlider} from '@xds/core/Slider';

export default function SliderTextValueDisplay() {
  const [opacity, setOpacity] = useState(50);

  return (
    <XDSSlider
      label="Opacity"
      value={75}
      onChange={setOpacity}
      formatValue={(v) => `${v}%`}
      valueDisplay="text"
    />
  );
}
