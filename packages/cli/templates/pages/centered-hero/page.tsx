'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {XDSCenter} from '@xds/core/Center';
import {ArrowRightIcon} from '@heroicons/react/20/solid';

const IMAGE_URL =
  'https://scontent.xx.fbcdn.net/v/t39.6806-6/670900322_26625087630454957_5308285999469581630_n.png?_nc_cat=108&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=U_3veUDjN-sQ7kNvwGOQjoE&_nc_oc=Adr6WBPBCTNNZDhcfjcDRMKeKY6ZSrH9G9wM_BM2whjPnTRfNeyRFtm45V1Hp5AA-Og72SBvIYFtUdLhKIarS54C&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=6CnRZzvBurGWRyBWM3vfBg&_nc_ss=7a30f&oh=00_Af16gCJV1U5IMNkCWMXlufLePHwH_xC5QLD2LD8nTyVJ4g&oe=69E8C1C4';

const styles = stylex.create({
  textCenter: {
    textAlign: 'center',
  },
});

export default function CenteredHero() {
  return (
    <XDSCenter height="100dvh">
      <XDSVStack gap={6} hAlign="center" padding={6}>
        <XDSVStack gap={3} hAlign="center">
          <XDSText
            type="display-2"
            as="h1"
            weight="bold"
            textWrap="balance"
            xstyle={styles.textCenter}>
            Little joys, everywhere you go
          </XDSText>
          <XDSText
            type="body"
            color="secondary"
            textWrap="balance"
            xstyle={styles.textCenter}>
            Sometimes all it takes is one small thing to turn your whole day
            around. That\u2019s what good design is for.
          </XDSText>
        </XDSVStack>
        <XDSHStack gap={3}>
          <XDSButton
            label="Get started"
            variant="primary"
            endContent={<XDSIcon icon={ArrowRightIcon} size="sm" />}
          />
          <XDSButton label="Learn more" variant="secondary" />
        </XDSHStack>
        <img
          src={IMAGE_URL}
          alt="Serene landscape with cotton fields and towering clouds"
          style={{
            width: '100%',
            borderRadius: 'var(--radius-container)',
            display: 'block',
          }}
        />
      </XDSVStack>
    </XDSCenter>
  );
}
