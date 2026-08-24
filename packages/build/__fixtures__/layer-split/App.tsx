// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Product code, for the layer-split build fixture. It uses an Astryx component
 * AND authors its own StyleX in the same tree, which is the case the split
 * exists for: the two must not land in the same cascade layer.
 *
 * `themedButton` deliberately sets the same property the fixture theme
 * overrides on the same element, so the built stylesheet answers which layer
 * wins rather than only which rules were emitted.
 */

import * as stylex from '@stylexjs/stylex';
import {Button} from '@astryxdesign/core/Button';

const styles = stylex.create({
  productBox: {
    backgroundColor: 'rgb(238, 238, 238)',
    padding: '11px',
  },
  themedButton: {
    backgroundColor: 'rgb(255, 140, 0)',
  },
});

export function App() {
  return (
    <div id="product-box" {...stylex.props(styles.productBox)}>
      <Button id="library-only" label="Delete" variant="destructive" />
      <Button
        id="product-wins"
        label="Delete"
        variant="destructive"
        xstyle={styles.themedButton}
      />
    </div>
  );
}
