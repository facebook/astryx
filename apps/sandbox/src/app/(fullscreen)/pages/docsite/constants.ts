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
export const DUMMY_IMAGE = `${basePath}/templates/dummy-placeholder.png`;
export const AVATAR_IMAGE = `${basePath}/avatars/avatar-profile.jpg`;
export const XDS_DESIGN_AVATAR = `${basePath}/avatars/xds-design-avatar.png`;
export const FIRST_CARD_IMAGE = `${basePath}/templates/first-card.png`;
export const SHOPPING_DETAILS_IMAGE = `${basePath}/templates/shopping-details.png`;
export const SCREENSHOT_3_IMAGE = `${basePath}/templates/screenshot-3.png`;

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
  size: 'xlarge' | 'large' | 'medium' | 'small';
  author: string;
  isOfficial: boolean;
}[] = [
  {name: 'Contact Form', src: FIRST_CARD_IMAGE, size: 'large', author: 'Andrea Anderson', isOfficial: true},
  {name: 'Shopping Details', src: SHOPPING_DETAILS_IMAGE, size: 'small', author: 'Andrea Anderson', isOfficial: true},
  {name: 'Button Component', src: SCREENSHOT_3_IMAGE, size: 'small', author: 'XDS Design', isOfficial: true},
  {name: 'Settings Page', src: `${basePath}/templates/card4-preview.png`, size: 'small', author: 'XDS Design', isOfficial: true},
  {name: 'Login Form', src: DUMMY_IMAGE, size: 'xlarge', author: 'Marcus Chen', isOfficial: false},
  {name: 'Dashboard', src: DUMMY_IMAGE, size: 'large', author: 'Marcus Chen', isOfficial: false},
  {name: 'Data Table', src: DUMMY_IMAGE, size: 'small', author: 'XDS Design', isOfficial: true},
  {name: 'File Explorer', src: DUMMY_IMAGE, size: 'small', author: 'Sarah Kim', isOfficial: false},
  {name: 'Contact Form', src: DUMMY_IMAGE, size: 'small', author: 'Sarah Kim', isOfficial: false},
  {name: 'Editor', src: DUMMY_IMAGE, size: 'xlarge', author: 'Andrea Anderson', isOfficial: true},
  {name: 'Analytics', src: DUMMY_IMAGE, size: 'large', author: 'Marcus Chen', isOfficial: false},
  {name: 'User Profile', src: DUMMY_IMAGE, size: 'small', author: 'Sarah Kim', isOfficial: false},
  {name: 'Notifications', src: DUMMY_IMAGE, size: 'small', author: 'XDS Design', isOfficial: true},
  {name: 'Calendar', src: DUMMY_IMAGE, size: 'small', author: 'Andrea Anderson', isOfficial: false},
  {name: 'Onboarding', src: DUMMY_IMAGE, size: 'xlarge', author: 'XDS Design', isOfficial: true},
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
    items: ['My Account & Profile', 'Charts', 'Login', 'Filter & Sort', 'Signup'],
  },
  {
    heading: 'Components',
    items: ['Dropdown Menu', 'Side Navigation', 'Stepper', 'Text Field', 'Navigation Menu'],
  },
];

// ---------------------------------------------------------------------------
// Profile data
// ---------------------------------------------------------------------------

export const PROFILE_USED_ITEMS: {
  name: string;
  description: string;
  lastUsed: string;
  usageCount: number;
}[] = [
  {name: 'AppShell', description: 'Foundational page layout with header, sidebar, and content regions.', lastUsed: '2026-04-14T10:30:00Z', usageCount: 12},
  {name: 'Avatar', description: 'Represents a person or entity with an image, initials, or icon.', lastUsed: '2026-04-13T15:45:00Z', usageCount: 8},
  {name: 'Badge', description: 'Displays small counts or status labels on icons, buttons, or list items.', lastUsed: '2026-04-12T09:20:00Z', usageCount: 15},
  {name: 'Banner', description: 'Shows important, non-modal messages at the top of a page or section.', lastUsed: '2026-04-10T14:00:00Z', usageCount: 3},
  {name: 'Button', description: 'Primary action element for forms, dialogs, and toolbars.', lastUsed: '2026-04-14T16:00:00Z', usageCount: 24},
  {name: 'Calendar', description: 'Date-picking grid for selecting single dates or date ranges.', lastUsed: '2026-04-08T11:30:00Z', usageCount: 2},
  {name: 'Dialog', description: 'Modal overlays that require user attention or action.', lastUsed: '2026-04-11T13:15:00Z', usageCount: 6},
  {name: 'DropdownMenu', description: 'Presents actions or options in a floating overlay.', lastUsed: '2026-04-09T16:45:00Z', usageCount: 5},
];

export const PROFILE_LIKED_ITEMS: {
  name: string;
  type: string;
  lastUsed: string;
}[] = [
  {name: 'Meta Theme', type: 'Theme', lastUsed: '2026-04-13T08:00:00Z'},
  {name: 'Brutalist Theme', type: 'Theme', lastUsed: '2026-04-11T10:30:00Z'},
  {name: 'Admin Dashboard', type: 'Template', lastUsed: '2026-04-10T14:20:00Z'},
  {name: 'Product Detail', type: 'Template', lastUsed: '2026-04-07T09:00:00Z'},
];

export const PROFILE_COLLECTIONS = [
  {name: 'Work Projects', count: 4},
  {name: 'Design Inspiration', count: 6},
  {name: 'Client Templates', count: 3},
  {name: 'Dashboard Ideas', count: 5},
  {name: 'Landing Pages', count: 8},
];

export const PROFILE_CRAFT_ITEMS: {
  name: string;
  type: 'Template' | 'Theme' | 'Component';
  status: 'Published' | 'Draft' | 'In Review';
  used: number;
  views: number;
  img: string;
  lastUpdated: string;
  description: string;
}[] = [
  {name: 'My Dashboard Theme', type: 'Theme', status: 'Published', used: 342, views: 1205, img: FIRST_CARD_IMAGE, lastUpdated: '2026-03-01T10:00:00Z', description: 'Dark-mode friendly theme with custom color tokens and typography overrides.'},
  {name: 'Custom Login Template', type: 'Template', status: 'Published', used: 128, views: 580, img: SHOPPING_DETAILS_IMAGE, lastUpdated: '2026-03-15T14:30:00Z', description: 'Branded login page with social auth buttons and form validation.'},
  {name: 'Data Visualization Kit', type: 'Template', status: 'Published', used: 89, views: 312, img: SCREENSHOT_3_IMAGE, lastUpdated: '2026-04-02T11:00:00Z', description: 'Charts, graphs, and data table layouts for analytics dashboards.'},
  {name: 'Settings Page', type: 'Template', status: 'Published', used: 67, views: 248, img: `${basePath}/templates/card4-preview.png`, lastUpdated: '2026-02-20T08:00:00Z', description: 'Sidebar settings layout with inline editing and expandable rows.'},
  {name: 'Product Detail Page', type: 'Template', status: 'Published', used: 54, views: 190, img: DUMMY_IMAGE, lastUpdated: '2026-03-28T12:00:00Z', description: 'E-commerce product page with image gallery, reviews, and add-to-cart.'},
  {name: 'Custom Notification Card', type: 'Component', status: 'Published', used: 203, views: 870, img: DUMMY_IMAGE, lastUpdated: '2026-01-15T09:00:00Z', description: 'Toast-style notification card with dismiss, action buttons, and auto-hide.'},
  {name: 'Metric Summary Card', type: 'Component', status: 'Published', used: 156, views: 620, img: DUMMY_IMAGE, lastUpdated: '2026-02-10T14:00:00Z', description: 'KPI card with sparkline, trend indicator, and comparison period.'},
  {name: 'Analytics Dashboard', type: 'Template', status: 'In Review', used: 0, views: 45, img: DUMMY_IMAGE, lastUpdated: '2026-04-12T09:00:00Z', description: 'Full-page analytics dashboard with filters, charts, and data tables.'},
  {name: 'Team Directory', type: 'Template', status: 'In Review', used: 0, views: 32, img: DUMMY_IMAGE, lastUpdated: '2026-04-10T16:30:00Z', description: 'Searchable team roster with profile cards, org chart, and role filters.'},
  {name: 'Onboarding Flow', type: 'Template', status: 'Draft', used: 0, views: 12, img: DUMMY_IMAGE, lastUpdated: '2026-04-14T16:00:00Z', description: 'Multi-step onboarding wizard with progress bar and skip logic.'},
  {name: 'Dark Mode Palette', type: 'Theme', status: 'Draft', used: 0, views: 8, img: DUMMY_IMAGE, lastUpdated: '2026-04-13T11:30:00Z', description: 'High-contrast dark theme with WCAG AA compliant color ratios.'},
  {name: 'File Upload Dropzone', type: 'Component', status: 'Draft', used: 0, views: 5, img: DUMMY_IMAGE, lastUpdated: '2026-04-15T10:00:00Z', description: 'Drag-and-drop file uploader with preview thumbnails and progress bars.'},
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
  preview: {bg: string; surface: string; accent: string; text: string};
};

export const THEME_PICKER_ENTRIES: ThemePickerEntry[] = [
  // Official — shipped theme packages
  {key: 'default', name: 'Default', category: 'official', accent: '#0066FF', isPinnedByDefault: true, description: 'Clean blue accent with neutral grays', preview: {bg: '#FFFFFF', surface: '#F5F5F5', accent: '#0066FF', text: '#111111'}},
  {key: 'meta', name: 'Meta', category: 'official', accent: '#0064E0', description: 'Meta brand with Figtree typography', preview: {bg: '#FFFFFF', surface: '#F2F4F6', accent: '#0064E0', text: '#111112'}},
  {key: 'whatsapp', name: 'WhatsApp', category: 'official', accent: '#1DAA61', description: 'WhatsApp brand greens and warm grays', preview: {bg: '#FFFFFF', surface: '#F7F5F3', accent: '#1DAA61', text: '#111B21'}},
  {key: 'threads', name: 'Threads', category: 'official', accent: '#000000', description: 'Threads brand with clean monochrome palette', preview: {bg: '#FFFFFF', surface: '#F5F5F5', accent: '#000000', text: '#111111'}},
  {key: 'facebook', name: 'Facebook', category: 'official', accent: '#1877F2', description: 'Classic Facebook blue brand colors', preview: {bg: '#FFFFFF', surface: '#F0F2F5', accent: '#1877F2', text: '#1C1E21'}},
  // Community — future user-contributed themes
  {key: 'forest', name: 'Forest', category: 'community', accent: '#2D8A4E', description: 'Earthy greens and warm browns', preview: {bg: '#F4F7F4', surface: '#E8EDE8', accent: '#2D8A4E', text: '#1A2E1A'}},
  {key: 'sunset', name: 'Sunset', category: 'community', accent: '#E5484D', description: 'Warm reds and golden highlights', preview: {bg: '#FFF5F5', surface: '#FDE8E8', accent: '#E5484D', text: '#2D1515'}},
  {key: 'midnight', name: 'Midnight', category: 'community', accent: '#818CF8', description: 'Deep blues with soft violet accents', preview: {bg: '#0F172A', surface: '#1E293B', accent: '#818CF8', text: '#E2E8F0'}},
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
    name: 'Forest',
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
