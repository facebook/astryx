'use client';

import {XDSAppShell} from '@xds/core/AppShell';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSCenter} from '@xds/core/Center';
import {XDSSection} from '@xds/core/Section';
import {XDSText} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSBadge} from '@xds/core/Badge';
import {XDSCard} from '@xds/core/Card';
import {XDSAspectRatio} from '@xds/core/AspectRatio';
import {XDSIcon} from '@xds/core/Icon';
import {XDSCarousel} from '@xds/core/Carousel';

// ─── Icons ──────────────────────────────────────────────────────────────────

const ArrowRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

// ─── Gallery Data ───────────────────────────────────────────────────────────

const GALLERY_ITEMS = [
  {
    id: 1,
    title: 'Going places',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
    image:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/670836735_2461791954280697_1048571955964692895_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=b9DqIpmzyeAQ7kNvwEuVNYV&_nc_oc=Adqx7M8RaKihjC8dSQUH_YjYNSkC7dv34yH96ndekQT74zfo2M6_DMfY-HyXDGEgXYHKMGTPSBWROmTm7oSKCaPg&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=JpoMwvOmI8EiEnZqKv1pTA&_nc_ss=7a30f&oh=00_Af2OVKepznOQZ3IX-zLvEo2kLnuG7__tVGUrZjjgcrbRgA&oe=69E5E16B',
  },
  {
    id: 2,
    title: 'Meeting people',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
    image:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/672442902_1640784437230723_4677249872577324579_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=FTogKwiBg4oQ7kNvwG66g5l&_nc_oc=AdohfcFkqsXQ69dg4wisn1PklAF79fF9Nj8yv2VzbjdQCjdzvseKVPSke0RP0IjpniAdOiiK9NJv4Q1c85oXpxiK&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=J_KnD2I4RCz2o8AuLodUDQ&_nc_ss=7a30f&oh=00_Af28cM8LnHy_7WY3GWshof2Lb0LUOYTYGWcs6WJLZtn3Mw&oe=69E5DCC2',
  },
  {
    id: 3,
    title: 'Seeing things',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
    image:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/670491006_1228594285764183_1722506701323274836_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=unkJDFgu-GIQ7kNvwHLBAsx&_nc_oc=AdriBiJflVanSL6euivARP6MqUkFisc5WqVoVdfnRLLC53mlQfqwIy13-ln2C-WURNmWQVwPWOS208aVNzXS-J03&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=PQDl1TKYJb3bDU1ul7KbxA&_nc_ss=7a30f&oh=00_Af3_j3JztXbZajrbUT0DvW6pDWu9ROyhHtoaYUewnVcirA&oe=69E5D9EE',
  },
  {
    id: 4,
    title: 'Sharing ideas',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
    image:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/670453426_1629772308172392_7338648760044721206_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=w119t9ZcjqYQ7kNvwE2Tf7P&_nc_oc=AdojAepj9rmCVIeFNbEdopGIZbjSHlIf5nbxtyXI2GaOf5Nz8Gj23ajgGK--vzCyDLpCBHvRoGSNE2ioGSs11DTR&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=mUz5o8bLcOK-Q6fv8PeCIQ&_nc_ss=7a30f&oh=00_Af2_T8BE3gFLoT-wOHJ3ZC0Zafkan4APWs5SDWDmW2fQwQ&oe=69E5F2BC',
  },
  {
    id: 5,
    title: 'Making memories',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
    image:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/670440654_2425466027902111_441009769495615664_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=sEujXUMcS0AQ7kNvwGotqx9&_nc_oc=AdoICPhh8wzKOuVjHhY4bDHG1GenjycImIsts9g2YwfUJfRhfqGiQ_v5I3l-HB7blzgW0OaXVo6R9Wy0O17WTrcR&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=gsRqlN0CNh8pEJrGowBt2A&_nc_ss=7a30f&oh=00_Af36QSneAf3QMV7wSsWXsheMX3vnv33kwsu79LnL0v5d0Q&oe=69E5EF77',
  },
  {
    id: 6,
    title: 'Being free',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
    image:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/673819168_896838673380430_7926069171483718115_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=rhw65II8BL4Q7kNvwEQ_jcH&_nc_oc=AdpJgUbr24uDH4r8oWwxa54NQJ3z5y51tdL-gxZLR6UL9NAerKcrB4M6gl2qiXpe0H3yPqazZkot7IHWfyXqWdq4&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=SpweIC6Bhmp65LIJsM5o0g&_nc_ss=7a30f&oh=00_Af0umasO4WHA_M84DFsegtIr3laVMxdz3t-TRVTBHoy-6A&oe=69E5DFB7',
  },
];

// ─── Gallery Card ───────────────────────────────────────────────────────────

function GalleryCard({item}: {item: (typeof GALLERY_ITEMS)[number]}) {
  return (
    <XDSCard padding={0} width={480}>
      <div style={{position: 'relative'}}>
        <XDSAspectRatio ratio={3 / 4}>
          <img
            src={item.image}
            alt={item.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </XDSAspectRatio>

        {/* Gradient overlay for text legibility */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.25) 35%, transparent 60%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: 'var(--spacing-6)',
          }}>
          <XDSVStack gap={2} style={{color: 'white'}}>
            <XDSText
              type="body"
              weight="bold"
              color="inherit"
              style={{fontSize: 'var(--font-size-xl)'}}>
              {item.title}
            </XDSText>
            <XDSText type="body" color="inherit" maxLines={2}>
              {item.description}
            </XDSText>
            <div style={{paddingTop: 'var(--spacing-1)'}}>
              <XDSButton
                label="Read more"
                variant="secondary"
                style={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                }}
                endContent={<XDSIcon icon={ArrowRightIcon} color="inherit" />}
              />
            </div>
          </XDSVStack>
        </div>
      </div>
    </XDSCard>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function FeaturedGalleryTemplate() {
  return (
    <XDSAppShell height="auto" contentPadding={0} variant="surface">
      <XDSVStack gap={6}>
        {/* Header */}
        <XDSCenter axis="horizontal">
          <XDSSection maxWidth={1200} padding={6} variant="transparent">
            <XDSVStack gap={3} hAlign="center">
              <XDSHStack gap={2}>
                <XDSBadge label="Green badge" variant="green" />
                <XDSBadge label="Yellow badge" variant="yellow" />
                <XDSBadge label="Blue badge" variant="blue" />
              </XDSHStack>
              <XDSText
                type="body"
                weight="bold"
                as="p"
                style={{
                  fontSize: 'var(--font-size-2xl)',
                  textAlign: 'center',
                  maxWidth: 640,
                }}>
                Make every day a little more delightful, one detail at a time.
              </XDSText>
              <XDSText type="body" style={{textAlign: 'center', maxWidth: 640}}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua ut
                enim ad minim excepteur sint occaecat cupidatat non proident.
              </XDSText>
            </XDSVStack>
          </XDSSection>
        </XDSCenter>

        {/* Carousel */}
        <XDSCenter axis="horizontal">
          <XDSSection maxWidth={1520} padding={6} variant="transparent">
            <XDSCarousel gap={4} hasSnap hasButtons scrollStep="item">
              {GALLERY_ITEMS.map(item => (
                <GalleryCard key={item.id} item={item} />
              ))}
            </XDSCarousel>
          </XDSSection>
        </XDSCenter>
      </XDSVStack>
    </XDSAppShell>
  );
}
