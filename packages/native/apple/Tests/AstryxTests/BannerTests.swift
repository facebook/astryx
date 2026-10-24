// Copyright (c) Meta Platforms, Inc. and affiliates.

import SwiftUI
import Testing
@testable import Astryx

@Test func bannerStatusesUseSharedIconNamesAndCoreTokens() {
  let style = AstryxStyle(tokens: .defaultLight)
  #expect(AstryxBannerStatus.allCases.map(\.iconName) == ["info", "warning", "error", "success"])
  for status in AstryxBannerStatus.allCases {
    #expect(style.icon(status.iconName) != nil)
    #expect(style.tokens.colors[status.groundToken] != nil)
    #expect(style.tokens.colors[status.iconToken] != nil)
  }
}

@Test func aThemeReplacesASharedIcon() {
  let style = AstryxStyle(tokens: .defaultLight, icons: ["success": "checkmark.seal.fill"])
  #expect(style.icon("success") == "checkmark.seal.fill")
  #expect(style.icon("error") == "exclamationmark.circle.fill")
}

@MainActor
@Test func aBannerPaintsItsStatusGround() {
  var theme = AstryxTheme.default
  theme.light.colors["color-success-muted"] = "#FDE68AFF"
  let banner = AstryxBanner(status: .success, title: "Saved").frame(width: 240)
  let pixels = Pixels(banner, theme: theme)
  #expect(close(pixels.at(pixels.width - 6, pixels.height / 2), rgba("#FDE68AFF")))
}

@MainActor
@Test func aBannerReadsItsTitleThenItsDescription() {
  #expect(AstryxBanner(status: .error, title: "Upload failed").accessibilityText == "Upload failed")
  #expect(
    AstryxBanner(status: .error, title: "Upload failed", description: "Try again.").accessibilityText
      == "Upload failed, Try again."
  )
}

@MainActor
@Test func aBannerGrowsAtTheLargestTextSize() {
  let banner = AstryxBanner(status: .info, title: "Heads up", description: "Details.").frame(width: 320)
  let large = Pixels(banner)
  let largest = Pixels(banner, typeSize: .accessibility5)
  #expect(largest.height > large.height * 2)
}
