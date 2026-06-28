// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Thumbnail} from '@astryxdesign/core/Thumbnail';
import {Stack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

// Inline data URI so the example is self-contained and same-origin — see
// ThumbnailRemovable for why image-backed Thumbnails avoid cross-origin URLs.
const SCENE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAB90lEQVR42u1YTU/CQBDdNiWxrVf7AXrAgnx4Rv7/Ub2LH/GgQgFjxAMIDSbrQWIKdOl0u6VdnckeaDr75j2mb7O7yvt0SWQOjVIqtQCVSB4alV0AodgB9ACuQugByVYhS7sMP75+dXMUoIw+Ani2vU49HOOcZKhC2Me+zbADwwmoA04JxG+07Ba3A8UMxZ8sYpPc0hUccbi8kHwvtN+FWZOc/5/YC4nuAC1eBwYB1JfwzIJ6YP87K5UQChn9oBOL1Q86QDSBQ3l+m8Plnhxcs169LDq5mDiZgEgZeVFfCXhKLgBvJfBEhrcS2AH0QKgDlBRqVI/0RPlqofhXLZ0QUrV0+JQCeeDU0iN/7/s8wBeerW/reRzPIasQf889Wxf3+bBUxUzk94BnG4QQzzbSc/+BYh0w4jzAVbMWKlmzjTT0a2z2EHDlfjhL9LHWneh6D6NPjk+fhQYHV0XVqzsGkE1S9rszVUoJcEDq1R1DIBoEGdqBM9cQmAlHi52l3PrT3dMarslR7I5tLT5AFrKaBfv0LOHIuzyQkkTDNYVjbiMzO9AsC6jULJthHCGYmx64GWx6oJVBmZ4/Ew7b82cR54Es2Gf0p7TKJqHrJ7J2JSvnZRStiqn97gTblUNJbyXI+bGU1FcmxmsVFIACUAAKQAEoAAX8YwHfLyw0mt5gMHQAAAAASUVORK5CYII=';

export default function ThumbnailDisabled() {
  return (
    <Stack direction="vertical" gap={4}>
      <Stack direction="vertical" gap={1}>
        <Text type="supporting" color="secondary">
          Enabled
        </Text>
        <Stack direction="horizontal" gap={3} vAlign="center">
          <Thumbnail
            src={SCENE}
            alt="Bright landscape"
            label="landscape.jpg"
            onRemove={() => {}}
          />
          <Thumbnail label="document.pdf" onRemove={() => {}} />
        </Stack>
      </Stack>
      <Stack direction="vertical" gap={1}>
        <Text type="supporting" color="secondary">
          Disabled
        </Text>
        <Stack direction="horizontal" gap={3} vAlign="center">
          <Thumbnail
            src={SCENE}
            alt="Bright landscape"
            label="landscape.jpg"
            onRemove={() => {}}
            isDisabled
          />
          <Thumbnail label="document.pdf" onRemove={() => {}} isDisabled />
        </Stack>
      </Stack>
    </Stack>
  );
}
