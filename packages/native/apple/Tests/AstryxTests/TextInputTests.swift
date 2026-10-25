// Copyright (c) Meta Platforms, Inc. and affiliates.

import SwiftUI
import Testing
@testable import Astryx

// Swift component API spec, A2 and A3: TextInput takes core's TextInput props.

@MainActor
@Test func aTextFieldIsAtLeast44PointsTallAtEveryTextSize() {
  let field = Astryx.TextInput(label: "Email", value: "", size: .sm).frame(width: 240)
  for typeSize in [DynamicTypeSize.xSmall, .large, .accessibility5] {
    let pixels = Pixels(field, typeSize: typeSize)
    // The label sits above a field at least 44 tall.
    #expect(pixels.height >= 44 + 12)
  }
}

@MainActor
@Test func aFieldLabelUsesTheSecondaryTextColor() {
  var theme = Theme.default
  theme.light.color.textSecondary = Color(.sRGB, red: 1, green: 0, blue: 0, opacity: 1)
  let pixels = Pixels(Astryx.TextInput(label: "Email", value: "").frame(width: 240), theme: theme)
  #expect(pixels.contains { $0[0] > 200 && $0[1] < 60 && $0[2] < 60 && $0[3] > 200 })
}

@MainActor
@Test func textInputInitializersBuildTheSameProps() {
  let labeled = Astryx.TextInput(label: "Email", value: "a@b.c", type: .email, size: .lg, isRequired: true, hasClear: true)
  let fromProps = Astryx.TextInput(
    TextInputProps(type: .email, label: "Email", value: "a@b.c", size: .lg, isRequired: true, hasClear: true))
  #expect(labeled.props.label == fromProps.props.label)
  #expect(labeled.props.value == fromProps.props.value)
  #expect(labeled.props.type == fromProps.props.type)
  #expect(labeled.props.size == fromProps.props.size)
  #expect(labeled.props.isRequired == fromProps.props.isRequired)
  #expect(labeled.props.hasClear == fromProps.props.hasClear)
}

@MainActor
@Test func theFieldIsNamedByItsLabelAndItsNote() {
  #expect(Astryx.TextInput(label: "Email", value: "").accessibilityName == "Email")
  #expect(Astryx.TextInput(label: "Email", value: "", isRequired: true).accessibilityName == "Email, Required")
  #expect(Astryx.TextInput(label: "Email", value: "", isOptional: true).accessibilityName == "Email, Optional")
  // A hidden label still names the field.
  #expect(Astryx.TextInput(label: "Search", value: "", isLabelHidden: true).accessibilityName == "Search")
}

@MainActor
@Test func theFieldReadsItsDescriptionStatusAndDisabledReason() {
  let field = Astryx.TextInput(
    label: "Email",
    value: "",
    description: "Work address",
    isDisabled: true,
    disabledMessage: "Managed by your admin",
    status: TextInputStatus(type: .error, message: "Not valid")
  )
  // The error is in the label; the description and the disabled reason
  // follow as the description.
  #expect(field.accessibilityLabelText == "Email, Not valid")
  #expect(field.accessibilityDescription == "Work address, Managed by your admin")
  // The reason is read only while the field is disabled.
  let enabled = Astryx.TextInput(label: "Email", value: "", disabledMessage: "Managed by your admin")
  #expect(enabled.accessibilityDescription == "")
}

@MainActor
@Test func editsReachOnChangeOnlyWhileTheFieldCanBeEdited() {
  final class Edits: @unchecked Sendable { var values: [String] = [] }
  let edits = Edits()
  Astryx.TextInput(label: "Name", value: "", onChange: { edits.values.append($0) }).text.wrappedValue = "A"
  Astryx.TextInput(label: "Name", value: "", onChange: { edits.values.append($0) }, isDisabled: true).text.wrappedValue = "B"
  Astryx.TextInput(label: "Name", value: "", onChange: { edits.values.append($0) }, isReadOnly: true).text.wrappedValue = "C"
  #expect(edits.values == ["A"])
}

@MainActor
@Test func disabledWinsOverReadOnlyAndBothHideTheClearButton() {
  let both = Astryx.TextInput(label: "Name", value: "x", isDisabled: true, isReadOnly: true, hasClear: true)
  #expect(both.isDisabled)
  #expect(both.isReadOnly == false)
  #expect(both.showsClear == false)
  #expect(Astryx.TextInput(label: "Name", value: "x", hasClear: true).showsClear)
  #expect(Astryx.TextInput(label: "Name", value: "", hasClear: true).showsClear == false)
  #expect(Astryx.TextInput(label: "Name", value: "x", isReadOnly: true, hasClear: true).showsClear == false)
}

@MainActor
@Test func theClearButtonNamesItsField() {
  #expect(AstryxStrings.clearLabel("Email") == "Clear Email")
  #expect(AstryxStrings.statusButton(.error) == "Error details")
}

@MainActor
@Test func aStatusColorsTheBorderUnlessTheFieldIsDisabled() {
  let error = Astryx.TextInput(label: "Email", value: "", status: TextInputStatus(type: .error))
  let pixels = Pixels(error.frame(width: 240), scheme: .light)
  let red = rgba(Theme.default.light.color.error)
  #expect(pixels.contains { close($0, red) })
}

@MainActor
@Test func anAttachedMessageDrawsOnTheStatusGround() {
  let field = Astryx.TextInput(
    label: "Email", value: "", status: TextInputStatus(type: .warning, message: "Check the domain"))
  let pixels = Pixels(field.frame(width: 240))
  // The muted ground is translucent, and Pixels reads premultiplied RGBA, so
  // compare against the premultiplied color.
  let ground = rgba(Theme.default.light.color.warningMuted)
  let alpha = ground[3]
  let premultiplied = ground.prefix(3).map { $0 * alpha / 255 } + [alpha]
  #expect(alpha < 255)
  #expect(pixels.contains { close($0, premultiplied, within: 3) })
}

// Read-only, status, and label rules from core's field.

@MainActor
@Test func aReadOnlyPasswordStaysMasked() {
  let field = Astryx.TextInput(label: "Password", value: "hunter2", type: .password, isReadOnly: true)
  #expect(field.readOnlyText == String(repeating: "\u{2022}", count: 7))
  #expect(!field.readOnlyText.contains("hunter2"))
  let plain = Astryx.TextInput(label: "Email", value: "a@b.co", isReadOnly: true)
  #expect(plain.readOnlyText == "a@b.co")
  #expect(plain.accessibilityDescription.contains(AstryxStrings.inputReadOnly))
}

@MainActor
@Test func optionalWinsOverRequired() {
  let field = Astryx.TextInput(label: "Name", value: "", isOptional: true, isRequired: true)
  #expect(field.labelNote == AstryxStrings.fieldOptional)
}

@MainActor
@Test func anErrorIsInTheLabelVoiceOverReads() {
  let withMessage = Astryx.TextInput(
    label: "Email", value: "", description: "Work address",
    status: TextInputStatus(type: .error, message: "Enter a valid email"))
  // The error is in the label, which VoiceOver reads with Speak Hints off.
  #expect(withMessage.accessibilityLabelText == "Email, Enter a valid email")
  #expect(withMessage.accessibilityDescription == "Work address")
  let bare = Astryx.TextInput(label: "Email", value: "", status: TextInputStatus(type: .error))
  #expect(bare.accessibilityLabelText == "Email, \(AstryxStrings.statusButton(.error))")
  let warning = Astryx.TextInput(
    label: "Email", value: "", description: "Work address",
    status: TextInputStatus(type: .warning, message: "Check the domain"))
  #expect(warning.accessibilityDescription == "Work address, Check the domain")
  #expect(warning.accessibilityLabelText == "Email")
}

@MainActor
@Test func aStatusMessageIsAnnouncedWithItsUrgency() {
  let error = Astryx.TextInput(label: "Email", value: "", status: TextInputStatus(type: .error, message: "Required"))
  #expect(error.statusAnnouncement == .init(message: "Required", type: .error))
  #expect(error.statusAnnouncement?.isError == true)
  let success = Astryx.TextInput(label: "Email", value: "", status: TextInputStatus(type: .success, message: "Looks good"))
  #expect(success.statusAnnouncement == .init(message: "Looks good", type: .success))
  // The same words with another type are a change to announce.
  #expect(success.statusAnnouncement != .init(message: "Looks good", type: .warning))
  #expect(Astryx.TextInput(label: "Email", value: "").statusAnnouncement == nil)
}

@MainActor
@Test func aHiddenLabelHidesTheDescription() {
  let hidden = Astryx.TextInput(label: "Search", value: "", isLabelHidden: true, description: "By name or email")
  let bare = Astryx.TextInput(label: "Search", value: "", isLabelHidden: true)
  #expect(Pixels(hidden.frame(width: 240)).height == Pixels(bare.frame(width: 240)).height)
}

@MainActor
@Test func smallControlsAnswerTapsAcross44PointsWithoutGrowing() {
  #expect(astryxHitInset(20) == 12)
  #expect(astryxHitInset(50) == 0)
  let dot = Color.black.frame(width: 20, height: 20)
  #expect(Pixels(dot.astryxMinimumHitArea(20)).width == Pixels(dot).width)
}

@MainActor
@Test func everyDisabledFieldKeepsItsFocusStop() {
  let withReason = Astryx.TextInput(label: "Plan", value: "Team", isDisabled: true, disabledMessage: "Managed by your admin")
  #expect(withReason.keepsFocusWhileDisabled)
  let bare = Astryx.TextInput(label: "Plan", value: "Team", isDisabled: true)
  #expect(bare.keepsFocusWhileDisabled)
  #expect(!Astryx.TextInput(label: "Plan", value: "Team").keepsFocusWhileDisabled)
}

@MainActor
@Test func anEmptyReadOnlyFieldShowsItsPlaceholder() {
  #expect(Astryx.TextInput(label: "Notes", value: "", isReadOnly: true, placeholder: "None").showsReadOnlyPlaceholder)
  #expect(!Astryx.TextInput(label: "Notes", value: "Hi", isReadOnly: true, placeholder: "None").showsReadOnlyPlaceholder)
}

@MainActor
@Test func trailingButtonsTakeTheirTargetsInPlaceOfThePadding() {
  let clearAndTip = Astryx.TextInput(
    label: "Email", value: "you@", status: TextInputStatus(type: .error, message: "Enter a full address"),
    statusVariant: .tooltip, hasClear: true)
  #expect(clearAndTip.hasTrailingButtons)
  #expect(!Astryx.TextInput(label: "Email", value: "").hasTrailingButtons)
}

@MainActor
@Test func isHiddenHidesTheControlAndKeepsTheLabel() {
  let hidden = Astryx.TextInput(label: "Email", value: "", base: AstryxBaseProps(isHidden: true))
  #expect(hidden.hidesControl)
  // The label still draws, so the field is not empty.
  #expect(Pixels(hidden.frame(width: 240)).height > 0)
  #expect(!Astryx.TextInput(label: "Email", value: "").hidesControl)
}
