'use client';

import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSCenter} from '@xds/core/Center';
import {XDSText} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';

import {XDSGrid} from '@xds/core/Grid';
import {XDSAspectRatio} from '@xds/core/AspectRatio';
import {XDSIcon} from '@xds/core/Icon';

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
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
    price: 75.0,
    image:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/670836735_2461791954280697_1048571955964692895_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=b9DqIpmzyeAQ7kNvwEuVNYV&_nc_oc=Adqx7M8RaKihjC8dSQUH_YjYNSkC7dv34yH96ndekQT74zfo2M6_DMfY-HyXDGEgXYHKMGTPSBWROmTm7oSKCaPg&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=JpoMwvOmI8EiEnZqKv1pTA&_nc_ss=7a30f&oh=00_Af2OVKepznOQZ3IX-zLvEo2kLnuG7__tVGUrZjjgcrbRgA&oe=69E5E16B',
  },
  {
    id: 2,
    name: 'Meeting people',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
    price: 80.0,
    image:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/672442902_1640784437230723_4677249872577324579_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=FTogKwiBg4oQ7kNvwG66g5l&_nc_oc=AdohfcFkqsXQ69dg4wisn1PklAF79fF9Nj8yv2VzbjdQCjdzvseKVPSke0RP0IjpniAdOiiK9NJv4Q1c85oXpxiK&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=J_KnD2I4RCz2o8AuLodUDQ&_nc_ss=7a30f&oh=00_Af28cM8LnHy_7WY3GWshof2Lb0LUOYTYGWcs6WJLZtn3Mw&oe=69E5DCC2',
  },
  {
    id: 3,
    name: 'Seeing things',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
    price: 75.0,
    image:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/670491006_1228594285764183_1722506701323274836_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=unkJDFgu-GIQ7kNvwHLBAsx&_nc_oc=AdriBiJflVanSL6euivARP6MqUkFisc5WqVoVdfnRLLC53mlQfqwIy13-ln2C-WURNmWQVwPWOS208aVNzXS-J03&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=PQDl1TKYJb3bDU1ul7KbxA&_nc_ss=7a30f&oh=00_Af3_j3JztXbZajrbUT0DvW6pDWu9ROyhHtoaYUewnVcirA&oe=69E5D9EE',
  },
  {
    id: 4,
    name: 'Sharing ideas',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
    price: 75.0,
    image:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/670453426_1629772308172392_7338648760044721206_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=w119t9ZcjqYQ7kNvwE2Tf7P&_nc_oc=AdojAepj9rmCVIeFNbEdopGIZbjSHlIf5nbxtyXI2GaOf5Nz8Gj23ajgGK--vzCyDLpCBHvRoGSNE2ioGSs11DTR&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=mUz5o8bLcOK-Q6fv8PeCIQ&_nc_ss=7a30f&oh=00_Af2_T8BE3gFLoT-wOHJ3ZC0Zafkan4APWs5SDWDmW2fQwQ&oe=69E5F2BC',
  },
  {
    id: 5,
    name: 'Making memories',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
    price: 60.0,
    image:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/670440654_2425466027902111_441009769495615664_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=sEujXUMcS0AQ7kNvwGotqx9&_nc_oc=AdoICPhh8wzKOuVjHhY4bDHG1GenjycImIsts9g2YwfUJfRhfqGiQ_v5I3l-HB7blzgW0OaXVo6R9Wy0O17WTrcR&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=gsRqlN0CNh8pEJrGowBt2A&_nc_ss=7a30f&oh=00_Af36QSneAf3QMV7wSsWXsheMX3vnv33kwsu79LnL0v5d0Q&oe=69E5EF77',
  },
  {
    id: 6,
    name: 'Being free',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
    price: 80.0,
    image:
      'https://scontent.xx.fbcdn.net/v/t39.6806-6/673819168_896838673380430_7926069171483718115_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=56bbc2&_nc_ohc=rhw65II8BL4Q7kNvwEQ_jcH&_nc_oc=AdpJgUbr24uDH4r8oWwxa54NQJ3z5y51tdL-gxZLR6UL9NAerKcrB4M6gl2qiXpe0H3yPqazZkot7IHWfyXqWdq4&_nc_zt=14&_nc_ht=scontent.xx&_nc_gid=SpweIC6Bhmp65LIJsM5o0g&_nc_ss=7a30f&oh=00_Af0umasO4WHA_M84DFsegtIr3laVMxdz3t-TRVTBHoy-6A&oe=69E5DFB7',
  },
];

const fmt = (n: number) => `$${n.toFixed(2)}`;

// ─── Product Card ───────────────────────────────────────────────────────────

function ProductCard({product}: {product: Product}) {
  return (
    <XDSVStack gap={3}>
      <XDSAspectRatio
        ratio={1}
        style={{
          borderRadius: 'var(--radius-container)',
          overflow: 'clip',
        }}>
        <img
          src={product.image}
          alt={product.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            display: 'block',
          }}
        />
      </XDSAspectRatio>

      <XDSVStack gap={1}>
        <XDSText
          type="body"
          weight="medium"
          style={{fontSize: 'var(--font-size-xl)'}}>
          {product.name}
        </XDSText>
        <XDSText type="body" color="secondary" maxLines={2}>
          {product.description}
        </XDSText>
        <XDSText
          type="body"
          weight="bold"
          style={{fontSize: 'var(--font-size-xl)'}}>
          {fmt(product.price)}
        </XDSText>
      </XDSVStack>
    </XDSVStack>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function ProductGalleryTemplate() {
  return (
    <XDSCenter axis="horizontal">
      <div style={{maxWidth: 1200, width: '100%', padding: '32px 24px 64px'}}>
        <XDSVStack gap={6}>
          {/* Header — side-by-side on desktop, stacked on mobile */}
          <div className="product-gallery-header">
            <div className="product-gallery-header-title">
              <XDSText
                type="large"
                weight="bold"
                as="p"
                style={{fontSize: 'var(--font-size-2xl)'}}>
                Make every day a little more delightful, one small detail at a
                time.
              </XDSText>
            </div>
            <div className="product-gallery-header-body">
              <XDSVStack gap={3}>
                <XDSText type="body">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua
                  ut enim ad minim exercitation.
                </XDSText>
                <div>
                  <XDSButton
                    label="Get started"
                    variant="primary"
                    endContent={
                      <XDSIcon icon={ArrowRightIcon} color="inherit" />
                    }
                  />
                </div>
              </XDSVStack>
            </div>
          </div>

          {/* Product Grid — 3 cols desktop, 2 cols mobile */}
          <div className="product-gallery-grid">
            <XDSGrid columns={3} gap={6}>
              {PRODUCTS.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </XDSGrid>
          </div>
        </XDSVStack>

        {/* Responsive styles */}
        <style>{`
          .product-gallery-header {
            display: flex;
            gap: 16px;
            align-items: flex-start;
          }
          .product-gallery-header-title,
          .product-gallery-header-body {
            flex: 1 1 0%;
            min-width: 0;
          }
          @media (max-width: 640px) {
            .product-gallery-header {
              flex-direction: column;
            }
            .product-gallery-grid .xds-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }
        `}</style>
      </div>
    </XDSCenter>
  );
}
