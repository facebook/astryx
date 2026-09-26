// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CommandPaletteGroup.test.tsx
 * @input Uses vitest, @testing-library/react
 * @output Unit tests for CommandPaletteGroup
 */

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {CommandPaletteGroup} from './CommandPaletteGroup';
import {defineTheme} from '../theme/defineTheme';
import {generateThemeCSS} from '../theme/generateThemeRules';

function generateThemeTestCSS(theme: Parameters<typeof generateThemeCSS>[0]) {
  const {prose, component} = generateThemeCSS(theme);
  return [prose, component].filter(Boolean).join('\n\n');
}
describe('CommandPaletteGroup', () => {
  it('renders heading', () => {
    render(
      <CommandPaletteGroup heading="Navigation">
        <div>Item</div>
      </CommandPaletteGroup>,
    );
    expect(screen.getByText('Navigation')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <CommandPaletteGroup heading="Group">
        <div>Child 1</div>
        <div>Child 2</div>
      </CommandPaletteGroup>,
    );
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });

  it('has group role with aria-label', () => {
    render(
      <CommandPaletteGroup heading="Actions">
        <div>Item</div>
      </CommandPaletteGroup>,
    );
    expect(screen.getByRole('group')).toHaveAttribute('aria-label', 'Actions');
  });

  it('heading is aria-hidden', () => {
    render(
      <CommandPaletteGroup heading="Hidden Heading">
        <div>Item</div>
      </CommandPaletteGroup>,
    );
    expect(screen.getByText('Hidden Heading')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  // ===========================================================================
  // Heading theme target
  // ===========================================================================

  describe('heading theme target', () => {
    it('renders the astryx-command-palette-group-heading target on the heading', () => {
      render(
        <CommandPaletteGroup heading="Suggestions">
          <div>Item</div>
        </CommandPaletteGroup>,
      );
      const heading = screen.getByText('Suggestions');

      // The root carries `astryx-command-palette-group`; this is the stable
      // handle on the heading itself, so a theme can style just the heading
      // without a fragile structural selector.
      expect(heading).toHaveClass('astryx-command-palette-group-heading');
    });

    it('keeps the heading target distinct from the group root target', () => {
      render(
        <CommandPaletteGroup heading="Suggestions">
          <div>Item</div>
        </CommandPaletteGroup>,
      );
      const root = screen.getByRole('group');
      const heading = screen.getByText('Suggestions');

      expect(root).toHaveClass('astryx-command-palette-group');
      expect(root).not.toHaveClass('astryx-command-palette-group-heading');
      expect(heading).not.toHaveClass('astryx-command-palette-group');
    });

    it('leaves the heading decorative (additive target only)', () => {
      // The target adds a class and nothing else — the heading stays
      // aria-hidden so grouping remains announced via the root's aria-label.
      render(
        <CommandPaletteGroup heading="Suggestions">
          <div>Item</div>
        </CommandPaletteGroup>,
      );
      expect(screen.getByText('Suggestions')).toHaveAttribute(
        'aria-hidden',
        'true',
      );
    });

    it('exposes command-palette-group-heading as a themeable defineTheme target', () => {
      // The generated CSS proves the target is reachable by a theme: jsdom
      // cannot resolve the @layer cascade, so the DOM-class assertions above
      // and this generation assertion together cover the seam.
      const theme = defineTheme({
        name: 'command-palette-group-heading-test',
        components: {
          'command-palette-group-heading': {
            base: {
              paddingBlock: 'var(--spacing-2)',
              fontWeight: 'var(--font-weight-bold)',
            },
          },
        },
      });
      const css = generateThemeTestCSS(theme);
      expect(css).toContain('.astryx-command-palette-group-heading {');
      expect(css).toContain('padding-block: var(--spacing-2)');
      expect(css).toContain('font-weight: var(--font-weight-bold)');
    });
  });
});
