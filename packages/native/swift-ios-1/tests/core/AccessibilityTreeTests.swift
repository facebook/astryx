// Copyright (c) Meta Platforms, Inc. and affiliates.

// These tests read the accessibility tree SwiftUI builds for UIKit, so
// removing a component's accessibility modifier fails them. Only iOS exposes
// that tree to a test without an assistive client attached; on macOS SwiftUI
// builds none, so they run on the iOS Simulator only.

#if os(iOS)
import SwiftUI
import Testing
import UIKit
@testable import AstryxCore

/// One element of the accessibility tree, read through UIKit.
struct AXNode {
  let label: String
  let value: String
  let traits: UIAccessibilityTraits
}

/// Every accessibility element SwiftUI exposes for `view`, hosted in a window.
@MainActor
func accessibilityTree<V: View>(of view: V) -> [AXNode] {
  let host = UIHostingController(rootView: view.astryxTheme())
  let window = UIWindow(frame: CGRect(x: 0, y: 0, width: 390, height: 400))
  window.rootViewController = host
  window.makeKeyAndVisible()
  host.view.setNeedsLayout()
  host.view.layoutIfNeeded()
  RunLoop.main.run(until: Date().addingTimeInterval(0.2))

  var nodes: [AXNode] = []
  var seen = Set<ObjectIdentifier>()
  func visit(_ object: NSObject) {
    guard seen.insert(ObjectIdentifier(object)).inserted else { return }
    if object.isAccessibilityElement {
      nodes.append(
        AXNode(
          label: object.accessibilityLabel ?? "",
          value: object.accessibilityValue ?? "",
          traits: object.accessibilityTraits
        )
      )
    }
    if let elements = object.accessibilityElements {
      for case let element as NSObject in elements { visit(element) }
    } else {
      let count = object.accessibilityElementCount()
      if count != NSNotFound, count > 0 {
        for index in 0..<count {
          if let element = object.accessibilityElement(at: index) as? NSObject { visit(element) }
        }
      }
    }
    if let view = object as? UIView {
      for subview in view.subviews { visit(subview) }
    }
  }
  visit(host.view)
  window.isHidden = true
  return nodes
}

func describe(_ nodes: [AXNode]) -> String {
  nodes.map { "[\($0.label)|\($0.value)|\($0.traits.rawValue)]" }.joined(separator: " ")
}

@MainActor
@Test func aHeadingIsExposedAsAHeader() {
  let nodes = accessibilityTree(of: AstryxHeading("Settings", level: 2))
  let heading = nodes.first { $0.label == "Settings" }
  #expect(heading?.traits.contains(.header) == true, "\(describe(nodes))")
}

@MainActor
@Test func aTextFieldIsNamedByItsLabelInTheTree() {
  let nodes = accessibilityTree(of: AstryxTextInput(label: "Email", value: .constant("")))
  #expect(nodes.contains { $0.label == "Email" }, "\(describe(nodes))")
}

@MainActor
@Test func aLoadingButtonIsAButtonNamedByItsLabelThatSaysLoading() {
  let nodes = accessibilityTree(of: AstryxButton(label: "Save", isLoading: true) {})
  let button = nodes.first { $0.traits.contains(.button) }
  #expect(button?.label == "Save", "\(describe(nodes))")
  #expect(button?.value == AstryxStrings.buttonLoading, "\(describe(nodes))")
}

@MainActor
@Test func aReadyButtonSaysNoValue() {
  let nodes = accessibilityTree(of: AstryxButton(label: "Save") {})
  let button = nodes.first { $0.traits.contains(.button) }
  #expect(button?.label == "Save", "\(describe(nodes))")
  #expect(button?.value.isEmpty == true, "\(describe(nodes))")
}
#endif
