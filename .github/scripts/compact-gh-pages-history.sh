#!/usr/bin/env bash
# Copyright (c) Meta Platforms, Inc. and affiliates.

set -euo pipefail

node .github/scripts/gh-pages-publisher.mjs compact
