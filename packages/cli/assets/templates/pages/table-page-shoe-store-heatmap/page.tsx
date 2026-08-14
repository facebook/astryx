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

type ProductCategory =
  'Running' | 'Lifestyle' | 'Basketball' | 'Training' | 'Skateboarding';

function shoeSvg(bg: string, accent: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="${bg}"/><g transform="translate(22.5, 22.5) scale(2.29)" fill="none" stroke="${accent}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 10.42 4.8-5.07"/><path d="M19 18h3"/><path d="M9.5 22 21.414 9.415A2 2 0 0 0 21.2 6.4l-5.61-4.208A1 1 0 0 0 14 3v2a2 2 0 0 1-1.394 1.906L8.677 8.053A1 1 0 0 0 8 9c-.155 6.393-2.082 9-4 9a2 2 0 0 0 0 4h14"/></g></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

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
    name: 'Air Max 90',
    category: 'Lifestyle' as ProductCategory,
    image: shoeSvg('#FDE68A', '#DC2626'),
    price: 130,
  },
  {
    name: 'UltraBoost 22',
    category: 'Running' as ProductCategory,
    image: shoeSvg('#DBEAFE', '#1E40AF'),
    price: 190,
  },
  {
    name: 'Old Skool',
    category: 'Skateboarding' as ProductCategory,
    image: shoeSvg('#FED7AA', '#EA580C'),
    price: 70,
  },
  {
    name: 'Jordan 1 Retro',
    category: 'Basketball' as ProductCategory,
    image: shoeSvg('#E5E7EB', '#111827'),
    price: 180,
  },
  {
    name: 'Metcon 8',
    category: 'Training' as ProductCategory,
    image: shoeSvg('#FEE2E2', '#991B1B'),
    price: 140,
  },
  {
    name: 'Dunk Low',
    category: 'Skateboarding' as ProductCategory,
    image: shoeSvg('#D1FAE5', '#065F46'),
    price: 110,
  },
];

const orders: OrderRow[] = [
  // Sun (0) — spread across 9am–5pm, very hot
  {
    id: 'ORD-1001',
    customer: 'Sarah Chen',
    email: 'sarah.chen@acme.co',
    product: PRODUCTS[0].name,
    category: PRODUCTS[0].category,
    imageIndex: 0,
    amount: 130,
    status: 'completed',
    date: '2025-01-12',
  },
  {
    id: 'ORD-1002',
    customer: 'Marcus Rivera',
    email: 'mrivera@globex.com',
    product: PRODUCTS[1].name,
    category: PRODUCTS[1].category,
    imageIndex: 1,
    amount: 190,
    status: 'completed',
    date: '2025-01-12',
  },
  {
    id: 'ORD-1003',
    customer: 'Aisha Patel',
    email: 'aisha.p@initech.io',
    product: PRODUCTS[2].name,
    category: PRODUCTS[2].category,
    imageIndex: 2,
    amount: 70,
    status: 'shipped',
    date: '2025-01-12',
  },
  {
    id: 'ORD-1004',
    customer: "James O'Brien",
    email: 'jobrien@umbrella.net',
    product: PRODUCTS[3].name,
    category: PRODUCTS[3].category,
    imageIndex: 3,
    amount: 180,
    status: 'processing',
    date: '2025-01-12',
  },
  {
    id: 'ORD-1005',
    customer: 'Yuki Tanaka',
    email: 'yuki@soylent.jp',
    product: PRODUCTS[4].name,
    category: PRODUCTS[4].category,
    imageIndex: 4,
    amount: 140,
    status: 'completed',
    date: '2025-01-12',
  },
  {
    id: 'ORD-1006',
    customer: 'Elena Volkov',
    email: 'elena.v@wayne.com',
    product: PRODUCTS[5].name,
    category: PRODUCTS[5].category,
    imageIndex: 5,
    amount: 110,
    status: 'completed',
    date: '2025-01-12',
  },
  {
    id: 'ORD-1007',
    customer: 'David Kim',
    email: 'dkim@stark.io',
    product: PRODUCTS[0].name,
    category: PRODUCTS[0].category,
    imageIndex: 0,
    amount: 130,
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
    amount: 190,
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
    amount: 70,
    status: 'completed',
    date: '2025-01-12',
  },
  {
    id: 'ORD-1010',
    customer: 'Priya Sharma',
    email: 'priya@aperture.in',
    product: PRODUCTS[3].name,
    category: PRODUCTS[3].category,
    imageIndex: 3,
    amount: 180,
    status: 'completed',
    date: '2025-01-12',
  },
  {
    id: 'ORD-1011',
    customer: 'Noah Williams',
    email: 'noah.w@massive.com',
    product: PRODUCTS[4].name,
    category: PRODUCTS[4].category,
    imageIndex: 4,
    amount: 140,
    status: 'completed',
    date: '2025-01-12',
  },
  {
    id: 'ORD-1012',
    customer: 'Sofia Garcia',
    email: 'sgarcia@tyrell.mx',
    product: PRODUCTS[5].name,
    category: PRODUCTS[5].category,
    imageIndex: 5,
    amount: 110,
    status: 'completed',
    date: '2025-01-12',
  },
  {
    id: 'ORD-1013',
    customer: 'Oliver Brown',
    email: 'oliver.b@weyland.uk',
    product: PRODUCTS[0].name,
    category: PRODUCTS[0].category,
    imageIndex: 0,
    amount: 130,
    status: 'shipped',
    date: '2025-01-12',
  },
  {
    id: 'ORD-1014',
    customer: 'Mei Lin',
    email: 'mei.lin@choam.cn',
    product: PRODUCTS[1].name,
    category: PRODUCTS[1].category,
    imageIndex: 1,
    amount: 190,
    status: 'completed',
    date: '2025-01-12',
  },
  // Mon (1) — light-medium, midday into afternoon
  {
    id: 'ORD-1015',
    customer: 'Hassan Ahmed',
    email: 'hahmed@abstergo.eg',
    product: PRODUCTS[2].name,
    category: PRODUCTS[2].category,
    imageIndex: 2,
    amount: 70,
    status: 'refunded',
    date: '2025-01-13',
  },
  {
    id: 'ORD-1016',
    customer: 'Isabella Rossi',
    email: 'irossi@genom.it',
    product: PRODUCTS[3].name,
    category: PRODUCTS[3].category,
    imageIndex: 3,
    amount: 180,
    status: 'completed',
    date: '2025-01-13',
  },
  {
    id: 'ORD-1058',
    customer: 'Thiago Lima',
    email: 'tlima@shinra.br',
    product: PRODUCTS[4].name,
    category: PRODUCTS[4].category,
    imageIndex: 4,
    amount: 140,
    status: 'completed',
    date: '2025-01-13',
  },
  {
    id: 'ORD-1059',
    customer: 'Nadia Popov',
    email: 'npopov@kaiba.ro',
    product: PRODUCTS[5].name,
    category: PRODUCTS[5].category,
    imageIndex: 5,
    amount: 110,
    status: 'shipped',
    date: '2025-01-13',
  },
  // Tue (2) — afternoon concentrated: 2pm–5pm hot
  {
    id: 'ORD-1017',
    customer: 'Liam Murphy',
    email: 'liam.m@mishima.ie',
    product: PRODUCTS[4].name,
    category: PRODUCTS[4].category,
    imageIndex: 4,
    amount: 140,
    status: 'processing',
    date: '2025-01-14',
  },
  {
    id: 'ORD-1018',
    customer: 'Chloe Dubois',
    email: 'cdubois@armacham.fr',
    product: PRODUCTS[5].name,
    category: PRODUCTS[5].category,
    imageIndex: 5,
    amount: 110,
    status: 'completed',
    date: '2025-01-14',
  },
  {
    id: 'ORD-1019',
    customer: 'Andre Santos',
    email: 'asantos@shinra.br',
    product: PRODUCTS[0].name,
    category: PRODUCTS[0].category,
    imageIndex: 0,
    amount: 130,
    status: 'shipped',
    date: '2025-01-14',
  },
  {
    id: 'ORD-1020',
    customer: 'Nina Johansson',
    email: 'nina.j@lexcorp.se',
    product: PRODUCTS[1].name,
    category: PRODUCTS[1].category,
    imageIndex: 1,
    amount: 190,
    status: 'completed',
    date: '2025-01-14',
  },
  {
    id: 'ORD-1021',
    customer: 'Raj Kapoor',
    email: 'raj.k@vaultec.in',
    product: PRODUCTS[2].name,
    category: PRODUCTS[2].category,
    imageIndex: 2,
    amount: 70,
    status: 'completed',
    date: '2025-01-14',
  },
  {
    id: 'ORD-1022',
    customer: 'Emma Thompson',
    email: 'ethompson@monarch.uk',
    product: PRODUCTS[3].name,
    category: PRODUCTS[3].category,
    imageIndex: 3,
    amount: 180,
    status: 'completed',
    date: '2025-01-14',
  },
  {
    id: 'ORD-1023',
    customer: 'Carlos Mendez',
    email: 'cmendez@sirius.ar',
    product: PRODUCTS[4].name,
    category: PRODUCTS[4].category,
    imageIndex: 4,
    amount: 140,
    status: 'shipped',
    date: '2025-01-14',
  },
  {
    id: 'ORD-1024',
    customer: 'Zoe Mitchell',
    email: 'zoe.m@hyperion.au',
    product: PRODUCTS[5].name,
    category: PRODUCTS[5].category,
    imageIndex: 5,
    amount: 110,
    status: 'processing',
    date: '2025-01-14',
  },
  {
    id: 'ORD-1025',
    customer: 'Henrik Larsson',
    email: 'hlarsson@volvo.se',
    product: PRODUCTS[0].name,
    category: PRODUCTS[0].category,
    imageIndex: 0,
    amount: 130,
    status: 'completed',
    date: '2025-01-14',
  },
  // Wed (3) — light-medium, midday into afternoon
  {
    id: 'ORD-1026',
    customer: 'Amara Okafor',
    email: 'aokafor@wakanda.ng',
    product: PRODUCTS[1].name,
    category: PRODUCTS[1].category,
    imageIndex: 1,
    amount: 190,
    status: 'completed',
    date: '2025-01-15',
  },
  {
    id: 'ORD-1027',
    customer: 'Leo Fischer',
    email: 'lfischer@kruger.de',
    product: PRODUCTS[2].name,
    category: PRODUCTS[2].category,
    imageIndex: 2,
    amount: 70,
    status: 'completed',
    date: '2025-01-15',
  },
  {
    id: 'ORD-1028',
    customer: 'Maya Petrov',
    email: 'mpetrov@kaiba.ru',
    product: PRODUCTS[3].name,
    category: PRODUCTS[3].category,
    imageIndex: 3,
    amount: 180,
    status: 'shipped',
    date: '2025-01-15',
  },
  {
    id: 'ORD-1060',
    customer: 'Kai Nakamura',
    email: 'knakamura@capsule.jp',
    product: PRODUCTS[0].name,
    category: PRODUCTS[0].category,
    imageIndex: 0,
    amount: 130,
    status: 'completed',
    date: '2025-01-15',
  },
  {
    id: 'ORD-1061',
    customer: 'Elisa Moretti',
    email: 'emoretti@genom.it',
    product: PRODUCTS[4].name,
    category: PRODUCTS[4].category,
    imageIndex: 4,
    amount: 140,
    status: 'completed',
    date: '2025-01-15',
  },
  // Thu (4) — afternoon concentrated: 1pm–5pm hot
  {
    id: 'ORD-1029',
    customer: 'Tomás Herrera',
    email: 'therrera@nexus.co',
    product: PRODUCTS[4].name,
    category: PRODUCTS[4].category,
    imageIndex: 4,
    amount: 140,
    status: 'completed',
    date: '2025-01-09',
  },
  {
    id: 'ORD-1030',
    customer: 'Grace Nakamura',
    email: 'gnakamura@capsule.jp',
    product: PRODUCTS[5].name,
    category: PRODUCTS[5].category,
    imageIndex: 5,
    amount: 110,
    status: 'completed',
    date: '2025-01-09',
  },
  {
    id: 'ORD-1031',
    customer: 'Kenji Watanabe',
    email: 'kwatanabe@tyrell.jp',
    product: PRODUCTS[0].name,
    category: PRODUCTS[0].category,
    imageIndex: 0,
    amount: 130,
    status: 'completed',
    date: '2025-01-09',
  },
  {
    id: 'ORD-1032',
    customer: 'Lucia Fernandez',
    email: 'lfernandez@nexus.es',
    product: PRODUCTS[1].name,
    category: PRODUCTS[1].category,
    imageIndex: 1,
    amount: 190,
    status: 'completed',
    date: '2025-01-09',
  },
  {
    id: 'ORD-1033',
    customer: 'Oscar Nilsson',
    email: 'onilsson@cyberdyne.se',
    product: PRODUCTS[2].name,
    category: PRODUCTS[2].category,
    imageIndex: 2,
    amount: 70,
    status: 'shipped',
    date: '2025-01-09',
  },
  {
    id: 'ORD-1034',
    customer: 'Dani Alves',
    email: 'dalves@globex.br',
    product: PRODUCTS[3].name,
    category: PRODUCTS[3].category,
    imageIndex: 3,
    amount: 180,
    status: 'completed',
    date: '2025-01-09',
  },
  {
    id: 'ORD-1035',
    customer: 'Rina Sato',
    email: 'rsato@soylent.jp',
    product: PRODUCTS[4].name,
    category: PRODUCTS[4].category,
    imageIndex: 4,
    amount: 140,
    status: 'completed',
    date: '2025-01-09',
  },
  {
    id: 'ORD-1036',
    customer: 'Ivan Petrov',
    email: 'ipetrov@kaiba.ru',
    product: PRODUCTS[5].name,
    category: PRODUCTS[5].category,
    imageIndex: 5,
    amount: 110,
    status: 'processing',
    date: '2025-01-09',
  },
  {
    id: 'ORD-1037',
    customer: 'Aiko Mori',
    email: 'amori@capsule.jp',
    product: PRODUCTS[0].name,
    category: PRODUCTS[0].category,
    imageIndex: 0,
    amount: 130,
    status: 'completed',
    date: '2025-01-09',
  },
  // Fri (5) — medium, early afternoon
  {
    id: 'ORD-1038',
    customer: 'Felix Braun',
    email: 'fbraun@kruger.de',
    product: PRODUCTS[1].name,
    category: PRODUCTS[1].category,
    imageIndex: 1,
    amount: 190,
    status: 'completed',
    date: '2025-01-10',
  },
  {
    id: 'ORD-1039',
    customer: 'Rosa Delgado',
    email: 'rdelgado@sirius.mx',
    product: PRODUCTS[2].name,
    category: PRODUCTS[2].category,
    imageIndex: 2,
    amount: 70,
    status: 'completed',
    date: '2025-01-10',
  },
  {
    id: 'ORD-1040',
    customer: 'Nils Eriksson',
    email: 'neriksson@volvo.se',
    product: PRODUCTS[3].name,
    category: PRODUCTS[3].category,
    imageIndex: 3,
    amount: 180,
    status: 'shipped',
    date: '2025-01-10',
  },
  {
    id: 'ORD-1041',
    customer: 'Suki Park',
    email: 'spark@stark.kr',
    product: PRODUCTS[4].name,
    category: PRODUCTS[4].category,
    imageIndex: 4,
    amount: 140,
    status: 'completed',
    date: '2025-01-10',
  },
  // Sat (6) — spread across 9am–6pm, very hot
  {
    id: 'ORD-1042',
    customer: 'Omar Haddad',
    email: 'ohaddad@oscorp.lb',
    product: PRODUCTS[5].name,
    category: PRODUCTS[5].category,
    imageIndex: 5,
    amount: 110,
    status: 'completed',
    date: '2025-01-11',
  },
  {
    id: 'ORD-1043',
    customer: 'Freya Jensen',
    email: 'fjensen@cyberdyne.dk',
    product: PRODUCTS[0].name,
    category: PRODUCTS[0].category,
    imageIndex: 0,
    amount: 130,
    status: 'shipped',
    date: '2025-01-11',
  },
  {
    id: 'ORD-1044',
    customer: 'Marco Bianchi',
    email: 'mbianchi@genom.it',
    product: PRODUCTS[1].name,
    category: PRODUCTS[1].category,
    imageIndex: 1,
    amount: 190,
    status: 'completed',
    date: '2025-01-11',
  },
  {
    id: 'ORD-1045',
    customer: 'Aya Tanaka',
    email: 'atanaka@capsule.jp',
    product: PRODUCTS[2].name,
    category: PRODUCTS[2].category,
    imageIndex: 2,
    amount: 70,
    status: 'completed',
    date: '2025-01-11',
  },
  {
    id: 'ORD-1046',
    customer: 'Lars Müller',
    email: 'lmuller@kruger.de',
    product: PRODUCTS[3].name,
    category: PRODUCTS[3].category,
    imageIndex: 3,
    amount: 180,
    status: 'completed',
    date: '2025-01-11',
  },
  {
    id: 'ORD-1047',
    customer: 'Mia Chang',
    email: 'mchang@aperture.tw',
    product: PRODUCTS[4].name,
    category: PRODUCTS[4].category,
    imageIndex: 4,
    amount: 140,
    status: 'processing',
    date: '2025-01-11',
  },
  {
    id: 'ORD-1048',
    customer: 'Petra Novak',
    email: 'pnovak@umbrella.cz',
    product: PRODUCTS[5].name,
    category: PRODUCTS[5].category,
    imageIndex: 5,
    amount: 110,
    status: 'completed',
    date: '2025-01-11',
  },
  {
    id: 'ORD-1049',
    customer: 'Tariq Osman',
    email: 'tosman@abstergo.eg',
    product: PRODUCTS[0].name,
    category: PRODUCTS[0].category,
    imageIndex: 0,
    amount: 130,
    status: 'completed',
    date: '2025-01-11',
  },
  {
    id: 'ORD-1050',
    customer: 'Lena Holm',
    email: 'lholm@lexcorp.se',
    product: PRODUCTS[1].name,
    category: PRODUCTS[1].category,
    imageIndex: 1,
    amount: 190,
    status: 'completed',
    date: '2025-01-11',
  },
  {
    id: 'ORD-1051',
    customer: 'Vera Costa',
    email: 'vcosta@shinra.pt',
    product: PRODUCTS[2].name,
    category: PRODUCTS[2].category,
    imageIndex: 2,
    amount: 70,
    status: 'shipped',
    date: '2025-01-11',
  },
  {
    id: 'ORD-1052',
    customer: 'Hugo Blanc',
    email: 'hblanc@armacham.fr',
    product: PRODUCTS[3].name,
    category: PRODUCTS[3].category,
    imageIndex: 3,
    amount: 180,
    status: 'completed',
    date: '2025-01-11',
  },
  {
    id: 'ORD-1053',
    customer: 'Ingrid Berg',
    email: 'iberg@volvo.no',
    product: PRODUCTS[4].name,
    category: PRODUCTS[4].category,
    imageIndex: 4,
    amount: 140,
    status: 'completed',
    date: '2025-01-11',
  },
  {
    id: 'ORD-1054',
    customer: 'Hana Kim',
    email: 'hkim@stark.kr',
    product: PRODUCTS[5].name,
    category: PRODUCTS[5].category,
    imageIndex: 5,
    amount: 110,
    status: 'completed',
    date: '2025-01-11',
  },
  {
    id: 'ORD-1055',
    customer: 'Axel Lindgren',
    email: 'alindgren@lexcorp.se',
    product: PRODUCTS[0].name,
    category: PRODUCTS[0].category,
    imageIndex: 0,
    amount: 130,
    status: 'shipped',
    date: '2025-01-11',
  },
  {
    id: 'ORD-1056',
    customer: 'Yara Mansour',
    email: 'ymansour@abstergo.lb',
    product: PRODUCTS[1].name,
    category: PRODUCTS[1].category,
    imageIndex: 1,
    amount: 190,
    status: 'completed',
    date: '2025-01-11',
  },
  {
    id: 'ORD-1057',
    customer: 'Dmitri Volkov',
    email: 'dvolkov@kaiba.ru',
    product: PRODUCTS[2].name,
    category: PRODUCTS[2].category,
    imageIndex: 2,
    amount: 70,
    status: 'completed',
    date: '2025-01-11',
  },
];

const revenueData = [
  {date: 'Jan 1', revenue: 5200},
  {date: 'Jan 2', revenue: 4800},
  {date: 'Jan 3', revenue: 6100},
  {date: 'Jan 4', revenue: 7400},
  {date: 'Jan 5', revenue: 5900},
  {date: 'Jan 6', revenue: 6800},
  {date: 'Jan 7', revenue: 7200},
  {date: 'Jan 8', revenue: 8300},
  {date: 'Jan 9', revenue: 6500},
  {date: 'Jan 10', revenue: 5400},
  {date: 'Jan 11', revenue: 7800},
  {date: 'Jan 12', revenue: 9200},
  {date: 'Jan 13', revenue: 6900},
  {date: 'Jan 14', revenue: 8600},
  {date: 'Jan 15', revenue: 7100},
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

export default function TablePageShoeStoreHeatmapTemplate() {
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
                area('revenue', {color: '#3b82f6', gradient: true}),
                line('revenue', {color: '#3b82f6'}),
              ]}
              grid={<ChartGrid horizontal />}
              axes={
                <>
                  <ChartAxis position="bottom" />
                  <ChartAxis
                    position="left"
                    tickFormat={(v: unknown) => `$${Number(v) / 1000}k`}
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
