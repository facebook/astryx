import {useState, useMemo} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {XDSCard} from '@xds/core/Card';
import {XDSTable, useXDSTableSelection} from '@xds/core/Table';
import type {XDSTableColumn} from '@xds/core/Table';
import {proportional, pixel} from '@xds/core/Table';
import {XDSBadge} from '@xds/core/Badge';
import type {XDSBadgeVariant} from '@xds/core/Badge';
import {XDSButton} from '@xds/core/Button';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSDivider} from '@xds/core/Divider';
import {XDSProgressBar} from '@xds/core/ProgressBar';
import {XDSGrid} from '@xds/core/Grid';
import {XDSTopNav, XDSTopNavTitle, XDSTopNavItem} from '@xds/core/TopNav';
import {XDSBreadcrumbs, XDSBreadcrumbItem} from '@xds/core/Breadcrumbs';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSEmptyState} from '@xds/core/EmptyState';
import {XDSSkeleton} from '@xds/core/Skeleton';
import {XDSDialog, XDSDialogHeader} from '@xds/core/Dialog';
import {XDSLayoutContent} from '@xds/core/Layout';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {XDSLink} from '@xds/core/Link';
import {XDSStatusDot} from '@xds/core/StatusDot';
import {XDSCollapsible, XDSCollapsibleGroup} from '@xds/core/Collapsible';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSSelector} from '@xds/core/Selector';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSAspectRatio} from '@xds/core/AspectRatio';
import {XDSSection} from '@xds/core/Section';
import {XDSNavIcon} from '@xds/core/NavIcon';
import {
  MagnifyingGlassIcon,
  BellIcon,
  UserCircleIcon,
  ShoppingCartIcon,
  CubeIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  TruckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
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
  type Review,
} from './data/ecommerce';

// =============================================================================
// Styles — minimal, only for things XDS components don't handle
// =============================================================================

const styles = stylex.create({
  page: {
    backgroundColor: colorVars['--color-wash'],
    fontFamily: typographyVars['--font-body'],
    minHeight: '100vh',
  },
  pageContent: {
    padding: spacingVars['--spacing-6'],
    maxWidth: '1200px',
    marginInline: 'auto',
  },
  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
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
    minWidth: '80px',
  },
  barValue: {
    minWidth: '80px',
    textAlign: 'right' as const,
  },
  detailImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: radiusVars['--radius-element'],
  },
  quantityControl: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    border: `1px solid ${colorVars['--color-divider']}`,
    borderRadius: radiusVars['--radius-element'],
    padding: `${spacingVars['--spacing-0.5']} ${spacingVars['--spacing-1']}`,
  },
  quantityValue: {
    minWidth: '32px',
    textAlign: 'center' as const,
  },
  filterBar: {
    display: 'flex',
    gap: spacingVars['--spacing-3'],
    alignItems: 'flex-end',
  },
  strikethrough: {
    textDecoration: 'line-through',
  },
  alignCenter: {
    alignItems: 'center',
  },
  cardBody: {
    padding: spacingVars['--spacing-4'],
    paddingTop: 0,
  },
  skeletonCardBody: {
    padding: spacingVars['--spacing-4'],
  },
  flex1: {
    flex: '1',
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

// Shared page shell with TopNav
function PageShell({
  children,
  breadcrumbs,
}: {
  children: React.ReactNode;
  breadcrumbs?: React.ReactNode;
}) {
  return (
    <div {...stylex.props(styles.page)}>
      <XDSTopNav
        label="Store navigation"
        title={
          <XDSTopNavTitle
            title="Atelier"
            logo={
              <XDSNavIcon icon={<CubeIcon style={{width: 16, height: 16}} />} />
            }
          />
        }
        startContent={
          <>
            <XDSTopNavItem label="Dashboard" href="#" />
            <XDSTopNavItem label="Products" href="#" />
            <XDSTopNavItem label="Orders" href="#" />
            <XDSTopNavItem label="Customers" href="#" />
          </>
        }
        endContent={
          <>
            <XDSButton
              label="Search"
              variant="ghost"
              icon={<MagnifyingGlassIcon style={{width: 16, height: 16}} />}
            />
            <XDSButton
              label="Notifications"
              variant="ghost"
              icon={<BellIcon style={{width: 16, height: 16}} />}
            />
            <XDSButton
              label="Cart"
              variant="ghost"
              icon={<ShoppingCartIcon style={{width: 16, height: 16}} />}
            />
            <XDSButton
              label="Account"
              variant="ghost"
              icon={<UserCircleIcon style={{width: 16, height: 16}} />}
            />
          </>
        }
      />
      <div {...stylex.props(styles.pageContent)}>
        {breadcrumbs && <div style={{marginBottom: 16}}>{breadcrumbs}</div>}
        {children}
      </div>
    </div>
  );
}

// =============================================================================
// Meta
// =============================================================================

const meta: Meta = {
  title: 'Examples/Ecommerce',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj;

// =============================================================================
// Dashboard — with tabs, stats, charts, recent orders
// =============================================================================

export const Dashboard: Story = {
  render: () => {
    const [tab, setTab] = useState('overview');
    const maxRevenue = Math.max(
      ...storeSummary.revenueByMonth.map(c => c.revenue),
    );
    const maxCatRevenue = Math.max(
      ...storeSummary.topCategories.map(c => c.revenue),
    );

    return (
      <PageShell
        breadcrumbs={
          <XDSBreadcrumbs>
            <XDSBreadcrumbItem href="#">Home</XDSBreadcrumbItem>
            <XDSBreadcrumbItem isCurrent>Dashboard</XDSBreadcrumbItem>
          </XDSBreadcrumbs>
        }>
        <XDSVStack gap="space6">
          <XDSHStack gap="space2" vAlign="center" hAlign="between">
            <XDSHeading level={2}>Dashboard</XDSHeading>
            <XDSButton variant="primary" label="Export Report">
              Export Report
            </XDSButton>
          </XDSHStack>

          <XDSTabList value={tab} onChange={setTab}>
            <XDSTab value="overview" label="Overview" />
            <XDSTab value="analytics" label="Analytics" />
            <XDSTab value="reports" label="Reports" />
          </XDSTabList>

          {/* KPI Stats */}
          <XDSGrid minChildWidth={200} gap="space4">
            {[
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
            ].map(stat => (
              <XDSCard key={stat.label}>
                <XDSVStack gap="space1">
                  <XDSText type="supporting" color="secondary">
                    {stat.label}
                  </XDSText>
                  <XDSHeading level={3} variant="editorial">
                    {stat.value}
                  </XDSHeading>
                </XDSVStack>
              </XDSCard>
            ))}
          </XDSGrid>

          {/* Revenue by month */}
          <XDSCard>
            <XDSVStack gap="space4">
              <XDSHeading level={4}>Revenue by Month</XDSHeading>
              {storeSummary.revenueByMonth.map(({month, revenue}) => (
                <div key={month} {...stylex.props(styles.barContainer)}>
                  <XDSText
                    type="supporting"
                    color="secondary"
                    xstyle={styles.barLabel}>
                    {month}
                  </XDSText>
                  <div style={{flex: 1}}>
                    <XDSProgressBar
                      label={month}
                      isLabelHidden
                      value={(revenue / maxRevenue) * 100}
                      max={100}
                    />
                  </div>
                  <XDSText
                    type="supporting"
                    weight="medium"
                    xstyle={styles.barValue}>
                    {formatPrice(revenue)}
                  </XDSText>
                </div>
              ))}
            </XDSVStack>
          </XDSCard>

          {/* Top categories */}
          <XDSCard>
            <XDSVStack gap="space4">
              <XDSHeading level={4}>Top Categories</XDSHeading>
              {storeSummary.topCategories.map(cat => (
                <div key={cat.category} {...stylex.props(styles.barContainer)}>
                  <XDSText
                    type="supporting"
                    color="secondary"
                    xstyle={styles.barLabel}>
                    {cat.category}
                  </XDSText>
                  <div style={{flex: 1}}>
                    <XDSProgressBar
                      label={cat.category}
                      isLabelHidden
                      value={(cat.revenue / maxCatRevenue) * 100}
                      max={100}
                    />
                  </div>
                  <XDSText
                    type="supporting"
                    weight="medium"
                    xstyle={styles.barValue}>
                    {formatPrice(cat.revenue)}
                  </XDSText>
                </div>
              ))}
            </XDSVStack>
          </XDSCard>

          {/* Recent orders table */}
          <XDSCard>
            <XDSVStack gap="space4">
              <XDSHStack gap="space2" vAlign="center" hAlign="between">
                <XDSHeading level={4}>Recent Orders</XDSHeading>
                <XDSButton variant="secondary" label="View All">
                  View All
                </XDSButton>
              </XDSHStack>
              <XDSTable
                data={orders.slice(0, 5)}
                columns={dashboardOrderColumns}
                idKey="id"
                hasHover
                density="balanced"
              />
            </XDSVStack>
          </XDSCard>
        </XDSVStack>
      </PageShell>
    );
  },
};

const dashboardOrderColumns: XDSTableColumn<Order>[] = [
  {
    key: 'orderNumber',
    header: 'Order',
    width: pixel(140),
    renderCell: item => (
      <XDSLink href="#" label={item.orderNumber}>
        {item.orderNumber}
      </XDSLink>
    ),
  },
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
// Product Catalog — with search, filter, category selector, product detail dialog
// =============================================================================

export const ProductCatalog: Story = {
  render: () => {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(
      null,
    );

    const categoryOptions = [
      {value: 'all', label: 'All Categories'},
      ...Array.from(new Set(products.map(p => p.category))).map(c => ({
        value: c,
        label: c,
      })),
    ];

    const filtered = useMemo(() => {
      return products.filter(p => {
        const matchesSearch =
          !search ||
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category === 'all' || p.category === category;
        return matchesSearch && matchesCategory;
      });
    }, [search, category]);

    return (
      <PageShell
        breadcrumbs={
          <XDSBreadcrumbs>
            <XDSBreadcrumbItem href="#">Home</XDSBreadcrumbItem>
            <XDSBreadcrumbItem isCurrent>Products</XDSBreadcrumbItem>
          </XDSBreadcrumbs>
        }>
        <XDSVStack gap="space6">
          <XDSHStack gap="space2" vAlign="center" hAlign="between">
            <XDSHeading level={2}>Collection</XDSHeading>
            <XDSHStack gap="space2">
              <XDSBadge variant="neutral">{products.length} pieces</XDSBadge>
              <XDSButton variant="primary" label="Add Product">
                Add Product
              </XDSButton>
            </XDSHStack>
          </XDSHStack>

          {/* Search and filter bar */}
          <div {...stylex.props(styles.filterBar)}>
            <XDSTextInput
              label="Search products"
              isLabelHidden
              placeholder="Search by name or description\u2026"
              value={search}
              onChange={setSearch}
              startIcon={MagnifyingGlassIcon}
            />
            <XDSSelector
              label="Category"
              isLabelHidden
              items={categoryOptions}
              value={category}
              onChange={setCategory}
              placeholder="All Categories"
            />
          </div>

          {filtered.length === 0 ? (
            <XDSEmptyState
              icon={<span style={{fontSize: '48px'}}>\ud83d\udd0d</span>}
              title="No products found"
              description="Try adjusting your search or changing the category filter."
              actions={
                <XDSButton
                  variant="secondary"
                  label="Clear filters"
                  onClick={() => {
                    setSearch('');
                    setCategory('all');
                  }}
                />
              }
            />
          ) : (
            <XDSGrid minChildWidth={280} gap="space4">
              {filtered.map(product => (
                <XDSCard key={product.id} isFullBleed>
                  <XDSVStack gap="space3">
                    <XDSAspectRatio ratio={4 / 3}>
                      <img
                        src={product.image}
                        alt={product.name}
                        {...stylex.props(styles.productImage)}
                      />
                    </XDSAspectRatio>
                    <XDSVStack gap="space2" xstyle={styles.cardBody}>
                      <XDSHStack gap="space2" vAlign="center" hAlign="between">
                        <XDSBadge variant="neutral">
                          {product.category}
                        </XDSBadge>
                        <XDSBadge
                          variant={stockStatusBadgeVariant[product.status]}>
                          {stockStatusLabel[product.status]}
                        </XDSBadge>
                      </XDSHStack>
                      <XDSText type="body" weight="bold">
                        {product.name}
                      </XDSText>
                      <XDSText type="supporting" color="secondary" maxLines={2}>
                        {product.description}
                      </XDSText>
                      <XDSHStack gap="space2" vAlign="center">
                        <XDSText type="large" weight="semibold">
                          {formatPrice(product.price)}
                        </XDSText>
                        {product.compareAtPrice && (
                          <XDSText
                            type="body"
                            color="secondary"
                            xstyle={styles.strikethrough}>
                            {formatPrice(product.compareAtPrice)}
                          </XDSText>
                        )}
                      </XDSHStack>
                      <XDSHStack gap="space2" vAlign="center">
                        <span {...stylex.props(styles.stars)}>
                          {renderStars(product.rating)}
                        </span>
                        <XDSText type="supporting" color="secondary">
                          ({product.reviewCount})
                        </XDSText>
                      </XDSHStack>
                    </XDSVStack>
                  </XDSVStack>
                </XDSCard>
              ))}
            </XDSGrid>
          )}

          {/* Product detail dialog */}
          <XDSDialog
            isShown={selectedProduct !== null}
            onHide={() => setSelectedProduct(null)}
            width={640}>
            {selectedProduct && (
              <>
                <XDSDialogHeader
                  title={selectedProduct.name}
                  onHide={() => setSelectedProduct(null)}
                />
                <XDSLayoutContent>
                  <XDSVStack gap="space4">
                    <XDSAspectRatio ratio={16 / 9}>
                      <img
                        src={selectedProduct.image}
                        alt={selectedProduct.name}
                        {...stylex.props(styles.detailImage)}
                      />
                    </XDSAspectRatio>
                    <XDSHStack gap="space2" vAlign="center">
                      <XDSBadge variant="neutral">
                        {selectedProduct.category}
                      </XDSBadge>
                      <XDSBadge
                        variant={
                          stockStatusBadgeVariant[selectedProduct.status]
                        }>
                        {stockStatusLabel[selectedProduct.status]}
                      </XDSBadge>
                      <XDSText type="supporting" color="secondary">
                        SKU: {selectedProduct.sku}
                      </XDSText>
                    </XDSHStack>
                    <XDSText type="body">{selectedProduct.description}</XDSText>
                    <XDSHStack gap="space3" vAlign="center">
                      <XDSHeading level={3}>
                        {formatPrice(selectedProduct.price)}
                      </XDSHeading>
                      {selectedProduct.compareAtPrice && (
                        <XDSText
                          type="large"
                          color="secondary"
                          xstyle={styles.strikethrough}>
                          {formatPrice(selectedProduct.compareAtPrice)}
                        </XDSText>
                      )}
                    </XDSHStack>
                    <XDSHStack gap="space2" vAlign="center">
                      <span {...stylex.props(styles.stars)}>
                        {renderStars(selectedProduct.rating)}
                      </span>
                      <XDSLink href="#" label="View reviews">
                        {selectedProduct.reviewCount} reviews
                      </XDSLink>
                    </XDSHStack>
                    <XDSDivider />
                    <XDSHStack gap="space2">
                      <XDSButton variant="primary" label="Add to Cart">
                        Add to Cart
                      </XDSButton>
                      <XDSButton variant="secondary" label="Save for Later">
                        Save for Later
                      </XDSButton>
                    </XDSHStack>
                  </XDSVStack>
                </XDSLayoutContent>
              </>
            )}
          </XDSDialog>
        </XDSVStack>
      </PageShell>
    );
  },
};

// =============================================================================
// Order List — with selection, row actions dropdown, expandable order details
// =============================================================================

export const OrderList: Story = {
  render: () => {
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

    const selectionPlugin = useXDSTableSelection<Order>({
      getIsItemSelected: item => selectedKeys.has(item.id),
      onSelectItem: ({item, isSelected}) => {
        const next = new Set(selectedKeys);
        if (isSelected) {
          next.add(item.id);
        } else {
          next.delete(item.id);
        }
        setSelectedKeys(next);
      },
      onSelectAll: ({isAllSelected}) => {
        setSelectedKeys(
          isAllSelected ? new Set(orders.map(o => o.id)) : new Set(),
        );
      },
      getIsAllSelected: () =>
        orders.length > 0 && orders.every(o => selectedKeys.has(o.id)),
      getIsIndeterminate: () => {
        const count = orders.filter(o => selectedKeys.has(o.id)).length;
        return count > 0 && count < orders.length;
      },
    });

    const allOrderColumns: XDSTableColumn<Order>[] = [
      {
        key: 'orderNumber',
        header: 'Order #',
        width: pixel(140),
        renderCell: item => (
          <XDSLink href="#" label={item.orderNumber}>
            {item.orderNumber}
          </XDSLink>
        ),
      },
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
        renderCell: item => (
          <XDSText type="body" weight="semibold">
            {formatPrice(item.total)}
          </XDSText>
        ),
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
      {
        key: 'actions',
        header: '',
        width: pixel(48),
        renderCell: item => (
          <XDSDropdownMenu
            button={{
              label: 'Actions',
              variant: 'ghost',
              size: 'sm',
              icon: <EllipsisVerticalIcon style={{width: 16, height: 16}} />,
            }}
            items={[
              {label: 'View details', icon: EyeIcon, onClick: () => {}},
              {label: 'Edit order', icon: PencilIcon, onClick: () => {}},
              {type: 'divider' as const},
              ...(item.status === 'processing'
                ? [
                    {
                      label: 'Mark as shipped',
                      icon: TruckIcon,
                      onClick: () => {},
                    },
                  ]
                : []),
              ...(item.status === 'pending'
                ? [
                    {
                      label: 'Cancel order',
                      icon: XMarkIcon,
                      onClick: () => {},
                    },
                  ]
                : []),
            ]}
          />
        ),
      },
    ];

    return (
      <PageShell
        breadcrumbs={
          <XDSBreadcrumbs>
            <XDSBreadcrumbItem href="#">Home</XDSBreadcrumbItem>
            <XDSBreadcrumbItem isCurrent>Orders</XDSBreadcrumbItem>
          </XDSBreadcrumbs>
        }>
        <XDSVStack gap="space4">
          <XDSHStack gap="space2" vAlign="center" hAlign="between">
            <XDSHeading level={2}>Orders</XDSHeading>
            <XDSHStack gap="space2" vAlign="center">
              {selectedKeys.size > 0 && (
                <XDSText type="supporting" color="secondary">
                  {selectedKeys.size} selected
                </XDSText>
              )}
              <XDSBadge variant="neutral">{orders.length} orders</XDSBadge>
            </XDSHStack>
          </XDSHStack>

          {selectedKeys.size > 0 && (
            <XDSHStack gap="space2">
              <XDSButton variant="secondary" label="Export Selected" size="sm">
                Export Selected
              </XDSButton>
              <XDSButton variant="secondary" label="Mark as Shipped" size="sm">
                Mark as Shipped
              </XDSButton>
              <XDSButton
                variant="secondary"
                label="Clear Selection"
                size="sm"
                onClick={() => setSelectedKeys(new Set())}>
                Clear Selection
              </XDSButton>
            </XDSHStack>
          )}

          <XDSCard>
            <XDSTable
              data={orders}
              columns={allOrderColumns}
              idKey="id"
              hasHover
              density="balanced"
              dividers="rows"
              plugins={{selection: selectionPlugin}}
            />
          </XDSCard>

          {/* Expandable order details */}
          <XDSHeading level={4}>Order Details</XDSHeading>
          <XDSCard>
            <XDSCollapsibleGroup type="single">
              <XDSVStack gap="space0">
                {orders.slice(0, 3).map(order => (
                  <XDSCollapsible
                    key={order.id}
                    value={order.id}
                    trigger={
                      <XDSHStack gap="space3" vAlign="center">
                        <XDSText type="body" weight="semibold">
                          {order.orderNumber}
                        </XDSText>
                        <XDSText type="supporting" color="secondary">
                          {order.customerName}
                        </XDSText>
                        <XDSBadge
                          variant={orderStatusBadgeVariant[order.status]}>
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </XDSBadge>
                        <XDSText type="body" weight="semibold">
                          {formatPrice(order.total)}
                        </XDSText>
                      </XDSHStack>
                    }>
                    <XDSList hasDividers density="compact">
                      {order.items.map(lineItem => (
                        <XDSListItem
                          key={lineItem.productId}
                          label={lineItem.productName}
                          description={`${lineItem.quantity} \u00d7 ${formatPrice(lineItem.unitPrice)}`}
                          endContent={
                            <XDSText type="body" weight="semibold">
                              {formatPrice(lineItem.total)}
                            </XDSText>
                          }
                        />
                      ))}
                    </XDSList>
                    <XDSDivider />
                    <XDSHStack gap="space4" hAlign="end">
                      <XDSVStack gap="space1">
                        <XDSText type="supporting" color="secondary">
                          Subtotal: {formatPrice(order.subtotal)}
                        </XDSText>
                        <XDSText type="supporting" color="secondary">
                          Shipping: {formatPrice(order.shipping)}
                        </XDSText>
                        <XDSText type="supporting" color="secondary">
                          Tax: {formatPrice(order.tax)}
                        </XDSText>
                        <XDSText type="body" weight="bold">
                          Total: {formatPrice(order.total)}
                        </XDSText>
                      </XDSVStack>
                    </XDSHStack>
                  </XDSCollapsible>
                ))}
              </XDSVStack>
            </XDSCollapsibleGroup>
          </XDSCard>
        </XDSVStack>
      </PageShell>
    );
  },
};

// =============================================================================
// Customer List — with status dots, inline status
// =============================================================================

export const CustomerList: Story = {
  render: () => {
    const customerStatusVariant: Record<Customer['status'], XDSBadgeVariant> = {
      active: 'success',
      inactive: 'neutral',
      vip: 'info',
    };

    const customerStatusDotVariant: Record<
      Customer['status'],
      'positive' | 'neutral' | 'info'
    > = {
      active: 'positive',
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
              <XDSHStack gap="space1" vAlign="center">
                <XDSLink href="#" label={item.name}>
                  {item.name}
                </XDSLink>
                <XDSStatusDot
                  variant={customerStatusDotVariant[item.status]}
                  label={item.status}
                />
              </XDSHStack>
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
        renderCell: item => (
          <XDSText type="body" weight="semibold">
            {formatPrice(item.totalSpent)}
          </XDSText>
        ),
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
      <PageShell
        breadcrumbs={
          <XDSBreadcrumbs>
            <XDSBreadcrumbItem href="#">Home</XDSBreadcrumbItem>
            <XDSBreadcrumbItem isCurrent>Customers</XDSBreadcrumbItem>
          </XDSBreadcrumbs>
        }>
        <XDSVStack gap="space4">
          <XDSHStack gap="space2" vAlign="center" hAlign="between">
            <XDSHeading level={2}>Customers</XDSHeading>
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
      </PageShell>
    );
  },
};

// =============================================================================
// Shopping Cart — with quantity controls, list component, order summary
// =============================================================================

export const ShoppingCart: Story = {
  render: () => {
    const [quantities, setQuantities] = useState<Record<string, number>>(
      Object.fromEntries(cartItems.map(item => [item.id, item.quantity])),
    );

    const updateQuantity = (id: string, delta: number) => {
      setQuantities(prev => ({
        ...prev,
        [id]: Math.max(1, (prev[id] ?? 1) + delta),
      }));
    };

    const computedTotal = cartItems.reduce(
      (sum, item) =>
        sum + item.unitPrice * (quantities[item.id] ?? item.quantity),
      0,
    );
    const tax = computedTotal * 0.08;

    return (
      <PageShell
        breadcrumbs={
          <XDSBreadcrumbs>
            <XDSBreadcrumbItem href="#">Home</XDSBreadcrumbItem>
            <XDSBreadcrumbItem isCurrent>Cart</XDSBreadcrumbItem>
          </XDSBreadcrumbs>
        }>
        <XDSHStack gap="space6" vAlign="start">
          {/* Cart items */}
          <div style={{flex: 2}}>
            <XDSCard>
              <XDSVStack gap="space4">
                <XDSHStack gap="space2" vAlign="center" hAlign="between">
                  <XDSHeading level={3}>
                    Cart ({cartItems.length} items)
                  </XDSHeading>
                  <XDSButton variant="secondary" label="Clear Cart" size="sm">
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
                          <XDSLink href="#" label={item.productName}>
                            {item.productName}
                          </XDSLink>
                          <XDSText type="supporting" color="secondary">
                            {formatPrice(item.unitPrice)} each
                          </XDSText>
                        </XDSVStack>
                      </div>
                      {/* Quantity controls */}
                      <div {...stylex.props(styles.quantityControl)}>
                        <XDSButton
                          variant="ghost"
                          size="sm"
                          label="Decrease"
                          onClick={() => updateQuantity(item.id, -1)}>
                          \u2212
                        </XDSButton>
                        <XDSText
                          type="body"
                          weight="semibold"
                          xstyle={styles.quantityValue}>
                          {quantities[item.id]}
                        </XDSText>
                        <XDSButton
                          variant="ghost"
                          size="sm"
                          label="Increase"
                          onClick={() => updateQuantity(item.id, 1)}>
                          +
                        </XDSButton>
                      </div>
                      <XDSText type="body" weight="semibold">
                        {formatPrice(
                          item.unitPrice *
                            (quantities[item.id] ?? item.quantity),
                        )}
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
                <XDSHeading level={4}>Order Summary</XDSHeading>
                <XDSDivider />
                <div {...stylex.props(styles.summaryRow)}>
                  <XDSText type="body" color="secondary">
                    Subtotal
                  </XDSText>
                  <XDSText type="body" weight="medium">
                    {formatPrice(computedTotal)}
                  </XDSText>
                </div>
                <div {...stylex.props(styles.summaryRow)}>
                  <XDSText type="body" color="secondary">
                    Shipping
                  </XDSText>
                  <XDSText type="body" weight="medium" color="active">
                    Free
                  </XDSText>
                </div>
                <div {...stylex.props(styles.summaryRow)}>
                  <XDSText type="body" color="secondary">
                    Tax
                  </XDSText>
                  <XDSText type="body" weight="medium">
                    {formatPrice(tax)}
                  </XDSText>
                </div>
                <XDSDivider />
                <div {...stylex.props(styles.summaryRow)}>
                  <XDSText type="large" weight="bold">
                    Total
                  </XDSText>
                  <XDSText type="large" weight="bold">
                    {formatPrice(computedTotal + tax)}
                  </XDSText>
                </div>
                <XDSButton variant="primary" label="Checkout">
                  Checkout
                </XDSButton>
              </XDSVStack>
            </XDSCard>
          </div>
        </XDSHStack>
      </PageShell>
    );
  },
};

// =============================================================================
// Product Reviews — with star breakdown, review cards
// =============================================================================

export const ProductReviews: Story = {
  render: () => {
    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const ratingCounts = [5, 4, 3, 2, 1].map(stars => ({
      stars,
      count: reviews.filter(r => r.rating === stars).length,
    }));

    return (
      <PageShell
        breadcrumbs={
          <XDSBreadcrumbs>
            <XDSBreadcrumbItem href="#">Home</XDSBreadcrumbItem>
            <XDSBreadcrumbItem href="#">Products</XDSBreadcrumbItem>
            <XDSBreadcrumbItem isCurrent>Reviews</XDSBreadcrumbItem>
          </XDSBreadcrumbs>
        }>
        <XDSVStack gap="space6">
          <XDSHeading level={2}>Customer Reviews</XDSHeading>

          {/* Rating summary */}
          <XDSCard>
            <XDSHStack gap="space6" vAlign="center">
              <XDSVStack gap="space1" xstyle={styles.alignCenter}>
                <XDSHeading level={1} variant="editorial">
                  {avgRating.toFixed(1)}
                </XDSHeading>
                <span {...stylex.props(styles.stars)}>
                  {renderStars(avgRating)}
                </span>
                <XDSText type="supporting" color="secondary">
                  {reviews.length} reviews
                </XDSText>
              </XDSVStack>
              <XDSDivider orientation="vertical" />
              <div style={{flex: 1}}>
                <XDSVStack gap="space2">
                  {ratingCounts.map(({stars, count}) => (
                    <div key={stars} {...stylex.props(styles.barContainer)}>
                      <XDSText type="supporting" color="secondary">
                        {stars} star{stars !== 1 ? 's' : ''}
                      </XDSText>
                      <div style={{flex: 1}}>
                        <XDSProgressBar
                          label={`${stars} stars`}
                          isLabelHidden
                          value={
                            reviews.length > 0
                              ? (count / reviews.length) * 100
                              : 0
                          }
                          max={100}
                        />
                      </div>
                      <XDSText type="supporting" weight="medium">
                        {count}
                      </XDSText>
                    </div>
                  ))}
                </XDSVStack>
              </div>
            </XDSHStack>
          </XDSCard>

          {/* Review cards */}
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
                        <XDSLink href="#" label={review.productName}>
                          {review.productName}
                        </XDSLink>
                      </XDSHStack>
                    </XDSVStack>
                    <div style={{marginLeft: 'auto'}}>
                      <XDSText type="supporting" color="secondary">
                        {new Date(review.createdAt).toLocaleDateString(
                          'en-US',
                          {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          },
                        )}
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
      </PageShell>
    );
  },
};

// =============================================================================
// Product Detail — full product page with image, info, reviews, related products
// =============================================================================

export const ProductDetail: Story = {
  render: () => {
    const product = products[0];
    const productReviews =
      reviews.filter(r => r.productId === product.id).length > 0
        ? reviews.filter(r => r.productId === product.id)
        : reviews.slice(0, 3);
    const relatedProducts = products
      .filter(p => p.categoryId === product.categoryId && p.id !== product.id)
      .slice(0, 3);

    return (
      <PageShell
        breadcrumbs={
          <XDSBreadcrumbs>
            <XDSBreadcrumbItem href="#">Home</XDSBreadcrumbItem>
            <XDSBreadcrumbItem href="#">Products</XDSBreadcrumbItem>
            <XDSBreadcrumbItem href="#">{product.category}</XDSBreadcrumbItem>
            <XDSBreadcrumbItem isCurrent>{product.name}</XDSBreadcrumbItem>
          </XDSBreadcrumbs>
        }>
        <XDSVStack gap="space6">
          {/* Main product section */}
          <XDSHStack gap="space6" vAlign="start">
            <div style={{flex: 1}}>
              <XDSCard isFullBleed>
                <XDSAspectRatio ratio={1}>
                  <img
                    src={product.image}
                    alt={product.name}
                    {...stylex.props(styles.detailImage)}
                  />
                </XDSAspectRatio>
              </XDSCard>
            </div>
            <div style={{flex: 1}}>
              <XDSVStack gap="space4">
                <XDSHStack gap="space2">
                  <XDSBadge variant="neutral">{product.category}</XDSBadge>
                  <XDSBadge variant={stockStatusBadgeVariant[product.status]}>
                    {stockStatusLabel[product.status]}
                  </XDSBadge>
                </XDSHStack>
                <XDSHeading level={2}>{product.name}</XDSHeading>
                <XDSHStack gap="space2" vAlign="center">
                  <span {...stylex.props(styles.stars)}>
                    {renderStars(product.rating)}
                  </span>
                  <XDSLink href="#" label="View reviews">
                    {product.reviewCount} reviews
                  </XDSLink>
                </XDSHStack>
                <XDSHStack gap="space3" vAlign="center">
                  <XDSHeading level={3} variant="editorial">
                    {formatPrice(product.price)}
                  </XDSHeading>
                  {product.compareAtPrice && (
                    <XDSText
                      type="large"
                      color="secondary"
                      xstyle={styles.strikethrough}>
                      {formatPrice(product.compareAtPrice)}
                    </XDSText>
                  )}
                </XDSHStack>
                <XDSText type="body">{product.description}</XDSText>
                <XDSText type="supporting" color="secondary">
                  SKU: {product.sku}
                </XDSText>
                <XDSDivider />
                <XDSHStack gap="space2">
                  <XDSButton variant="primary" label="Add to Cart">
                    Add to Cart
                  </XDSButton>
                  <XDSButton variant="secondary" label="Save for Later">
                    Save for Later
                  </XDSButton>
                </XDSHStack>
                <XDSHStack gap="space2" vAlign="center">
                  {product.tags.map(tag => (
                    <XDSBadge key={tag} variant="neutral">
                      {tag}
                    </XDSBadge>
                  ))}
                </XDSHStack>
              </XDSVStack>
            </div>
          </XDSHStack>

          {/* Reviews section */}
          <XDSSection variant="section">
            <XDSVStack gap="space4">
              <XDSHStack gap="space2" vAlign="center" hAlign="between">
                <XDSHeading level={3}>Customer Reviews</XDSHeading>
                <XDSButton variant="secondary" label="Write a Review" size="sm">
                  Write a Review
                </XDSButton>
              </XDSHStack>
              <XDSVStack gap="space3">
                {productReviews.map(review => (
                  <XDSCard key={review.id}>
                    <XDSVStack gap="space2">
                      <XDSHStack gap="space2" vAlign="center">
                        <XDSAvatar name={review.customerName} size="small" />
                        <XDSText type="body" weight="semibold">
                          {review.customerName}
                        </XDSText>
                        {review.isVerified && (
                          <XDSBadge variant="success">Verified</XDSBadge>
                        )}
                        <span {...stylex.props(styles.stars)}>
                          {renderStars(review.rating)}
                        </span>
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
          </XDSSection>

          {/* Related products */}
          {relatedProducts.length > 0 && (
            <>
              <XDSHeading level={3}>Related Products</XDSHeading>
              <XDSGrid minChildWidth={250} gap="space4">
                {relatedProducts.map(p => (
                  <XDSCard key={p.id} isFullBleed>
                    <XDSVStack gap="space2">
                      <XDSAspectRatio ratio={4 / 3}>
                        <img
                          src={p.image}
                          alt={p.name}
                          {...stylex.props(styles.productImage)}
                        />
                      </XDSAspectRatio>
                      <XDSVStack gap="space1" xstyle={styles.cardBody}>
                        <XDSText type="body" weight="bold">
                          {p.name}
                        </XDSText>
                        <XDSText type="large" weight="semibold">
                          {formatPrice(p.price)}
                        </XDSText>
                      </XDSVStack>
                    </XDSVStack>
                  </XDSCard>
                ))}
              </XDSGrid>
            </>
          )}
        </XDSVStack>
      </PageShell>
    );
  },
};

// =============================================================================
// Empty Cart — demonstrates empty state
// =============================================================================

export const EmptyCart: Story = {
  render: () => (
    <PageShell
      breadcrumbs={
        <XDSBreadcrumbs>
          <XDSBreadcrumbItem href="#">Home</XDSBreadcrumbItem>
          <XDSBreadcrumbItem isCurrent>Cart</XDSBreadcrumbItem>
        </XDSBreadcrumbs>
      }>
      <XDSCard>
        <XDSEmptyState
          icon={<span style={{fontSize: '48px'}}>\ud83d\uded2</span>}
          title="Your cart is empty"
          description="Looks like you haven\u2019t added any pieces to your collection yet."
          actions={
            <XDSButton variant="primary" label="Browse Collection">
              Browse Collection
            </XDSButton>
          }
        />
      </XDSCard>
    </PageShell>
  ),
};

// =============================================================================
// Loading — skeleton states for dashboard and product grid
// =============================================================================

export const Loading: Story = {
  render: () => (
    <PageShell>
      <XDSVStack gap="space6">
        <XDSSkeleton width={200} height={28} radius="container" />

        {/* Skeleton stat cards */}
        <XDSGrid minChildWidth={200} gap="space4">
          {[0, 1, 2, 3].map(i => (
            <XDSCard key={i}>
              <XDSVStack gap="space2">
                <XDSSkeleton
                  width={80}
                  height={14}
                  radius="container"
                  index={i}
                />
                <XDSSkeleton
                  width={120}
                  height={32}
                  radius="container"
                  index={i}
                />
              </XDSVStack>
            </XDSCard>
          ))}
        </XDSGrid>

        {/* Skeleton product grid */}
        <XDSSkeleton width={160} height={24} radius="container" />
        <XDSGrid minChildWidth={280} gap="space4">
          {[0, 1, 2, 3, 4, 5].map(i => (
            <XDSCard key={i} isFullBleed>
              <XDSVStack gap="space3">
                <XDSSkeleton
                  width="100%"
                  height={200}
                  radius="none"
                  index={i}
                />
                <XDSVStack gap="space2" xstyle={styles.skeletonCardBody}>
                  <XDSHStack gap="space2">
                    <XDSSkeleton
                      width={60}
                      height={20}
                      radius="container"
                      index={i}
                    />
                    <XDSSkeleton
                      width={60}
                      height={20}
                      radius="container"
                      index={i}
                    />
                  </XDSHStack>
                  <XDSSkeleton
                    width="80%"
                    height={16}
                    radius="container"
                    index={i}
                  />
                  <XDSSkeleton
                    width="60%"
                    height={14}
                    radius="container"
                    index={i}
                  />
                  <XDSSkeleton
                    width={80}
                    height={20}
                    radius="container"
                    index={i}
                  />
                </XDSVStack>
              </XDSVStack>
            </XDSCard>
          ))}
        </XDSGrid>

        {/* Skeleton table */}
        <XDSCard>
          <XDSVStack gap="space3">
            <XDSSkeleton width={160} height={20} radius="container" />
            <XDSDivider />
            {[0, 1, 2, 3, 4].map(i => (
              <XDSHStack key={i} gap="space4" vAlign="center">
                <XDSSkeleton
                  width={40}
                  height={40}
                  radius="rounded"
                  index={i}
                />
                <XDSVStack gap="space1" xstyle={styles.flex1}>
                  <XDSSkeleton
                    width="40%"
                    height={14}
                    radius="container"
                    index={i}
                  />
                  <XDSSkeleton
                    width="25%"
                    height={12}
                    radius="container"
                    index={i}
                  />
                </XDSVStack>
                <XDSSkeleton
                  width={80}
                  height={14}
                  radius="container"
                  index={i}
                />
                <XDSSkeleton
                  width={60}
                  height={22}
                  radius="container"
                  index={i}
                />
              </XDSHStack>
            ))}
          </XDSVStack>
        </XDSCard>
      </XDSVStack>
    </PageShell>
  ),
};
