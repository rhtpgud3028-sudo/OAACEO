#!/bin/bash
set -euo pipefail

# Only run in remote (Claude Code on the web) environments
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

echo "Session start hook running..."

# No dependency manifests found in this repository.
# Add dependency installation commands here as the project grows.
# Examples:
#   npm install          (Node.js / package.json)
#   pip install -e .    (Python / pyproject.toml or setup.py)
#   bundle install       (Ruby / Gemfile)
#   cargo build          (Rust / Cargo.toml)

echo "Session start hook completed."
