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
export const AVATAR_IMAGE = `${basePath}/templates/avatar-profile.jpg`;
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
}[] = [
  {name: 'Contact Form', src: FIRST_CARD_IMAGE, size: 'large'},
  {name: 'Shopping Details', src: SHOPPING_DETAILS_IMAGE, size: 'small'},
  {name: 'Button Component', src: SCREENSHOT_3_IMAGE, size: 'small'},
  {name: 'Settings Page', src: DUMMY_IMAGE, size: 'small'},
  {name: 'Login Form', src: DUMMY_IMAGE, size: 'xlarge'},
  {name: 'Dashboard', src: DUMMY_IMAGE, size: 'large'},
  {name: 'Data Table', src: DUMMY_IMAGE, size: 'small'},
  {name: 'File Explorer', src: DUMMY_IMAGE, size: 'small'},
  {name: 'Contact Form', src: DUMMY_IMAGE, size: 'small'},
  {name: 'Editor', src: DUMMY_IMAGE, size: 'xlarge'},
  {name: 'Analytics', src: DUMMY_IMAGE, size: 'large'},
  {name: 'User Profile', src: DUMMY_IMAGE, size: 'small'},
  {name: 'Notifications', src: DUMMY_IMAGE, size: 'small'},
  {name: 'Calendar', src: DUMMY_IMAGE, size: 'small'},
  {name: 'Onboarding', src: DUMMY_IMAGE, size: 'xlarge'},
];

// ---------------------------------------------------------------------------
// Profile data
// ---------------------------------------------------------------------------

export const PROFILE_USED_ITEMS = [
  {name: 'Dashboard Pro', lastUsed: 'Last used 2 days ago'},
  {name: 'Login Form', lastUsed: 'Last used 2 days ago'},
  {name: 'Settings Panel', lastUsed: 'Last used 2 days ago'},
  {name: 'E-commerce Kit', lastUsed: 'Last used 2 days ago'},
  {name: 'Data Table', lastUsed: 'Last used 2 days ago'},
  {name: 'Contact Form', lastUsed: 'Last used 2 days ago'},
];

export const PROFILE_LIKED_ITEMS = [
  {name: 'Meta Theme', lastUsed: 'Last used 2 days ago'},
  {name: 'Brutalist Theme', lastUsed: 'Last used 2 days ago'},
  {name: 'Admin Dashboard', lastUsed: 'Last used 2 days ago'},
  {name: 'Product Detail', lastUsed: 'Last used 2 days ago'},
];

export const PROFILE_COLLECTIONS = [
  {name: 'Work Projects', count: 4},
  {name: 'Design Inspiration', count: 6},
  {name: 'Client Templates', count: 3},
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
  {key: 'neutral', name: 'Neutral', category: 'official', accent: '#525252', description: 'Understated grayscale palette', preview: {bg: '#FFFFFF', surface: '#FAFAFA', accent: '#525252', text: '#171717'}},
  {key: 'brutalist', name: 'Brutalist', category: 'official', accent: '#FF1493', description: 'Bold pink, monospace, sharp edges', preview: {bg: '#FFFFFF', surface: '#F5F5F5', accent: '#FF1493', text: '#000000'}},
  {key: 'daily', name: 'Daily', category: 'official', accent: '#0064E0', description: 'Light and airy daily-use theme', preview: {bg: '#FFFFFF', surface: '#F9FAFA', accent: '#0064E0', text: '#0A1317'}},
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
