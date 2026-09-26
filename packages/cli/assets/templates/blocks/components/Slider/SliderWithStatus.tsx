// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {Slider} from '@astryxdesign/core/Slider';
import {VStack} from '@astryxdesign/core/Layout';

export default function SliderWithStatus() {
  const [value1, setValue1] = useState(95);
  const [value2, setValue2] = useState(50);
  const [value3, setValue3] = useState(75);
  return (
    <div style={{width: 300}}>
      <VStack gap={6}>
        <Slider
          label="CPU Usage"
          value={value1}
          onChange={setValue1}
          status={{type: 'error', message: 'CPU usage is critically high'}}
        />
        <Slider
          label="Memory"
          value={value2}
          onChange={setValue2}
          status={{type: 'warning', message: 'Memory usage is moderate'}}
        />
        <Slider
          label="Disk"
          value={value3}
          onChange={setValue3}
          status={{type: 'success', message: 'Disk usage is healthy'}}
        />
      </VStack>
    </div>
  );
}
