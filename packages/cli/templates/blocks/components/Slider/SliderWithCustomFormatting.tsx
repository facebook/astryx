'use client';

import {useState} from 'react';
import {XDSSlider} from '@xds/core/Slider';

export default function SliderWithCustomFormatting() {
  const [temp, setTemp] = useState(72);

  return (
    <XDSSlider
      label="Temperature"
      value={72}
      onChange={setTemp}
      min={32}
      max={212}
      formatValue={(v) => `${v}°F`}
    />
  );
}
