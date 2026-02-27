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
    id: 'furn-cat-1',
    name: 'Seating',
    slug: 'seating',
    description: 'Sculptural chairs, lounge seating, and sofas',
    productCount: 4,
  },
  {
    id: 'furn-cat-2',
    name: 'Lighting',
    slug: 'lighting',
    description: 'Pendant lamps, floor lights, and table fixtures',
    productCount: 3,
  },
  {
    id: 'furn-cat-3',
    name: 'Tables',
    slug: 'tables',
    description: 'Dining tables, side tables, and desks',
    productCount: 3,
  },
  {
    id: 'furn-cat-4',
    name: 'Storage',
    slug: 'storage',
    description: 'Shelving, cabinets, and credenzas',
    productCount: 2,
  },
  {
    id: 'furn-cat-5',
    name: 'Decor',
    slug: 'decor',
    description: 'Vases, objects, and textiles',
    productCount: 2,
  },
];

export const products: Product[] = [
  {
    id: 'furn-1',
    name: 'Arc Lounge Chair',
    slug: 'arc-lounge-chair',
    description:
      'Sculptural lounge chair with a sweeping curved back in solid white oak. Upholstered seat cushion in boucl\u00e9 fabric. Handcrafted in Portugal.',
    price: 2_850.0,
    compareAtPrice: null,
    categoryId: 'furn-cat-1',
    category: 'Seating',
    image: 'https://picsum.photos/seed/lounge-chair/400/400',
    rating: 4.9,
    reviewCount: 47,
    stock: 6,
    status: 'low_stock',
    tags: ['lounge', 'sculptural', 'oak', 'bestseller'],
    sku: 'SEAT-AC-001',
    createdAt: '2025-10-15T10:00:00Z',
  },
  {
    id: 'furn-2',
    name: 'Pebble Dining Chair',
    slug: 'pebble-dining-chair',
    description:
      'Organic-shaped dining chair in molded recycled plastic with a matte finish. Stackable. Available in Chalk, Fog, and Terracotta.',
    price: 485.0,
    compareAtPrice: 540.0,
    categoryId: 'furn-cat-1',
    category: 'Seating',
    image: 'https://picsum.photos/seed/dining-chair/400/400',
    rating: 4.7,
    reviewCount: 128,
    stock: 45,
    status: 'in_stock',
    tags: ['dining', 'recycled', 'stackable'],
    sku: 'SEAT-PB-002',
    createdAt: '2025-11-02T10:00:00Z',
  },
  {
    id: 'furn-3',
    name: 'Drift Sofa — 3 Seat',
    slug: 'drift-sofa-3-seat',
    description:
      'Low-profile modular sofa with down-filled cushions and a solid walnut base. Upholstered in stonewashed linen. Sectional pieces sold separately.',
    price: 4_200.0,
    compareAtPrice: 4_800.0,
    categoryId: 'furn-cat-1',
    category: 'Seating',
    image: 'https://picsum.photos/seed/modern-sofa/400/400',
    rating: 4.8,
    reviewCount: 63,
    stock: 3,
    status: 'low_stock',
    tags: ['sofa', 'modular', 'linen', 'bestseller'],
    sku: 'SEAT-DS-003',
    createdAt: '2025-09-20T10:00:00Z',
  },
  {
    id: 'furn-4',
    name: 'Spine Counter Stool',
    slug: 'spine-counter-stool',
    description:
      'Minimal counter-height stool with a slim steel frame and contoured ash seat. Matte black or brass finish. 26" seat height.',
    price: 395.0,
    compareAtPrice: null,
    categoryId: 'furn-cat-1',
    category: 'Seating',
    image: 'https://picsum.photos/seed/counter-stool/400/400',
    rating: 4.5,
    reviewCount: 82,
    stock: 30,
    status: 'in_stock',
    tags: ['counter', 'stool', 'steel', 'ash'],
    sku: 'SEAT-SS-004',
    createdAt: '2025-12-08T10:00:00Z',
  },
  {
    id: 'furn-5',
    name: 'Halo Pendant Light',
    slug: 'halo-pendant-light',
    description:
      'Ring-shaped pendant lamp in brushed brass with an integrated warm LED. 24" diameter. Dimmable. Suspended by a minimal cable.',
    price: 1_120.0,
    compareAtPrice: null,
    categoryId: 'furn-cat-2',
    category: 'Lighting',
    image: 'https://picsum.photos/seed/pendant-light/400/400',
    rating: 4.8,
    reviewCount: 91,
    stock: 12,
    status: 'in_stock',
    tags: ['pendant', 'brass', 'led', 'bestseller'],
    sku: 'LITE-HL-005',
    createdAt: '2025-11-18T10:00:00Z',
  },
  {
    id: 'furn-6',
    name: 'Stem Floor Lamp',
    slug: 'stem-floor-lamp',
    description:
      'Slender floor lamp with an adjustable head in matte black steel. Weighted travertine base. Warm-dim LED technology.',
    price: 780.0,
    compareAtPrice: 890.0,
    categoryId: 'furn-cat-2',
    category: 'Lighting',
    image: 'https://picsum.photos/seed/floor-lamp/400/400',
    rating: 4.6,
    reviewCount: 54,
    stock: 18,
    status: 'in_stock',
    tags: ['floor-lamp', 'travertine', 'adjustable'],
    sku: 'LITE-SL-006',
    createdAt: '2025-10-25T10:00:00Z',
  },
  {
    id: 'furn-7',
    name: 'Orb Table Lamp',
    slug: 'orb-table-lamp',
    description:
      'Blown glass sphere on a ceramic base. Casts a soft ambient glow. Available in Smoke, Amber, and Clear. 12" tall.',
    price: 340.0,
    compareAtPrice: null,
    categoryId: 'furn-cat-2',
    category: 'Lighting',
    image: 'https://picsum.photos/seed/table-lamp/400/400',
    rating: 4.4,
    reviewCount: 113,
    stock: 40,
    status: 'in_stock',
    tags: ['table-lamp', 'glass', 'ceramic'],
    sku: 'LITE-OL-007',
    createdAt: '2026-01-05T10:00:00Z',
  },
  {
    id: 'furn-8',
    name: 'Slab Dining Table',
    slug: 'slab-dining-table',
    description:
      'Live-edge dining table in book-matched black walnut. Trestle base in blackened steel. Seats 6\u20138. Each piece is unique.',
    price: 5_600.0,
    compareAtPrice: null,
    categoryId: 'furn-cat-3',
    category: 'Tables',
    image: 'https://picsum.photos/seed/dining-table/400/400',
    rating: 5.0,
    reviewCount: 22,
    stock: 2,
    status: 'low_stock',
    tags: ['dining', 'live-edge', 'walnut', 'bestseller'],
    sku: 'TABL-SD-008',
    createdAt: '2025-08-12T10:00:00Z',
  },
  {
    id: 'furn-9',
    name: 'Trace Side Table',
    slug: 'trace-side-table',
    description:
      'Geometric side table in solid Carrara marble with a polished finish. 16" diameter, 20" tall. 45 lbs.',
    price: 920.0,
    compareAtPrice: 1_080.0,
    categoryId: 'furn-cat-3',
    category: 'Tables',
    image: 'https://picsum.photos/seed/side-table/400/400',
    rating: 4.7,
    reviewCount: 68,
    stock: 14,
    status: 'in_stock',
    tags: ['side-table', 'marble', 'geometric'],
    sku: 'TABL-TS-009',
    createdAt: '2025-12-20T10:00:00Z',
  },
  {
    id: 'furn-10',
    name: 'Ridge Writing Desk',
    slug: 'ridge-writing-desk',
    description:
      'Compact writing desk in white oak with a single drawer and cable management channel. Brass-tipped legs. 48" wide.',
    price: 1_450.0,
    compareAtPrice: null,
    categoryId: 'furn-cat-3',
    category: 'Tables',
    image: 'https://picsum.photos/seed/writing-desk/400/400',
    rating: 4.6,
    reviewCount: 39,
    stock: 8,
    status: 'in_stock',
    tags: ['desk', 'oak', 'brass', 'compact'],
    sku: 'TABL-RD-010',
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'furn-11',
    name: 'Column Bookshelf',
    slug: 'column-bookshelf',
    description:
      'Freestanding bookshelf with staggered shelves in powder-coated steel and natural ash. 72" tall, 36" wide. Wall-anchor included.',
    price: 1_680.0,
    compareAtPrice: 1_900.0,
    categoryId: 'furn-cat-4',
    category: 'Storage',
    image: 'https://picsum.photos/seed/bookshelf/400/400',
    rating: 4.8,
    reviewCount: 56,
    stock: 10,
    status: 'in_stock',
    tags: ['bookshelf', 'steel', 'ash', 'bestseller'],
    sku: 'STOR-CB-011',
    createdAt: '2025-11-30T10:00:00Z',
  },
  {
    id: 'furn-12',
    name: 'Vault Credenza',
    slug: 'vault-credenza',
    description:
      'Mid-century credenza in smoked oak with fluted doors and soft-close hinges. Adjustable interior shelves. Brass legs. 60" wide.',
    price: 3_200.0,
    compareAtPrice: null,
    categoryId: 'furn-cat-4',
    category: 'Storage',
    image: 'https://picsum.photos/seed/credenza/400/400',
    rating: 4.9,
    reviewCount: 31,
    stock: 4,
    status: 'low_stock',
    tags: ['credenza', 'mid-century', 'oak', 'brass'],
    sku: 'STOR-VC-012',
    createdAt: '2025-10-08T10:00:00Z',
  },
  {
    id: 'furn-13',
    name: 'Form Ceramic Vase',
    slug: 'form-ceramic-vase',
    description:
      'Hand-thrown stoneware vase with an asymmetric silhouette and reactive glaze. Each piece varies slightly. 14" tall.',
    price: 185.0,
    compareAtPrice: null,
    categoryId: 'furn-cat-5',
    category: 'Decor',
    image: 'https://picsum.photos/seed/ceramic-vase/400/400',
    rating: 4.5,
    reviewCount: 147,
    stock: 55,
    status: 'in_stock',
    tags: ['vase', 'ceramic', 'handmade'],
    sku: 'DECR-FV-013',
    createdAt: '2025-12-01T10:00:00Z',
  },
  {
    id: 'furn-14',
    name: 'Weave Throw Blanket',
    slug: 'weave-throw-blanket',
    description:
      'Chunky hand-woven throw in New Zealand wool. Oversized at 50" x 70". Available in Oat, Charcoal, and Sage.',
    price: 245.0,
    compareAtPrice: 295.0,
    categoryId: 'furn-cat-5',
    category: 'Decor',
    image: 'https://picsum.photos/seed/throw-blanket/400/400',
    rating: 4.7,
    reviewCount: 203,
    stock: 35,
    status: 'in_stock',
    tags: ['throw', 'wool', 'handwoven', 'bestseller'],
    sku: 'DECR-WT-014',
    createdAt: '2025-11-10T10:00:00Z',
  },
];

export const customers: Customer[] = [
  {
    id: 'furn-cust-1',
    name: 'Elena Vasquez',
    email: 'elena.v@example.com',
    avatar: null,
    totalOrders: 9,
    totalSpent: 14_230.0,
    joinedAt: '2024-11-20T10:00:00Z',
    status: 'vip',
    address: {
      street: '88 Franklin St',
      city: 'Brooklyn',
      state: 'NY',
      zip: '11222',
      country: 'US',
    },
  },
  {
    id: 'furn-cust-2',
    name: 'Thomas Eriksen',
    email: 'thomas.e@example.com',
    avatar: null,
    totalOrders: 4,
    totalSpent: 3_640.0,
    joinedAt: '2025-04-10T10:00:00Z',
    status: 'active',
    address: {
      street: '2200 NW Quimby St',
      city: 'Portland',
      state: 'OR',
      zip: '97210',
      country: 'US',
    },
  },
  {
    id: 'furn-cust-3',
    name: 'Mika Tanaka',
    email: 'mika.t@example.com',
    avatar: null,
    totalOrders: 7,
    totalSpent: 8_920.0,
    joinedAt: '2025-01-05T10:00:00Z',
    status: 'vip',
    address: {
      street: '430 S Hewitt St',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90013',
      country: 'US',
    },
  },
  {
    id: 'furn-cust-4',
    name: "Liam O'Brien",
    email: 'liam.ob@example.com',
    avatar: null,
    totalOrders: 2,
    totalSpent: 1_265.0,
    joinedAt: '2025-10-18T10:00:00Z',
    status: 'active',
    address: {
      street: '1401 Wynkoop St',
      city: 'Denver',
      state: 'CO',
      zip: '80202',
      country: 'US',
    },
  },
  {
    id: 'furn-cust-5',
    name: 'Camille Dubois',
    email: 'camille.d@example.com',
    avatar: null,
    totalOrders: 11,
    totalSpent: 18_450.0,
    joinedAt: '2024-08-15T10:00:00Z',
    status: 'vip',
    address: {
      street: '55 Thompson St',
      city: 'New York',
      state: 'NY',
      zip: '10012',
      country: 'US',
    },
  },
  {
    id: 'furn-cust-6',
    name: 'Raj Mehta',
    email: 'raj.m@example.com',
    avatar: null,
    totalOrders: 0,
    totalSpent: 0,
    joinedAt: '2026-02-18T10:00:00Z',
    status: 'inactive',
    address: {
      street: '700 W Fulton St',
      city: 'Chicago',
      state: 'IL',
      zip: '60661',
      country: 'US',
    },
  },
];

export const orders: Order[] = [
  {
    id: 'furn-ord-1',
    orderNumber: 'SS-2026-0101',
    customerId: 'furn-cust-1',
    customerName: 'Elena Vasquez',
    customerEmail: 'elena.v@example.com',
    items: [
      {
        productId: 'furn-1',
        productName: 'Arc Lounge Chair',
        quantity: 2,
        unitPrice: 2_850.0,
        total: 5_700.0,
      },
      {
        productId: 'furn-7',
        productName: 'Orb Table Lamp',
        quantity: 2,
        unitPrice: 340.0,
        total: 680.0,
      },
    ],
    subtotal: 6_380.0,
    shipping: 0,
    tax: 542.3,
    total: 6_922.3,
    status: 'delivered',
    paymentMethod: 'credit_card',
    createdAt: '2026-01-10T14:00:00Z',
    updatedAt: '2026-01-18T11:30:00Z',
  },
  {
    id: 'furn-ord-2',
    orderNumber: 'SS-2026-0102',
    customerId: 'furn-cust-2',
    customerName: 'Thomas Eriksen',
    customerEmail: 'thomas.e@example.com',
    items: [
      {
        productId: 'furn-6',
        productName: 'Stem Floor Lamp',
        quantity: 1,
        unitPrice: 780.0,
        total: 780.0,
      },
      {
        productId: 'furn-9',
        productName: 'Trace Side Table',
        quantity: 1,
        unitPrice: 920.0,
        total: 920.0,
      },
      {
        productId: 'furn-14',
        productName: 'Weave Throw Blanket',
        quantity: 1,
        unitPrice: 245.0,
        total: 245.0,
      },
    ],
    subtotal: 1_945.0,
    shipping: 0,
    tax: 165.33,
    total: 2_110.33,
    status: 'shipped',
    paymentMethod: 'apple_pay',
    createdAt: '2026-02-08T10:20:00Z',
    updatedAt: '2026-02-11T16:45:00Z',
  },
  {
    id: 'furn-ord-3',
    orderNumber: 'SS-2026-0103',
    customerId: 'furn-cust-3',
    customerName: 'Mika Tanaka',
    customerEmail: 'mika.t@example.com',
    items: [
      {
        productId: 'furn-8',
        productName: 'Slab Dining Table',
        quantity: 1,
        unitPrice: 5_600.0,
        total: 5_600.0,
      },
      {
        productId: 'furn-2',
        productName: 'Pebble Dining Chair',
        quantity: 6,
        unitPrice: 485.0,
        total: 2_910.0,
      },
    ],
    subtotal: 8_510.0,
    shipping: 0,
    tax: 723.35,
    total: 9_233.35,
    status: 'processing',
    paymentMethod: 'bank_transfer',
    createdAt: '2026-02-22T09:15:00Z',
    updatedAt: '2026-02-22T09:15:00Z',
  },
  {
    id: 'furn-ord-4',
    orderNumber: 'SS-2026-0104',
    customerId: 'furn-cust-5',
    customerName: 'Camille Dubois',
    customerEmail: 'camille.d@example.com',
    items: [
      {
        productId: 'furn-3',
        productName: 'Drift Sofa \u2014 3 Seat',
        quantity: 1,
        unitPrice: 4_200.0,
        total: 4_200.0,
      },
      {
        productId: 'furn-5',
        productName: 'Halo Pendant Light',
        quantity: 2,
        unitPrice: 1_120.0,
        total: 2_240.0,
      },
      {
        productId: 'furn-13',
        productName: 'Form Ceramic Vase',
        quantity: 3,
        unitPrice: 185.0,
        total: 555.0,
      },
    ],
    subtotal: 6_995.0,
    shipping: 0,
    tax: 594.58,
    total: 7_589.58,
    status: 'delivered',
    paymentMethod: 'credit_card',
    createdAt: '2025-12-28T13:40:00Z',
    updatedAt: '2026-01-05T10:20:00Z',
  },
  {
    id: 'furn-ord-5',
    orderNumber: 'SS-2026-0105',
    customerId: 'furn-cust-4',
    customerName: "Liam O'Brien",
    customerEmail: 'liam.ob@example.com',
    items: [
      {
        productId: 'furn-10',
        productName: 'Ridge Writing Desk',
        quantity: 1,
        unitPrice: 1_450.0,
        total: 1_450.0,
      },
      {
        productId: 'furn-4',
        productName: 'Spine Counter Stool',
        quantity: 2,
        unitPrice: 395.0,
        total: 790.0,
      },
    ],
    subtotal: 2_240.0,
    shipping: 75.0,
    tax: 190.4,
    total: 2_505.4,
    status: 'pending',
    paymentMethod: 'paypal',
    createdAt: '2026-02-25T08:00:00Z',
    updatedAt: '2026-02-25T08:00:00Z',
  },
  {
    id: 'furn-ord-6',
    orderNumber: 'SS-2026-0106',
    customerId: 'furn-cust-3',
    customerName: 'Mika Tanaka',
    customerEmail: 'mika.t@example.com',
    items: [
      {
        productId: 'furn-12',
        productName: 'Vault Credenza',
        quantity: 1,
        unitPrice: 3_200.0,
        total: 3_200.0,
      },
    ],
    subtotal: 3_200.0,
    shipping: 0,
    tax: 272.0,
    total: 3_472.0,
    status: 'cancelled',
    paymentMethod: 'apple_pay',
    createdAt: '2026-01-20T17:30:00Z',
    updatedAt: '2026-01-21T09:10:00Z',
  },
  {
    id: 'furn-ord-7',
    orderNumber: 'SS-2026-0107',
    customerId: 'furn-cust-1',
    customerName: 'Elena Vasquez',
    customerEmail: 'elena.v@example.com',
    items: [
      {
        productId: 'furn-11',
        productName: 'Column Bookshelf',
        quantity: 1,
        unitPrice: 1_680.0,
        total: 1_680.0,
      },
      {
        productId: 'furn-14',
        productName: 'Weave Throw Blanket',
        quantity: 2,
        unitPrice: 245.0,
        total: 490.0,
      },
    ],
    subtotal: 2_170.0,
    shipping: 0,
    tax: 184.45,
    total: 2_354.45,
    status: 'refunded',
    paymentMethod: 'credit_card',
    createdAt: '2025-12-05T11:00:00Z',
    updatedAt: '2025-12-15T14:30:00Z',
  },
];

export const reviews: Review[] = [
  {
    id: 'furn-rev-1',
    productId: 'furn-1',
    productName: 'Arc Lounge Chair',
    customerId: 'furn-cust-1',
    customerName: 'Elena Vasquez',
    rating: 5,
    title: 'A piece of art you can sit in',
    body: "The curve of the back is stunning in person \u2014 photos don't do it justice. The boucl\u00e9 is incredibly soft and the oak has a beautiful grain. I bought two and they anchor my entire living room.",
    isVerified: true,
    createdAt: '2026-01-25T14:00:00Z',
  },
  {
    id: 'furn-rev-2',
    productId: 'furn-8',
    productName: 'Slab Dining Table',
    customerId: 'furn-cust-5',
    customerName: 'Camille Dubois',
    rating: 5,
    title: 'The centerpiece of our home',
    body: 'Every guest comments on this table. The live edge is dramatic without being rustic \u2014 the blackened steel base keeps it modern. Worth the investment and the 8-week wait.',
    isVerified: true,
    createdAt: '2026-01-08T09:30:00Z',
  },
  {
    id: 'furn-rev-3',
    productId: 'furn-5',
    productName: 'Halo Pendant Light',
    customerId: 'furn-cust-3',
    customerName: 'Mika Tanaka',
    rating: 5,
    title: 'Perfect warm glow',
    body: 'Hung this over our dining table and the light it casts is beautiful \u2014 warm and even, no harsh spots. The brushed brass patinas slightly over time which I love. Installation was straightforward.',
    isVerified: true,
    createdAt: '2026-02-12T16:45:00Z',
  },
  {
    id: 'furn-rev-4',
    productId: 'furn-2',
    productName: 'Pebble Dining Chair',
    customerId: 'furn-cust-2',
    customerName: 'Thomas Eriksen',
    rating: 4,
    title: 'Beautiful but firm',
    body: "The shape is gorgeous and I love that they're made from recycled plastic. They're on the firm side for long dinners though \u2014 consider a seat cushion. The Fog color is perfect.",
    isVerified: true,
    createdAt: '2026-02-15T11:15:00Z',
  },
  {
    id: 'furn-rev-5',
    productId: 'furn-12',
    productName: 'Vault Credenza',
    customerId: 'furn-cust-3',
    customerName: 'Mika Tanaka',
    rating: 2,
    title: 'Arrived with a damaged door',
    body: 'The design is stunning but one of the fluted doors arrived with a crack. Customer service was responsive and is sending a replacement, but disappointing for a $3,200 piece. Updating review once resolved.',
    isVerified: true,
    createdAt: '2026-01-22T08:00:00Z',
  },
  {
    id: 'furn-rev-6',
    productId: 'furn-10',
    productName: 'Ridge Writing Desk',
    customerId: 'furn-cust-4',
    customerName: "Liam O'Brien",
    rating: 5,
    title: 'Finally, a beautiful desk with cable management',
    body: 'The cable channel on the back is genius \u2014 keeps everything clean. The single drawer is perfectly sized for a laptop. White oak grain is gorgeous. Brass leg tips are a nice detail.',
    isVerified: true,
    createdAt: '2026-02-26T10:00:00Z',
  },
  {
    id: 'furn-rev-7',
    productId: 'furn-3',
    productName: 'Drift Sofa \u2014 3 Seat',
    customerId: 'furn-cust-5',
    customerName: 'Camille Dubois',
    rating: 5,
    title: 'Cloud-like comfort, gallery-worthy looks',
    body: 'The down-filled cushions are impossibly comfortable and the stonewashed linen gets softer with use. The walnut base elevates it above typical sofas. We\u2019re already planning to add the chaise section.',
    isVerified: true,
    createdAt: '2026-01-15T17:30:00Z',
  },
  {
    id: 'furn-rev-8',
    productId: 'furn-13',
    productName: 'Form Ceramic Vase',
    customerId: 'furn-cust-2',
    customerName: 'Thomas Eriksen',
    rating: 3,
    title: 'Smaller than expected',
    body: 'The glaze is beautiful and each one truly is unique. But at 14" it felt smaller than I imagined from the photos. Lovely as a shelf object but won\'t hold a large arrangement. Nice quality for the price.',
    isVerified: false,
    createdAt: '2026-01-30T14:20:00Z',
  },
];

export const cartItems: CartItem[] = [
  {
    id: 'furn-cart-1',
    productId: 'furn-4',
    productName: 'Spine Counter Stool',
    image: 'https://picsum.photos/seed/counter-stool/400/400',
    quantity: 3,
    unitPrice: 395.0,
    total: 1_185.0,
  },
  {
    id: 'furn-cart-2',
    productId: 'furn-7',
    productName: 'Orb Table Lamp',
    image: 'https://picsum.photos/seed/table-lamp/400/400',
    quantity: 2,
    unitPrice: 340.0,
    total: 680.0,
  },
  {
    id: 'furn-cart-3',
    productId: 'furn-14',
    productName: 'Weave Throw Blanket',
    image: 'https://picsum.photos/seed/throw-blanket/400/400',
    quantity: 1,
    unitPrice: 245.0,
    total: 245.0,
  },
];

export const cartSummary = {
  itemCount: 6,
  subtotal: 2_110.0,
  shipping: 0,
  tax: 179.35,
  total: 2_289.35,
};

export const storeSummary: StoreSummary = {
  totalRevenue: 187_420.0,
  totalOrders: 94,
  totalCustomers: 68,
  totalProducts: 14,
  averageOrderValue: 1_993.83,
  conversionRate: 2.4,
  revenueByMonth: [
    {month: 'Sep', revenue: 22_800},
    {month: 'Oct', revenue: 28_150},
    {month: 'Nov', revenue: 34_600},
    {month: 'Dec', revenue: 41_200},
    {month: 'Jan', revenue: 35_870},
    {month: 'Feb', revenue: 24_800},
  ],
  topCategories: [
    {category: 'Seating', revenue: 68_400, orders: 32},
    {category: 'Tables', revenue: 45_200, orders: 18},
    {category: 'Lighting', revenue: 32_800, orders: 22},
    {category: 'Storage', revenue: 24_600, orders: 12},
    {category: 'Decor', revenue: 16_420, orders: 10},
  ],
};

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
