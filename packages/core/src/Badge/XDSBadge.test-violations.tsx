// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Test file with intentional violations for ESLint plugin testing
 * Run with: yarn lint packages/core/src/Badge/XDSBadge.test-violations.tsx
 */

import * as stylex from '@stylexjs/stylex';

// This file contains intentional violations to test the XDS ESLint plugin

const badStyles = stylex.create({
  // VIOLATION: hardcoded fontSize (should use textSizeVars)
  hardcodedFontSize: {
    fontSize: '14px',
  },

  // VIOLATION: hardcoded fontWeight (should use fontWeightVars)
  hardcodedFontWeight: {
    fontWeight: 600,
  },

  // VIOLATION: hardcoded color (should use colorVars)
  hardcodedColor: {
    color: '#FF0000',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  // VIOLATION: hardcoded spacing (should use spacingVars)
  hardcodedSpacing: {
    padding: '16px',
    margin: '8px',
    gap: '4px',
  },

  // VIOLATION: hardcoded borderRadius (should use radiusVars)
  hardcodedRadius: {
    borderRadius: '8px',
  },

  // VIOLATION: fontSize without letterSpacing (strict mode only)
  missingLetterSpacing: {
    fontSize: '12px',
    fontWeight: 500,
    // letterSpacing is missing!
  },

  // OK: Uses tokens (no violations)
  goodStyles: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    // These would be tokens in real code
  },

  // OK: Allowed values
  allowedValues: {
    padding: '0',
    margin: 'auto',
    color: 'inherit',
  },
});

export {badStyles};
