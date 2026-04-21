'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSHoverCard} from '@xds/core/HoverCard';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const styles = stylex.create({
  content: {maxWidth: 200},
});

export default function HoverCardInlineTextHoverCard() {
  return (
    <XDSText type="body">
      The component uses a{' '}
      <XDSHoverCard
        content={
          <XDSVStack gap={1} xstyle={styles.content}>
            <XDSText type="label">Focus trap</XDSText>
            <XDSText type="body" color="secondary">
              A pattern that keeps keyboard focus inside a container, preventing
              it from moving to elements outside. Used in dialogs and modals to
              ensure accessibility.
            </XDSText>
          </XDSVStack>
        }
        placement="above">
        focus trap
      </XDSHoverCard>{' '}
      to keep keyboard navigation inside the{' '}
      <XDSHoverCard
        content={
          <XDSVStack gap={1} xstyle={styles.content}>
            <XDSText type="label">Modal dialog</XDSText>
            <XDSText type="body" color="secondary">
              An overlay that blocks interaction with the rest of the page until
              the user responds. Uses the native HTML dialog element for
              built-in accessibility and backdrop support.
            </XDSText>
          </XDSVStack>
        }
        placement="above">
        modal dialog
      </XDSHoverCard>
      .
    </XDSText>
  );
}
