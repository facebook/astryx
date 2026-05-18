// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSText} from '@xds/core/Text';

export default function TextWordBreak() {
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
          Break-word (default for multi-line)
        </XDSText>
        <div style={{width: 200, border: '1px solid #ccc', padding: 8}}>
          <XDSText type="body" maxLines={2} wordBreak="break-word">
            This is a verylongunbreakableword for a break-word example
          </XDSText>
        </div>
      </div>
      <div>
        <XDSText type="label" display="block">
          Break-all (default for single-line)
        </XDSText>
        <div style={{width: 200, border: '1px solid #ccc', padding: 8}}>
          <XDSText type="body" maxLines={2} wordBreak="break-all">
            Breaks anywhere: abcdefghijklmnopqrstuvwxyz0123456789
          </XDSText>
        </div>
      </div>
    </div>
  );
}
