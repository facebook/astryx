// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file icon-role-broad-state.fixture.tsx
 * @input Malformed broad-state augmentation beside one valid finite role
 * @output Broad strings, empty states and missing slot markers never participate
 * @position Independent negative consumer; malformed metadata cannot widen others
 */
import {
  declareComponentIconRole,
  getComponentIconState,
  type ComponentIconStateName,
  type ParticipatingComponentIconSlotName,
} from '@astryxdesign/core/Icon';

declare module '@astryxdesign/core/Icon' {
  interface ComponentIconSlotMap {
    'consumer-broad-leading': {slot: true; states: string};
    'consumer-empty-leading': {slot: true; states: never};
    'consumer-marker-missing': {states: 'selected'};
    'consumer-valid-leading': {slot: true; states: 'selected'};
  }
}
export type BroadStateRejected = Assert<
  Equal<ComponentIconStateName<'consumer-broad-leading'>, never>
>;
export type EmptyStateRejected = Assert<
  Equal<ComponentIconStateName<'consumer-empty-leading'>, never>
>;
export type MissingMarkerRejected = Assert<
  Equal<ComponentIconStateName<'consumer-marker-missing'>, never>
>;
export type OnlyFiniteRole = Assert<
  Equal<ParticipatingComponentIconSlotName, 'consumer-valid-leading'>
>;
export type FiniteVocabularySurvives = Assert<
  Equal<ComponentIconStateName, 'selected'>
>;
export const valid = declareComponentIconRole({
  slot: 'consumer-valid-leading',
  defaultSize: 'sm',
  statePrecedence: ['selected'],
});
// prettier-ignore
// @ts-expect-error Broad string metadata is not finite participation.
declareComponentIconRole({slot: 'consumer-broad-leading', defaultSize: 'sm', statePrecedence: ['anything']});
// @ts-expect-error Broad string metadata cannot request effective states.
getComponentIconState('consumer-broad-leading', {anything: true});
// prettier-ignore
// @ts-expect-error Empty finite unions do not declare a role.
declareComponentIconRole({slot: 'consumer-empty-leading', defaultSize: 'sm', statePrecedence: []});
// prettier-ignore
// @ts-expect-error The canonical slot marker is required for participation.
declareComponentIconRole({slot: 'consumer-marker-missing', defaultSize: 'sm', statePrecedence: ['selected']});
