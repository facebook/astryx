/**
 * @file createData.ts
 * @input CreateDataConfig — declares which entities a template needs
 * @output DataResult — typed object with requested entity arrays, summaries, and helpers
 * @position Public API; the main entry point for templates consuming mock data
 *
 * Usage:
 *   import { createData } from '@xds/data';
 *
 *   // Get everything
 *   const data = createData({
 *     entities: ['Product', 'Category', 'Order'],
 *   });
 *
 *   // Limit counts
 *   const data = createData({
 *     entities: ['Product', 'Category', 'Order'],
 *     count: { Product: 6, Order: 3 },
 *   });
 *
 *   data.Product   // Product[]
 *   data.Category  // Category[]
 *   data.helpers.formatPrice(29.99)  // "$29.99"
 */

import type {
  EntityName,
  EntityMap,
  CreateDataConfig,
  DataResult,
  DataHelpers,
  Product,
  Order,
} from './types';
import {
  categories,
  products,
  customers,
  orders,
  reviews,
  cartItems,
  cartSummary,
  storeSummary,
} from './dataset';

// =============================================================================
// Helpers
// =============================================================================

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function getOrderStatusColor(
  status: Order['status'],
): 'green' | 'blue' | 'yellow' | 'red' | 'gray' {
  const map: Record<
    Order['status'],
    'green' | 'blue' | 'yellow' | 'red' | 'gray'
  > = {
    delivered: 'green',
    shipped: 'blue',
    processing: 'blue',
    pending: 'yellow',
    cancelled: 'red',
    refunded: 'gray',
  };
  return map[status];
}

function getStockStatusColor(
  status: Product['status'],
): 'green' | 'yellow' | 'red' {
  const map: Record<Product['status'], 'green' | 'yellow' | 'red'> = {
    in_stock: 'green',
    low_stock: 'yellow',
    out_of_stock: 'red',
  };
  return map[status];
}

/** All available entity data, keyed by entity name. */
const entitySources: {[K in EntityName]: EntityMap[K][]} = {
  Category: categories,
  Product: products,
  Customer: customers,
  Order: orders,
  Review: reviews,
  CartItem: cartItems,
};

// =============================================================================
// createData
// =============================================================================

/**
 * Create a typed data object for a template.
 *
 * Declare which entities you need and optionally limit the count.
 * Returns only the requested entities with full type safety,
 * plus summaries and helper functions.
 */
export function createData<E extends EntityName>(
  config: CreateDataConfig & {entities: E[]},
): DataResult<E> {
  const result: Record<string, unknown> = {};

  for (const entity of config.entities) {
    const source = entitySources[entity];
    const limit = config.count?.[entity];
    const items = limit != null ? source.slice(0, limit) : [...source];
    // Deep copy to prevent mutation leaks between createData() calls
    result[entity] = items.map(item => structuredClone(item));
  }

  // Build helpers that operate on the sliced data
  const productData = (result.Product as Product[] | undefined) ?? products;
  const orderData = (result.Order as Order[] | undefined) ?? orders;

  const helpers: DataHelpers = {
    formatPrice,
    getProduct: (id: string) => productData.find(p => p.id === id),
    getProductsByCategory: (categoryId: string) =>
      productData.filter(p => p.categoryId === categoryId),
    getOrdersByCustomer: (customerId: string) =>
      orderData.filter(o => o.customerId === customerId),
    getReviewsForProduct: (productId: string) => {
      const reviewData =
        (result.Review as typeof reviews | undefined) ?? reviews;
      return reviewData.filter(r => r.productId === productId);
    },
    getOrderStatusColor,
    getStockStatusColor,
  };

  result.cartSummary = cartSummary;
  result.storeSummary = storeSummary;
  result.helpers = helpers;

  return result as DataResult<E>;
}
