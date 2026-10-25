// Copyright (c) Meta Platforms, Inc. and affiliates.

import AstryxNative
import SwiftUI
import os

/// A person's or an entity's picture: the image at `src`, else `fallbackSrc`,
/// else initials from `name`, else a person symbol (core `Avatar`).
///
/// ```swift
/// Avatar("Ada Lovelace", src: "https://example.com/ada.jpg")
/// Avatar("Ada Lovelace", size: .lg, shape: .rounded)
/// Avatar("Ada Lovelace", href: "https://example.com/ada")
/// Avatar("Ada Lovelace") { showProfile() }
/// ```
public struct Avatar: View {
  /// The contract the view draws, the same for both initializers.
  public let props: AvatarProps
  @Environment(\.astryx) private var astryx

  /// An avatar from its labeled props.
  /// - Parameters:
  ///   - name: The person's or entity's name, for initials and the accessible name (core `name`).
  ///   - src: The image URL (core `src`).
  ///   - fallbackSrc: The image URL to try when `src` fails (core `fallbackSrc`).
  ///   - alt: The accessible name, when it differs from `name` (core `alt`).
  ///   - size: `xsm` 20, `sm` 24, `md` 36, `lg` 48, or `xl` 128 points; `nil` is `md` (core `size`).
  ///   - shape: `circle`, `rounded`, or `square`; `nil` is `circle` (core `shape`).
  ///   - tooltip: Words shown where there is a pointer: `nil` or `true` the name, a string those words, `false` none (core `tooltip`).
  ///   - href: A URL the system opens when the avatar is tapped; the avatar becomes a link (core `href`).
  ///   - onClick: Runs when the avatar is tapped; without `href` the avatar becomes a button (core `onClick`).
  public init(
    _ name: String? = nil,
    src: String? = nil,
    fallbackSrc: String? = nil,
    alt: String? = nil,
    size: AvatarSize? = nil,
    shape: AvatarShape? = nil,
    tooltip: AvatarTooltip? = nil,
    href: String? = nil,
    onClick: (() -> Void)? = nil
  ) {
    self.init(
      AvatarProps(
        src: src, fallbackSrc: fallbackSrc, name: name, alt: alt, size: size, shape: shape, tooltip: tooltip, href: href,
        onClick: onClick
      ))
  }

  /// An avatar from its generated contract, for generated and wire-driven callers.
  public init(_ props: AvatarProps) {
    self.props = props
  }

  public var body: some View {
    if props.base.isHidden != true {
      control
        // One tooltip path for every tooltip value (FR8): a bubble on a
        // resting pointer, keyboard focus, and a tap on touch screens.
        .modifier(AvatarTooltipPresenter(text: tooltipText, isTabStop: Avatar.isTooltipTabStop(tap: tap, hasTooltip: tooltipText != nil)))
        .modifier(AvatarTapTooltip(text: Avatar.opensTooltipOnTap(tap) ? tooltipText : nil))
        .modifier(AvatarHint(text: tooltipHint))
        .modifier(AvatarIdentifier(id: props.base.id))
        .onAppear(perform: checkInDevelopment)
    }
  }

  /// Development checks core makes too: an `href` an app cannot open stops
  /// the build with its value, and an unnamed link or button is flagged.
  private func checkInDevelopment() {
    #if DEBUG
    if Avatar.isUnusableHref(props.href) {
      assertionFailure(
        "Avatar href \"\(props.href ?? "")\" is not an absolute URL an app can open; it draws without a link.")
    }
    if Avatar.needsNameWarning(tap: tap, isNamed: accessibilityLabel != nil) {
      Logger(subsystem: "Astryx", category: "Avatar").warning(
        "An Avatar with href or onClick has no alt or name, so VoiceOver reads it without a name.")
    }
    #endif
  }

  /// The tooltip's words: the name for `nil` or `true`, the given words, or
  /// none for `false` or blank words, as core resolves it.
  var tooltipText: String? {
    switch props.tooltip ?? .on {
    case .on: Avatar.meaningful(props.name)
    case .off: nil
    case .text(let words): Avatar.meaningful(words)
    }
  }

  /// The VoiceOver hint: given tooltip words, as core puts them in the
  /// description; the default name is the avatar's own name, not repeated.
  var tooltipHint: String? {
    guard case .text = props.tooltip else { return nil }
    return tooltipText
  }

  /// A non-empty `href` that is not an absolute URL, such as a web path.
  nonisolated static func isUnusableHref(_ href: String?) -> Bool {
    guard let href, !href.isEmpty else { return false }
    guard let url = URL(string: href) else { return true }
    return url.scheme == nil
  }

  /// The picture as a link with `href`, a button with only `onClick`, or a
  /// static image (Swift component API, A4). All three draw the same.
  @ViewBuilder private var control: some View {
    if let url = linkURL {
      SwiftUI.Link(destination: url) { picture }
        .buttonStyle(.plain)
        .modifier(AvatarRunsBeforeOpening(onClick: props.onClick))
        .modifier(AvatarTarget(side: side))
        .modifier(AvatarName(label: accessibilityLabel, isInteractive: true))
    } else if let onClick = props.onClick {
      SwiftUI.Button(action: onClick) { picture }
        .buttonStyle(.plain)
        .modifier(AvatarTarget(side: side))
        .modifier(AvatarName(label: accessibilityLabel, isInteractive: true))
    } else {
      picture
        .modifier(AvatarName(label: accessibilityLabel, isInteractive: false))
    }
  }

  /// How the avatar takes a tap: a link with a usable `href`, else a button
  /// with `onClick`, else none.
  enum Tap: Equatable { case link, button, none }

  /// Whether a tap on a touch screen opens the tooltip: only for a static
  /// avatar; a link or button keeps the tap for its action, as core's does.
  nonisolated static func opensTooltipOnTap(_ tap: Tap) -> Bool { tap == .none }

  /// Whether a static avatar takes keyboard focus: while it has a tooltip,
  /// as core gives it a tab stop, so a keyboard user can read it. A link or
  /// button is a tab stop already.
  nonisolated static func isTooltipTabStop(tap: Tap, hasTooltip: Bool) -> Bool {
    tap == .none && hasTooltip
  }

  var tap: Tap {
    if linkURL != nil { return .link }
    if props.onClick != nil { return .button }
    return .none
  }

  /// The traits the avatar adds: a named static avatar is an image; a link or
  /// button keeps its own trait and adds none (Swift accessibility, X1).
  nonisolated static func addedTraits(tap: Tap, isNamed: Bool) -> AccessibilityTraits {
    tap == .none && isNamed ? .isImage : []
  }

  /// A link or button avatar needs a name, as core warns in development.
  nonisolated static func needsNameWarning(tap: Tap, isNamed: Bool) -> Bool {
    tap != .none && !isNamed
  }

  /// The photo; the fallback photo only after it fails or when there is
  /// none, as core does; initials or the symbol while either loads and
  /// after both fail.
  private var picture: some View {
    AvatarImage(url: url(props.src)) {
      plate
    } failure: {
      AvatarImage(url: url(props.fallbackSrc)) { plate } failure: { plate }
    }
    .frame(width: side, height: side)
    .clipShape(AvatarShapeOutline(shape: resolvedShape, radius: cornerRadius))
  }

  /// The fallback: initials on the neutral plate, else a person symbol.
  private var plate: some View {
    ZStack {
      astryx.tokens.color.neutral
      if let initials {
        SwiftUI.Text(initials)
          .font(initialsFont)
          .foregroundStyle(astryx.tokens.color.textSecondary)
          .lineLimit(1)
          .fixedSize()
      } else {
        Image(systemName: "person.fill")
          .resizable()
          .scaledToFit()
          .frame(width: side * 0.6, height: side * 0.6)
          .foregroundStyle(astryx.tokens.color.textSecondary)
      }
    }
  }

  /// The side of the avatar in points.
  /// The side of the avatar in points: core's size grown with Dynamic Type,
  /// as the name beside it grows, up to 1.6 times so it never swallows a row.
  var side: CGFloat { Avatar.side(for: props.size ?? .md, textScale: astryx.textScale) }

  /// The most an avatar grows with Dynamic Type.
  nonisolated static var maximumTextScale: CGFloat { 1.6 }

  nonisolated static func side(for size: AvatarSize, textScale: CGFloat) -> CGFloat {
    (points(for: size) * min(max(textScale, 1), maximumTextScale)).rounded()
  }

  var resolvedShape: AvatarShape { props.shape ?? .circle }

  /// The corner radius for `rounded`, from the theme's element radius.
  private var cornerRadius: CGFloat { astryx.tokens.radius.element }

  /// Initials drawn at 40% of the side in the theme's body family, medium weight.
  private var initialsFont: Font {
    astryxFont(
      families: astryx.tokens.font.familyBody,
      size: side * 0.4,
      weight: astryx.fontWeight(astryx.tokens.font.weightMedium),
      isBoldText: astryx.isBoldText
    )
  }

  /// The initials the plate shows, or `nil` for the person symbol.
  var initials: String? {
    guard let name = Avatar.meaningful(props.name) else { return nil }
    let initials = Avatar.initials(from: name)
    return initials.isEmpty ? nil : initials
  }

  /// The name VoiceOver reads: `alt`, else `name`; `nil` when neither
  /// carries anything, and then a static avatar is decorative.
  var accessibilityLabel: String? {
    Avatar.meaningful(props.alt) ?? Avatar.meaningful(props.name)
  }

  /// The URL the avatar opens, or `nil` when it has no usable `href`.
  var linkURL: URL? {
    // Only an absolute URL the system can open; a malformed or relative
    // `href` leaves the avatar static or a button.
    guard let url = url(props.href), url.scheme != nil else { return nil }
    return url
  }

  private func url(_ string: String?) -> URL? {
    guard let string, !string.isEmpty else { return nil }
    return URL(string: string)
  }

  /// Core's named sizes in points.
  nonisolated static func points(for size: AvatarSize) -> CGFloat {
    switch size {
    case .xsm: 20
    case .sm: 24
    case .md: 36
    case .lg: 48
    case .xl: 128
    }
  }

  /// The string when it carries something, `nil` when it is absent or blank.
  nonisolated static func meaningful(_ value: String?) -> String? {
    guard let value, !value.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return nil }
    return value
  }

  /// Core's initials: the first letter, digit, or emoji of the first and last
  /// words that have one, uppercased. Leading punctuation in a word is skipped.
  nonisolated static func initials(from name: String) -> String {
    let letters = name.split(whereSeparator: { $0.isWhitespace }).compactMap { word in
      word.first(where: canStandForAWord)
    }
    guard let first = letters.first else { return "" }
    guard letters.count > 1, let last = letters.last else { return String(first).uppercased() }
    return (String(first) + String(last)).uppercased()
  }

  /// A letter, a digit, or an emoji, as core's `\p{L}`, `\p{N}`,
  /// `\p{Extended_Pictographic}`, and `\p{Regional_Indicator}`.
  nonisolated static func canStandForAWord(_ character: Character) -> Bool {
    if character.isLetter || character.isNumber { return true }
    guard let scalar = character.unicodeScalars.first else { return false }
    // `isEmoji` also covers `#`, `*`, and the digits, which are ASCII.
    return scalar.value > 0x7F && scalar.properties.isEmoji
  }
}

/// Draws the image at a URL: `loading` while it loads, `failure` when it
/// fails or there is no URL.
private struct AvatarImage<Loading: View, Failure: View>: View {
  let url: URL?
  @ViewBuilder let loading: () -> Loading
  @ViewBuilder let failure: () -> Failure

  var body: some View {
    if let url {
      AsyncImage(url: url) { phase in
        if let image = phase.image {
          image.resizable().scaledToFill()
        } else if phase.error != nil {
          failure()
        } else {
          loading()
        }
      }
    } else {
      failure()
    }
  }
}

/// Runs `onClick` as a link opens, then hands the URL to whatever opens URLs
/// above the avatar, so an app's own handler still applies. Without
/// `onClick` it changes nothing.
private struct AvatarRunsBeforeOpening: ViewModifier {
  let onClick: (() -> Void)?
  @Environment(\.openURL) private var inheritedOpenURL

  func body(content: Content) -> some View {
    if let onClick {
      content.environment(\.openURL, OpenURLAction { url in
        onClick()
        inheritedOpenURL(url)
        return .handled
      })
    } else {
      content
    }
  }
}

/// The outline each shape clips to: a circle, the element radius, or square.
private struct AvatarShapeOutline: Shape {
  let shape: AvatarShape
  let radius: CGFloat

  func path(in rect: CGRect) -> Path {
    switch shape {
    case .circle: Circle().path(in: rect)
    case .rounded: RoundedRectangle(cornerRadius: radius, style: .continuous).path(in: rect)
    case .square: Rectangle().path(in: rect)
    }
  }
}

/// One element named by the avatar's label. A static avatar without a label
/// is hidden; an interactive one keeps its link or button trait.
private struct AvatarName: ViewModifier {
  let label: String?
  let isInteractive: Bool

  func body(content: Content) -> some View {
    if let label {
      if isInteractive {
        content.accessibilityElement(children: .ignore).accessibilityLabel(label)
      } else {
        content.accessibilityElement(children: .ignore).accessibilityLabel(label)
          .accessibilityAddTraits(Avatar.addedTraits(tap: .none, isNamed: true))
      }
    } else if isInteractive {
      content
    } else {
      content.accessibilityHidden(true)
    }
  }
}

/// A tappable avatar answers taps across at least 44 by 44 points without
/// changing its drawn size or its layout (Swift accessibility, X7).
private struct AvatarTarget: ViewModifier {
  let side: CGFloat

  func body(content: Content) -> some View {
    let outset = max(0, (44 - side) / 2)
    content.contentShape(.interaction, Rectangle().inset(by: -outset))
  }
}

/// The tooltip where there is a pointer or a keyboard: when the pointer
/// rests on the avatar, or the avatar has keyboard focus, for core's 200 ms,
/// a bubble below it shows the tooltip's words in core's tooltip colors; a
/// press hides it. The bubble is hidden from VoiceOver.
struct AvatarTooltipPresenter: ViewModifier {
  /// The tooltip's words: the name or given words.
  let text: String?
  /// Makes a static avatar focusable, so keyboard focus can show its tooltip.
  let isTabStop: Bool
  @State private var isShown = false
  @State private var isHovering = false
  @State private var pending: Task<Void, Never>?
  @FocusState private var isFocused: Bool

  /// Core's tooltip delay before showing.
  nonisolated static var delay: Duration { .milliseconds(200) }

  func body(content: Content) -> some View {
    if let text {
      content
        // Only a static avatar is made focusable; `focusable(false)` would
        // take focus away from a link or button.
        .modifier(AvatarTabStop(isOn: isTabStop))
        .focused($isFocused)
        // A press hides the tooltip, as core's does.
        .simultaneousGesture(TapGesture().onEnded {
          pending?.cancel()
          isShown = false
        })
        .onHover { inside in
          isHovering = inside
          update()
        }
        .onChange(of: isFocused) { update() }
        .overlay(alignment: .bottom) {
          if isShown {
            AvatarTooltipBubble(text: text)
              // The bubble's top sits 4 points below the avatar.
              .alignmentGuide(.bottom) { d in d[.top] - 4 }
          }
        }
        .zIndex(isShown ? 1 : 0)
    } else {
      content
    }
  }

  /// Shows the bubble after the delay while hovered or focused; hides it at once otherwise.
  private func update() {
    pending?.cancel()
    guard isHovering || isFocused else {
      isShown = false
      return
    }
    pending = Task { @MainActor in
      try? await Task.sleep(for: Self.delay)
      if !Task.isCancelled { isShown = true }
    }
  }
}

/// The tooltip on a touch screen, as core's `touchTrigger`: a tap on a static
/// avatar opens a bubble with the tooltip's words, and the next tap, on the
/// avatar or elsewhere, closes it. With VoiceOver running the tap is left
/// alone, so VoiceOver reads the avatar as before.
struct AvatarTapTooltip: ViewModifier {
  let text: String?
  @Environment(\.astryx) private var astryx
  @Environment(\.accessibilityVoiceOverEnabled) private var voiceOver
  @State private var isShown = false

  func body(content: Content) -> some View {
    #if os(iOS)
    if let text, !voiceOver {
      content
        // Shared with an enclosing row's button or link, which still runs:
        // core's touch trigger never takes the tap from its container.
        .simultaneousGesture(TapGesture().onEnded { isShown.toggle() })
        // A popover closes on the next tap anywhere, as core's tooltip does.
        .popover(isPresented: $isShown, arrowEdge: .bottom) {
          AvatarTooltipBubble(text: text)
            .presentationCompactAdaptation(.popover)
            .presentationBackground(astryx.tokens.color.textPrimary)
        }
    } else {
      content
    }
    #else
    content
    #endif
  }
}

/// Given tooltip words as the VoiceOver hint, or no hint.
private struct AvatarHint: ViewModifier {
  let text: String?

  func body(content: Content) -> some View {
    if let text {
      content.accessibilityHint(SwiftUI.Text(text))
    } else {
      content
    }
  }
}

/// Makes a view a keyboard tab stop, or leaves it as it is.
private struct AvatarTabStop: ViewModifier {
  let isOn: Bool

  func body(content: Content) -> some View {
    if isOn {
      content.focusable()
    } else {
      content
    }
  }
}

/// Core's tooltip surface: the primary text color behind surface-colored
/// body text, padded `space.s1` by `space.s2`, with the container radius.
struct AvatarTooltipBubble: View {
  let text: String
  @Environment(\.astryx) private var astryx

  var body: some View {
    SwiftUI.Text(text)
      .font(astryx.font(size: "text-body-size", 14, weight: "text-body-weight"))
      .foregroundStyle(astryx.tokens.color.backgroundSurface)
      .padding(.vertical, astryx.tokens.space.s1)
      .padding(.horizontal, astryx.tokens.space.s2)
      .background(
        RoundedRectangle(cornerRadius: astryx.tokens.radius.container, style: .continuous)
          .fill(astryx.tokens.color.textPrimary)
      )
      .fixedSize()
      .allowsHitTesting(false)
      .accessibilityHidden(true)
  }
}

/// The base `id` becomes the accessibility identifier (AST-082 FR7).
private struct AvatarIdentifier: ViewModifier {
  let id: String?

  func body(content: Content) -> some View {
    if let id {
      content.accessibilityIdentifier(id)
    } else {
      content
    }
  }
}
