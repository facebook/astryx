'use client';

import {useState} from 'react';
import {XDSSlider} from '@xds/core/Slider';

export default function SliderWithStatus() {
  const [value1, setValue1] = useState(95);
  const [value2, setValue2] = useState(50);
  const [value3, setValue3] = useState(75);
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        maxWidth: 400,
      }}>
      <XDSSlider
        label="CPU Usage"
        value={value1}
        onChange={setValue1}
        status={{type: 'error', message: 'CPU usage is critically high'}}
      />
      <XDSSlider
        label="Memory"
        value={value2}
        onChange={setValue2}
        status={{type: 'warning', message: 'Memory usage is moderate'}}
      />
      <XDSSlider
        label="Disk"
        value={value3}
        onChange={setValue3}
        status={{type: 'success', message: 'Disk usage is healthy'}}
      />
    </div>
  );
}
