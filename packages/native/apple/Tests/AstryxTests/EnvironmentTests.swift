// Copyright (c) Meta Platforms, Inc. and affiliates.

import SwiftUI
import Testing
@testable import Astryx

// AST-082 FR11: components follow Dark Mode and Dynamic Type even without
// astryxTheme(_:).

@MainActor
@Test func withoutAThemeComponentsFollowDarkMode() {
  let card = AstryxCard { Color.clear.frame(width: 80, height: 40) }.frame(width: 120)
  let light = Pixels(card, scheme: .light)
  let dark = Pixels(card, scheme: .dark)
  #expect(close(light.at(60, light.height / 2), rgba(Theme.default.light.color.backgroundCard)))
  #expect(close(dark.at(60, dark.height / 2), rgba(Theme.default.dark.color.backgroundCard)))
}

@MainActor
@Test func withoutAThemeTextFollowsDynamicType() {
  let large = Pixels(AstryxText("Hello").fixedSize())
  let larger = Pixels(AstryxText("Hello").fixedSize(), typeSize: .xxxLarge)
  #expect(larger.width > large.width)
}

@Test func fontStacksPickTheFirstFamilyTheDeviceHas() {
  #expect(astryxFont(families: ["-apple-system", "Helvetica"], size: 14, weight: .regular) == .system(size: 14, weight: .regular))
  #expect(astryxFont(families: ["Not A Real Font", "monospace"], size: 14, weight: .regular) == .system(size: 14, weight: .regular, design: .monospaced))
  #expect(astryxFont(families: ["Helvetica", "sans-serif"], size: 14, weight: .bold) == .custom("Helvetica", fixedSize: 14).weight(.bold))
  #expect(astryxFont(families: [], size: 14, weight: .regular) == .system(size: 14, weight: .regular))
}

@Test func theDefaultThemeCarriesCoresFontFamilies() {
  #expect(Theme.default.light.font.familyBody.first == "-apple-system")
  #expect(Theme.default.light.font.familyHeading.isEmpty == false)
}

// Theme environment spec, E2 and E5: the theme writes SwiftUI's tint and
// foreground styles, so stock SwiftUI views in the subtree carry the brand.

@MainActor
@Test func theThemeSetsSwiftUIsTintAndForegroundStyles() {
  let swatches = SwiftUI.HStack(spacing: 0) {
    Rectangle().fill(.tint).frame(width: 20, height: 20)
    Rectangle().fill(.primary).frame(width: 20, height: 20)
    Rectangle().fill(.secondary).frame(width: 20, height: 20)
  }
  let butter = Pixels(swatches, theme: .butter)
  #expect(close(butter.at(10, 10), rgba(Theme.butter.light.color.accent)))
  #expect(close(butter.at(30, 10), rgba(Theme.butter.light.color.textPrimary)))
  #expect(close(butter.at(50, 10), rgba(Theme.butter.light.color.textSecondary)))
  let dark = Pixels(swatches, theme: .butter, scheme: .dark)
  #expect(close(dark.at(10, 10), rgba(Theme.butter.dark.color.accent)))
}

@MainActor
@Test func anInnerThemeReplacesTheOuterTint() {
  let swatch = Rectangle().fill(.tint).frame(width: 20, height: 20).astryxTheme(.neutral)
  let pixels = Pixels(swatch, theme: .butter)
  #expect(close(pixels.at(10, 10), rgba(Theme.neutral.light.color.accent)))
}
