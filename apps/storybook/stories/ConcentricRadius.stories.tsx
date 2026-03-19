import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {XDSCard} from '@xds/core/Card';
import {XDSButton} from '@xds/core/Button';
import {XDSBadge} from '@xds/core/Badge';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSDivider} from '@xds/core/Divider';
import {useConcentricRadius} from '@xds/core/hooks';
import {
  colorVars,
  spacingVars,
  radiusVars,
  typographyVars,
} from '@xds/core/theme/tokens.stylex';

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  pageWrapper: {
    backgroundColor: colorVars['--color-wash'],
    padding: spacingVars['--spacing-6'],
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-6'],
  },
  row: {
    display: 'flex',
    gap: spacingVars['--spacing-4'],
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  label: {
    fontFamily: typographyVars['--font-body'],
    fontSize: '11px',
    fontWeight: '600',
    color: colorVars['--color-text-secondary'],
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: spacingVars['--spacing-2'],
  },
  // Inner sections with visible backgrounds
  innerSection: {
    backgroundColor: colorVars['--color-accent-deemphasized'],
    padding: spacingVars['--spacing-4'],
  },
  headerSection: {
    backgroundColor: colorVars['--color-accent'],
    padding: spacingVars['--spacing-4'],
    color: 'white',
  },
  footerSection: {
    backgroundColor: colorVars['--color-wash'],
    padding: spacingVars['--spacing-3'],
    display: 'flex',
    justifyContent: 'flex-end',
    gap: spacingVars['--spacing-2'],
  },
  coverImage: {
    width: '100%',
    height: '120px',
    backgroundColor: colorVars['--color-accent'],
    backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontFamily: typographyVars['--font-body'],
    fontWeight: '600',
    fontSize: '14px',
  },
  cardBody: {
    padding: spacingVars['--spacing-4'],
  },
  // Halo wrapper for inner-as-reference demo
  haloWrapper: {
    display: 'inline-flex',
    padding: spacingVars['--spacing-2'],
    backgroundColor: colorVars['--color-accent-deemphasized'],
  },
  haloWrapperLarge: {
    display: 'inline-flex',
    padding: spacingVars['--spacing-4'],
    backgroundColor: colorVars['--color-wash'],
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: colorVars['--color-divider'],
  },
  text: {
    fontFamily: typographyVars['--font-body'],
    color: colorVars['--color-text-primary'],
    margin: 0,
    fontSize: '14px',
  },
  textSmall: {
    fontFamily: typographyVars['--font-body'],
    color: colorVars['--color-text-secondary'],
    margin: 0,
    fontSize: '12px',
  },
  annotation: {
    fontFamily: typographyVars['--font-code'],
    fontSize: '11px',
    color: colorVars['--color-text-secondary'],
    marginTop: spacingVars['--spacing-1'],
  },
  comparisonCard: {
    width: '280px',
  },
});

// =============================================================================
// Meta
// =============================================================================

const meta: Meta = {
  title: 'Hooks/useConcentricRadius',
  parameters: {
    layout: 'padded',
  },
};

export default meta;

// =============================================================================
// Stories
// =============================================================================

/**
 * Container as reference — inner element adapts to the card's radius.
 * The inner colored section gets concentric corners that harmonize
 * with the card's outer corners.
 */
export const ContainerAsReference: StoryObj = {
  render: () => {
    const {containerRef, innerRef} = useConcentricRadius({
      reference: 'container',
    });

    return (
      <div {...stylex.props(styles.pageWrapper)}>
        <div {...stylex.props(styles.label)}>
          Card with concentric inner section
        </div>
        <XDSCard ref={containerRef} width={360} padding={3}>
          <div ref={innerRef} {...stylex.props(styles.innerSection)}>
            <p {...stylex.props(styles.text)}>
              This section's corners are computed from the card's radius minus
              the gap between them.
            </p>
          </div>
        </XDSCard>
      </div>
    );
  },
};

/**
 * Card with a colored header — the header's top corners match
 * the card's curvature.
 */
export const CardWithHeader: StoryObj = {
  render: () => {
    const {containerRef, innerRef: headerRef} = useConcentricRadius({
      reference: 'container',
    });

    return (
      <div {...stylex.props(styles.pageWrapper)}>
        <div {...stylex.props(styles.label)}>Card with colored header</div>
        <XDSCard ref={containerRef} width={360} padding={0}>
          <div ref={headerRef} {...stylex.props(styles.headerSection)}>
            <p {...stylex.props(styles.text)} style={{color: 'white'}}>
              Header with concentric corners
            </p>
          </div>
          <div {...stylex.props(styles.cardBody)}>
            <p {...stylex.props(styles.text)}>
              Card body content. The header is flush with the card edges
              (padding=0) so its corners match the card's corners exactly.
            </p>
          </div>
        </XDSCard>
      </div>
    );
  },
};

/**
 * Cover image at the top of a card with concentric corners.
 */
export const CoverImage: StoryObj = {
  render: () => {
    const {containerRef, innerRef: imageRef} = useConcentricRadius({
      reference: 'container',
    });

    return (
      <div {...stylex.props(styles.pageWrapper)}>
        <div {...stylex.props(styles.label)}>Card with cover image</div>
        <XDSCard ref={containerRef} width={320} padding={0}>
          <div ref={imageRef} {...stylex.props(styles.coverImage)}>
            Cover Image
          </div>
          <div {...stylex.props(styles.cardBody)}>
            <XDSVStack gap={1}>
              <XDSHeading level={4}>Profile Card</XDSHeading>
              <XDSText type="supporting">
                The cover image corners follow the card's curvature.
              </XDSText>
            </XDSVStack>
          </div>
        </XDSCard>
      </div>
    );
  },
};

/**
 * Inner element defines the shape — container adapts.
 * A pill-shaped button wrapped in a halo that follows its curvature.
 */
export const InnerAsReference: StoryObj = {
  render: () => {
    const {containerRef: haloRef, innerRef: buttonRef} = useConcentricRadius({
      reference: 'inner',
    });

    return (
      <div {...stylex.props(styles.pageWrapper)}>
        <div {...stylex.props(styles.label)}>
          Inner as reference — halo adapts to button shape
        </div>
        <div ref={haloRef} {...stylex.props(styles.haloWrapper)}>
          <XDSButton ref={buttonRef} label="Subscribe" variant="primary" />
        </div>

        <div {...stylex.props(styles.label)}>
          Larger padding — halo still follows the curve
        </div>
        <InnerRefDemo padding="--spacing-4" />
      </div>
    );
  },
};

/** Helper for inner-as-reference with configurable padding */
function InnerRefDemo({padding}: {padding: string}) {
  const {containerRef, innerRef} = useConcentricRadius({
    reference: 'inner',
  });

  return (
    <div ref={containerRef} {...stylex.props(styles.haloWrapperLarge)}>
      <XDSButton ref={innerRef} label="Get Started" variant="primary" />
    </div>
  );
}

/**
 * Side-by-side comparison: with and without concentric radius.
 */
export const Comparison: StoryObj = {
  render: () => {
    const {containerRef, innerRef} = useConcentricRadius({
      reference: 'container',
    });

    return (
      <div {...stylex.props(styles.pageWrapper)}>
        <div {...stylex.props(styles.label)}>
          Comparison: without vs with concentric radius
        </div>
        <div {...stylex.props(styles.row)}>
          {/* Without concentric */}
          <div {...stylex.props(styles.comparisonCard)}>
            <p {...stylex.props(styles.textSmall)}>
              Without (radius-2 on inner)
            </p>
            <XDSCard width={280} padding={2}>
              <div
                {...stylex.props(styles.innerSection)}
                style={{borderRadius: 'var(--radius-2)'}}>
                <p {...stylex.props(styles.text)}>
                  Inner section uses a fixed radius token.
                </p>
              </div>
            </XDSCard>
          </div>

          {/* With concentric */}
          <div {...stylex.props(styles.comparisonCard)}>
            <p {...stylex.props(styles.textSmall)}>
              With concentric (computed from card)
            </p>
            <XDSCard ref={containerRef} width={280} padding={2}>
              <div ref={innerRef} {...stylex.props(styles.innerSection)}>
                <p {...stylex.props(styles.text)}>
                  Inner section corners adapt to the card.
                </p>
              </div>
            </XDSCard>
          </div>
        </div>
        <p {...stylex.props(styles.annotation)}>
          At default scale (12px radius, 8px padding), concentric = max(0, 12-8)
          = 4px
        </p>
      </div>
    );
  },
};

/**
 * Multiple inner elements inside one container.
 * Each inner element can independently use the hook.
 */
export const MultipleInnerElements: StoryObj = {
  render: () => {
    const {containerRef, innerRef: headerRef} = useConcentricRadius({
      reference: 'container',
    });
    const {containerRef: containerRef2, innerRef: footerRef} =
      useConcentricRadius({reference: 'container'});

    return (
      <div {...stylex.props(styles.pageWrapper)}>
        <div {...stylex.props(styles.label)}>
          Header and footer both adapt to the card
        </div>
        <XDSCard
          ref={(el: HTMLDivElement | null) => {
            containerRef(el);
            containerRef2(el);
          }}
          width={360}
          padding={0}>
          <div ref={headerRef} {...stylex.props(styles.headerSection)}>
            <p {...stylex.props(styles.text)} style={{color: 'white'}}>
              Header
            </p>
          </div>
          <div {...stylex.props(styles.cardBody)}>
            <p {...stylex.props(styles.text)}>Card content area</p>
          </div>
          <XDSDivider />
          <div ref={footerRef} {...stylex.props(styles.footerSection)}>
            <XDSButton label="Cancel" variant="secondary" />
            <XDSButton label="Save" variant="primary" />
          </div>
        </XDSCard>
      </div>
    );
  },
};
