// Copyright (c) Meta Platforms, Inc. and affiliates.

import Foundation
import Testing
@testable import AstryxNative

private let tree = """
{"component": "VStack", "key": "root", "props": {"gap": 2, "children": [
  {"component": "Heading", "key": "title", "props": {"level": 2, "children": "Settings"}},
  {"component": "Switch", "key": "wifi", "props": {"label": "Wi-Fi", "value": true}, "events": ["onChange"]},
  {"component": "Button", "key": "save", "base": {"id": "save"}, "props": {"label": "Save", "variant": "primary"}},
  {"component": "Chart", "key": "later", "props": {}}
]}}
"""

private final class Sent: @unchecked Sendable {
  var actions: [AstryxAction] = []
}

@Test func decodesATreeByComponentName() throws {
  let node = try JSONDecoder().decode(AstryxNode.self, from: Data(tree.utf8))
  guard case .vStack(let stack) = node else { Issue.record("not a VStack"); return }
  #expect(stack.props.gap == .v2)
  let children = stack.props.children ?? []
  #expect(children.map(\.key) == ["title", "wifi", "save", "later"])
  guard case .heading(let heading) = children[0] else { Issue.record("not a Heading"); return }
  #expect(heading.props.level == .v2)
  #expect(heading.props.children == "Settings")
  #expect(children[3] == .unsupported(component: "Chart", key: "later"))
}

@Test func callbacksTheCoreListensToSendActions() throws {
  let node = try JSONDecoder().decode(AstryxNode.self, from: Data(tree.utf8))
  guard case .vStack(let stack) = node,
        case .switch(let wifi) = stack.props.children?[1],
        case .button(let save) = stack.props.children?[2] else {
    Issue.record("unexpected tree")
    return
  }
  let sent = Sent()
  let switchProps = wifi.viewProps { sent.actions.append($0) }
  switchProps.onChange?(false)
  #expect(sent.actions == [AstryxAction(key: "wifi", component: "Switch", event: "onChange", args: [.bool(false)])])
  #expect(sent.actions[0].json == #"{"args":[false],"component":"Switch","event":"onChange","key":"wifi"}"#)

  // The core did not listen to the button's press, so the view gets no callback.
  let buttonProps = save.viewProps { sent.actions.append($0) }
  #expect(buttonProps.onClick == nil)
  #expect(buttonProps.base.id == "save")
}
