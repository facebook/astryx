'use client';

import {useState} from 'react';
import {XDSAppShell} from '@xds/core/AppShell';
import {XDSVStack} from '@xds/core/Layout';
import {XDSCenter} from '@xds/core/Center';
import {XDSText} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSAspectRatio} from '@xds/core/AspectRatio';


// ─── Categories & Gallery Data ──────────────────────────────────────────────

type Category = 'All' | 'Nature' | 'Architecture' | 'People';

const CATEGORIES: Category[] = ['All', 'Nature', 'Architecture', 'People'];

interface GalleryItem {
  src: string;
  title: string;
  photographer: string;
  category: Exclude<Category, 'All'>;
  ratio: number;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    title: 'Alpine Sunrise',
    photographer: 'Elena Marquez',
    category: 'Nature',
    ratio: 3 / 4,
  },
  {
    src: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80',
    title: 'Steel & Glass',
    photographer: 'Marcus Chen',
    category: 'Architecture',
    ratio: 4 / 3,
  },
  {
    src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80',
    title: 'Golden Light',
    photographer: 'Sophie Laurent',
    category: 'People',
    ratio: 2 / 3,
  },
  {
    src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80',
    title: 'Valley Mist',
    photographer: 'James Okafor',
    category: 'Nature',
    ratio: 16 / 9,
  },
  {
    src: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800&q=80',
    title: 'Urban Grid',
    photographer: 'Anna Petrov',
    category: 'Architecture',
    ratio: 1 / 1,
  },
  {
    src: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80',
    title: 'Candid Moment',
    photographer: 'David Kim',
    category: 'People',
    ratio: 3 / 4,
  },
  {
    src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=80',
    title: 'Coastal Calm',
    photographer: 'Lena Fischer',
    category: 'Nature',
    ratio: 4 / 3,
  },
  {
    src: 'https://images.unsplash.com/photo-1481026469463-66327c86e544?w=800&q=80',
    title: 'Concrete Curves',
    photographer: 'Tomás Rivera',
    category: 'Architecture',
    ratio: 2 / 3,
  },
  {
    src: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80',
    title: 'Studio Portrait',
    photographer: 'Aisha Patel',
    category: 'People',
    ratio: 1 / 1,
  },
  {
    src: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&q=80',
    title: 'Autumn Path',
    photographer: 'Carlos Mendez',
    category: 'Nature',
    ratio: 3 / 4,
  },
  {
    src: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&q=80',
    title: 'Light Study',
    photographer: 'Nina Zhang',
    category: 'Architecture',
    ratio: 16 / 9,
  },
  {
    src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    title: 'Quiet Strength',
    photographer: 'Ravi Sharma',
    category: 'People',
    ratio: 4 / 3,
  },
  {
    src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
    title: 'Morning Rays',
    photographer: 'Emily Larsson',
    category: 'Nature',
    ratio: 16 / 9,
  },
  {
    src: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=800&q=80',
    title: 'Symmetry',
    photographer: 'Kenji Tanaka',
    category: 'Architecture',
    ratio: 1 / 1,
  },
];


// ─── Gallery Item ───────────────────────────────────────────────────────────

function GalleryItemCard({item}: {item: GalleryItem}) {
  return (
    <div style={{breakInside: 'avoid', marginBottom: 16}}>
      <XDSAspectRatio ratio={item.ratio}>
        <img
          src={item.src}
          alt={item.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: 'var(--radius-element, 8px)',
          }}
        />
      </XDSAspectRatio>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function MixedGalleryTemplate() {
  const [activeCategory, setActiveCategory] = useState<Category>('All');

  const filteredItems =
    activeCategory === 'All'
      ? GALLERY_ITEMS
      : GALLERY_ITEMS.filter(item => item.category === activeCategory);

  return (
    <XDSAppShell
      height="auto"
      contentPadding={0}
      variant="surface">
      <XDSCenter axis="horizontal">
        <div style={{maxWidth: 1400, width: '100%', padding: '48px 24px 64px'}}>
          <XDSVStack gap={8}>
            {/* Hero heading */}
            <XDSVStack
              gap={2}
              style={{alignItems: 'center', textAlign: 'center'}}>
              <XDSText
                type="large"
                weight="bold"
                as="p"
                style={{fontSize: 'var(--font-size-2xl)'}}>
                Make every day a little more delightful, one small detail at a time.
              </XDSText>
              <XDSText type="body">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim excepteur sint occaecat cupidatat non proident.
              </XDSText>
            </XDSVStack>

            {/* Category filter buttons */}
            <XDSCenter axis="horizontal">
              <div style={{display: 'flex', gap: 8}}>
                {CATEGORIES.map(cat => (
                  <XDSButton
                    key={cat}
                    label={cat}
                    variant={activeCategory === cat ? 'primary' : 'secondary'}
                    onClick={() => setActiveCategory(cat)}
                  />
                ))}
              </div>
            </XDSCenter>

            {/* Masonry layout — CSS columns for staggered effect */}
            <div
              style={{
                columnCount: 3,
                columnGap: 16,
              }}>
              {filteredItems.map((item, index) => (
                <GalleryItemCard key={`${item.title}-${index}`} item={item} />
              ))}
            </div>
          </XDSVStack>
        </div>
      </XDSCenter>
    </XDSAppShell>
  );
}
