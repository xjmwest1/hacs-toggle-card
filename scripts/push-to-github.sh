#!/usr/bin/env bash
# Create the GitHub repo and push. Requires GH_TOKEN with repo scope.
set -euo pipefail

REPO_NAME="hacs-toggle-card"
GITHUB_USER="${GITHUB_USER:-$(gh api user -q .login 2>/dev/null || true)}"

if [[ -z "${GH_TOKEN:-}" ]]; then
  echo "Error: set GH_TOKEN to a GitHub personal access token with repo scope." >&2
  exit 1
fi

export GH_TOKEN

if [[ -z "$GITHUB_USER" ]]; then
  GITHUB_USER="$(curl -s -H "Authorization: Bearer $GH_TOKEN" https://api.github.com/user | jq -r .login)"
fi

cd "$(dirname "$0")/.."

if ! git remote get-url origin &>/dev/null; then
  git remote add origin "https://github.com/${GITHUB_USER}/${REPO_NAME}.git"
fi

if ! gh repo view "${GITHUB_USER}/${REPO_NAME}" &>/dev/null; then
  gh repo create "$REPO_NAME" --public \
    --description "Home Assistant Lovelace toggle row card (HACS)" \
    --source=. \
    --remote=origin
fi

git push -u origin main
echo "Pushed to https://github.com/${GITHUB_USER}/${REPO_NAME}"