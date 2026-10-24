// swift-tools-version: 6.0
// Copyright (c) Meta Platforms, Inc. and affiliates.

// Astryx drawn in SwiftUI for iOS, generation 1 (AST-082, arm A). `core/`
// holds components, the one product an app depends on. Page templates are a
// separate package in `templates/`, because they are clone-only source and
// are never published. The macOS platform is declared only so `swift build` and `swift test` run on a
// Mac without a simulator; iOS is the target.

import PackageDescription

let package = Package(
  name: "AstryxSwiftIOS",
  platforms: [.iOS(.v17), .macOS(.v14)],
  products: [
    .library(name: "AstryxCore", targets: ["AstryxCore"]),
  ],
  targets: [
    .target(name: "AstryxCore", path: "core"),
    .testTarget(name: "AstryxCoreTests", dependencies: ["AstryxCore"], path: "tests/core"),
  ]
)
