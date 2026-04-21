'use client';

import {XDSAvatar} from '@xds/core/Avatar';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import * as stylex from '@stylexjs/stylex';

const USERS = [
  {
    name: 'Alice Chen',
    src: 'https://scontent.xx.fbcdn.net/v/t39.6806-6/125033562_1327282494287626_2042282178258670185_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=vzgGdeIjaAsQ7kNvwFHfGzn&_nc_oc=AdpvH47kr5fnEWv9bZm7Cgz4YGzVh-jP4pivdmuJu-Ym8LrqtoxumbG4EBHaKE3sP5Yc3G7mzmC2FJZNCNzcmtvt&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=GLOQe78SvUVPef1glEtmsQ&_nc_ss=7a3a8&oh=00_Af3P1YVawrU1yM6TH5D3g9KoFJafkwfn6Jyb6U_sBYC0Xg&oe=69ECC34D',
  },
  {
    name: 'Bob Smith',
    src: 'https://scontent.xx.fbcdn.net/v/t39.6806-6/125177712_365375627873213_5953439887886251969_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=3NVjmTHfk2IQ7kNvwHFZAVJ&_nc_oc=Adpms1qplfKnvE8bmzhU24MgxsNEbNJ8gnjrbDrB3t8VuDcqAEmdQoiSzrBgSCG6lWGvt5NOItuJ4UIYPVbG7vEa&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=-Y0meVgm9bx3SdBmFuHZRg&_nc_ss=7a3a8&oh=00_Af0L5E0SYlatciEXHAcrTaWKDR1JKP8TBD7HZs6wvOSEjg&oe=69ECBF29',
  },
  {
    name: 'Carol Davis',
    src: 'https://scontent.xx.fbcdn.net/v/t39.6806-6/245682593_1255004628297724_3577570150049820589_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=5whLKM1RM6cQ7kNvwEaVbq9&_nc_oc=AdrhyQWW2ege8gqf30rO5lcQYZkZm5px0FUpZ5Xy9Ku8ytqQ7BRu8E3PE2mfeL3XoZLgHziwkpyAVSx5JuIngcAb&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=jnfsnwuykaxT-95F9LitEA&_nc_ss=7a3a8&oh=00_Af31tshg5zaXtReOyztoPwk8MYjKnG0mqIBiUyyaXu8FEQ&oe=69ECAF30',
  },
  {
    name: 'Dan Wilson',
    src: 'https://scontent.xx.fbcdn.net/v/t39.6806-6/125254126_809656226491943_540743226571944946_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=vCg2YyCmg8wQ7kNvwHmiD4H&_nc_oc=AdqFfGEd6zdwAc8hDMapKPHvU8umJD4w0HKiVvDJhLk_3Xww__VCIGln0XZ6-46pThhfqNUu6tS-Jx1uzFLVN6vR&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=H25yQ08lrLVo_1RpPU6wwg&_nc_ss=7a3a8&oh=00_Af2vT0tGj7AfYSXac45kd2dwzEWfjzLwpAV_y6hO3Ec-wA&oe=69ECB6C9',
  },
  {
    name: 'Eve Park',
    src: 'https://scontent.xx.fbcdn.net/v/t39.6806-6/124863061_1481250052072229_2189314572828588300_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=9Ryu-r4FG_gQ7kNvwGKdqFO&_nc_oc=Adr5Y_Ui6i4f4I-1_sG55i6AmAU-jwOjlnjrGUkWv0vRIBzXZdtW9Q4xp_99uJ9n6ZeqHPXg7bVeLJNJMIM9K6eB&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=PvhmyvyN5oFeUiI9hncHkA&_nc_ss=7a3a8&oh=00_Af0lT-Bd7ddKAOnib2SY0qwze40acOqzoVWBLrIUHzZzKA&oe=69ECCA1F',
  },
];

const groupStyles = stylex.create({
  overlap: (offset: number) => ({
    marginLeft: offset,
    borderRadius: '50%',
    border: '2px solid var(--color-background-surface, #fff)',
  }),
});

export default function AvatarGroup() {
  return (
    <XDSStack direction="vertical" gap={8}>
      <XDSStack direction="vertical" gap={3}>
        <XDSText type="supporting" color="secondary">
          Team members
        </XDSText>
        <XDSStack direction="horizontal" vAlign="center">
          {USERS.map((user, i) => (
            <XDSStack
              direction="vertical"
              key={user.name}
              {...stylex.props(groupStyles.overlap(i === 0 ? 0 : -10))}>
              <XDSAvatar src={user.src} name={user.name} size="small" />
            </XDSStack>
          ))}
          <XDSStack
            direction="vertical"
            {...stylex.props(groupStyles.overlap(-10))}>
            <XDSAvatar name="+3" size="small" />
          </XDSStack>
        </XDSStack>
      </XDSStack>
      <XDSStack direction="vertical" gap={3}>
        <XDSText type="supporting" color="secondary">
          Larger group
        </XDSText>
        <XDSStack direction="horizontal" vAlign="center">
          {USERS.slice(0, 3).map((user, i) => (
            <XDSStack
              direction="vertical"
              key={user.name}
              {...stylex.props(groupStyles.overlap(i === 0 ? 0 : -14))}>
              <XDSAvatar src={user.src} name={user.name} size="medium" />
            </XDSStack>
          ))}
          <XDSStack
            direction="vertical"
            {...stylex.props(groupStyles.overlap(-14))}>
            <XDSAvatar name="+8" size="medium" />
          </XDSStack>
        </XDSStack>
      </XDSStack>
    </XDSStack>
  );
}
