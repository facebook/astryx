// Copyright (c) Meta Platforms, Inc. and affiliates.

/// Draws one node of a wire tree a logic core sends (AST-082 FR19) with the
/// Astryx view for its component; `send` carries its callbacks back to the
/// core. A component with no Swift view yet draws nothing.
public struct AstryxNodeView: View {
  let node: AstryxNode
  let send: @Sendable (AstryxAction) -> Void

  public init(_ node: AstryxNode, send: @escaping @Sendable (AstryxAction) -> Void) {
    self.node = node
    self.send = send
  }

  public var body: some View {
    switch node {
    case .text(let text): Text(text.viewProps(send: send))
    case .heading(let heading): Heading(heading.viewProps(send: send))
    case .card(let card): Card(card.viewProps(send: send), children: card.props.children ?? [], send: send)
    default: EmptyView()
    }
  }
}

/// Wire nodes drawn in order, as a content slot holds them.
public struct AstryxNodeList: View {
  let nodes: [AstryxNode]
  let send: @Sendable (AstryxAction) -> Void

  public var body: some View {
    ForEach(nodes, id: \.key) { node in
      AstryxNodeView(node, send: send)
    }
  }
}
