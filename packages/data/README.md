# @xds/data

Entity schema system for typed mock data across XDS templates.

## Overview

Instead of each template defining its own hardcoded data, `@xds/data` provides centralized, typed datasets with a declarative API. Templates declare which entities they need and get back a fully typed, relationally consistent data object.

Two data domains are available:

- **Ecommerce** — products, categories, customers, orders, reviews, cart (furniture store)
- **Code** — repositories, commits, pull requests, issues, contributors, branches (open-source org)

## Usage

### `createData()` — Declarative API

```ts
import {createData} from '@xds/data';

// Ecommerce template
const data = createData({
  entities: ['Product', 'Category', 'Order'],
});

data.Product; // Product[]  — all 14 products
data.Category; // Category[] — all 5 categories
data.Order; // Order[]    — all 7 orders

// Code dashboard template
const data = createData({
  entities: ['Repository', 'PullRequest', 'Issue', 'Contributor'],
});

data.Repository; // Repository[]   — all 5 repos
data.PullRequest; // PullRequest[]  — all 10 PRs
data.Issue; // Issue[]        — all 12 issues
data.Contributor; // Contributor[]  — all 8 contributors

// Mix and match with count limits
const data = createData({
  entities: ['Product', 'Repository'],
  count: {Product: 6, Repository: 3},
});
```

### Summaries & Helpers

Every `createData()` result includes summaries and helper functions:

```ts
const data = createData({entities: ['Product', 'Repository']});

// Ecommerce summaries
data.storeSummary.totalRevenue; // 187420
data.cartSummary.total; // 2289.35

// Code summaries
data.codeSummary.totalRepositories; // 5
data.codeSummary.openPullRequests; // 4
data.codeSummary.mergedPullRequestsThisMonth; // 12

// Ecommerce helpers
data.helpers.formatPrice(29.99); // "$29.99"
data.helpers.getProduct('furn-1'); // Product | undefined
data.helpers.getProductsByCategory('furn-cat-1'); // Product[]
data.helpers.getOrdersByCustomer('furn-cust-1'); // Order[]
data.helpers.getOrderStatusColor('delivered'); // 'green'

// Code helpers
data.helpers.getRepository('repo-1'); // Repository | undefined
data.helpers.getCommitsByRepo('repo-1'); // Commit[]
data.helpers.getPullRequestsByRepo('repo-1'); // PullRequest[]
data.helpers.getIssuesByRepo('repo-1'); // Issue[]
data.helpers.getBranchesByRepo('repo-1'); // Branch[]
data.helpers.getContributor('contrib-1'); // Contributor | undefined
data.helpers.getPrStatusColor('merged'); // 'green'
data.helpers.getIssuePriorityColor('critical'); // 'red'
data.helpers.formatSha('a1b2c3d4e5f6...'); // 'a1b2c3d'
```

### Direct Imports

For simple cases where `createData()` is overkill:

```ts
import {products, repositories, pullRequests} from '@xds/data';
import type {Product, Repository, PullRequest} from '@xds/data';
```

## Available Entities

### Ecommerce

| Entity     | Count | Description                                                    |
| ---------- | ----- | -------------------------------------------------------------- |
| `Category` | 5     | Product categories (Seating, Lighting, Tables, Storage, Decor) |
| `Product`  | 14    | Furniture products with prices, ratings, stock status          |
| `Customer` | 6     | Customers with addresses and order history                     |
| `Order`    | 7     | Orders with line items, totals, and status                     |
| `Review`   | 8     | Product reviews with ratings and text                          |
| `CartItem` | 3     | Shopping cart items                                            |

### Code

| Entity        | Count | Description                                                                  |
| ------------- | ----- | ---------------------------------------------------------------------------- |
| `Repository`  | 5     | Repos with languages, stars, forks, topics (3 public, 1 private, 1 internal) |
| `Commit`      | 12    | Commits with SHAs, diffs stats, and messages                                 |
| `PullRequest` | 10    | PRs with status, reviewers, labels, diff stats (open, merged, closed, draft) |
| `Issue`       | 12    | Issues with priority, assignees, labels (open, closed; low to critical)      |
| `Contributor` | 8     | Contributors with roles, commit counts, avatars                              |
| `Branch`      | 10    | Branches with ahead/behind counts, protection status                         |

## Relationships

All entities are relationally consistent:

### Ecommerce

- `Product.categoryId` → `Category.id`
- `Order.customerId` → `Customer.id`
- `Order.items[].productId` → `Product.id`
- `Review.productId` → `Product.id`
- `Review.customerId` → `Customer.id`
- `CartItem.productId` → `Product.id`

### Code

- `Commit.repositoryId` → `Repository.id`
- `Commit.authorId` → `Contributor.id`
- `PullRequest.repositoryId` → `Repository.id`
- `PullRequest.authorId` → `Contributor.id`
- `Issue.repositoryId` → `Repository.id`
- `Issue.authorId` → `Contributor.id`
- `Issue.assigneeId` → `Contributor.id` (optional)
- `Branch.repositoryId` → `Repository.id`
- `Branch.lastCommitAuthorId` → `Contributor.id`

## File Structure

| File                  | Purpose                                   |
| --------------------- | ----------------------------------------- |
| `src/index.ts`        | Package entry point                       |
| `src/types.ts`        | All entity type definitions and API types |
| `src/dataset.ts`      | Ecommerce dataset — furniture store       |
| `src/dataset-code.ts` | Code dataset — open-source org            |
| `src/createData.ts`   | `createData()` API implementation         |
