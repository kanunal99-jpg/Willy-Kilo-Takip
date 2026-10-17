#!/usr/bin/env bash
set -euo pipefail

# Invoked after apksigner verified the release APK in Android CI.
release_dir="${1:-release-assets}"
cd "$release_dir"

test -s WillyKiloTakip.apk || { echo 'Missing latest APK' >&2; exit 1; }
shopt -s nullglob
versioned=(WillyKiloTakip-v*.apk)
if (( ${#versioned[@]} != 1 )); then
  echo "Expected exactly one versioned APK, found ${#versioned[@]}" >&2
  exit 1
fi
test -s "${versioned[0]}"
cmp -s WillyKiloTakip.apk "${versioned[0]}" || {
  echo 'Latest and versioned APK files are different' >&2
  exit 1
}

sha256sum WillyKiloTakip.apk "${versioned[0]}" > SHA256SUMS.txt
sha256sum -c SHA256SUMS.txt
test -s SHA256SUMS.txt
echo 'Both release APK variants have matching content and verified SHA-256.'
