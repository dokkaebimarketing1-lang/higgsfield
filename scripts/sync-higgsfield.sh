#!/usr/bin/env bash
set -euo pipefail

: "${HIGGSFIELD_WEBSITE_ID:?HIGGSFIELD_WEBSITE_ID is required}"
: "${GITHUB_WORKSPACE:?GITHUB_WORKSPACE is required}"
: "${GITHUB_SHA:?GITHUB_SHA is required}"

if [[ ! -d "$GITHUB_WORKSPACE/.git" ]]; then
  echo "GITHUB_WORKSPACE is not a Git checkout." >&2
  exit 1
fi

source_sha="$(git -C "$GITHUB_WORKSPACE" rev-parse HEAD)"
if [[ "$source_sha" != "$GITHUB_SHA" ]]; then
  echo "Checked-out source does not match GITHUB_SHA." >&2
  exit 1
fi

access_json="$(higgsfield website repo-access "$HIGGSFIELD_WEBSITE_ID" --json --no-color)"
repo_url="$(jq -er '.repo_url' <<<"$access_json")"
repo_branch="$(jq -er '.branch' <<<"$access_json")"
repo_token="$(jq -er '.token' <<<"$access_json")"

if [[ "${GITHUB_ACTIONS:-}" == "true" ]]; then
  echo "::add-mask::$repo_token"
fi

sync_root="$(mktemp -d "${RUNNER_TEMP:-${TMPDIR:-/tmp}}/higgsfield-sync.XXXXXX")"
trap 'rm -rf -- "$sync_root"' EXIT
platform_repo="$sync_root/platform"
auth_header="Authorization: token $repo_token"

git -c "http.extraHeader=$auth_header" clone \
  --branch "$repo_branch" --single-branch "$repo_url" "$platform_repo"
git -C "$platform_repo" config user.name "GitHub Actions"
git -C "$platform_repo" config user.email "actions@github.com"

git -C "$platform_repo" fetch --no-tags "$GITHUB_WORKSPACE" \
  "$source_sha:refs/remotes/github/source"

source_tree="$(git -C "$platform_repo" rev-parse 'refs/remotes/github/source^{tree}')"
platform_tree="$(git -C "$platform_repo" rev-parse 'HEAD^{tree}')"
recorded_source="$(git -C "$platform_repo" log -1 --format='%(trailers:key=GitHub-Source,valueonly)' | tr -d '[:space:]')"

if [[ "$source_tree" != "$platform_tree" ]]; then
  git -C "$platform_repo" read-tree --reset -u refs/remotes/github/source
  git -C "$platform_repo" commit \
    -m "deploy: sync GitHub ${source_sha:0:12}" \
    -m "GitHub-Source: $source_sha"
elif [[ "$recorded_source" != "$source_sha" ]]; then
  git -C "$platform_repo" commit --allow-empty \
    -m "deploy: record GitHub ${source_sha:0:12}" \
    -m "GitHub-Source: $source_sha"
else
  echo "Higgsfield mirror already records GitHub source $source_sha."
fi

platform_commit="$(git -C "$platform_repo" rev-parse HEAD)"
git -C "$platform_repo" -c "http.extraHeader=$auth_header" push origin \
  "HEAD:$repo_branch"

if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  echo "platform_commit=$platform_commit" >>"$GITHUB_OUTPUT"
fi
echo "Higgsfield mirror synchronized from GitHub ${source_sha:0:12}."
