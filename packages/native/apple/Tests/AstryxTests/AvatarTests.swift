// Copyright (c) Meta Platforms, Inc. and affiliates.

import AstryxNative
import SwiftUI
import Testing
@testable import Astryx

// Swift Avatar spec (component:swift/Avatar): core's picture, initials, and
// person-symbol fallback, at core's sizes and shapes, named by alt or name.

@Test func initialsComeFromLettersDigitsAndEmojiNotPunctuation() {
  let cases: [(String, String)] = [
    ("Ada Lovelace", "AL"),
    ("Northwind Workbench (automation)", "NA"),
    ("Ada \"The Countess\" Lovelace", "AL"),
    ("“Ada” Lovelace", "AL"),
    ("Ada - Lovelace", "AL"),
    ("Ada Lovelace —", "AL"),
    ("Mary-Jane Watson", "MW"),
    ("(Ada)", "A"),
    ("Alice", "A"),
    ("R2 D2", "RD"),
    ("3M", "3"),
    ("émile zola", "ÉZ"),
    ("😀 Ada", "😀A"),
    ("🇬🇧 Ada", "🇬🇧A"),
    ("👨‍👩‍👧‍👦 Ada", "👨‍👩‍👧‍👦A"),
    ("Ada (😀)", "A😀"),
    ("- ()", ""),
    ("# *", ""),
  ]
  for (name, expected) in cases {
    #expect(Avatar.initials(from: name) == expected, "\(name)")
  }
}

@MainActor
@Test func aNameWithNoInitialsShowsThePersonSymbolAndStillNamesTheAvatar() {
  let avatar = Avatar("- ()")
  #expect(avatar.initials == nil)
  #expect(avatar.accessibilityLabel == "- ()")
  #expect(Avatar("   ").initials == nil)
  #expect(Avatar("   ").accessibilityLabel == nil)
}

@MainActor
@Test func altNamesTheAvatarBeforeName() {
  #expect(Avatar("Ada Lovelace", alt: "Ada, profile photo").accessibilityLabel == "Ada, profile photo")
  #expect(Avatar("Ada Lovelace").accessibilityLabel == "Ada Lovelace")
  #expect(Avatar("Ada Lovelace", alt: " ").accessibilityLabel == "Ada Lovelace")
  #expect(Avatar(src: "https://example.com/a.png").accessibilityLabel == nil)
}

@MainActor
@Test func avatarInitializersBuildTheSameProps() {
  let labeled = Avatar("Ada", src: "a", fallbackSrc: "b", alt: "c", size: .lg, shape: .square, href: "https://example.com").props
  let fromProps = Avatar(AvatarProps(src: "a", fallbackSrc: "b", name: "Ada", alt: "c", size: .lg, shape: .square, href: "https://example.com")).props
  #expect(labeled.name == fromProps.name)
  #expect(labeled.src == fromProps.src)
  #expect(labeled.fallbackSrc == fromProps.fallbackSrc)
  #expect(labeled.alt == fromProps.alt)
  #expect(labeled.size == fromProps.size)
  #expect(labeled.shape == fromProps.shape)
  #expect(labeled.href == fromProps.href)
  #expect(labeled.base == fromProps.base)
  let defaults = Avatar().props
  #expect(defaults.size == nil && defaults.shape == nil && defaults.onClick == nil)
}

@MainActor
@Test func namedSizesDrawCoresPointSizes() {
  #expect(Avatar.points(for: .xsm) == 20)
  #expect(Avatar.points(for: .sm) == 24)
  #expect(Avatar.points(for: .md) == 36)
  #expect(Avatar.points(for: .lg) == 48)
  #expect(Avatar.points(for: .xl) == 128)
  #expect(Avatar("Ada").side == 36)
  let drawn = Pixels(Avatar("Ada", size: .lg).fixedSize())
  #expect(drawn.width == 48 && drawn.height == 48)
}

@MainActor
@Test func theFallbackPlateUsesTheThemesNeutralColor() {
  let neutral = plate(Theme.default.light.color.neutral)
  let square = Pixels(Avatar("Ada Lovelace", size: .lg, shape: .square).fixedSize())
  #expect(close(square.at(2, 2), neutral))
  // A circle leaves its corners clear.
  let circle = Pixels(Avatar("Ada Lovelace", size: .lg).fixedSize())
  #expect(circle.at(1, 1)[3] < 32)
  #expect(close(circle.at(24, 4), neutral))
}

@MainActor
@Test func anAvatarRendersFromTwoThemesWithNoColorOfItsOwn() {
  // On white, so the translucent plates of different themes tell apart.
  let view = Avatar("Ada Lovelace", size: .lg, shape: .square).background(Color.white).fixedSize()
  let byDefault = Pixels(view).at(2, 2)
  let butter = Pixels(view, theme: .butter).at(2, 2)
  let defaultPlate = onWhite(Theme.default.light.color.neutral)
  let butterPlate = onWhite(Theme.butter.light.color.neutral)
  #expect(close(byDefault, defaultPlate, within: 3))
  #expect(close(butter, butterPlate, within: 3))
  #expect(!close(butter, defaultPlate, within: 3))
  let dark = Pixels(Avatar("Ada Lovelace", size: .lg, shape: .square).fixedSize(), scheme: .dark)
  #expect(close(dark.at(2, 2), plate(Theme.default.dark.color.neutral)))
}

@MainActor
@Test func aLinkOrButtonAvatarDrawsTheSameAsAStaticOne() {
  let still = Pixels(Avatar("Ada Lovelace", size: .sm).fixedSize())
  let link = Pixels(Avatar("Ada Lovelace", size: .sm, href: "https://example.com/ada").fixedSize())
  let button = Pixels(Avatar("Ada Lovelace", size: .sm) {}.fixedSize())
  #expect(link.width == still.width && link.height == still.height)
  #expect(button.width == still.width && button.height == still.height)
  #expect(close(link.at(12, 2), still.at(12, 2)))
}

@MainActor
@Test func hrefMakesALinkAndAnUnusableHrefDoesNot() {
  #expect(Avatar("Ada", href: "https://example.com/ada").linkURL == URL(string: "https://example.com/ada"))
  #expect(Avatar("Ada", href: "").linkURL == nil)
  #expect(Avatar("Ada").linkURL == nil)
}

@MainActor
@Test func aHiddenAvatarDrawsNothing() {
  let hidden = Pixels(
    HStack(spacing: 0) {
      Color.clear.frame(width: 1, height: 1)
      Avatar(AvatarProps(name: "Ada", base: AstryxBaseProps(isHidden: true)))
    }.fixedSize()
  )
  #expect(hidden.width == 1)
}

/// A theme color as the renderer stores it: premultiplied by its alpha, since
/// the neutral plate is translucent.
private func plate(_ color: Color) -> [Int] {
  let c = rgba(color)
  return [c[0] * c[3] / 255, c[1] * c[3] / 255, c[2] * c[3] / 255, c[3]]
}

/// A theme color drawn over white.
private func onWhite(_ color: Color) -> [Int] {
  let c = rgba(color)
  return (0..<3).map { (c[$0] * c[3] + 255 * (255 - c[3])) / 255 } + [255]
}
