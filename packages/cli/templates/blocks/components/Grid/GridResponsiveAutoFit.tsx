// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {spacingVars} from '@xds/core/theme/tokens.stylex';
import {Grid} from '@xds/core/Grid';
import {Card} from '@xds/core/Card';
import {Layout, LayoutContent, LayoutPanel} from '@xds/core/Layout';
import {useResizable, ResizeHandle} from '@xds/core/Resizable';
import {VStack} from '@xds/core/Stack';
import {Text} from '@xds/core/Text';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  panel: {
    padding: spacingVars['--spacing-4'],
  },
});

const teams = [
  {name: 'Design Systems', members: 8},
  {name: 'Frontend Platform', members: 12},
  {name: 'Developer Experience', members: 6},
  {name: 'Accessibility', members: 4},
  {name: 'Performance', members: 7},
  {name: 'Mobile Infrastructure', members: 9},
];

export default function GridResponsiveAutoFit() {
  const gridPanel = useResizable({
    defaultSize: 480,
    minSizePx: 100,
    maxSizePx: 480,
  });

  return (
    <Card
      variant="muted"
      padding={0}
      height={400}
      width="100%"
      style={{maxWidth: 500}}>
      <Layout
        height="fill"
        start={
          <>
            <LayoutPanel
              width={gridPanel.size}
              hasDivider={false}
              xstyle={styles.panel}>
              <Grid
                columns={{minWidth: 180, repeat: 'fit'}}
                gap={4}
                width="100%">
                {teams.map(team => (
                  <Card key={team.name}>
                    <VStack gap={1}>
                      <Text type="label" display="block">
                        {team.name}
                      </Text>
                      <Text type="supporting" display="block">
                        {team.members} members
                      </Text>
                    </VStack>
                  </Card>
                ))}
              </Grid>
            </LayoutPanel>
            <ResizeHandle
              direction="horizontal"
              hasDivider
              isAlwaysVisible
              resizable={gridPanel.props}
              label="Resize grid"
            />
          </>
        }
        content={<LayoutContent />}
      />
    </Card>
  );
}
