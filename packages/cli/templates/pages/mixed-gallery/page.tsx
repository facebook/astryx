'use client';

import {XDSAppShell} from '@xds/core/AppShell';
import {XDSVStack, XDSStackItem} from '@xds/core/Layout';
import {XDSCenter} from '@xds/core/Center';
import {XDSText} from '@xds/core/Text';
import {XDSSection} from '@xds/core/Section';
import {XDSGrid} from '@xds/core/Grid';

const IMAGES = [
  // Column 1: illustrative-horizontal-1
  'https://scontent.xx.fbcdn.net/v/t39.6806-6/670836735_2461791954280697_1048571955964692895_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=b9DqIpmzyeAQ7kNvwEuVNYV&_nc_oc=Adqx7M8RaKihjC8dSQUH_YjYNSkC7dv34yH96ndekQT74zfo2M6_DMfY-HyXDGEgXYHKMGTPSBWROmTm7oSKCaPg&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=e6YHUehLaMQde9dotUaFJw&_nc_ss=7a30f&oh=00_Af2odB5hzmvCl0lYC5CdnJjHLVeooKOjOOPItWbo1K-2tg&oe=69E6FAAB',
  // Column 1: light-home-horizontal-1
  'https://scontent.xx.fbcdn.net/v/t39.6806-6/672683340_1522469159433922_7776167798061220106_n.png?_nc_cat=101&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=Qpd2UWP6VgEQ7kNvwE-OPni&_nc_oc=AdrBHciJphXt9BtYMnlljRItaFe9QR13GbHjolSlqWeoP37sfn-C414s177sJjM7dk8xymfEjEIkYoEd8bspGCMK&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=Lt9qRH3XlVoT53AL30YKsA&_nc_ss=7a30f&oh=00_Af0tIOpEarNFMfXkSd3D5DVXSUqIKjx9toPEqC89IupM5A&oe=69E6E494',
  // Column 2: light-lifestyle-vertical-3
  'https://scontent.xx.fbcdn.net/v/t39.6806-6/673630979_2366966167048970_507510466630095319_n.png?_nc_cat=103&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=hayXnp1KwWwQ7kNvwE6OwnY&_nc_oc=AdrKqob4CUU2_FrICyqd-B1NVcZ_p6oN45HC6nOs4_NJs-zvYEaj0pRdsvm5oBgVXMMQ-QIYfYEdY7NPSlkmD0VF&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=wxPGUKGIf3ihSjnc_4pFdQ&_nc_ss=7a30f&oh=00_Af3cPR8RHrFZTUPXixsgg3N4iz7847JxcTfJUbK1nisSPg&oe=69E6EAD4',
  // Column 3: light-lifestyle-vertical-1
  'https://scontent.xx.fbcdn.net/v/t39.6806-6/669447541_4390219861306657_6002100073104319158_n.png?_nc_cat=108&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=sXKFHmKfCccQ7kNvwGsGpL1&_nc_oc=Adqy06LYMJsViftx1OlQnquClJHettJcc9a0z0BO_mx-979b2VldT8nPRe6J3BwPheu3AlAk6N4LlItaO3vU9xg4&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=H412Z-rQCOugLK-6ss0CDA&_nc_ss=7a30f&oh=00_Af0LKXjbNPwFyK0rA1mnGPK57ctb0rzjTS5jwzXB03oPBw&oe=69E6E58D',
  // Column 3: light-lifestyle-horizontal-1
  'https://scontent.xx.fbcdn.net/v/t39.6806-6/673173617_1842726693762408_2908608806392112143_n.png?_nc_cat=107&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=ipqP09C42_gQ7kNvwHwibG0&_nc_oc=Ado97zfee8ejAhB0dqWyWz4lhsi0K7kf9W9wFBfqvD7cm3mh9le59yGFgbdkzIWO255x4Oe7bwc_vnSh41GvAxTk&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=1ZhYNPWwWg8iLLqOsj0aUg&_nc_ss=7a30f&oh=00_Af340jh-0cJ2G-NDCnGJNrXd-RuAXXawyADjOqNP7tOD7Q&oe=69E712D6',
];

const imgStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: 'var(--radius-element, 8px)',
  display: 'block',
  minHeight: 0,
};

export default function MixedGalleryTemplate() {
  return (
    <XDSAppShell height="fill" contentPadding={6} variant="surface">
      <XDSCenter axis="horizontal" height="100%">
        <XDSVStack
          gap={6}
          style={{maxWidth: 1400, width: '100%', height: '100%'}}>
          {/* Header */}
          <XDSCenter axis="horizontal">
            <XDSCenter width={680}>
              <XDSVStack gap={2} style={{textAlign: 'center'}}>
                <XDSText
                  type="large"
                  weight="bold"
                  as="p"
                  style={{fontSize: 'var(--font-size-2xl)'}}>
                  Make every day a little more delightful, one small detail at a
                  time.
                </XDSText>
                <XDSText type="body">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua
                  ut enim ad minim excepteur sint occaecat cupidatat non
                  proident.
                </XDSText>
              </XDSVStack>
            </XDSCenter>
          </XDSCenter>

          {/* Grid fills remaining space */}
          <XDSStackItem size="fill">
            <XDSGrid columns={3} gap={4} height="100%">
              {/* Left column */}
              <XDSVStack gap={4} style={{minHeight: 0}}>
                <XDSStackItem size="fill">
                  <img src={IMAGES[0]} alt="" style={imgStyle} />
                </XDSStackItem>
                <XDSStackItem size="fill">
                  <img src={IMAGES[1]} alt="" style={{...imgStyle, flex: 2}} />
                </XDSStackItem>
              </XDSVStack>

              {/* Center column — single tall image */}
              <img src={IMAGES[2]} alt="" style={imgStyle} />

              {/* Right column */}
              <XDSVStack gap={4} style={{minHeight: 0}}>
                <XDSStackItem size="fill">
                  <img src={IMAGES[3]} alt="" style={imgStyle} />
                </XDSStackItem>
                <XDSStackItem size="fill">
                  <img src={IMAGES[4]} alt="" style={imgStyle} />
                </XDSStackItem>
              </XDSVStack>
            </XDSGrid>
          </XDSStackItem>
        </XDSVStack>
      </XDSCenter>
    </XDSAppShell>
  );
}
