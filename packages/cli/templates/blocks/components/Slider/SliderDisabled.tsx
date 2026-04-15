'use client';

import {XDSSlider} from '@xds/core/Slider';

export default function SliderDisabled() {
  return (
    <XDSSlider
      label="Locked"
      value={50}
      onChange={() => {}}
      isDisabled
    />
  );
}
