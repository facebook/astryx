// Copyright (c) Meta Platforms, Inc. and affiliates.
// Adapted from github.com/ejc3/astryx-swift (MIT).

import SwiftUI

#if canImport(UIKit)
import UIKit
#elseif canImport(AppKit)
import AppKit
#endif

/// One mode of a theme, resolved: colors as `#RRGGBBAA`, sizes in points, and
/// font families as their CSS stacks, first choice first, keyed by core's
/// token names without the leading `--`.
public struct AstryxTokens: Equatable, Sendable {
  public var colors: [String: String]
  public var sizes: [String: Double]
  public var fonts: [String: [String]]

  public init(colors: [String: String], sizes: [String: Double], fonts: [String: [String]] = [:]) {
    self.colors = colors
    self.sizes = sizes
    self.fonts = fonts
  }
}

/// A theme's light and dark tokens. `AstryxTheme.default` is core's default
/// theme, generated from core's own resolver.
public struct AstryxTheme: Equatable, Sendable {
  public var light: AstryxTokens
  public var dark: AstryxTokens
  /// SF Symbols that replace the defaults for shared icon names, such as
  /// `["success": "checkmark.seal.fill"]` (AST-082 FR17).
  public var icons: [String: String]

  public init(light: AstryxTokens, dark: AstryxTokens, icons: [String: String] = [:]) {
    self.light = light
    self.dark = dark
    self.icons = icons
  }

  public static let `default` = AstryxTheme(
    light: .defaultLight,
    dark: .defaultDark
  )
}

/// The tokens a component paints with: one mode of the theme, grown by the
/// person's Dynamic Type setting. Components read every color, size, and font
/// from here, never from a constant of their own.
public struct AstryxStyle: Sendable {
  public let tokens: AstryxTokens
  /// How much Dynamic Type grows text at the person's setting (1 at Large).
  public let textScale: CGFloat
  /// The theme's replacements for shared icon names.
  public let icons: [String: String]

  public init(tokens: AstryxTokens, textScale: CGFloat = 1, icons: [String: String] = [:]) {
    self.tokens = tokens
    self.textScale = textScale
    self.icons = icons
  }

  /// A token color. A token the theme does not define draws clear, so a
  /// missing token shows up in review instead of a guessed color.
  public func color(_ token: String) -> Color {
    guard let hex = tokens.colors[token] else { return .clear }
    return Color(astryxHex: hex)
  }

  /// A token size in points, or `fallback` when the theme does not define it.
  public func size(_ token: String, _ fallback: CGFloat) -> CGFloat {
    tokens.sizes[token].map { CGFloat($0) } ?? fallback
  }

  /// A step on the spacing ladder: `space(4)` reads `spacing-4`.
  public func space(_ step: Int) -> CGFloat {
    size("spacing-\(step)", CGFloat(step) * 4)
  }

  /// A token font size grown by Dynamic Type.
  public func fontSize(_ token: String, _ fallback: CGFloat) -> CGFloat {
    size(token, fallback) * textScale
  }

  /// The theme's font family at a token size and a token weight. The first
  /// family in the stack that the device has wins; a system family, such as
  /// `-apple-system` or `sans-serif`, is the system font.
  public func font(
    size token: String,
    _ fallback: CGFloat,
    weight: String,
    family: String = "font-family-body"
  ) -> Font {
    astryxFont(
      families: tokens.fonts[family] ?? [],
      size: fontSize(token, fallback),
      weight: fontWeight(size(weight, 400))
    )
  }

  /// The SF Symbol for a shared icon name (AST-082 FR17): the theme's
  /// replacement, else the default. An unknown name stops a development
  /// build with a message that names it, and draws nothing in a release build.
  public func icon(_ name: String) -> String? {
    if let symbol = icons[name] ?? astryxDefaultIcons[name] { return symbol }
    assertionFailure("Astryx has no icon named \"\(name)\"")
    return nil
  }

  func fontWeight(_ value: CGFloat) -> Font.Weight {
    switch value {
    case ..<350: .light
    case 350..<450: .regular
    case 450..<550: .medium
    case 550..<650: .semibold
    case 650..<750: .bold
    default: .heavy
    }
  }
}

extension Color {
  /// A color from `#RRGGBBAA`, the form the generated tokens use. `#RRGGBB`
  /// and `#RGB` also read; anything else is clear.
  public init(astryxHex hex: String) {
    var digits = hex.hasPrefix("#") ? String(hex.dropFirst()) : hex
    if digits.count == 3 { digits = digits.map { "\($0)\($0)" }.joined() }
    if digits.count == 6 { digits += "FF" }
    guard digits.count == 8, let value = UInt32(digits, radix: 16) else {
      self = .clear
      return
    }
    self.init(
      .sRGB,
      red: Double((value >> 24) & 0xFF) / 255,
      green: Double((value >> 16) & 0xFF) / 255,
      blue: Double((value >> 8) & 0xFF) / 255,
      opacity: Double(value & 0xFF) / 255
    )
  }
}

/// A font from a CSS family stack: the first system family or installed font.
func astryxFont(families: [String], size: CGFloat, weight: Font.Weight) -> Font {
  for family in families {
    switch family.lowercased() {
    case "-apple-system", "blinkmacsystemfont", "system-ui", "ui-sans-serif", "sans-serif":
      return .system(size: size, weight: weight)
    case "ui-monospace", "monospace":
      return .system(size: size, weight: weight, design: .monospaced)
    case "ui-serif", "serif":
      return .system(size: size, weight: weight, design: .serif)
    case "ui-rounded":
      return .system(size: size, weight: weight, design: .rounded)
    default:
      if astryxFontIsInstalled(family) {
        // Fixed size: the size already carries the Dynamic Type scale.
        return .custom(family, fixedSize: size).weight(weight)
      }
    }
  }
  return .system(size: size, weight: weight)
}

func astryxFontIsInstalled(_ name: String) -> Bool {
  #if canImport(UIKit)
  UIFont(name: name, size: 12) != nil
  #elseif canImport(AppKit)
  NSFont(name: name, size: 12) != nil
  #else
  false
  #endif
}

/// Dynamic Type's growth for body-sized text, as Apple's Body style grows
/// (17 pt at Large).
func astryxTextScale(for size: DynamicTypeSize) -> CGFloat {
  switch size {
  case .xSmall: 0.82
  case .small: 0.88
  case .medium: 0.94
  case .large: 1
  case .xLarge: 1.12
  case .xxLarge: 1.23
  case .xxxLarge: 1.35
  case .accessibility1: 1.6
  case .accessibility2: 1.9
  case .accessibility3: 2.35
  case .accessibility4: 2.75
  case .accessibility5: 3.1
  @unknown default: 1
  }
}

private struct AstryxThemeKey: EnvironmentKey {
  static let defaultValue = AstryxTheme.default
}

extension EnvironmentValues {
  /// The theme `astryxTheme(_:)` sets; core's default theme without it.
  public var astryxTheme: AstryxTheme {
    get { self[AstryxThemeKey.self] }
    set { self[AstryxThemeKey.self] = newValue }
  }

  /// The style components paint with: the theme's tokens for the current
  /// color scheme, grown by the person's text size. It follows Dark Mode and
  /// Dynamic Type with or without `astryxTheme(_:)`.
  public var astryx: AstryxStyle {
    let theme = astryxTheme
    return AstryxStyle(
      tokens: colorScheme == .dark ? theme.dark : theme.light,
      textScale: astryxTextScale(for: dynamicTypeSize),
      icons: theme.icons
    )
  }
}

extension View {
  /// Paints this subtree with a theme. Components follow the color scheme and
  /// the person's text size either way.
  public func astryxTheme(_ theme: AstryxTheme = .default) -> some View {
    environment(\.astryxTheme, theme)
  }
}
