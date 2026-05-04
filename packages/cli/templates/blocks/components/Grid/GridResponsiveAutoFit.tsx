'use client';

import {spacingVars} from '@xds/core/theme/tokens.stylex';
import {XDSGrid} from '@xds/core/Grid';
import {XDSCard} from '@xds/core/Card';
import {XDSLayout, XDSLayoutContent, XDSLayoutPanel} from '@xds/core/Layout';
import {useXDSResizable, XDSResizeHandle} from '@xds/core/Resizable';
import {XDSVStack} from '@xds/core/Stack';
import {XDSText} from '@xds/core/Text';
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
  const gridPanel = useXDSResizable({
    defaultSize: 480,
    minSizePx: 100,
    maxSizePx: 480,
  });

  return (
    <XDSCard
      variant="muted"
      padding={0}
      height={400}
      width="100%"
      style={{maxWidth: 500}}>
      <XDSLayout
        height="fill"
        start={
          <>
            <XDSLayoutPanel
              width={gridPanel.size}
              hasDivider={false}
              xstyle={styles.panel}>
              <XDSGrid
                columns={{minWidth: 180, repeat: 'fit'}}
                gap={4}
                width="100%">
                {teams.map(team => (
                  <XDSCard key={team.name}>
                    <XDSVStack gap={1}>
                      <XDSText type="label" display="block">
                        {team.name}
                      </XDSText>
                      <XDSText type="supporting" display="block">
                        {team.members} members
                      </XDSText>
                    </XDSVStack>
                  </XDSCard>
                ))}
              </XDSGrid>
            </XDSLayoutPanel>
            <XDSResizeHandle
              direction="horizontal"
              hasDivider
              isAlwaysVisible
              resizable={gridPanel.props}
              label="Resize grid"
            />
          </>
        }
        content={<XDSLayoutContent />}
      />
    </XDSCard>
  );
}
