/**
 * @file createData.test.ts
 * @input createData function and raw data exports
 * @output Test results validating the entity data system
 * @position Tests for @xds/data
 */

import {describe, it, expect} from 'vitest';
import {
  createData,
  products,
  categories,
  customers,
  orders,
  reviews,
  cartItems,
  repositories,
  commits,
  pullRequests,
  issues,
  contributors,
  branches,
} from '../index';

// =============================================================================
// Ecommerce
// =============================================================================

describe('createData — ecommerce', () => {
  it('returns requested entity types', () => {
    const data = createData({
      entities: ['Product', 'Category'],
    });

    expect(data.Product).toBeDefined();
    expect(data.Category).toBeDefined();
    expect(data.Product.length).toBe(products.length);
    expect(data.Category.length).toBe(categories.length);
  });

  it('respects count limits', () => {
    const data = createData({
      entities: ['Product', 'Order'],
      count: {Product: 3, Order: 2},
    });

    expect(data.Product).toHaveLength(3);
    expect(data.Order).toHaveLength(2);
  });

  it('returns all items when no count is specified', () => {
    const data = createData({
      entities: [
        'Product',
        'Customer',
        'Order',
        'Review',
        'CartItem',
        'Category',
      ],
    });

    expect(data.Product).toHaveLength(products.length);
    expect(data.Customer).toHaveLength(customers.length);
    expect(data.Order).toHaveLength(orders.length);
    expect(data.Review).toHaveLength(reviews.length);
    expect(data.CartItem).toHaveLength(cartItems.length);
    expect(data.Category).toHaveLength(categories.length);
  });

  it('includes ecommerce summaries', () => {
    const data = createData({entities: ['Product']});

    expect(data.storeSummary).toBeDefined();
    expect(data.storeSummary.totalRevenue).toBe(187_420.0);
    expect(data.cartSummary).toBeDefined();
    expect(data.cartSummary.total).toBe(2_289.35);
  });

  it('includes ecommerce helper functions', () => {
    const data = createData({entities: ['Product', 'Order', 'Review']});

    expect(data.helpers.formatPrice(29.99)).toBe('$29.99');
    expect(data.helpers.formatPrice(1_000)).toBe('$1,000.00');

    const product = data.helpers.getProduct('furn-1');
    expect(product).toBeDefined();
    expect(product?.name).toBe('Arc Lounge Chair');

    const seating = data.helpers.getProductsByCategory('furn-cat-1');
    expect(seating.length).toBe(4);

    const elenaOrders = data.helpers.getOrdersByCustomer('furn-cust-1');
    expect(elenaOrders.length).toBe(2);

    const chairReviews = data.helpers.getReviewsForProduct('furn-1');
    expect(chairReviews.length).toBe(1);

    expect(data.helpers.getOrderStatusColor('delivered')).toBe('green');
    expect(data.helpers.getOrderStatusColor('pending')).toBe('yellow');
    expect(data.helpers.getStockStatusColor('in_stock')).toBe('green');
    expect(data.helpers.getStockStatusColor('out_of_stock')).toBe('red');
  });

  it('helpers operate on sliced data', () => {
    const data = createData({
      entities: ['Product', 'Order'],
      count: {Product: 2, Order: 1},
    });

    expect(data.helpers.getProduct('furn-1')).toBeDefined();
    expect(data.helpers.getProduct('furn-2')).toBeDefined();
    expect(data.helpers.getProduct('furn-10')).toBeUndefined();
  });

  it('returns independent copies (no mutation leaks)', () => {
    const data1 = createData({entities: ['Product']});
    const data2 = createData({entities: ['Product']});

    data1.Product[0].name = 'MUTATED';
    expect(data2.Product[0].name).toBe('Arc Lounge Chair');
  });

  it('ecommerce relationships are consistent', () => {
    const data = createData({
      entities: ['Product', 'Category', 'Customer', 'Order', 'Review'],
    });

    for (const product of data.Product) {
      const cat = data.Category.find(c => c.id === product.categoryId);
      expect(cat).toBeDefined();
      expect(cat?.name).toBe(product.category);
    }

    for (const order of data.Order) {
      const cust = data.Customer.find(c => c.id === order.customerId);
      expect(cust).toBeDefined();
      expect(cust?.name).toBe(order.customerName);
    }

    for (const order of data.Order) {
      for (const item of order.items) {
        const prod = data.Product.find(p => p.id === item.productId);
        expect(prod).toBeDefined();
        expect(prod?.name).toBe(item.productName);
      }
    }

    for (const review of data.Review) {
      const prod = data.Product.find(p => p.id === review.productId);
      expect(prod).toBeDefined();
      const cust = data.Customer.find(c => c.id === review.customerId);
      expect(cust).toBeDefined();
    }
  });
});

// =============================================================================
// Code
// =============================================================================

describe('createData — code', () => {
  it('returns requested code entity types', () => {
    const data = createData({
      entities: ['Repository', 'PullRequest', 'Issue', 'Contributor'],
    });

    expect(data.Repository).toBeDefined();
    expect(data.PullRequest).toBeDefined();
    expect(data.Issue).toBeDefined();
    expect(data.Contributor).toBeDefined();
    expect(data.Repository.length).toBe(repositories.length);
    expect(data.PullRequest.length).toBe(pullRequests.length);
    expect(data.Issue.length).toBe(issues.length);
    expect(data.Contributor.length).toBe(contributors.length);
  });

  it('respects count limits for code entities', () => {
    const data = createData({
      entities: ['Repository', 'Commit', 'PullRequest'],
      count: {Repository: 2, Commit: 5, PullRequest: 3},
    });

    expect(data.Repository).toHaveLength(2);
    expect(data.Commit).toHaveLength(5);
    expect(data.PullRequest).toHaveLength(3);
  });

  it('returns all code entities when no count is specified', () => {
    const data = createData({
      entities: [
        'Repository',
        'Commit',
        'PullRequest',
        'Issue',
        'Contributor',
        'Branch',
      ],
    });

    expect(data.Repository).toHaveLength(repositories.length);
    expect(data.Commit).toHaveLength(commits.length);
    expect(data.PullRequest).toHaveLength(pullRequests.length);
    expect(data.Issue).toHaveLength(issues.length);
    expect(data.Contributor).toHaveLength(contributors.length);
    expect(data.Branch).toHaveLength(branches.length);
  });

  it('includes code summary', () => {
    const data = createData({entities: ['Repository']});

    expect(data.codeSummary).toBeDefined();
    expect(data.codeSummary.totalRepositories).toBe(5);
    expect(data.codeSummary.totalContributors).toBe(8);
    expect(data.codeSummary.openPullRequests).toBe(4);
  });

  it('includes code helper functions', () => {
    const data = createData({
      entities: [
        'Repository',
        'Commit',
        'PullRequest',
        'Issue',
        'Contributor',
        'Branch',
      ],
    });

    // getRepository
    const repo = data.helpers.getRepository('repo-1');
    expect(repo).toBeDefined();
    expect(repo?.name).toBe('aurora-ui');

    // getCommitsByRepo
    const repo1Commits = data.helpers.getCommitsByRepo('repo-1');
    expect(repo1Commits.length).toBeGreaterThan(0);
    expect(repo1Commits.every(c => c.repositoryId === 'repo-1')).toBe(true);

    // getPullRequestsByRepo
    const repo1PRs = data.helpers.getPullRequestsByRepo('repo-1');
    expect(repo1PRs.length).toBeGreaterThan(0);
    expect(repo1PRs.every(p => p.repositoryId === 'repo-1')).toBe(true);

    // getIssuesByRepo
    const repo1Issues = data.helpers.getIssuesByRepo('repo-1');
    expect(repo1Issues.length).toBeGreaterThan(0);
    expect(repo1Issues.every(i => i.repositoryId === 'repo-1')).toBe(true);

    // getBranchesByRepo
    const repo1Branches = data.helpers.getBranchesByRepo('repo-1');
    expect(repo1Branches.length).toBeGreaterThan(0);
    expect(repo1Branches.every(b => b.repositoryId === 'repo-1')).toBe(true);

    // getContributor
    const contrib = data.helpers.getContributor('contrib-1');
    expect(contrib).toBeDefined();
    expect(contrib?.name).toBe('Sarah Chen');

    // Status colors
    expect(data.helpers.getPrStatusColor('merged')).toBe('green');
    expect(data.helpers.getPrStatusColor('open')).toBe('blue');
    expect(data.helpers.getPrStatusColor('draft')).toBe('yellow');
    expect(data.helpers.getPrStatusColor('closed')).toBe('gray');

    expect(data.helpers.getIssueStatusColor('open')).toBe('red');
    expect(data.helpers.getIssueStatusColor('closed')).toBe('green');

    expect(data.helpers.getIssuePriorityColor('critical')).toBe('red');
    expect(data.helpers.getIssuePriorityColor('high')).toBe('yellow');
    expect(data.helpers.getIssuePriorityColor('medium')).toBe('blue');
    expect(data.helpers.getIssuePriorityColor('low')).toBe('green');

    // formatSha
    expect(data.helpers.formatSha('a1b2c3d4e5f6a7b8c9d0')).toBe('a1b2c3d');
  });

  it('code helpers operate on sliced data', () => {
    const data = createData({
      entities: ['Repository', 'Contributor'],
      count: {Repository: 2, Contributor: 3},
    });

    expect(data.helpers.getRepository('repo-1')).toBeDefined();
    expect(data.helpers.getRepository('repo-2')).toBeDefined();
    expect(data.helpers.getRepository('repo-5')).toBeUndefined();

    expect(data.helpers.getContributor('contrib-1')).toBeDefined();
    expect(data.helpers.getContributor('contrib-3')).toBeDefined();
    expect(data.helpers.getContributor('contrib-8')).toBeUndefined();
  });

  it('returns independent copies for code entities', () => {
    const data1 = createData({entities: ['Repository']});
    const data2 = createData({entities: ['Repository']});

    data1.Repository[0].name = 'MUTATED';
    expect(data2.Repository[0].name).toBe('aurora-ui');
  });

  it('code relationships are consistent', () => {
    const data = createData({
      entities: [
        'Repository',
        'Commit',
        'PullRequest',
        'Issue',
        'Contributor',
        'Branch',
      ],
    });

    // Every commit references a valid repo and contributor
    for (const commit of data.Commit) {
      const repo = data.Repository.find(r => r.id === commit.repositoryId);
      expect(repo).toBeDefined();
      const contrib = data.Contributor.find(c => c.id === commit.authorId);
      expect(contrib).toBeDefined();
      expect(contrib?.name).toBe(commit.authorName);
    }

    // Every PR references a valid repo and contributor
    for (const pr of data.PullRequest) {
      const repo = data.Repository.find(r => r.id === pr.repositoryId);
      expect(repo).toBeDefined();
      const contrib = data.Contributor.find(c => c.id === pr.authorId);
      expect(contrib).toBeDefined();
      expect(contrib?.name).toBe(pr.authorName);
    }

    // Every issue references a valid repo and contributor
    for (const issue of data.Issue) {
      const repo = data.Repository.find(r => r.id === issue.repositoryId);
      expect(repo).toBeDefined();
      const author = data.Contributor.find(c => c.id === issue.authorId);
      expect(author).toBeDefined();
      expect(author?.name).toBe(issue.authorName);
      // Assignee is optional
      if (issue.assigneeId) {
        const assignee = data.Contributor.find(c => c.id === issue.assigneeId);
        expect(assignee).toBeDefined();
        expect(assignee?.name).toBe(issue.assigneeName);
      }
    }

    // Every branch references a valid repo and contributor
    for (const branch of data.Branch) {
      const repo = data.Repository.find(r => r.id === branch.repositoryId);
      expect(repo).toBeDefined();
      const contrib = data.Contributor.find(
        c => c.id === branch.lastCommitAuthorId,
      );
      expect(contrib).toBeDefined();
    }
  });
});

// =============================================================================
// Cross-domain
// =============================================================================

describe('createData — cross-domain', () => {
  it('can mix ecommerce and code entities', () => {
    const data = createData({
      entities: ['Product', 'Repository', 'PullRequest'],
      count: {Product: 3, Repository: 2, PullRequest: 4},
    });

    expect(data.Product).toHaveLength(3);
    expect(data.Repository).toHaveLength(2);
    expect(data.PullRequest).toHaveLength(4);

    // Both summaries available
    expect(data.storeSummary.totalRevenue).toBe(187_420.0);
    expect(data.codeSummary.totalRepositories).toBe(5);

    // Both helper sets available
    expect(data.helpers.formatPrice(100)).toBe('$100.00');
    expect(data.helpers.formatSha('abc1234567890')).toBe('abc1234');
  });
});

// =============================================================================
// Raw exports
// =============================================================================

describe('raw data exports', () => {
  it('exports all ecommerce entity arrays', () => {
    expect(products.length).toBeGreaterThan(0);
    expect(categories.length).toBeGreaterThan(0);
    expect(customers.length).toBeGreaterThan(0);
    expect(orders.length).toBeGreaterThan(0);
    expect(reviews.length).toBeGreaterThan(0);
    expect(cartItems.length).toBeGreaterThan(0);
  });

  it('exports all code entity arrays', () => {
    expect(repositories.length).toBeGreaterThan(0);
    expect(commits.length).toBeGreaterThan(0);
    expect(pullRequests.length).toBeGreaterThan(0);
    expect(issues.length).toBeGreaterThan(0);
    expect(contributors.length).toBeGreaterThan(0);
    expect(branches.length).toBeGreaterThan(0);
  });

  it('products have required fields', () => {
    for (const p of products) {
      expect(p.id).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.price).toBeGreaterThan(0);
      expect(p.status).toMatch(/^(in_stock|low_stock|out_of_stock)$/);
    }
  });

  it('repositories have required fields', () => {
    for (const r of repositories) {
      expect(r.id).toBeTruthy();
      expect(r.name).toBeTruthy();
      expect(r.language).toBeTruthy();
      expect(r.visibility).toMatch(/^(public|private|internal)$/);
    }
  });

  it('pull requests have required fields', () => {
    for (const pr of pullRequests) {
      expect(pr.id).toBeTruthy();
      expect(pr.number).toBeGreaterThan(0);
      expect(pr.title).toBeTruthy();
      expect(pr.status).toMatch(/^(open|merged|closed|draft)$/);
    }
  });

  it('issues have required fields', () => {
    for (const i of issues) {
      expect(i.id).toBeTruthy();
      expect(i.number).toBeGreaterThan(0);
      expect(i.title).toBeTruthy();
      expect(i.status).toMatch(/^(open|closed)$/);
      expect(i.priority).toMatch(/^(low|medium|high|critical)$/);
    }
  });
});
