# The GitHub API surface the one place needs

Research for [#237](https://github.com/justinclayton/nvu-game/issues/237), a
`wayfinder:research` ticket under the Agentic GDLC map (#233). Facts only; no
recommendation. Every fact carries its source. "Verified" means the call was run
read-only against this repo with `gh api` on 2026-10-01 and the result is reported as
observed, not as a documented guarantee. Everything the docs do not settle is in the
"Not established" list at the end.

Sources are GitHub's REST and GraphQL docs, GitHub's authentication docs, the `gh` CLI
manual, the live GraphQL schema (introspection), and the live REST API.

## Projects v2: project 1, "Agentic GDLC"

- The project is user-owned: `user(login:"justinclayton") { projectV2(number:1) }` resolves to
  id `PVT_kwHOAAQN5c4BlZTm`, title "Agentic GDLC", 19 items. Verified.
- Projects v2 is no longer GraphQL-only. GitHub documents a REST API for Projects v2
  (projects, items, fields) that requires the header `X-GitHub-Api-Version: 2026-03-10`.
  Sources: [REST projects](https://docs.github.com/en/rest/projects/projects),
  [REST items](https://docs.github.com/en/rest/projects/items),
  [REST fields](https://docs.github.com/en/rest/projects/fields).
- REST, user-owned project endpoints (verbatim paths):
  `GET /users/{username}/projectsV2`,
  `GET /users/{username}/projectsV2/{project_number}`,
  `GET /users/{username}/projectsV2/{project_number}/items`,
  `GET /users/{username}/projectsV2/{project_number}/items/{item_id}`,
  `POST /users/{username}/projectsV2/{project_number}/items`,
  `PATCH /users/{username}/projectsV2/{project_number}/items/{item_id}`,
  `GET /users/{username}/projectsV2/{project_number}/fields`,
  `GET /users/{username}/projectsV2/{project_number}/fields/{field_id}`.
  Sources: [items](https://docs.github.com/en/rest/projects/items),
  [fields](https://docs.github.com/en/rest/projects/fields).
- REST list items: "List all items for a specific user-owned project accessible by the
  authenticated user." The `fields` query parameter takes field IDs (`fields=123,456`); "If not
  specified, the title field will be returned." `q` filters items; `per_page` defaults to 30,
  max 100, with `before`/`after` cursors. Each item has `content_type` (`Issue`, `PullRequest`,
  `DraftIssue`), `content`, and a `fields` array of `{id, name, value}`.
  Source: [REST items](https://docs.github.com/en/rest/projects/items).
- REST update item: `PATCH .../items/{item_id}` with body `{"fields":[{"id":<field id>,
  "value":<value>}]}`; single-select and iteration fields take the option or iteration id;
  `null` clears. Source: [REST items](https://docs.github.com/en/rest/projects/items).
- REST field object: `id`, `name`, `data_type` (`text`, `number`, `date`, `single_select`,
  `iteration`, `assignees`, `labels`, `milestone`, `repository`, `title`,
  `linked_pull_requests`, `reviewers`, `issue_type`, `parent_issue`, `sub_issues_progress`),
  `options[{id,name}]`. Source: [REST fields](https://docs.github.com/en/rest/projects/fields).
- Verified on this project: `GET /users/justinclayton/projectsV2` returns project 1 with
  `id` 26580198; `.../projectsV2/1/fields` lists the `Status` field, `id` 419846883,
  `data_type` `single_select`, options `Todo` (`f75ad846`), `In Progress` (`47fc9ee4`), `Done`
  (`98236657`); `.../projectsV2/1/items?fields=419846883` returns each item with
  `fields[0].value.name.raw` = "Todo". Passing the field name instead of its id
  (`fields=Status`) returns HTTP 400 "Field validation errors".
- Verified: the REST Projects calls succeeded with the `gh` CLI's stored OAuth token
  (scopes `gist, project, read:org, repo, workflow`). Which other token types the Projects v2
  REST endpoints accept is not stated on those pages (see Not established).
- GraphQL, documented query to find the project:
  `query{ user(login: "USER"){ projectV2(number: NUMBER) { id } } }`.
  Source: [Using the API to manage Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/using-the-api-to-manage-projects).
- GraphQL, documented query to list items with field values:
  `node(id: "PROJECT_ID") { ... on ProjectV2 { items(first: 20) { nodes { fieldValues(first: 8)
  { nodes { ... on ProjectV2ItemFieldSingleSelectValue { name field { ... on
  ProjectV2FieldCommon { name } } } } } } } } }`. Same source.
- GraphQL, documented fields query for single-select options:
  `... on ProjectV2SingleSelectField { id name options { id name } }`. Same source.
- GraphQL, documented mutation to set a single-select field:
  `updateProjectV2ItemFieldValue(input: { projectId, itemId, fieldId, value: {
  singleSelectOptionId: "OPTION_ID" } }) { projectV2Item { id } }`. Same source.
- Live schema (introspection, verified): `ProjectV2Item` has `id`, `content`, `isArchived`,
  `project`, `fieldValues(first, last, after, before, orderBy)` and `fieldValueByName(name)`;
  `ProjectV2ItemFieldSingleSelectValue` has `name`, `optionId`, `field`, `color`,
  `description`; `User` has `projectV2(number)` and `projectsV2(query, orderBy,
  minPermissionLevel, first, ...)`. The mutation list includes `updateProjectV2ItemFieldValue`,
  `addProjectV2ItemById`, `archiveProjectV2Item`, `clearProjectV2ItemFieldValue`.
- Verified one-call read of status: `items(first:N) { nodes { content { ... on Issue { number
  title } } fieldValueByName(name:"Status") { ... on ProjectV2ItemFieldSingleSelectValue { name
  optionId } } } }` returns, e.g., #233 → "Todo"/`f75ad846`; the query cost 1 point
  (`rateLimit { cost }`).
- GraphQL token scopes for Projects: "a token that has the `read:project` scope (for queries)
  or `project` scope (for queries and mutations)"; the token can be "a personal access token
  (classic) for a user or an installation access token for a GitHub App"; "When using an
  installation access token for a GitHub App, some GraphQL mutations require additional
  permissions." For the CLI: `gh auth login --scopes "project"`.
  Source: [Using the API to manage Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/using-the-api-to-manage-projects).
- GraphQL connections require `first` or `last` (1 to 100) and a call may not request more
  than 500,000 nodes. Source: [GraphQL rate and node limits](https://docs.github.com/en/graphql/overview/rate-limits-and-node-limits-for-the-graphql-api).

## Issues: sub-issues, dependencies, labels, assignees

- Sub-issues (verbatim paths): `GET /repos/{owner}/{repo}/issues/{issue_number}/parent`
  (the parent issue), `GET /repos/{owner}/{repo}/issues/{issue_number}/sub_issues` (array of
  issue objects), `POST .../sub_issues` (body `sub_issue_id`, optional `replace_parent`),
  `DELETE .../sub_issue` (body `sub_issue_id`), `PATCH .../sub_issues/priority` (body
  `sub_issue_id`, `after_id` or `before_id`). The page is versioned `2026-03-10`.
  Source: [REST sub-issues](https://docs.github.com/en/rest/issues/sub-issues).
- Verified: `GET /repos/justinclayton/nvu-game/issues/233/sub_issues` returns 18 issue
  objects; each carries `parent_issue_url`, `sub_issues_summary` and
  `issue_dependencies_summary`.
- Issue dependencies (verbatim paths):
  `GET /repos/{owner}/{repo}/issues/{issue_number}/dependencies/blocked_by` (issues that
  block this one), `GET .../dependencies/blocking` (issues this one blocks),
  `POST .../dependencies/blocked_by` (body `issue_id`, 201),
  `DELETE .../dependencies/blocked_by/{issue_id}`. `per_page` max 100.
  Source: [REST issue dependencies](https://docs.github.com/en/rest/issues/issue-dependencies).
- Verified: `.../issues/246/dependencies/blocked_by` returns #245, #235, #237;
  `.../issues/237/dependencies/blocking` returns #246; `GET .../issues/237` includes
  `"issue_dependencies_summary": {"blocked_by":0,"blocking":1,"total_blocked_by":0,
  "total_blocking":1}`, `"sub_issues_summary": {"completed":0,"percent_completed":0,"total":0}`
  and `"parent_issue_url": ".../issues/233"`.
- Issues: `GET /repos/{owner}/{repo}/issues` with `state` (`open` default, `closed`, `all`),
  `labels` (comma-separated), `assignee`, `per_page` (max 100). The list "returns both issues
  and pull requests"; "You can identify pull requests by the pull_request key."
  `GET /repos/{owner}/{repo}/issues/{issue_number}` returns one issue (301 if transferred,
  410 if deleted). `PATCH /repos/{owner}/{repo}/issues/{issue_number}` edits `title`, `body`,
  `state`, `state_reason`, `labels`, `assignees`, `milestone`; "Only users with push access can
  set labels for issues." Source: [REST issues](https://docs.github.com/en/rest/issues/issues).
- Labels: `GET /repos/{owner}/{repo}/issues/{issue_number}/labels`, `POST .../labels` ("Adds
  labels to an issue"), `PUT .../labels` ("Removes any previous labels and sets the new
  labels"), `DELETE .../labels/{name}` (returns the remaining labels),
  `GET /repos/{owner}/{repo}/labels`. Source: [REST labels](https://docs.github.com/en/rest/issues/labels).
- Assignees: `POST /repos/{owner}/{repo}/issues/{issue_number}/assignees` ("Adds up to 10
  assignees to an issue. Users already assigned to an issue are not replaced."),
  `DELETE .../assignees`, `GET /repos/{owner}/{repo}/assignees`,
  `GET /repos/{owner}/{repo}/assignees/{assignee}` (204 if assignable, 404 if not). "Only users
  with push access can add assignees to an issue." Source: [REST assignees](https://docs.github.com/en/rest/issues/assignees).
- Fine-grained permissions: sub-issues list, dependencies list, and issue reads are under
  "Repository permissions for 'Issues'" (read); adding labels is "Issues" (write).
  Source: [Permissions required for fine-grained PATs](https://docs.github.com/en/rest/authentication/permissions-required-for-fine-grained-personal-access-tokens).
  The same headings and levels apply to GitHub Apps.
  Source: [Permissions required for GitHub Apps](https://docs.github.com/en/rest/authentication/permissions-required-for-github-apps).

## Pull requests: listing with checks, merging, requesting changes, the cards.yaml diff

- `GET /repos/{owner}/{repo}/pulls` with `state` (`open` default), `head` (`user:ref-name`),
  `base`, `sort`. Source: [REST pulls](https://docs.github.com/en/rest/pulls/pulls).
  Verified: list items do not contain `mergeable`, `mergeable_state` or `merged`; `GET
  /repos/{owner}/{repo}/pulls/{pull_number}` does (observed `mergeable: null`,
  `mergeable_state: "unknown"`, `merged: true` on the merged PR #232).
- Checks status is not in the PR list response. Three documented ways to read it:
  - `GET /repos/{owner}/{repo}/commits/{ref}/check-runs` with `check_name`, `status`
    (`queued`, `in_progress`, `completed`), `filter` (`latest`, `all`); check run `status`
    is one of `queued, in_progress, completed, waiting, requested, pending` and `conclusion`
    one of `success, failure, neutral, cancelled, skipped, timed_out, action_required, null`.
    "Write permission for the REST API to interact with checks is only available to GitHub
    Apps. OAuth apps and authenticated users can view check runs and check suites, but they
    are not able to create them." Source: [REST check runs](https://docs.github.com/en/rest/checks/runs).
    Verified on PR #232's head: one run, `rules-version`, `completed`/`success`, app
    `github-actions`.
  - `GET /repos/{owner}/{repo}/commits/{ref}/status`: combined `state` is `failure` if any
    context reports error or failure, `pending` if there are no statuses or one is pending,
    `success` if the latest status for all contexts is success. Source: [REST commit statuses](https://docs.github.com/en/rest/commits/statuses).
    Verified: this repo's Actions checks are check runs, not commit statuses, so the combined
    status is `pending` with `total_count: 0`.
  - GraphQL in one call (live schema, verified): `repository { pullRequests(first:N,
    states:[OPEN]) { nodes { number title mergeable reviewDecision headRefOid commits(last:1)
    { nodes { commit { statusCheckRollup { state contexts(first:N) { nodes { ... on CheckRun {
    name status conclusion } ... on StatusContext { context state } } } } } } } } } }`.
    `StatusState` is `EXPECTED, ERROR, FAILURE, PENDING, SUCCESS`; `PullRequest` also has
    `mergeStateStatus`, `merged`, `changedFiles`, `files`. Observed `statusCheckRollup.state:
    "SUCCESS"` on #232.
- Merge: `PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge`, body `merge_method` (`merge`,
  `squash`, `rebase`), `commit_title`, `commit_message`, `sha` (head SHA that must match);
  200 merged, 405 not mergeable, 409 SHA mismatch. Source: [REST pulls](https://docs.github.com/en/rest/pulls/pulls).
  Fine-grained permission: "Repository permissions for 'Contents'" (write), for both PATs and
  Apps. Sources: [fine-grained PAT permissions](https://docs.github.com/en/rest/authentication/permissions-required-for-fine-grained-personal-access-tokens),
  [GitHub App permissions](https://docs.github.com/en/rest/authentication/permissions-required-for-github-apps).
- Request changes: `POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews` with `event`
  one of `APPROVE`, `REQUEST_CHANGES`, `COMMENT`; `body` is required for `REQUEST_CHANGES` and
  `COMMENT`; optional `comments[{path, body, position}]`. "By leaving this blank, you set the
  review action state to PENDING, which means you will need to submit the pull request review
  when you are ready." Submit: `POST .../reviews/{review_id}/events`; dismiss:
  `PUT .../reviews/{review_id}/dismissals`; list: `GET .../reviews`. "Creating content too
  quickly using this endpoint may result in secondary rate limiting."
  Source: [REST pull request reviews](https://docs.github.com/en/rest/pulls/reviews).
  Fine-grained permission: "Repository permissions for 'Pull requests'" (write). Sources as
  for merge.
- Diff of one file: `GET /repos/{owner}/{repo}/pulls/{pull_number}/files` returns per file
  `filename`, `status` (`added, removed, modified, renamed, copied, changed, unchanged`),
  `additions`, `deletions`, `patch`; "Maximum 3000 files", 30 per page by default.
  Source: [REST pulls](https://docs.github.com/en/rest/pulls/pulls). Fine-grained permission:
  "Pull requests" (read). Verified on #232: the entry for `design/cards.yaml` has a `patch`
  (+1/-1), so the file's diff is the `patch` of the entry whose `filename` is
  `design/cards.yaml`.
- Whole-PR diff: `GET /repos/{owner}/{repo}/pulls/{pull_number}` with `Accept:
  application/vnd.github.diff` returns unified diff text; `application/vnd.github.patch`
  returns patch format. Source: [REST pulls](https://docs.github.com/en/rest/pulls/pulls);
  the media-type convention is in [Getting started with the REST API](https://docs.github.com/en/rest/using-the-rest-api/getting-started-with-the-rest-api).
  Verified: the `diff` media type on #232 returns `diff --git a/app/src/cli/render.ts ...`.
- GraphQL `PullRequest.files` nodes (`PullRequestChangedFile`) carry `path`, `additions`,
  `deletions`, `changeType`, `viewerViewedState` only; no patch text (live schema, verified).

## Actions: workflow runs and artifacts

- `GET /repos/{owner}/{repo}/actions/runs` with `branch`, `event`, `status`, `head_sha`,
  `per_page`, `created`; `status` accepts `completed, action_required, cancelled, failure,
  neutral, skipped, stale, success, timed_out, in_progress, queued, requested, waiting,
  pending`. `GET /repos/{owner}/{repo}/actions/runs/{run_id}`;
  `GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs`;
  `POST /repos/{owner}/{repo}/actions/runs/{run_id}/rerun`;
  `GET /repos/{owner}/{repo}/actions/runs/{run_id}/logs`. "Anyone with read access to the
  repository can use this endpoint" for the reads; classic tokens need `repo` on a private
  repository. Source: [REST workflow runs](https://docs.github.com/en/rest/actions/workflow-runs).
  Verified: this repo has 132 runs; each carries `id`, `name`, `status`, `conclusion`,
  `head_branch`, `event`, `path` (`.github/workflows/rules-version.yml`).
- `POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches`, body `ref`
  (required, branch or tag) and `inputs` (max 25); "You must configure your GitHub Actions
  workflow to run when the workflow_dispatch webhook event occurs."
  Source: [REST workflows](https://docs.github.com/en/rest/actions/workflows).
- Artifacts: `GET /repos/{owner}/{repo}/actions/runs/{run_id}/artifacts`;
  `GET /repos/{owner}/{repo}/actions/artifacts` with `name` filter;
  `GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}`;
  `GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}/{archive_format}` where
  `archive_format` must be `zip`, which "returns a 302 Found" to a URL that "expires after 1
  minute"; artifact objects carry `archive_download_url`, `expires_at`, `expired`.
  Source: [REST artifacts](https://docs.github.com/en/rest/actions/artifacts).
  Verified: this repo has no artifacts (`total_count: 0`). On a public repo (`cli/cli`) the
  download endpoint returned `302` with `Location` on `*.blob.core.windows.net` and
  `access-control-allow-origin: *` when authenticated, and `401` unauthenticated.
- Fine-grained permissions: runs list and artifact download are under "Repository
  permissions for 'Actions'" (read) for PATs and Apps; re-run etc. are "Actions" (write).
  Sources: [fine-grained PAT permissions](https://docs.github.com/en/rest/authentication/permissions-required-for-fine-grained-personal-access-tokens),
  [GitHub App permissions](https://docs.github.com/en/rest/authentication/permissions-required-for-github-apps).

## Reading files: orphan branch and `main`, contents API versus raw, rate limits

- `GET /repos/{owner}/{repo}/contents/{path}` with `ref` ("the name of the commit/branch/tag.
  Default: the repository's default branch."). Media types: `application/vnd.github.raw+json`
  (raw file contents), `application/vnd.github.html+json`, `application/vnd.github.object+json`.
  Files of 1 MB or less: all features; 1 to 100 MB: "Only the raw or object custom media
  types are supported" and `content` is empty; over 100 MB: "This endpoint is not supported."
  Directories return at most 1,000 entries. The response has `download_url`; "Download URLs
  expire and are meant to be used just once."
  Source: [REST contents](https://docs.github.com/en/rest/repos/contents).
- Verified on `main`: `contents/design/cards.yaml?ref=main` returns `size` 22589,
  `encoding` "base64", `download_url`
  `https://raw.githubusercontent.com/justinclayton/nvu-game/main/design/cards.yaml`; with
  `Accept: application/vnd.github.raw+json` the body is the YAML text.
- Verified on the orphan branch: `contents/?ref=pr-media` lists `README.md` and `issue-*`
  directories; the branch exists at `GET /repos/{owner}/{repo}/branches/pr-media`. The
  orphan branch is read like any ref; there is no distinct endpoint.
- GraphQL alternative (live schema, verified): `repository { object(expression:
  "pr-media:") { ... on Tree { entries { name type } } } object(expression:
  "main:design/cards.yaml") { ... on Blob { byteSize isBinary text } } }` returns the tree
  and the file text in one call.
- Fine-grained permission for contents reads: "Repository permissions for 'Contents'" (read).
  Sources: [fine-grained PAT permissions](https://docs.github.com/en/rest/authentication/permissions-required-for-fine-grained-personal-access-tokens),
  [GitHub App permissions](https://docs.github.com/en/rest/authentication/permissions-required-for-github-apps).
- Raw host, observed only (no primary doc found, see Not established): `GET
  https://raw.githubusercontent.com/justinclayton/nvu-game/main/design/cards.yaml` returned
  `200`, `content-type: text/plain; charset=utf-8`, `cache-control: max-age=300`,
  `access-control-allow-origin: *`, and no `x-ratelimit-*` headers. An `OPTIONS` preflight to
  the same URL returned `403`.
- REST primary rate limits: authenticated users "5,000 requests per hour"; unauthenticated
  "60 requests per hour" per originating IP; GitHub App installations at least 5,000 per hour
  (plus 50 per repository beyond 20, capped at 12,500); `GITHUB_TOKEN` in Actions "1,000
  requests per hour per repository". Headers: `x-ratelimit-limit`, `x-ratelimit-remaining`,
  `x-ratelimit-used`, `x-ratelimit-reset`, `x-ratelimit-resource`. Secondary limits: no more
  than 100 concurrent requests; 900 points per minute for REST and 2,000 for GraphQL (GET/HEAD/
  OPTIONS 1 point, POST/PATCH/PUT/DELETE 5, GraphQL query 1, mutation 5); no more than 80
  content-generating requests per minute and 500 per hour; on exceeding, 403 or 429 and a
  `retry-after` header when present. The page does not state a different limit for private
  repositories; it says only that unauthenticated requests reach public data.
  Source: [REST rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api).
- GraphQL primary limit: "5,000 points per hour per user"; points are computed from the
  connections requested (sum of `first`/`last` per level, divided by 100, rounded), minimum 1;
  `rateLimit { limit cost remaining used resetAt }` reports it; secondary limit 2,000 points
  per minute. Source: [GraphQL limits](https://docs.github.com/en/graphql/overview/rate-limits-and-node-limits-for-the-graphql-api).
- Verified: `GET /rate_limit` for the `gh` token shows `core` 5000, `graphql` 5000, `search`
  30; `GET /repos/justinclayton/nvu-game` returns `"private": false` (the repo is public
  today) and an unauthenticated request to it shows `x-ratelimit-limit: 60`.
- API versions: `2026-03-10` and `2022-11-28` are the listed versions; "Requests without the
  `X-GitHub-Api-Version` header will default to use the `2022-11-28` version."
  Source: [API versions](https://docs.github.com/en/rest/about-the-rest-api/api-versions).
  Verified: `gh api` without the header gets `X-Github-Api-Version-Selected: 2022-11-28`, and
  the Projects v2 and sub-issue calls above still succeeded.

## Authentication from a local server

- `gh auth token` "outputs the authentication token for an account on a given GitHub host";
  `--hostname`, `--user` select host and account. Source: [gh auth token](https://cli.github.com/manual/gh_auth_token).
  Verified: on this machine it prints a `gho_` token.
- Token prefixes: `ghp_` personal access token (classic), `github_pat_` fine-grained PAT,
  `gho_` OAuth access token, `ghu_` GitHub App user access token, `ghs_` GitHub App
  installation access token. Source: [About authentication to GitHub](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-authentication-to-github).
  So the `gh` stored token is an OAuth token of the GitHub CLI OAuth app, governed by classic
  scopes.
- `gh auth login` minimum scopes: "`repo`, `read:org`, and `gist`"; `--scopes` adds more;
  credentials go to the system credential store, with fallback to "writing the token to a plain
  text file" (`--insecure-storage` forces that). "Favour setting `GH_TOKEN` for fine-grained
  personal access token usage." Source: [gh auth login](https://cli.github.com/manual/gh_auth_login).
  `gh auth refresh --scopes ...` expands "the permission scopes for stored credentials".
  Source: [gh auth refresh](https://cli.github.com/manual/gh_auth_refresh).
- `GH_TOKEN` / `GITHUB_TOKEN` (`GH_TOKEN` first) "takes precedence over previously stored
  credentials" for github.com. Source: [gh environment](https://cli.github.com/manual/gh_help_environment).
- Verified: this machine's `gh` token has scopes `gist, project, read:org, repo, workflow`
  (`gh auth status`), which covered every read above including user-owned Projects v2 REST and
  GraphQL.
- Classic scopes relevant to the list (verbatim): `repo` "Grants full access to public and
  private repositories including read and write access to code, commit statuses, ...";
  `repo:status` "Grants read/write access to commit statuses in public and private
  repositories."; `workflow` "Grants the ability to add and update GitHub Actions workflow
  files."; `project` "Grants read/write access to user and organization projects.";
  `read:project` "Grants read only access to user and organization projects."
  Source: [Scopes for OAuth apps](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps).
  REST docs for check runs, workflow runs, artifacts, dispatches and statuses say classic
  tokens need `repo` on a private repository (sources in the sections above).
- Fine-grained PAT: scoped to one owner's repositories with per-permission read/write;
  expiration 1 to 366 days or none, subject to org policy. Documented gaps, verbatim: "Using
  fine-grained personal access token to call the Checks API." and "Using fine-grained
  personal access token to access Projects owned by a user account."
  Source: [Managing your personal access tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens).
  The fine-grained permissions reference lists "Organization permissions for 'Projects'" and
  no user-level Projects heading, and does not list `GET .../commits/{ref}/check-runs`.
  Source: [Permissions required for fine-grained PATs](https://docs.github.com/en/rest/authentication/permissions-required-for-fine-grained-personal-access-tokens).
- Fine-grained PAT permissions for the rest of the list, from that reference: Issues (read for
  issue, sub-issue and dependency reads; write for labels/assignees), Pull requests (read for
  list/get/files; write for reviews), Contents (read for contents; write for merge), Actions
  (read for runs and artifacts; write for re-run), Commit statuses (read), Metadata (read).
  "All fine-grained personal access tokens include read access to public repositories."
  Source: [Forming calls with GraphQL](https://docs.github.com/en/graphql/guides/forming-calls-with-graphql).
- GitHub App: authenticate by signing a JWT (RS256, `iss` = client ID or app ID, `iat`
  recommended 60 s in the past, `exp` "no more than 10 minutes into the future") with the
  app's private key, then `POST /app/installations/{installation_id}/access_tokens`; "The
  installation access token will expire after 1 hour." and "will work with both the GraphQL API
  and the REST API." Sources: [Generating a JWT](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-a-json-web-token-jwt-for-a-github-app),
  [Authenticating as an installation](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/authenticating-as-a-github-app-installation).
- GitHub App permissions for the list: Issues read/write, Pull requests read/write, Contents
  read (contents) / write (merge), Actions read, Checks read for
  `GET .../commits/{ref}/check-runs`; Projects appears only as "Organization permissions for
  'Projects'". Source: [Permissions required for GitHub Apps](https://docs.github.com/en/rest/authentication/permissions-required-for-github-apps).
  "Repository permissions allow your app to access resources related to repositories that are
  owned by the account where the app is installed." Source: [Choosing permissions](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/choosing-permissions-for-a-github-app).
- Browser versus server: "The REST API supports cross-origin resource sharing (CORS) for AJAX
  requests from any origin." The preflight allows `Authorization, Content-Type` headers and
  `GET, POST, PATCH, PUT, DELETE`; `Access-Control-Allow-Origin: *`.
  Source: [Using CORS](https://docs.github.com/en/rest/using-the-rest-api/using-cors-and-jsonp-to-make-cross-origin-requests).
  Verified: `OPTIONS https://api.github.com/graphql` from `Origin: http://localhost:5173`
  returned 204 with `access-control-allow-origin: *`, `access-control-allow-headers`
  including `Authorization` and `X-GitHub-Api-Version`, and
  `access-control-allow-methods: GET, POST, PATCH, PUT, DELETE`. So nothing in the list is
  blocked by CORS for a browser; a browser call needs the bearer token present in the page.
- GraphQL endpoint is `https://api.github.com/graphql`, `POST` only, authenticated with "a
  personal access token, GitHub App, or OAuth app". Source: [Forming calls with GraphQL](https://docs.github.com/en/graphql/guides/forming-calls-with-graphql).

## Not established

- Which token types the Projects v2 REST endpoints accept (classic `project` scope, fine-grained
  PAT, GitHub App installation token): the three REST Projects pages name no scopes or
  permissions and carry no preview note. Only the `gh` OAuth token with `project` scope was
  verified.
- Whether a GitHub App installation token can read a user-owned Projects v2 project. The App
  permissions reference lists only "Organization permissions for 'Projects'"; the Projects
  guide says installation tokens work "for a GitHub App" without distinguishing owners;
  "Managing access to your projects" does not mention apps.
- Whether a fine-grained PAT can run the GraphQL `statusCheckRollup` query or the REST
  workflow-runs-by-`head_sha` read as a substitute for the Checks API it cannot call. Not
  tested (no fine-grained PAT on this machine) and not stated in the docs.
- Rate limits, caching semantics and CORS policy of `raw.githubusercontent.com`. No GitHub
  docs page was found that documents the raw host; only observed headers are reported above.
- Whether the artifact download redirect target (`*.blob.core.windows.net`) answers a browser
  preflight. Only the 302 from api.github.com was observed; this repo has no artifacts to
  test end to end.
- Whether `POST .../reviews` with `REQUEST_CHANGES` succeeds on a pull request authored by
  the same user as the token. Not in the REST docs; not tested because it writes.
- Rate limit differences for private repositories. The rate-limit page draws no such
  distinction, and the repo is public today (`"private": false`).
- The GitHub docs pages' per-endpoint "Fine-grained access tokens" subsections could not be
  read by the fetch tool; the permission mappings above come from the two
  permissions-reference pages instead.
