# XDSTimeInput

Time input with text parsing and keyboard navigation.

## Import

```tsx
import {XDSTimeInput} from '@xds/core/TimeInput';
```

## Usage

```tsx
// Basic usage
<XDSTimeInput
  label="Start time"
  value={time}
  onChange={setTime}
/>

// 24-hour format with clear button
<XDSTimeInput
  label="Meeting time"
  value={time}
  onChange={setTime}
  hourFormat="24h"
  hasClear
/>

// With min/max constraints
<XDSTimeInput
  label="Business hours"
  value={time}
  onChange={setTime}
  min="09:00"
  max="17:00"
/>

// With seconds and validation
<XDSTimeInput
  label="Precise time"
  value={time}
  onChange={setTime}
  hasSeconds
  status={{ type: 'error', message: 'Invalid time' }}
/>
```
