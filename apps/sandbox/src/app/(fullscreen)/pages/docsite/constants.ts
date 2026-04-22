import {createStaticSource} from '@xds/core/Typeahead';

// ---------------------------------------------------------------------------
// Boids constants
// ---------------------------------------------------------------------------

export const CELL_W = 7;
export const CELL_H = 13;

export const DENSITY_LEVELS: {
  min: number;
  chars: string[];
  font: string;
  alpha: number;
  usePrimary: boolean;
}[] = [
  {
    min: 0,
    chars: ['·'],
    font: `${CELL_H - 3}px monospace`,
    alpha: 0.25,
    usePrimary: false,
  },
  {
    min: 1,
    chars: ['∘'],
    font: `${CELL_H - 1}px monospace`,
    alpha: 0.4,
    usePrimary: false,
  },
  {
    min: 2,
    chars: ['○'],
    font: `${CELL_H}px monospace`,
    alpha: 0.5,
    usePrimary: false,
  },
  {
    min: 3,
    chars: ['◎'],
    font: `${CELL_H}px monospace`,
    alpha: 0.55,
    usePrimary: true,
  },
  {
    min: 4,
    chars: ['◉'],
    font: `bold ${CELL_H}px monospace`,
    alpha: 0.65,
    usePrimary: true,
  },
  {
    min: 5,
    chars: ['●'],
    font: `bold ${CELL_H + 1}px monospace`,
    alpha: 0.8,
    usePrimary: true,
  },
  {
    min: 7,
    chars: ['⬤'],
    font: `bold ${CELL_H + 2}px monospace`,
    alpha: 0.95,
    usePrimary: true,
  },
];

export const SIM_COUNT = 350;

// ---------------------------------------------------------------------------
// Template data — real images from /public/templates/
// ---------------------------------------------------------------------------

export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
export const DUMMY_IMAGE = `${basePath}/docsite/dummy-placeholder.png`;
export const AVATAR_IMAGE = `${basePath}/avatars/avatar-profile.jpg`;
export const XDS_DESIGN_AVATAR = `${basePath}/avatars/xds-design-avatar.png`;
export const FIRST_CARD_IMAGE = `${basePath}/docsite/first-card.png`;
export const SHOPPING_DETAILS_IMAGE = `${basePath}/docsite/shopping-details.png`;
export const SCREENSHOT_3_IMAGE = `${basePath}/docsite/screenshot-3.png`;

// ---------------------------------------------------------------------------
// Mock code for the code block
// ---------------------------------------------------------------------------

export const MOCK_CODE = `'use client';

import {XDSTopNav, XDSTopNavHeading} from '@xds/core/TopNav';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSBadge} from '@xds/core/Badge';
import {XDSAvatar} from '@xds/core/Avatar';

export default function DetailPage() {
  return (
    <XDSAppShell variant="surface">
      <XDSVStack gap={6}>
        <XDSHeading level={1}>Detail Page</XDSHeading>
        <XDSCard>
          <XDSVStack gap={4}>
            <XDSHStack gap={2} vAlign="center">
              <XDSAvatar name="Jane Doe" size="medium" />
              <XDSText type="body" weight="bold">Jane Doe</XDSText>
              <XDSBadge label="Active" variant="success" />
            </XDSHStack>
            <XDSText type="body">
              This is a detail page template with structured
              content sections, metadata, and action buttons.
            </XDSText>
            <XDSHStack gap={2}>
              <XDSButton label="Edit" variant="secondary" />
              <XDSButton label="Share" variant="ghost" />
            </XDSHStack>
          </XDSVStack>
        </XDSCard>
      </XDSVStack>
    </div>
  );
}`;

// ---------------------------------------------------------------------------
// Template Preview constants
// ---------------------------------------------------------------------------

export const VIEWPORT_WIDTHS: {[key: string]: number | '100%'} = {
  desktop: 1600,
  phone: 375,
};

export const XDS_THEMES = [
  {label: 'Default', value: 'default'},
  {label: 'Neutral', value: 'neutral'},
  {label: 'Dark', value: 'dark'},
];

// ---------------------------------------------------------------------------
// Search commands
// ---------------------------------------------------------------------------

export const SEARCH_COMMANDS = createStaticSource([
  {
    id: 'templates',
    label: 'Browse Templates',
    auxiliaryData: {group: 'Navigation'},
  },
  {id: 'docs', label: 'Documentation', auxiliaryData: {group: 'Navigation'}},
  {id: 'button', label: 'XDSButton', auxiliaryData: {group: 'Components'}},
  {id: 'card', label: 'XDSCard', auxiliaryData: {group: 'Components'}},
  {id: 'dialog', label: 'XDSDialog', auxiliaryData: {group: 'Components'}},
  {id: 'table', label: 'XDSTable', auxiliaryData: {group: 'Components'}},
  {id: 'topnav', label: 'XDSTopNav', auxiliaryData: {group: 'Components'}},
  {
    id: 'theme-default',
    label: 'Switch to Default Theme',
    auxiliaryData: {group: 'Settings'},
  },
  {
    id: 'theme-dark',
    label: 'Switch to Dark Theme',
    auxiliaryData: {group: 'Settings'},
  },
]);

// ---------------------------------------------------------------------------
// Logo & Nav
// ---------------------------------------------------------------------------

export const NAV_ITEMS: {key: 'craft' | 'explore' | 'docs'; label: string}[] = [
  {key: 'craft', label: 'Craft'},
  {key: 'explore', label: 'Explore'},
  {key: 'docs', label: 'Docs'},
];

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export const TEMPLATES: {
  name: string;
  src: string;
  slug?: string;
  size: 'xlarge' | 'large' | 'medium' | 'small';
  author: string;
  isOfficial: boolean;
}[] = [
  {
    name: 'Login (SSO)',
    src: DUMMY_IMAGE,
    slug: 'login-sso',
    size: 'large',
    author: 'XDS Design',
    isOfficial: true,
  },
  {
    name: 'Landing Page',
    src: `${basePath}/docsite/card4-preview.png`,
    size: 'small',
    author: 'XDS Design',
    isOfficial: true,
  },
  {
    name: 'Classic Gallery',
    src: DUMMY_IMAGE,
    slug: 'classic-gallery',
    size: 'large',
    author: 'XDS Design',
    isOfficial: true,
  },
  {
    name: 'Payment Form',
    src: DUMMY_IMAGE,
    slug: 'payment-form',
    size: 'large',
    author: 'XDS Design',
    isOfficial: true,
  },
  {
    name: 'Login (Split)',
    src: DUMMY_IMAGE,
    slug: 'login-split',
    size: 'large',
    author: 'XDS Design',
    isOfficial: true,
  },
  {
    name: 'Side Gallery',
    src: DUMMY_IMAGE,
    slug: 'side-gallery',
    size: 'large',
    author: 'XDS Design',
    isOfficial: true,
  },
  {
    name: 'Settings Sidebar',
    src: DUMMY_IMAGE,
    slug: 'settings-sidebar',
    size: 'large',
    author: 'XDS Design',
    isOfficial: true,
  },
  {
    name: 'Product Gallery',
    src: DUMMY_IMAGE,
    slug: 'product-gallery',
    size: 'large',
    author: 'XDS Design',
    isOfficial: true,
  },
  {
    name: 'Mixed Gallery',
    src: DUMMY_IMAGE,
    slug: 'mixed-gallery',
    size: 'large',
    author: 'XDS Design',
    isOfficial: true,
  },
  {
    name: 'Dashboard',
    src: DUMMY_IMAGE,
    slug: 'dashboard',
    size: 'large',
    author: 'XDS Design',
    isOfficial: true,
  },
];

// ---------------------------------------------------------------------------
// Filter panel columns
// ---------------------------------------------------------------------------

export const FILTER_COLUMNS: {heading: string; items: string[]}[] = [
  {
    heading: 'Categories',
    items: ['AI', 'Health & Fitness', 'Productivity', 'Shopping', 'Education'],
  },
  {
    heading: 'Templates',
    items: [
      'My Account & Profile',
      'Charts',
      'Login',
      'Filter & Sort',
      'Signup',
    ],
  },
  {
    heading: 'Components',
    items: [
      'Dropdown Menu',
      'Side Navigation',
      'Stepper',
      'Text Field',
      'Navigation Menu',
    ],
  },
];

// ---------------------------------------------------------------------------
// Profile data
// ---------------------------------------------------------------------------

export const PROFILE_USED_ITEMS: {
  name: string;
  type: 'Template' | 'Theme' | 'Component';
  description: string;
  lastUsed: string;
  usageCount: number;
  img: string;
}[] = [
  {
    name: 'Admin Dashboard',
    type: 'Template',
    description:
      'Full admin panel with sidebar nav, KPI cards, and data tables.',
    lastUsed: '2026-04-15T09:00:00Z',
    usageCount: 7,
    img: SCREENSHOT_3_IMAGE,
  },
  {
    name: 'AppShell',
    type: 'Component',
    description:
      'Foundational page layout with header, sidebar, and content regions.',
    lastUsed: '2026-04-14T10:30:00Z',
    usageCount: 12,
    img: FIRST_CARD_IMAGE,
  },
  {
    name: 'Meta Theme',
    type: 'Theme',
    description: 'Meta brand colors with Figtree typography and blue accents.',
    lastUsed: '2026-04-14T08:00:00Z',
    usageCount: 9,
    img: SHOPPING_DETAILS_IMAGE,
  },
  {
    name: 'Button',
    type: 'Component',
    description: 'Primary action element for forms, dialogs, and toolbars.',
    lastUsed: '2026-04-14T16:00:00Z',
    usageCount: 24,
    img: FIRST_CARD_IMAGE,
  },
  {
    name: 'Contact Form',
    type: 'Template',
    description:
      'Responsive contact form with validation, file upload, and success state.',
    lastUsed: '2026-04-13T11:00:00Z',
    usageCount: 4,
    img: `${basePath}/docsite/card4-preview.png`,
  },
  {
    name: 'Badge',
    type: 'Component',
    description:
      'Displays small counts or status labels on icons, buttons, or list items.',
    lastUsed: '2026-04-12T09:20:00Z',
    usageCount: 15,
    img: SCREENSHOT_3_IMAGE,
  },
  {
    name: 'Dark Mode Palette',
    type: 'Theme',
    description:
      'High-contrast dark theme with WCAG AA compliant color ratios.',
    lastUsed: '2026-04-11T18:30:00Z',
    usageCount: 3,
    img: DUMMY_IMAGE,
  },
  {
    name: 'Avatar',
    type: 'Component',
    description:
      'Represents a person or entity with an image, initials, or icon.',
    lastUsed: '2026-04-13T15:45:00Z',
    usageCount: 8,
    img: SHOPPING_DETAILS_IMAGE,
  },
  {
    name: 'Landing Page',
    type: 'Template',
    description:
      'Sidebar settings layout with inline editing and expandable rows.',
    lastUsed: '2026-04-10T14:00:00Z',
    usageCount: 5,
    img: `${basePath}/docsite/card4-preview.png`,
  },
  {
    name: 'Dialog',
    type: 'Component',
    description: 'Modal overlays that require user attention or action.',
    lastUsed: '2026-04-11T13:15:00Z',
    usageCount: 6,
    img: DUMMY_IMAGE,
  },
  {
    name: 'WhatsApp Theme',
    type: 'Theme',
    description:
      'WhatsApp brand greens and warm grays with rounded components.',
    lastUsed: '2026-04-09T10:00:00Z',
    usageCount: 2,
    img: DUMMY_IMAGE,
  },
  {
    name: 'DropdownMenu',
    type: 'Component',
    description: 'Presents actions or options in a floating overlay.',
    lastUsed: '2026-04-09T16:45:00Z',
    usageCount: 5,
    img: DUMMY_IMAGE,
  },
];

export const PROFILE_LIKED_ITEMS: {
  name: string;
  type: 'Template' | 'Theme' | 'Component';
  bookmarkedAt: string;
  description: string;
  img: string;
  author: string;
}[] = [
  {
    name: 'Meta Theme',
    type: 'Theme',
    bookmarkedAt: '2026-04-13T08:00:00Z',
    description: 'Meta brand colors with Figtree typography.',
    img: FIRST_CARD_IMAGE,
    author: 'XDS Design',
  },
  {
    name: 'Brutalist Theme',
    type: 'Theme',
    bookmarkedAt: '2026-04-11T10:30:00Z',
    description: 'Bold, raw aesthetic with heavy borders and sharp angles.',
    img: SHOPPING_DETAILS_IMAGE,
    author: 'Andrea Anderson',
  },
  {
    name: 'Admin Dashboard',
    type: 'Template',
    bookmarkedAt: '2026-04-10T14:20:00Z',
    description:
      'Full admin panel with sidebar nav, KPI cards, and data tables.',
    img: SCREENSHOT_3_IMAGE,
    author: 'Andrea Anderson',
  },
  {
    name: 'Product Detail',
    type: 'Template',
    bookmarkedAt: '2026-04-07T09:00:00Z',
    description: 'E-commerce product page with image gallery and reviews.',
    img: `${basePath}/docsite/card4-preview.png`,
    author: 'XDS Design',
  },
  {
    name: 'Toast Notification',
    type: 'Component',
    bookmarkedAt: '2026-04-05T11:00:00Z',
    description: 'Stackable toast with auto-dismiss and action support.',
    img: DUMMY_IMAGE,
    author: 'Andrea Anderson',
  },
  {
    name: 'Kanban Board',
    type: 'Template',
    bookmarkedAt: '2026-04-02T16:30:00Z',
    description: 'Drag-and-drop board with swimlanes and card detail drawers.',
    img: DUMMY_IMAGE,
    author: 'XDS Design',
  },
];

export const PROFILE_COLLECTIONS: {
  name: string;
  count: number;
  color: string;
  items: string[];
}[] = [
  {
    name: 'Work Projects',
    count: 4,
    color: '#3B82F6',
    items: [
      'Admin Dashboard',
      'Meta Theme',
      'Toast Notification',
      'Kanban Board',
    ],
  },
  {
    name: 'Design Inspiration',
    count: 6,
    color: '#8B5CF6',
    items: [
      'Meta Theme',
      'Brutalist Theme',
      'Admin Dashboard',
      'Product Detail',
      'Toast Notification',
      'Kanban Board',
    ],
  },
  {
    name: 'Client Templates',
    count: 3,
    color: '#F59E0B',
    items: ['Admin Dashboard', 'Product Detail', 'Kanban Board'],
  },
  {
    name: 'Dashboard Ideas',
    count: 5,
    color: '#10B981',
    items: [
      'Admin Dashboard',
      'Meta Theme',
      'Brutalist Theme',
      'Product Detail',
      'Kanban Board',
    ],
  },
  {
    name: 'Landing Pages',
    count: 8,
    color: '#EF4444',
    items: [
      'Meta Theme',
      'Brutalist Theme',
      'Admin Dashboard',
      'Product Detail',
      'Toast Notification',
      'Kanban Board',
      'Meta Theme',
      'Brutalist Theme',
    ],
  },
];

export const PROFILE_CRAFT_ITEMS: {
  name: string;
  type: 'Template' | 'Theme' | 'Component';
  status: 'Published' | 'Draft' | 'In Review' | 'Needs Fixes';
  used: number;
  views: number;
  bookmarks: number;
  img: string;
  lastUpdated: string;
  description: string;
  tags: string[];
}[] = [
  {
    name: 'My Dashboard Theme',
    type: 'Theme',
    status: 'Published',
    used: 342,
    views: 1205,
    bookmarks: 89,
    img: FIRST_CARD_IMAGE,
    lastUpdated: '2026-03-01T10:00:00Z',
    description:
      'Dark-mode friendly theme with custom color tokens and typography overrides.',
    tags: ['Dashboard', 'Dark Mode', 'SaaS'],
  },
  {
    name: 'Custom Login Template',
    type: 'Template',
    status: 'Published',
    used: 128,
    views: 580,
    bookmarks: 34,
    img: SHOPPING_DETAILS_IMAGE,
    lastUpdated: '2026-03-15T14:30:00Z',
    description:
      'Branded login page with social auth buttons and form validation.',
    tags: ['Login', 'Authentication', 'Form'],
  },
  {
    name: 'Data Visualization Kit',
    type: 'Template',
    status: 'Published',
    used: 89,
    views: 312,
    bookmarks: 27,
    img: SCREENSHOT_3_IMAGE,
    lastUpdated: '2026-04-02T11:00:00Z',
    description:
      'Charts, graphs, and data table layouts for analytics dashboards.',
    tags: ['Dashboard', 'Charts', 'Analytics'],
  },
  {
    name: 'Landing Page',
    type: 'Template',
    status: 'Published',
    used: 67,
    views: 248,
    bookmarks: 18,
    img: `${basePath}/docsite/card4-preview.png`,
    lastUpdated: '2026-02-20T08:00:00Z',
    description:
      'Sidebar settings layout with inline editing and expandable rows.',
    tags: ['Settings', 'SaaS', 'Admin'],
  },
  {
    name: 'Product Detail Page',
    type: 'Template',
    status: 'Published',
    used: 54,
    views: 190,
    bookmarks: 15,
    img: DUMMY_IMAGE,
    lastUpdated: '2026-03-28T12:00:00Z',
    description:
      'E-commerce product page with image gallery, reviews, and add-to-cart.',
    tags: ['E-commerce', 'Shopping', 'Product'],
  },
  {
    name: 'Custom Notification Card',
    type: 'Component',
    status: 'Published',
    used: 203,
    views: 870,
    bookmarks: 62,
    img: DUMMY_IMAGE,
    lastUpdated: '2026-01-15T09:00:00Z',
    description:
      'Toast-style notification card with dismiss, action buttons, and auto-hide.',
    tags: ['Notification', 'Toast', 'Feedback'],
  },
  {
    name: 'Metric Summary Card',
    type: 'Component',
    status: 'Published',
    used: 156,
    views: 620,
    bookmarks: 41,
    img: DUMMY_IMAGE,
    lastUpdated: '2026-02-10T14:00:00Z',
    description:
      'KPI card with sparkline, trend indicator, and comparison period.',
    tags: ['Dashboard', 'KPI', 'Analytics'],
  },
  {
    name: 'Analytics Dashboard',
    type: 'Template',
    status: 'In Review',
    used: 0,
    views: 45,
    bookmarks: 0,
    img: DUMMY_IMAGE,
    lastUpdated: '2026-04-12T09:00:00Z',
    description:
      'Full-page analytics dashboard with filters, charts, and data tables.',
    tags: ['Dashboard', 'Analytics', 'Data Table'],
  },
  {
    name: 'Team Directory',
    type: 'Template',
    status: 'In Review',
    used: 0,
    views: 32,
    bookmarks: 0,
    img: DUMMY_IMAGE,
    lastUpdated: '2026-04-10T16:30:00Z',
    description:
      'Searchable team roster with profile cards, org chart, and role filters.',
    tags: ['Directory', 'Team', 'Admin'],
  },
  {
    name: 'Checkout Flow',
    type: 'Template',
    status: 'Needs Fixes',
    used: 0,
    views: 18,
    bookmarks: 0,
    img: DUMMY_IMAGE,
    lastUpdated: '2026-04-11T14:00:00Z',
    description:
      'Multi-step checkout with cart summary, address form, and payment integration.',
    tags: ['E-commerce', 'Checkout', 'Form'],
  },
  {
    name: 'Onboarding Flow',
    type: 'Template',
    status: 'Draft',
    used: 0,
    views: 12,
    bookmarks: 0,
    img: DUMMY_IMAGE,
    lastUpdated: '2026-04-14T16:00:00Z',
    description:
      'Multi-step onboarding wizard with progress bar and skip logic.',
    tags: ['Onboarding', 'Wizard', 'Form'],
  },
  {
    name: 'Dark Mode Palette',
    type: 'Theme',
    status: 'Draft',
    used: 0,
    views: 8,
    bookmarks: 0,
    img: DUMMY_IMAGE,
    lastUpdated: '2026-04-13T11:30:00Z',
    description:
      'High-contrast dark theme with WCAG AA compliant color ratios.',
    tags: ['Dark Mode', 'Accessibility', 'Theme'],
  },
  {
    name: 'File Upload Dropzone',
    type: 'Component',
    status: 'Draft',
    used: 0,
    views: 5,
    bookmarks: 0,
    img: DUMMY_IMAGE,
    lastUpdated: '2026-04-15T10:00:00Z',
    description:
      'Drag-and-drop file uploader with preview thumbnails and progress bars.',
    tags: ['Upload', 'Form', 'File'],
  },
];

// ---------------------------------------------------------------------------
// Publish tags
// ---------------------------------------------------------------------------

export const PUBLISH_TAGS = [
  'Landing Page',
  'Dashboard',
  'Marketing',
  'E-commerce',
  'Documentation',
  'SaaS',
];

// ---------------------------------------------------------------------------
// Theme picker entries (used in TemplateFullPreview)
// ---------------------------------------------------------------------------

export type ThemePickerEntry = {
  key: string;
  name: string;
  category: 'official' | 'community';
  accent: string;
  description?: string;
  isPinnedByDefault?: boolean;
  preview: {
    bg: string;
    surface: string;
    accent: string;
    text: string;
    radius?: number;
    font?: string;
    img?: string;
  };
};

export const THEME_PICKER_ENTRIES: ThemePickerEntry[] = [
  // Official — shipped theme packages
  {
    key: 'default',
    name: 'Default',
    category: 'official',
    accent: '#0066FF',
    isPinnedByDefault: true,
    description: 'Clean blue accent with neutral grays',
    preview: {
      bg: '#FFFFFF',
      surface: '#F5F5F5',
      accent: '#0066FF',
      text: '#111111',
      radius: 8,
      font: 'system-ui, sans-serif',
    },
  },
  {
    key: 'meta',
    name: 'Meta',
    category: 'official',
    accent: '#0064E0',
    isPinnedByDefault: true,
    description: 'Meta brand with Figtree typography',
    preview: {
      bg: '#FFFFFF',
      surface: '#F2F4F6',
      accent: '#0064E0',
      text: '#111112',
      radius: 10,
      font: 'Figtree, sans-serif',
    },
  },
  {
    key: 'whatsapp',
    name: 'WhatsApp',
    category: 'official',
    accent: '#1DAA61',
    description: 'WhatsApp brand greens and warm grays',
    preview: {
      bg: '#FFFFFF',
      surface: '#F7F5F3',
      accent: '#1DAA61',
      text: '#111B21',
      radius: 12,
      font: 'Helvetica Neue, sans-serif',
    },
  },
  {
    key: 'threads',
    name: 'Threads',
    category: 'official',
    accent: '#000000',
    isPinnedByDefault: true,
    description: 'Threads brand with clean monochrome palette',
    preview: {
      bg: '#FFFFFF',
      surface: '#F5F5F5',
      accent: '#000000',
      text: '#111111',
      radius: 16,
      font: 'system-ui, sans-serif',
    },
  },
  {
    key: 'facebook',
    name: 'Facebook',
    category: 'official',
    accent: '#1877F2',
    description: 'Classic Facebook blue brand colors',
    preview: {
      bg: '#FFFFFF',
      surface: '#F0F2F5',
      accent: '#1877F2',
      text: '#1C1E21',
      radius: 8,
      font: 'Helvetica, Arial, sans-serif',
    },
  },
  // Community — future user-contributed themes
  {
    key: 'forest',
    name: 'Matcha',
    category: 'community',
    accent: '#2D8A4E',
    description: 'Earthy greens and warm browns',
    preview: {
      bg: '#F4F7F4',
      surface: '#E8EDE8',
      accent: '#2D8A4E',
      text: '#1A2E1A',
      radius: 6,
      font: 'Georgia, serif',
      img: 'theme-preview-forest.png',
    },
  },
  {
    key: 'midnight',
    name: 'Midnight',
    category: 'community',
    accent: '#C9A96E',
    description: 'Dark tones with warm bronze accents',
    preview: {
      bg: '#121212',
      surface: '#1E1E1E',
      accent: '#C9A96E',
      text: '#E8E0D4',
      radius: 4,
      font: 'SF Mono, monospace',
      img: 'theme-preview-midnight.png',
    },
  },
  {
    key: 'daily',
    name: 'Daily',
    category: 'community',
    accent: '#4A90D9',
    description: 'Soft blues and warm neutrals for everyday tools',
    preview: {
      bg: '#E8F0FE',
      surface: '#FFFFFF',
      accent: '#4A90D9',
      text: '#1A1A2E',
      radius: 8,
      font: 'Inter, sans-serif',
      img: 'theme-preview-daily.png',
    },
  },
];

// ---------------------------------------------------------------------------
// Preview palettes and font packs
// ---------------------------------------------------------------------------

export const PREVIEW_COLOR_PALETTES = [
  {name: 'Warm', colors: ['#2D2926', '#D4A574', '#F5E6D3', '#FFFFFF']},
  {name: 'Cool', colors: ['#1B2838', '#4A90D9', '#B8D4E3', '#F0F4F8']},
  {name: 'Earth', colors: ['#3D2B1F', '#8B6914', '#C4A35A', '#F5F0E1']},
  {name: 'Mono', colors: ['#111111', '#555555', '#AAAAAA', '#F5F5F5']},
];

export const PREVIEW_THEMES: Array<{
  key: string;
  name: string;
  category: 'pinned' | 'official' | 'community';
  colors: {
    background: string;
    surface: string;
    border: string;
    accent: string;
    text: string;
  };
}> = [
  {
    key: 'default',
    name: 'Default',
    category: 'pinned',
    colors: {
      background: '#FFFFFF',
      surface: '#F5F5F5',
      border: '#E0E0E0',
      accent: '#0066FF',
      text: '#1A1A1A',
    },
  },
  {
    key: 'dark',
    name: 'Dark',
    category: 'pinned',
    colors: {
      background: '#1A1A1A',
      surface: '#2A2A2A',
      border: '#3A3A3A',
      accent: '#4D9EFF',
      text: '#F0F0F0',
    },
  },
  {
    key: 'warm',
    name: 'Warm Sand',
    category: 'official',
    colors: {
      background: '#FDF8F3',
      surface: '#F5EDE3',
      border: '#E8DDD0',
      accent: '#C87941',
      text: '#2D2926',
    },
  },
  {
    key: 'cool',
    name: 'Cool Slate',
    category: 'official',
    colors: {
      background: '#F0F4F8',
      surface: '#E2EAF2',
      border: '#CBD5E1',
      accent: '#3B82F6',
      text: '#1E293B',
    },
  },
  {
    key: 'forest',
    name: 'Matcha',
    category: 'community',
    colors: {
      background: '#F0F5F1',
      surface: '#E0EBE2',
      border: '#C1D6C5',
      accent: '#2D8A4E',
      text: '#1A2E1F',
    },
  },
  {
    key: 'lavender',
    name: 'Lavender',
    category: 'community',
    colors: {
      background: '#F5F0FA',
      surface: '#EBE0F5',
      border: '#D4C4E8',
      accent: '#7C3AED',
      text: '#2E1A47',
    },
  },
];

export const PREVIEW_FONT_PACKS = [
  {heading: 'Georgia', paragraph: 'Helvetica Neue'},
  {heading: 'Playfair Display', paragraph: 'Source Sans Pro'},
  {heading: 'Montserrat', paragraph: 'Merriweather'},
  {heading: 'Futura', paragraph: 'Garamond'},
];
