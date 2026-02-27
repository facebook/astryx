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
} from '../index';

describe('createData', () => {
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

  it('includes summaries', () => {
    const data = createData({entities: ['Product']});

    expect(data.storeSummary).toBeDefined();
    expect(data.storeSummary.totalRevenue).toBe(187_420.0);
    expect(data.cartSummary).toBeDefined();
    expect(data.cartSummary.total).toBe(2_289.35);
  });

  it('includes helper functions', () => {
    const data = createData({entities: ['Product', 'Order', 'Review']});

    // formatPrice
    expect(data.helpers.formatPrice(29.99)).toBe('$29.99');
    expect(data.helpers.formatPrice(1_000)).toBe('$1,000.00');

    // getProduct
    const product = data.helpers.getProduct('furn-1');
    expect(product).toBeDefined();
    expect(product?.name).toBe('Arc Lounge Chair');

    // getProductsByCategory
    const seating = data.helpers.getProductsByCategory('furn-cat-1');
    expect(seating.length).toBe(4);

    // getOrdersByCustomer
    const elenaOrders = data.helpers.getOrdersByCustomer('furn-cust-1');
    expect(elenaOrders.length).toBe(2);

    // getReviewsForProduct
    const chairReviews = data.helpers.getReviewsForProduct('furn-1');
    expect(chairReviews.length).toBe(1);

    // Status colors
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

    // getProduct should only find products in the sliced set
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

  it('relationships are consistent across entities', () => {
    const data = createData({
      entities: ['Product', 'Category', 'Customer', 'Order', 'Review'],
    });

    // Every product references a valid category
    for (const product of data.Product) {
      const cat = data.Category.find(c => c.id === product.categoryId);
      expect(cat).toBeDefined();
      expect(cat?.name).toBe(product.category);
    }

    // Every order references a valid customer
    for (const order of data.Order) {
      const cust = data.Customer.find(c => c.id === order.customerId);
      expect(cust).toBeDefined();
      expect(cust?.name).toBe(order.customerName);
    }

    // Every order item references a valid product
    for (const order of data.Order) {
      for (const item of order.items) {
        const prod = data.Product.find(p => p.id === item.productId);
        expect(prod).toBeDefined();
        expect(prod?.name).toBe(item.productName);
      }
    }

    // Every review references a valid product and customer
    for (const review of data.Review) {
      const prod = data.Product.find(p => p.id === review.productId);
      expect(prod).toBeDefined();
      const cust = data.Customer.find(c => c.id === review.customerId);
      expect(cust).toBeDefined();
    }
  });
});

describe('raw data exports', () => {
  it('exports all entity arrays', () => {
    expect(products.length).toBeGreaterThan(0);
    expect(categories.length).toBeGreaterThan(0);
    expect(customers.length).toBeGreaterThan(0);
    expect(orders.length).toBeGreaterThan(0);
    expect(reviews.length).toBeGreaterThan(0);
    expect(cartItems.length).toBeGreaterThan(0);
  });

  it('products have required fields', () => {
    for (const p of products) {
      expect(p.id).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.price).toBeGreaterThan(0);
      expect(p.status).toMatch(/^(in_stock|low_stock|out_of_stock)$/);
    }
  });
});
