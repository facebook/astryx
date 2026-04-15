'use client';

import {useState} from 'react';
import {XDSSlider} from '@xds/core/Slider';

export default function SliderRangeWithMinimumGap() {
  const [dateRange, setDateRange] = useState<[number, number]>([10, 90]);

  return (
    <XDSSlider
      label="Date range"
      value={[10, 90]}
      onChange={setDateRange}
      minStepsBetweenThumbs={5}
    />
  );
}
