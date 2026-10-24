// Copyright (c) Meta Platforms, Inc. and affiliates.

import CoreGraphics
import SwiftUI
import Testing
@testable import AstryxCore

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

/// RGBA pixels of a view drawn at 1x in light mode.
private struct Pixels {
  let width: Int
  let height: Int
  private let bytes: [UInt8]

  @MainActor
  init<V: View>(_ view: V, theme: AstryxTheme) {
    let renderer = ImageRenderer(
      content: view.astryxTheme(theme).environment(\.colorScheme, .light)
    )
    renderer.scale = 1
    let image = renderer.cgImage!
    width = image.width
    height = image.height
    var data = [UInt8](repeating: 0, count: width * height * 4)
    let context = CGContext(
      data: &data, width: width, height: height, bitsPerComponent: 8, bytesPerRow: width * 4,
      space: CGColorSpace(name: CGColorSpace.sRGB)!,
      bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
    )!
    context.draw(image, in: CGRect(x: 0, y: 0, width: width, height: height))
    bytes = data
  }

  /// The pixel at `x`, `y` from the top left, as `#RRGGBBAA`-style components.
  func at(_ x: Int, _ y: Int) -> [Int] {
    let i = ((height - 1 - y) * width + x) * 4
    return (0..<4).map { Int(bytes[i + $0]) }
  }

  func contains(where match: ([Int]) -> Bool) -> Bool {
    for y in 0..<height { for x in 0..<width where match(at(x, y)) { return true } }
    return false
  }
}

/// The components of a `#RRGGBBAA` token.
private func rgba(_ hex: String) -> [Int] {
  let value = UInt32(hex.dropFirst(), radix: 16)!
  return [24, 16, 8, 0].map { Int((value >> UInt32($0)) & 0xFF) }
}

private func close(_ a: [Int], _ b: [Int], within tolerance: Int = 8) -> Bool {
  zip(a, b).allSatisfy { abs($0 - $1) <= tolerance }
}

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
