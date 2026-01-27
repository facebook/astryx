import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {
  XDSLayout,
  XDSLayoutHeader,
  XDSLayoutFooter,
  XDSLayoutContent,
  XDSLayoutPanel,
  container,
  XDSCard,
  XDSSection,
  XDSHStack,
  XDSVStack,
} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {
  colorVars,
  spacingVars,
  typographyVars,
  radiusVars,
  elevationVars,
} from '@xds/core/theme/tokens.stylex';
import {Theme, neutralTheme, defaultTheme} from '@xds/core';

const styles = stylex.create({
  // Story wrapper styles
  pageWrapper: {
    height: 500,
    backgroundColor: colorVars['--color-wash'],
    padding: spacingVars['--spacing-4'],
  },
  pageWrapperTall: {
    height: 600,
  },
  storySection: {
    padding: spacingVars['--spacing-4'],
    backgroundColor: colorVars['--color-wash'],
  },
  // Typography
  heading: {
    margin: 0,
    fontFamily: typographyVars['--font-body'],
    fontSize: 18,
    fontWeight: 600,
    color: colorVars['--color-text-primary'],
  },
  subheading: {
    margin: 0,
    fontFamily: typographyVars['--font-body'],
    fontSize: 14,
    fontWeight: 500,
    color: colorVars['--color-text-secondary'],
  },
  bodyText: {
    margin: 0,
    fontFamily: typographyVars['--font-body'],
    fontSize: 14,
    lineHeight: 1.5,
    color: colorVars['--color-text-secondary'],
  },
  // Panel content
  navItem: {
    padding: `${spacingVars['--spacing-2']} ${spacingVars['--spacing-3']}`,
    borderRadius: 6,
    cursor: 'pointer',
    color: colorVars['--color-text-primary'],
    fontFamily: typographyVars['--font-body'],
    fontSize: 14,
    backgroundColor: {
      default: 'transparent',
      ':hover': colorVars['--color-hover-overlay'],
    },
  },
  navItemActive: {
    backgroundColor: colorVars['--color-accent-deemphasized'],
    color: colorVars['--color-accent-text'],
  },
  // Content placeholder
  placeholder: {
    backgroundColor: colorVars['--color-gray-background'],
    borderRadius: 8,
    padding: spacingVars['--spacing-4'],
    color: colorVars['--color-text-secondary'],
    fontFamily: typographyVars['--font-body'],
    fontSize: 14,
  },
  // Full bleed placeholder (no radius, no padding)
  placeholderFullBleed: {
    backgroundColor: colorVars['--color-gray-background'],
    padding: spacingVars['--spacing-4'],
    color: colorVars['--color-text-secondary'],
    fontFamily: typographyVars['--font-body'],
    fontSize: 14,
    minHeight: 100,
  },
  sectionLabel: {
    margin: `0 0 ${spacingVars['--spacing-2']} 0`,
    fontFamily: typographyVars['--font-body'],
    fontSize: 12,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: colorVars['--color-text-secondary'],
  },
  // Demo container styling to visualize bounds
  demoContainer: {
    backgroundColor: colorVars['--color-card'],
    borderRadius: radiusVars['--radius-container'],
    boxShadow: elevationVars['--elevation-base'],
  },
  // Demo sizing for outer padding story
  demoSize: {
    width: 300,
    height: 220,
  },
});

// Helper components for demo content
const NavItem = ({
  active,
  children,
}: {
  active?: boolean;
  children: React.ReactNode;
}) => (
  <div {...stylex.props(styles.navItem, active && styles.navItemActive)}>
    {children}
  </div>
);

const meta: Meta<typeof XDSLayout> = {
  title: 'Layout/XDSLayout',
  component: XDSLayout,
  tags: ['autodocs'],
  parameters: {
    controls: {
      expanded: false,
    },
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
  // Hide auto-generated controls from XDSLayout component
  argTypes: {
    content: {table: {disable: true}},
    end: {table: {disable: true}},
    footer: {table: {disable: true}},
    header: {table: {disable: true}},
    height: {table: {disable: true}},
    isFullBleed: {table: {disable: true}},
    start: {table: {disable: true}},
  },
};

export default meta;
type Story = StoryObj<typeof XDSLayout>;

// =============================================================================
// Interactive Playground
// =============================================================================

interface PlaygroundArgs {
  // Card props
  cardWidth: number;
  cardHeight: number;
  // Layout props
  layoutIsFullBleed: boolean;
  // Header props
  showHeader: boolean;
  headerHasDivider: boolean;
  headerIsFullBleed: boolean;
  // Content props
  contentIsFullBleed: boolean;
  contentIsScrollable: boolean;
  // Footer props
  showFooter: boolean;
  footerHasDivider: boolean;
  footerIsFullBleed: boolean;
  // Start panel props
  showStartPanel: boolean;
  startPanelWidth: number;
  startPanelHasDivider: boolean;
  startPanelIsScrollable: boolean;
  // End panel props
  showEndPanel: boolean;
  endPanelWidth: number;
  endPanelHasDivider: boolean;
  endPanelIsScrollable: boolean;
}

export const Playground = {
  name: 'Playground',
  args: {
    // Card defaults
    cardWidth: 700,
    cardHeight: 400,
    // Layout defaults
    layoutIsFullBleed: false,
    // Header defaults
    showHeader: true,
    headerHasDivider: true,
    headerIsFullBleed: false,
    // Content defaults
    contentIsFullBleed: false,
    contentIsScrollable: true,
    // Footer defaults
    showFooter: true,
    footerHasDivider: true,
    footerIsFullBleed: false,
    // Start panel defaults
    showStartPanel: true,
    startPanelWidth: 160,
    startPanelHasDivider: true,
    startPanelIsScrollable: true,
    // End panel defaults
    showEndPanel: false,
    endPanelWidth: 200,
    endPanelHasDivider: true,
    endPanelIsScrollable: true,
  },
  argTypes: {
    // Card controls
    cardWidth: {
      control: {type: 'range', min: 300, max: 1000, step: 50},
      description: 'Width of the card container',
      table: {category: 'Card'},
    },
    cardHeight: {
      control: {type: 'range', min: 200, max: 600, step: 50},
      description: 'Height of the card container',
      table: {category: 'Card'},
    },
    // Layout controls
    layoutIsFullBleed: {
      control: 'boolean',
      description: 'Remove padding at layout outer edges (affects all slots)',
      table: {category: 'Layout'},
    },
    // Header controls
    showHeader: {
      control: 'boolean',
      description: 'Show or hide the header',
      table: {category: 'Header'},
    },
    headerHasDivider: {
      control: 'boolean',
      description: 'Add a border below the header',
      table: {category: 'Header'},
    },
    headerIsFullBleed: {
      control: 'boolean',
      description: 'Remove header padding',
      table: {category: 'Header'},
    },
    // Content controls
    contentIsFullBleed: {
      control: 'boolean',
      description: 'Remove content padding for edge-to-edge content',
      table: {category: 'Content'},
    },
    contentIsScrollable: {
      control: 'boolean',
      description: 'Enable scrollable overflow',
      table: {category: 'Content'},
    },
    // Footer controls
    showFooter: {
      control: 'boolean',
      description: 'Show or hide the footer',
      table: {category: 'Footer'},
    },
    footerHasDivider: {
      control: 'boolean',
      description: 'Add a border above the footer',
      table: {category: 'Footer'},
    },
    footerIsFullBleed: {
      control: 'boolean',
      description: 'Remove footer padding',
      table: {category: 'Footer'},
    },
    // Start panel controls
    showStartPanel: {
      control: 'boolean',
      description: 'Show or hide the start (left) panel',
      table: {category: 'Start Panel'},
    },
    startPanelWidth: {
      control: {type: 'range', min: 100, max: 300, step: 20},
      description: 'Width of the start panel',
      table: {category: 'Start Panel'},
    },
    startPanelHasDivider: {
      control: 'boolean',
      description: 'Add a border to the start panel',
      table: {category: 'Start Panel'},
    },
    startPanelIsScrollable: {
      control: 'boolean',
      description: 'Enable scrollable overflow for start panel',
      table: {category: 'Start Panel'},
    },
    // End panel controls
    showEndPanel: {
      control: 'boolean',
      description: 'Show or hide the end (right) panel',
      table: {category: 'End Panel'},
    },
    endPanelWidth: {
      control: {type: 'range', min: 100, max: 300, step: 20},
      description: 'Width of the end panel',
      table: {category: 'End Panel'},
    },
    endPanelHasDivider: {
      control: 'boolean',
      description: 'Add a border to the end panel',
      table: {category: 'End Panel'},
    },
    endPanelIsScrollable: {
      control: 'boolean',
      description: 'Enable scrollable overflow for end panel',
      table: {category: 'End Panel'},
    },
  },
  render: (args: PlaygroundArgs) => (
    <div {...stylex.props(styles.pageWrapper)}>
      <XDSCard width={args.cardWidth} height={args.cardHeight}>
        <XDSLayout
          isFullBleed={args.layoutIsFullBleed}
          header={
            args.showHeader ? (
              <XDSLayoutHeader
                hasDivider={args.headerHasDivider}
                isFullBleed={args.headerIsFullBleed}
              >
                <h3 {...stylex.props(styles.heading)}>Layout Header</h3>
              </XDSLayoutHeader>
            ) : undefined
          }
          start={
            args.showStartPanel ? (
              <XDSLayoutPanel
                width={args.startPanelWidth}
                hasDivider={args.startPanelHasDivider}
                isScrollable={args.startPanelIsScrollable}
                role="navigation"
              >
                <NavItem active>Dashboard</NavItem>
                <NavItem>Settings</NavItem>
                <NavItem>Profile</NavItem>
                <NavItem>Help</NavItem>
              </XDSLayoutPanel>
            ) : undefined
          }
          content={
            <XDSLayoutContent
              isFullBleed={args.contentIsFullBleed}
              isScrollable={args.contentIsScrollable}
            >
              <h4 {...stylex.props(styles.subheading)}>Main Content Area</h4>
              <br />
              <p {...stylex.props(styles.bodyText)}>
                This is the main content area. Use the controls panel to toggle
                headers, footers, side panels, and adjust their properties.
              </p>
              <br />
              <p {...stylex.props(styles.bodyText)}>
                Try enabling &quot;isFullBleed&quot; to see how content can
                extend to the edges, or toggle &quot;isScrollable&quot; to
                change overflow behavior.
              </p>
              <br />
              <div {...stylex.props(styles.placeholder)}>
                Placeholder content block
              </div>
            </XDSLayoutContent>
          }
          end={
            args.showEndPanel ? (
              <XDSLayoutPanel
                width={args.endPanelWidth}
                hasDivider={args.endPanelHasDivider}
                isScrollable={args.endPanelIsScrollable}
                role="complementary"
              >
                <p {...stylex.props(styles.sectionLabel)}>Details</p>
                <p {...stylex.props(styles.bodyText)}>
                  Additional information or actions can go in the end panel.
                </p>
              </XDSLayoutPanel>
            ) : undefined
          }
          footer={
            args.showFooter ? (
              <XDSLayoutFooter
                hasDivider={args.footerHasDivider}
                isFullBleed={args.footerIsFullBleed}
              >
                <XDSHStack gap="space2" hAlign="end">
                  <XDSButton variant="secondary">Cancel</XDSButton>
                  <XDSButton variant="primary">Save</XDSButton>
                </XDSHStack>
              </XDSLayoutFooter>
            ) : undefined
          }
        />
      </XDSCard>
    </div>
  ),
};

// =============================================================================
// Example Stories
// =============================================================================

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
                This is a basic card layout with a header, scrollable content
                area, and footer. The layout automatically handles padding and
                spacing between sections.
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
                This content uses isFullBleed to remove padding, allowing it to
                touch the edges. Useful for tables, images, or other
                edge-to-edge content.
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
            header={
              <XDSLayoutHeader hasDivider>
                <p {...stylex.props(styles.subheading)}>Section</p>
              </XDSLayoutHeader>
            }
            content={
              <XDSLayoutContent>
                <p {...stylex.props(styles.bodyText)}>
                  Surface background color
                </p>
              </XDSLayoutContent>
            }
          />
        </XDSSection>

        <XDSSection variant="wash" width={300} height={250}>
          <XDSLayout
            header={
              <XDSLayoutHeader hasDivider>
                <p {...stylex.props(styles.subheading)}>Wash</p>
              </XDSLayoutHeader>
            }
            content={
              <XDSLayoutContent>
                <p {...stylex.props(styles.bodyText)}>Wash background color</p>
              </XDSLayoutContent>
            }
          />
        </XDSSection>

        <XDSSection variant="transparent" width={300} height={250}>
          <XDSLayout
            header={
              <XDSLayoutHeader hasDivider>
                <p {...stylex.props(styles.subheading)}>Transparent</p>
              </XDSLayoutHeader>
            }
            content={
              <XDSLayoutContent>
                <p {...stylex.props(styles.bodyText)}>
                  No background, shows parent
                </p>
              </XDSLayoutContent>
            }
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
                A layout can have just content without header or footer. This is
                useful for simple cards or content blocks.
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
        <p {...stylex.props(styles.sectionLabel)}>
          Default Theme (16px padding)
        </p>
        <Theme theme={defaultTheme}>
          <XDSCard width={400}>
            <XDSLayout
              header={
                <XDSLayoutHeader hasDivider>
                  <h3 {...stylex.props(styles.heading)}>Default Theme</h3>
                </XDSLayoutHeader>
              }
              content={
                <XDSLayoutContent>
                  <p {...stylex.props(styles.bodyText)}>
                    This card uses the default theme with 16px padding around
                    the layout areas.
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
        <p {...stylex.props(styles.sectionLabel)}>
          Neutral Theme (12px padding)
        </p>
        <Theme theme={neutralTheme}>
          <XDSCard width={400}>
            <XDSLayout
              header={
                <XDSLayoutHeader hasDivider>
                  <h3 {...stylex.props(styles.heading)}>Neutral Theme</h3>
                </XDSLayoutHeader>
              }
              content={
                <XDSLayoutContent>
                  <p {...stylex.props(styles.bodyText)}>
                    This card uses the neutral theme with 12px padding around
                    the layout areas.
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

export const OuterPaddingDemo: Story = {
  name: 'Outer Padding Demonstration',
  render: () => (
    <XDSVStack gap="space6" xstyle={styles.storySection}>
      <p {...stylex.props(styles.sectionLabel)}>Outer Padding</p>
      <p {...stylex.props(styles.bodyText)}>
        Outer padding creates space between the container edge and the layout
        content. Notice how the dividers are inset from the container edges as
        outer padding increases.
      </p>
      <XDSHStack gap="space4" wrap="wrap">
        <XDSVStack gap="space2">
          <p {...stylex.props(styles.subheading)}>paddingOuterX/Y = spacing0</p>
          <div
            {...stylex.props(
              ...container({
                paddingOuterX: 'spacing0',
                paddingOuterY: 'spacing0',
              }),
              styles.demoContainer,
              styles.demoSize,
            )}
          >
            <XDSLayout
              header={
                <XDSLayoutHeader hasDivider>
                  <p {...stylex.props(styles.subheading)}>Header</p>
                </XDSLayoutHeader>
              }
              content={
                <XDSLayoutContent>
                  <p {...stylex.props(styles.bodyText)}>
                    Dividers touch container edges.
                  </p>
                </XDSLayoutContent>
              }
              footer={
                <XDSLayoutFooter hasDivider>
                  <p {...stylex.props(styles.bodyText)}>Footer</p>
                </XDSLayoutFooter>
              }
            />
          </div>
        </XDSVStack>

        <XDSVStack gap="space2">
          <p {...stylex.props(styles.subheading)}>paddingOuterX/Y = spacing4</p>
          <div
            {...stylex.props(
              ...container({
                paddingOuterX: 'spacing4',
                paddingOuterY: 'spacing4',
              }),
              styles.demoContainer,
              styles.demoSize,
            )}
          >
            <XDSLayout
              header={
                <XDSLayoutHeader hasDivider>
                  <p {...stylex.props(styles.subheading)}>Header</p>
                </XDSLayoutHeader>
              }
              content={
                <XDSLayoutContent>
                  <p {...stylex.props(styles.bodyText)}>
                    16px inset from edges.
                  </p>
                </XDSLayoutContent>
              }
              footer={
                <XDSLayoutFooter hasDivider>
                  <p {...stylex.props(styles.bodyText)}>Footer</p>
                </XDSLayoutFooter>
              }
            />
          </div>
        </XDSVStack>

        <XDSVStack gap="space2">
          <p {...stylex.props(styles.subheading)}>paddingOuterX/Y = spacing7</p>
          <div
            {...stylex.props(
              ...container({
                paddingOuterX: 'spacing7',
                paddingOuterY: 'spacing7',
              }),
              styles.demoContainer,
              styles.demoSize,
            )}
          >
            <XDSLayout
              header={
                <XDSLayoutHeader hasDivider>
                  <p {...stylex.props(styles.subheading)}>Header</p>
                </XDSLayoutHeader>
              }
              content={
                <XDSLayoutContent>
                  <p {...stylex.props(styles.bodyText)}>
                    48px inset from edges.
                  </p>
                </XDSLayoutContent>
              }
              footer={
                <XDSLayoutFooter hasDivider>
                  <p {...stylex.props(styles.bodyText)}>Footer</p>
                </XDSLayoutFooter>
              }
            />
          </div>
        </XDSVStack>
      </XDSHStack>
    </XDSVStack>
  ),
};
