'use client';

import {useState} from 'react';
import {XDSAppShell} from '@xds/core/AppShell';
import {XDSTopNav, XDSTopNavHeading, XDSTopNavItem} from '@xds/core/TopNav';
import {XDSVStack} from '@xds/core/Layout';
import {XDSCenter} from '@xds/core/Center';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSNavIcon} from '@xds/core/NavIcon';
import {XDSCard} from '@xds/core/Card';
import {XDSAspectRatio} from '@xds/core/AspectRatio';

// ─── Icons ──────────────────────────────────────────────────────────────────

const ApertureIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="14.31" y1="8" x2="20.05" y2="17.94" />
    <line x1="9.69" y1="8" x2="21.17" y2="8" />
    <line x1="7.38" y1="12" x2="13.12" y2="2.06" />
    <line x1="9.69" y1="16" x2="3.95" y2="6.06" />
    <line x1="14.31" y1="16" x2="2.83" y2="16" />
    <line x1="16.62" y1="12" x2="10.88" y2="21.94" />
  </svg>
);

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

// ─── TopNav ─────────────────────────────────────────────────────────────────

function GalleryTopNav({
  activeCategory,
  onCategoryChange,
}: {
  activeCategory: Category;
  onCategoryChange: (cat: Category) => void;
}) {
  return (
    <XDSTopNav
      label="Gallery navigation"
      heading={
        <XDSTopNavHeading
          heading="Studio"
          logo={
            <XDSNavIcon
              icon={<ApertureIcon style={{width: 16, height: 16}} />}
            />
          }
          href="#"
        />
      }
      centerContent={
        <>
          {CATEGORIES.map(cat => (
            <XDSTopNavItem
              key={cat}
              label={cat}
              href="#"
              isSelected={activeCategory === cat}
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                onCategoryChange(cat);
              }}
            />
          ))}
        </>
      }
    />
  );
}

// ─── Gallery Item ───────────────────────────────────────────────────────────

function GalleryItemCard({item}: {item: GalleryItem}) {
  return (
    <XDSCard padding={0} style={{breakInside: 'avoid', marginBottom: 16}}>
      <XDSAspectRatio ratio={item.ratio}>
        <img
          src={item.src}
          alt={item.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </XDSAspectRatio>
      <XDSVStack gap={0.5} style={{padding: '12px 16px 16px'}}>
        <XDSText type="label">{item.title}</XDSText>
        <XDSText type="supporting">{item.photographer}</XDSText>
      </XDSVStack>
    </XDSCard>
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
      topNav={
        <GalleryTopNav
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      }
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
              <XDSHeading level={1}>Curated Collection</XDSHeading>
              <XDSText type="body" color="secondary">
                A handpicked selection of photography across nature,
                architecture, and portraiture
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
