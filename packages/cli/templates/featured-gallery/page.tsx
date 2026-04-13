'use client';

import {useState} from 'react';
import {XDSAppShell} from '@xds/core/AppShell';
import {XDSTopNav, XDSTopNavHeading, XDSTopNavItem} from '@xds/core/TopNav';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSCenter} from '@xds/core/Center';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSNavIcon} from '@xds/core/NavIcon';
import {XDSGrid, XDSGridSpan} from '@xds/core/Grid';
import {XDSAspectRatio} from '@xds/core/AspectRatio';

// ─── Icons ──────────────────────────────────────────────────────────────────
const CameraIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

const HeartIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);

const GridIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
  </svg>
);

const ShareIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const DownloadIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

// ─── Gallery Data ───────────────────────────────────────────────────────────
const GALLERY_ITEMS = [
  {
    src: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=900&q=80',
    title: 'Golden Hour Portrait',
    photographer: 'Elena Marquez',
  },
  {
    src: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=900&q=80',
    title: 'Abstract Geometry',
    photographer: 'Marcus Chen',
  },
  {
    src: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=900&q=80',
    title: 'Vivid Brushstrokes',
    photographer: 'Sophie Laurent',
  },
  {
    src: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=900&q=80',
    title: 'Color Fields',
    photographer: 'James Okafor',
  },
  {
    src: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=900&q=80',
    title: 'Gallery Wall',
    photographer: 'Anna Petrov',
  },
  {
    src: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=900&q=80',
    title: 'Sculpted Light',
    photographer: 'David Kim',
  },
  {
    src: 'https://images.unsplash.com/photo-1482160549825-59d1b23cb208?w=900&q=80',
    title: 'Urban Layers',
    photographer: 'Lena Fischer',
  },
  {
    src: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=900&q=80',
    title: 'Spectrum Study',
    photographer: 'Tomás Rivera',
  },
];

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function FeaturedGalleryTemplate() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const featured = GALLERY_ITEMS[selectedIndex];

  // Thumbnails are all items except the currently featured one
  const thumbnails = GALLERY_ITEMS.filter((_, i) => i !== selectedIndex).slice(
    0,
    4,
  );

  return (
    <XDSAppShell
      topNav={
        <XDSTopNav
          label="Gallery navigation"
          heading={
            <XDSTopNavHeading
              heading="Showroom"
              logo={
                <XDSNavIcon
                  icon={<CameraIcon style={{width: 16, height: 16}} />}
                />
              }
              href="#"
            />
          }
          centerContent={
            <>
              <XDSTopNavItem label="Featured" href="#" isSelected />
              <XDSTopNavItem label="Collections" href="#" />
              <XDSTopNavItem label="Artists" href="#" />
              <XDSTopNavItem label="Exhibitions" href="#" />
            </>
          }
          endContent={
            <>
              <XDSButton
                label="Search"
                variant="ghost"
                icon={<SearchIcon style={{width: 16, height: 16}} />}
                isIconOnly
              />
              <XDSButton
                label="Favorites"
                variant="ghost"
                icon={<HeartIcon style={{width: 16, height: 16}} />}
                isIconOnly
              />
              <XDSButton
                label="Grid view"
                variant="ghost"
                icon={<GridIcon style={{width: 16, height: 16}} />}
                isIconOnly
              />
            </>
          }
        />
      }
      height="auto"
      contentPadding={0}
      variant="surface">
      <XDSCenter axis="horizontal">
        <div style={{maxWidth: 1200, width: '100%', padding: '32px 24px 64px'}}>
          {/* Featured + Thumbnails Grid */}
          <XDSGrid columns={3} gap={4}>
            {/* Featured image — spans 2 columns and 2 rows */}
            <XDSGridSpan columns={2} rows={2}>
              <XDSCard padding={0}>
                <XDSAspectRatio ratio={4 / 5}>
                  <img
                    src={featured.src}
                    alt={featured.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </XDSAspectRatio>
              </XDSCard>
            </XDSGridSpan>

            {/* Thumbnails in right column — stacked vertically */}
            <XDSGridSpan rows={2}>
              <XDSVStack gap={4}>
                {thumbnails.map((item, i) => {
                  const realIndex = GALLERY_ITEMS.indexOf(item);
                  return (
                    <div
                      key={realIndex}
                      role="button"
                      tabIndex={0}
                      aria-label={`View ${item.title}`}
                      onClick={() => setSelectedIndex(realIndex)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedIndex(realIndex);
                        }
                      }}
                      style={{cursor: 'pointer'}}>
                      <XDSCard
                        padding={0}
                        style={{
                          outline:
                            selectedIndex === realIndex
                              ? '2.5px solid var(--color-accent, #0866ff)'
                              : '2.5px solid transparent',
                          outlineOffset: 2,
                        }}>
                        <XDSAspectRatio ratio={4 / 3}>
                          <img
                            src={item.src}
                            alt={item.title}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              opacity: selectedIndex === realIndex ? 1 : 0.75,
                            }}
                          />
                        </XDSAspectRatio>
                      </XDSCard>
                    </div>
                  );
                })}
              </XDSVStack>
            </XDSGridSpan>
          </XDSGrid>

          {/* Caption below gallery */}
          <XDSVStack gap={1} style={{marginTop: 16}}>
            <XDSHStack gap={3} vAlign="center">
              <XDSVStack gap={0}>
                <XDSHeading level={2}>{featured.title}</XDSHeading>
                <XDSText type="body" color="secondary">
                  Photographed by {featured.photographer}
                </XDSText>
              </XDSVStack>
              <XDSHStack gap={1}>
                <XDSButton
                  label="Save to favorites"
                  variant="ghost"
                  icon={<HeartIcon style={{width: 16, height: 16}} />}
                  isIconOnly
                />
                <XDSButton
                  label="Share"
                  variant="ghost"
                  icon={<ShareIcon style={{width: 16, height: 16}} />}
                  isIconOnly
                />
                <XDSButton
                  label="Download"
                  variant="ghost"
                  icon={<DownloadIcon style={{width: 16, height: 16}} />}
                  isIconOnly
                />
              </XDSHStack>
            </XDSHStack>
          </XDSVStack>

          {/* All images row */}
          <XDSVStack gap={4} style={{marginTop: 40}}>
            <XDSHeading level={3}>All in this collection</XDSHeading>
            <XDSGrid columns={4} gap={4}>
              {GALLERY_ITEMS.map((item, i) => (
                <div
                  key={i}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${item.title}`}
                  onClick={() => setSelectedIndex(i)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedIndex(i);
                    }
                  }}
                  style={{cursor: 'pointer'}}>
                  <XDSCard
                    padding={0}
                    style={{
                      outline:
                        selectedIndex === i
                          ? '2.5px solid var(--color-accent, #0866ff)'
                          : '2.5px solid transparent',
                      outlineOffset: 2,
                    }}>
                    <XDSAspectRatio ratio={1}>
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
                  </XDSCard>
                  <XDSVStack gap={0} style={{marginTop: 8}}>
                    <XDSText type="label">{item.title}</XDSText>
                    <XDSText type="supporting" color="secondary">
                      {item.photographer}
                    </XDSText>
                  </XDSVStack>
                </div>
              ))}
            </XDSGrid>
          </XDSVStack>
        </div>
      </XDSCenter>
    </XDSAppShell>
  );
}
