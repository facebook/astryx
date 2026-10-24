// Copyright (c) Meta Platforms, Inc. and affiliates.

import SwiftUI
import Testing
@testable import Astryx

// AST-093 FR4 and FR5: a component renders from two different themes with no
// value of its own in between. Each test draws a component under core's
// default theme and under a second theme with a different color, type size,
// and corner shape, and reads the pixels.

/// Core's default tokens with a different accent, card, text color, type
/// size, and corner shape, in both modes.
private let secondTheme: AstryxTheme = {
  func restyle(_ base: AstryxTokens) -> AstryxTokens {
    var tokens = base
    tokens.colors["color-accent"] = "#C2410CFF"
    tokens.colors["color-background-card"] = "#FDE68AFF"
    tokens.colors["color-text-primary"] = "#FF0000FF"
    tokens.sizes["text-label-size"] = 28
    tokens.sizes["text-body-size"] = 30
    tokens.sizes["radius-container"] = 0
    tokens.sizes["radius-element"] = 0
    return tokens
  }
  return AstryxTheme(light: restyle(.defaultLight), dark: restyle(.defaultDark))
}()

@MainActor
@Test func cardFollowsTheThemesGroundAndShape() {
  let card = AstryxCard { Color.clear.frame(width: 80, height: 40) }.frame(width: 120)
  let standard = Pixels(card, theme: .default)
  let second = Pixels(card, theme: secondTheme)

  let center = (second.width / 2, second.height / 2)
  #expect(close(standard.at(center.0, center.1), rgba(AstryxTokens.defaultLight.colors["color-background-card"]!)))
  #expect(close(second.at(center.0, center.1), rgba("#FDE68AFF")))
  // Corner shape: the default container radius leaves the corner empty;
  // a radius of 0 fills it.
  #expect(standard.at(2, 2)[3] == 0)
  #expect(close(second.at(2, 2), rgba("#FDE68AFF")))
}

@MainActor
@Test func buttonFollowsTheThemesAccentTypeAndShape() {
  let button = AstryxButton(label: "Continue", variant: .primary) {}.fixedSize()
  let standard = Pixels(button, theme: .default)
  let second = Pixels(button, theme: secondTheme)

  #expect(close(standard.at(8, standard.height / 2), rgba(AstryxTokens.defaultLight.colors["color-accent"]!)))
  #expect(close(second.at(8, second.height / 2), rgba("#C2410CFF")))
  // A larger label size makes the same label wider.
  #expect(second.width > standard.width)
}

@MainActor
@Test func textFollowsTheThemesColorAndTypeSize() {
  let text = AstryxText("Hello").fixedSize()
  let standard = Pixels(text, theme: .default)
  let second = Pixels(text, theme: secondTheme)

  #expect(second.width > standard.width)
  #expect(second.contains { $0[0] > 200 && $0[1] < 60 && $0[2] < 60 && $0[3] > 200 })
  #expect(!standard.contains { $0[0] > 200 && $0[1] < 60 && $0[2] < 60 && $0[3] > 200 })
}
