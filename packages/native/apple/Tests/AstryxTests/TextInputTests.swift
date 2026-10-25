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
  #expect(field.accessibilityDescription == "Work address, Not valid, Managed by your admin")
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
  let ground = rgba(Theme.default.light.color.warningMuted)
  #expect(pixels.contains { close($0, ground) })
}
