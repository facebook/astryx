// Copyright (c) Meta Platforms, Inc. and affiliates.

// TEMPORARY audit probe (re-run against the in-flight working tree) — deleted after.
import {CheckboxIndicator} from './CheckboxIndicator';
import {CheckIndicator} from './CheckIndicator';
import {RadioIndicator} from './RadioIndicator';
import type {IndicatorRegistry} from './types';

export const case1: IndicatorRegistry = {check: RadioIndicator};
export const case2: IndicatorRegistry = {check: CheckboxIndicator};
export const case3: IndicatorRegistry = {checkbox: RadioIndicator};
export const case4: IndicatorRegistry = {checkbox: CheckIndicator};
export const case5 = <RadioIndicator state="indeterminate" />;
