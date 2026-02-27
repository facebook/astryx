/**
 * @file index.ts
 * @input None
 * @output Public API for @xds/data
 * @position Package entry point; re-exports everything templates need
 *
 * Usage:
 *   import { createData } from '@xds/data';
 *   import type { Product, Repository, PullRequest } from '@xds/data';
 *
 *   // Or import raw data directly
 *   import { products, repositories } from '@xds/data';
 */

// Core API
export {createData} from './createData';

// Types
export type {
  // Ecommerce
  Category,
  Product,
  Customer,
  Order,
  OrderItem,
  Review,
  CartItem,
  CartSummary,
  StoreSummary,
  // Code
  Repository,
  Commit,
  PullRequest,
  Issue,
  Contributor,
  Branch,
  CodeSummary,
  // API
  EntityName,
  EntityMap,
  CreateDataConfig,
  DataResult,
  DataHelpers,
} from './types';

// Raw ecommerce data
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

// Raw code data
export {
  repositories,
  commits,
  pullRequests,
  issues,
  contributors,
  branches,
  codeSummary,
} from './dataset-code';
