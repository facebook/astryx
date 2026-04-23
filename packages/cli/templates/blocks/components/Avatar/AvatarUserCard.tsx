'use client';

import {XDSAvatar, XDSAvatarStatusDot} from '@xds/core/Avatar';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const USERS = [
  {
    name: 'Alice Chen',
    role: 'Engineering Lead',
    variant: 'positive' as const,
    src: 'https://scontent.xx.fbcdn.net/v/t39.6806-6/125033562_1327282494287626_2042282178258670185_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=vzgGdeIjaAsQ7kNvwFHfGzn&_nc_oc=AdpvH47kr5fnEWv9bZm7Cgz4YGzVh-jP4pivdmuJu-Ym8LrqtoxumbG4EBHaKE3sP5Yc3G7mzmC2FJZNCNzcmtvt&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=GLOQe78SvUVPef1glEtmsQ&_nc_ss=7a3a8&oh=00_Af3P1YVawrU1yM6TH5D3g9KoFJafkwfn6Jyb6U_sBYC0Xg&oe=69ECC34D',
  },
  {
    name: 'Bob Smith',
    role: 'Product Designer',
    variant: 'neutral' as const,
    src: 'https://scontent.xx.fbcdn.net/v/t39.6806-6/245682593_1255004628297724_3577570150049820589_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=5whLKM1RM6cQ7kNvwEaVbq9&_nc_oc=AdrhyQWW2ege8gqf30rO5lcQYZkZm5px0FUpZ5Xy9Ku8ytqQ7BRu8E3PE2mfeL3XoZLgHziwkpyAVSx5JuIngcAb&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=jnfsnwuykaxT-95F9LitEA&_nc_ss=7a3a8&oh=00_Af31tshg5zaXtReOyztoPwk8MYjKnG0mqIBiUyyaXu8FEQ&oe=69ECAF30',
  },
  {
    name: 'Carol Davis',
    role: 'Engineering Manager',
    variant: 'negative' as const,
    src: 'https://scontent.xx.fbcdn.net/v/t39.6806-6/125254126_809656226491943_540743226571944946_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=vCg2YyCmg8wQ7kNvwHmiD4H&_nc_oc=AdqFfGEd6zdwAc8hDMapKPHvU8umJD4w0HKiVvDJhLk_3Xww__VCIGln0XZ6-46pThhfqNUu6tS-Jx1uzFLVN6vR&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=H25yQ08lrLVo_1RpPU6wwg&_nc_ss=7a3a8&oh=00_Af2vT0tGj7AfYSXac45kd2dwzEWfjzLwpAV_y6hO3Ec-wA&oe=69ECB6C9',
  },
];

export default function AvatarUserCard() {
  return (
    <XDSStack direction="vertical" gap={4}>
      {USERS.map(user => (
        <XDSStack
          key={user.name}
          direction="horizontal"
          gap={3}
          vAlign="center">
          <XDSAvatar
            src={user.src}
            name={user.name}
            size="medium"
            status={
              <XDSAvatarStatusDot variant={user.variant} label={user.variant} />
            }
          />
          <XDSStack direction="vertical" gap={0}>
            <XDSText type="body" weight="bold">
              {user.name}
            </XDSText>
            <XDSText type="supporting" color="secondary">
              {user.role}
            </XDSText>
          </XDSStack>
        </XDSStack>
      ))}
    </XDSStack>
  );
}
