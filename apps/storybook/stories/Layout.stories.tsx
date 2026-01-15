import type { Meta, StoryObj } from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {
  XDSLayout,
  XDSLayoutHeader,
  XDSLayoutFooter,
  XDSLayoutContent,
  XDSLayoutPanel,
  XDSCard,
  XDSSection,
  XDSHStack,
  XDSVStack,
} from '@xds/core/Layout';
import { XDSButton } from '@xds/core/Button';
import {
  colorTokens,
  spacingTokens,
  typographyTokens,
} from '@xds/core/theme/tokens.stylex';
import { Theme, neutralTheme, defaultTheme } from '@xds/core';

const styles = stylex.create({
  // Story wrapper styles
  pageWrapper: {
    height: 500,
    backgroundColor: colorTokens.wash,
    padding: spacingTokens.space4,
  },
  pageWrapperTall: {
    height: 600,
  },
  storySection: {
    padding: spacingTokens.space4,
    backgroundColor: colorTokens.wash,
  },
  // Typography
  heading: {
    margin: 0,
    fontFamily: typographyTokens.fontFamilyBody,
    fontSize: 18,
    fontWeight: 600,
    color: colorTokens.textPrimary,
  },
  subheading: {
    margin: 0,
    fontFamily: typographyTokens.fontFamilyBody,
    fontSize: 14,
    fontWeight: 500,
    color: colorTokens.textSecondary,
  },
  bodyText: {
    margin: 0,
    fontFamily: typographyTokens.fontFamilyBody,
    fontSize: 14,
    lineHeight: 1.5,
    color: colorTokens.textSecondary,
  },
  // Panel content
  navItem: {
    padding: `${spacingTokens.space2} ${spacingTokens.space3}`,
    borderRadius: 6,
    cursor: 'pointer',
    color: colorTokens.textPrimary,
    fontFamily: typographyTokens.fontFamilyBody,
    fontSize: 14,
    backgroundColor: {
      default: 'transparent',
      ':hover': colorTokens.hoverOverlay,
    },
  },
  navItemActive: {
    backgroundColor: colorTokens.accentDeemphasized,
    color: colorTokens.accentText,
  },
  // Content placeholder
  placeholder: {
    backgroundColor: colorTokens.grayBackground,
    borderRadius: 8,
    padding: spacingTokens.space4,
    color: colorTokens.textSecondary,
    fontFamily: typographyTokens.fontFamilyBody,
    fontSize: 14,
  },
  // Full bleed placeholder (no radius, no padding)
  placeholderFullBleed: {
    backgroundColor: colorTokens.grayBackground,
    padding: spacingTokens.space4,
    color: colorTokens.textSecondary,
    fontFamily: typographyTokens.fontFamilyBody,
    fontSize: 14,
    minHeight: 100,
  },
  sectionLabel: {
    margin: `0 0 ${spacingTokens.space2} 0`,
    fontFamily: typographyTokens.fontFamilyBody,
    fontSize: 12,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: colorTokens.textSecondary,
  },
});

// Helper components for demo content
const NavItem = ({ active, children }: { active?: boolean; children: React.ReactNode }) => (
  <div {...stylex.props(styles.navItem, active && styles.navItemActive)}>{children}</div>
);

const meta: Meta<typeof XDSLayout> = {
  title: 'Layout/XDSLayout',
  component: XDSLayout,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
The XDS Layout System provides a structured way to build page and component layouts.

**Components:**
- \`XDSCard\` - Card container with elevation
- \`XDSSection\` - Section container with background variants
- \`XDSLayout\` - Arranges content into header, content, footer, and panel slots
- \`XDSLayoutHeader\` - Header slot with optional divider
- \`XDSLayoutContent\` - Scrollable main content area
- \`XDSLayoutFooter\` - Footer slot with optional divider
- \`XDSLayoutPanel\` - Side panel slots (start/end) with optional divider
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSLayout>;

export const BasicCard: Story = {
  name: 'Basic Card Layout',
  render: () => (
    <div {...stylex.props(styles.pageWrapper)}>
      <XDSCard width={400} height={350}>
        <XDSLayout
          header={
            <XDSLayoutHeader hasDivider>
              <h3 {...stylex.props(styles.heading)}>Card Title</h3>
            </XDSLayoutHeader>
          }
          content={
            <XDSLayoutContent>
              <p {...stylex.props(styles.bodyText)}>
                This is a basic card layout with a header, scrollable content area, and footer.
                The layout automatically handles padding and spacing between sections.
              </p>
              <br />
              <p {...stylex.props(styles.bodyText)}>
                Try scrolling this content area when it overflows.
              </p>
            </XDSLayoutContent>
          }
          footer={
            <XDSLayoutFooter hasDivider>
              <XDSHStack gap="space2" hAlign="end">
                <XDSButton variant="secondary">Cancel</XDSButton>
                <XDSButton variant="primary">Save</XDSButton>
              </XDSHStack>
            </XDSLayoutFooter>
          }
        />
      </XDSCard>
    </div>
  ),
};

export const WithSidebar: Story = {
  name: 'Layout with Sidebar',
  render: () => (
    <div {...stylex.props(styles.pageWrapper)}>
      <XDSCard width={700} height={400}>
        <XDSLayout
          header={
            <XDSLayoutHeader hasDivider>
              <h3 {...stylex.props(styles.heading)}>Settings</h3>
            </XDSLayoutHeader>
          }
          start={
            <XDSLayoutPanel hasDivider role="navigation">
              <NavItem active>General</NavItem>
              <NavItem>Account</NavItem>
              <NavItem>Privacy</NavItem>
              <NavItem>Notifications</NavItem>
              <NavItem>Security</NavItem>
            </XDSLayoutPanel>
          }
          content={
            <XDSLayoutContent>
              <h4 {...stylex.props(styles.subheading)}>General Settings</h4>
              <br />
              <p {...stylex.props(styles.bodyText)}>
                Configure your general preferences here. The sidebar navigation
                allows you to switch between different settings sections.
              </p>
            </XDSLayoutContent>
          }
          footer={
            <XDSLayoutFooter hasDivider>
              <XDSHStack gap="space2" hAlign="end">
                <XDSButton variant="secondary">Reset</XDSButton>
                <XDSButton variant="primary">Save Changes</XDSButton>
              </XDSHStack>
            </XDSLayoutFooter>
          }
        />
      </XDSCard>
    </div>
  ),
};

export const DualPanels: Story = {
  name: 'Dual Panel Layout',
  render: () => (
    <div {...stylex.props(styles.pageWrapper, styles.pageWrapperTall)}>
      <XDSCard width="100%" maxWidth={800} height={400}>
        <XDSLayout
          header={
            <XDSLayoutHeader hasDivider>
              <h3 {...stylex.props(styles.heading)}>File Browser</h3>
            </XDSLayoutHeader>
          }
          start={
            <XDSLayoutPanel hasDivider>
              <p {...stylex.props(styles.sectionLabel)}>Folders</p>
              <NavItem>Documents</NavItem>
              <NavItem active>Projects</NavItem>
              <NavItem>Downloads</NavItem>
            </XDSLayoutPanel>
          }
          content={
            <XDSLayoutContent>
              <p {...stylex.props(styles.sectionLabel)}>Files</p>
              <div {...stylex.props(styles.placeholder)}>
                Select a folder to view its contents
              </div>
            </XDSLayoutContent>
          }
          end={
            <XDSLayoutPanel hasDivider>
              <p {...stylex.props(styles.sectionLabel)}>Details</p>
              <p {...stylex.props(styles.bodyText)}>
                Select a file to view details
              </p>
            </XDSLayoutPanel>
          }
        />
      </XDSCard>
    </div>
  ),
};

export const NoDividers: Story = {
  name: 'Without Dividers',
  render: () => (
    <div {...stylex.props(styles.pageWrapper)}>
      <XDSCard width={400} height={350}>
        <XDSLayout
          header={
            <XDSLayoutHeader>
              <h3 {...stylex.props(styles.heading)}>Seamless Layout</h3>
            </XDSLayoutHeader>
          }
          content={
            <XDSLayoutContent>
              <p {...stylex.props(styles.bodyText)}>
                When dividers are not used, the layout automatically collapses
                spacing between sections for a seamless visual flow.
              </p>
            </XDSLayoutContent>
          }
          footer={
            <XDSLayoutFooter>
              <XDSHStack gap="space2" hAlign="end">
                <XDSButton variant="primary">Continue</XDSButton>
              </XDSHStack>
            </XDSLayoutFooter>
          }
        />
      </XDSCard>
    </div>
  ),
};

export const FullBleedContent: Story = {
  name: 'Full Bleed Content',
  render: () => (
    <div {...stylex.props(styles.pageWrapper)}>
      <XDSCard width={400} height={350}>
        <XDSLayout
          header={
            <XDSLayoutHeader hasDivider>
              <h3 {...stylex.props(styles.heading)}>Full Bleed Example</h3>
            </XDSLayoutHeader>
          }
          content={
            <XDSLayoutContent isFullBleed>
              <div {...stylex.props(styles.placeholderFullBleed)}>
                This content uses isFullBleed to remove padding,
                allowing it to touch the edges. Useful for tables,
                images, or other edge-to-edge content.
              </div>
            </XDSLayoutContent>
          }
          footer={
            <XDSLayoutFooter hasDivider>
              <XDSHStack gap="space2" hAlign="end">
                <XDSButton variant="secondary">Close</XDSButton>
              </XDSHStack>
            </XDSLayoutFooter>
          }
        />
      </XDSCard>
    </div>
  ),
};

export const SectionVariants: Story = {
  name: 'Section Variants',
  render: () => (
    <XDSVStack gap="space6" xstyle={styles.storySection}>
      <p {...stylex.props(styles.sectionLabel)}>XDSSection Variants</p>
      <XDSHStack gap="space4" wrap="wrap">
        <XDSSection variant="section" width={300} height={250}>
          <XDSLayout
            header={<XDSLayoutHeader hasDivider><p {...stylex.props(styles.subheading)}>Section</p></XDSLayoutHeader>}
            content={<XDSLayoutContent><p {...stylex.props(styles.bodyText)}>Surface background color</p></XDSLayoutContent>}
          />
        </XDSSection>

        <XDSSection variant="wash" width={300} height={250}>
          <XDSLayout
            header={<XDSLayoutHeader hasDivider><p {...stylex.props(styles.subheading)}>Wash</p></XDSLayoutHeader>}
            content={<XDSLayoutContent><p {...stylex.props(styles.bodyText)}>Wash background color</p></XDSLayoutContent>}
          />
        </XDSSection>

        <XDSSection variant="transparent" width={300} height={250}>
          <XDSLayout
            header={<XDSLayoutHeader hasDivider><p {...stylex.props(styles.subheading)}>Transparent</p></XDSLayoutHeader>}
            content={<XDSLayoutContent><p {...stylex.props(styles.bodyText)}>No background, shows parent</p></XDSLayoutContent>}
          />
        </XDSSection>
      </XDSHStack>
    </XDSVStack>
  ),
};

export const ContentOnly: Story = {
  name: 'Content Only',
  render: () => (
    <div {...stylex.props(styles.pageWrapper)}>
      <XDSCard width={400} height={350}>
        <XDSLayout
          content={
            <XDSLayoutContent>
              <h3 {...stylex.props(styles.heading)}>Simple Content</h3>
              <br />
              <p {...stylex.props(styles.bodyText)}>
                A layout can have just content without header or footer.
                This is useful for simple cards or content blocks.
              </p>
            </XDSLayoutContent>
          }
        />
      </XDSCard>
    </div>
  ),
};

export const ThemedLayout: Story = {
  name: 'Themed Layout (Neutral vs Default)',
  render: () => (
    <XDSHStack gap="space6" xstyle={styles.storySection}>
      <XDSVStack gap="space3">
        <p {...stylex.props(styles.sectionLabel)}>Default Theme (16px padding)</p>
        <Theme theme={defaultTheme}>
          <XDSCard width={400} height={350}>
            <XDSLayout
              header={
                <XDSLayoutHeader hasDivider>
                  <h3 {...stylex.props(styles.heading)}>Default Theme</h3>
                </XDSLayoutHeader>
              }
              content={
                <XDSLayoutContent>
                  <p {...stylex.props(styles.bodyText)}>
                    This card uses the default theme with 16px padding around the layout areas.
                  </p>
                </XDSLayoutContent>
              }
              footer={
                <XDSLayoutFooter hasDivider>
                  <XDSHStack gap="space2" hAlign="end">
                    <XDSButton variant="secondary">Cancel</XDSButton>
                    <XDSButton variant="primary">Save</XDSButton>
                  </XDSHStack>
                </XDSLayoutFooter>
              }
            />
          </XDSCard>
        </Theme>
      </XDSVStack>

      <XDSVStack gap="space3">
        <p {...stylex.props(styles.sectionLabel)}>Neutral Theme (12px padding)</p>
        <Theme theme={neutralTheme}>
          <XDSCard width={400} height={350}>
            <XDSLayout
              header={
                <XDSLayoutHeader hasDivider>
                  <h3 {...stylex.props(styles.heading)}>Neutral Theme</h3>
                </XDSLayoutHeader>
              }
              content={
                <XDSLayoutContent>
                  <p {...stylex.props(styles.bodyText)}>
                    This card uses the neutral theme with 12px padding around the layout areas.
                  </p>
                </XDSLayoutContent>
              }
              footer={
                <XDSLayoutFooter hasDivider>
                  <XDSHStack gap="space2" hAlign="end">
                    <XDSButton variant="secondary">Cancel</XDSButton>
                    <XDSButton variant="primary">Save</XDSButton>
                  </XDSHStack>
                </XDSLayoutFooter>
              }
            />
          </XDSCard>
        </Theme>
      </XDSVStack>
    </XDSHStack>
  ),
};
