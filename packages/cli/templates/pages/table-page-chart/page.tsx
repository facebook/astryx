// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  VStack,
  HStack,
  StackItem,
  Layout,
  LayoutContent,
  LayoutHeader,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Icon} from '@astryxdesign/core/Icon';
import {Badge} from '@astryxdesign/core/Badge';
import {Link} from '@astryxdesign/core/Link';
import {Thumbnail} from '@astryxdesign/core/Thumbnail';
import {Table, proportional, pixel} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {Chart, ChartGrid, ChartAxis, area, line} from '@astryxdesign/charts';
import {
  FunnelIcon,
  ArrowDownTrayIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

// ============= DATA =============

type ProductCategory = 'Matcha' | 'Coffee' | 'Tea' | 'Smoothie' | 'Specialty';

interface OrderRow extends Record<string, unknown> {
  id: string;
  customer: string;
  email: string;
  product: string;
  category: ProductCategory;
  imageIndex: number;
  amount: number;
  status: 'completed' | 'processing' | 'shipped' | 'refunded';
  date: string;
}

const PRODUCTS = [
  {
    name: 'Ceremonial Matcha Latte',
    category: 'Matcha' as ProductCategory,
    image: 'https://lookaside.facebook.com/assets/astryx/matcha-product-1.png',
    price: 6,
  },
  {
    name: 'Oat Milk Cappuccino',
    category: 'Coffee' as ProductCategory,
    image: 'https://lookaside.facebook.com/assets/astryx/matcha-product-2.png',
    price: 5,
  },
  {
    name: 'Jasmine Green Tea',
    category: 'Tea' as ProductCategory,
    image: 'https://lookaside.facebook.com/assets/astryx/matcha-product-3.png',
    price: 4,
  },
  {
    name: 'Mango Matcha Smoothie',
    category: 'Smoothie' as ProductCategory,
    image: 'https://lookaside.facebook.com/assets/astryx/matcha-product-4.png',
    price: 8,
  },
  {
    name: 'Hojicha Latte',
    category: 'Specialty' as ProductCategory,
    image: 'https://lookaside.facebook.com/assets/astryx/matcha-product-5.png',
    price: 7,
  },
  {
    name: 'Iced Yuzu Matcha',
    category: 'Matcha' as ProductCategory,
    image: 'https://lookaside.facebook.com/assets/astryx/matcha-product-6.png',
    price: 7,
  },
];

const orders: OrderRow[] = [
  {
    id: 'ORD-1001',
    customer: 'Sarah Chen',
    email: 'sarah.chen@acme.co',
    product: PRODUCTS[0].name,
    category: PRODUCTS[0].category,
    imageIndex: 0,
    amount: 6,
    status: 'completed',
    date: '2025-01-15',
  },
  {
    id: 'ORD-1002',
    customer: 'Marcus Rivera',
    email: 'mrivera@globex.com',
    product: PRODUCTS[1].name,
    category: PRODUCTS[1].category,
    imageIndex: 1,
    amount: 5,
    status: 'completed',
    date: '2025-01-15',
  },
  {
    id: 'ORD-1003',
    customer: 'Aisha Patel',
    email: 'aisha.p@initech.io',
    product: PRODUCTS[2].name,
    category: PRODUCTS[2].category,
    imageIndex: 2,
    amount: 4,
    status: 'shipped',
    date: '2025-01-14',
  },
  {
    id: 'ORD-1004',
    customer: "James O'Brien",
    email: 'jobrien@umbrella.net',
    product: PRODUCTS[3].name,
    category: PRODUCTS[3].category,
    imageIndex: 3,
    amount: 8,
    status: 'processing',
    date: '2025-01-14',
  },
  {
    id: 'ORD-1005',
    customer: 'Yuki Tanaka',
    email: 'yuki@soylent.jp',
    product: PRODUCTS[4].name,
    category: PRODUCTS[4].category,
    imageIndex: 4,
    amount: 7,
    status: 'completed',
    date: '2025-01-13',
  },
  {
    id: 'ORD-1006',
    customer: 'Elena Volkov',
    email: 'elena.v@wayne.com',
    product: PRODUCTS[5].name,
    category: PRODUCTS[5].category,
    imageIndex: 5,
    amount: 7,
    status: 'refunded',
    date: '2025-01-13',
  },
  {
    id: 'ORD-1007',
    customer: 'David Kim',
    email: 'dkim@stark.io',
    product: PRODUCTS[0].name,
    category: PRODUCTS[0].category,
    imageIndex: 0,
    amount: 6,
    status: 'completed',
    date: '2025-01-12',
  },
  {
    id: 'ORD-1008',
    customer: 'Fatima Al-Rashid',
    email: 'fatima@oscorp.ae',
    product: PRODUCTS[1].name,
    category: PRODUCTS[1].category,
    imageIndex: 1,
    amount: 5,
    status: 'shipped',
    date: '2025-01-12',
  },
  {
    id: 'ORD-1009',
    customer: 'Lucas Andersson',
    email: 'lucas.a@cyberdyne.se',
    product: PRODUCTS[2].name,
    category: PRODUCTS[2].category,
    imageIndex: 2,
    amount: 4,
    status: 'completed',
    date: '2025-01-11',
  },
  {
    id: 'ORD-1010',
    customer: 'Priya Sharma',
    email: 'priya@aperture.in',
    product: PRODUCTS[3].name,
    category: PRODUCTS[3].category,
    imageIndex: 3,
    amount: 8,
    status: 'processing',
    date: '2025-01-11',
  },
  {
    id: 'ORD-1011',
    customer: 'Noah Williams',
    email: 'noah.w@massive.com',
    product: PRODUCTS[4].name,
    category: PRODUCTS[4].category,
    imageIndex: 4,
    amount: 7,
    status: 'completed',
    date: '2025-01-10',
  },
  {
    id: 'ORD-1012',
    customer: 'Sofia Garcia',
    email: 'sgarcia@tyrell.mx',
    product: PRODUCTS[5].name,
    category: PRODUCTS[5].category,
    imageIndex: 5,
    amount: 7,
    status: 'completed',
    date: '2025-01-10',
  },
  {
    id: 'ORD-1013',
    customer: 'Oliver Brown',
    email: 'oliver.b@weyland.uk',
    product: PRODUCTS[0].name,
    category: PRODUCTS[0].category,
    imageIndex: 0,
    amount: 6,
    status: 'shipped',
    date: '2025-01-09',
  },
  {
    id: 'ORD-1014',
    customer: 'Mei Lin',
    email: 'mei.lin@choam.cn',
    product: PRODUCTS[1].name,
    category: PRODUCTS[1].category,
    imageIndex: 1,
    amount: 5,
    status: 'completed',
    date: '2025-01-09',
  },
  {
    id: 'ORD-1015',
    customer: 'Hassan Ahmed',
    email: 'hahmed@abstergo.eg',
    product: PRODUCTS[2].name,
    category: PRODUCTS[2].category,
    imageIndex: 2,
    amount: 4,
    status: 'refunded',
    date: '2025-01-08',
  },
  {
    id: 'ORD-1016',
    customer: 'Isabella Rossi',
    email: 'irossi@genom.it',
    product: PRODUCTS[3].name,
    category: PRODUCTS[3].category,
    imageIndex: 3,
    amount: 8,
    status: 'completed',
    date: '2025-01-08',
  },
  {
    id: 'ORD-1017',
    customer: 'Liam Murphy',
    email: 'liam.m@mishima.ie',
    product: PRODUCTS[4].name,
    category: PRODUCTS[4].category,
    imageIndex: 4,
    amount: 7,
    status: 'processing',
    date: '2025-01-07',
  },
  {
    id: 'ORD-1018',
    customer: 'Chloe Dubois',
    email: 'cdubois@armacham.fr',
    product: PRODUCTS[5].name,
    category: PRODUCTS[5].category,
    imageIndex: 5,
    amount: 7,
    status: 'completed',
    date: '2025-01-07',
  },
  {
    id: 'ORD-1019',
    customer: 'Andre Santos',
    email: 'asantos@shinra.br',
    product: PRODUCTS[0].name,
    category: PRODUCTS[0].category,
    imageIndex: 0,
    amount: 6,
    status: 'shipped',
    date: '2025-01-06',
  },
  {
    id: 'ORD-1020',
    customer: 'Nina Johansson',
    email: 'nina.j@lexcorp.se',
    product: PRODUCTS[1].name,
    category: PRODUCTS[1].category,
    imageIndex: 1,
    amount: 5,
    status: 'completed',
    date: '2025-01-06',
  },
  {
    id: 'ORD-1021',
    customer: 'Raj Kapoor',
    email: 'raj.k@vaultec.in',
    product: PRODUCTS[2].name,
    category: PRODUCTS[2].category,
    imageIndex: 2,
    amount: 4,
    status: 'completed',
    date: '2025-01-05',
  },
  {
    id: 'ORD-1022',
    customer: 'Emma Thompson',
    email: 'ethompson@monarch.uk',
    product: PRODUCTS[3].name,
    category: PRODUCTS[3].category,
    imageIndex: 3,
    amount: 8,
    status: 'completed',
    date: '2025-01-05',
  },
  {
    id: 'ORD-1023',
    customer: 'Carlos Mendez',
    email: 'cmendez@sirius.ar',
    product: PRODUCTS[4].name,
    category: PRODUCTS[4].category,
    imageIndex: 4,
    amount: 7,
    status: 'shipped',
    date: '2025-01-04',
  },
  {
    id: 'ORD-1024',
    customer: 'Zoe Mitchell',
    email: 'zoe.m@hyperion.au',
    product: PRODUCTS[5].name,
    category: PRODUCTS[5].category,
    imageIndex: 5,
    amount: 7,
    status: 'processing',
    date: '2025-01-04',
  },
  {
    id: 'ORD-1025',
    customer: 'Henrik Larsson',
    email: 'hlarsson@volvo.se',
    product: PRODUCTS[0].name,
    category: PRODUCTS[0].category,
    imageIndex: 0,
    amount: 6,
    status: 'completed',
    date: '2025-01-03',
  },
  {
    id: 'ORD-1026',
    customer: 'Amara Okafor',
    email: 'aokafor@wakanda.ng',
    product: PRODUCTS[1].name,
    category: PRODUCTS[1].category,
    imageIndex: 1,
    amount: 5,
    status: 'completed',
    date: '2025-01-03',
  },
  {
    id: 'ORD-1027',
    customer: 'Leo Fischer',
    email: 'lfischer@kruger.de',
    product: PRODUCTS[2].name,
    category: PRODUCTS[2].category,
    imageIndex: 2,
    amount: 4,
    status: 'completed',
    date: '2025-01-02',
  },
  {
    id: 'ORD-1028',
    customer: 'Maya Petrov',
    email: 'mpetrov@kaiba.ru',
    product: PRODUCTS[3].name,
    category: PRODUCTS[3].category,
    imageIndex: 3,
    amount: 8,
    status: 'shipped',
    date: '2025-01-02',
  },
  {
    id: 'ORD-1029',
    customer: 'Tomás Herrera',
    email: 'therrera@nexus.co',
    product: PRODUCTS[4].name,
    category: PRODUCTS[4].category,
    imageIndex: 4,
    amount: 7,
    status: 'completed',
    date: '2025-01-01',
  },
  {
    id: 'ORD-1030',
    customer: 'Grace Nakamura',
    email: 'gnakamura@capsule.jp',
    product: PRODUCTS[5].name,
    category: PRODUCTS[5].category,
    imageIndex: 5,
    amount: 7,
    status: 'completed',
    date: '2025-01-01',
  },
];

const revenueData = [
  {date: 'Jan 1', revenue: 84},
  {date: 'Jan 2', revenue: 72},
  {date: 'Jan 3', revenue: 91},
  {date: 'Jan 4', revenue: 68},
  {date: 'Jan 5', revenue: 105},
  {date: 'Jan 6', revenue: 118},
  {date: 'Jan 7', revenue: 96},
  {date: 'Jan 8', revenue: 132},
  {date: 'Jan 9', revenue: 110},
  {date: 'Jan 10', revenue: 98},
  {date: 'Jan 11', revenue: 125},
  {date: 'Jan 12', revenue: 142},
  {date: 'Jan 13', revenue: 108},
  {date: 'Jan 14', revenue: 156},
  {date: 'Jan 15', revenue: 138},
];

const statusColor: Record<string, 'green' | 'blue' | 'orange' | 'red'> = {
  completed: 'green',
  shipped: 'blue',
  processing: 'orange',
  refunded: 'red',
};

const columns: TableColumn<OrderRow>[] = [
  {
    key: 'id',
    header: 'Order',
    width: pixel(110),
    renderCell: (item: OrderRow) => (
      <Link href="#" isStandalone>
        {item.id}
      </Link>
    ),
  },
  {
    key: 'product',
    header: 'Product',
    width: proportional(3),
    renderCell: (item: OrderRow) => (
      <HStack gap={3} vAlign="center">
        <Thumbnail
          src={PRODUCTS[item.imageIndex].image}
          alt={item.product}
          label={item.product}
          style={{width: 36, height: 36, flexShrink: 0}}
        />
        <VStack gap={0}>
          <Text type="body">{item.product}</Text>
          <Text type="supporting" color="secondary">
            {item.category}
          </Text>
        </VStack>
      </HStack>
    ),
  },
  {
    key: 'amount',
    header: 'Amount',
    width: pixel(90),
    renderCell: (item: OrderRow) => <Text type="body">${item.amount}</Text>,
  },
  {
    key: 'customer',
    header: 'Customer',
    width: proportional(2),
    renderCell: (item: OrderRow) => <Text type="body">{item.customer}</Text>,
  },
  {
    key: 'email',
    header: 'Email',
    width: proportional(2),
    renderCell: (item: OrderRow) => <Text type="body">{item.email}</Text>,
  },
  {
    key: 'status',
    header: 'Status',
    width: pixel(120),
    renderCell: (item: OrderRow) => (
      <Badge
        label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        variant={statusColor[item.status]}
      />
    ),
  },
  {
    key: 'date',
    header: 'Date',
    width: pixel(110),
    renderCell: (item: OrderRow) => <Text type="body">{item.date}</Text>,
  },
];

// ============= PAGE =============

export default function TablePageChartTemplate() {
  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Heading level={1}>Sales</Heading>
            </StackItem>
            <IconButton
              label="Filter"
              icon={<Icon icon={FunnelIcon} size="sm" />}
              variant="ghost"
            />
            <IconButton
              label="Export"
              icon={<Icon icon={ArrowDownTrayIcon} size="sm" />}
              variant="ghost"
            />
            <Button
              label="New order"
              icon={<Icon icon={PlusIcon} size="sm" />}
            />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={3}>
          <VStack gap={4}>
            <Chart
              data={revenueData}
              xKey="date"
              series={[
                area('revenue', {color: '#14b8a6', gradient: true}),
                line('revenue', {color: '#14b8a6'}),
              ]}
              grid={<ChartGrid horizontal />}
              axes={
                <>
                  <ChartAxis position="bottom" />
                  <ChartAxis
                    position="left"
                    tickFormat={(v: unknown) => `$${v}`}
                  />
                </>
              }
              height={280}
              margin={{left: 40, right: 10, top: 10, bottom: 30}}
            />

            <Table<OrderRow>
              data={orders}
              columns={columns}
              idKey="id"
              density="balanced"
              dividers="rows"
              hasHover
            />
          </VStack>
        </LayoutContent>
      }
    />
  );
}
