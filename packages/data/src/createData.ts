/**
 * @file createData.ts
 * @input CreateDataConfig — declares which entities a template needs
 * @output DataResult — typed object with requested entity arrays, summaries, and helpers
 * @position Public API; the main entry point for templates consuming mock data
 *
 * Usage:
 *   import { createData } from '@xds/data';
 *
 *   // Ecommerce template
 *   const data = createData({
 *     entities: ['Product', 'Category', 'Order'],
 *   });
 *
 *   // Code dashboard template
 *   const data = createData({
 *     entities: ['Repository', 'PullRequest', 'Issue', 'Contributor'],
 *   });
 *
 *   // Mix and match — limit counts
 *   const data = createData({
 *     entities: ['Product', 'Repository'],
 *     count: { Product: 6, Repository: 3 },
 *   });
 */

import type {
  EntityName,
  EntityMap,
  CreateDataConfig,
  DataResult,
  DataHelpers,
  Product,
  Order,
  PullRequest,
  Issue,
  Repository,
  Contributor,
  Commit,
  Branch,
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
import {
  repositories,
  commits,
  pullRequests,
  issues,
  contributors,
  branches,
  codeSummary,
} from './dataset-code';

// =============================================================================
// Helpers — Ecommerce
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

// =============================================================================
// Helpers — Code
// =============================================================================

function getPrStatusColor(
  status: PullRequest['status'],
): 'green' | 'blue' | 'yellow' | 'gray' {
  const map: Record<
    PullRequest['status'],
    'green' | 'blue' | 'yellow' | 'gray'
  > = {
    merged: 'green',
    open: 'blue',
    draft: 'yellow',
    closed: 'gray',
  };
  return map[status];
}

function getIssueStatusColor(status: Issue['status']): 'green' | 'red' {
  const map: Record<Issue['status'], 'green' | 'red'> = {
    open: 'red',
    closed: 'green',
  };
  return map[status];
}

function getIssuePriorityColor(
  priority: Issue['priority'],
): 'green' | 'blue' | 'yellow' | 'red' {
  const map: Record<Issue['priority'], 'green' | 'blue' | 'yellow' | 'red'> = {
    low: 'green',
    medium: 'blue',
    high: 'yellow',
    critical: 'red',
  };
  return map[priority];
}

function formatSha(sha: string): string {
  return sha.slice(0, 7);
}

// =============================================================================
// Entity Sources
// =============================================================================

/** All available entity data, keyed by entity name. */
const entitySources: {[K in EntityName]: EntityMap[K][]} = {
  // Ecommerce
  Category: categories,
  Product: products,
  Customer: customers,
  Order: orders,
  Review: reviews,
  CartItem: cartItems,
  // Code
  Repository: repositories,
  Commit: commits,
  PullRequest: pullRequests,
  Issue: issues,
  Contributor: contributors,
  Branch: branches,
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
  const repoData =
    (result.Repository as Repository[] | undefined) ?? repositories;
  const commitData = (result.Commit as Commit[] | undefined) ?? commits;
  const prData =
    (result.PullRequest as PullRequest[] | undefined) ?? pullRequests;
  const issueData = (result.Issue as Issue[] | undefined) ?? issues;
  const branchData = (result.Branch as Branch[] | undefined) ?? branches;
  const contribData =
    (result.Contributor as Contributor[] | undefined) ?? contributors;

  const helpers: DataHelpers = {
    // Ecommerce
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
    // Code
    getRepository: (id: string) => repoData.find(r => r.id === id),
    getCommitsByRepo: (repositoryId: string) =>
      commitData.filter(c => c.repositoryId === repositoryId),
    getPullRequestsByRepo: (repositoryId: string) =>
      prData.filter(p => p.repositoryId === repositoryId),
    getIssuesByRepo: (repositoryId: string) =>
      issueData.filter(i => i.repositoryId === repositoryId),
    getBranchesByRepo: (repositoryId: string) =>
      branchData.filter(b => b.repositoryId === repositoryId),
    getContributor: (id: string) => contribData.find(c => c.id === id),
    getPrStatusColor,
    getIssueStatusColor,
    getIssuePriorityColor,
    formatSha,
  };

  result.cartSummary = cartSummary;
  result.storeSummary = storeSummary;
  result.codeSummary = codeSummary;
  result.helpers = helpers;

  return result as DataResult<E>;
}
