'use client';

import {XDSAvatar, XDSAvatarStatusDot} from '@xds/core/Avatar';
import {XDSStack} from '@xds/core/Layout';

export default function AvatarWithStatus() {
  return (
    <XDSStack direction="horizontal" gap={4} vAlign="center">
      <XDSAvatar
        src="https://scontent.xx.fbcdn.net/v/t39.6806-6/125033562_1327282494287626_2042282178258670185_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=vzgGdeIjaAsQ7kNvwFHfGzn&_nc_oc=AdpvH47kr5fnEWv9bZm7Cgz4YGzVh-jP4pivdmuJu-Ym8LrqtoxumbG4EBHaKE3sP5Yc3G7mzmC2FJZNCNzcmtvt&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=GLOQe78SvUVPef1glEtmsQ&_nc_ss=7a3a8&oh=00_Af3P1YVawrU1yM6TH5D3g9KoFJafkwfn6Jyb6U_sBYC0Xg&oe=69ECC34D"
        name="Alice Chen"
        size="large"
        status={<XDSAvatarStatusDot variant="positive" label="Online" />}
      />
      <XDSAvatar
        src="https://scontent.xx.fbcdn.net/v/t39.6806-6/245682593_1255004628297724_3577570150049820589_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=5whLKM1RM6cQ7kNvwEaVbq9&_nc_oc=AdrhyQWW2ege8gqf30rO5lcQYZkZm5px0FUpZ5Xy9Ku8ytqQ7BRu8E3PE2mfeL3XoZLgHziwkpyAVSx5JuIngcAb&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=jnfsnwuykaxT-95F9LitEA&_nc_ss=7a3a8&oh=00_Af31tshg5zaXtReOyztoPwk8MYjKnG0mqIBiUyyaXu8FEQ&oe=69ECAF30"
        name="Bob Smith"
        size="large"
        status={<XDSAvatarStatusDot variant="neutral" label="Offline" />}
      />
      <XDSAvatar
        src="https://scontent.xx.fbcdn.net/v/t39.6806-6/124863061_1481250052072229_2189314572828588300_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=9Ryu-r4FG_gQ7kNvwGKdqFO&_nc_oc=Adr5Y_Ui6i4f4I-1_sG55i6AmAU-jwOjlnjrGUkWv0vRIBzXZdtW9Q4xp_99uJ9n6ZeqHPXg7bVeLJNJMIM9K6eB&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=PvhmyvyN5oFeUiI9hncHkA&_nc_ss=7a3a8&oh=00_Af0lT-Bd7ddKAOnib2SY0qwze40acOqzoVWBLrIUHzZzKA&oe=69ECCA1F"
        name="Carol Davis"
        size="large"
        status={<XDSAvatarStatusDot variant="negative" label="Busy" />}
      />
    </XDSStack>
  );
}
