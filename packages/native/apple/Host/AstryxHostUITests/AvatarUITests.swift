// Copyright (c) Meta Platforms, Inc. and affiliates.

import UIKit
import XCTest

/// Avatar in the running host app: what VoiceOver reads and the tooltip a
/// tap opens.
@MainActor
final class AvatarUITests: XCTestCase {
  override func setUp() {
    continueAfterFailure = false
  }

  private func launch() -> XCUIApplication {
    let app = XCUIApplication()
    app.launchArguments = ["-component", "Avatar"]
    app.launch()
    XCTAssertTrue(app.descendants(matching: .any)["screen.Avatar"].waitForExistence(timeout: 10))
    return app
  }

  private func attach(_ screenshot: XCUIScreenshot, named name: String) {
    let shot = XCTAttachment(screenshot: screenshot)
    shot.name = name
    shot.lifetime = .keepAlways
    add(shot)
  }

  /// What VoiceOver reads: a named static avatar is an image named by its
  /// name; given tooltip words do not replace the name; an avatar with
  /// onClick is a button and one with href a link, each named; an unnamed
  /// avatar is not read at all.
  func testAvatarAccessibilityTree() {
    continueAfterFailure = true
    let app = launch()
    let tree = XCTAttachment(string: app.debugDescription)
    tree.name = "Avatar accessibility tree"
    tree.lifetime = .keepAlways
    add(tree)

    let ada = app.images["Ada Lovelace"]
    XCTAssertTrue(ada.exists, "a named static avatar is an image named by its name")
    XCTAssertTrue(app.images["Alan Turing"].exists, "tooltip words do not replace the name")

    let grace = app.buttons["Grace Hopper"]
    XCTAssertTrue(grace.exists, "an avatar with onClick is a button")
    XCTAssertTrue(app.links["Linus Torvalds"].exists, "an avatar with href is a link")

    XCTAssertEqual(app.images.count, 2, "only the two named static avatars are images; the unnamed one is not read")

    grace.tap()
    XCTAssertEqual(app.staticTexts["avatar.taps"].label, "Avatar taps: 1")
  }

  /// A tap on a static avatar opens its tooltip above it, and a tap
  /// elsewhere closes it. The bubble is hidden from VoiceOver (the name is
  /// already its label), so the test reads pixels around the avatar.
  func testATapOpensTheAvatarTooltip() {
    let app = launch()
    let ada = app.images["Ada Lovelace"]
    XCTAssertTrue(ada.waitForExistence(timeout: 5))
    let around = Self.band(around: ada.frame)
    let closed = app.screenshot()

    ada.tap()
    sleep(1)
    let open = app.screenshot()
    attach(open, named: "Avatar tooltip after a tap")
    let frames = XCTAttachment(
      string: "avatar frame \(ada.frame)\nwindow frame \(app.windows.firstMatch.frame)\nscreen scale \(open.image.scale)")
    frames.name = "Avatar tooltip frames"
    frames.lifetime = .keepAlways
    add(frames)
    XCTAssertGreaterThan(
      Self.changedFraction(closed.image, open.image, in: around), 0.02,
      "no tooltip appeared around the avatar after a tap")

    app.staticTexts["avatar.taps"].tap()
    sleep(1)
    XCTAssertLessThan(
      Self.changedFraction(closed.image, app.screenshot().image, in: around), 0.005,
      "the tooltip stayed open after a tap elsewhere")
  }

  /// The area the tooltip opens in: around the avatar, with room on every
  /// side for a bubble wider than the avatar.
  static func band(around frame: CGRect) -> CGRect {
    CGRect(x: max(0, frame.minX - 120), y: frame.minY - 60, width: frame.width + 240, height: frame.height + 120)
  }

  /// The fraction of pixels inside `rect` (in points) that differ between
  /// two screenshots.
  static func changedFraction(_ a: UIImage, _ b: UIImage, in rect: CGRect) -> Double {
    guard let pa = pixels(a), let pb = pixels(b), pa.width == pb.width, pa.height == pb.height else { return 1 }
    let scale = a.scale
    let x0 = max(0, Int(rect.minX * scale)), x1 = min(pa.width, Int(rect.maxX * scale))
    let y0 = max(0, Int(rect.minY * scale)), y1 = min(pa.height, Int(rect.maxY * scale))
    guard x1 > x0, y1 > y0 else { return 0 }
    var changed = 0
    for y in y0..<y1 {
      for x in x0..<x1 {
        let i = (y * pa.width + x) * 4
        let d = abs(Int(pa.data[i]) - Int(pb.data[i])) + abs(Int(pa.data[i + 1]) - Int(pb.data[i + 1]))
          + abs(Int(pa.data[i + 2]) - Int(pb.data[i + 2]))
        if d > 24 { changed += 1 }
      }
    }
    return Double(changed) / Double((x1 - x0) * (y1 - y0))
  }

  private static func pixels(_ image: UIImage) -> (data: [UInt8], width: Int, height: Int)? {
    guard let cg = image.cgImage else { return nil }
    let width = cg.width, height = cg.height
    var data = [UInt8](repeating: 0, count: width * height * 4)
    guard
      let context = CGContext(
        data: &data, width: width, height: height, bitsPerComponent: 8, bytesPerRow: width * 4,
        space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)
    else { return nil }
    context.draw(cg, in: CGRect(x: 0, y: 0, width: width, height: height))
    return (data, width, height)
  }
}
