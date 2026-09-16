// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * Information Maximalist — a portal home page that puts everything above the
 * fold.
 *
 * The frame is a content-only `Layout`: a two-row masthead, a scrolling
 * content well of stacked bands, a rail of ranked lists, and a link footer.
 * The density is the point. Where a dashboard spends its width on a few large
 * figures, a portal spends it on many small ones — headlines, ranks, prices,
 * a forecast and a service directory all reachable without a scroll or a
 * click. Every band is therefore sized to its text rather than to a grid of
 * equal cards, and nothing is hidden behind a disclosure that the eye would
 * have to open.
 *
 * Responsive in three steps, each one measured against the template's own
 * surface rather than the window (see {@link useSurfaceWidth}):
 *
 * - Wide (>= 1140px): the rail is a real `LayoutPanel` in the `end` slot,
 *   scrolling independently of the content well beside it.
 * - Medium (680–1139px): the rail folds into the bottom of the content well
 *   and spreads across up to three columns, so the ranked lists stay side by
 *   side instead of becoming one very long column.
 * - Narrow (< 680px): the masthead splits into two rows — wordmark and icon
 *   actions above, full-width search below — and the section run turns into a
 *   horizontally scrolling strip instead of wrapping to four ragged lines.
 *
 * Between those steps every band is a `Grid` keyed on a minimum child width,
 * so the columns reflow continuously rather than snapping at the breakpoints
 * above.
 *
 * All figures are fixtures: no clocks, no randomness, no fetching, so the
 * preview and any screenshot of it are byte-stable. Links are inert (`#`).
 */

import {useLayoutEffect, useRef, useState} from 'react';
import type {ReactNode} from 'react';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {Badge} from '@astryxdesign/core/Badge';
import {ClickableCard} from '@astryxdesign/core/ClickableCard';
import {Divider} from '@astryxdesign/core/Divider';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Item} from '@astryxdesign/core/Item';
import {
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  LayoutPanel,
} from '@astryxdesign/core/Layout';
import {Link} from '@astryxdesign/core/Link';
import {List, ListItem} from '@astryxdesign/core/List';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {ScrollableArea} from '@astryxdesign/core/ScrollableArea';
import {Section} from '@astryxdesign/core/Section';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {HStack, StackItem, VStack} from '@astryxdesign/core/Stack';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {Heading, Text} from '@astryxdesign/core/Text';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Thumbnail} from '@astryxdesign/core/Thumbnail';
import {Token} from '@astryxdesign/core/Token';
import type {IconType} from '@astryxdesign/core/Icon';
import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  Bars3Icon,
  BellIcon,
  BoltIcon,
  BriefcaseIcon,
  BuildingOffice2Icon,
  CakeIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  ChevronRightIcon,
  CloudIcon,
  CreditCardIcon,
  EnvelopeIcon,
  EyeIcon,
  FireIcon,
  GlobeAltIcon,
  HomeModernIcon,
  MagnifyingGlassIcon,
  MapIcon,
  NewspaperIcon,
  PaperAirplaneIcon,
  PuzzlePieceIcon,
  ShareIcon,
  ShoppingBagIcon,
  Squares2X2Icon,
  SunIcon,
  TagIcon,
  TicketIcon,
  TrophyIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

// =============================================================================
// Responsive thresholds
// =============================================================================

/**
 * Above this surface width the rail is a real panel beside the content; below
 * it the rail folds underneath. 1140 is where a 320px rail plus two 340px
 * content columns plus their gaps stop fitting, so the fold happens exactly
 * when the columns would otherwise start starving each other.
 */
const RAIL_MIN_SURFACE = 1140;

/**
 * Below this width the masthead splits into two rows and the section run
 * scrolls sideways. 680 is where the wordmark, a usable search field and the
 * account actions stop sharing one line without the field collapsing to a few
 * characters.
 */
const NARROW_SURFACE = 680;

/**
 * The width of the box this template was given, tracked as it changes.
 *
 * Every responsive decision here is a question about that box, not about the
 * window. The two agree only when the template owns the page — rendered into
 * the docsite's preview dialog, a split editor or a catalog card, `matchMedia`
 * describes a viewport the template can't see, and a rail sized from it lands
 * on top of the content instead of beside it.
 *
 * The first read is synchronous, inside `useLayoutEffect`, so the opening
 * frame is already laid out for the real width rather than snapping to it
 * after paint. Both reads are `offsetWidth`-based: `getBoundingClientRect`
 * reports the box as *painted*, so an ancestor `transform: scale()` is baked
 * into it, while a `ResizeObserver` reports the box as *laid out* and ignores
 * that transform. Mixing the two halves the answer inside any scaled preview.
 */
function useSurfaceWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }
    const {paddingInlineStart, paddingInlineEnd} = getComputedStyle(node);
    setWidth(
      node.offsetWidth -
        parseFloat(paddingInlineStart) -
        parseFloat(paddingInlineEnd),
    );

    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) {
        setWidth(entry.contentRect.width);
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

// =============================================================================
// Fixtures
// =============================================================================

/** The masthead's section run — a portal's whole surface area, spelled out. */
const SECTIONS: readonly string[] = [
  'News',
  'Weather',
  'Sports',
  'Finance',
  'Shopping',
  'Auctions',
  'Travel',
  'Maps',
  'Jobs',
  'Property',
  'Recipes',
  'Games',
];

interface ServiceTile {
  label: string;
  icon: IconType;
  /** Shown as a small count chip when the service has something waiting. */
  count?: string;
}

const SERVICES: readonly ServiceTile[] = [
  {label: 'Mail', icon: EnvelopeIcon, count: '3'},
  {label: 'News', icon: NewspaperIcon},
  {label: 'Weather', icon: CloudIcon},
  {label: 'Maps', icon: MapIcon},
  {label: 'Shopping', icon: ShoppingBagIcon, count: '2'},
  {label: 'Auctions', icon: TagIcon},
  {label: 'Finance', icon: BanknotesIcon},
  {label: 'Sports', icon: TrophyIcon},
  {label: 'Travel', icon: PaperAirplaneIcon},
  {label: 'Jobs', icon: BriefcaseIcon},
  {label: 'Property', icon: HomeModernIcon},
  {label: 'Recipes', icon: CakeIcon},
  {label: 'Cards', icon: CreditCardIcon},
  {label: 'Tickets', icon: TicketIcon},
  {label: 'Calendar', icon: CalendarDaysIcon},
  {label: 'Games', icon: PuzzlePieceIcon},
];

interface PickItem {
  title: string;
  meta: string;
  image: string;
  alt: string;
}

/** The photo strip: small square art beside a two-line caption. */
const PICKS: readonly PickItem[] = [
  {
    title: 'Six walks that end at a bakery',
    meta: 'Weekend · 8 min read',
    image: '/template-assets/light-lifestyle-horizontal-1.png',
    alt: 'Cyclist resting outside a corner bakery',
  },
  {
    title: 'What the new cooling rules mean for renters',
    meta: 'Explainer · 5 min read',
    image: '/template-assets/building.png',
    alt: 'Apartment block with exterior air handling units',
  },
  {
    title: 'A kitchen built for two square metres',
    meta: 'Home · 6 min read',
    image: '/template-assets/light-home-square-1.png',
    alt: 'Compact kitchen with open shelving',
  },
  {
    title: 'The night shift that keeps the trains moving',
    meta: 'Photo essay · 12 min read',
    image: '/template-assets/moody-working-horizontal-1.png',
    alt: 'Maintenance crew working on a rail platform at night',
  },
];

interface Headline {
  title: string;
  source: string;
  time: string;
  tag: string;
  comments: number;
}

interface TopicFeed {
  lead: {
    title: string;
    summary: string;
    source: string;
    time: string;
    image: string;
    alt: string;
    flag?: string;
  };
  headlines: readonly Headline[];
}

const TOPICS: readonly {id: string; label: string}[] = [
  {id: 'top', label: 'Top'},
  {id: 'domestic', label: 'Domestic'},
  {id: 'world', label: 'World'},
  {id: 'business', label: 'Business'},
  {id: 'tech', label: 'Tech'},
  {id: 'sports', label: 'Sports'},
  {id: 'life', label: 'Life'},
];

const FEEDS: Record<string, TopicFeed> = {
  top: {
    lead: {
      title: 'Rail operator adds 14 late-night services after commuter survey',
      summary:
        'The extra departures run Friday and Saturday from Central Terminal, and ticket gates on the three busiest platforms stay staffed until 01:30.',
      source: 'Kiosk Wire',
      time: '12:04',
      image: '/template-assets/moody-scene-horizontal-1.png',
      alt: 'Illuminated commuter train waiting at a platform',
      flag: 'Live',
    },
    headlines: [
      {
        title:
          'Grocery prices ease for a third month as vegetable supply recovers',
        source: 'Kiosk Wire',
        time: '11:52',
        tag: 'Economy',
        comments: 214,
      },
      {
        title: 'Harborview trials seawater cooling for its new data district',
        source: 'Northline Post',
        time: '11:30',
        tag: 'Tech',
        comments: 87,
      },
      {
        title: 'Two-year viaduct repair finishes nine weeks early',
        source: 'Kiosk Wire',
        time: '11:12',
        tag: 'Domestic',
        comments: 41,
      },
      {
        title:
          'Regulator asks parcel firms to publish delivery-window accuracy',
        source: 'Ledger Daily',
        time: '10:58',
        tag: 'Business',
        comments: 130,
      },
      {
        title: 'Storm front to bring heavy rain inland from Thursday evening',
        source: 'Kiosk Weather',
        time: '10:41',
        tag: 'Weather',
        comments: 62,
      },
      {
        title: 'National squad names 23 players for the autumn series',
        source: 'Sideline',
        time: '10:20',
        tag: 'Sports',
        comments: 508,
      },
    ],
  },
  domestic: {
    lead: {
      title:
        'Prefecture opens applications for its empty-home renovation grant',
      summary:
        'Up to 3,000 households can claim half of a renovation bill capped at $18,000, with priority for homes inside the three declining rail corridors.',
      source: 'Kiosk Wire',
      time: '11:58',
      image: '/template-assets/light-home-horizontal-1.png',
      alt: 'Terraced houses on a quiet residential street',
    },
    headlines: [
      {
        title: 'School lunch programme extends to two more districts in April',
        source: 'Kiosk Wire',
        time: '11:34',
        tag: 'Education',
        comments: 96,
      },
      {
        title: 'Night bus route 88 becomes permanent after nine-month trial',
        source: 'Northline Post',
        time: '11:05',
        tag: 'Transport',
        comments: 58,
      },
      {
        title: 'Flu vaccination bookings open online for over-65s',
        source: 'Kiosk Health',
        time: '10:47',
        tag: 'Health',
        comments: 33,
      },
      {
        title: 'City marathon lottery draws 142,000 entries for 28,000 places',
        source: 'Sideline',
        time: '10:22',
        tag: 'Sports',
        comments: 271,
      },
      {
        title: 'Coastal wind farm clears its final environmental review',
        source: 'Ledger Daily',
        time: '09:58',
        tag: 'Energy',
        comments: 148,
      },
      {
        title: 'Library network drops overdue fines on children’s loans',
        source: 'Kiosk Wire',
        time: '09:31',
        tag: 'Culture',
        comments: 24,
      },
    ],
  },
  world: {
    lead: {
      title: 'Port strike ends after operators agree to staffed-lane guarantee',
      summary:
        'Container backlogs at three terminals are expected to clear within eleven days; shipping lines have already withdrawn two congestion surcharges.',
      source: 'Meridian Desk',
      time: '11:49',
      image: '/template-assets/moody-scene-horizontal-2.png',
      alt: 'Container cranes at a working port',
    },
    headlines: [
      {
        title: 'Cross-border rail link enters its first month of paid service',
        source: 'Meridian Desk',
        time: '11:18',
        tag: 'Transport',
        comments: 77,
      },
      {
        title: 'Drought monitor lowers its alert level for the eastern basin',
        source: 'Kiosk Weather',
        time: '10:52',
        tag: 'Climate',
        comments: 45,
      },
      {
        title: 'Central bank holds rates and trims its growth forecast',
        source: 'Ledger Daily',
        time: '10:36',
        tag: 'Economy',
        comments: 302,
      },
      {
        title: 'Wheat exporters lift shipment estimates for a second quarter',
        source: 'Ledger Daily',
        time: '10:09',
        tag: 'Markets',
        comments: 61,
      },
      {
        title: 'Two cities sign a shared plan for cooling public squares',
        source: 'Meridian Desk',
        time: '09:44',
        tag: 'Cities',
        comments: 38,
      },
      {
        title: 'Undersea cable repair restores capacity a week ahead of plan',
        source: 'Northline Post',
        time: '09:20',
        tag: 'Tech',
        comments: 112,
      },
    ],
  },
  business: {
    lead: {
      title: 'Grocery chain buys 210 franchise stores to end its dual pricing',
      summary:
        'The $1.4bn deal folds independently run branches into the main network, and the company says shelf prices converge by the end of the third quarter.',
      source: 'Ledger Daily',
      time: '11:56',
      image: '/template-assets/light-working-horizontal-2.png',
      alt: 'Shop assistant restocking a supermarket aisle',
    },
    headlines: [
      {
        title: 'Parcel carrier reports its first profitable quarter since 2023',
        source: 'Ledger Daily',
        time: '11:41',
        tag: 'Earnings',
        comments: 54,
      },
      {
        title: 'Regional lender reopens 12 branches it closed two years ago',
        source: 'Ledger Daily',
        time: '11:14',
        tag: 'Banking',
        comments: 89,
      },
      {
        title: 'Airline adds a second daily slot on the Harborview route',
        source: 'Kiosk Wire',
        time: '10:50',
        tag: 'Travel',
        comments: 27,
      },
      {
        title: 'Chip packager commits $600m to a second inland plant',
        source: 'Northline Post',
        time: '10:27',
        tag: 'Industry',
        comments: 163,
      },
      {
        title: 'Retail wage floor rises 4.1% under the new sector agreement',
        source: 'Ledger Daily',
        time: '10:02',
        tag: 'Labour',
        comments: 341,
      },
      {
        title: 'Electricity rebate extended through the winter billing period',
        source: 'Kiosk Wire',
        time: '09:37',
        tag: 'Energy',
        comments: 205,
      },
    ],
  },
  tech: {
    lead: {
      title: 'Seawater cooling cuts a data hall’s power draw by 31% in testing',
      summary:
        'Harborview’s pilot loop ran through the hottest fortnight of the year without a fallback chiller; the operator publishes the full telemetry next month.',
      source: 'Northline Post',
      time: '11:47',
      image: '/template-assets/colorful-working-horizontal-2.png',
      alt: 'Engineer inspecting cooling pipework in a server hall',
    },
    headlines: [
      {
        title: 'Transit app ships offline timetables after commuter feedback',
        source: 'Northline Post',
        time: '11:22',
        tag: 'Apps',
        comments: 71,
      },
      {
        title: 'Open forecasting dataset adds 40 years of coastal readings',
        source: 'Kiosk Weather',
        time: '10:59',
        tag: 'Data',
        comments: 46,
      },
      {
        title: 'Handset maker promises seven years of security updates',
        source: 'Northline Post',
        time: '10:33',
        tag: 'Devices',
        comments: 258,
      },
      {
        title: 'Rail operator publishes its delay-prediction model as source',
        source: 'Kiosk Wire',
        time: '10:11',
        tag: 'Open source',
        comments: 134,
      },
      {
        title: 'Storage prices fall for a fourth consecutive quarter',
        source: 'Ledger Daily',
        time: '09:48',
        tag: 'Hardware',
        comments: 63,
      },
      {
        title: 'Two universities share a campus network research testbed',
        source: 'Northline Post',
        time: '09:25',
        tag: 'Research',
        comments: 19,
      },
    ],
  },
  sports: {
    lead: {
      title: 'Harborview hold on for a 2–1 win and a first away streak of four',
      summary:
        'A deflected free kick on 78 minutes settled a scrappy second half; the side travels to Northline on Saturday with a two-point cushion.',
      source: 'Sideline',
      time: '11:51',
      image: '/template-assets/colorful-lifestyle-horizontal-1.png',
      alt: 'Football supporters celebrating in a stadium stand',
      flag: 'Final',
    },
    headlines: [
      {
        title: 'Autumn series squad drops two veterans for uncapped forwards',
        source: 'Sideline',
        time: '11:26',
        tag: 'Rugby',
        comments: 486,
      },
      {
        title: 'Swimmer takes the 200m record by 0.34 seconds',
        source: 'Sideline',
        time: '11:03',
        tag: 'Swimming',
        comments: 92,
      },
      {
        title: 'Marathon course reroutes around the viaduct works',
        source: 'Kiosk Wire',
        time: '10:38',
        tag: 'Running',
        comments: 57,
      },
      {
        title: 'League approves a 26-team format from next season',
        source: 'Sideline',
        time: '10:15',
        tag: 'Football',
        comments: 613,
      },
      {
        title: 'Cyclist wins the hill stage after a 41km solo break',
        source: 'Sideline',
        time: '09:52',
        tag: 'Cycling',
        comments: 88,
      },
      {
        title: 'Basketball side signs a centre on a two-year deal',
        source: 'Sideline',
        time: '09:29',
        tag: 'Basketball',
        comments: 44,
      },
    ],
  },
  life: {
    lead: {
      title: 'The nine-litre pantry: cooking for one without the waste',
      summary:
        'Four cooks rebuild a week of dinners around a single shopping trip, and explain which three staples earn their shelf space in a small kitchen.',
      source: 'Kiosk Life',
      time: '11:44',
      image: '/template-assets/matcha-product-3.png',
      alt: 'Pantry staples arranged on a wooden counter',
    },
    headlines: [
      {
        title: 'A gardener’s case for planting the difficult corner last',
        source: 'Kiosk Life',
        time: '11:20',
        tag: 'Home',
        comments: 36,
      },
      {
        title: 'Five short hikes reachable on a single day ticket',
        source: 'Kiosk Life',
        time: '10:56',
        tag: 'Travel',
        comments: 74,
      },
      {
        title: 'What changed when the museum dropped its timed entry',
        source: 'Kiosk Life',
        time: '10:31',
        tag: 'Culture',
        comments: 51,
      },
      {
        title: 'Sleep clinic publishes a plain-language shift-work guide',
        source: 'Kiosk Health',
        time: '10:07',
        tag: 'Health',
        comments: 118,
      },
      {
        title: 'The repair café that fixed 1,900 kettles in one year',
        source: 'Northline Post',
        time: '09:41',
        tag: 'Community',
        comments: 82,
      },
      {
        title: 'A reading list for the long commute, chosen by drivers',
        source: 'Kiosk Life',
        time: '09:18',
        tag: 'Books',
        comments: 29,
      },
    ],
  },
};

interface TrendingTerm {
  term: string;
  /** Rank movement since the previous hourly cut. `0` means new to the list. */
  delta: number;
}

const TRENDING: readonly TrendingTerm[] = [
  {term: 'late-night rail timetable', delta: 3},
  {term: 'seawater cooling', delta: 0},
  {term: 'flu vaccine booking', delta: 1},
  {term: 'viaduct reopening', delta: -2},
  {term: 'autumn series squad', delta: 7},
  {term: 'vegetable prices', delta: -1},
  {term: 'storm front thursday', delta: 2},
  {term: 'empty-home grant', delta: 0},
  {term: 'delivery window rules', delta: -4},
  {term: 'night bus 88', delta: 5},
  {term: 'marathon lottery result', delta: -3},
  {term: 'electricity rebate', delta: 1},
];

interface MarketRow {
  name: string;
  value: string;
  change: string;
  isUp: boolean;
}

const MARKETS: readonly MarketRow[] = [
  {name: 'Composite 225', value: '38,942.16', change: '+0.84%', isUp: true},
  {name: 'Broad 500', value: '2,714.08', change: '+0.31%', isUp: true},
  {name: 'Tech 100', value: '17,308.55', change: '−0.62%', isUp: false},
  {name: 'Harborview REIT', value: '1,986.20', change: '+0.11%', isUp: true},
  {name: 'Gold, spot', value: '2,388.40', change: '−0.25%', isUp: false},
  {name: 'Crude oil', value: '79.18', change: '+1.42%', isUp: true},
];

interface ForecastDay {
  day: string;
  icon: IconType;
  summary: string;
  high: string;
  low: string;
  rain: string;
}

const FORECAST: readonly ForecastDay[] = [
  {
    day: 'Wed',
    icon: CloudIcon,
    summary: 'Cloudy',
    high: '24°',
    low: '18°',
    rain: '60%',
  },
  {
    day: 'Thu',
    icon: BoltIcon,
    summary: 'Storms',
    high: '21°',
    low: '17°',
    rain: '80%',
  },
  {
    day: 'Fri',
    icon: SunIcon,
    summary: 'Clear',
    high: '25°',
    low: '19°',
    rain: '10%',
  },
  {
    day: 'Sat',
    icon: SunIcon,
    summary: 'Clear',
    high: '27°',
    low: '20°',
    rain: '0%',
  },
];

interface BoardEntry {
  title: string;
  metric: string;
}

const BOARDS: Record<string, readonly BoardEntry[]> = {
  read: [
    {title: 'Late-night services return to six suburban lines', metric: '84k'},
    {title: 'Why vegetable prices fell three months running', metric: '61k'},
    {title: 'Empty-home grant: who qualifies, and when', metric: '55k'},
    {title: 'Squad list in full, with the two surprise calls', metric: '48k'},
    {title: 'Storm front timing, hour by hour', metric: '39k'},
    {title: 'The viaduct repair that beat its own schedule', metric: '31k'},
  ],
  shared: [
    {title: 'A kitchen built for two square metres', metric: '12.4k'},
    {title: 'Repair café fixed 1,900 kettles in a year', metric: '9.8k'},
    {title: 'Six walks that end at a bakery', metric: '8.1k'},
    {title: 'Night shift keeping the trains moving', metric: '7.6k'},
    {title: 'Library drops fines on children’s loans', metric: '6.2k'},
    {title: 'Museum after the timed entry ended', metric: '4.9k'},
  ],
  discussed: [
    {title: 'League approves a 26-team format', metric: '613'},
    {title: 'Retail wage floor rises 4.1%', metric: '341'},
    {title: 'Central bank holds and trims its forecast', metric: '302'},
    {title: 'Marathon lottery odds, explained', metric: '271'},
    {title: 'Seven years of security updates promised', metric: '258'},
    {title: 'Grocery prices and the supply recovery', metric: '214'},
  ],
};

const BOARD_TABS: readonly {id: string; label: string; icon: IconType}[] = [
  {id: 'read', label: 'Read', icon: EyeIcon},
  {id: 'shared', label: 'Shared', icon: ShareIcon},
  {id: 'discussed', label: 'Discussed', icon: ChatBubbleLeftRightIcon},
];

interface Deal {
  title: string;
  price: string;
  was: string;
  discount: string;
  note: string;
  image: string;
  alt: string;
}

const DEALS: readonly Deal[] = [
  {
    title: 'Over-ear headphones, active noise cancelling',
    price: '$184',
    was: '$248',
    discount: '−26%',
    note: 'Free delivery · 1,204 reviews',
    image: '/template-assets/Neutral-Headphones.png',
    alt: 'Grey over-ear headphones',
  },
  {
    title: 'Canvas daypack, 22 litre',
    price: '$62',
    was: '$79',
    discount: '−22%',
    note: 'In stock · 486 reviews',
    image: '/template-assets/Neutral-Backpack.png',
    alt: 'Beige canvas daypack',
  },
  {
    title: 'Vacuum tumbler, 500ml',
    price: '$27',
    was: '$34',
    discount: '−21%',
    note: 'Two colours · 2,918 reviews',
    image: '/template-assets/Neutral-Tumbler.png',
    alt: 'Stainless steel vacuum tumbler',
  },
  {
    title: 'Field watch, sapphire crystal',
    price: '$139',
    was: '$165',
    discount: '−16%',
    note: 'Ships Thursday · 331 reviews',
    image: '/template-assets/Neutral-Watch.png',
    alt: 'Field watch with a fabric strap',
  },
];

interface Listing {
  title: string;
  bids: number;
  ends: string;
  price: string;
  isClosing: boolean;
}

const LISTINGS: readonly Listing[] = [
  {
    title: 'Film camera, 50mm lens, working',
    bids: 14,
    ends: '19:40 today',
    price: '$96',
    isClosing: true,
  },
  {
    title: 'Oak drawer unit, four drawers',
    bids: 6,
    ends: 'Tomorrow 21:00',
    price: '$142',
    isClosing: false,
  },
  {
    title: 'Enamel kettle, 2.2 litre',
    bids: 21,
    ends: '20:15 today',
    price: '$38',
    isClosing: true,
  },
  {
    title: 'Touring bicycle, frame size 54',
    bids: 3,
    ends: 'Friday 18:30',
    price: '$310',
    isClosing: false,
  },
];

const FOOTER_LINKS: readonly string[] = [
  'About Kiosk',
  'Advertise',
  'Publisher index',
  'Editorial standards',
  'Corrections',
  'Accessibility',
  'Privacy',
  'Terms',
  'Cookie settings',
  'Help centre',
];

// =============================================================================
// Shared band furniture
// =============================================================================

interface BandProps {
  title: string;
  icon: IconType;
  /** Inert "see everything" affordance a portal band always carries. */
  moreLabel?: string;
  endContent?: ReactNode;
  children: ReactNode;
}

/**
 * One band of the portal: a labelled surface with a heading row.
 *
 * Bands are `Section`s rather than `Card`s so stacking a dozen of them does
 * not read as a dozen floating tiles — a portal is a single dense sheet.
 */
function Band({title, icon, moreLabel, endContent, children}: BandProps) {
  return (
    <Section variant="section" padding={3}>
      <VStack gap={2}>
        <HStack gap={2} align="center" justify="between">
          <HStack gap={1.5} align="center">
            <Icon icon={icon} size="sm" color="accent" />
            <Heading level={2} maxLines={1}>
              {title}
            </Heading>
          </HStack>
          {endContent}
          {moreLabel !== undefined && (
            <Link href="#" size="sm" weight="medium">
              {moreLabel}
            </Link>
          )}
        </HStack>
        <Divider isFullBleed />
        {children}
      </VStack>
    </Section>
  );
}

// =============================================================================
// Masthead
// =============================================================================

function Masthead({isNarrow}: {isNarrow: boolean}) {
  const [query, setQuery] = useState('');

  const wordmark = (
    <HStack gap={1.5} align="center">
      <Icon icon={Squares2X2Icon} size="lg" color="accent" />
      <Heading level={1} maxLines={1}>
        Kiosk
      </Heading>
    </HStack>
  );

  const search = (
    <HStack gap={1.5} align="center">
      <StackItem size="fill">
        <TextInput
          label="Search the web and Kiosk services"
          isLabelHidden
          placeholder="Search news, shopping, auctions…"
          value={query}
          onChange={setQuery}
          startIcon={<Icon icon={MagnifyingGlassIcon} size="sm" />}
          hasClear
          width="100%"
        />
      </StackItem>
      <Button label="Search" variant="primary" />
    </HStack>
  );

  const actions = (
    <HStack gap={1} align="center">
      <IconButton
        label="Mail, 3 unread"
        icon={<Icon icon={EnvelopeIcon} size="md" />}
        variant="ghost"
      />
      <IconButton
        label="Notifications, 5 new"
        icon={<Icon icon={BellIcon} size="md" />}
        variant="ghost"
      />
      {isNarrow ? (
        <IconButton
          label="Account and sections"
          icon={<Icon icon={Bars3Icon} size="md" />}
          variant="ghost"
        />
      ) : (
        <Button
          label="Sign in"
          variant="secondary"
          icon={<Icon icon={UserCircleIcon} size="sm" />}
        />
      )}
    </HStack>
  );

  const sectionRun = (
    <HStack gap={2} align="center" wrap={isNarrow ? 'nowrap' : 'wrap'}>
      {SECTIONS.map(section => (
        <Link key={section} href="#" size="sm" color="secondary">
          {section}
        </Link>
      ))}
    </HStack>
  );

  return (
    <VStack gap={2}>
      {isNarrow ? (
        <VStack gap={2}>
          <HStack gap={2} align="center" justify="between">
            {wordmark}
            {actions}
          </HStack>
          {search}
        </VStack>
      ) : (
        <HStack gap={4} align="center">
          {wordmark}
          <StackItem size="fill">{search}</StackItem>
          {actions}
        </HStack>
      )}
      {isNarrow ? (
        <ScrollableArea axis="inline" label="Kiosk sections">
          {sectionRun}
        </ScrollableArea>
      ) : (
        sectionRun
      )}
    </VStack>
  );
}

// =============================================================================
// Content bands
// =============================================================================

function PicksBand() {
  return (
    <Band title="Picks" icon={ChartBarIcon} moreLabel="All features">
      <Grid columns={{minWidth: 232, max: 4}} gap={2}>
        {PICKS.map(pick => (
          <Item
            key={pick.title}
            href="#"
            align="start"
            density="compact"
            labelLines={2}
            startContent={<Thumbnail src={pick.image} alt={pick.alt} />}
            label={
              <Text size="sm" weight="medium">
                {pick.title}
              </Text>
            }
            description={
              <Text size="xsm" color="secondary">
                {pick.meta}
              </Text>
            }
          />
        ))}
      </Grid>
    </Band>
  );
}

function NewsBand({
  topic,
  onTopicChange,
}: {
  topic: string;
  onTopicChange: (next: string) => void;
}) {
  const active = TOPICS.find(entry => entry.id === topic) ?? TOPICS[0];
  const feed = FEEDS[active.id];

  return (
    <Section variant="section" padding={3}>
      <VStack gap={2}>
        <HStack gap={2} align="center" justify="between">
          <HStack gap={1.5} align="center">
            <Icon icon={NewspaperIcon} size="sm" color="accent" />
            <Heading level={2} maxLines={1}>
              Topics
            </Heading>
          </HStack>
          <Text size="xsm" color="secondary">
            Updated 12:05
          </Text>
        </HStack>
        <TabList
          value={topic}
          onChange={onTopicChange}
          size="sm"
          hasDivider
          isFullBleed
          overflow="scroll">
          {TOPICS.map(entry => (
            <Tab key={entry.id} value={entry.id} label={entry.label} />
          ))}
        </TabList>
        <Item
          href="#"
          align="start"
          labelLines={3}
          startContent={<Thumbnail src={feed.lead.image} alt={feed.lead.alt} />}
          label={
            <VStack gap={1}>
              <HStack gap={1.5} align="center" wrap="wrap">
                {feed.lead.flag !== undefined && (
                  <Token size="sm" color="red" label={feed.lead.flag} />
                )}
                <Text size="xsm" color="secondary">
                  {feed.lead.source} · {feed.lead.time}
                </Text>
              </HStack>
              <Text size="lg" weight="semibold">
                {feed.lead.title}
              </Text>
            </VStack>
          }
          description={
            <Text size="sm" color="secondary" maxLines={3}>
              {feed.lead.summary}
            </Text>
          }
        />
        <Divider isFullBleed />
        <List density="compact" hasDividers>
          {feed.headlines.map(headline => (
            <ListItem
              key={headline.title}
              href="#"
              startContent={<Badge variant="neutral" label={headline.tag} />}
              label={
                <Text size="sm" maxLines={2}>
                  {headline.title}
                </Text>
              }
              description={
                <Text size="xsm" color="secondary">
                  {headline.source} · {headline.time}
                </Text>
              }
              endContent={
                <HStack gap={1} align="center">
                  <Icon
                    icon={ChatBubbleLeftRightIcon}
                    size="xsm"
                    color="secondary"
                  />
                  <Text size="xsm" color="secondary" hasTabularNumbers>
                    {headline.comments}
                  </Text>
                </HStack>
              }
            />
          ))}
        </List>
        <HStack gap={2} align="center" justify="between">
          <Link href="#" size="sm" weight="medium">
            More {active.label.toLowerCase()} stories
          </Link>
          <HStack gap={0.5} align="center">
            <Text size="xsm" color="secondary">
              128 publishers
            </Text>
            <Icon icon={ChevronRightIcon} size="xsm" color="secondary" />
          </HStack>
        </HStack>
      </VStack>
    </Section>
  );
}

function TrendingBand() {
  return (
    <Band title="Trending searches" icon={FireIcon} moreLabel="Full list">
      <List density="compact" listStyle="decimal" start={1}>
        {TRENDING.map(entry => (
          <ListItem
            key={entry.term}
            href="#"
            label={
              <Text size="sm" maxLines={1}>
                {entry.term}
              </Text>
            }
            endContent={
              entry.delta === 0 ? (
                <Token size="sm" color="blue" label="New" />
              ) : (
                <HStack gap={0.5} align="center">
                  <Icon
                    icon={
                      entry.delta > 0
                        ? ArrowTrendingUpIcon
                        : ArrowTrendingDownIcon
                    }
                    size="xsm"
                    color={entry.delta > 0 ? 'success' : 'error'}
                    label={entry.delta > 0 ? 'Rising' : 'Falling'}
                  />
                  <Text size="xsm" color="secondary" hasTabularNumbers>
                    {Math.abs(entry.delta)}
                  </Text>
                </HStack>
              )
            }
          />
        ))}
      </List>
      <Text size="xsm" color="secondary">
        Hourly cut, 12:00. Movement is against the 11:00 ranking.
      </Text>
    </Band>
  );
}

function ServicesBand() {
  return (
    <Band title="Services" icon={Squares2X2Icon} moreLabel="All services">
      <Grid columns={{minWidth: 84, max: 4}} gap={1.5}>
        {SERVICES.map(service => (
          <ClickableCard
            key={service.label}
            href="#"
            label={service.label}
            variant="muted"
            padding={2}>
            <VStack gap={1} align="center">
              <Icon icon={service.icon} size="md" color="accent" />
              <Text size="xsm" maxLines={1}>
                {service.label}
              </Text>
              {service.count !== undefined && (
                <Badge variant="error" label={service.count} />
              )}
            </VStack>
          </ClickableCard>
        ))}
      </Grid>
    </Band>
  );
}

function MarketsBand() {
  return (
    <Band title="Markets" icon={BanknotesIcon} moreLabel="Finance">
      <MetadataList columns="single" orientation="horizontal">
        {MARKETS.map(row => (
          <MetadataListItem
            key={row.name}
            label={row.name}
            icon={
              <Icon
                icon={row.isUp ? ArrowTrendingUpIcon : ArrowTrendingDownIcon}
                size="xsm"
                color={row.isUp ? 'success' : 'error'}
              />
            }>
            <HStack gap={1.5} align="center">
              <Text size="sm" weight="medium" hasTabularNumbers>
                {row.value}
              </Text>
              <Token
                size="sm"
                color={row.isUp ? 'green' : 'red'}
                label={row.change}
              />
            </HStack>
          </MetadataListItem>
        ))}
      </MetadataList>
      <Text size="xsm" color="secondary">
        As of 12:05 · quotes delayed 20 minutes
      </Text>
    </Band>
  );
}

function WeatherBand() {
  return (
    <Band
      title="Weather"
      icon={CloudIcon}
      endContent={
        <Link href="#" size="sm" weight="medium">
          Change location
        </Link>
      }>
      <VStack gap={2}>
        <HStack gap={3} align="center">
          <Icon icon={CloudIcon} size="lg" color="accent" />
          <VStack gap={0.5}>
            <Text type="display-3">22°</Text>
            <Text size="xsm" color="secondary">
              Harborview Central · cloudy, feels like 24°
            </Text>
          </VStack>
        </HStack>
        <Grid columns={{minWidth: 72, max: 4}} gap={1.5}>
          {FORECAST.map(day => (
            <VStack key={day.day} gap={0.5} align="center">
              <Text size="xsm" weight="medium">
                {day.day}
              </Text>
              <Icon icon={day.icon} size="md" color="secondary" />
              <Text size="xsm" hasTabularNumbers>
                {day.high} / {day.low}
              </Text>
              <Text size="2xs" color="secondary" hasTabularNumbers>
                {day.rain}
              </Text>
            </VStack>
          ))}
        </Grid>
        <ProgressBar
          label="Rain chance today"
          value={60}
          max={100}
          hasValueLabel
        />
      </VStack>
    </Band>
  );
}

// =============================================================================
// Rail bands
// =============================================================================

function BoardBand({
  board,
  onBoardChange,
}: {
  board: string;
  onBoardChange: (next: string) => void;
}) {
  const activeBoard = BOARD_TABS.find(tab => tab.id === board) ?? BOARD_TABS[0];
  const entries = BOARDS[activeBoard.id];

  return (
    <Band title="Ranking" icon={TrophyIcon}>
      <VStack gap={2}>
        <SegmentedControl
          value={board}
          onChange={onBoardChange}
          label="Ranking board"
          size="sm"
          layout="fill">
          {BOARD_TABS.map(tab => (
            <SegmentedControlItem
              key={tab.id}
              value={tab.id}
              label={tab.label}
              icon={<Icon icon={tab.icon} size="xsm" />}
            />
          ))}
        </SegmentedControl>
        <List density="compact" listStyle="decimal" start={1}>
          {entries.map(entry => (
            <ListItem
              key={entry.title}
              href="#"
              label={
                <Text size="sm" maxLines={2}>
                  {entry.title}
                </Text>
              }
              endContent={
                <Text size="xsm" color="secondary" hasTabularNumbers>
                  {entry.metric}
                </Text>
              }
            />
          ))}
        </List>
        <Text size="xsm" color="secondary">
          Counted over the last 24 hours.
        </Text>
      </VStack>
    </Band>
  );
}

function DealsBand() {
  return (
    <Band title="Deals" icon={ShoppingBagIcon} moreLabel="Shopping">
      <List density="compact" hasDividers>
        {DEALS.map(deal => (
          <ListItem
            key={deal.title}
            href="#"
            startContent={<Thumbnail src={deal.image} alt={deal.alt} />}
            label={
              <Text size="sm" maxLines={2}>
                {deal.title}
              </Text>
            }
            description={
              <VStack gap={0.5}>
                <HStack gap={1.5} align="center">
                  <Text size="sm" weight="semibold" hasTabularNumbers>
                    {deal.price}
                  </Text>
                  <Text
                    size="xsm"
                    color="secondary"
                    hasStrikethrough
                    hasTabularNumbers>
                    {deal.was}
                  </Text>
                  <Token size="sm" color="red" label={deal.discount} />
                </HStack>
                <Text size="xsm" color="secondary">
                  {deal.note}
                </Text>
              </VStack>
            }
          />
        ))}
      </List>
    </Band>
  );
}

function ListingsBand() {
  return (
    <Band title="Auctions" icon={TagIcon} moreLabel="All listings">
      <List density="compact" hasDividers>
        {LISTINGS.map(listing => (
          <ListItem
            key={listing.title}
            href="#"
            startContent={
              <StatusDot
                variant={listing.isClosing ? 'warning' : 'success'}
                label={listing.isClosing ? 'Closing today' : 'Open'}
              />
            }
            label={
              <Text size="sm" maxLines={2}>
                {listing.title}
              </Text>
            }
            description={
              <Text size="xsm" color="secondary" hasTabularNumbers>
                {listing.bids} bids · ends {listing.ends}
              </Text>
            }
            endContent={
              <Text size="sm" weight="medium" hasTabularNumbers>
                {listing.price}
              </Text>
            }
          />
        ))}
      </List>
    </Band>
  );
}

/**
 * The rail's three bands, laid out for wherever the rail ended up.
 *
 * `'column'` is the panel in the `end` slot; `'spread'` is the folded rail at
 * the foot of the content well, where there is width to put the bands beside
 * each other instead of stacking a third very long column.
 */
function RailBands({
  layout,
  board,
  onBoardChange,
}: {
  layout: 'column' | 'spread';
  board: string;
  onBoardChange: (next: string) => void;
}) {
  return (
    <Grid
      columns={layout === 'column' ? 1 : {minWidth: 300, max: 3}}
      gap={3}
      align="start">
      <BoardBand board={board} onBoardChange={onBoardChange} />
      <DealsBand />
      <ListingsBand />
    </Grid>
  );
}

// =============================================================================
// Footer
// =============================================================================

function PortalFooter() {
  return (
    <VStack gap={1.5}>
      <HStack gap={2} align="center" wrap="wrap">
        {FOOTER_LINKS.map(link => (
          <Link key={link} href="#" size="xsm" color="secondary">
            {link}
          </Link>
        ))}
      </HStack>
      <HStack gap={2} align="center" justify="between" wrap="wrap">
        <Text size="xsm" color="secondary">
          © 2026 Kiosk Media. Headlines are supplied by 128 partner publishers.
        </Text>
        <HStack gap={1.5} align="center">
          <Icon icon={GlobeAltIcon} size="xsm" color="secondary" />
          <Link href="#" size="xsm" color="secondary">
            Region: Harborview
          </Link>
        </HStack>
      </HStack>
    </VStack>
  );
}

// =============================================================================
// Page
// =============================================================================

export default function InformationMaximalistPage() {
  const [surfaceRef, surfaceWidth] = useSurfaceWidth();
  const [topic, setTopic] = useState('top');
  const [board, setBoard] = useState('read');
  const [isNoticeShown, setIsNoticeShown] = useState(true);

  // Until the first measurement lands, assume the widest arrangement: it is
  // the one a page-owning template almost always gets, and it reflows down in
  // the same frame as the measurement rather than flashing a wider layout.
  const hasRail = surfaceWidth === 0 || surfaceWidth >= RAIL_MIN_SURFACE;
  const isNarrow = surfaceWidth > 0 && surfaceWidth < NARROW_SURFACE;

  return (
    <Layout
      ref={surfaceRef}
      height="fill"
      header={
        <LayoutHeader padding={3} hasDivider label="Kiosk masthead">
          <Masthead isNarrow={isNarrow} />
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={3} isScrollable label="Portal home">
          <VStack gap={3}>
            {isNoticeShown && (
              <Banner
                status="info"
                container="card"
                title="Kiosk Mail maintenance tonight, 02:00–04:00"
                description="Sending and receiving pause for up to 20 minutes inside that window. Drafts are kept."
                icon={<Icon icon={BuildingOffice2Icon} size="md" />}
                isDismissable
                dismissLabel="Dismiss maintenance notice"
                onDismiss={() => setIsNoticeShown(false)}
                endContent={
                  <Link href="#" size="sm" weight="medium">
                    Status page
                  </Link>
                }
              />
            )}
            <PicksBand />
            <Grid columns={{minWidth: 340, max: 2}} gap={3} align="start">
              <VStack gap={3}>
                <NewsBand topic={topic} onTopicChange={setTopic} />
                <TrendingBand />
              </VStack>
              <VStack gap={3}>
                <ServicesBand />
                <MarketsBand />
                <WeatherBand />
              </VStack>
            </Grid>
            {!hasRail && (
              <RailBands
                layout="spread"
                board={board}
                onBoardChange={setBoard}
              />
            )}
          </VStack>
        </LayoutContent>
      }
      end={
        hasRail ? (
          <LayoutPanel
            width={340}
            padding={3}
            hasDivider
            isScrollable
            role="complementary"
            label="Rankings, deals and listings">
            <RailBands layout="column" board={board} onBoardChange={setBoard} />
          </LayoutPanel>
        ) : undefined
      }
      footer={
        <LayoutFooter padding={3} hasDivider label="Kiosk footer">
          <PortalFooter />
        </LayoutFooter>
      }
    />
  );
}
