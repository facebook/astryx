import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {XDSCard} from '@xds/core/Card';
import {XDSTable} from '@xds/core/Table';
import type {XDSTableColumn} from '@xds/core/Table';
import {proportional, pixel} from '@xds/core/Table';
import {XDSBadge} from '@xds/core/Badge';
import type {XDSBadgeVariant} from '@xds/core/Badge';
import {XDSButton} from '@xds/core/Button';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {XDSDivider} from '@xds/core/Divider';
import {XDSProgressBar} from '@xds/core/ProgressBar';
import {
  colorVars,
  fontWeightVars,
  radiusVars,
  spacingVars,
  textSizeVars,
  typographyVars,
} from '@xds/core/theme/tokens.stylex';

import {
  products,
  orders,
  customers,
  reviews,
  cartItems,
  cartSummary,
  storeSummary,
  formatPrice,
  type Product,
  type Order,
  type Customer,
} from './data/ecommerce';

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  page: {
    backgroundColor: colorVars['--color-wash'],
    padding: spacingVars['--spacing-6'],
    fontFamily: typographyVars['--font-body'],
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: spacingVars['--spacing-4'],
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: spacingVars['--spacing-4'],
  },
  statValue: {
    fontSize: textSizeVars['--text-4xl'],
    fontWeight: fontWeightVars['--font-weight-bold'],
    color: colorVars['--color-text-primary'],
    margin: 0,
  },
  statLabel: {
    fontSize: textSizeVars['--text-sm'],
    color: colorVars['--color-text-secondary'],
    margin: 0,
  },
  productImage: {
    width: '100%',
    height: '220px',
    objectFit: 'cover',
    borderRadius: `${radiusVars['--radius-element']} ${radiusVars['--radius-element']} 0 0`,
  },
  productMeta: {
    fontSize: textSizeVars['--text-sm'],
    color: colorVars['--color-text-secondary'],
    margin: 0,
  },
  price: {
    fontSize: textSizeVars['--text-xl'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    color: colorVars['--color-text-primary'],
    margin: 0,
  },
  comparePrice: {
    fontSize: textSizeVars['--text-base'],
    color: colorVars['--color-text-secondary'],
    textDecoration: 'line-through',
    margin: 0,
  },
  sectionTitle: {
    fontSize: textSizeVars['--text-2xl'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    color: colorVars['--color-text-primary'],
    margin: 0,
  },
  cartImage: {
    width: '56px',
    height: '56px',
    objectFit: 'cover',
    borderRadius: radiusVars['--radius-element'],
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: textSizeVars['--text-base'],
    color: colorVars['--color-text-secondary'],
    margin: 0,
  },
  summaryValue: {
    fontSize: textSizeVars['--text-base'],
    color: colorVars['--color-text-primary'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    margin: 0,
  },
  summaryTotal: {
    fontSize: textSizeVars['--text-lg'],
    fontWeight: fontWeightVars['--font-weight-bold'],
    color: colorVars['--color-text-primary'],
    margin: 0,
  },
  stars: {
    color: colorVars['--color-warning'],
    fontSize: textSizeVars['--text-base'],
  },
  barContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
  },
  barLabel: {
    fontSize: textSizeVars['--text-sm'],
    color: colorVars['--color-text-secondary'],
    minWidth: '80px',
    margin: 0,
  },
  barValue: {
    fontSize: textSizeVars['--text-sm'],
    color: colorVars['--color-text-primary'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    minWidth: '80px',
    textAlign: 'right' as const,
    margin: 0,
  },
  productCardBody: {
    paddingTop: 0,
    paddingRight: spacingVars['--spacing-4'],
    paddingBottom: spacingVars['--spacing-4'],
    paddingLeft: spacingVars['--spacing-4'],
  },
});

// =============================================================================
// Helpers
// =============================================================================

const orderStatusBadgeVariant: Record<Order['status'], XDSBadgeVariant> = {
  delivered: 'success',
  shipped: 'info',
  processing: 'info',
  pending: 'warning',
  cancelled: 'error',
  refunded: 'neutral',
};

const stockStatusBadgeVariant: Record<Product['status'], XDSBadgeVariant> = {
  in_stock: 'success',
  low_stock: 'warning',
  out_of_stock: 'error',
};

const stockStatusLabel: Record<Product['status'], string> = {
  in_stock: 'In Stock',
  low_stock: 'Low Stock',
  out_of_stock: 'Out of Stock',
};

function renderStars(rating: number): string {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    '\u2605'.repeat(full) + (half ? '\u00bd' : '') + '\u2606'.repeat(empty)
  );
}

// =============================================================================
// Meta
// =============================================================================

const meta: Meta = {
  title: 'Examples/Ecommerce',
  tags: ['autodocs'],
  decorators: [
    Story => (
      <div {...stylex.props(styles.page)}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj;

// =============================================================================
// Dashboard
// =============================================================================

export const Dashboard: Story = {
  render: () => {
    const stats = [
      {
        label: 'Total Revenue',
        value: formatPrice(storeSummary.totalRevenue),
      },
      {label: 'Orders', value: storeSummary.totalOrders.toString()},
      {
        label: 'Customers',
        value: storeSummary.totalCustomers.toString(),
      },
      {
        label: 'Avg Order Value',
        value: formatPrice(storeSummary.averageOrderValue),
      },
    ];

    const maxRevenue = Math.max(
      ...storeSummary.topCategories.map(c => c.revenue),
    );

    return (
      <XDSVStack gap="space6">
        {/* Stats cards */}
        <div {...stylex.props(styles.statsGrid)}>
          {stats.map(stat => (
            <XDSCard key={stat.label}>
              <XDSVStack gap="space1">
                <p {...stylex.props(styles.statLabel)}>{stat.label}</p>
                <p {...stylex.props(styles.statValue)}>{stat.value}</p>
              </XDSVStack>
            </XDSCard>
          ))}
        </div>

        {/* Revenue by month */}
        <XDSCard>
          <XDSVStack gap="space4">
            <p {...stylex.props(styles.sectionTitle)}>Revenue by Month</p>
            {storeSummary.revenueByMonth.map(({month, revenue}) => (
              <div key={month} {...stylex.props(styles.barContainer)}>
                <p {...stylex.props(styles.barLabel)}>{month}</p>
                <div style={{flex: 1}}>
                  <XDSProgressBar
                    label={month}
                    isLabelHidden
                    value={(revenue / 45000) * 100}
                    max={100}
                  />
                </div>
                <p {...stylex.props(styles.barValue)}>{formatPrice(revenue)}</p>
              </div>
            ))}
          </XDSVStack>
        </XDSCard>

        {/* Top categories */}
        <XDSCard>
          <XDSVStack gap="space4">
            <p {...stylex.props(styles.sectionTitle)}>Top Categories</p>
            {storeSummary.topCategories.map(cat => (
              <div key={cat.category} {...stylex.props(styles.barContainer)}>
                <p {...stylex.props(styles.barLabel)}>{cat.category}</p>
                <div style={{flex: 1}}>
                  <XDSProgressBar
                    label={cat.category}
                    isLabelHidden
                    value={(cat.revenue / maxRevenue) * 100}
                    max={100}
                  />
                </div>
                <p {...stylex.props(styles.barValue)}>
                  {formatPrice(cat.revenue)}
                </p>
              </div>
            ))}
          </XDSVStack>
        </XDSCard>

        {/* Recent orders */}
        <XDSCard>
          <XDSVStack gap="space4">
            <XDSHStack gap="space2" vAlign="center" hAlign="between">
              <p {...stylex.props(styles.sectionTitle)}>Recent Orders</p>
              <XDSButton variant="secondary" label="View All">
                View All
              </XDSButton>
            </XDSHStack>
            <XDSTable
              data={orders.slice(0, 5)}
              columns={orderColumns}
              idKey="id"
              hasHover
              density="balanced"
            />
          </XDSVStack>
        </XDSCard>
      </XDSVStack>
    );
  },
};

const orderColumns: XDSTableColumn<Order>[] = [
  {key: 'orderNumber', header: 'Order', width: pixel(140)},
  {key: 'customerName', header: 'Customer', width: proportional(2)},
  {
    key: 'total',
    header: 'Total',
    width: pixel(120),
    renderCell: item => formatPrice(item.total),
  },
  {
    key: 'status',
    header: 'Status',
    width: pixel(120),
    renderCell: item => (
      <XDSBadge variant={orderStatusBadgeVariant[item.status]}>
        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
      </XDSBadge>
    ),
  },
  {
    key: 'createdAt',
    header: 'Date',
    width: pixel(100),
    renderCell: item =>
      new Date(item.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
  },
];

// =============================================================================
// Product Catalog
// =============================================================================

export const ProductCatalog: Story = {
  render: () => (
    <XDSVStack gap="space6">
      <XDSHStack gap="space2" vAlign="center" hAlign="between">
        <p {...stylex.props(styles.sectionTitle)}>Collection</p>
        <XDSHStack gap="space2">
          <XDSBadge variant="neutral">{products.length} pieces</XDSBadge>
          <XDSButton variant="primary" label="Add Product">
            Add Product
          </XDSButton>
        </XDSHStack>
      </XDSHStack>

      <div {...stylex.props(styles.grid)}>
        {products.map(product => (
          <XDSCard key={product.id} isFullBleed>
            <XDSVStack gap="space3">
              <img
                src={product.image}
                alt={product.name}
                {...stylex.props(styles.productImage)}
              />
              <div {...stylex.props(styles.productCardBody)}>
                <XDSVStack gap="space2">
                  <XDSHStack gap="space2" vAlign="center" hAlign="between">
                    <XDSBadge variant="neutral">{product.category}</XDSBadge>
                    <XDSBadge variant={stockStatusBadgeVariant[product.status]}>
                      {stockStatusLabel[product.status]}
                    </XDSBadge>
                  </XDSHStack>
                  <XDSText type="body" weight="bold">
                    {product.name}
                  </XDSText>
                  <XDSText type="supporting" color="secondary">
                    {product.description.slice(0, 80)}\u2026
                  </XDSText>
                  <XDSHStack gap="space2" vAlign="center">
                    <p {...stylex.props(styles.price)}>
                      {formatPrice(product.price)}
                    </p>
                    {product.compareAtPrice && (
                      <p {...stylex.props(styles.comparePrice)}>
                        {formatPrice(product.compareAtPrice)}
                      </p>
                    )}
                  </XDSHStack>
                  <XDSHStack gap="space2" vAlign="center">
                    <span {...stylex.props(styles.stars)}>
                      {renderStars(product.rating)}
                    </span>
                    <p {...stylex.props(styles.productMeta)}>
                      ({product.reviewCount})
                    </p>
                  </XDSHStack>
                </XDSVStack>
              </div>
            </XDSVStack>
          </XDSCard>
        ))}
      </div>
    </XDSVStack>
  ),
};

// =============================================================================
// Order List
// =============================================================================

export const OrderList: Story = {
  render: () => {
    const allOrderColumns: XDSTableColumn<Order>[] = [
      {key: 'orderNumber', header: 'Order #', width: pixel(140)},
      {
        key: 'customerName',
        header: 'Customer',
        width: proportional(2),
        renderCell: item => (
          <XDSHStack gap="space2" vAlign="center">
            <XDSAvatar name={item.customerName} size="small" />
            <XDSVStack gap="space0.5">
              <XDSText type="body" weight="semibold">
                {item.customerName}
              </XDSText>
              <XDSText type="supporting" color="secondary">
                {item.customerEmail}
              </XDSText>
            </XDSVStack>
          </XDSHStack>
        ),
      },
      {
        key: 'items',
        header: 'Items',
        width: pixel(60),
        renderCell: item => item.items.length,
      },
      {
        key: 'total',
        header: 'Total',
        width: pixel(120),
        renderCell: item => formatPrice(item.total),
      },
      {
        key: 'paymentMethod',
        header: 'Payment',
        width: pixel(120),
        renderCell: item =>
          item.paymentMethod
            .split('_')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' '),
      },
      {
        key: 'status',
        header: 'Status',
        width: pixel(120),
        renderCell: item => (
          <XDSBadge variant={orderStatusBadgeVariant[item.status]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </XDSBadge>
        ),
      },
      {
        key: 'createdAt',
        header: 'Date',
        width: pixel(110),
        renderCell: item =>
          new Date(item.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
      },
    ];

    return (
      <XDSVStack gap="space4">
        <XDSHStack gap="space2" vAlign="center" hAlign="between">
          <p {...stylex.props(styles.sectionTitle)}>Orders</p>
          <XDSBadge variant="neutral">{orders.length} orders</XDSBadge>
        </XDSHStack>
        <XDSCard>
          <XDSTable
            data={orders}
            columns={allOrderColumns}
            idKey="id"
            hasHover
            density="balanced"
            dividers="rows"
          />
        </XDSCard>
      </XDSVStack>
    );
  },
};

// =============================================================================
// Customer List
// =============================================================================

export const CustomerList: Story = {
  render: () => {
    const customerStatusVariant: Record<Customer['status'], XDSBadgeVariant> = {
      active: 'success',
      inactive: 'neutral',
      vip: 'info',
    };

    const customerColumns: XDSTableColumn<Customer>[] = [
      {
        key: 'name',
        header: 'Customer',
        width: proportional(2),
        renderCell: item => (
          <XDSHStack gap="space2" vAlign="center">
            <XDSAvatar name={item.name} size="small" />
            <XDSVStack gap="space0.5">
              <XDSText type="body" weight="semibold">
                {item.name}
              </XDSText>
              <XDSText type="supporting" color="secondary">
                {item.email}
              </XDSText>
            </XDSVStack>
          </XDSHStack>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        width: pixel(90),
        renderCell: item => (
          <XDSBadge variant={customerStatusVariant[item.status]}>
            {item.status.toUpperCase()}
          </XDSBadge>
        ),
      },
      {
        key: 'totalOrders',
        header: 'Orders',
        width: pixel(80),
      },
      {
        key: 'totalSpent',
        header: 'Total Spent',
        width: pixel(120),
        renderCell: item => formatPrice(item.totalSpent),
      },
      {
        key: 'joinedAt',
        header: 'Joined',
        width: pixel(110),
        renderCell: item =>
          new Date(item.joinedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
      },
    ];

    return (
      <XDSVStack gap="space4">
        <XDSHStack gap="space2" vAlign="center" hAlign="between">
          <p {...stylex.props(styles.sectionTitle)}>Customers</p>
          <XDSBadge variant="neutral">{customers.length} customers</XDSBadge>
        </XDSHStack>
        <XDSCard>
          <XDSTable
            data={customers}
            columns={customerColumns}
            idKey="id"
            hasHover
            density="balanced"
            dividers="rows"
          />
        </XDSCard>
      </XDSVStack>
    );
  },
};

// =============================================================================
// Shopping Cart
// =============================================================================

export const ShoppingCart: Story = {
  render: () => (
    <XDSHStack gap="space6" vAlign="start">
      {/* Cart items */}
      <div style={{flex: 2}}>
        <XDSCard>
          <XDSVStack gap="space4">
            <XDSHStack gap="space2" vAlign="center" hAlign="between">
              <p {...stylex.props(styles.sectionTitle)}>
                Cart ({cartSummary.itemCount} items)
              </p>
              <XDSButton variant="secondary" label="Clear Cart">
                Clear Cart
              </XDSButton>
            </XDSHStack>
            <XDSDivider />
            {cartItems.map((item, i) => (
              <div key={item.id}>
                <XDSHStack gap="space4" vAlign="center">
                  <img
                    src={item.image}
                    alt={item.productName}
                    {...stylex.props(styles.cartImage)}
                  />
                  <div style={{flex: 1}}>
                    <XDSVStack gap="space1">
                      <XDSText type="body" weight="semibold">
                        {item.productName}
                      </XDSText>
                      <XDSText type="supporting" color="secondary">
                        {formatPrice(item.unitPrice)} \u00d7 {item.quantity}
                      </XDSText>
                    </XDSVStack>
                  </div>
                  <XDSText type="body" weight="semibold">
                    {formatPrice(item.total)}
                  </XDSText>
                </XDSHStack>
                {i < cartItems.length - 1 && <XDSDivider />}
              </div>
            ))}
          </XDSVStack>
        </XDSCard>
      </div>

      {/* Order summary */}
      <div style={{flex: 1, minWidth: 260}}>
        <XDSCard>
          <XDSVStack gap="space4">
            <p {...stylex.props(styles.sectionTitle)}>Order Summary</p>
            <XDSDivider />
            <div {...stylex.props(styles.summaryRow)}>
              <p {...stylex.props(styles.summaryLabel)}>Subtotal</p>
              <p {...stylex.props(styles.summaryValue)}>
                {formatPrice(cartSummary.subtotal)}
              </p>
            </div>
            <div {...stylex.props(styles.summaryRow)}>
              <p {...stylex.props(styles.summaryLabel)}>Shipping</p>
              <p {...stylex.props(styles.summaryValue)}>
                {cartSummary.shipping === 0
                  ? 'Free'
                  : formatPrice(cartSummary.shipping)}
              </p>
            </div>
            <div {...stylex.props(styles.summaryRow)}>
              <p {...stylex.props(styles.summaryLabel)}>Tax</p>
              <p {...stylex.props(styles.summaryValue)}>
                {formatPrice(cartSummary.tax)}
              </p>
            </div>
            <XDSDivider />
            <div {...stylex.props(styles.summaryRow)}>
              <p {...stylex.props(styles.summaryTotal)}>Total</p>
              <p {...stylex.props(styles.summaryTotal)}>
                {formatPrice(cartSummary.total)}
              </p>
            </div>
            <XDSButton variant="primary" label="Checkout">
              Checkout
            </XDSButton>
          </XDSVStack>
        </XDSCard>
      </div>
    </XDSHStack>
  ),
};

// =============================================================================
// Product Reviews
// =============================================================================

export const ProductReviews: Story = {
  render: () => (
    <XDSVStack gap="space4">
      <p {...stylex.props(styles.sectionTitle)}>Customer Reviews</p>
      <XDSVStack gap="space3">
        {reviews.map(review => (
          <XDSCard key={review.id}>
            <XDSVStack gap="space3">
              <XDSHStack gap="space3" vAlign="center">
                <XDSAvatar name={review.customerName} size="medium" />
                <XDSVStack gap="space0.5">
                  <XDSHStack gap="space2" vAlign="center">
                    <XDSText type="body" weight="semibold">
                      {review.customerName}
                    </XDSText>
                    {review.isVerified && (
                      <XDSBadge variant="success">Verified</XDSBadge>
                    )}
                  </XDSHStack>
                  <XDSHStack gap="space2" vAlign="center">
                    <span {...stylex.props(styles.stars)}>
                      {renderStars(review.rating)}
                    </span>
                    <XDSText type="supporting" color="secondary">
                      {review.productName}
                    </XDSText>
                  </XDSHStack>
                </XDSVStack>
                <div style={{marginLeft: 'auto'}}>
                  <XDSText type="supporting" color="secondary">
                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </XDSText>
                </div>
              </XDSHStack>
              <XDSText type="body" weight="bold">
                {review.title}
              </XDSText>
              <XDSText type="body">{review.body}</XDSText>
            </XDSVStack>
          </XDSCard>
        ))}
      </XDSVStack>
    </XDSVStack>
  ),
};
