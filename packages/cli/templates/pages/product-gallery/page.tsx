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
  link: {
    textDecoration: 'none',
    color: 'inherit',
    cursor: 'pointer',
  },
  imageWrapper: {
    borderRadius: 'var(--radius-container)',
    overflow: 'clip',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
    display: 'block',
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
    image:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/670836735_2461791954280697_1048571955964692895_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=b9DqIpmzyeAQ7kNvwEuVNYV&_nc_oc=Adqx7M8RaKihjC8dSQUH_YjYNSkC7dv34yH96ndekQT74zfo2M6_DMfY-HyXDGEgXYHKMGTPSBWROmTm7oSKCaPg&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=JpoMwvOmI8EiEnZqKv1pTA&_nc_ss=7a30f&oh=00_Af2OVKepznOQZ3IX-zLvEo2kLnuG7__tVGUrZjjgcrbRgA&oe=69E5E16B',
  },
  {
    id: 2,
    name: 'Meeting people',
    description:
      "Sometimes all it takes is one small thing to turn your whole day around. That's what good design is for.",
    price: 80.0,
    image:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/672442902_1640784437230723_4677249872577324579_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=FTogKwiBg4oQ7kNvwG66g5l&_nc_oc=AdohfcFkqsXQ69dg4wisn1PklAF79fF9Nj8yv2VzbjdQCjdzvseKVPSke0RP0IjpniAdOiiK9NJv4Q1c85oXpxiK&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=J_KnD2I4RCz2o8AuLodUDQ&_nc_ss=7a30f&oh=00_Af28cM8LnHy_7WY3GWshof2Lb0LUOYTYGWcs6WJLZtn3Mw&oe=69E5DCC2',
  },
  {
    id: 3,
    name: 'Seeing things',
    description:
      "Sometimes all it takes is one small thing to turn your whole day around. That's what good design is for.",
    price: 75.0,
    image:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/670491006_1228594285764183_1722506701323274836_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=unkJDFgu-GIQ7kNvwHLBAsx&_nc_oc=AdriBiJflVanSL6euivARP6MqUkFisc5WqVoVdfnRLLC53mlQfqwIy13-ln2C-WURNmWQVwPWOS208aVNzXS-J03&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=PQDl1TKYJb3bDU1ul7KbxA&_nc_ss=7a30f&oh=00_Af3_j3JztXbZajrbUT0DvW6pDWu9ROyhHtoaYUewnVcirA&oe=69E5D9EE',
  },
  {
    id: 4,
    name: 'Sharing ideas',
    description:
      "Sometimes all it takes is one small thing to turn your whole day around. That's what good design is for.",
    price: 75.0,
    image:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/670453426_1629772308172392_7338648760044721206_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=w119t9ZcjqYQ7kNvwE2Tf7P&_nc_oc=AdojAepj9rmCVIeFNbEdopGIZbjSHlIf5nbxtyXI2GaOf5Nz8Gj23ajgGK--vzCyDLpCBHvRoGSNE2ioGSs11DTR&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=mUz5o8bLcOK-Q6fv8PeCIQ&_nc_ss=7a30f&oh=00_Af2_T8BE3gFLoT-wOHJ3ZC0Zafkan4APWs5SDWDmW2fQwQ&oe=69E5F2BC',
  },
  {
    id: 5,
    name: 'Making memories',
    description:
      "Sometimes all it takes is one small thing to turn your whole day around. That's what good design is for.",
    price: 60.0,
    image:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/670440654_2425466027902111_441009769495615664_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=sEujXUMcS0AQ7kNvwGotqx9&_nc_oc=AdoICPhh8wzKOuVjHhY4bDHG1GenjycImIsts9g2YwfUJfRhfqGiQ_v5I3l-HB7blzgW0OaXVo6R9Wy0O17WTrcR&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=gsRqlN0CNh8pEJrGowBt2A&_nc_ss=7a30f&oh=00_Af36QSneAf3QMV7wSsWXsheMX3vnv33kwsu79LnL0v5d0Q&oe=69E5EF77',
  },
  {
    id: 6,
    name: 'Being free',
    description:
      "Sometimes all it takes is one small thing to turn your whole day around. That's what good design is for.",
    price: 80.0,
    image:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/673819168_896838673380430_7926069171483718115_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=rhw65II8BL4Q7kNvwEQ_jcH&_nc_oc=AdpJgUbr24uDH4r8oWwxa54NQJ3z5y51tdL-gxZLR6UL9NAerKcrB4M6gl2qiXpe0H3yPqazZkot7IHWfyXqWdq4&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=SpweIC6Bhmp65LIJsM5o0g&_nc_ss=7a30f&oh=00_Af0umasO4WHA_M84DFsegtIr3laVMxdz3t-TRVTBHoy-6A&oe=69E5DFB7',
  },
];

const fmt = (n: number) => `$${n.toFixed(2)}`;

// ─── Product Card ───────────────────────────────────────────────────────────

function ProductCard({product}: {product: Product}) {
  return (
    <a
      href="#"
      onClick={e => e.preventDefault()}
      {...stylex.props(styles.link)}>
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
    </a>
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
