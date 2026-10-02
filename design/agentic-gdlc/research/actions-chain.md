# Research: running the deterministic chain in GitHub Actions

Resolves [#236](https://github.com/justinclayton/nvu-game/issues/236). Facts only, each
with its source; no recommendation. Read 2026-10-01. The chain under study is `make build`,
`make check`, `make app-check`, `bin/nvu fuzz`, `bin/nvu sim --json`, `make pdf`,
`make rulebook` (see [`Makefile`](../../../Makefile) and [`bin/nvu`](../../../bin/nvu)).

## What the chain itself needs (from this repo)

- `make build` runs `node tools/cards.mjs build` whenever `design/cards.yaml`,
  `design/rulebook.md` or `tools/cards.mjs` is newer than `tools/cards.js`. Source:
  [`Makefile`](../../../Makefile), target `tools/cards.js`.
- `make check` runs `node tools/cards.mjs check` and `node tools/check-rules-version.mjs`,
  then `cd app && npx vitest run src/content` only if `app/node_modules` exists. Source:
  [`Makefile`](../../../Makefile), target `check`.
- `make app-check` depends on `app/node_modules` (created by `cd app && npm install`) and
  runs `cd app && npm run check`, which is `npm run lint && npm run typecheck && npm run test`.
  Sources: [`Makefile`](../../../Makefile), [`app/package.json`](../../../app/package.json).
- `bin/nvu` is a POSIX `sh` script that runs `npm install --silent` in `app/` if
  `app/node_modules/.bin/tsx` is not executable, then `make -s build`, then
  `tsx --tsconfig app/tsconfig.json app/src/cli/main.ts "$@"`. Source: [`bin/nvu`](../../../bin/nvu).
- `bin/nvu sim --seeds N [--from SEED] [--policy random|greedy] [--json]`; the policy defaults
  to `greedy`. Source: [`app/src/cli/args.ts`](../../../app/src/cli/args.ts).
- `make pdf` and `make rulebook` search for Chrome in this order: `$(CHROME)` if set, then
  `/Applications/Google Chrome.app/...`, `/Applications/Chromium.app/...`, then the commands
  `google-chrome`, `chromium`, `chromium-browser` on `PATH`; with none found they exit 1. The
  print command is `"$chrome" --headless=new --disable-gpu --no-pdf-header-footer
  --print-to-pdf=<abs out.pdf> file://<abs page.html>`. Output goes to
  `print/card-sheet-v<version>.pdf` and `print/rulebook-v<version>.pdf`, where the version is
  `sed -n 's/^Rules version:[[:space:]]*//p' design/rulebook.md`. Source:
  [`Makefile`](../../../Makefile), `print_pdf`, `RULES_VERSION`.
- `make rulebook` does not depend on `build`; it runs `node tools/rulebook.mjs` then prints.
  Source: [`Makefile`](../../../Makefile), target `rulebook`.
- The rulebook's version line today is `Rules version: 0.2.7` (line 3 of
  [`design/rulebook.md`](../../../design/rulebook.md)). `tools/check-rules-version.mjs`
  parses it with `/^Rules version:\s*(\S+)/m`, requires it to equal `RULES_VERSION` in
  `app/src/domain/setup.ts`, and compares versions numerically by dotted part. Source:
  [`tools/check-rules-version.mjs`](../../../tools/check-rules-version.mjs).
- The repo already has one workflow, `.github/workflows/rules-version.yml`: `on:
  pull_request: branches: [main]`, `ubuntu-latest`, `actions/checkout@v4` with
  `fetch-depth: 0`, `actions/setup-node@v4` with `node-version: 22`, then
  `node tools/check-rules-version.mjs`. Source:
  [`.github/workflows/rules-version.yml`](../../../.github/workflows/rules-version.yml).
- `app/package-lock.json` exists; there is no `.nvmrc`, `.node-version` or `engines` field.
  Source: `ls app/`, [`app/package.json`](../../../app/package.json).
- The repository is public (`gh repo view --json visibility` → `PUBLIC`). Source: GitHub API,
  read 2026-10-01.

## Path filters, and detecting a rules version bump

- "The `paths` and `paths-ignore` keywords accept glob patterns that use the `*` and `**`
  wildcard characters to match more than one path name." "If at least one path matches a
  pattern in the `paths` filter, the workflow runs." Source:
  [Workflow syntax — `on.<push|pull_request>.paths`](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#onpushpull_requestpull_request_targetpathspaths-ignore).
- Docs example, verbatim:
  ```yaml
  on:
    push:
      paths:
        - '**.js'
  ```
  Source: same page.
- "If you define both `branches`/`branches-ignore` and `paths`/`paths-ignore`, the workflow
  will only run when both filters are satisfied." Source: same page.
- "Path filters are not evaluated for pushes of tags." Source: same page.
- "If you define only `tags`/`tags-ignore` or only `branches`/`branches-ignore`, the workflow
  won't run for events affecting the undefined Git ref." Source:
  [Workflow syntax — `on.push.branches/tags`](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#onpushbranchestagsbranches-ignoretags-ignore).
- How the filter decides: "The filter determines if a workflow should run by evaluating the
  changed files and running them against the `paths-ignore` or `paths` list." Pushes to
  existing branches: "A two-dot diff compares the head and base SHAs directly with each
  other." Pushes to new branches: "A two-dot diff against the parent of the ancestor of the
  deepest commit pushed." "If the generated diff contains more than 3,000 files and the files
  the workflow filter matches are not in the first 3,000 returned by the filter, the workflow
  will **not** run." Source:
  [Workflow syntax — Git diff comparisons](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#git-diff-comparisons).
- The push payload gives the pre- and post-push SHAs: `before` is "The SHA of the most recent
  commit on ref before the push."; `after` is "The SHA of the most recent commit on ref after
  the push."; `created` is "Whether this push created the ref." Source:
  [Webhook events and payloads — push](https://docs.github.com/en/webhooks/webhook-events-and-payloads#push).
- Changed-file lists are not in the Actions payload: "The webhook payload available to GitHub
  Actions does not include the `added`, `removed`, and `modified` attributes in the `commit`
  object. You can retrieve the full commit object using the API." Source:
  [Events that trigger workflows — push](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#push).
- `github.event` is "The full event webhook payload. You can access individual properties of
  the event using this context." `github.sha` is "The commit SHA that triggered the
  workflow." Source:
  [Contexts reference — `github` context](https://docs.github.com/en/actions/reference/workflows-and-actions/contexts#github-context).
- `actions/checkout`'s `fetch-depth` is "Number of commits to fetch. 0 indicates all history
  for all branches and tags." Default `1`. Source:
  [actions/checkout README](https://github.com/actions/checkout/blob/main/README.md).
- `git diff [<options>] [--merge-base] <commit> <commit> [--] [<path>...]` "is to view the
  changes between two arbitrary <commit>." `--name-only`: "Show only the name of each changed
  file in the post-image tree." `--exit-code`: "exits with 1 if there were differences and 0
  means no differences." Source: [git-diff](https://git-scm.com/docs/git-diff).
- Workflow `concurrency`: "Only a single job or workflow using the same concurrency group
  will run at a time." Docs example, verbatim:
  ```yaml
  concurrency:
    group: ${{ github.workflow }}-${{ github.ref }}
    cancel-in-progress: true
  ```
  Source:
  [Workflow syntax — `concurrency`](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#concurrency).

## Headless Chrome on `ubuntu-latest`

- `ubuntu-latest` is Ubuntu 24.04 today: the runner-images README lists "Ubuntu 24.04 | x64 |
  `ubuntu-latest` or `ubuntu-24.04`". An announcement there says "`ubuntu-latest` label will
  use Ubuntu 26.04 in November 2026". Sources:
  [actions/runner-images README](https://github.com/actions/runner-images/blob/main/README.md),
  [issue #14748](https://github.com/actions/runner-images/issues/14748).
- "GitHub Actions and Azure DevOps use the `-latest` YAML label (ex: `ubuntu-latest`,
  `windows-latest`, and `macos-latest`). These labels point towards the newest stable OS
  version available." "The `-latest` migration process is gradual and happens over 1-2
  months". Source: [actions/runner-images README](https://github.com/actions/runner-images/blob/main/README.md).
- Ubuntu 24.04 image (Image Version 20260920.314.1) preinstalls, under "Browsers and
  Drivers": Google Chrome 153.0.8010.52, ChromeDriver 153.0.8010.52, Chromium 153.0.8010.0;
  env `CHROMEWEBDRIVER=/usr/local/share/chromedriver-linux64`. Under "Language and Runtime":
  Node.js 22.23.2; "Cached Tools" Node.js 22.23.2 and 24.21.0. Under "CLI Tools": GitHub CLI
  2.101.0. Source:
  [Ubuntu2404-Readme.md](https://github.com/actions/runner-images/blob/main/images/ubuntu/Ubuntu2404-Readme.md).
- How Chrome is installed, which fixes the binary names the Makefile searches for: the image
  build script downloads `google-chrome-stable_current_amd64.deb`, `apt-get install`s it,
  sets `CHROME_BIN=/usr/bin/google-chrome` in `/etc/environment`, calls
  `google-chrome --product-version`, and separately unzips a Chromium snapshot to
  `/usr/local/share/chromium` with symlinks `/usr/bin/chromium` and
  `/usr/bin/chromium-browser`. Source:
  [images/ubuntu/scripts/build/install-google-chrome.sh](https://github.com/actions/runner-images/blob/main/images/ubuntu/scripts/build/install-google-chrome.sh).
- So the Makefile's search finds `google-chrome` on `PATH` without `CHROME=` being set; the
  `CHROME_BIN` variable the image exports is not a name the Makefile reads. Sources:
  [`Makefile`](../../../Makefile) `print_pdf`, install script above.
- The flags the Makefile passes are defined by Chromium's headless command handler:
  `print-to-pdf` ("Save a PDF file of the loaded page.") and `no-pdf-header-footer` ("Do not
  display header and footer in the printed PDF file."). Source:
  [components/headless/command_handler/headless_command_switches.cc](https://github.com/chromium/chromium/blob/main/components/headless/command_handler/headless_command_switches.cc).
- Headless mode: "In Chrome 112, the Headless mode was updated so that Chrome creates, but
  doesn't display, any platform windows." "Since Chrome 132.0.6793.0 the old Headless mode is
  only available as a standalone binary named `chrome-headless-shell`." Source:
  [Chrome Headless mode](https://developer.chrome.com/docs/chromium/headless).
- Chromium's headless README: "As of M132, headless shell functionality is no longer part of
  the Chrome binary, so --headless=old has no effect." Source:
  [headless/README.md](https://chromium.googlesource.com/chromium/src/+/main/headless/README.md).
- Chrome's 2017 headless guide gives `chrome --headless --disable-gpu --print-to-pdf <url>`
  and says of `--disable-gpu`: "Temporarily needed if running on Windows."; of sandboxing:
  "`--no-sandbox` is not needed if you properly setup a user in the container." Source:
  [Getting Started with Headless Chrome](https://developer.chrome.com/blog/headless-chrome).
- Runner privileges: "The Linux and macOS virtual machines both run using passwordless
  `sudo`." Source:
  [GitHub-hosted runners reference — Administrative privileges](https://docs.github.com/en/actions/reference/runners/github-hosted-runners#administrative-privileges).

## Pushing to an orphan branch and committing back to `main` with `GITHUB_TOKEN`

- Permissions scopes include `actions`, `contents`, `issues`, `pull-requests`, `packages`,
  `id-token`, among others; each takes `read`, `write` or `none`. "If you specify the access
  for any of these permissions, all of those that are not specified are set to `none`."
  Shorthands `permissions: read-all`, `permissions: write-all`, `permissions: {}`. Source:
  [Workflow syntax — `permissions`](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#permissions).
- `contents`: "Work with the contents of the repository. For example, `contents: read` permits
  an action to list the commits, and `contents: write` allows the action to create a
  release." `actions`: "Work with GitHub Actions. For example, `actions: write` permits an
  action to cancel a workflow run." `write` includes `read`. `jobs.<job_id>.permissions`
  sets it per job. Source:
  [Workflow syntax reference — `permissions`](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#permissions).
- Docs example, verbatim:
  ```yaml
  permissions:
    contents: read
    issues: write
  ```
  Source: [Automatic token authentication](https://docs.github.com/en/actions/security-for-github-actions/security-guides/automatic-token-authentication).
- Repository-level default for the token: the permissive option grants "read and write access
  for all permissions"; the restricted option grants "read access for the `contents` and
  `packages` scopes only". "anyone with write access to a repository can modify the
  permissions granted to the `GITHUB_TOKEN`, adding or removing access as required, by
  editing the `permissions` key in the workflow file." Source:
  [Managing GitHub Actions settings for a repository](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository#setting-the-permissions-of-the-github_token-for-your-repository).
- This repo's setting is restricted: `GET /repos/justinclayton/nvu-game/actions/permissions/workflow`
  → `{"default_workflow_permissions":"read","can_approve_pull_request_reviews":false}`.
  So a push from a workflow needs `contents: write` in the workflow file. Source: GitHub API,
  read 2026-10-01;
  [REST — Get default workflow permissions](https://docs.github.com/en/rest/actions/permissions#get-default-workflow-permissions-for-a-repository).
- Token lifetime: "The `GITHUB_TOKEN` expires when the job finishes or after its effective
  maximum lifetime" (6 hours on GitHub-hosted runners). Source:
  [GITHUB_TOKEN concept](https://docs.github.com/en/actions/concepts/security/github_token).
- `actions/checkout` keeps the token in git config by default: `persist-credentials`
  "Whether to configure the token or SSH key with the local git config", default `true`;
  `token` defaults to `${{ github.token }}` and "The post-job step removes the PAT." Its
  documented push example, verbatim:
  ```yaml
  on: push
  jobs:
    build:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v7
        - run: |
            date > generated.txt
            git config user.name "github-actions[bot]"
            git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
            git add .
            git commit -m "generated"
            git push
  ```
  Source: [actions/checkout README](https://github.com/actions/checkout/blob/main/README.md).
- Orphan branch: `git checkout --orphan <new-branch>` — "Create a new unborn branch, named
  <new-branch>, started from <start-point> and switch to it. The first commit made on this
  new branch will have no parents and it will be the root of a new history totally
  disconnected from all the other branches and commits." "If you want to start a disconnected
  history that records a set of paths that is totally different from the one of
  <start-point>, then you should clear the index and the working tree right after creating
  the orphan branch by running `git rm -rf .`". Source:
  [git-checkout](https://git-scm.com/docs/git-checkout#Documentation/git-checkout.txt---orphanltnew-branchgt).
- Pushing to a named remote ref: refspec `[+]<src>[:<dst>]`; "If <src> resolves to a ref
  starting with `refs/heads/` or `refs/tags/`, then prepend that to <dst>." `--force`:
  "Usually, `git push` will refuse to update a branch that is not an ancestor of the commit
  being pushed. This flag disables that check". "To force a push to only one branch, use a
  `+` in front of the refspec to push". Source: [git-push](https://git-scm.com/docs/git-push).
- No re-trigger from a `GITHUB_TOKEN` push: "When you use the repository's `GITHUB_TOKEN` to
  perform tasks, events triggered by the `GITHUB_TOKEN` will not create a new workflow run,
  with the following exceptions: `workflow_dispatch` and `repository_dispatch` events always
  create workflow runs." "If a workflow run pushes code using the repository's
  `GITHUB_TOKEN`, a new workflow will not run even when the repository contains a workflow
  configured to run when `push` events occur." "you can use a GitHub App installation access
  token or a personal access token instead of `GITHUB_TOKEN` to trigger events that require a
  token." Source:
  [Triggering a workflow from a workflow](https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/triggering-a-workflow#triggering-a-workflow-from-a-workflow).
- A second, independent guard: commit-message skip strings. "Workflows that would otherwise
  be triggered using `on: push` or `on: pull_request`" are skipped if the commit message
  contains `[skip ci]`, `[ci skip]`, `[no ci]`, `[skip actions]` or `[actions skip]`, or a
  `skip-checks: true` / `skip-checks:true` trailer "after two blank lines". "Skip
  instructions only apply to the `push` and `pull_request` events." Source:
  [Skipping workflow runs](https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-workflow-runs/skipping-workflow-runs).
- `main` is protected in this repo: required status check `rules-version` with `strict: true`,
  `enforce_admins: true`, `allow_force_pushes: false`. Source: GitHub API
  `GET /repos/justinclayton/nvu-game/branches/main/protection`, read 2026-10-01. No rulesets
  (`GET /repos/justinclayton/nvu-game/rulesets` → `[]`).
- With required status checks: "After all required status checks pass, any commits must
  either be pushed to another branch and then merged or pushed directly to the protected
  branch." With strict: "The branch **must** be up to date with the base branch before
  merging". "Do not allow bypassing the above settings" applies "the restrictions to admins
  and roles with the 'bypass branch protections' permission, too." Source:
  [About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches#require-status-checks-before-merging).

## Creating a Release with assets from a workflow

- REST: `POST /repos/{owner}/{repo}/releases`. Body: `tag_name` (required),
  `target_commitish` ("Unused if the Git tag already exists. Default: the repository's
  default branch."), `name`, `body`, `draft`, `prerelease`, `generate_release_notes`,
  `make_latest`. "Users with push access to the repository can create a release." "This
  endpoint triggers notifications. Creating content too quickly using this endpoint may
  result in secondary rate limiting." "Fine-grained access tokens and GitHub App installation
  tokens also need the 'Workflows' repository permission (write)" when the resolved target
  commit modifies workflow files. Source:
  [REST — Create a release](https://docs.github.com/en/rest/releases/releases?apiVersion=2022-11-28#create-a-release).
- Create a release is listed under "Repository permissions for 'Contents'" at access
  "write". Download an artifact and List artifacts for a repository are under "Repository
  permissions for 'Actions'" at "read". Source:
  [Permissions required for GitHub Apps](https://docs.github.com/en/rest/authentication/permissions-required-for-github-apps?apiVersion=2022-11-28).
- Upload an asset: `POST https://uploads.github.com/repos/{owner}/{repo}/releases/{release_id}/assets`
  with a `name` query parameter and a `Content-Type` header ("For example:
  application/zip"); "Use the upload_url returned in the response of the Create a release
  endpoint". "If you upload an asset with the same filename as another uploaded asset,
  you'll receive an error and must delete the old file before you can re-upload the new
  asset." (422). Source:
  [REST — Upload a release asset](https://docs.github.com/en/rest/releases/assets?apiVersion=2022-11-28#upload-a-release-asset).
- CLI: `gh release create [<tag>] [<filename>... | <pattern>...]`. "If a matching git tag
  does not yet exist, one will automatically get created from the latest state of the
  default branch." "A list of asset files may be given to upload to the new release. To
  define a display label for an asset, append text starting with `#` after the file name."
  Flags: `--notes`, `--notes-file`, `--generate-notes`, `--notes-from-tag`, `--target`
  ("Target branch or full commit SHA (default [main branch])"), `--title`, `--draft`,
  `--prerelease`, `--latest`. Examples: `gh release create v1.2.3 --notes "bugfix release"`,
  `gh release create v1.2.3 './dist/*.tgz'`,
  `gh release create v1.2.3 '/path/to/asset.zip#My display label'`. Source:
  [gh release create](https://cli.github.com/manual/gh_release_create).
- "GitHub CLI is preinstalled on all GitHub-hosted runners." "For each step that uses GitHub
  CLI, you must set an environment variable called `GH_TOKEN` to a token with the required
  scopes." Docs example, verbatim:
  ```yaml
  - run: gh issue comment $ISSUE --body "Thank you for opening this issue!"
    env:
      GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      ISSUE: ${{ github.event.issue.html_url }}
  ```
  Source:
  [Using GitHub CLI in workflows](https://docs.github.com/en/actions/how-tos/writing-workflows/choosing-what-your-workflow-does/using-github-cli-in-workflows).
- `GH_TOKEN`, `GITHUB_TOKEN`: "an authentication token that will be used when a command
  targets either `github.com` or a subdomain of `ghe.com`. Setting this avoids being prompted
  to authenticate and takes precedence over previously stored credentials." Source:
  [gh environment](https://cli.github.com/manual/gh_help_environment).
- Tag pushes and the trigger: "An event will not be created when you push more than three
  tags at once." `release` event: "Workflows are not triggered for the `created`, `edited`,
  or `deleted` activity types for draft releases." Source:
  [Events that trigger workflows](https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows).

## Caching `app/node_modules`; sim cost; runner size; billing

- `actions/setup-node` `cache` input accepts `npm`, `yarn`, `pnpm`; `cache-dependency-path`
  "Used to specify the path to a dependency file: package-lock.json, yarn.lock, etc. It will
  generate hash from the target file for primary key." "The action does not cache
  `node_modules`". Docs example, verbatim:
  ```yaml
  steps:
  - uses: actions/checkout@v7
  - uses: actions/setup-node@v7
    with:
      node-version: 24
      cache: 'npm'
  - run: npm ci
  - run: npm test
  ```
  Source: [actions/setup-node README](https://github.com/actions/setup-node/blob/main/README.md).
- `actions/cache` inputs: `path` ("A list of files, directories, and wildcard patterns to
  cache and restore."), `key` ("An explicit key for a cache entry."), `restore-keys` ("An
  ordered multiline string listing the prefix-matched keys, that are used for restoring stale
  cache if no cache hit occurred."), `fail-on-cache-miss`, `lookup-only`; output `cache-hit`
  ("A string value to indicate an exact match was found for the key."). "A repository can
  have up to 10GB of caches. Once the 10GB limit is reached, older caches will be evicted
  based on when the cache was last accessed. Caches that are not accessed within the last
  week will also be evicted." Source:
  [actions/cache README](https://github.com/actions/cache/blob/main/README.md).
- On caching `node_modules` directly: "It is not recommended to cache `node_modules`, as it
  can break across Node versions and won't work with `npm ci`". The documented npm pattern
  caches the npm cache dir (`npm config get cache`) keyed on
  `hashFiles('**/package-lock.json')`. Source:
  [actions/cache examples — Node npm](https://github.com/actions/cache/blob/main/examples.md#node---npm).
- Cache docs key example, verbatim:
  ```yaml
  key: ${{ runner.os }}-build-${{ env.cache-name }}-${{ hashFiles('**/package-lock.json') }}
  restore-keys: |
    ${{ runner.os }}-build-${{ env.cache-name }}-
    ${{ runner.os }}-build-
    ${{ runner.os }}-
  ```
  "By default, the limit is 10 GB per repository"; "GitHub will remove any cache entries that
  have not been accessed in over 7 days." "Workflow runs can restore caches created in either
  the current branch or the default branch (usually `main`). If a workflow run is triggered
  for a pull request, it can also restore caches created in the base branch." Source:
  [Caching dependencies](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/caching-dependencies-to-speed-up-workflows).
- Runner size, public repositories: Ubuntu x64 `ubuntu-latest` / `ubuntu-24.04` /
  `ubuntu-22.04` / `ubuntu-26.04`: 4 processors, 16 GB memory, 14 GB storage; `ubuntu-slim`:
  1 processor, 5 GB, 14 GB. Private repositories: 2 processors, 8 GB, 14 GB for the same
  labels. Source:
  [GitHub-hosted runners reference](https://docs.github.com/en/actions/reference/runners/github-hosted-runners).
- Limits: "Each job in a workflow can run for up to 6 hours of execution time." Workflow run
  limit 35 days. Concurrent jobs: Free 20 (5 macOS), Pro 40, Team 60, Enterprise 500. "The
  rate limit for `GITHUB_TOKEN` is 1,000 requests per hour per repository." "A job matrix can
  generate a maximum of 256 jobs per workflow run." Source:
  [Actions limits](https://docs.github.com/en/actions/reference/limits).
- Billing: "The use of standard GitHub-hosted runners is free: In public repositories". For
  private repositories the included monthly amounts are GitHub Free 2,000 minutes / 500 MB
  artifact storage; Pro 3,000 / 1 GB; Free for organizations 2,000 / 500 MB; Team 3,000 /
  2 GB; Enterprise Cloud 50,000 / 50 GB; cache storage 10 GB on every plan. "At the start of
  each month, the minutes used by the account are reset to zero." Extra artifact storage is
  "$0.25 USD" per GB per month. Source:
  [About billing for GitHub Actions](https://docs.github.com/en/billing/managing-billing-for-your-products/managing-billing-for-github-actions/about-billing-for-github-actions).
- Per-minute rates beyond the included amount: Linux 2-core x64 $0.006, Linux 4-core x64
  $0.012, Linux 4-core arm64 $0.008. "GitHub rounds the minutes and partial minutes each job
  uses up to the nearest whole minute." Source:
  [Actions runner pricing](https://docs.github.com/en/billing/reference/actions-runner-pricing).
- The account owning this repo is on plan `free` (`GET /user` → `plan.name`). Source: GitHub
  API, read 2026-10-01.
- Local measurement of the sim, this checkout at `origin/main` c396025, Apple M3 Pro
  (12 cores), Node v24.19.0, `app/node_modules` already installed, measured with
  `/usr/bin/time -l`:
  - `bin/nvu sim --seeds 1000 --json`: 7.38 s wall, 4.59 s user, max RSS 191 MB; JSON output
    9,463 bytes.
  - `bin/nvu sim --seeds 5000 --json`: 18.42 s wall, 19.15 s user, max RSS 190 MB.
  - `bin/nvu fuzz --seeds 1000`: 1.42 s wall, 1.74 s user, max RSS 131 MB.
  Each run includes `bin/nvu`'s `make -s build` step and `tsx` startup. Source: this
  research session, 2026-10-01; not a runner measurement.

## Uploading artifacts and reading them from outside Actions

- `actions/upload-artifact` inputs: `name` (default `artifact`), `path` (required),
  `if-no-files-found` (`warn` | `error` | `ignore`, default `warn`), `retention-days`
  ("Duration after which artifact will expire in days. 0 means using default retention.
  Minimum 1 day. Maximum 90 days unless changed from the repository settings page."),
  `compression-level` (0–9, default 6), `overwrite` (default `false`). Outputs
  `artifact-id` ("GitHub ID of an Artifact, can be used by the REST API"), `artifact-url`
  ("Users must be logged-in in order for this URL to work."), `artifact-digest`. "Within an
  individual job, there is a limit of 500 artifacts that can be created for that job."
  "Artifacts created by upload-artifact@v4 are immutable." Files are zipped unless
  `archive: false`. Source:
  [actions/upload-artifact README](https://github.com/actions/upload-artifact/blob/main/README.md).
- Docs example, verbatim:
  ```yaml
  - name: 'Upload Artifact'
    uses: actions/upload-artifact@v4
    with:
      name: my-artifact
      path: my_file.txt
      retention-days: 5
  ```
  "The `retention-days` value cannot exceed the retention limit set by the repository,
  organization, or enterprise." Source:
  [Storing and sharing data from a workflow](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/storing-and-sharing-data-from-a-workflow).
- Retention: "checks, workflow runs, commit statuses, and the artifacts and log files
  generated by workflows are retained for 90 days"; public repositories "anywhere between
  1 day or 90 days", private "anywhere between 1 day or 400 days"; a change "only applies to
  new checks, workflow runs, commit statuses, artifacts, and log files". Source:
  [Configuring the retention period](https://docs.github.com/en/organizations/managing-organization-settings/configuring-the-retention-period-for-github-actions-artifacts-and-logs-in-your-organization).
- Downloading from outside: "Read access to the repository is required to perform these
  steps." CLI: `gh run download RUN_ID`, `gh run download RUN_ID -n ARTIFACT_NAME`. Source:
  [Downloading workflow artifacts](https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-workflow-runs/downloading-workflow-artifacts).
- `gh run download [<run-id>] [flags]`; `-n, --name` "Download artifacts that match any of
  the given names"; `-p, --pattern` "Download artifacts that match a glob pattern"; `-D,
  --dir` default `.`; without a run id, `gh run download -n <name>` downloads the latest
  artifact of that name across the repository's runs. Source:
  [gh run download](https://cli.github.com/manual/gh_run_download).
- REST list: `GET /repos/{owner}/{repo}/actions/artifacts`, query `name` ("When specified,
  only artifacts with this name will be returned."). "Anyone with read access to the
  repository can use this endpoint." "OAuth app tokens and personal access tokens (classic)
  need the `repo` scope to use this endpoint with a private repository." REST download:
  `GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}/{archive_format}`; "The
  `:archive_format` must be `zip`."; responds 302, "Look for `Location:` in the response
  header to find the URL for the download."; "This URL expires after 1 minute." Source:
  [REST — Artifacts](https://docs.github.com/en/rest/actions/artifacts?apiVersion=2022-11-28).

## Not established

- The value of `github.event.before` when a push creates a branch (whether it is the all-zero
  SHA). The webhook docs read give only `created: Whether this push created the ref.`
- Whether `--no-sandbox` is required for Chrome on GitHub-hosted runners. The runner docs do
  not name the user the job runs as; Chrome's guide only says the flag is unnecessary with a
  properly set up non-root user.
- The runner-side minutes and memory for the sim. Only the local measurement above exists;
  no runner run was performed.
- Which permission "Upload a release asset" needs under the GitHub Apps permissions table;
  the page read lists "Create a release" under Contents (write) but the upload endpoint was
  not found in it.
- A GitHub maximum size for a single release asset or for a single artifact; neither page
  read states one.
- Whether `enforce_admins` on `main` blocks a direct push by `GITHUB_TOKEN` when the
  required `rules-version` check has not run for that commit. The protected-branches doc
  describes the rule for people; no source read states the behavior for the Actions token.
- Whether a workflow's own `paths:` filter is applied to a `GITHUB_TOKEN` push (moot: such a
  push creates no run regardless, per the triggering doc).
