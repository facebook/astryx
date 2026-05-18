// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSText} from '@xds/core/Text';

export default function TextWrap() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        maxWidth: 400,
      }}>
      <div>
        <XDSText type="label" display="block">
          Wrap (default)
        </XDSText>
        <div style={{border: '1px solid #ccc', padding: 8, width: 200}}>
          <XDSText type="body" textWrap="wrap">
            This text wraps normally at word boundaries when it reaches the
            edge.
          </XDSText>
        </div>
      </div>
      <div>
        <XDSText type="label" display="block">
          Nowrap
        </XDSText>
        <div
          style={{
            border: '1px solid #ccc',
            padding: 8,
            width: 200,
            overflow: 'hidden',
          }}>
          <XDSText type="body" textWrap="nowrap">
            This text does not wrap and will overflow its container.
          </XDSText>
        </div>
      </div>
      <div>
        <XDSText type="label" display="block">
          Balance
        </XDSText>
        <div style={{border: '1px solid #ccc', padding: 8, width: 200}}>
          <XDSText type="body" textWrap="balance">
            This text is balanced for better visual appearance across lines.
          </XDSText>
        </div>
      </div>
      <div>
        <XDSText type="label" display="block">
          Pretty
        </XDSText>
        <div style={{border: '1px solid #ccc', padding: 8, width: 200}}>
          <XDSText type="body" textWrap="pretty">
            This text uses pretty wrap to avoid orphans at the end of
            paragraphs.
          </XDSText>
        </div>
      </div>
    </div>
  );
}
