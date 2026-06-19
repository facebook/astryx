// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {XDSToolbar} from '@xds/core/Toolbar';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSSection} from '@xds/core/Section';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSLayout} from '@xds/core/Layout';
import {XDSLayoutHeader} from '@xds/core/Layout';
import {XDSLayoutContent} from '@xds/core/Layout';
import {XDSVStack} from '@xds/core/Layout';
import {
  Cog6ToothIcon,
  FunnelIcon,
  PlusIcon,
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ShareIcon,
  EllipsisHorizontalIcon,
  MagnifyingGlassIcon,
  BellIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';

const meta: Meta<typeof XDSToolbar> = {
  title: 'Core/ToolbarEdgeCompensation',
  component: XDSToolbar,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof XDSToolbar>;

function AlignmentGuide({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div>
      <div style={{marginBottom: 8, fontSize: 12, color: '#666'}}>{label}</div>
      {children}
    </div>
  );
}

function BodyContent({lines = 3}: {lines?: number}) {
  return (
    <XDSVStack gap={2}>
      {Array.from({length: lines}, (_, i) => (
        <XDSText type="body" key={i}>
          {i === 0
            ? 'Body content should align with the toolbar text or button labels above.'
            : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.'}
        </XDSText>
      ))}
    </XDSVStack>
  );
}

// ---------------------------------------------------------------------------
// 1. Ghost buttons at edges
// ---------------------------------------------------------------------------

/** Ghost buttons in start and end slots across all three sizes. The button text/icon should align flush with the container edge. */
export const GhostButtonsBothEdges: Story = {
  name: 'Ghost buttons: start + end',
  render: () => (
    <XDSVStack gap={4}>
      {(['sm', 'md', 'lg'] as const).map(size => (
        <AlignmentGuide key={size} label={`size="${size}"`}>
          <XDSCard width={600}>
            <XDSToolbar
              label={`Ghost buttons ${size}`}
              size={size}
              dividers={['bottom']}
              startContent={
                <>
                  <XDSButton
                    label="Back"
                    variant="ghost"
                    icon={<ArrowLeftIcon />}
                    isIconOnly
                  />
                  <XDSButton label="Edit" variant="ghost" />
                  <XDSButton label="Share" variant="ghost" />
                </>
              }
              endContent={
                <>
                  <XDSButton
                    label="Filter"
                    variant="ghost"
                    icon={<FunnelIcon />}
                    isIconOnly
                  />
                  <XDSButton
                    label="Settings"
                    variant="ghost"
                    icon={<Cog6ToothIcon />}
                    isIconOnly
                  />
                </>
              }
            />
            <XDSSection>
              <BodyContent />
            </XDSSection>
          </XDSCard>
        </AlignmentGuide>
      ))}
    </XDSVStack>
  ),
};

// ---------------------------------------------------------------------------
// 2. Solid buttons at edges — no compensation needed
// ---------------------------------------------------------------------------

/** Solid (default) buttons at edges. These should NOT compensate — their padding is visually filled. */
export const SolidButtonsBothEdges: Story = {
  name: 'Solid buttons: start + end',
  render: () => (
    <XDSVStack gap={4}>
      {(['sm', 'md', 'lg'] as const).map(size => (
        <AlignmentGuide key={size} label={`size="${size}"`}>
          <XDSCard width={600}>
            <XDSToolbar
              label={`Solid buttons ${size}`}
              size={size}
              dividers={['bottom']}
              startContent={<XDSButton label="New item" icon={<PlusIcon />} />}
              endContent={<XDSButton label="Save" />}
            />
            <XDSSection>
              <BodyContent />
            </XDSSection>
          </XDSCard>
        </AlignmentGuide>
      ))}
    </XDSVStack>
  ),
};

// ---------------------------------------------------------------------------
// 3. Mixed: ghost start, solid end
// ---------------------------------------------------------------------------

/** Ghost on start edge, solid on end. Only the start should compensate. */
export const GhostStartSolidEnd: Story = {
  name: 'Mixed: ghost start, solid end',
  render: () => (
    <XDSVStack gap={4}>
      {(['sm', 'md', 'lg'] as const).map(size => (
        <AlignmentGuide key={size} label={`size="${size}"`}>
          <XDSCard width={600}>
            <XDSToolbar
              label={`Mixed ${size}`}
              size={size}
              dividers={['bottom']}
              startContent={
                <>
                  <XDSButton
                    label="Back"
                    variant="ghost"
                    icon={<ArrowLeftIcon />}
                    isIconOnly
                  />
                  <XDSButton label="Edit" variant="ghost" />
                </>
              }
              endContent={<XDSButton label="Save" />}
            />
            <XDSSection>
              <BodyContent />
            </XDSSection>
          </XDSCard>
        </AlignmentGuide>
      ))}
    </XDSVStack>
  ),
};

// ---------------------------------------------------------------------------
// 4. Mixed: solid start, ghost end
// ---------------------------------------------------------------------------

/** Solid on start edge, ghost on end. Only the end should compensate. */
export const SolidStartGhostEnd: Story = {
  name: 'Mixed: solid start, ghost end',
  render: () => (
    <XDSVStack gap={4}>
      {(['sm', 'md', 'lg'] as const).map(size => (
        <AlignmentGuide key={size} label={`size="${size}"`}>
          <XDSCard width={600}>
            <XDSToolbar
              label={`Mixed ${size}`}
              size={size}
              dividers={['bottom']}
              startContent={<XDSButton label="New item" icon={<PlusIcon />} />}
              endContent={
                <>
                  <XDSButton
                    label="Filter"
                    variant="ghost"
                    icon={<FunnelIcon />}
                    isIconOnly
                  />
                  <XDSButton
                    label="More"
                    variant="ghost"
                    icon={<EllipsisHorizontalIcon />}
                    isIconOnly
                  />
                </>
              }
            />
            <XDSSection>
              <BodyContent />
            </XDSSection>
          </XDSCard>
        </AlignmentGuide>
      ))}
    </XDSVStack>
  ),
};

// ---------------------------------------------------------------------------
// 5. Heading as start content + ghost end
// ---------------------------------------------------------------------------

/** Heading in start slot with ghost buttons at end. Check heading alignment with body text below. */
export const HeadingStartGhostEnd: Story = {
  name: 'Heading start + ghost end',
  render: () => (
    <XDSVStack gap={4}>
      {(['sm', 'md', 'lg'] as const).map(size => (
        <AlignmentGuide key={size} label={`size="${size}"`}>
          <XDSCard width={600}>
            <XDSToolbar
              label={`Heading ${size}`}
              size={size}
              dividers={['bottom']}
              startContent={<XDSHeading level={4}>Section Title</XDSHeading>}
              endContent={
                <>
                  <XDSButton
                    label="Filter"
                    variant="ghost"
                    icon={<FunnelIcon />}
                    isIconOnly
                  />
                  <XDSButton
                    label="Add"
                    variant="ghost"
                    icon={<PlusIcon />}
                    isIconOnly
                  />
                </>
              }
            />
            <XDSSection>
              <BodyContent />
            </XDSSection>
          </XDSCard>
        </AlignmentGuide>
      ))}
    </XDSVStack>
  ),
};

// ---------------------------------------------------------------------------
// 6. Text as start content + ghost end
// ---------------------------------------------------------------------------

/** Text (not heading) in start slot with ghost buttons. */
export const TextStartGhostEnd: Story = {
  name: 'Text start + ghost end',
  render: () => (
    <XDSCard width={600}>
      <XDSToolbar
        label="Text start"
        dividers={['bottom']}
        startContent={
          <XDSText type="body" weight="bold">
            3 items selected
          </XDSText>
        }
        endContent={
          <>
            <XDSButton label="Delete" variant="ghost" />
            <XDSButton label="Archive" variant="ghost" />
          </>
        }
      />
      <XDSSection>
        <BodyContent />
      </XDSSection>
    </XDSCard>
  ),
};

// ---------------------------------------------------------------------------
// 7. Heading start + solid end
// ---------------------------------------------------------------------------

/** Heading on start, solid on end. No edge compensation on buttons — check heading vs body alignment. */
export const HeadingStartSolidEnd: Story = {
  name: 'Heading start + solid end',
  render: () => (
    <XDSCard width={600}>
      <XDSToolbar
        label="Heading solid"
        dividers={['bottom']}
        startContent={<XDSHeading level={4}>Project Settings</XDSHeading>}
        endContent={<XDSButton label="Save changes" />}
      />
      <XDSSection>
        <BodyContent />
      </XDSSection>
    </XDSCard>
  ),
};

// ---------------------------------------------------------------------------
// 8. Layout WITHOUT contentWidth — toolbar full bleed
// ---------------------------------------------------------------------------

/** Toolbar in XDSLayout header, no contentWidth. Full-width toolbar, edge compensation normal. */
export const LayoutNoContentWidth: Story = {
  name: 'Layout: no contentWidth, ghost buttons',
  render: () => (
    <div style={{height: 400, border: '1px solid #e0e0e0', borderRadius: 8}}>
      <XDSLayout
        header={
          <XDSLayoutHeader hasDivider padding={0}>
            <XDSToolbar
              label="App header"
              startContent={
                <>
                  <XDSButton
                    label="Menu"
                    variant="ghost"
                    icon={<Squares2X2Icon />}
                    isIconOnly
                  />
                  <XDSHeading level={4}>Dashboard</XDSHeading>
                </>
              }
              endContent={
                <>
                  <XDSButton
                    label="Search"
                    variant="ghost"
                    icon={<MagnifyingGlassIcon />}
                    isIconOnly
                  />
                  <XDSButton
                    label="Notifications"
                    variant="ghost"
                    icon={<BellIcon />}
                    isIconOnly
                  />
                  <XDSButton
                    label="Settings"
                    variant="ghost"
                    icon={<Cog6ToothIcon />}
                    isIconOnly
                  />
                </>
              }
            />
          </XDSLayoutHeader>
        }
        content={
          <XDSLayoutContent>
            <BodyContent lines={6} />
          </XDSLayoutContent>
        }
      />
    </div>
  ),
};

/** Same without contentWidth but solid buttons for baseline comparison. */
export const LayoutNoContentWidthSolid: Story = {
  name: 'Layout: no contentWidth, solid buttons',
  render: () => (
    <div style={{height: 400, border: '1px solid #e0e0e0', borderRadius: 8}}>
      <XDSLayout
        header={
          <XDSLayoutHeader hasDivider padding={0}>
            <XDSToolbar
              label="App header"
              startContent={<XDSHeading level={4}>Dashboard</XDSHeading>}
              endContent={
                <>
                  <XDSButton label="Cancel" variant="secondary" />
                  <XDSButton label="Save" />
                </>
              }
            />
          </XDSLayoutHeader>
        }
        content={
          <XDSLayoutContent>
            <BodyContent lines={6} />
          </XDSLayoutContent>
        }
      />
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 9. Layout WITH contentWidth — the critical case
// ---------------------------------------------------------------------------

/** Toolbar in XDSLayout with contentWidth=640. Header is full bleed, body is constrained. Ghost buttons should still align flush. */
export const LayoutWithContentWidth: Story = {
  name: 'Layout: contentWidth=640, ghost buttons',
  render: () => (
    <div style={{height: 400, border: '1px solid #e0e0e0', borderRadius: 8}}>
      <XDSLayout
        contentWidth={640}
        header={
          <XDSLayoutHeader hasDivider padding={0}>
            <XDSToolbar
              label="Page header"
              startContent={
                <>
                  <XDSButton
                    label="Back"
                    variant="ghost"
                    icon={<ArrowLeftIcon />}
                    isIconOnly
                  />
                  <XDSHeading level={4}>Settings</XDSHeading>
                </>
              }
              endContent={
                <>
                  <XDSButton
                    label="Search"
                    variant="ghost"
                    icon={<MagnifyingGlassIcon />}
                    isIconOnly
                  />
                  <XDSButton
                    label="More"
                    variant="ghost"
                    icon={<EllipsisHorizontalIcon />}
                    isIconOnly
                  />
                </>
              }
            />
          </XDSLayoutHeader>
        }
        content={
          <XDSLayoutContent>
            <BodyContent lines={6} />
          </XDSLayoutContent>
        }
      />
    </div>
  ),
};

/** Same with contentWidth but solid buttons for comparison. */
export const LayoutWithContentWidthSolid: Story = {
  name: 'Layout: contentWidth=640, solid buttons',
  render: () => (
    <div style={{height: 400, border: '1px solid #e0e0e0', borderRadius: 8}}>
      <XDSLayout
        contentWidth={640}
        header={
          <XDSLayoutHeader hasDivider padding={0}>
            <XDSToolbar
              label="Page header"
              startContent={<XDSHeading level={4}>Settings</XDSHeading>}
              endContent={
                <>
                  <XDSButton label="Cancel" variant="secondary" />
                  <XDSButton label="Save" />
                </>
              }
            />
          </XDSLayoutHeader>
        }
        content={
          <XDSLayoutContent>
            <BodyContent lines={6} />
          </XDSLayoutContent>
        }
      />
    </div>
  ),
};

/** Mixed ghost/solid with contentWidth — ghost start, solid end. */
export const LayoutWithContentWidthMixed: Story = {
  name: 'Layout: contentWidth=640, mixed',
  render: () => (
    <div style={{height: 400, border: '1px solid #e0e0e0', borderRadius: 8}}>
      <XDSLayout
        contentWidth={640}
        header={
          <XDSLayoutHeader hasDivider padding={0}>
            <XDSToolbar
              label="Page header"
              startContent={
                <>
                  <XDSButton
                    label="Back"
                    variant="ghost"
                    icon={<ArrowLeftIcon />}
                    isIconOnly
                  />
                  <XDSHeading level={4}>Edit Project</XDSHeading>
                </>
              }
              endContent={<XDSButton label="Save changes" />}
            />
          </XDSLayoutHeader>
        }
        content={
          <XDSLayoutContent>
            <BodyContent lines={6} />
          </XDSLayoutContent>
        }
      />
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 10. Wider contentWidth
// ---------------------------------------------------------------------------

/** contentWidth=960, ghost buttons. Common for dashboards. */
export const LayoutContentWidth960: Story = {
  name: 'Layout: contentWidth=960, ghost buttons',
  render: () => (
    <div style={{height: 400, border: '1px solid #e0e0e0', borderRadius: 8}}>
      <XDSLayout
        contentWidth={960}
        header={
          <XDSLayoutHeader hasDivider padding={0}>
            <XDSToolbar
              label="Dashboard header"
              startContent={
                <>
                  <XDSButton
                    label="Back"
                    variant="ghost"
                    icon={<ChevronLeftIcon />}
                    isIconOnly
                  />
                  <XDSHeading level={4}>Analytics Dashboard</XDSHeading>
                </>
              }
              endContent={
                <>
                  <XDSButton
                    label="Share"
                    variant="ghost"
                    icon={<ShareIcon />}
                    isIconOnly
                  />
                  <XDSButton
                    label="Settings"
                    variant="ghost"
                    icon={<Cog6ToothIcon />}
                    isIconOnly
                  />
                </>
              }
            />
          </XDSLayoutHeader>
        }
        content={
          <XDSLayoutContent>
            <BodyContent lines={6} />
          </XDSLayoutContent>
        }
      />
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 11. Layout with padding prop
// ---------------------------------------------------------------------------

/** Layout with padding=4 and ghost toolbar. Layout outer padding interacts with toolbar edge compensation. */
export const LayoutWithPadding: Story = {
  name: 'Layout: padding=4, ghost buttons',
  render: () => (
    <div style={{height: 400, border: '1px solid #e0e0e0', borderRadius: 8}}>
      <XDSLayout
        padding={4}
        header={
          <XDSLayoutHeader hasDivider padding={0}>
            <XDSToolbar
              label="Padded layout header"
              startContent={
                <>
                  <XDSButton
                    label="Back"
                    variant="ghost"
                    icon={<ArrowLeftIcon />}
                    isIconOnly
                  />
                  <XDSHeading level={4}>Padded Layout</XDSHeading>
                </>
              }
              endContent={
                <XDSButton
                  label="Settings"
                  variant="ghost"
                  icon={<Cog6ToothIcon />}
                  isIconOnly
                />
              }
            />
          </XDSLayoutHeader>
        }
        content={
          <XDSLayoutContent>
            <BodyContent lines={6} />
          </XDSLayoutContent>
        }
      />
    </div>
  ),
};

/** Layout with padding + contentWidth together. Both constraints active. */
export const LayoutWithPaddingAndContentWidth: Story = {
  name: 'Layout: padding=4 + contentWidth=640',
  render: () => (
    <div style={{height: 400, border: '1px solid #e0e0e0', borderRadius: 8}}>
      <XDSLayout
        padding={4}
        contentWidth={640}
        header={
          <XDSLayoutHeader hasDivider padding={0}>
            <XDSToolbar
              label="Padded constrained header"
              startContent={
                <>
                  <XDSButton
                    label="Back"
                    variant="ghost"
                    icon={<ArrowLeftIcon />}
                    isIconOnly
                  />
                  <XDSHeading level={4}>Constrained + Padded</XDSHeading>
                </>
              }
              endContent={
                <>
                  <XDSButton
                    label="Share"
                    variant="ghost"
                    icon={<ShareIcon />}
                    isIconOnly
                  />
                  <XDSButton
                    label="Settings"
                    variant="ghost"
                    icon={<Cog6ToothIcon />}
                    isIconOnly
                  />
                </>
              }
            />
          </XDSLayoutHeader>
        }
        content={
          <XDSLayoutContent>
            <BodyContent lines={6} />
          </XDSLayoutContent>
        }
      />
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 12. LayoutHeader with default padding (not padding={0}) — double padding?
// ---------------------------------------------------------------------------

/** Toolbar inside LayoutHeader using the header's default padding (not padding={0}). Potential double-padding issue. */
export const LayoutHeaderDefaultPadding: Story = {
  name: 'Layout: header default padding + toolbar',
  render: () => (
    <div style={{height: 400, border: '1px solid #e0e0e0', borderRadius: 8}}>
      <XDSLayout
        header={
          <XDSLayoutHeader hasDivider>
            <XDSToolbar
              label="Double padded?"
              startContent={
                <>
                  <XDSButton
                    label="Back"
                    variant="ghost"
                    icon={<ArrowLeftIcon />}
                    isIconOnly
                  />
                  <XDSHeading level={4}>Double Padding Check</XDSHeading>
                </>
              }
              endContent={
                <XDSButton
                  label="Settings"
                  variant="ghost"
                  icon={<Cog6ToothIcon />}
                  isIconOnly
                />
              }
            />
          </XDSLayoutHeader>
        }
        content={
          <XDSLayoutContent>
            <BodyContent lines={4} />
          </XDSLayoutContent>
        }
      />
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 13. Side-by-side comparison
// ---------------------------------------------------------------------------

/** Direct visual comparison: ghost vs solid, with body content for alignment reference. */
export const SideBySideComparison: Story = {
  name: 'Comparison: ghost vs solid alignment',
  render: () => (
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24}}>
      <AlignmentGuide label="Ghost buttons (should align flush)">
        <XDSCard>
          <XDSToolbar
            label="Ghost"
            dividers={['bottom']}
            startContent={
              <>
                <XDSButton
                  label="Back"
                  variant="ghost"
                  icon={<ArrowLeftIcon />}
                  isIconOnly
                />
                <XDSButton label="Edit" variant="ghost" />
              </>
            }
            endContent={
              <XDSButton
                label="More"
                variant="ghost"
                icon={<EllipsisHorizontalIcon />}
                isIconOnly
              />
            }
          />
          <XDSSection>
            <BodyContent />
          </XDSSection>
        </XDSCard>
      </AlignmentGuide>
      <AlignmentGuide label="Solid buttons (natural padding)">
        <XDSCard>
          <XDSToolbar
            label="Solid"
            dividers={['bottom']}
            startContent={<XDSButton label="New" icon={<PlusIcon />} />}
            endContent={<XDSButton label="Save" />}
          />
          <XDSSection>
            <BodyContent />
          </XDSSection>
        </XDSCard>
      </AlignmentGuide>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 14. Three-slot with ghost edges
// ---------------------------------------------------------------------------

/** Three-slot (center content) with ghost buttons at both edges. Center stays centered. */
export const ThreeSlotGhostEdges: Story = {
  name: 'Three-slot: ghost edges + center heading',
  render: () => (
    <XDSVStack gap={4}>
      {(['sm', 'md', 'lg'] as const).map(size => (
        <AlignmentGuide key={size} label={`size="${size}"`}>
          <XDSCard width={700}>
            <XDSToolbar
              label={`Three slot ${size}`}
              size={size}
              dividers={['bottom']}
              startContent={
                <XDSButton
                  label="Back"
                  variant="ghost"
                  icon={<ChevronLeftIcon />}
                  isIconOnly
                />
              }
              centerContent={<XDSHeading level={4}>Document Title</XDSHeading>}
              endContent={
                <>
                  <XDSButton
                    label="Share"
                    variant="ghost"
                    icon={<ShareIcon />}
                    isIconOnly
                  />
                  <XDSButton
                    label="More"
                    variant="ghost"
                    icon={<EllipsisHorizontalIcon />}
                    isIconOnly
                  />
                </>
              }
            />
            <XDSSection>
              <BodyContent />
            </XDSSection>
          </XDSCard>
        </AlignmentGuide>
      ))}
    </XDSVStack>
  ),
};

// ---------------------------------------------------------------------------
// 15. Three-slot with mixed ghost/solid
// ---------------------------------------------------------------------------

/** Three-slot: ghost start, center heading, solid end. */
export const ThreeSlotMixed: Story = {
  name: 'Three-slot: ghost start, solid end',
  render: () => (
    <XDSCard width={700}>
      <XDSToolbar
        label="Mixed three slot"
        dividers={['bottom']}
        startContent={
          <XDSButton
            label="Back"
            variant="ghost"
            icon={<ChevronLeftIcon />}
            isIconOnly
          />
        }
        centerContent={<XDSHeading level={4}>Page Title</XDSHeading>}
        endContent={
          <>
            <XDSButton label="Cancel" variant="secondary" />
            <XDSButton label="Publish" />
          </>
        }
      />
      <XDSSection>
        <BodyContent />
      </XDSSection>
    </XDSCard>
  ),
};

// ---------------------------------------------------------------------------
// 16. Stress test: stacked variants
// ---------------------------------------------------------------------------

/** Multiple toolbars stacked — checks edge compensation consistency across adjacent toolbars with different content types. */
export const StackedVariants: Story = {
  name: 'Stress: stacked toolbar variants',
  render: () => (
    <XDSCard width={700}>
      <XDSToolbar
        label="Ghost both"
        size="sm"
        dividers={['bottom']}
        startContent={
          <>
            <XDSButton
              label="Back"
              variant="ghost"
              icon={<ArrowLeftIcon />}
              isIconOnly
            />
            <XDSHeading level={4}>Ghost + Heading</XDSHeading>
          </>
        }
        endContent={
          <XDSButton
            label="Settings"
            variant="ghost"
            icon={<Cog6ToothIcon />}
            isIconOnly
          />
        }
      />
      <XDSToolbar
        label="Solid both"
        size="sm"
        dividers={['bottom']}
        startContent={<XDSButton label="Add" size="sm" icon={<PlusIcon />} />}
        endContent={<XDSButton label="Save" size="sm" />}
      />
      <XDSToolbar
        label="Ghost start solid end"
        size="sm"
        dividers={['bottom']}
        startContent={
          <XDSButton
            label="Back"
            variant="ghost"
            icon={<ChevronLeftIcon />}
            isIconOnly
          />
        }
        endContent={
          <XDSButton label="Next" size="sm" icon={<ChevronRightIcon />} />
        }
      />
      <XDSToolbar
        label="Text start ghost end"
        size="sm"
        dividers={['bottom']}
        startContent={
          <XDSText type="body" weight="bold">
            Selection mode
          </XDSText>
        }
        endContent={<XDSButton label="Done" variant="ghost" />}
      />
      <XDSSection>
        <BodyContent lines={2} />
      </XDSSection>
    </XDSCard>
  ),
};

// ---------------------------------------------------------------------------
// 17. Card > Layout with contentWidth > toolbar as header
// ---------------------------------------------------------------------------

/** Card wrapping a Layout with contentWidth. Toolbar lives in the LayoutHeader. Tests the full nesting chain: Card padding → Layout bleed → contentWidth constraint → toolbar edge compensation. */
export const CardLayoutContentWidthToolbar: Story = {
  name: 'Card > Layout(contentWidth) > Toolbar header',
  render: () => (
    <XDSVStack gap={4}>
      <AlignmentGuide label="contentWidth=640, ghost buttons">
        <XDSCard width={900}>
          <XDSLayout
            contentWidth={640}
            header={
              <XDSLayoutHeader hasDivider padding={0}>
                <XDSToolbar
                  label="Card layout header"
                  startContent={
                    <>
                      <XDSButton
                        label="Back"
                        variant="ghost"
                        icon={<ArrowLeftIcon />}
                        isIconOnly
                      />
                      <XDSHeading level={4}>Project Settings</XDSHeading>
                    </>
                  }
                  endContent={
                    <>
                      <XDSButton
                        label="Search"
                        variant="ghost"
                        icon={<MagnifyingGlassIcon />}
                        isIconOnly
                      />
                      <XDSButton
                        label="Settings"
                        variant="ghost"
                        icon={<Cog6ToothIcon />}
                        isIconOnly
                      />
                    </>
                  }
                />
              </XDSLayoutHeader>
            }
            content={
              <XDSLayoutContent>
                <BodyContent lines={4} />
              </XDSLayoutContent>
            }
          />
        </XDSCard>
      </AlignmentGuide>
      <AlignmentGuide label="contentWidth=640, mixed (ghost start, solid end)">
        <XDSCard width={900}>
          <XDSLayout
            contentWidth={640}
            header={
              <XDSLayoutHeader hasDivider padding={0}>
                <XDSToolbar
                  label="Card layout header"
                  startContent={
                    <>
                      <XDSButton
                        label="Back"
                        variant="ghost"
                        icon={<ArrowLeftIcon />}
                        isIconOnly
                      />
                      <XDSHeading level={4}>Edit Document</XDSHeading>
                    </>
                  }
                  endContent={<XDSButton label="Save changes" />}
                />
              </XDSLayoutHeader>
            }
            content={
              <XDSLayoutContent>
                <BodyContent lines={4} />
              </XDSLayoutContent>
            }
          />
        </XDSCard>
      </AlignmentGuide>
      <AlignmentGuide label="contentWidth=640, heading start, no end">
        <XDSCard width={900}>
          <XDSLayout
            contentWidth={640}
            header={
              <XDSLayoutHeader hasDivider padding={0}>
                <XDSToolbar
                  label="Card layout header"
                  startContent={
                    <XDSHeading level={4}>Notifications</XDSHeading>
                  }
                />
              </XDSLayoutHeader>
            }
            content={
              <XDSLayoutContent>
                <BodyContent lines={4} />
              </XDSLayoutContent>
            }
          />
        </XDSCard>
      </AlignmentGuide>
    </XDSVStack>
  ),
};

// ---------------------------------------------------------------------------
// 18. Card(padding=3/12px) > Layout > toolbar header + body text
// ---------------------------------------------------------------------------

/** Card with 12px padding wrapping a Layout. Toolbar in header, body text in content. Tests that toolbar edge compensation aligns with body text when the card has non-default (smaller) padding. */
export const CardSmallPaddingLayoutToolbar: Story = {
  name: 'Card(12px) > Layout > Toolbar + body',
  render: () => (
    <XDSCard width={700} padding={3}>
      <XDSLayout
        header={
          <XDSLayoutHeader hasDivider padding={0}>
            <XDSToolbar
              label="Card header"
              startContent={
                <>
                  <XDSButton
                    label="Back"
                    variant="ghost"
                    icon={<ArrowLeftIcon />}
                    isIconOnly
                  />
                  <XDSHeading level={4}>Project Settings</XDSHeading>
                </>
              }
              endContent={
                <>
                  <XDSButton
                    label="Search"
                    variant="ghost"
                    icon={<MagnifyingGlassIcon />}
                    isIconOnly
                  />
                  <XDSButton
                    label="Settings"
                    variant="ghost"
                    icon={<Cog6ToothIcon />}
                    isIconOnly
                  />
                </>
              }
            />
          </XDSLayoutHeader>
        }
        content={
          <XDSLayoutContent>
            <BodyContent lines={4} />
          </XDSLayoutContent>
        }
      />
    </XDSCard>
  ),
};

// ---------------------------------------------------------------------------
// 19. Toolbar with TabList — size cascades from toolbar
// ---------------------------------------------------------------------------

/** Toolbar with tab navigation. Size prop on toolbar cascades to tabs and buttons via XDSSizeContext. */
export const WithTabs: Story = {
  name: 'Tabs in toolbar (all sizes)',
  render: () => {
    const [tab, setTab] = useState('overview');
    return (
      <XDSVStack gap={4}>
        {(['sm', 'md', 'lg'] as const).map(size => (
          <AlignmentGuide key={size} label={`size="${size}"`}>
            <XDSCard width={700}>
              <XDSToolbar
                label={`Tab toolbar ${size}`}
                size={size}
                dividers={['bottom']}
                startContent={
                  <XDSTabList value={tab} onChange={setTab}>
                    <XDSTab value="overview" label="Overview" />
                    <XDSTab value="analytics" label="Analytics" />
                    <XDSTab value="settings" label="Settings" />
                  </XDSTabList>
                }
                endContent={
                  <>
                    <XDSButton
                      label="Filter"
                      variant="ghost"
                      icon={<FunnelIcon />}
                      isIconOnly
                    />
                    <XDSButton
                      label="Add"
                      variant="ghost"
                      icon={<PlusIcon />}
                      isIconOnly
                    />
                  </>
                }
              />
              <XDSSection>
                <BodyContent />
              </XDSSection>
            </XDSCard>
          </AlignmentGuide>
        ))}
      </XDSVStack>
    );
  },
};
