// swift-tools-version: 6.0
// Copyright (c) Meta Platforms, Inc. and affiliates.

// Page templates for swift-ios-1. Templates are clone-only: copy a template's
// folder into an app and own it from then on. This package exists only so the
// templates compile and are tested against AstryxCore; it has no products, and
// `@astryxdesign/native` does not publish it.

import PackageDescription

let package = Package(
  name: "AstryxSwiftIOSTemplates",
  platforms: [.iOS(.v17), .macOS(.v14)],
  dependencies: [.package(path: "..")],
  targets: [
    .target(
      name: "AstryxTemplates",
      dependencies: [.product(name: "AstryxCore", package: "swift-ios-1")],
      path: ".",
      exclude: ["Package.swift", "Tests"]
    ),
    .testTarget(name: "AstryxTemplatesTests", dependencies: ["AstryxTemplates"], path: "Tests"),
  ]
)
