// Copyright (c) Meta Platforms, Inc. and affiliates.

import Astryx

/// Every Swift component's screen. A new component adds a case and its
/// states here, and the UI tests audit it.
enum ComponentScreen: String, CaseIterable, Identifiable {
  case Avatar, Banner, Button, Card, Heading, Icon, Text, TextInput

  var id: String { rawValue }

  @MainActor @ViewBuilder var content: some View {
    switch self {
    case .Avatar: AvatarScreen()
    case .Banner: BannerScreen()
    case .Button: ButtonScreen()
    case .Card: CardScreen()
    case .Heading: HeadingScreen()
    case .Icon: IconScreen()
    case .Text: TextScreen()
    case .TextInput: TextInputScreen()
    }
  }
}

struct AvatarScreen: View {
  @State private var taps = 0

  var body: some View {
    VStack(alignment: .leading, spacing: 24) {
      // Room above the first avatar, so its tooltip has space to open.
      SwiftUI.Text("Team").padding(.top, 48)
      HStack(spacing: 16) {
        Astryx.Avatar("Ada Lovelace")
        Astryx.Avatar("Alan Turing", tooltip: "Online now")
        Astryx.Avatar("Grace Hopper", onClick: { taps += 1 })
        Astryx.Avatar("Linus Torvalds", href: "https://example.com")
        Astryx.Avatar(tooltip: false)
      }
      SwiftUI.Text("Avatar taps: \(taps)").accessibilityIdentifier("avatar.taps")
    }
  }
}

struct BannerScreen: View {
  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      ForEach(AstryxBannerStatus.allCases, id: \.self) { status in
        Astryx.Banner(status: status, title: "Changes saved", description: "Your draft is up to date.")
      }
    }
  }
}

struct ButtonScreen: View {
  @State private var taps = 0

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      Astryx.Button(label: "Save", variant: .primary) { taps += 1 }
      Astryx.Button(label: "Search", icon: "search") { taps += 1 }
      Astryx.Button(label: "Sending", variant: .primary, isLoading: true) { taps += 1 }
      Astryx.Button(label: "Delete", variant: .destructive, isDisabled: true) { taps += 1 }
      Astryx.Button(label: "Small", size: .sm) { taps += 1 }
      SwiftUI.Text("Taps: \(taps)").accessibilityIdentifier("button.taps")
    }
  }
}

struct CardScreen: View {
  var body: some View {
    Astryx.Card {
      VStack(alignment: .leading, spacing: 8) {
        Astryx.Heading("Order 1042", level: .v3)
        Astryx.Text("Two items, arriving Thursday.")
      }
    }
  }
}

struct HeadingScreen: View {
  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      ForEach(HeadingLevel.allCases, id: \.self) { level in
        Astryx.Heading("Heading level \(level.rawValue)", level: level)
      }
    }
  }
}

struct IconScreen: View {
  var body: some View {
    HStack(spacing: 16) {
      Astryx.Icon("search", label: "Search")
      Astryx.Icon("success", color: .success, label: "Done")
      Astryx.Icon("warning")
    }
  }
}

struct TextScreen: View {
  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      Astryx.Text("Body text that wraps onto a second line when the screen is narrow.")
      Astryx.Text("Large", type: .large)
      Astryx.Text("Secondary", color: .secondary)
    }
  }
}

struct TextInputScreen: View {
  @State private var name = ""
  @State private var email = "ada@example.com"
  @State private var password = ""

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      Astryx.TextInput(label: "Name", value: $name, placeholder: "Your name")
      Astryx.TextInput(label: "Email", value: $email, type: .email)
      Astryx.TextInput(label: "Password", value: $password, type: .password)
    }
  }
}
