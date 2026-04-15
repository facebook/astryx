'use client';

import {useState} from 'react';
import {XDSAppShell} from '@xds/core/AppShell';
import {XDSTopNav, XDSTopNavHeading, XDSTopNavItem} from '@xds/core/TopNav';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSCenter} from '@xds/core/Center';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSNavIcon} from '@xds/core/NavIcon';
import {XDSGrid} from '@xds/core/Grid';
import {XDSCard} from '@xds/core/Card';
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

const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ChevronLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

// ─── Gallery Data ───────────────────────────────────────────────────────────

const GALLERY_ITEMS = [
  {
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    title: 'Alpine Dawn',
    description: 'First light over the Swiss Alps',
  },
  {
    src: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80',
    title: 'Steel & Glass',
    description: 'Modern architecture in downtown Chicago',
  },
  {
    src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80',
    title: 'Forest Path',
    description: 'Misty morning in the Pacific Northwest',
  },
  {
    src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    title: 'Coastal Calm',
    description: 'Turquoise waters of the Maldives',
  },
];

// ─── TopNav ─────────────────────────────────────────────────────────────────

function GalleryTopNav() {
  return (
    <XDSTopNav
      label="Gallery navigation"
      heading={
        <XDSTopNavHeading
          heading="Gallery"
          logo={
            <XDSNavIcon icon={<CameraIcon style={{width: 16, height: 16}} />} />
          }
          href="#"
        />
      }
      centerContent={
        <>
          <XDSTopNavItem label="All" href="#" isSelected />
          <XDSTopNavItem label="Nature" href="#" />
          <XDSTopNavItem label="Architecture" href="#" />
          <XDSTopNavItem label="Travel" href="#" />
        </>
      }
    />
  );
}

// ─── Lightbox ───────────────────────────────────────────────────────────────

function Lightbox({
  item,
  onClose,
  onPrev,
  onNext,
}: {
  item: (typeof GALLERY_ITEMS)[number];
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
      role="dialog"
      aria-label="Image lightbox">
      <button
        onClick={onClose}
        aria-label="Close lightbox"
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          background: 'none',
          border: 'none',
          color: '#fff',
          cursor: 'pointer',
          padding: 8,
        }}>
        <CloseIcon style={{width: 24, height: 24}} />
      </button>

      <button
        onClick={e => {
          e.stopPropagation();
          onPrev();
        }}
        aria-label="Previous image"
        style={{
          position: 'absolute',
          left: 16,
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(255, 255, 255, 0.1)',
          border: 'none',
          color: '#fff',
          cursor: 'pointer',
          padding: 12,
          borderRadius: '50%',
        }}>
        <ChevronLeftIcon style={{width: 24, height: 24}} />
      </button>

      <div
        onClick={e => e.stopPropagation()}
        style={{maxWidth: '85vw', maxHeight: '85vh'}}>
        <img
          src={item.src}
          alt={item.title}
          style={{
            maxWidth: '100%',
            maxHeight: '75vh',
            objectFit: 'contain',
          }}
        />
      </div>

      <button
        onClick={e => {
          e.stopPropagation();
          onNext();
        }}
        aria-label="Next image"
        style={{
          position: 'absolute',
          right: 16,
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(255, 255, 255, 0.1)',
          border: 'none',
          color: '#fff',
          cursor: 'pointer',
          padding: 12,
          borderRadius: '50%',
        }}>
        <ChevronRightIcon style={{width: 24, height: 24}} />
      </button>
    </div>
  );
}

// ─── Gallery Card ───────────────────────────────────────────────────────────

function GalleryCard({
  item,
  onClick,
}: {
  item: (typeof GALLERY_ITEMS)[number];
  onClick: () => void;
}) {
  return (
    <XDSCard padding={0}>
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
        style={{cursor: 'pointer'}}>
        <XDSAspectRatio ratio={4 / 3}>
          <img
            src={item.src}
            alt={item.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </XDSAspectRatio>
        <XDSVStack gap={0.5} style={{padding: '12px 16px'}}>
          <XDSText type="label" weight="bold">
            {item.title}
          </XDSText>
          <XDSText type="supporting" color="secondary">
            {item.description}
          </XDSText>
        </XDSVStack>
      </div>
    </XDSCard>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function ClassicGalleryTemplate() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const prevImage = () =>
    setLightboxIndex(i =>
      i !== null ? (i - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length : null,
    );
  const nextImage = () =>
    setLightboxIndex(i => (i !== null ? (i + 1) % GALLERY_ITEMS.length : null));

  return (
    <XDSAppShell
      topNav={<GalleryTopNav />}
      height="auto"
      contentPadding={0}
      variant="surface">
      <XDSCenter axis="horizontal">
        <div style={{maxWidth: 1200, width: '100%', padding: '48px 24px'}}>
          <XDSVStack gap={8}>
            <XDSVStack gap={2} hAlign="center">
              <XDSHeading level={1}>Photo Collection</XDSHeading>
              <XDSText type="body" color="secondary">
                A curated selection of nature and architecture photography
              </XDSText>
            </XDSVStack>

            <XDSGrid columns={2} gap={4}>
              {GALLERY_ITEMS.map((item, index) => (
                <GalleryCard
                  key={index}
                  item={item}
                  onClick={() => openLightbox(index)}
                />
              ))}
            </XDSGrid>

            <XDSCenter axis="horizontal">
              <XDSButton label="View all photos" variant="secondary" />
            </XDSCenter>
          </XDSVStack>
        </div>
      </XDSCenter>

      {lightboxIndex !== null && (
        <Lightbox
          item={GALLERY_ITEMS[lightboxIndex]}
          onClose={closeLightbox}
          onPrev={prevImage}
          onNext={nextImage}
        />
      )}
    </XDSAppShell>
  );
}
