/**
 * @file types.ts
 * @input None
 * @output Entity type definitions for the XDS mock data system
 * @position Core types; all entity schemas are defined here
 *
 * These types define the shape of each entity in the data system.
 * Templates import these types to get full type safety over mock data.
 */

// =============================================================================
// Entity Types
// =============================================================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  productCount: number;
}

export interface Product extends Record<string, unknown> {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  categoryId: string;
  category: string;
  image: string;
  rating: number;
  reviewCount: number;
  stock: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  tags: string[];
  sku: string;
  createdAt: string;
}

export interface Customer extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  totalOrders: number;
  totalSpent: number;
  joinedAt: string;
  status: 'active' | 'inactive' | 'vip';
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Order extends Record<string, unknown> {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status:
    | 'pending'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'refunded';
  paymentMethod: 'credit_card' | 'paypal' | 'apple_pay' | 'bank_transfer';
  createdAt: string;
  updatedAt: string;
}

export interface Review extends Record<string, unknown> {
  id: string;
  productId: string;
  productName: string;
  customerId: string;
  customerName: string;
  rating: number;
  title: string;
  body: string;
  isVerified: boolean;
  createdAt: string;
}

export interface CartItem extends Record<string, unknown> {
  id: string;
  productId: string;
  productName: string;
  image: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface CartSummary {
  itemCount: number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export interface StoreSummary {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  averageOrderValue: number;
  conversionRate: number;
  revenueByMonth: {month: string; revenue: number}[];
  topCategories: {category: string; revenue: number; orders: number}[];
}

// =============================================================================
// Entity Name Registry
// =============================================================================

/** All available entity names in the data system. */
export type EntityName =
  | 'Category'
  | 'Product'
  | 'Customer'
  | 'Order'
  | 'Review'
  | 'CartItem';

/** Maps entity names to their TypeScript types. */
export interface EntityMap {
  Category: Category;
  Product: Product;
  Customer: Customer;
  Order: Order;
  Review: Review;
  CartItem: CartItem;
}

// =============================================================================
// createData API types
// =============================================================================

/** Configuration for createData(). Declare which entities you need and how many. */
export interface CreateDataConfig {
  /** Which entity types to include. */
  entities: EntityName[];
  /** Optional: limit the count of each entity type. Defaults to all available. */
  count?: Partial<Record<EntityName, number>>;
}

/** The result of createData(). Only includes the entities you requested. */
export type DataResult<E extends EntityName = EntityName> = {
  [K in E]: EntityMap[K][];
} & {
  /** Cart summary (included when CartItem is requested) */
  cartSummary: CartSummary;
  /** Store-level summary stats */
  storeSummary: StoreSummary;
  /** Helpers */
  helpers: DataHelpers;
};

export interface DataHelpers {
  formatPrice: (amount: number) => string;
  getProduct: (id: string) => Product | undefined;
  getProductsByCategory: (categoryId: string) => Product[];
  getOrdersByCustomer: (customerId: string) => Order[];
  getReviewsForProduct: (productId: string) => Review[];
  getOrderStatusColor: (
    status: Order['status'],
  ) => 'green' | 'blue' | 'yellow' | 'red' | 'gray';
  getStockStatusColor: (
    status: Product['status'],
  ) => 'green' | 'yellow' | 'red';
}
