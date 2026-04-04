import {XDSCard} from '@xds/core/Card';
import {XDSButton} from '@xds/core/Button';
import {XDSGrid} from '@xds/core/Grid';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Layout';

const products = [
  {
    id: 1,
    title: 'Wireless Headphones',
    price: 79.99,
    image: 'https://picsum.photos/seed/headphones/400/300',
  },
  {
    id: 2,
    title: 'Mechanical Keyboard',
    price: 129.99,
    image: 'https://picsum.photos/seed/keyboard/400/300',
  },
  {
    id: 3,
    title: 'Ergonomic Mouse',
    price: 49.99,
    image: 'https://picsum.photos/seed/mouse/400/300',
  },
  {
    id: 4,
    title: 'USB-C Monitor',
    price: 349.99,
    image: 'https://picsum.photos/seed/monitor/400/300',
  },
  {
    id: 5,
    title: 'Webcam HD',
    price: 59.99,
    image: 'https://picsum.photos/seed/webcam/400/300',
  },
  {
    id: 6,
    title: 'Desk Lamp',
    price: 39.99,
    image: 'https://picsum.photos/seed/lamp/400/300',
  },
];

export default function ProductGrid() {
  return (
    <XDSGrid minChildWidth={260} gap={4}>
      {products.map((product) => (
        <XDSCard key={product.id} padding={0}>
          <XDSVStack gap={3}>
            <img
              src={product.image}
              alt={product.title}
              style={{
                width: '100%',
                aspectRatio: '4 / 3',
                objectFit: 'cover',
                borderRadius: 'var(--radius-container) var(--radius-container) 0 0',
                display: 'block',
              }}
            />
            <XDSVStack gap={2} xstyle={{paddingInline: 'var(--spacing-4)', paddingBlockEnd: 'var(--spacing-4)'}}>
              <XDSHeading level={4}>{product.title}</XDSHeading>
              <XDSText type="large" weight="semibold">
                ${product.price.toFixed(2)}
              </XDSText>
              <XDSButton label="Add to cart" variant="primary">
                Add to Cart
              </XDSButton>
            </XDSVStack>
          </XDSVStack>
        </XDSCard>
      ))}
    </XDSGrid>
  );
}
