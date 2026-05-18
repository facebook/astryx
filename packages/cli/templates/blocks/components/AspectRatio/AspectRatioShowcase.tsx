// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSAspectRatio} from '@xds/core/AspectRatio';
import {XDSCenter} from '@xds/core/Center';
import {XDSHStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {colorVars, radiusVars} from '@xds/core/theme/tokens.stylex';

const s = stylex.create({
  square: {width: 120},
  fourThree: {width: 160},
  widescreen: {width: 200},
  box: {
    backgroundColor: colorVars['--color-background-muted'],
    border: `1px solid ${colorVars['--color-border']}`,
    borderRadius: radiusVars['--radius-container'],
  },
});

export default function AspectRatioShowcase() {
  return (
    <XDSHStack gap={4} vAlign="start">
      <XDSAspectRatio ratio={1} xstyle={[s.square, s.box]}>
        <XDSCenter width="100%" height="100%">
          <XDSText type="supporting" color="secondary">
            1 : 1
          </XDSText>
        </XDSCenter>
      </XDSAspectRatio>
      <XDSAspectRatio ratio={4 / 3} xstyle={[s.fourThree, s.box]}>
        <XDSCenter width="100%" height="100%">
          <XDSText type="supporting" color="secondary">
            4 : 3
          </XDSText>
        </XDSCenter>
      </XDSAspectRatio>
      <XDSAspectRatio ratio={16 / 9} xstyle={[s.widescreen, s.box]}>
        <XDSCenter width="100%" height="100%">
          <XDSText type="supporting" color="secondary">
            16 : 9
          </XDSText>
        </XDSCenter>
      </XDSAspectRatio>
    </XDSHStack>
  );
}
