'use client';

import {useState} from 'react';
import {XDSSlider} from '@xds/core/Slider';

const commitBrightness = (_v: number) => {};

export default function SliderWithOnChangeEndForCommittingValue() {
  const [brightness, setBrightness] = useState(50);

  return (
    <XDSSlider
      label="Brightness"
      value={brightness}
      onChange={setBrightness}
      onChangeEnd={commitBrightness}
    />
  );
}
