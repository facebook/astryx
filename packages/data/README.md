# @xds/data

Entity schema system for generating typed mock data across XDS templates.

## Overview

Instead of each template defining its own hardcoded data, `@xds/data` provides a centralized, typed dataset with a declarative API. Templates declare which entities they need and get back a fully typed, relationally consistent data object.

## Usage

### `createData()` — Declarative API

```ts
import {createData} from '@xds/data';

// Request specific entities
const data = createData({
  entities: ['Product', 'Category', 'Order'],
});

data.Product; // Product[]  — all 14 products
data.Category; // Category[] — all 5 categories
data.Order; // Order[]    — all 7 orders

// Limit counts
const data = createData({
  entities: ['Product', 'Category', 'Order'],
  count: {Product: 6, Order: 3},
});

data.Product.length; // 6
data.Order.length; // 3
```

### Summaries & Helpers

Every `createData()` result includes summaries and helper functions:

```ts
const data = createData({entities: ['Product', 'Order']});

// Summaries
data.storeSummary.totalRevenue; // 187420
data.cartSummary.total; // 2289.35

// Helpers
data.helpers.formatPrice(29.99); // "$29.99"
data.helpers.getProduct('furn-1'); // Product | undefined
data.helpers.getProductsByCategory('furn-cat-1'); // Product[]
data.helpers.getOrdersByCustomer('furn-cust-1'); // Order[]
data.helpers.getReviewsForProduct('furn-1'); // Review[]
data.helpers.getOrderStatusColor('delivered'); // 'green'
data.helpers.getStockStatusColor('low_stock'); // 'yellow'
```

### Direct Imports

For simple cases where `createData()` is overkill:

```ts
import {products, orders, customers} from '@xds/data';
import type {Product, Order} from '@xds/data';
```

## Available Entities

| Entity     | Count | Description                                                    |
| ---------- | ----- | -------------------------------------------------------------- |
| `Category` | 5     | Product categories (Seating, Lighting, Tables, Storage, Decor) |
| `Product`  | 14    | Furniture products with prices, ratings, stock status          |
| `Customer` | 6     | Customers with addresses and order history                     |
| `Order`    | 7     | Orders with line items, totals, and status                     |
| `Review`   | 8     | Product reviews with ratings and text                          |
| `CartItem` | 3     | Shopping cart items                                            |

## Relationships

All entities are relationally consistent:

- Every `Product.categoryId` → valid `Category.id`
- Every `Order.customerId` → valid `Customer.id`
- Every `Order.items[].productId` → valid `Product.id`
- Every `Review.productId` → valid `Product.id`
- Every `Review.customerId` → valid `Customer.id`
- Every `CartItem.productId` → valid `Product.id`

## File Structure

| File                | Purpose                                   |
| ------------------- | ----------------------------------------- |
| `src/index.ts`      | Package entry point                       |
| `src/types.ts`      | All entity type definitions and API types |
| `src/dataset.ts`    | Static dataset — single source of truth   |
| `src/createData.ts` | `createData()` API implementation         |
