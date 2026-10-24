// Copyright (c) Meta Platforms, Inc. and affiliates.

import SwiftUI
import Testing
@testable import Astryx

@MainActor
@Test func headingLevelsAreClampedAndExposedToVoiceOver() {
  #expect(AstryxHeading("Title", level: 0).level == 1)
  #expect(AstryxHeading("Title", level: 9).level == 6)
  #expect(AstryxHeading("Title", level: 1).headingLevel == .h1)
  #expect(AstryxHeading("Title", level: 3).headingLevel == .h3)
  #expect(AstryxHeading("Title", level: 6).headingLevel == .h6)
}

@MainActor
@Test func headingsShrinkByLevel() {
  let h1 = Pixels(AstryxHeading("Settings", level: 1).fixedSize())
  let h4 = Pixels(AstryxHeading("Settings", level: 4).fixedSize())
  #expect(h1.width > h4.width)
}

@MainActor
@Test func textGrowsAtTheLargestDynamicTypeSize() {
  let large = Pixels(AstryxText("Hello").fixedSize())
  let largest = Pixels(AstryxText("Hello").fixedSize(), typeSize: .accessibility5)
  #expect(largest.width > large.width * 2)
}

@MainActor
@Test func aTextFieldIsAtLeast44PointsTallAtEveryTextSize() {
  let field = AstryxTextInput(label: "Email", value: .constant(""), size: .sm).frame(width: 240)
  for typeSize in [DynamicTypeSize.xSmall, .large, .accessibility5] {
    let pixels = Pixels(field, typeSize: typeSize)
    // The label sits above a field at least 44 tall.
    #expect(pixels.height >= 44 + 12)
  }
}

@MainActor
@Test func aFieldLabelUsesTheSecondaryTextColor() {
  var theme = AstryxTheme.default
  theme.light.colors["color-text-secondary"] = "#FF0000FF"
  let pixels = Pixels(AstryxTextInput(label: "Email", value: .constant("")).frame(width: 240), theme: theme)
  #expect(pixels.contains { $0[0] > 200 && $0[1] < 60 && $0[2] < 60 && $0[3] > 200 })
}

@MainActor
@Test func headingsGrowAtTheLargestTextSizeAndFollowASecondTheme() {
  let large = Pixels(AstryxHeading("Settings").fixedSize())
  let largest = Pixels(AstryxHeading("Settings").fixedSize(), typeSize: .accessibility5)
  #expect(largest.width > large.width * 2)

  var theme = AstryxTheme.default
  theme.light.sizes["text-heading-2-size"] = 48
  theme.light.colors["color-text-primary"] = "#FF0000FF"
  let themed = Pixels(AstryxHeading("Settings").fixedSize(), theme: theme)
  #expect(themed.width > large.width)
  #expect(themed.contains { $0[0] > 200 && $0[1] < 60 && $0[2] < 60 && $0[3] > 200 })
}

@MainActor
@Test func aTextFieldIsNamedByItsLabel() {
  let field = AstryxTextInput(label: "Email", value: .constant(""))
  #expect(field.accessibilityText == "Email")
}

@MainActor
@Test func aHeadingIsAHeader() {
  #expect(AstryxHeading.accessibilityTraits.contains(.isHeader))
}
