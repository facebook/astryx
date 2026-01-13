/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 * @format
 */
'use strict';
/**
 *
 * IMPORTANT NOTE
 *
 * This file intentionally uses interfaces and `+` for readonly.
 *
 * - `$ReadOnly` is an "evaluated" utility type in flow; meaning that flow does
 *    not actually calculate the resulting type until it is used. This creates
 *    a copy of the type at each usage site - ballooning memory and processing
 *    times.
 *    Usually this isn't a problem as a type might only be used one or two times
 *    - but in this giant circular-referencing graph that is the AST types, this
 *    causes check times for consumers to be awful.
 *
 *    Thus instead we manually annotate properties with `+` to avoid the `$ReadOnly` type.
 *
 * - `...Type` spreads do not preserve the readonly-ness of the properties. If
 *   we used object literal types then we would have to `$ReadOnly` all spreads
 *   (see point 1). On the other hand extending an interface does preserve
 *   readonlyness of properties.
 *
 *   Thus instead of object literals, we use interfaces.
 *
 *** Please ensure all properties are marked as readonly! ***
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});