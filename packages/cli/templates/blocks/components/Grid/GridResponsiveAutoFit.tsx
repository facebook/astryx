'use client';

import {XDSGrid} from '@xds/core/Grid';
import {XDSCard} from '@xds/core/Card';
import {XDSVStack} from '@xds/core/Stack';
import {XDSText} from '@xds/core/Text';

const teams = [
  {name: 'Design Systems', members: 8},
  {name: 'Frontend Platform', members: 12},
  {name: 'Developer Experience', members: 6},
  {name: 'Accessibility', members: 4},
  {name: 'Performance', members: 7},
  {name: 'Mobile Infrastructure', members: 9},
];

export default function GridResponsiveAutoFit() {
  return (
    <XDSGrid columns={{minWidth: 200, repeat: 'fit'}} gap={4}>
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
  );
}
