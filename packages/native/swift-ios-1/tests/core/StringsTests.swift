// Copyright (c) Meta Platforms, Inc. and affiliates.

import Foundation
import Testing
@testable import AstryxCore

// The loading message comes from core's locale catalogs, so VoiceOver speaks
// it in the person's language.

@Test func theLoadingMessageIsLocalizedFromCoresCatalog() throws {
  func message(in locale: String) throws -> String {
    let path = try #require(AstryxStrings.resourceBundle.path(forResource: locale, ofType: "lproj"))
    let bundle = try #require(Bundle(path: path))
    return bundle.localizedString(forKey: "@astryx.button.loading", value: nil, table: nil)
  }
  #expect(try message(in: "en") == "Loading")
  #expect(try message(in: "de-DE") == "Wird geladen")
  #expect(try message(in: "ja-JP") != "Loading")
}
