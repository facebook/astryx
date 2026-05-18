// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSText} from '@xds/core/Text';

const LONG_TEXT =
  'The design system provides a consistent set of typography tokens, spacing scales, and color palettes that ensure every surface in the product feels cohesive regardless of which team built it.';

const LINES = [
  {maxLines: 1, label: '1 line'},
  {maxLines: 2, label: '2 lines'},
  {maxLines: 3, label: '3 lines'},
];

export default function TextTruncation() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        maxWidth: 300,
      }}>
      {LINES.map(({maxLines, label}) => (
        <div key={maxLines}>
          <XDSText type="supporting" color="secondary" display="block">
            {label}
          </XDSText>
          <div style={{border: '1px solid #ccc', padding: 8}}>
            <XDSText type="body" maxLines={maxLines}>
              {LONG_TEXT}
            </XDSText>
          </div>
        </div>
      ))}
    </div>
  );
}
