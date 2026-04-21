'use client';

import {XDSAvatar} from '@xds/core/Avatar';

export default function AvatarFallbackChain() {
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
      <div>
        <p style={{margin: '0 0 8px', fontSize: 13}}>Valid src</p>
        <XDSAvatar
          src="https://scontent.xx.fbcdn.net/v/t39.6806-6/125033562_1327282494287626_2042282178258670185_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=vzgGdeIjaAsQ7kNvwFHfGzn&_nc_oc=AdpvH47kr5fnEWv9bZm7Cgz4YGzVh-jP4pivdmuJu-Ym8LrqtoxumbG4EBHaKE3sP5Yc3G7mzmC2FJZNCNzcmtvt&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=GLOQe78SvUVPef1glEtmsQ&_nc_ss=7a3a8&oh=00_Af3P1YVawrU1yM6TH5D3g9KoFJafkwfn6Jyb6U_sBYC0Xg&oe=69ECC34D"
          name="Alice Chen"
          size="large"
        />
      </div>
      <div>
        <p style={{margin: '0 0 8px', fontSize: 13}}>
          Invalid src, valid fallbackSrc
        </p>
        <XDSAvatar
          src="https://invalid-url.example/broken.jpg"
          fallbackSrc="https://scontent.xx.fbcdn.net/v/t39.6806-6/245682593_1255004628297724_3577570150049820589_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=5whLKM1RM6cQ7kNvwEaVbq9&_nc_oc=AdrhyQWW2ege8gqf30rO5lcQYZkZm5px0FUpZ5Xy9Ku8ytqQ7BRu8E3PE2mfeL3XoZLgHziwkpyAVSx5JuIngcAb&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=jnfsnwuykaxT-95F9LitEA&_nc_ss=7a3a8&oh=00_Af31tshg5zaXtReOyztoPwk8MYjKnG0mqIBiUyyaXu8FEQ&oe=69ECAF30"
          name="Bob Smith"
          size="large"
        />
      </div>
      <div>
        <p style={{margin: '0 0 8px', fontSize: 13}}>Both invalid, has name</p>
        <XDSAvatar
          src="https://invalid-url.example/broken.jpg"
          fallbackSrc="https://also-invalid.example/broken.jpg"
          name="Carol Davis"
          size="large"
        />
      </div>
      <div>
        <p style={{margin: '0 0 8px', fontSize: 13}}>All invalid, no name</p>
        <XDSAvatar src="https://invalid-url.example/broken.jpg" size="large" />
      </div>
    </div>
  );
}
