// Copyright (c) Meta Platforms, Inc. and affiliates.
// Adapted from github.com/ejc3/astryx-swift (MIT).

/// A labeled action, painted with the theme's tokens. It takes core's Button
/// props (`ButtonProps`). With `href` it is a link the system opens. The tap
/// area reaches the platform's 44-by-44-point minimum even when the drawn
/// button is smaller.
public struct Button: View {
  public let props: ButtonProps
  @Environment(\.astryx) private var astryx

  public init(_ props: ButtonProps) {
    self.props = props
  }

  /// - Parameters:
  ///   - label: core's `label`, the button's words and accessible name.
  ///   - variant: core's `variant`; `secondary` when nil.
  ///   - size: core's `size`; `md` when nil.
  ///   - elevation: core's `elevation`, the theme's shadow at that depth.
  ///   - isLoading: core's `isLoading`: a spinner over the label, undimmed and
  ///     focusable, "Loading" spoken, presses ignored until it finishes.
  ///   - isInterruptible: core's `isInterruptible`: presses still land while
  ///     loading, so they can interrupt it.
  ///   - isDisabled: core's `isDisabled`.
  ///   - width: core's `width`: `content` (default) or `fill`, the whole width
  ///     offered.
  ///   - tooltip: core's `tooltip`: a tip on hover with a pointer, and a hint
  ///     VoiceOver reads; a tap belongs to the button, as on core's touch
  ///     screens.
  ///   - href: core's `href`: an enabled button becomes a SwiftUI `Link` the
  ///     system opens.
  ///   - base: core's base props.
  ///   - onClick: core's `onClick`, the press.
  public init(
    label: String,
    variant: ButtonVariant? = nil,
    size: ButtonSize? = nil,
    elevation: ButtonElevation? = nil,
    isLoading: Bool? = nil,
    isInterruptible: Bool? = nil,
    isDisabled: Bool? = nil,
    width: ButtonWidth? = nil,
    tooltip: String? = nil,
    href: String? = nil,
    base: AstryxBaseProps = AstryxBaseProps(),
    onClick: (() -> Void)? = nil
  ) {
    self.init(
      ButtonProps(
        label: label,
        variant: variant,
        size: size,
        elevation: elevation,
        isLoading: isLoading,
        isInterruptible: isInterruptible,
        isDisabled: isDisabled,
        width: width,
        tooltip: tooltip,
        onClick: onClick,
        href: href,
        base: base
      )
    )
  }

  var isLoading: Bool { props.isLoading == true }
  var isDisabled: Bool { props.isDisabled == true }

  /// The link an enabled button with `href` becomes. A disabled one stays a
  /// disabled button, as core draws a disabled `<button>`.
  /// A destination a link never opens leaves an enabled button.
  var link: URL? {
    guard !isDisabled, let href = props.href, let url = URL(string: href) else { return nil }
    return Self.opensAsLink(url) ? url : nil
  }

  /// Whether a link may open a destination: not a script URL or an HTML
  /// document in a `data:` URL, which core's navigation destinations refuse.
  static func opensAsLink(_ url: URL) -> Bool {
    switch url.scheme?.lowercased() {
    case "javascript", "vbscript": return false
    case "data": return !url.absoluteString.lowercased().hasPrefix("data:text/html")
    default: return true
    }
  }

  public var body: some View {
    control
      .buttonStyle(style)
      // A disabled Button with a tooltip keeps its focus stop so keyboard
      // users reach the tooltip, as core keeps it focusable; presses still
      // never land, and VoiceOver reads a dimmed button.
      .disabled(isDisabled && !keepsFocusWhileDisabled)
      .modifier(DimmedButtonAccessibility(isActive: keepsFocusWhileDisabled, label: accessibilityText))
      // The shared Astryx tooltip on hover and keyboard focus, as core's
      // Button tooltip; its words are the VoiceOver hint.
      .astryxTooltip(props.tooltip, hint: props.tooltip, focus: .control)
      .accessibilityLabel(SwiftUI.Text(accessibilityText))
      .accessibilityValue(SwiftUI.Text(loadingValue ?? ""))
      .onChange(of: isLoading) { _, loading in
        if loading { AccessibilityNotification.Announcement(AstryxStrings.buttonLoading).post() }
      }
      .astryxBase(props.base)
  }

  @ViewBuilder private var control: some View {
    if let link {
      // A link the system opens, read as a link; while loading it stays a
      // link and opens nothing until loading ends, unless interruptible.
      SwiftUI.Link(destination: link) { content }
        .environment(\.openURL, OpenURLAction { _ in
          let lands = acceptsPress
          if lands { props.onClick?() }
          return lands ? .systemAction : .handled
        })
    } else {
      SwiftUI.Button(action: activate) { content }
        .accessibilityAddTraits(Self.accessibilityTraits)
    }
  }

  private var content: some View {
    // The label keeps its place while loading so the width holds; the
    // spinner draws over it.
    SwiftUI.Text(props.label)
      .lineLimit(1)
      .opacity(isLoading ? 0 : 1)
      .overlay {
        if isLoading {
          ProgressView().controlSize(.small).tint(foreground)
        }
      }
  }

  private var style: AstryxButtonStyle {
    AstryxButtonStyle(
      astryx: astryx,
      height: height,
      fillsWidth: props.width == .fill,
      foreground: foreground,
      background: background,
      shadow: shadow,
      isDimmed: isDisabled
    )
  }

  /// The button's accessible name: its label, also while loading.
  var accessibilityText: String { props.label }

  /// The traits assistive technology gets: a button.
  static var accessibilityTraits: AccessibilityTraits { .isButton }

  /// What assistive technology reads after the label while loading: core's
  /// catalog message, in the person's language.
  var loadingValue: String? { isLoading ? AstryxStrings.buttonLoading : nil }

  /// Whether a press lands now: not while loading, unless interruptible.
  var acceptsPress: Bool { !isDisabled && (!isLoading || props.isInterruptible == true) }

  /// A disabled Button with a tooltip keeps its focus stop (core Button FR10).
  var keepsFocusWhileDisabled: Bool { isDisabled && props.tooltip != nil }

  /// Runs `onClick` when a press lands.
  func activate() {
    guard acceptsPress else { return }
    props.onClick?()
  }

  var height: CGFloat {
    let size = astryx.tokens.size
    switch props.size ?? .md {
    case .sm: return size.elementSm
    case .md: return size.elementMd
    case .lg: return size.elementLg
    }
  }

  private var foreground: Color {
    let color = astryx.tokens.color
    switch props.variant ?? .secondary {
    case .primary: return color.onAccent
    case .destructive: return color.onError
    case .secondary, .ghost: return color.textPrimary
    }
  }

  private var background: Color {
    let color = astryx.tokens.color
    switch props.variant ?? .secondary {
    case .primary: return color.accent
    case .destructive: return color.error
    case .secondary: return color.neutral
    case .ghost: return .clear
    }
  }

  var shadow: [ShadowLayer] {
    let shadow = astryx.tokens.shadow
    switch props.elevation ?? .none {
    case .none: return []
    case .low: return shadow.low
    case .med: return shadow.med
    case .high: return shadow.high
    }
  }
}

struct AstryxButtonStyle: ButtonStyle {
  let astryx: AstryxStyle
  let height: CGFloat
  let fillsWidth: Bool
  let foreground: Color
  let background: Color
  let shadow: [ShadowLayer]
  /// Draws the disabled look for a disabled Button that keeps its focus stop.
  var isDimmed = false
  @Environment(\.isEnabled) private var environmentEnabled
  private var isEnabled: Bool { environmentEnabled && !isDimmed }

  func makeBody(configuration: Configuration) -> some View {
    let shape = RoundedRectangle(cornerRadius: astryx.tokens.radius.element, style: .continuous)
    let font = astryx.tokens.font
    configuration.label
      .font(astryx.font(TypeStyle(font.label, families: font.family.body)))
      .foregroundStyle(foreground)
      .padding(.horizontal, astryx.tokens.space.s3)
      // Grows with text size, but not so far that one line of a large label
      // becomes a tall slab.
      .frame(maxWidth: fillsWidth ? .infinity : nil, minHeight: height * min(astryx.textScale, 1.4))
      .background(shape.fill(background))
      .astryxShadow(shadow, in: shape)
      .opacity(isEnabled ? (configuration.isPressed ? 0.75 : 1) : 0.5)
      // Drawn at the token size; laid out at least 44 by 44 so the whole
      // platform-minimum tap area counts.
      .frame(minWidth: 44, minHeight: 44)
      .contentShape(Rectangle())
  }
}

/// For a disabled Button that keeps its focus stop: VoiceOver reads the
/// platform's disabled button in its place.
private struct DimmedButtonAccessibility: ViewModifier {
  let isActive: Bool
  let label: String

  func body(content: Content) -> some View {
    if isActive {
      content.accessibilityRepresentation {
        SwiftUI.Button(label) {}.disabled(true)
      }
    } else {
      content
    }
  }
}
