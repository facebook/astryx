// Copyright (c) Meta Platforms, Inc. and affiliates.
// Throwaway probe: can a hostless iOS test read SwiftUI's accessibility tree?

#if os(iOS)
import SwiftUI
import Testing
import UIKit
@testable import AstryxCore

@MainActor
func hosted<V: View>(_ view: V) -> (UIWindow, UIHostingController<AnyView>) {
  let controller = UIHostingController(rootView: AnyView(view.astryxTheme()))
  controller.safeAreaRegions = []
  let bounds = CGRect(x: 0, y: 0, width: 360, height: 200)
  let window = UIWindow(frame: bounds)
  window.rootViewController = controller
  window.isHidden = false
  controller.view.frame = bounds
  controller.view.setNeedsLayout()
  controller.view.layoutIfNeeded()
  return (window, controller)
}

@MainActor
@Test(.timeLimit(.minutes(1))) func probe1HostOnly() {
  print("AXPROBE 1 start")
  let (window, controller) = hosted(AstryxButton(label: "Save", isLoading: true) {})
  print("AXPROBE 1 hosted subviews=\(controller.view.subviews.count)")
  window.isHidden = true
}

@MainActor
@Test(.timeLimit(.minutes(1))) func probe2IsAccessibilityElement() {
  let (window, controller) = hosted(AstryxButton(label: "Save", isLoading: true) {})
  print("AXPROBE 2 isElement=\(controller.view.isAccessibilityElement)")
  window.isHidden = true
}

@MainActor
@Test(.timeLimit(.minutes(1))) func probe3ElementCount() {
  let (window, controller) = hosted(AstryxButton(label: "Save", isLoading: true) {})
  print("AXPROBE 3 before count")
  let count = controller.view.accessibilityElementCount()
  print("AXPROBE 3 count=\(count)")
  window.isHidden = true
}

@MainActor
@Test(.timeLimit(.minutes(1))) func probe4Elements() {
  let (window, controller) = hosted(AstryxButton(label: "Save", isLoading: true) {})
  print("AXPROBE 4 before elements")
  let elements = controller.view.accessibilityElements ?? []
  print("AXPROBE 4 elements=\(elements.count)")
  for case let e as NSObject in elements {
    print("AXPROBE 4   label=\(e.accessibilityLabel ?? "-") value=\(e.accessibilityValue ?? "-") traits=\(e.accessibilityTraits.rawValue)")
  }
  window.isHidden = true
}

@MainActor
@Test(.timeLimit(.minutes(1))) func probe5Walk() {
  let (window, controller) = hosted(VStack { AstryxHeading("Settings"); AstryxTextInput(label: "Email", value: .constant("")); AstryxButton(label: "Save", isLoading: true) {} })
  func visit(_ o: NSObject, _ depth: Int) {
    if depth > 12 { return }
    print("AXPROBE 5 " + String(repeating: " ", count: depth) + "\(type(of: o)) el=\(o.isAccessibilityElement) label=\(o.accessibilityLabel ?? "-") value=\(o.accessibilityValue ?? "-") traits=\(o.accessibilityTraits.rawValue)")
    let n = o.accessibilityElementCount()
    if n != NSNotFound && n > 0 {
      for i in 0..<n { if let c = o.accessibilityElement(at: i) as? NSObject { visit(c, depth + 1) } }
    }
    if let v = o as? UIView { for s in v.subviews { visit(s, depth + 1) } }
  }
  visit(controller.view, 0)
  window.isHidden = true
}
#endif
