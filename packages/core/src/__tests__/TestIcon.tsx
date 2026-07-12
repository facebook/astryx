// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TestIcon.tsx
 * @input Standard SVG props
 * @output A minimal SVG React component for tests
 * @position Test fixture; a stand-in external SVG icon for Icon component-mode tests
 *
 * A trivial SVG component used by tests that need to pass a custom SVG icon to
 * `Icon` (component mode) or component `*Icon` props. It forwards all standard
 * SVG props and its ref so tests exercising prop/ref forwarding behave the same
 * as a real third-party icon component.
 */

import React, {type SVGProps} from 'react';

export function TestIcon({
  ref,
  ...props
}: SVGProps<SVGSVGElement> & {ref?: React.Ref<SVGSVGElement>}) {
  return (
    <svg ref={ref} viewBox="0 0 24 24" {...props}>
      <path d="M4 4h16v16H4z" />
    </svg>
  );
}
