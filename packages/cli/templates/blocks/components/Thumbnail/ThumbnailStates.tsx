// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Thumbnail} from '@astryxdesign/core/Thumbnail';
import {Stack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

// Inline same-origin data URI so the example is self-contained — see
// ThumbnailRemovable for why image-backed Thumbnails avoid cross-origin URLs.
const MISTY_VALLEY =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAwFBMVEWPnaqJmKSIlaKHlaGGlaKGk6CEkp6Ckp+Cj5uAj51/jZp6i5h8ipd7iZZ4hpR1g5FzhpdzhJN0g5FuhZdsgpVqgZRpgJNpf5JmfpFufYxufYtlfJBpe4tke49neo1ieo5kd4tndoZidopheY1geIxfd4tmdYVddYpcdIlbc4hgcoNebn5ZcodYcYZXb4VVboRUbYNTbIJaantWaXxRa4FQaYBPaH9NZ35UZXZQY3dMZn1LZXxKZHxMYHRKXnIoOEh3WzsBAAABeElEQVR42u3T11oCQQyG4R9FEREFqVJEgh17xbZ7/3cl29gpmQGeeOh7OF+Ss8G3EL6E8CmEdyG8CeFVCC9CeBTCgxDuhXAnhFsh3AjhSgiXQrgQwtlayHrB6TqIyHzCREMTH4rpbxip5nnkRintEUNF0oc8yqnP6Oey3ueQSnlHN6P0ro0Mi4BOSu8dA1mygnbC7G0NMdKEVszuLQXx4oZmhO3NDLlEEY05R280PDGbgD0RaBeI/Bdg7weBMkDLwF4PtBOcwH0gCJZf0DPYdd8Jo8K177hgZbjW+RN2hWffusBVnMR+XE5yfMRx5MPtOOOI0Xd+9ot/rTOiVrtepuabwcDwNFgP6przSH0dqKiOUhUfvaKcO8yVncyM0sK+psSyK4qpPUvRwlUUYrusgoaviG27YMFXNz38I0nc8PNPAFtC2BFClRFWV4cDU5g4WEE0hJ4q1PU8sgmMF0LOmKN2TBOh21RjRsxms3C5WYwrCIX+D/zBgV8HCFv4gVKf1AAAAABJRU5ErkJggg==';

export default function ThumbnailStates() {
  return (
    <Stack direction="vertical" gap={4}>
      <Stack direction="vertical" gap={1}>
        <Text type="supporting" color="secondary">
          Lifecycle: empty → uploading → processing → loaded
        </Text>
        <Stack direction="horizontal" gap={3} vAlign="end">
          <Stack direction="vertical" gap={1} hAlign="center">
            <Thumbnail label="report.pdf" />
            <Text type="supporting" color="secondary">
              Placeholder
            </Text>
          </Stack>
          <Stack direction="vertical" gap={1} hAlign="center">
            <Thumbnail isLoading label="uploading.jpg" />
            <Text type="supporting" color="secondary">
              Skeleton
            </Text>
          </Stack>
          <Stack direction="vertical" gap={1} hAlign="center">
            <Thumbnail
              src={MISTY_VALLEY}
              alt="Misty mountain valley"
              isLoading
              label="misty-valley.jpg"
            />
            <Text type="supporting" color="secondary">
              Uploading
            </Text>
          </Stack>
          <Stack direction="vertical" gap={1} hAlign="center">
            <Thumbnail
              src={MISTY_VALLEY}
              alt="Misty mountain valley"
              label="misty-valley.jpg"
            />
            <Text type="supporting" color="secondary">
              Loaded
            </Text>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}
