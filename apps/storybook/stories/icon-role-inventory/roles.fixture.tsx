// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Synthetic owner declarations, not component enrollment.
 * @input Finite, role-local state meanings and named default sizes
 * @output Inventory fixtures discovered through the same path as real owner modules
 * @position Storybook-only conformance witness; true slots remain nonparticipating
 */
import {declareComponentIconRole} from '@astryxdesign/core/Icon';

declare module '@astryxdesign/core/Icon' {
  interface ComponentIconSlotMap {
    'inventory-probe-leading': {slot: true; states: 'busy' | 'selected'};
    'inventory-probe-trailing': {slot: true; states: 'invalid' | 'focused'};
    'inventory-source-only': {slot: true};
    'inventory-legacy-source': true;
  }
}

declareComponentIconRole({
  slot: 'inventory-probe-leading',
  defaultSize: 'sm',
  statePrecedence: ['busy', 'selected'],
});
declareComponentIconRole({
  slot: 'inventory-probe-trailing',
  defaultSize: 'md',
  statePrecedence: ['invalid', 'focused'],
});
