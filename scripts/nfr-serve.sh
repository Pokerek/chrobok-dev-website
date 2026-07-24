#!/usr/bin/env bash
# scripts/nfr-serve.sh — build once, serve the static output for NFR inspection.
# Used by docs/nfr-inspection.md for the no-JS and cross-engine checks, which need
# the built dist/ rather than the dev server. Serves on http://localhost:4321.
set -euo pipefail

yarn build
yarn preview
