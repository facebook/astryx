// Copyright (c) Meta Platforms, Inc. and affiliates.

// Draws every component, in light and dark and in its key states, on the iOS
// Simulator. Each state must draw a non-empty image. When
// ASTRYX_SCREENSHOT_DIR is set (CI sets it), each image is also written there
// as <Component>/<state>-<light|dark>.png, so a run's captures can sit beside
// the web component screenshots.
//
// The views are drawn through a hosting controller in a window, not
// ImageRenderer, because ImageRenderer leaves UIKit-backed views such as
// text fields empty.

#if os(iOS)
import SwiftUI
import Testing
import UIKit
@testable import Astryx

/// One state of one component, drawn at a fixed width, optionally with
/// Increase Contrast on or at the largest text size.
struct Capture {
  let component: String
  let state: String
  let width: CGFloat
  let increasedContrast: Bool
  let largestText: Bool
  let view: AnyView

  init<V: View>(
    _ component: String,
    _ state: String,
    width: CGFloat = 360,
    increasedContrast: Bool = false,
    largestText: Bool = false,
    @ViewBuilder _ view: () -> V
  ) {
    self.component = component
    self.state = state
    self.width = width
    self.increasedContrast = increasedContrast
    self.largestText = largestText
    self.view = AnyView(view())
  }
}

@MainActor
private func orderCard() -> some View {
  Astryx.Card {
    VStack(alignment: .leading, spacing: 8) {
      Astryx.Heading("Order #1042", level: 3)
      Astryx.Text("Arrives Tuesday", color: .secondary)
    }
  }
}

@MainActor
func allCaptures() -> [Capture] { [
  // Button: each variant at the default size, the other sizes, an icon, and
  // the loading and disabled states.
  Capture("Button", "primary") { Astryx.Button(label: "Continue", variant: .primary) {} },
  Capture("Button", "secondary") { Astryx.Button(label: "Continue", variant: .secondary) {} },
  Capture("Button", "ghost") { Astryx.Button(label: "Continue", variant: .ghost) {} },
  Capture("Button", "destructive") { Astryx.Button(label: "Delete", variant: .destructive) {} },
  Capture("Button", "sizes") {
    HStack(spacing: 8) {
      Astryx.Button(label: "Small", variant: .primary, size: .sm) {}
      Astryx.Button(label: "Medium", variant: .primary, size: .md) {}
      Astryx.Button(label: "Large", variant: .primary, size: .lg) {}
    }
  },
  Capture("Button", "icon") { Astryx.Button(label: "Search", variant: .secondary, icon: "search") {} },
  Capture("Button", "loading") { Astryx.Button(label: "Saving", variant: .primary, isLoading: true) {} },
  Capture("Button", "disabled") { Astryx.Button(label: "Continue", variant: .primary, isDisabled: true) {} },
  Capture("Button", "fills-width") { Astryx.Button(label: "Sign in", variant: .primary, fillsWidth: true) {} },

  // TextInput: empty with a placeholder, filled, a password, and disabled.
  Capture("TextInput", "placeholder") {
    Astryx.TextInput(label: "Email", value: .constant(""), type: .email, placeholder: "you@example.com")
  },
  Capture("TextInput", "filled") {
    Astryx.TextInput(label: "Name", value: .constant("Ada Lovelace"))
  },
  Capture("TextInput", "password") {
    Astryx.TextInput(label: "Password", value: .constant("secret"), type: .password)
  },
  Capture("TextInput", "disabled") {
    Astryx.TextInput(label: "Name", value: .constant("Ada Lovelace"), isDisabled: true)
  },

  // Text and Heading: every type, color, and heading level.
  Capture("Text", "types") {
    VStack(alignment: .leading, spacing: 8) {
      ForEach(AstryxTextType.allCases, id: \.self) { type in
        Astryx.Text("\(type.rawValue): The quick brown fox", type: type)
      }
    }
  },
  Capture("Text", "colors") {
    VStack(alignment: .leading, spacing: 8) {
      ForEach(AstryxTextColor.allCases, id: \.self) { color in
        Astryx.Text("\(color.rawValue): The quick brown fox", color: color)
      }
    }
  },
  Capture("Heading", "levels") {
    VStack(alignment: .leading, spacing: 8) {
      ForEach(1...5, id: \.self) { level in
        Astryx.Heading("Heading \(level)", level: level)
      }
    }
  },

  // Card and Banner.
  Capture("Card", "default") { orderCard() },
  Capture("Card", "increased-contrast", increasedContrast: true) { orderCard() },
  Capture("Card", "largest-text", largestText: true) { orderCard() },
  Capture("Banner", "statuses") {
    VStack(spacing: 8) {
      ForEach(AstryxBannerStatus.allCases, id: \.self) { status in
        Astryx.Banner(status: status, title: status.rawValue.capitalized, description: "Something you should know.")
      }
    }
  },
  Capture("Banner", "title-only") { Astryx.Banner(status: .info, title: "Saved") },
] }

/// Paints the page ground behind a capture, as a screen would.
private struct Ground<Content: View>: View {
  let content: Content
  @Environment(\.astryx) private var astryx

  var body: some View {
    content
      .padding(16)
      .frame(maxWidth: .infinity, alignment: .leading)
      .background(astryx.color("color-background-body"))
  }
}

/// Hosts `root` in a shown window at `width`, with the color scheme and
/// accessibility settings applied as traits, laid out at the height it needs.
/// Accessibility settings reach SwiftUI as traits: Increase Contrast becomes
/// `colorSchemeContrast == .increased`, and the content size category becomes
/// `dynamicTypeSize`. The height is measured after the window applies them.
@MainActor
private func hosted<V: View>(
  _ root: V,
  width: CGFloat,
  scheme: ColorScheme,
  increasedContrast: Bool = false,
  largestText: Bool = false
) -> (window: UIWindow, controller: UIHostingController<V>) {
  let controller = UIHostingController(rootView: root)
  // A capture is a component, not a screen: no status bar or home indicator
  // insets, which would push the content down and out of the image.
  controller.safeAreaRegions = []
  controller.overrideUserInterfaceStyle = scheme == .dark ? .dark : .light
  if increasedContrast {
    controller.traitOverrides.accessibilityContrast = .high
  }
  if largestText {
    controller.traitOverrides.preferredContentSizeCategory = .accessibilityExtraExtraExtraLarge
  }
  let window = UIWindow(frame: CGRect(x: 0, y: 0, width: width, height: 1))
  window.overrideUserInterfaceStyle = controller.overrideUserInterfaceStyle
  window.rootViewController = controller
  window.isHidden = false
  let height = controller.sizeThatFits(in: CGSize(width: width, height: .greatestFiniteMagnitude)).height
  let bounds = CGRect(x: 0, y: 0, width: width, height: max(height, 1))
  window.frame = bounds
  controller.view.frame = bounds
  controller.view.setNeedsLayout()
  controller.view.layoutIfNeeded()
  return (window, controller)
}

@MainActor
private func png(of capture: Capture, scheme: ColorScheme) -> Data? {
  let root = Ground(content: capture.view)
    .frame(width: capture.width)
    .fixedSize(horizontal: false, vertical: true)
    .astryxTheme()
    .environment(\.colorScheme, scheme)
  let (window, controller) = hosted(
    root,
    width: capture.width,
    scheme: scheme,
    increasedContrast: capture.increasedContrast,
    largestText: capture.largestText
  )
  let format = UIGraphicsImageRendererFormat()
  format.scale = 2
  let image = UIGraphicsImageRenderer(bounds: controller.view.bounds, format: format).image { context in
    controller.view.layer.render(in: context.cgContext)
  }
  window.isHidden = true
  return image.pngData()
}

/// What a hosted view read from its environment.
@MainActor
private final class SeenEnvironment {
  var contrast: ColorSchemeContrast?
  var typeSize: DynamicTypeSize?
}

private struct EnvironmentProbe: View {
  let seen: SeenEnvironment
  @Environment(\.colorSchemeContrast) private var contrast
  @Environment(\.dynamicTypeSize) private var typeSize

  var body: some View {
    seen.contrast = contrast
    seen.typeSize = typeSize
    return Color.clear.frame(width: 10, height: 10)
  }
}

/// The Increase Contrast and largest-text captures are only evidence if the
/// setting reached the view, whether or not a component reacts to it yet.
@MainActor
@Test func capturedViewsSeeTheAccessibilitySettings() {
  let plain = SeenEnvironment()
  let (plainWindow, _) = hosted(EnvironmentProbe(seen: plain), width: 10, scheme: .light)
  #expect(plain.contrast == .standard)
  #expect(plain.typeSize == .large)
  plainWindow.isHidden = true

  let adjusted = SeenEnvironment()
  let (adjustedWindow, _) = hosted(
    EnvironmentProbe(seen: adjusted),
    width: 10,
    scheme: .light,
    increasedContrast: true,
    largestText: true
  )
  #expect(adjusted.contrast == .increased)
  #expect(adjusted.typeSize == .accessibility5)
  adjustedWindow.isHidden = true
}

@MainActor
@Test func everyComponentStateDrawsInLightAndDark() throws {
  let directory = ProcessInfo.processInfo.environment["ASTRYX_SCREENSHOT_DIR"].map { URL(fileURLWithPath: $0) }
  for capture in allCaptures() {
    for (scheme, name) in [(ColorScheme.light, "light"), (.dark, "dark")] {
      let data = try #require(png(of: capture, scheme: scheme), "\(capture.component) \(capture.state) \(name) drew nothing")
      let image = try #require(UIImage(data: data))
      #expect(image.size.width > 1 && image.size.height > 1, "\(capture.component) \(capture.state) \(name) is empty")
      if let directory {
        let folder = directory.appendingPathComponent(capture.component, isDirectory: true)
        try FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true)
        try data.write(to: folder.appendingPathComponent("\(capture.state)-\(name).png"))
      }
    }
  }
}
#endif
