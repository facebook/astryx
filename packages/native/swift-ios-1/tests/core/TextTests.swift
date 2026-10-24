// Copyright (c) Meta Platforms, Inc. and affiliates.

import Testing
@testable import AstryxCore

@Test func textColorDefaultsByTypeAsCoreDoes() {
  #expect(AstryxTextType.supporting.defaultColor == .secondary)
  for type in [AstryxTextType.body, .large, .label] {
    #expect(type.defaultColor == .primary)
  }
}

@Test func extraSmallIsSpelledAsCoreSpellsIt() {
  #expect(AstryxTextSize(rawValue: "xsm") == .xsm)
  #expect(AstryxTextSize.xsm.token == "font-size-xs")
  #expect(AstryxTextSize.sm.token == "font-size-sm")
}
