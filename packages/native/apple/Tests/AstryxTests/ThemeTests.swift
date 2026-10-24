// Copyright (c) Meta Platforms, Inc. and affiliates.

import SwiftUI
import Testing
@testable import Astryx

@Test func defaultThemeCarriesCoreTokensInBothModes() {
  for tokens in [AstryxTokens.defaultLight, AstryxTokens.defaultDark] {
    for color in ["color-accent", "color-on-accent", "color-text-primary", "color-background-card"] {
      #expect(tokens.colors[color] != nil, "missing \(color)")
    }
    #expect(tokens.sizes["size-element-md"] == 32)
    #expect(tokens.sizes["radius-element"] == 8)
  }
  #expect(AstryxTokens.defaultLight.colors["color-text-primary"] != AstryxTokens.defaultDark.colors["color-text-primary"])
}

@Test func styleReadsTokensAndFallsBackOnlyForSizes() {
  let style = AstryxStyle(
    tokens: AstryxTokens(colors: ["color-accent": "#0064E0FF"], sizes: ["spacing-4": 16]),
    textScale: 1.5
  )
  #expect(style.space(4) == 16)
  #expect(style.space(3) == 12)
  #expect(style.size("radius-element", 8) == 8)
  #expect(style.fontSize("spacing-4", 0) == 24)
  #expect(style.color("color-missing") == .clear)
}

@Test func hexColorsRead() {
  #expect(Color(astryxHex: "#0064E0FF") == Color(.sRGB, red: 0, green: 100 / 255, blue: 224 / 255, opacity: 1))
  #expect(Color(astryxHex: "#FFF") == Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1))
  #expect(Color(astryxHex: "not a color") == .clear)
}

@Test func textScaleFollowsDynamicType() {
  #expect(astryxTextScale(for: .large) == 1)
  #expect(astryxTextScale(for: .accessibility5) > astryxTextScale(for: .xxxLarge))
}
