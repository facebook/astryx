// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Blockquote} from '@astryxdesign/core/Blockquote';
import {Grid, GridSpan} from '@astryxdesign/core/Grid';
import {Card} from '@astryxdesign/core/Card';

export default function BlockquoteTestimonials() {
  return (
    <Grid columns={2} gap={3} style={{maxWidth: 600}}>
      <Card padding={4}>
        <Blockquote cite="Sarah K., Lead Engineer">
          Shipping UI has never been this fast. Our team went from design to
          production in a single afternoon.
        </Blockquote>
      </Card>
      <Card padding={4}>
        <Blockquote cite="Marcus T., Product Designer">
          The token system means every new screen just looks right — no manual
          color or spacing decisions.
        </Blockquote>
      </Card>
      <GridSpan columns={2}>
        <Card padding={4}>
          <Blockquote cite="Priya L., Engineering Manager">
            Onboarding a new engineer used to take a week of design review. Now
            they're shipping accessible, polished components on day one.
          </Blockquote>
        </Card>
      </GridSpan>
    </Grid>
  );
}
