'use client';

import {useState} from 'react';
import {XDSSlider} from '@xds/core/Slider';

export default function SliderWithStepAndMarks() {
  const [rating, setRating] = useState(3);

  return (
    <XDSSlider
      label="Rating"
      value={3}
      onChange={setRating}
      min={1}
      max={5}
      step={1}
      marks={[
        { value: 1, label: 'Poor' },
        { value: 3, label: 'Average' },
        { value: 5, label: 'Excellent' },
      ]}
    />
  );
}
