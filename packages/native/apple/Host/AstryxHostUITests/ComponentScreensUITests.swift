// Copyright (c) Meta Platforms, Inc. and affiliates.

import XCTest

/// UI tests against the host app on the iOS Simulator: what VoiceOver and the
/// system's accessibility audit see in a running app, which a unit test
/// cannot measure (AST-093 FR5).
@MainActor
final class ComponentScreensUITests: XCTestCase {
  /// Every component screen the host app offers, in its order.
  static let screens = ["Banner", "Button", "Card", "Heading", "Icon", "Text", "TextInput"]

  override func setUp() {
    continueAfterFailure = true
  }

  private func launch(_ screen: String) -> XCUIApplication {
    let app = XCUIApplication()
    app.launchArguments = ["-component", screen]
    app.launch()
    XCTAssertTrue(
      app.descendants(matching: .any)["screen.\(screen)"].waitForExistence(timeout: 10),
      "\(screen) screen did not appear"
    )
    return app
  }

  private func attachScreenshot(_ app: XCUIApplication, named name: String) {
    let shot = XCTAttachment(screenshot: app.screenshot())
    shot.name = name
    shot.lifetime = .keepAlways
    add(shot)
  }

  /// The host app lists exactly the screens these tests audit, so a new
  /// component screen cannot skip the audit.
  func testEveryScreenIsAudited() {
    let app = XCUIApplication()
    app.launch()
    for screen in Self.screens {
      XCTAssertTrue(app.buttons[screen].waitForExistence(timeout: 10), "\(screen) is missing from the host app")
    }
    XCTAssertEqual(app.cells.count, Self.screens.count, "the host app has a screen these tests do not audit")
  }

  /// The system accessibility audit (contrast, element detection, hit
  /// regions, Dynamic Type, traits, clipped text) on every screen. Each issue
  /// fails the test with the element and the audit's own words.
  func testEveryScreenPassesTheAccessibilityAudit() throws {
    for screen in Self.screens {
      let app = launch(screen)
      attachScreenshot(app, named: screen)
      try app.performAccessibilityAudit { issue in
        let element = issue.element.map { "\($0.elementType) '\($0.label)'" } ?? "screen"
        XCTFail("\(screen): \(element): \(issue.compactDescription). \(issue.detailedDescription)")
        return true
      }
      app.terminate()
    }
  }

  /// What VoiceOver reads for Button: its label, the button role, Loading as
  /// the value while loading, and dimmed when disabled; a loading button
  /// stays focusable but its tap does nothing.
  func testButtonAccessibilityTree() {
    let app = launch("Button")
    let taps = app.staticTexts["button.taps"]

    let save = app.buttons["Save"]
    XCTAssertTrue(save.exists)
    XCTAssertEqual(save.elementType, .button)
    XCTAssertTrue(save.isEnabled)
    XCTAssertEqual(save.value as? String ?? "", "")

    let search = app.buttons["Search"]
    XCTAssertTrue(search.exists, "an icon button keeps its label as its name")

    let sending = app.buttons["Sending"]
    XCTAssertTrue(sending.exists)
    XCTAssertTrue(sending.isEnabled, "a loading button stays focusable")
    XCTAssertEqual(sending.value as? String, "Loading")

    let delete = app.buttons["Delete"]
    XCTAssertTrue(delete.exists)
    XCTAssertFalse(delete.isEnabled)

    save.tap()
    XCTAssertEqual(taps.label, "Taps: 1")
    sending.tap()
    XCTAssertEqual(taps.label, "Taps: 1", "a loading button ignores taps")
    attachScreenshot(app, named: "Button after taps")
  }
}
