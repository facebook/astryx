// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Stat} from '@astryxdesign/core/Stat';
import {Grid} from '@astryxdesign/core/Grid';

export default function StatShowcase() {
  return (
    <Grid columns={{minWidth: 160, repeat: 'fit'}} gap={6}>
      <Stat
        label="Total revenue"
        value="$1.28M"
        delta={{value: '+12.4%', direction: 'up'}}
        description="vs. previous 30 days"
      />
      <Stat
        label="Error rate"
        value="0.42%"
        delta={{value: '-0.08%', direction: 'down', sentiment: 'positive'}}
        description="vs. previous 30 days"
      />
      <Stat
        label="Active users"
        value="18,204"
        delta={{value: '0.0%', direction: 'flat'}}
        description="vs. previous 30 days"
      />
    </Grid>
  );
}
