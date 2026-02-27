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
    name: 'Smart Tech',
    slug: 'smart-tech',
    description: 'AI-powered devices, wearables, and connected gadgets',
    productCount: 4,
  },
  {
    id: 'cat-2',
    name: 'Sustainable Fashion',
    slug: 'sustainable-fashion',
    description: 'Eco-conscious apparel and accessories',
    productCount: 3,
  },
  {
    id: 'cat-3',
    name: 'Home & Wellness',
    slug: 'home-wellness',
    description: 'Smart home essentials and self-care products',
    productCount: 3,
  },
  {
    id: 'cat-4',
    name: 'Books & Learning',
    slug: 'books-learning',
    description: 'Must-reads on AI, design, and modern engineering',
    productCount: 2,
  },
  {
    id: 'cat-5',
    name: 'Active & Outdoors',
    slug: 'active-outdoors',
    description: 'Performance gear for every adventure',
    productCount: 2,
  },
];

// =============================================================================
// Products
// =============================================================================

export const products: Product[] = [
  {
    id: 'prod-1',
    name: 'AI Noise-Cancelling Earbuds Pro',
    slug: 'ai-noise-cancelling-earbuds-pro',
    description:
      'Adaptive ANC earbuds with real-time voice isolation, spatial audio, and 40-hour battery with the charging case. On-device AI adapts to your environment.',
    price: 249.99,
    compareAtPrice: 299.99,
    categoryId: 'cat-1',
    category: 'Smart Tech',
    image: 'https://picsum.photos/seed/earbuds2026/400/400',
    rating: 4.8,
    reviewCount: 412,
    stock: 62,
    status: 'in_stock',
    tags: ['audio', 'ai', 'bestseller'],
    sku: 'TECH-EB-001',
    createdAt: '2025-11-10T10:00:00Z',
  },
  {
    id: 'prod-2',
    name: 'Split Ergonomic Keyboard',
    slug: 'split-ergonomic-keyboard',
    description:
      'Low-profile split mechanical keyboard with hot-swappable switches, wireless multi-device pairing, and an integrated trackpad module.',
    price: 189.99,
    compareAtPrice: null,
    categoryId: 'cat-1',
    category: 'Smart Tech',
    image: 'https://picsum.photos/seed/splitkb/400/400',
    rating: 4.6,
    reviewCount: 134,
    stock: 85,
    status: 'in_stock',
    tags: ['peripherals', 'ergonomic', 'wireless'],
    sku: 'TECH-KB-002',
    createdAt: '2025-12-05T10:00:00Z',
  },
  {
    id: 'prod-3',
    name: '5K OLED Monitor 32"',
    slug: '5k-oled-monitor-32',
    description:
      '32-inch OLED display with 5K resolution, 240Hz refresh rate, and Thunderbolt 5 daisy-chaining. HDR 1000 certified with true blacks.',
    price: 1099.99,
    compareAtPrice: 1299.99,
    categoryId: 'cat-1',
    category: 'Smart Tech',
    image: 'https://picsum.photos/seed/oledmonitor/400/400',
    rating: 4.9,
    reviewCount: 203,
    stock: 5,
    status: 'low_stock',
    tags: ['display', 'oled', '5k'],
    sku: 'TECH-MN-003',
    createdAt: '2025-10-18T10:00:00Z',
  },
  {
    id: 'prod-4',
    name: 'AI Meeting Hub',
    slug: 'ai-meeting-hub',
    description:
      'All-in-one conference device with 360° camera, beamforming mics, and on-device AI for real-time transcription and meeting summaries.',
    price: 349.99,
    compareAtPrice: null,
    categoryId: 'cat-1',
    category: 'Smart Tech',
    image: 'https://picsum.photos/seed/meetinghub/400/400',
    rating: 4.4,
    reviewCount: 78,
    stock: 0,
    status: 'out_of_stock',
    tags: ['ai', 'meetings', 'remote-work'],
    sku: 'TECH-MH-004',
    createdAt: '2026-01-08T10:00:00Z',
  },
  {
    id: 'prod-5',
    name: 'Recycled Cashmere Crewneck',
    slug: 'recycled-cashmere-crewneck',
    description:
      'Ultra-soft crewneck made from 100% recycled cashmere. Carbon-neutral production with traceable supply chain.',
    price: 128.0,
    compareAtPrice: 165.0,
    categoryId: 'cat-2',
    category: 'Sustainable Fashion',
    image: 'https://picsum.photos/seed/cashmere26/400/400',
    rating: 4.7,
    reviewCount: 289,
    stock: 48,
    status: 'in_stock',
    tags: ['cashmere', 'recycled', 'bestseller'],
    sku: 'FASH-CR-005',
    createdAt: '2025-09-20T10:00:00Z',
  },
  {
    id: 'prod-6',
    name: 'Performance Travel Pants',
    slug: 'performance-travel-pants',
    description:
      '4-way stretch travel pants with hidden zip pockets, wrinkle-free fabric, and UPF 50+ sun protection. Goes from plane to trail.',
    price: 98.0,
    compareAtPrice: null,
    categoryId: 'cat-2',
    category: 'Sustainable Fashion',
    image: 'https://picsum.photos/seed/travelpants/400/400',
    rating: 4.5,
    reviewCount: 217,
    stock: 150,
    status: 'in_stock',
    tags: ['travel', 'performance', 'wrinkle-free'],
    sku: 'FASH-PT-006',
    createdAt: '2025-08-14T10:00:00Z',
  },
  {
    id: 'prod-7',
    name: 'Graphene-Lined Puffer Jacket',
    slug: 'graphene-lined-puffer-jacket',
    description:
      'Lightweight puffer with graphene lining for superior heat distribution. Packable, water-resistant, and made from recycled nylon.',
    price: 225.0,
    compareAtPrice: 285.0,
    categoryId: 'cat-2',
    category: 'Sustainable Fashion',
    image: 'https://picsum.photos/seed/puffer26/400/400',
    rating: 4.9,
    reviewCount: 156,
    stock: 3,
    status: 'low_stock',
    tags: ['outerwear', 'graphene', 'bestseller'],
    sku: 'FASH-JK-007',
    createdAt: '2025-11-28T10:00:00Z',
  },
  {
    id: 'prod-8',
    name: 'Smart Pour-Over Coffee System',
    slug: 'smart-pour-over-coffee-system',
    description:
      'App-connected pour-over brewer with precision temperature control, built-in scale, and guided brew recipes. Borosilicate glass carafe.',
    price: 119.99,
    compareAtPrice: null,
    categoryId: 'cat-3',
    category: 'Home & Wellness',
    image: 'https://picsum.photos/seed/smartcoffee/400/400',
    rating: 4.8,
    reviewCount: 534,
    stock: 40,
    status: 'in_stock',
    tags: ['coffee', 'smart-home', 'bestseller'],
    sku: 'HOME-CF-008',
    createdAt: '2025-07-22T10:00:00Z',
  },
  {
    id: 'prod-9',
    name: 'Air Purifier with CO₂ Monitor',
    slug: 'air-purifier-co2-monitor',
    description:
      'HEPA 14 air purifier with real-time CO₂, VOC, and PM2.5 monitoring. Auto-adjusts fan speed based on air quality. Covers up to 800 sq ft.',
    price: 179.99,
    compareAtPrice: 219.99,
    categoryId: 'cat-3',
    category: 'Home & Wellness',
    image: 'https://picsum.photos/seed/airpurifier/400/400',
    rating: 4.7,
    reviewCount: 312,
    stock: 25,
    status: 'in_stock',
    tags: ['air-quality', 'smart-home', 'wellness'],
    sku: 'HOME-AP-009',
    createdAt: '2025-06-30T10:00:00Z',
  },
  {
    id: 'prod-10',
    name: 'Sunrise Alarm & Sleep Tracker',
    slug: 'sunrise-alarm-sleep-tracker',
    description:
      'Bedside device with gradual sunrise simulation, sleep sound analysis, and smart home integration. No phone required.',
    price: 89.99,
    compareAtPrice: null,
    categoryId: 'cat-3',
    category: 'Home & Wellness',
    image: 'https://picsum.photos/seed/sunrisealarm/400/400',
    rating: 4.3,
    reviewCount: 187,
    stock: 70,
    status: 'in_stock',
    tags: ['sleep', 'wellness', 'smart-home'],
    sku: 'HOME-SA-010',
    createdAt: '2025-12-12T10:00:00Z',
  },
  {
    id: 'prod-11',
    name: 'AI Engineering: Building Intelligent Systems',
    slug: 'ai-engineering-building-intelligent-systems',
    description:
      "Chip Huyen's comprehensive guide to building production AI systems — from data pipelines to evaluation, deployment, and monitoring.",
    price: 49.99,
    compareAtPrice: null,
    categoryId: 'cat-4',
    category: 'Books & Learning',
    image: 'https://picsum.photos/seed/aiengbook/400/400',
    rating: 4.9,
    reviewCount: 1247,
    stock: 400,
    status: 'in_stock',
    tags: ['ai', 'engineering', 'bestseller'],
    sku: 'BOOK-TC-011',
    createdAt: '2025-05-15T10:00:00Z',
  },
  {
    id: 'prod-12',
    name: 'Design Systems at Scale',
    slug: 'design-systems-at-scale',
    description:
      'A practical guide to building, maintaining, and evolving design systems for large organizations. Covers tokens, components, governance, and adoption.',
    price: 38.99,
    compareAtPrice: 44.0,
    categoryId: 'cat-4',
    category: 'Books & Learning',
    image: 'https://picsum.photos/seed/designsysbook/400/400',
    rating: 4.6,
    reviewCount: 423,
    stock: 220,
    status: 'in_stock',
    tags: ['design-systems', 'engineering'],
    sku: 'BOOK-DS-012',
    createdAt: '2025-04-10T10:00:00Z',
  },
  {
    id: 'prod-13',
    name: 'Carbon-Plated Trail Runners',
    slug: 'carbon-plated-trail-runners',
    description:
      'Trail running shoes with carbon fiber plate, Vibram Megagrip outsole, and nitrogen-infused midsole. 15% more energy return than previous gen.',
    price: 179.99,
    compareAtPrice: null,
    categoryId: 'cat-5',
    category: 'Active & Outdoors',
    image: 'https://picsum.photos/seed/trailrun26/400/400',
    rating: 4.6,
    reviewCount: 268,
    stock: 35,
    status: 'in_stock',
    tags: ['running', 'trail', 'carbon-plate'],
    sku: 'ACTV-SH-013',
    createdAt: '2025-10-02T10:00:00Z',
  },
  {
    id: 'prod-14',
    name: 'Self-Cleaning Water Bottle 32oz',
    slug: 'self-cleaning-water-bottle-32oz',
    description:
      'UV-C self-cleaning insulated bottle. Purifies water in 60 seconds, keeps drinks cold 24h or hot 12h. Tracks hydration via app.',
    price: 49.99,
    compareAtPrice: 64.99,
    categoryId: 'cat-5',
    category: 'Active & Outdoors',
    image: 'https://picsum.photos/seed/uvbottle/400/400',
    rating: 4.5,
    reviewCount: 743,
    stock: 200,
    status: 'in_stock',
    tags: ['hydration', 'uv-c', 'bestseller'],
    sku: 'ACTV-BT-014',
    createdAt: '2025-09-01T10:00:00Z',
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
    totalSpent: 3_142.5,
    joinedAt: '2025-01-15T10:00:00Z',
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
    totalSpent: 834.97,
    joinedAt: '2025-06-22T10:00:00Z',
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
    totalSpent: 1_823.44,
    joinedAt: '2025-03-10T10:00:00Z',
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
    totalSpent: 238.98,
    joinedAt: '2025-12-01T10:00:00Z',
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
    totalSpent: 3_891.85,
    joinedAt: '2024-10-08T10:00:00Z',
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
    name: 'Aisha Patel',
    email: 'aisha.patel@example.com',
    avatar: null,
    totalOrders: 0,
    totalSpent: 0,
    joinedAt: '2026-02-10T10:00:00Z',
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
    orderNumber: 'ORD-2026-1001',
    customerId: 'cust-1',
    customerName: 'Olivia Chen',
    customerEmail: 'olivia.chen@example.com',
    items: [
      {
        productId: 'prod-1',
        productName: 'AI Noise-Cancelling Earbuds Pro',
        quantity: 1,
        unitPrice: 249.99,
        total: 249.99,
      },
      {
        productId: 'prod-10',
        productName: 'Sunrise Alarm & Sleep Tracker',
        quantity: 1,
        unitPrice: 89.99,
        total: 89.99,
      },
    ],
    subtotal: 339.98,
    shipping: 0,
    tax: 28.9,
    total: 368.88,
    status: 'delivered',
    paymentMethod: 'apple_pay',
    createdAt: '2026-01-18T14:23:00Z',
    updatedAt: '2026-01-22T09:15:00Z',
  },
  {
    id: 'ord-2',
    orderNumber: 'ORD-2026-1002',
    customerId: 'cust-2',
    customerName: 'Marcus Johnson',
    customerEmail: 'marcus.j@example.com',
    items: [
      {
        productId: 'prod-5',
        productName: 'Recycled Cashmere Crewneck',
        quantity: 1,
        unitPrice: 128.0,
        total: 128.0,
      },
      {
        productId: 'prod-6',
        productName: 'Performance Travel Pants',
        quantity: 2,
        unitPrice: 98.0,
        total: 196.0,
      },
    ],
    subtotal: 324.0,
    shipping: 0,
    tax: 27.54,
    total: 351.54,
    status: 'shipped',
    paymentMethod: 'paypal',
    createdAt: '2026-02-10T09:45:00Z',
    updatedAt: '2026-02-12T11:30:00Z',
  },
  {
    id: 'ord-3',
    orderNumber: 'ORD-2026-1003',
    customerId: 'cust-3',
    customerName: 'Priya Sharma',
    customerEmail: 'priya.sharma@example.com',
    items: [
      {
        productId: 'prod-3',
        productName: '5K OLED Monitor 32"',
        quantity: 1,
        unitPrice: 1099.99,
        total: 1099.99,
      },
      {
        productId: 'prod-2',
        productName: 'Split Ergonomic Keyboard',
        quantity: 1,
        unitPrice: 189.99,
        total: 189.99,
      },
    ],
    subtotal: 1289.98,
    shipping: 0,
    tax: 109.65,
    total: 1399.63,
    status: 'processing',
    paymentMethod: 'apple_pay',
    createdAt: '2026-02-20T16:10:00Z',
    updatedAt: '2026-02-20T16:10:00Z',
  },
  {
    id: 'ord-4',
    orderNumber: 'ORD-2026-1004',
    customerId: 'cust-5',
    customerName: 'Sofia Rodriguez',
    customerEmail: 'sofia.r@example.com',
    items: [
      {
        productId: 'prod-7',
        productName: 'Graphene-Lined Puffer Jacket',
        quantity: 1,
        unitPrice: 225.0,
        total: 225.0,
      },
      {
        productId: 'prod-13',
        productName: 'Carbon-Plated Trail Runners',
        quantity: 1,
        unitPrice: 179.99,
        total: 179.99,
      },
      {
        productId: 'prod-14',
        productName: 'Self-Cleaning Water Bottle 32oz',
        quantity: 2,
        unitPrice: 49.99,
        total: 99.98,
      },
    ],
    subtotal: 504.97,
    shipping: 0,
    tax: 42.92,
    total: 547.89,
    status: 'delivered',
    paymentMethod: 'credit_card',
    createdAt: '2026-01-05T11:00:00Z',
    updatedAt: '2026-01-09T15:45:00Z',
  },
  {
    id: 'ord-5',
    orderNumber: 'ORD-2026-1005',
    customerId: 'cust-4',
    customerName: 'James Park',
    customerEmail: 'james.park@example.com',
    items: [
      {
        productId: 'prod-11',
        productName: 'AI Engineering: Building Intelligent Systems',
        quantity: 1,
        unitPrice: 49.99,
        total: 49.99,
      },
      {
        productId: 'prod-12',
        productName: 'Design Systems at Scale',
        quantity: 1,
        unitPrice: 38.99,
        total: 38.99,
      },
    ],
    subtotal: 88.98,
    shipping: 4.99,
    tax: 7.56,
    total: 101.53,
    status: 'pending',
    paymentMethod: 'bank_transfer',
    createdAt: '2026-02-24T08:30:00Z',
    updatedAt: '2026-02-24T08:30:00Z',
  },
  {
    id: 'ord-6',
    orderNumber: 'ORD-2026-1006',
    customerId: 'cust-1',
    customerName: 'Olivia Chen',
    customerEmail: 'olivia.chen@example.com',
    items: [
      {
        productId: 'prod-8',
        productName: 'Smart Pour-Over Coffee System',
        quantity: 1,
        unitPrice: 119.99,
        total: 119.99,
      },
      {
        productId: 'prod-9',
        productName: 'Air Purifier with CO₂ Monitor',
        quantity: 1,
        unitPrice: 179.99,
        total: 179.99,
      },
    ],
    subtotal: 299.98,
    shipping: 0,
    tax: 25.5,
    total: 325.48,
    status: 'cancelled',
    paymentMethod: 'credit_card',
    createdAt: '2026-02-01T19:00:00Z',
    updatedAt: '2026-02-02T08:22:00Z',
  },
  {
    id: 'ord-7',
    orderNumber: 'ORD-2026-1007',
    customerId: 'cust-3',
    customerName: 'Priya Sharma',
    customerEmail: 'priya.sharma@example.com',
    items: [
      {
        productId: 'prod-4',
        productName: 'AI Meeting Hub',
        quantity: 1,
        unitPrice: 349.99,
        total: 349.99,
      },
    ],
    subtotal: 349.99,
    shipping: 0,
    tax: 29.75,
    total: 379.74,
    status: 'refunded',
    paymentMethod: 'paypal',
    createdAt: '2025-12-15T13:20:00Z',
    updatedAt: '2025-12-22T10:00:00Z',
  },
];

// =============================================================================
// Reviews
// =============================================================================

export const reviews: Review[] = [
  {
    id: 'rev-1',
    productId: 'prod-1',
    productName: 'AI Noise-Cancelling Earbuds Pro',
    customerId: 'cust-1',
    customerName: 'Olivia Chen',
    rating: 5,
    title: 'The AI adaptation is genuinely impressive',
    body: "These earbuds learn your environment — after a week, they automatically adjust ANC levels for my office, commute, and gym. Voice isolation on calls is the best I've tried. Battery easily lasts a full work week.",
    isVerified: true,
    createdAt: '2026-02-05T14:00:00Z',
  },
  {
    id: 'rev-2',
    productId: 'prod-8',
    productName: 'Smart Pour-Over Coffee System',
    customerId: 'cust-5',
    customerName: 'Sofia Rodriguez',
    rating: 5,
    title: 'Finally, a smart coffee gadget that delivers',
    body: 'The guided brew recipes are perfect for beginners and the precision temperature control makes a noticeable difference. My morning coffee has never been this consistent. App is well-designed too.',
    isVerified: true,
    createdAt: '2026-01-12T09:30:00Z',
  },
  {
    id: 'rev-3',
    productId: 'prod-3',
    productName: '5K OLED Monitor 32"',
    customerId: 'cust-3',
    customerName: 'Priya Sharma',
    rating: 5,
    title: 'OLED for coding is a game-changer',
    body: 'True blacks make dark mode incredible, and the 5K resolution means text is razor sharp. Thunderbolt 5 daisy-chaining means one cable to my laptop. Worth every penny for the upgrade from LCD.',
    isVerified: true,
    createdAt: '2026-02-22T16:45:00Z',
  },
  {
    id: 'rev-4',
    productId: 'prod-5',
    productName: 'Recycled Cashmere Crewneck',
    customerId: 'cust-2',
    customerName: 'Marcus Johnson',
    rating: 4,
    title: 'Softer than expected, love the sustainability angle',
    body: "You can't tell it's recycled cashmere — it's incredibly soft. Runs slightly large so size down if you're between sizes. The QR code on the tag lets you trace the entire supply chain, which is a nice touch.",
    isVerified: true,
    createdAt: '2026-02-15T11:15:00Z',
  },
  {
    id: 'rev-5',
    productId: 'prod-4',
    productName: 'AI Meeting Hub',
    customerId: 'cust-3',
    customerName: 'Priya Sharma',
    rating: 2,
    title: 'Great concept, buggy firmware',
    body: 'The transcription quality is impressive when it works, but the firmware crashed twice during important meetings. The 360° camera is excellent though. Hoping a firmware update fixes the stability issues.',
    isVerified: true,
    createdAt: '2025-12-20T08:00:00Z',
  },
  {
    id: 'rev-6',
    productId: 'prod-11',
    productName: 'AI Engineering: Building Intelligent Systems',
    customerId: 'cust-4',
    customerName: 'James Park',
    rating: 5,
    title: 'The DDIA of the AI era',
    body: 'This book fills a massive gap — practical, opinionated, and deeply informed. Every chapter on evaluation and monitoring alone is worth the price. Already recommended it to my entire team.',
    isVerified: true,
    createdAt: '2026-02-25T10:00:00Z',
  },
  {
    id: 'rev-7',
    productId: 'prod-7',
    productName: 'Graphene-Lined Puffer Jacket',
    customerId: 'cust-5',
    customerName: 'Sofia Rodriguez',
    rating: 5,
    title: "Warmest lightweight jacket I've owned",
    body: 'The graphene lining distributes heat so evenly — no cold spots. Wore it hiking at 20°F and was perfectly comfortable. Packs down to the size of a water bottle. The recycled nylon feels premium.',
    isVerified: true,
    createdAt: '2026-01-20T17:30:00Z',
  },
  {
    id: 'rev-8',
    productId: 'prod-14',
    productName: 'Self-Cleaning Water Bottle 32oz',
    customerId: 'cust-2',
    customerName: 'Marcus Johnson',
    rating: 3,
    title: 'UV-C works, app is unnecessary',
    body: "The self-cleaning feature genuinely works — no more funky taste after a few days. Insulation is solid. But the hydration tracking app feels forced and drains the bottle's battery faster. Just let me drink water.",
    isVerified: false,
    createdAt: '2026-01-28T14:20:00Z',
  },
];

// =============================================================================
// Cart (sample active cart)
// =============================================================================

export const cartItems: CartItem[] = [
  {
    id: 'cart-1',
    productId: 'prod-2',
    productName: 'Split Ergonomic Keyboard',
    image: 'https://picsum.photos/seed/splitkb/400/400',
    quantity: 1,
    unitPrice: 189.99,
    total: 189.99,
  },
  {
    id: 'cart-2',
    productId: 'prod-8',
    productName: 'Smart Pour-Over Coffee System',
    image: 'https://picsum.photos/seed/smartcoffee/400/400',
    quantity: 1,
    unitPrice: 119.99,
    total: 119.99,
  },
  {
    id: 'cart-3',
    productId: 'prod-14',
    productName: 'Self-Cleaning Water Bottle 32oz',
    image: 'https://picsum.photos/seed/uvbottle/400/400',
    quantity: 3,
    unitPrice: 49.99,
    total: 149.97,
  },
];

export const cartSummary = {
  itemCount: 5,
  subtotal: 459.95,
  shipping: 0,
  tax: 39.1,
  total: 499.05,
};

// =============================================================================
// Store Summary / Dashboard Data
// =============================================================================

export const storeSummary: StoreSummary = {
  totalRevenue: 62_847.5,
  totalOrders: 243,
  totalCustomers: 189,
  totalProducts: 14,
  averageOrderValue: 258.67,
  conversionRate: 3.8,
  revenueByMonth: [
    {month: 'Sep', revenue: 7_420},
    {month: 'Oct', revenue: 8_180},
    {month: 'Nov', revenue: 9_840},
    {month: 'Dec', revenue: 14_290},
    {month: 'Jan', revenue: 12_150},
    {month: 'Feb', revenue: 10_967.5},
  ],
  topCategories: [
    {category: 'Smart Tech', revenue: 24_320, orders: 78},
    {category: 'Sustainable Fashion', revenue: 14_850, orders: 52},
    {category: 'Home & Wellness', revenue: 11_940, orders: 45},
    {category: 'Active & Outdoors', revenue: 7_280, orders: 38},
    {category: 'Books & Learning', revenue: 4_457.5, orders: 30},
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
