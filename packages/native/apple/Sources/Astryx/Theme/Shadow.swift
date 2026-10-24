// Copyright (c) Meta Platforms, Inc. and affiliates.

extension View {
  /// Draws a theme shadow around this view's shape, as CSS `box-shadow` does:
  /// drop layers only outside the shape, so a see-through view shows no
  /// shadow beneath it, and inset rings inside its edge.
  func astryxShadow<S: InsettableShape>(_ layers: [ShadowLayer], in shape: S) -> some View {
    background {
      ZStack {
        ForEach(Array(layers.enumerated()), id: \.offset) { _, layer in
          if !layer.isInset {
            // A CSS blur is twice SwiftUI's shadow radius.
            shape.fill(.black)
              .shadow(color: layer.color, radius: layer.blur / 2, x: layer.x, y: layer.y)
          }
        }
      }
      .mask {
        // Everything but the shape itself.
        Rectangle()
          .padding(-Self.shadowReach(layers))
          .overlay(shape.fill(.black).blendMode(.destinationOut))
          .compositingGroup()
      }
    }
    .overlay {
      ForEach(Array(layers.enumerated()), id: \.offset) { _, layer in
        if layer.isInset {
          shape.strokeBorder(layer.color, lineWidth: layer.spread)
        }
      }
    }
  }

  /// How far past the shape the layers can draw.
  fileprivate static func shadowReach(_ layers: [ShadowLayer]) -> CGFloat {
    layers.map { $0.blur + max(abs($0.x), abs($0.y)) }.max().map { $0 + 4 } ?? 0
  }
}
