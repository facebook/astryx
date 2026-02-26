/**
 * @file Fake ecommerce store data
 * @input None — self-contained mock data
 * @output Types and data arrays for products, categories, customers, orders, reviews, cart items
 * @position Shared data module for Storybook stories and page examples
 *
 * Usage:
 *   import { products, orders, customers, ... } from './data/ecommerce';
 */

// =============================================================================
// Types
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
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
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
// Categories
// =============================================================================

export const categories: Category[] = [
  {
    id: 'cat-1',
    name: 'Electronics',
    slug: 'electronics',
    description: 'Gadgets, devices, and tech accessories',
    productCount: 4,
  },
  {
    id: 'cat-2',
    name: 'Clothing',
    slug: 'clothing',
    description: 'Apparel for all seasons',
    productCount: 3,
  },
  {
    id: 'cat-3',
    name: 'Home & Kitchen',
    slug: 'home-kitchen',
    description: 'Everything for your living space',
    productCount: 3,
  },
  {
    id: 'cat-4',
    name: 'Books',
    slug: 'books',
    description: 'Fiction, non-fiction, and technical reads',
    productCount: 2,
  },
  {
    id: 'cat-5',
    name: 'Sports & Outdoors',
    slug: 'sports-outdoors',
    description: 'Gear for active lifestyles',
    productCount: 2,
  },
];

// =============================================================================
// Products
// =============================================================================

export const products: Product[] = [
  {
    id: 'prod-1',
    name: 'Wireless Noise-Cancelling Headphones',
    slug: 'wireless-noise-cancelling-headphones',
    description:
      'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and spatial audio support.',
    price: 299.99,
    compareAtPrice: 349.99,
    categoryId: 'cat-1',
    category: 'Electronics',
    image: 'https://picsum.photos/seed/headphones/400/400',
    rating: 4.7,
    reviewCount: 234,
    stock: 45,
    status: 'in_stock',
    tags: ['audio', 'wireless', 'bestseller'],
    sku: 'ELEC-HP-001',
    createdAt: '2025-08-15T10:00:00Z',
  },
  {
    id: 'prod-2',
    name: 'Mechanical Keyboard — Cherry MX',
    slug: 'mechanical-keyboard-cherry-mx',
    description:
      'Full-size mechanical keyboard with Cherry MX Brown switches, RGB backlighting, and USB-C connectivity.',
    price: 149.99,
    compareAtPrice: null,
    categoryId: 'cat-1',
    category: 'Electronics',
    image: 'https://picsum.photos/seed/keyboard/400/400',
    rating: 4.5,
    reviewCount: 89,
    stock: 120,
    status: 'in_stock',
    tags: ['peripherals', 'mechanical', 'rgb'],
    sku: 'ELEC-KB-002',
    createdAt: '2025-09-01T10:00:00Z',
  },
  {
    id: 'prod-3',
    name: '4K Ultra-Wide Monitor 34"',
    slug: '4k-ultrawide-monitor-34',
    description:
      '34-inch curved ultra-wide monitor with 4K resolution, 144Hz refresh rate, and USB-C hub.',
    price: 799.99,
    compareAtPrice: 899.99,
    categoryId: 'cat-1',
    category: 'Electronics',
    image: 'https://picsum.photos/seed/monitor/400/400',
    rating: 4.8,
    reviewCount: 156,
    stock: 8,
    status: 'low_stock',
    tags: ['display', 'ultrawide', '4k'],
    sku: 'ELEC-MN-003',
    createdAt: '2025-07-20T10:00:00Z',
  },
  {
    id: 'prod-4',
    name: 'USB-C Docking Station',
    slug: 'usb-c-docking-station',
    description:
      '12-in-1 USB-C dock with dual HDMI, Ethernet, SD card reader, and 100W power delivery.',
    price: 89.99,
    compareAtPrice: null,
    categoryId: 'cat-1',
    category: 'Electronics',
    image: 'https://picsum.photos/seed/dock/400/400',
    rating: 4.3,
    reviewCount: 67,
    stock: 0,
    status: 'out_of_stock',
    tags: ['accessories', 'usb-c', 'dock'],
    sku: 'ELEC-DK-004',
    createdAt: '2025-10-05T10:00:00Z',
  },
  {
    id: 'prod-5',
    name: 'Merino Wool Crewneck Sweater',
    slug: 'merino-wool-crewneck-sweater',
    description:
      'Lightweight merino wool sweater in a classic crewneck cut. Temperature-regulating and machine washable.',
    price: 89.00,
    compareAtPrice: 120.00,
    categoryId: 'cat-2',
    category: 'Clothing',
    image: 'https://picsum.photos/seed/sweater/400/400',
    rating: 4.6,
    reviewCount: 312,
    stock: 75,
    status: 'in_stock',
    tags: ['merino', 'knitwear', 'bestseller'],
    sku: 'CLTH-SW-005',
    createdAt: '2025-06-10T10:00:00Z',
  },
  {
    id: 'prod-6',
    name: 'Slim Fit Chino Pants',
    slug: 'slim-fit-chino-pants',
    description:
      'Stretch cotton chinos with a modern slim fit. Available in 6 colors.',
    price: 68.00,
    compareAtPrice: null,
    categoryId: 'cat-2',
    category: 'Clothing',
    image: 'https://picsum.photos/seed/chinos/400/400',
    rating: 4.4,
    reviewCount: 198,
    stock: 200,
    status: 'in_stock',
    tags: ['pants', 'slim-fit', 'cotton'],
    sku: 'CLTH-CH-006',
    createdAt: '2025-05-22T10:00:00Z',
  },
  {
    id: 'prod-7',
    name: 'Waterproof Shell Jacket',
    slug: 'waterproof-shell-jacket',
    description:
      '3-layer waterproof breathable jacket with sealed seams and adjustable hood. Perfect for rain and wind.',
    price: 195.00,
    compareAtPrice: 250.00,
    categoryId: 'cat-2',
    category: 'Clothing',
    image: 'https://picsum.photos/seed/jacket/400/400',
    rating: 4.9,
    reviewCount: 87,
    stock: 3,
    status: 'low_stock',
    tags: ['outerwear', 'waterproof', 'bestseller'],
    sku: 'CLTH-JK-007',
    createdAt: '2025-09-14T10:00:00Z',
  },
  {
    id: 'prod-8',
    name: 'Pour-Over Coffee Maker Set',
    slug: 'pour-over-coffee-maker-set',
    description:
      'Borosilicate glass carafe with stainless steel filter. Includes gooseneck kettle and scale.',
    price: 64.99,
    compareAtPrice: null,
    categoryId: 'cat-3',
    category: 'Home & Kitchen',
    image: 'https://picsum.photos/seed/coffee/400/400',
    rating: 4.8,
    reviewCount: 421,
    stock: 55,
    status: 'in_stock',
    tags: ['coffee', 'kitchen', 'bestseller'],
    sku: 'HOME-CF-008',
    createdAt: '2025-04-18T10:00:00Z',
  },
  {
    id: 'prod-9',
    name: 'Cast Iron Dutch Oven 5.5 Qt',
    slug: 'cast-iron-dutch-oven',
    description:
      'Enameled cast iron dutch oven. Oven-safe to 500°F, works on all cooktops including induction.',
    price: 129.99,
    compareAtPrice: 159.99,
    categoryId: 'cat-3',
    category: 'Home & Kitchen',
    image: 'https://picsum.photos/seed/dutchoven/400/400',
    rating: 4.7,
    reviewCount: 276,
    stock: 30,
    status: 'in_stock',
    tags: ['cookware', 'cast-iron', 'oven'],
    sku: 'HOME-DO-009',
    createdAt: '2025-03-25T10:00:00Z',
  },
  {
    id: 'prod-10',
    name: 'Bamboo Desk Organizer',
    slug: 'bamboo-desk-organizer',
    description:
      'Multi-compartment bamboo organizer with phone stand, pen holder, and cable management.',
    price: 34.99,
    compareAtPrice: null,
    categoryId: 'cat-3',
    category: 'Home & Kitchen',
    image: 'https://picsum.photos/seed/organizer/400/400',
    rating: 4.2,
    reviewCount: 143,
    stock: 90,
    status: 'in_stock',
    tags: ['desk', 'bamboo', 'organization'],
    sku: 'HOME-DO-010',
    createdAt: '2025-08-30T10:00:00Z',
  },
  {
    id: 'prod-11',
    name: 'Designing Data-Intensive Applications',
    slug: 'designing-data-intensive-applications',
    description:
      'The definitive guide to the big ideas behind reliable, scalable, and maintainable systems. By Martin Kleppmann.',
    price: 42.99,
    compareAtPrice: null,
    categoryId: 'cat-4',
    category: 'Books',
    image: 'https://picsum.photos/seed/ddia/400/400',
    rating: 4.9,
    reviewCount: 1823,
    stock: 500,
    status: 'in_stock',
    tags: ['technical', 'systems', 'bestseller'],
    sku: 'BOOK-TC-011',
    createdAt: '2025-01-10T10:00:00Z',
  },
  {
    id: 'prod-12',
    name: 'The Creative Act: A Way of Being',
    slug: 'the-creative-act',
    description:
      "Rick Rubin's exploration of the creative process and the art of making things that matter.",
    price: 28.99,
    compareAtPrice: 32.00,
    categoryId: 'cat-4',
    category: 'Books',
    image: 'https://picsum.photos/seed/creativebook/400/400',
    rating: 4.6,
    reviewCount: 567,
    stock: 180,
    status: 'in_stock',
    tags: ['creativity', 'non-fiction'],
    sku: 'BOOK-NF-012',
    createdAt: '2025-02-14T10:00:00Z',
  },
  {
    id: 'prod-13',
    name: 'Trail Running Shoes',
    slug: 'trail-running-shoes',
    description:
      'Lightweight trail runners with Vibram outsole, rock plate protection, and breathable mesh upper.',
    price: 139.99,
    compareAtPrice: null,
    categoryId: 'cat-5',
    category: 'Sports & Outdoors',
    image: 'https://picsum.photos/seed/trailshoes/400/400',
    rating: 4.5,
    reviewCount: 204,
    stock: 42,
    status: 'in_stock',
    tags: ['running', 'trail', 'shoes'],
    sku: 'SPRT-SH-013',
    createdAt: '2025-07-08T10:00:00Z',
  },
  {
    id: 'prod-14',
    name: 'Insulated Water Bottle 32oz',
    slug: 'insulated-water-bottle-32oz',
    description:
      'Double-wall vacuum insulated stainless steel bottle. Keeps drinks cold 24h or hot 12h.',
    price: 29.99,
    compareAtPrice: 39.99,
    categoryId: 'cat-5',
    category: 'Sports & Outdoors',
    image: 'https://picsum.photos/seed/bottle/400/400',
    rating: 4.4,
    reviewCount: 891,
    stock: 300,
    status: 'in_stock',
    tags: ['hydration', 'insulated', 'bestseller'],
    sku: 'SPRT-BT-014',
    createdAt: '2025-06-01T10:00:00Z',
  },
];

// =============================================================================
// Customers
// =============================================================================

export const customers: Customer[] = [
  {
    id: 'cust-1',
    name: 'Olivia Chen',
    email: 'olivia.chen@example.com',
    avatar: null,
    totalOrders: 12,
    totalSpent: 2847.50,
    joinedAt: '2024-03-15T10:00:00Z',
    status: 'vip',
    address: {
      street: '742 Evergreen Terrace',
      city: 'San Francisco',
      state: 'CA',
      zip: '94102',
      country: 'US',
    },
  },
  {
    id: 'cust-2',
    name: 'Marcus Johnson',
    email: 'marcus.j@example.com',
    avatar: null,
    totalOrders: 5,
    totalSpent: 634.97,
    joinedAt: '2024-09-22T10:00:00Z',
    status: 'active',
    address: {
      street: '1600 Pennsylvania Ave',
      city: 'Austin',
      state: 'TX',
      zip: '73301',
      country: 'US',
    },
  },
  {
    id: 'cust-3',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    avatar: null,
    totalOrders: 8,
    totalSpent: 1523.44,
    joinedAt: '2024-06-10T10:00:00Z',
    status: 'active',
    address: {
      street: '221B Baker Street',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'US',
    },
  },
  {
    id: 'cust-4',
    name: 'James Park',
    email: 'james.park@example.com',
    avatar: null,
    totalOrders: 2,
    totalSpent: 178.98,
    joinedAt: '2025-11-01T10:00:00Z',
    status: 'active',
    address: {
      street: '350 Fifth Avenue',
      city: 'Seattle',
      state: 'WA',
      zip: '98101',
      country: 'US',
    },
  },
  {
    id: 'cust-5',
    name: 'Sofia Rodriguez',
    email: 'sofia.r@example.com',
    avatar: null,
    totalOrders: 15,
    totalSpent: 3291.85,
    joinedAt: '2024-01-08T10:00:00Z',
    status: 'vip',
    address: {
      street: '1 Infinite Loop',
      city: 'Miami',
      state: 'FL',
      zip: '33101',
      country: 'US',
    },
  },
  {
    id: 'cust-6',
    name: 'Daniel Kim',
    email: 'daniel.kim@example.com',
    avatar: null,
    totalOrders: 0,
    totalSpent: 0,
    joinedAt: '2025-12-20T10:00:00Z',
    status: 'inactive',
    address: {
      street: '1 Hacker Way',
      city: 'Portland',
      state: 'OR',
      zip: '97201',
      country: 'US',
    },
  },
];

// =============================================================================
// Orders
// =============================================================================

export const orders: Order[] = [
  {
    id: 'ord-1',
    orderNumber: 'ORD-2025-1001',
    customerId: 'cust-1',
    customerName: 'Olivia Chen',
    customerEmail: 'olivia.chen@example.com',
    items: [
      {productId: 'prod-1', productName: 'Wireless Noise-Cancelling Headphones', quantity: 1, unitPrice: 299.99, total: 299.99},
      {productId: 'prod-10', productName: 'Bamboo Desk Organizer', quantity: 2, unitPrice: 34.99, total: 69.98},
    ],
    subtotal: 369.97,
    shipping: 0,
    tax: 31.45,
    total: 401.42,
    status: 'delivered',
    paymentMethod: 'credit_card',
    createdAt: '2025-12-01T14:23:00Z',
    updatedAt: '2025-12-05T09:15:00Z',
  },
  {
    id: 'ord-2',
    orderNumber: 'ORD-2025-1002',
    customerId: 'cust-2',
    customerName: 'Marcus Johnson',
    customerEmail: 'marcus.j@example.com',
    items: [
      {productId: 'prod-5', productName: 'Merino Wool Crewneck Sweater', quantity: 1, unitPrice: 89.00, total: 89.00},
      {productId: 'prod-6', productName: 'Slim Fit Chino Pants', quantity: 2, unitPrice: 68.00, total: 136.00},
    ],
    subtotal: 225.00,
    shipping: 5.99,
    tax: 19.12,
    total: 250.11,
    status: 'shipped',
    paymentMethod: 'paypal',
    createdAt: '2025-12-18T09:45:00Z',
    updatedAt: '2025-12-20T11:30:00Z',
  },
  {
    id: 'ord-3',
    orderNumber: 'ORD-2025-1003',
    customerId: 'cust-3',
    customerName: 'Priya Sharma',
    customerEmail: 'priya.sharma@example.com',
    items: [
      {productId: 'prod-3', productName: '4K Ultra-Wide Monitor 34"', quantity: 1, unitPrice: 799.99, total: 799.99},
      {productId: 'prod-2', productName: 'Mechanical Keyboard — Cherry MX', quantity: 1, unitPrice: 149.99, total: 149.99},
    ],
    subtotal: 949.98,
    shipping: 0,
    tax: 80.75,
    total: 1030.73,
    status: 'processing',
    paymentMethod: 'apple_pay',
    createdAt: '2025-12-22T16:10:00Z',
    updatedAt: '2025-12-22T16:10:00Z',
  },
  {
    id: 'ord-4',
    orderNumber: 'ORD-2025-1004',
    customerId: 'cust-5',
    customerName: 'Sofia Rodriguez',
    customerEmail: 'sofia.r@example.com',
    items: [
      {productId: 'prod-7', productName: 'Waterproof Shell Jacket', quantity: 1, unitPrice: 195.00, total: 195.00},
      {productId: 'prod-13', productName: 'Trail Running Shoes', quantity: 1, unitPrice: 139.99, total: 139.99},
      {productId: 'prod-14', productName: 'Insulated Water Bottle 32oz', quantity: 2, unitPrice: 29.99, total: 59.98},
    ],
    subtotal: 394.97,
    shipping: 0,
    tax: 33.57,
    total: 428.54,
    status: 'delivered',
    paymentMethod: 'credit_card',
    createdAt: '2025-11-28T11:00:00Z',
    updatedAt: '2025-12-02T15:45:00Z',
  },
  {
    id: 'ord-5',
    orderNumber: 'ORD-2025-1005',
    customerId: 'cust-4',
    customerName: 'James Park',
    customerEmail: 'james.park@example.com',
    items: [
      {productId: 'prod-11', productName: 'Designing Data-Intensive Applications', quantity: 1, unitPrice: 42.99, total: 42.99},
      {productId: 'prod-12', productName: 'The Creative Act: A Way of Being', quantity: 1, unitPrice: 28.99, total: 28.99},
    ],
    subtotal: 71.98,
    shipping: 4.99,
    tax: 6.12,
    total: 83.09,
    status: 'pending',
    paymentMethod: 'bank_transfer',
    createdAt: '2025-12-25T08:30:00Z',
    updatedAt: '2025-12-25T08:30:00Z',
  },
  {
    id: 'ord-6',
    orderNumber: 'ORD-2025-1006',
    customerId: 'cust-1',
    customerName: 'Olivia Chen',
    customerEmail: 'olivia.chen@example.com',
    items: [
      {productId: 'prod-8', productName: 'Pour-Over Coffee Maker Set', quantity: 1, unitPrice: 64.99, total: 64.99},
      {productId: 'prod-9', productName: 'Cast Iron Dutch Oven 5.5 Qt', quantity: 1, unitPrice: 129.99, total: 129.99},
    ],
    subtotal: 194.98,
    shipping: 0,
    tax: 16.57,
    total: 211.55,
    status: 'cancelled',
    paymentMethod: 'credit_card',
    createdAt: '2025-12-10T19:00:00Z',
    updatedAt: '2025-12-11T08:22:00Z',
  },
  {
    id: 'ord-7',
    orderNumber: 'ORD-2025-1007',
    customerId: 'cust-3',
    customerName: 'Priya Sharma',
    customerEmail: 'priya.sharma@example.com',
    items: [
      {productId: 'prod-4', productName: 'USB-C Docking Station', quantity: 1, unitPrice: 89.99, total: 89.99},
    ],
    subtotal: 89.99,
    shipping: 5.99,
    tax: 7.65,
    total: 103.63,
    status: 'refunded',
    paymentMethod: 'paypal',
    createdAt: '2025-11-15T13:20:00Z',
    updatedAt: '2025-11-22T10:00:00Z',
  },
];

// =============================================================================
// Reviews
// =============================================================================

export const reviews: Review[] = [
  {
    id: 'rev-1',
    productId: 'prod-1',
    productName: 'Wireless Noise-Cancelling Headphones',
    customerId: 'cust-1',
    customerName: 'Olivia Chen',
    rating: 5,
    title: "Best headphones I've ever owned",
    body: 'The noise cancellation is incredible. I use them daily in a noisy office and they block out everything. Battery life easily lasts a full work week.',
    isVerified: true,
    createdAt: '2025-12-08T14:00:00Z',
  },
  {
    id: 'rev-2',
    productId: 'prod-8',
    productName: 'Pour-Over Coffee Maker Set',
    customerId: 'cust-5',
    customerName: 'Sofia Rodriguez',
    rating: 5,
    title: 'Coffee game changed forever',
    body: 'The included gooseneck kettle and scale make this a complete setup. My morning coffee has never been better. Highly recommend for anyone getting into pour-over.',
    isVerified: true,
    createdAt: '2025-10-12T09:30:00Z',
  },
  {
    id: 'rev-3',
    productId: 'prod-3',
    productName: '4K Ultra-Wide Monitor 34"',
    customerId: 'cust-3',
    customerName: 'Priya Sharma',
    rating: 5,
    title: 'Stunning display, worth every penny',
    body: 'The color accuracy is phenomenal and the USB-C hub means I only need one cable to my laptop. The curve is subtle and comfortable for long coding sessions.',
    isVerified: true,
    createdAt: '2025-12-24T16:45:00Z',
  },
  {
    id: 'rev-4',
    productId: 'prod-5',
    productName: 'Merino Wool Crewneck Sweater',
    customerId: 'cust-2',
    customerName: 'Marcus Johnson',
    rating: 4,
    title: 'Great quality, runs slightly large',
    body: "Beautiful sweater and very soft. I'd recommend sizing down if you're between sizes. The wool doesn't itch at all which is a huge plus.",
    isVerified: true,
    createdAt: '2025-12-20T11:15:00Z',
  },
  {
    id: 'rev-5',
    productId: 'prod-4',
    productName: 'USB-C Docking Station',
    customerId: 'cust-3',
    customerName: 'Priya Sharma',
    rating: 2,
    title: 'Stopped working after a month',
    body: 'Worked great for the first few weeks but then one of the HDMI ports stopped outputting. Had to return it. Disappointed because the form factor was perfect.',
    isVerified: true,
    createdAt: '2025-11-20T08:00:00Z',
  },
  {
    id: 'rev-6',
    productId: 'prod-11',
    productName: 'Designing Data-Intensive Applications',
    customerId: 'cust-4',
    customerName: 'James Park',
    rating: 5,
    title: 'Essential reading for any engineer',
    body: 'This book fundamentally changed how I think about system design. Every chapter is packed with insight. I keep coming back to it as a reference.',
    isVerified: true,
    createdAt: '2025-12-26T10:00:00Z',
  },
  {
    id: 'rev-7',
    productId: 'prod-7',
    productName: 'Waterproof Shell Jacket',
    customerId: 'cust-5',
    customerName: 'Sofia Rodriguez',
    rating: 5,
    title: 'Survived a downpour, stayed bone dry',
    body: 'Took this on a hiking trip in the Pacific Northwest. Got caught in heavy rain for 2 hours and stayed completely dry. Packs down small too.',
    isVerified: true,
    createdAt: '2025-12-04T17:30:00Z',
  },
  {
    id: 'rev-8',
    productId: 'prod-14',
    productName: 'Insulated Water Bottle 32oz',
    customerId: 'cust-2',
    customerName: 'Marcus Johnson',
    rating: 3,
    title: 'Good bottle, lid could be better',
    body: "Keeps water cold all day which is great. But the lid is hard to clean and the paint chips easily. For the price it's fine but not exceptional.",
    isVerified: false,
    createdAt: '2025-11-30T14:20:00Z',
  },
];

// =============================================================================
// Cart (sample active cart)
// =============================================================================

export const cartItems: CartItem[] = [
  {
    id: 'cart-1',
    productId: 'prod-2',
    productName: 'Mechanical Keyboard — Cherry MX',
    image: 'https://picsum.photos/seed/keyboard/400/400',
    quantity: 1,
    unitPrice: 149.99,
    total: 149.99,
  },
  {
    id: 'cart-2',
    productId: 'prod-8',
    productName: 'Pour-Over Coffee Maker Set',
    image: 'https://picsum.photos/seed/coffee/400/400',
    quantity: 1,
    unitPrice: 64.99,
    total: 64.99,
  },
  {
    id: 'cart-3',
    productId: 'prod-14',
    productName: 'Insulated Water Bottle 32oz',
    image: 'https://picsum.photos/seed/bottle/400/400',
    quantity: 3,
    unitPrice: 29.99,
    total: 89.97,
  },
];

export const cartSummary = {
  itemCount: 5,
  subtotal: 304.95,
  shipping: 0,
  tax: 25.92,
  total: 330.87,
};

// =============================================================================
// Store Summary / Dashboard Data
// =============================================================================

export const storeSummary: StoreSummary = {
  totalRevenue: 48_293.50,
  totalOrders: 187,
  totalCustomers: 142,
  totalProducts: 14,
  averageOrderValue: 258.25,
  conversionRate: 3.2,
  revenueByMonth: [
    {month: 'Jul', revenue: 5_420},
    {month: 'Aug', revenue: 6_180},
    {month: 'Sep', revenue: 7_340},
    {month: 'Oct', revenue: 6_890},
    {month: 'Nov', revenue: 9_150},
    {month: 'Dec', revenue: 13_313.50},
  ],
  topCategories: [
    {category: 'Electronics', revenue: 18_420, orders: 62},
    {category: 'Clothing', revenue: 12_350, orders: 48},
    {category: 'Home & Kitchen', revenue: 8_940, orders: 35},
    {category: 'Sports & Outdoors', revenue: 5_280, orders: 27},
    {category: 'Books', revenue: 3_303.50, orders: 15},
  ],
};

// =============================================================================
// Helpers
// =============================================================================

/** Get a product by ID */
export function getProduct(id: string): Product | undefined {
  return products.find(p => p.id === id);
}

/** Get products by category */
export function getProductsByCategory(categoryId: string): Product[] {
  return products.filter(p => p.categoryId === categoryId);
}

/** Get orders by customer */
export function getOrdersByCustomer(customerId: string): Order[] {
  return orders.filter(o => o.customerId === customerId);
}

/** Get reviews for a product */
export function getReviewsForProduct(productId: string): Review[] {
  return reviews.filter(r => r.productId === productId);
}

/** Format price as USD string */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/** Get status color hint for order status */
export function getOrderStatusColor(
  status: Order['status'],
): 'green' | 'blue' | 'yellow' | 'red' | 'gray' {
  const map: Record<Order['status'], 'green' | 'blue' | 'yellow' | 'red' | 'gray'> = {
    delivered: 'green',
    shipped: 'blue',
    processing: 'blue',
    pending: 'yellow',
    cancelled: 'red',
    refunded: 'gray',
  };
  return map[status];
}

/** Get status color hint for product stock status */
export function getStockStatusColor(
  status: Product['status'],
): 'green' | 'yellow' | 'red' {
  const map: Record<Product['status'], 'green' | 'yellow' | 'red'> = {
    in_stock: 'green',
    low_stock: 'yellow',
    out_of_stock: 'red',
  };
  return map[status];
}
