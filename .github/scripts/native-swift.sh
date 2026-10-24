#!/usr/bin/env bash
# Copyright (c) Meta Platforms, Inc. and affiliates.
#
# Build and test every Swift package of @astryxdesign/native.
#
#   native-swift.sh
#
# Run from the repository root on macOS with Xcode. One package per directory
# that holds a Package.swift, such as apple/ (generated contracts) and each
# versioned swift-ios-<n>/. A package that supports macOS builds and tests
# there; every package builds for the iOS Simulator, and an iOS-only package
# runs its tests there. A package without a test target only builds.
#
# The steps live in this file, not inline in ci.yml, so a change to them is in
# the native Swift scope and runs on its own pull request.
set -euo pipefail

work="${RUNNER_TEMP:-$(mktemp -d)}"
xcodebuild -version
packages=$(find packages/native -name Package.swift -not -path '*/.build/*' -not -path '*/node_modules/*' -exec dirname {} \; | sort)
if [ -z "$packages" ]; then
  echo 'No Swift package found under packages/native.'
  exit 1
fi
for package in $packages; do
  echo "::group::$package"
  (
    cd "$package"
    swift package dump-package > "$work/package.json"
    read -r macos tests < <(python3 -c 'import json,sys; d=json.load(open(sys.argv[1])); print(any(p["platformName"]=="macos" for p in d.get("platforms",[])) or not d.get("platforms"), any(t["type"]=="test" for t in d["targets"]))' "$work/package.json")
    # Xcode names the whole-package scheme <name>-Package when a package has
    # several products, and after its product otherwise.
    xcodebuild -list -json > "$work/schemes.json"
    scheme=$(python3 -c 'import json,sys; s=json.load(open(sys.argv[1]))["workspace"]["schemes"]; print(next((x for x in s if x.endswith("-Package")), s[0]))' "$work/schemes.json")
    if [ "$macos" = True ] && [ "$tests" = True ]; then
      swift test
    elif [ "$macos" = True ]; then
      swift build
    fi
    if [ "$macos" != True ] && [ "$tests" = True ]; then
      xcodebuild test -scheme "$scheme" -destination 'platform=iOS Simulator,name=iPhone 16' -quiet
    else
      xcodebuild build -scheme "$scheme" -destination 'generic/platform=iOS Simulator' -quiet
    fi
  )
  echo '::endgroup::'
done
