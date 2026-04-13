'use client';

import {XDSAppShell} from '@xds/core/AppShell';
import {XDSTopNav, XDSTopNavHeading, XDSTopNavItem} from '@xds/core/TopNav';
import {XDSNavIcon} from '@xds/core/NavIcon';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSCenter} from '@xds/core/Center';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSGrid, XDSGridSpan} from '@xds/core/Grid';
import {XDSAspectRatio} from '@xds/core/AspectRatio';
import {XDSDivider} from '@xds/core/Divider';

// ─── Inline SVG Icons ───────────────────────────────────────────────────────

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

const ArrowRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const MenuIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    {...props}>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

// ─── Image Data ─────────────────────────────────────────────────────────────

const IMAGES = [
  {
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    alt: 'Mountain landscape at golden hour',
    ratio: 3 / 4,
  },
  {
    src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80',
    alt: 'Sunlight through forest canopy',
    ratio: 4 / 3,
  },
  {
    src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&q=80',
    alt: 'Calm ocean at sunset',
    ratio: 1 / 1,
  },
  {
    src: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=600&q=80',
    alt: 'Abstract architectural detail',
    ratio: 4 / 3,
  },
  {
    src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80',
    alt: 'Misty valley panorama',
    ratio: 3 / 4,
  },
];

// ─── TopNav ─────────────────────────────────────────────────────────────────

function GalleryTopNav() {
  return (
    <XDSTopNav
      label="Gallery navigation"
      heading={
        <XDSTopNavHeading
          heading="Atelier"
          logo={
            <XDSNavIcon icon={<CameraIcon style={{width: 16, height: 16}} />} />
          }
          href="#"
        />
      }
      centerContent={
        <>
          <XDSTopNavItem label="Work" href="#" isSelected />
          <XDSTopNavItem label="About" href="#" />
          <XDSTopNavItem label="Contact" href="#" />
        </>
      }
      endContent={
        <XDSButton
          label="Menu"
          variant="ghost"
          icon={<MenuIcon style={{width: 16, height: 16}} />}
          isIconOnly
        />
      }
    />
  );
}

// ─── Image Collage ──────────────────────────────────────────────────────────

function ImageCollage() {
  return (
    <XDSGrid columns={2} gap={3}>
      {/* Tall image spanning 2 rows for asymmetry */}
      <XDSGridSpan rows={2}>
        <XDSCard padding={0}>
          <XDSAspectRatio ratio={IMAGES[0].ratio}>
            <img
              src={IMAGES[0].src}
              alt={IMAGES[0].alt}
              style={{width: '100%', height: '100%', objectFit: 'cover'}}
            />
          </XDSAspectRatio>
        </XDSCard>
      </XDSGridSpan>

      {/* Top-right: landscape */}
      <XDSCard padding={0}>
        <XDSAspectRatio ratio={IMAGES[1].ratio}>
          <img
            src={IMAGES[1].src}
            alt={IMAGES[1].alt}
            style={{width: '100%', height: '100%', objectFit: 'cover'}}
          />
        </XDSAspectRatio>
      </XDSCard>

      {/* Mid-right: square */}
      <XDSCard padding={0}>
        <XDSAspectRatio ratio={IMAGES[2].ratio}>
          <img
            src={IMAGES[2].src}
            alt={IMAGES[2].alt}
            style={{width: '100%', height: '100%', objectFit: 'cover'}}
          />
        </XDSAspectRatio>
      </XDSCard>

      {/* Bottom row spanning full width */}
      <XDSGridSpan columns="full">
        <XDSGrid columns={2} gap={3}>
          <XDSCard padding={0}>
            <XDSAspectRatio ratio={IMAGES[3].ratio}>
              <img
                src={IMAGES[3].src}
                alt={IMAGES[3].alt}
                style={{width: '100%', height: '100%', objectFit: 'cover'}}
              />
            </XDSAspectRatio>
          </XDSCard>
          <XDSCard padding={0}>
            <XDSAspectRatio ratio={IMAGES[4].ratio}>
              <img
                src={IMAGES[4].src}
                alt={IMAGES[4].alt}
                style={{width: '100%', height: '100%', objectFit: 'cover'}}
              />
            </XDSAspectRatio>
          </XDSCard>
        </XDSGrid>
      </XDSGridSpan>
    </XDSGrid>
  );
}

// ─── Stat Block ─────────────────────────────────────────────────────────────

function StatBlock({value, label}: {value: string; label: string}) {
  return (
    <XDSVStack gap={0}>
      <XDSText type="large" weight="bold">
        {value}
      </XDSText>
      <XDSText type="supporting" color="secondary">
        {label}
      </XDSText>
    </XDSVStack>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function SideGalleryTemplate() {
  return (
    <XDSAppShell
      topNav={<GalleryTopNav />}
      height="auto"
      contentPadding={0}
      variant="surface">
      <XDSCenter axis="horizontal">
        <div style={{maxWidth: 1400, width: '100%'}}>
          <XDSGrid columns={5} gap={6}>
            {/* Left side: Text + CTA */}
            <XDSGridSpan columns={2}>
              <XDSVStack gap={6} vAlign="center">
                <XDSVStack gap={3}>
                  <XDSText type="label" color="secondary">
                    Photography Studio
                  </XDSText>
                  <XDSHeading level={1}>
                    Capturing Moments That Last Forever
                  </XDSHeading>
                  <XDSText type="body" color="secondary">
                    We craft visual stories through the lens — from intimate
                    portraits to sweeping landscapes. Every frame is a
                    conversation between light and emotion.
                  </XDSText>
                </XDSVStack>

                <XDSHStack gap={3} vAlign="center">
                  <XDSButton label="Explore Gallery" variant="primary" />
                  <XDSButton
                    label="View Collections"
                    variant="ghost"
                    icon={<ArrowRightIcon style={{width: 16, height: 16}} />}
                  />
                </XDSHStack>

                <XDSVStack gap={4}>
                  <XDSDivider />
                  <XDSHStack gap={6}>
                    <StatBlock value="12k+" label="Photos" />
                    <StatBlock value="350+" label="Projects" />
                    <StatBlock value="8yrs" label="Experience" />
                  </XDSHStack>
                </XDSVStack>
              </XDSVStack>
            </XDSGridSpan>

            {/* Right side: Image Collage */}
            <XDSGridSpan columns={3}>
              <ImageCollage />
            </XDSGridSpan>
          </XDSGrid>
        </div>
      </XDSCenter>
    </XDSAppShell>
  );
}
