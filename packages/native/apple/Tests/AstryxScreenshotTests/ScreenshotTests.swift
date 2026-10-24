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

/// One state of one component, drawn at a fixed width.
struct Capture {
  let component: String
  let state: String
  let width: CGFloat
  let view: AnyView

  init<V: View>(_ component: String, _ state: String, width: CGFloat = 360, @ViewBuilder _ view: () -> V) {
    self.component = component
    self.state = state
    self.width = width
    self.view = AnyView(view())
  }
}

@MainActor
func allCaptures() -> [Capture] { [
  // Button: each variant at the default size, the other sizes, an icon, and
  // the loading and disabled states.
  Capture("Button", "primary") { AstryxButton(label: "Continue", variant: .primary) {} },
  Capture("Button", "secondary") { AstryxButton(label: "Continue", variant: .secondary) {} },
  Capture("Button", "ghost") { AstryxButton(label: "Continue", variant: .ghost) {} },
  Capture("Button", "destructive") { AstryxButton(label: "Delete", variant: .destructive) {} },
  Capture("Button", "sizes") {
    HStack(spacing: 8) {
      AstryxButton(label: "Small", variant: .primary, size: .sm) {}
      AstryxButton(label: "Medium", variant: .primary, size: .md) {}
      AstryxButton(label: "Large", variant: .primary, size: .lg) {}
    }
  },
  Capture("Button", "icon") { AstryxButton(label: "Search", variant: .secondary, icon: "search") {} },
  Capture("Button", "loading") { AstryxButton(label: "Saving", variant: .primary, isLoading: true) {} },
  Capture("Button", "disabled") { AstryxButton(label: "Continue", variant: .primary, isDisabled: true) {} },
  Capture("Button", "fills-width") { AstryxButton(label: "Sign in", variant: .primary, fillsWidth: true) {} },

  // TextInput: empty with a placeholder, filled, a password, and disabled.
  Capture("TextInput", "placeholder") {
    AstryxTextInput(label: "Email", value: .constant(""), type: .email, placeholder: "you@example.com")
  },
  Capture("TextInput", "filled") {
    AstryxTextInput(label: "Name", value: .constant("Ada Lovelace"))
  },
  Capture("TextInput", "password") {
    AstryxTextInput(label: "Password", value: .constant("secret"), type: .password)
  },
  Capture("TextInput", "disabled") {
    AstryxTextInput(label: "Name", value: .constant("Ada Lovelace"), isDisabled: true)
  },

  // Text and Heading: every type, color, and heading level.
  Capture("Text", "types") {
    VStack(alignment: .leading, spacing: 8) {
      ForEach(AstryxTextType.allCases, id: \.self) { type in
        AstryxText("\(type.rawValue): The quick brown fox", type: type)
      }
    }
  },
  Capture("Text", "colors") {
    VStack(alignment: .leading, spacing: 8) {
      ForEach(AstryxTextColor.allCases, id: \.self) { color in
        AstryxText("\(color.rawValue): The quick brown fox", color: color)
      }
    }
  },
  Capture("Heading", "levels") {
    VStack(alignment: .leading, spacing: 8) {
      ForEach(1...5, id: \.self) { level in
        AstryxHeading("Heading \(level)", level: level)
      }
    }
  },

  // Card and Banner.
  Capture("Card", "default") {
    AstryxCard {
      VStack(alignment: .leading, spacing: 8) {
        AstryxHeading("Order #1042", level: 3)
        AstryxText("Arrives Tuesday", color: .secondary)
      }
    }
  },
  Capture("Banner", "statuses") {
    VStack(spacing: 8) {
      ForEach(AstryxBannerStatus.allCases, id: \.self) { status in
        AstryxBanner(status: status, title: status.rawValue.capitalized, description: "Something you should know.")
      }
    }
  },
  Capture("Banner", "title-only") { AstryxBanner(status: .info, title: "Saved") },
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

@MainActor
private func png(of capture: Capture, scheme: ColorScheme) -> Data? {
  let root = Ground(content: capture.view)
    .frame(width: capture.width)
    .fixedSize(horizontal: false, vertical: true)
    .astryxTheme()
    .environment(\.colorScheme, scheme)
  let controller = UIHostingController(rootView: root)
  // A capture is a component, not a screen: no status bar or home indicator
  // insets, which would push the content down and out of the image.
  controller.safeAreaRegions = []
  controller.overrideUserInterfaceStyle = scheme == .dark ? .dark : .light
  let height = controller.sizeThatFits(in: CGSize(width: capture.width, height: .greatestFiniteMagnitude)).height
  let bounds = CGRect(x: 0, y: 0, width: capture.width, height: max(height, 1))
  let window = UIWindow(frame: bounds)
  window.overrideUserInterfaceStyle = controller.overrideUserInterfaceStyle
  window.rootViewController = controller
  window.isHidden = false
  controller.view.frame = bounds
  controller.view.setNeedsLayout()
  controller.view.layoutIfNeeded()
  let format = UIGraphicsImageRendererFormat()
  format.scale = 2
  let image = UIGraphicsImageRenderer(bounds: bounds, format: format).image { context in
    controller.view.layer.render(in: context.cgContext)
  }
  window.isHidden = true
  return image.pngData()
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
