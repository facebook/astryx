'use client';

import {XDSAppShell} from '@xds/core/AppShell';
import {XDSVStack} from '@xds/core/Layout';
import {XDSCenter} from '@xds/core/Center';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSGrid} from '@xds/core/Grid';
import {XDSAspectRatio} from '@xds/core/AspectRatio';
import {XDSIcon} from '@xds/core/Icon';
import {XDSSection} from '@xds/core/Section';
import {ArrowRightIcon} from '@heroicons/react/24/outline';
import * as stylex from '@stylexjs/stylex';

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = stylex.create({
  imageWrapper: {
    borderRadius: 'var(--radius-container)',
    overflow: 'clip',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
});

// ─── Product Data ───────────────────────────────────────────────────────────

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
}

const PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Going places',
    description:
      "Sometimes all it takes is one small thing to turn your whole day around. That's what good design is for.",
    price: 75.0,
    // illustrative-horizontal-1 from xds_oss asset set
    image:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/670836735_2461791954280697_1048571955964692895_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=PqyUZYYCE1EQ7kNvwGpA_Kp&_nc_oc=AdrRhXpBSrOK-N3AHrYhuworVLdzC0CRe6ENUkQ6D4nl-fMZCLAVHlF26nE3VFAzARKQDGMq6jtimRG3tEreHa4L&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=-hlieSl5nR5t3maOUHKfbw&_nc_ss=7a30f&oh=00_Af0TcvGjUF4TZmhhvH499P3Mat7X8W7-F5uwD_73tyXM_w&oe=69EC78EB',
  },
  {
    id: 2,
    name: 'Meeting people',
    description:
      "Sometimes all it takes is one small thing to turn your whole day around. That's what good design is for.",
    price: 80.0,
    // illustrative-vertical-1 from xds_oss asset set
    image:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/672442902_1640784437230723_4677249872577324579_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=rV_x--08XysQ7kNvwGO8c6c&_nc_oc=AdpvN7NspvLSqM1MSnOtOzUGJJCoiM4EFbyskzrYjxBQu-fUy96kObhUGyh8pIF1KjmxRxTCTIPKMbJZRjhLoE8D&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=Bj2Ig1JgYHXUPynXXi_flA&_nc_ss=7a30f&oh=00_Af2gh9BZAC7VM0GHirHVjyO21PqV8yOaupQOodwJiL2C6A&oe=69EC7442',
  },
  {
    id: 3,
    name: 'Seeing things',
    description:
      "Sometimes all it takes is one small thing to turn your whole day around. That's what good design is for.",
    price: 75.0,
    // illustrative-horizontal-3 from xds_oss asset set
    image:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/672674636_1739232910577387_6597229795491381664_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=c0Wke920NswQ7kNvwGhLkgq&_nc_oc=AdrsJKgPZutQFvTwNjAeGGrz7p-hZ1gaeoYHLpRrLftyt4d-NoUuAyGgy9bYi3n2qEeKNrDGemlvWQrYck5tS5B4&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=SJuvp50R21gmMEnU0djIpg&_nc_ss=7a30f&oh=00_Af1d0CtT64b3fbzLZK93XX_4qgmaj4LJXnZncMkh_WHzbQ&oe=69EC6AD2',
  },
  {
    id: 4,
    name: 'Sharing ideas',
    description:
      "Sometimes all it takes is one small thing to turn your whole day around. That's what good design is for.",
    price: 75.0,
    // illustrative-horizontal-4 from xds_oss asset set
    image:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/673819168_896838673380430_7926069171483718115_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=vq6xwTjrdE0Q7kNvwGvUa2U&_nc_oc=Adra06VCrdWxdsu2FVv8-LPN9W7Q_9R1g-w0XDYgDB2enGkCzrSRMI_uao0DtECFtBZzM6MqirZmjhZDVM6WKDLT&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=11WopT4AoM8tkAn8ZJeoeg&_nc_ss=7a30f&oh=00_Af0FPd3dUOYq5xvvtVNHE2rnD9-vO3DyG4AoZtBkpUpfAA&oe=69EC7737',
  },
  {
    id: 5,
    name: 'Making memories',
    description:
      "Sometimes all it takes is one small thing to turn your whole day around. That's what good design is for.",
    price: 60.0,
    // illustrative-horizontal-5 from xds_oss asset set
    image:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/671996506_1459966745508173_9056303866152525429_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=e19jRih997cQ7kNvwHsMzeC&_nc_oc=AdqUH-cyW2pD203Ak2_imFh9QIu6Rxfj6lrB0c9BwQuBJvauc0ZorfWguhTJqtTG6kn2yZeVE-iMdWzwQFV2u1U6&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=mzlSe2YEBlaB7g9PZTHF8A&_nc_ss=7a30f&oh=00_Af3Yb4eBzjMHgEq2pibEfISB9R2WuM-BZ7Es1VKZ3X8m9w&oe=69EC9980',
  },
  {
    id: 6,
    name: 'Being free',
    description:
      "Sometimes all it takes is one small thing to turn your whole day around. That's what good design is for.",
    price: 80.0,
    // illustrative-horizontal-2 from xds_oss asset set
    image:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/672815225_1876405093020036_2561561570479095601_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=WZOQWQWrQNUQ7kNvwHxEhmr&_nc_oc=AdpERGoZm1dwPqICPi3Yd30ZnGyj2Djvizg8dsPm_HZxUVQ1FCYBeVuGHpT0It8o-uYDM_bQdwIOdNYi716Ga8Kn&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=nMcBB19eB5I78bZuXEfV-g&_nc_ss=7a30f&oh=00_Af3VevBaBOLy8S_b2iqdOhcqr-lpQtcFv3qdU8Z3rEAOcw&oe=69EC9B9E',
  },
];

const fmt = (n: number) => `$${n.toFixed(2)}`;

// ─── Product Card ───────────────────────────────────────────────────────────

function ProductCard({product}: {product: Product}) {
  return (
    <XDSVStack gap={3}>
      <XDSAspectRatio ratio={1} xstyle={styles.imageWrapper}>
        <img
          src={product.image}
          alt={product.name}
          {...stylex.props(styles.image)}
        />
      </XDSAspectRatio>

      <XDSVStack gap={1}>
        <XDSHeading level={2}>{product.name}</XDSHeading>
        <XDSText type="body" color="secondary" maxLines={2}>
          {product.description}
        </XDSText>
        <XDSHeading level={2}>{fmt(product.price)}</XDSHeading>
      </XDSVStack>
    </XDSVStack>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function ProductGalleryTemplate() {
  return (
    <XDSAppShell height="auto" contentPadding={0} variant="surface">
      <XDSCenter axis="horizontal">
        <XDSSection variant="transparent" maxWidth={1200} padding={6}>
          <XDSVStack gap={6}>
            {/* Header — XDSGrid handles responsive stacking */}
            <XDSGrid minChildWidth={280} gap={4} align="start">
              <XDSHeading level={1}>
                Make every day a little more delightful, one small detail at a
                time.
              </XDSHeading>
              <XDSVStack gap={3} hAlign="start">
                <XDSText type="body">
                  We believe the smallest details are the ones that matter most.
                  A little color, a thoughtful touch, a moment that catches your
                  eye and makes you pause; that&apos;s what turns an ordinary
                  day into something worth remembering.
                </XDSText>
                <XDSButton
                  label="Get started"
                  variant="primary"
                  endContent={<XDSIcon icon={ArrowRightIcon} color="inherit" />}
                />
              </XDSVStack>
            </XDSGrid>

            {/* Product Grid — 3 cols desktop, wraps to 2→1 on smaller screens */}
            <XDSGrid minChildWidth={300} gap={6}>
              {PRODUCTS.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </XDSGrid>
          </XDSVStack>
        </XDSSection>
      </XDSCenter>
    </XDSAppShell>
  );
}
