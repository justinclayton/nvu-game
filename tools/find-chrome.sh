#!/bin/sh
# Print the path of a Chrome that can print a page to PDF.
#
# $CHROME wins, then an installed Chrome or Chromium. Failing those, it fetches
# Chrome for Testing with Google's @puppeteer/browsers into a cache outside the
# repo, once; later runs find it there. That keeps `make pdf` working on a
# machine with no Chrome, the self-hosted runner among them, without
# installing anything system-wide.
set -e

if [ -n "$CHROME" ]; then echo "$CHROME"; exit 0; fi

for c in "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
         "/Applications/Chromium.app/Contents/MacOS/Chromium"; do
  if [ -x "$c" ]; then echo "$c"; exit 0; fi
done
for c in google-chrome chromium chromium-browser; do
  if command -v "$c" >/dev/null 2>&1; then command -v "$c"; exit 0; fi
done

cache="${XDG_CACHE_HOME:-$HOME/.cache}/nvu-game/chrome"
echo "find-chrome: no Chrome installed; fetching Chrome for Testing into $cache" >&2
# Prints "chrome@<version> <path to the binary>"; the path can hold spaces.
line=$(npx -y @puppeteer/browsers install chrome@stable --path "$cache" | tail -n 1)
path="${line#* }"
if [ ! -x "$path" ]; then
  echo "find-chrome: could not fetch Chrome; set CHROME=/path/to/chrome" >&2
  exit 1
fi
echo "$path"
