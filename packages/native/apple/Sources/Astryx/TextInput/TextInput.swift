// Copyright (c) Meta Platforms, Inc. and affiliates.
// Adapted from github.com/ejc3/astryx-swift (MIT).

/// A labeled one-line text field, painted with the theme's tokens. It takes
/// core's TextInput props (`TextInputProps`): the label stays visible above
/// the field unless hidden, and is the field's accessible name either way.
public struct TextInput: View {
  public let props: TextInputProps
  @Environment(\.astryx) private var astryx
  @FocusState private var isFocused: Bool
  @State private var shownTip: Tip?

  /// A tip a tap opens on a touch screen, where there is no hover.
  enum Tip: Identifiable {
    case label, status, disabled
    var id: Self { self }
  }

  public init(_ props: TextInputProps) {
    self.props = props
  }

  /// - Parameters:
  ///   - label: core's `label`, the field's visible and accessible name.
  ///   - value: core's `value`, the text the field shows.
  ///   - type: core's `type`: `text`, `email`, or `password`.
  ///   - onChange: core's `onChange`, called with each edit.
  ///   - size: core's `size`; `md` when nil.
  ///   - isLabelHidden: core's `isLabelHidden`: no visible label, the same
  ///     accessible name.
  ///   - description: core's `description`, shown between the label and the
  ///     field and read after the label.
  ///   - isOptional: core's `isOptional`, an "Optional" note after the label.
  ///   - isRequired: core's `isRequired`, a "Required" note after the label.
  ///   - onEnter: core's `onEnter`, called when the person submits the field
  ///     (Return), never while an input method is still composing.
  ///   - isDisabled: core's `isDisabled`: dimmed and not editable.
  ///   - isReadOnly: core's `isReadOnly`: shown at full strength, selectable,
  ///     not editable.
  ///   - disabledMessage: core's `disabledMessage`, why a disabled field is
  ///     disabled: a tip on hover or tap, and read after the label.
  ///   - isLoading: core's `isLoading`: a spinner, and "Loading" spoken once
  ///     when it starts.
  ///   - placeholder: core's `placeholder`.
  ///   - labelTooltip: core's `labelTooltip`, a tip on an info icon after the
  ///     label: on hover or tap.
  ///   - status: core's `status`: a colored border and status icon, and its
  ///     message below the field.
  ///   - statusVariant: core's `statusVariant`: the message `attached` to the
  ///     field (default), `detached` below it, or in a `tooltip` on the icon.
  ///   - hasClear: core's `hasClear`, a clear button while there is text.
  ///   - hasAutoFocus: core's `hasAutoFocus`, focus when the field appears.
  ///   - base: core's base props; `id` names the field itself.
  public init(
    label: String,
    value: String,
    type: TextInputType? = nil,
    onChange: ((String) -> Void)? = nil,
    size: TextInputSize? = nil,
    isLabelHidden: Bool? = nil,
    description: String? = nil,
    isOptional: Bool? = nil,
    isRequired: Bool? = nil,
    onEnter: (() -> Void)? = nil,
    isDisabled: Bool? = nil,
    isReadOnly: Bool? = nil,
    disabledMessage: String? = nil,
    isLoading: Bool? = nil,
    placeholder: String? = nil,
    labelTooltip: String? = nil,
    status: TextInputStatus? = nil,
    statusVariant: TextInputStatusVariant? = nil,
    hasClear: Bool? = nil,
    hasAutoFocus: Bool? = nil,
    base: AstryxBaseProps = AstryxBaseProps()
  ) {
    self.init(
      TextInputProps(
        type: type,
        label: label,
        value: value,
        onChange: onChange,
        size: size,
        isLabelHidden: isLabelHidden,
        description: description,
        isOptional: isOptional,
        isRequired: isRequired,
        onEnter: onEnter,
        isDisabled: isDisabled,
        isReadOnly: isReadOnly,
        disabledMessage: disabledMessage,
        isLoading: isLoading,
        placeholder: placeholder,
        labelTooltip: labelTooltip,
        status: status,
        statusVariant: statusVariant,
        hasClear: hasClear,
        hasAutoFocus: hasAutoFocus,
        base: base
      )
    )
  }

  var isDisabled: Bool { props.isDisabled == true }
  /// Disabled wins when both are set, as in core.
  var isReadOnly: Bool { props.isReadOnly == true && !isDisabled }
  var statusVariant: TextInputStatusVariant { props.statusVariant ?? .attached }

  public var body: some View {
    if props.base.isHidden == true {
      EmptyView()
    } else {
      SwiftUI.VStack(alignment: .leading, spacing: astryx.tokens.space.s1) {
        if props.isLabelHidden != true {
          labelRow
        }
        // A hidden label hides the description with it, as core's field does;
        // VoiceOver still reads both on the field.
        if props.isLabelHidden != true, let description = props.description {
          Text(description, type: .supporting, color: .secondary)
            .accessibilityHidden(true)
        }
        SwiftUI.VStack(alignment: .leading, spacing: 0) {
          fieldRow
          statusMessage
        }
      }
      .onAppear {
        if props.hasAutoFocus == true { isFocused = true }
        // A field that appears busy says so, as core announces a busy start.
        if props.isLoading == true { AccessibilityNotification.Announcement(AstryxStrings.spinnerLoading).post() }
      }
      .onChange(of: props.isLoading == true) { _, loading in
        if loading { AccessibilityNotification.Announcement(AstryxStrings.spinnerLoading).post() }
      }
      .onChange(of: statusAnnouncement) { _, announcement in
        // A status message that appears or changes is announced: an error at
        // once, others when VoiceOver is free, as core's field status does.
        guard let announcement else { return }
        var words = AttributedString(announcement.message)
        words.accessibilitySpeechAnnouncementPriority = announcement.isError ? .high : .default
        AccessibilityNotification.Announcement(words).post()
      }
    }
  }

  // MARK: Label

  /// The note after the label: "Optional" or "Required".
  /// `isOptional` wins when both are set, as in core.
  var labelNote: String? {
    if props.isOptional == true { return AstryxStrings.fieldOptional }
    if props.isRequired == true { return AstryxStrings.fieldRequired }
    return nil
  }

  /// The status message to announce when it appears or changes.
  struct StatusAnnouncement: Equatable {
    var message: String
    var isError: Bool
  }

  var statusAnnouncement: StatusAnnouncement? {
    guard let status = props.status, let message = status.message else { return nil }
    return StatusAnnouncement(message: message, isError: status.type == .error)
  }

  private var labelRow: some View {
    SwiftUI.HStack(alignment: .firstTextBaseline, spacing: astryx.tokens.space.s1) {
      // The field reads the label and its note, so VoiceOver skips them here.
      Text(props.label, type: .label, color: isDisabled ? .disabled : .secondary, weight: .medium)
        .accessibilityHidden(true)
      if let note = labelNote {
        Text("∙ \(note)", type: .supporting, color: .secondary, weight: .normal)
          .accessibilityHidden(true)
      }
      if let tip = props.labelTooltip {
        tipButton(tip, icon: "info", label: tip, opens: .label)
          .foregroundStyle(astryx.tokens.color.textSecondary)
      }
    }
  }

  // MARK: Field

  /// The field's accessible name: the label and its note, as core's label
  /// element names the input.
  var accessibilityName: String {
    labelNote.map { "\(props.label), \($0)" } ?? props.label
  }

  /// What VoiceOver reads after the name: the description, the status message,
  /// and the disabled reason, in core's `aria-describedby` order.
  /// An error leads, since SwiftUI has no invalid state to expose: its
  /// message, or the error status name when it has none. A read-only field
  /// says so, as core does where a control cannot expose read-only.
  var accessibilityDescription: String {
    var parts: [String] = []
    if let status = props.status, status.type == .error {
      parts.append(status.message ?? AstryxStrings.statusButton(.error))
    }
    if let description = props.description { parts.append(description) }
    if let status = props.status, status.type != .error, let message = status.message { parts.append(message) }
    if isReadOnly { parts.append(AstryxStrings.inputReadOnly) }
    if isDisabled, let reason = props.disabledMessage { parts.append(reason) }
    return parts.joined(separator: ", ")
  }

  /// Edits reach `onChange` only while the field can be edited.
  var text: Binding<String> {
    Binding(
      get: { props.value },
      set: { newValue in
        guard !isDisabled, !isReadOnly else { return }
        props.onChange?(newValue)
      }
    )
  }

  private var fieldRow: some View {
    let shape = RoundedRectangle(cornerRadius: astryx.tokens.radius.element, style: .continuous)
    return SwiftUI.HStack(spacing: astryx.tokens.space.s2) {
      field
        .font(astryx.font(TypeStyle(astryx.tokens.font.body, families: astryx.tokens.font.family.body)))
        .foregroundStyle(astryx.tokens.color.textPrimary)
        .focused($isFocused)
        .onSubmit { props.onEnter?() }
        .disabled(isDisabled)
        .accessibilityLabel(SwiftUI.Text(accessibilityName))
        .accessibilityHint(SwiftUI.Text(accessibilityDescription))
        .astryxIdentifier(props.base.id)
      if showsClear {
        SwiftUI.Button {
          props.onChange?("")
          isFocused = true
        } label: {
          icon("close")
        }
        .buttonStyle(.plain)
        .astryxMinimumHitArea(iconSide)
        .foregroundStyle(astryx.tokens.color.textSecondary)
        .help(AstryxStrings.clearTooltip)
        .accessibilityLabel(SwiftUI.Text(AstryxStrings.clearLabel(props.label)))
      }
      if isDisabled, let reason = props.disabledMessage {
        // A disabled field cannot take focus in SwiftUI, so its reason sits on
        // a button keyboard and VoiceOver users can reach.
        tipButton(reason, icon: "info", label: reason, opens: .disabled)
          .foregroundStyle(astryx.tokens.color.textSecondary)
      }
      if props.isLoading == true {
        ProgressView().controlSize(.small).accessibilityHidden(true)
      }
      statusIcon
    }
    .padding(.horizontal, astryx.tokens.space.s3)
    .frame(minHeight: max(44, height * astryx.textScale))
    .background(
      shape.strokeBorder(borderColor, lineWidth: astryx.tokens.size.borderWidth)
    )
    .opacity(isDisabled ? 0.5 : 1)
    .help(isDisabled ? props.disabledMessage ?? "" : "")
  }

  var showsClear: Bool {
    props.hasClear == true && !props.value.isEmpty && !isDisabled && !isReadOnly
  }

  var height: CGFloat {
    switch props.size ?? .md {
    case .sm: astryx.tokens.size.elementSm
    case .md: astryx.tokens.size.elementMd
    case .lg: astryx.tokens.size.elementLg
    }
  }

  var borderColor: Color {
    let color = astryx.tokens.color
    guard !isDisabled, let status = props.status else { return color.borderEmphasized }
    switch status.type {
    case .error: return color.error
    case .warning: return color.warning
    case .success: return color.success
    }
  }

  @ViewBuilder private var field: some View {
    let prompt = props.placeholder.map {
      SwiftUI.Text($0).foregroundStyle(astryx.tokens.color.textSecondary)
    }
    if isReadOnly {
      readOnlyField
    } else {
      switch props.type ?? .text {
      case .password:
        SecureField("", text: text, prompt: prompt)
          .textContentType(.password)
      case .email:
        TextField("", text: text, prompt: prompt)
          .textContentType(.emailAddress)
          .autocorrectionDisabled()
          #if os(iOS)
          .keyboardType(.emailAddress)
          .textInputAutocapitalization(.never)
          #endif
      case .text:
        TextField("", text: text, prompt: prompt)
      }
    }
  }

  /// What a read-only field shows: the value, masked for a password.
  var readOnlyText: String {
    props.type == .password ? String(repeating: "\u{2022}", count: props.value.count) : props.value
  }

  /// Read-only: the value at full strength, never editable. It keeps a focus
  /// stop and Return still runs `onEnter`, as core's read-only input does; a
  /// password stays masked and cannot be selected or copied.
  @ViewBuilder private var readOnlyField: some View {
    let text = SwiftUI.Text(readOnlyText)
      .frame(maxWidth: .infinity, alignment: .leading)
      .focusable()
      .onKeyPress(.return) {
        props.onEnter?()
        return .handled
      }
      .accessibilityValue(SwiftUI.Text(readOnlyText))
    if props.type == .password {
      text.textSelection(.disabled)
    } else {
      text.textSelection(.enabled)
    }
  }

  // MARK: Status

  /// The status icon in the field: plain when attached, a tip button when the
  /// message shows in a tip, and none when detached (its message has one).
  @ViewBuilder private var statusIcon: some View {
    if let status = props.status, statusVariant != .detached {
      if statusVariant == .tooltip, let message = status.message {
        tipButton(message, icon: status.type.rawValue, label: AstryxStrings.statusButton(status.type), opens: .status)
          .foregroundStyle(statusColor(status.type))
      } else {
        icon(status.type.rawValue)
          .foregroundStyle(statusColor(status.type))
          .accessibilityHidden(true)
      }
    }
  }

  /// The message box below the field, attached to it or detached from it.
  @ViewBuilder private var statusMessage: some View {
    if let status = props.status, let message = status.message, statusVariant != .tooltip {
      let detached = statusVariant == .detached
      let radius = astryx.tokens.radius.element
      SwiftUI.HStack(alignment: .firstTextBaseline, spacing: astryx.tokens.space.s1) {
        if detached {
          icon(status.type.rawValue).accessibilityHidden(true)
        }
        SwiftUI.Text(message)
          .font(astryx.font(TypeStyle(astryx.tokens.font.supporting, families: astryx.tokens.font.family.body)))
      }
      .foregroundStyle(messageColor(status.type))
      .frame(maxWidth: .infinity, alignment: .leading)
      .padding(.horizontal, astryx.tokens.space.s2)
      .padding(.vertical, astryx.tokens.space.s2)
      .background(
        UnevenRoundedRectangle(
          topLeadingRadius: detached ? radius : 0,
          bottomLeadingRadius: radius,
          bottomTrailingRadius: radius,
          topTrailingRadius: detached ? radius : 0,
          style: .continuous
        )
        .fill(messageGround(status.type))
      )
      .padding(.top, detached ? astryx.tokens.space.s1 : 0)
      // VoiceOver reads the message on the field.
      .accessibilityHidden(true)
    }
  }

  func statusColor(_ type: TextInputStatusType) -> Color {
    let color = astryx.tokens.color
    switch type {
    case .error: return color.error
    case .warning: return color.warning
    case .success: return color.success
    }
  }

  func messageColor(_ type: TextInputStatusType) -> Color {
    let color = astryx.tokens.color
    switch type {
    case .error: return color.textRed
    case .warning: return color.textYellow
    case .success: return color.textGreen
    }
  }

  func messageGround(_ type: TextInputStatusType) -> Color {
    let color = astryx.tokens.color
    switch type {
    case .error: return color.errorMuted
    case .warning: return color.warningMuted
    case .success: return color.successMuted
    }
  }

  // MARK: Tips

  /// An icon that shows `text` in a tip: on hover with a pointer, and in a
  /// popover on a tap, as core opens a tip on touch.
  private func tipButton(_ text: String, icon name: String, label: String, opens tip: Tip) -> some View {
    SwiftUI.Button {
      shownTip = tip
    } label: {
      icon(name)
    }
    .buttonStyle(.plain)
    .astryxMinimumHitArea(iconSide)
    .help(text)
    .accessibilityLabel(SwiftUI.Text(label))
    .accessibilityHint(SwiftUI.Text(text))
    .popover(item: tipBinding(tip)) { _ in tipText(text) }
  }

  private func tipBinding(_ tip: Tip) -> Binding<Tip?> {
    Binding(
      get: { shownTip == tip ? tip : nil },
      set: { shownTip = $0 }
    )
  }

  private func tipText(_ text: String) -> some View {
    SwiftUI.Text(text)
      .font(astryx.font(TypeStyle(astryx.tokens.font.supporting, families: astryx.tokens.font.family.body)))
      .padding(astryx.tokens.space.s3)
      .presentationCompactAdaptation(.popover)
  }

  /// A shared icon at the supporting text size: the theme's SF Symbol or app
  /// asset, else the default symbol; a name nothing maps draws nothing.
  var iconSide: CGFloat { astryx.tokens.font.supporting.size * astryx.textScale }

  @ViewBuilder private func icon(_ name: String) -> some View {
    let side = iconSide
    if let image = astryx.icon(name) {
      image.sized(side).font(.system(size: side))
    }
  }
}
