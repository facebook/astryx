/**
 * @file types.ts
 * @input None
 * @output Entity type definitions for the XDS mock data system
 * @position Core types; all entity schemas are defined here
 *
 * Two domains are available:
 * - Ecommerce: products, categories, customers, orders, reviews, cart
 * - Code: repositories, commits, pull requests, issues, contributors, branches
 */

// =============================================================================
// Ecommerce Entity Types
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
// Code Entity Types
// =============================================================================

export interface Repository extends Record<string, unknown> {
  id: string;
  name: string;
  fullName: string;
  description: string;
  language: string;
  languages: {name: string; percentage: number}[];
  stars: number;
  forks: number;
  openIssues: number;
  watchers: number;
  visibility: 'public' | 'private' | 'internal';
  defaultBranch: string;
  license: string | null;
  topics: string[];
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
}

export interface Commit extends Record<string, unknown> {
  id: string;
  sha: string;
  message: string;
  description: string | null;
  authorId: string;
  authorName: string;
  authorEmail: string;
  repositoryId: string;
  branchId: string;
  filesChanged: number;
  additions: number;
  deletions: number;
  createdAt: string;
}

export interface PullRequest extends Record<string, unknown> {
  id: string;
  number: number;
  title: string;
  body: string;
  authorId: string;
  authorName: string;
  repositoryId: string;
  sourceBranch: string;
  targetBranch: string;
  status: 'open' | 'merged' | 'closed' | 'draft';
  reviewers: string[];
  labels: string[];
  comments: number;
  additions: number;
  deletions: number;
  filesChanged: number;
  createdAt: string;
  updatedAt: string;
  mergedAt: string | null;
}

export interface Issue extends Record<string, unknown> {
  id: string;
  number: number;
  title: string;
  body: string;
  authorId: string;
  authorName: string;
  repositoryId: string;
  assigneeId: string | null;
  assigneeName: string | null;
  status: 'open' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  labels: string[];
  comments: number;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
}

export interface Contributor extends Record<string, unknown> {
  id: string;
  username: string;
  name: string;
  email: string;
  avatar: string;
  role: 'owner' | 'maintainer' | 'contributor' | 'guest';
  commits: number;
  pullRequests: number;
  reviews: number;
  joinedAt: string;
}

export interface Branch extends Record<string, unknown> {
  id: string;
  name: string;
  repositoryId: string;
  isDefault: boolean;
  isProtected: boolean;
  lastCommitSha: string;
  lastCommitMessage: string;
  lastCommitAuthorId: string;
  ahead: number;
  behind: number;
  updatedAt: string;
}

export interface CodeSummary {
  totalRepositories: number;
  totalCommits: number;
  totalPullRequests: number;
  totalIssues: number;
  totalContributors: number;
  openPullRequests: number;
  openIssues: number;
  mergedPullRequestsThisMonth: number;
  commitsByMonth: {month: string; commits: number}[];
  topLanguages: {language: string; repos: number; percentage: number}[];
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
  | 'CartItem'
  | 'Repository'
  | 'Commit'
  | 'PullRequest'
  | 'Issue'
  | 'Contributor'
  | 'Branch';

/** Maps entity names to their TypeScript types. */
export interface EntityMap {
  Category: Category;
  Product: Product;
  Customer: Customer;
  Order: Order;
  Review: Review;
  CartItem: CartItem;
  Repository: Repository;
  Commit: Commit;
  PullRequest: PullRequest;
  Issue: Issue;
  Contributor: Contributor;
  Branch: Branch;
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
  /** Cart summary (included when ecommerce entities are requested) */
  cartSummary: CartSummary;
  /** Store-level summary stats */
  storeSummary: StoreSummary;
  /** Code project summary stats */
  codeSummary: CodeSummary;
  /** Helpers */
  helpers: DataHelpers;
};

export interface DataHelpers {
  // Ecommerce helpers
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
  // Code helpers
  getRepository: (id: string) => Repository | undefined;
  getCommitsByRepo: (repositoryId: string) => Commit[];
  getPullRequestsByRepo: (repositoryId: string) => PullRequest[];
  getIssuesByRepo: (repositoryId: string) => Issue[];
  getBranchesByRepo: (repositoryId: string) => Branch[];
  getContributor: (id: string) => Contributor | undefined;
  getPrStatusColor: (
    status: PullRequest['status'],
  ) => 'green' | 'blue' | 'yellow' | 'gray';
  getIssueStatusColor: (status: Issue['status']) => 'green' | 'red';
  getIssuePriorityColor: (
    priority: Issue['priority'],
  ) => 'green' | 'blue' | 'yellow' | 'red';
  formatSha: (sha: string) => string;
}
