/**
 * @file index.ts
 * @input None
 * @output Public API for @xds/data
 * @position Package entry point; re-exports everything templates need
 *
 * Usage:
 *   import { createData } from '@xds/data';
 *   import type { Product, Order } from '@xds/data';
 *
 *   // Or import raw data directly
 *   import { products, orders } from '@xds/data';
 */

// Core API
export {createData} from './createData';

// Types
export type {
  Category,
  Product,
  Customer,
  Order,
  OrderItem,
  Review,
  CartItem,
  CartSummary,
  StoreSummary,
  EntityName,
  EntityMap,
  CreateDataConfig,
  DataResult,
  DataHelpers,
} from './types';

// Raw data — for direct access when createData() is overkill
export {
  categories,
  products,
  customers,
  orders,
  reviews,
  cartItems,
  cartSummary,
  storeSummary,
} from './dataset';
