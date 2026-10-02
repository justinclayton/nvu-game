# Research: launching headless Claude Code from a local server

Ticket: [#235](https://github.com/justinclayton/nvu-game/issues/235), child of the Agentic GDLC map [#233](https://github.com/justinclayton/nvu-game/issues/233).
Facts only, each with its source. No recommendation. Read 2026-10-01 against Anthropic's
Claude Code docs (`code.claude.com/docs`), the Agent SDK TypeScript reference, the Claude
support centre, and `claude --help` from the Claude Code 2.1.239 binary installed on the
designer's machine. Where the docs say a flag needs a later version than 2.1.239, the note
says so.

Sources, short names used below:

| Tag | Page |
|---|---|
| [CLI] | https://code.claude.com/docs/en/cli-reference |
| [HEADLESS] | https://code.claude.com/docs/en/headless |
| [WORKTREES] | https://code.claude.com/docs/en/worktrees |
| [SUBAGENTS] | https://code.claude.com/docs/en/sub-agents |
| [AUTH] | https://code.claude.com/docs/en/authentication |
| [ERRORS] | https://code.claude.com/docs/en/errors |
| [ENV] | https://code.claude.com/docs/en/env-vars |
| [TROUBLE] | https://code.claude.com/docs/en/troubleshoot-install |
| [LEGAL] | https://code.claude.com/docs/en/legal-and-compliance |
| [SDK-TS] | https://code.claude.com/docs/en/agent-sdk/typescript |
| [SDK-QS] | https://code.claude.com/docs/en/agent-sdk/quickstart |
| [SDK-HOST] | https://code.claude.com/docs/en/agent-sdk/hosting |
| [SDK-SESS] | https://code.claude.com/docs/en/agent-sdk/sessions |
| [SDK-STREAM] | https://code.claude.com/docs/en/agent-sdk/streaming-output |
| [SDK-SUB] | https://code.claude.com/docs/en/agent-sdk/subagents |
| [SUP-PROMAX] | https://support.claude.com/en/articles/11145838-use-claude-code-with-your-pro-or-max-plan |
| [SUP-MAX] | https://support.claude.com/en/articles/11049741-what-is-the-max-plan |
| [SUP-SDK] | https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan |
| [SUP-LIMITS] | https://support.claude.com/en/articles/11647753-how-do-usage-and-length-limits-work |
| [LOCAL] | `claude --help`, `claude auth --help`, `claude auth status` on this machine, Claude Code 2.1.239 |

## 1. Invocation surface

### `claude -p` (CLI)

- `-p` / `--print` runs non-interactively: "Print response and exit (useful for pipes)". The workspace trust dialog is skipped in `-p` mode or whenever stdout is not a TTY, and settings files that fail validation are silently ignored. [LOCAL], [CLI]
- Minimal form: `claude -p "Find and fix the bug in auth.py" --allowedTools "Read,Edit,Bash"`. The prompt is the positional argument; stdin is also read and can be piped in (`cat build-error.txt | claude -p '...'`). Piped stdin is capped at 10 MB. [HEADLESS]
- `--output-format <text|json|stream-json>` (print mode only): `text` default, `json` "single result", `stream-json` "realtime streaming". [LOCAL], [HEADLESS]
- `--input-format <text|stream-json>` (print mode only). [LOCAL], [CLI]
- `--permission-mode <mode>`: the local binary lists `acceptEdits`, `auto`, `bypassPermissions`, `manual`, `dontAsk`, `plan` [LOCAL]; the docs list `default`, `acceptEdits`, `plan`, `auto`, `dontAsk`, `bypassPermissions`, with `manual` as an alias for `default`. [CLI]
- `--dangerously-skip-permissions` is "Equivalent to `--permission-mode bypassPermissions`". [CLI]
- A run where nothing sets a permission mode "takes the built-in starting permission mode, which can be `auto`, so pass the one you want". [HEADLESS]
- `dontAsk`: "Claude Code denies every call that would otherwise prompt, which is useful for locked-down CI runs." Reads in working directories, the read-only command set, and anything covered by `--allowedTools` or `permissions.allow` still run. [HEADLESS]
- `acceptEdits`: writes files without prompting and auto-approves `mkdir`, `touch`, `mv`, `cp`; other shell commands still need an `--allowedTools` entry or allow rule. Example: `claude -p "Apply the lint fixes" --permission-mode acceptEdits`. [HEADLESS]
- `--allowedTools` / `--allowed-tools <tools...>`: comma or space separated permission rules, e.g. `--allowedTools "Bash(git diff *),Bash(git log *),Bash(git status *),Bash(git commit *)"`. The trailing ` *` is prefix matching; `Bash(git diff*)` without the space would also match `git diff-index`. [HEADLESS], [CLI]
- `--disallowedTools` / `--disallowed-tools <tools...>`: a bare name removes the tool from Claude's context; a scoped rule such as `Bash(rm *)` leaves the tool and denies matching calls. [CLI]
- `--tools <tools...>`: restricts the built-in tool set (`""` for none, `"default"` for all, or names like `"Bash,Edit,Read"`). [LOCAL], [CLI]
- `--permission-prompts none`: "Pass `none` when nobody can answer, and Claude Code denies them instead." Requires Claude Code v2.1.259 or later [CLI], [HEADLESS]; the flag is absent from `claude --help` on the installed 2.1.239. [LOCAL]
- `--permission-prompt-tool <tool>`: an MCP tool that answers permission prompts in non-interactive mode. [CLI]
- Working directory: no `--cwd` flag exists in `claude --help` or the CLI reference; the session's working directory is the directory the process is started in. `--add-dir <directories...>` grants file access to extra directories but does not change the working directory and "doesn't discover most `.claude/` configuration from these directories". [LOCAL], [CLI]
- `--model <model>`: alias (`fable`, `opus`, `sonnet`) or full name; overrides the `model` setting and `ANTHROPIC_MODEL`. [LOCAL], [CLI]
- `--fallback-model <model>`: automatic fallback when the primary is overloaded or unavailable; comma-separated list; print mode only. [LOCAL]
- `--max-turns <n>` (print mode only): "Exits with an error when the limit is reached. No limit by default." [CLI]
- `--max-budget-usd <amount>` (print mode only): stops once the client-side cost estimate reaches the cap; subagent spend counts; totals restored by `--continue`/`--resume` do not. [CLI]
- `--append-system-prompt <prompt>` and `--append-system-prompt-file <path>` add to the default system prompt; `--system-prompt` replaces it. [CLI], [LOCAL]
- `--json-schema <schema>` with `--output-format json` returns validated structured output in the `structured_output` field; an invalid schema exits with `Error: --json-schema is not a valid JSON Schema`. [HEADLESS]
- `--bare`: skips hooks, skills, custom commands, subagents, plugins, MCP servers, auto memory, and `CLAUDE.md`; "In bare mode, Claude Code never reads OAuth credentials or the system keychain", so it needs `ANTHROPIC_API_KEY` or an `apiKeyHelper`. The docs note `--bare` "will become the default for `-p` in a future release". [HEADLESS], [LOCAL]
- Without `--bare`, "a `-p` session runs the hooks in a project's `.claude/settings.json` and connects the servers in its `.mcp.json`, even in a folder you've never trusted. A `-p` session shows no workspace trust dialog and no per-server approval prompt." [HEADLESS]
- `--settings <file-or-json>` overrides settings keys for the session; `--setting-sources user,project,local` chooses which settings files load. [LOCAL], [CLI]
- `--mcp-config <configs...>` loads MCP servers; with `-p` Claude Code waits up to `MCP_TIMEOUT` (30 s default) for them before the first turn. `--strict-mcp-config` ignores all other MCP configuration. [CLI], [LOCAL]
- `--agents <json>` defines subagents inline; with `--print` the value may be a path to a JSON file (v2.1.281+). [CLI]
- `-n` / `--name <name>` gives the session a display name, resumable with `claude --resume <name>`. [CLI], [LOCAL]
- `--bg` / `--background` "Can't be combined with `-p`/`--print`". [CLI], [HEADLESS]
- Sessions and resume:
  - `--session-id <uuid>` fixes the session ID up front (must be a valid UUID). [CLI], [LOCAL]
  - `-c` / `--continue` loads the most recent conversation in the current directory. Interactive `--continue` skips sessions created with `claude -p` or the SDK; `claude -p --continue` includes them. [CLI]
  - `-r` / `--resume <id|name|transcript path>` resumes a specific session; since v2.1.223 the ID is found "in any project on this machine", so the resume can run from a different directory. [CLI], [HEADLESS]
  - `--fork-session` with `--resume`/`--continue` creates a new session ID instead of continuing the original. [CLI], [LOCAL]
  - Capturing the ID for a later resume: `session_id=$(claude -p "Start a review" --output-format json | jq -r '.session_id')` then `claude -p "Continue that review" --resume "$session_id"`. [HEADLESS]
  - `--no-session-persistence` (print mode only) keeps the session off disk; `CLAUDE_CODE_SKIP_PROMPT_HISTORY=1` does the same in any mode. [CLI], [ENV]
- Slash commands in `-p`: user skills and custom commands expand when included in the prompt string (`/skill-name`); `/login` and other terminal-only commands are unavailable; `/model sonnet`, `/effort`, `/config key=value` take arguments (v2.1.205+). [HEADLESS]

### Claude Agent SDK (TypeScript)

- Package `@anthropic-ai/claude-agent-sdk`; prerequisites Node.js 18+. `npm install @anthropic-ai/claude-agent-sdk`. [SDK-QS]
- The SDK "bundles a native Claude Code binary for your platform as an optional dependency such as `@anthropic-ai/claude-agent-sdk-darwin-arm64`... The SDK version tracks the bundled Claude Code version. SDK v0.3.191 bundles Claude Code v2.1.191". If optional dependencies were skipped, set `pathToClaudeCodeExecutable` to a separately installed `claude`. [SDK-TS]
- "One agent session maps to one subprocess. Running N concurrent sessions means N subprocesses, each with its own process tree and transcript file. By default they all inherit your application's working directory." [SDK-HOST]
- Entry point:

  ```typescript
  function query({ prompt, options }: {
    prompt: string | AsyncIterable<SDKUserMessage>;
    options?: Options;
  }): Query;
  ```

  `Query extends AsyncGenerator<SDKMessage, void>`. [SDK-TS]
- Minimal example:

  ```typescript
  import { query } from "@anthropic-ai/claude-agent-sdk";

  for await (const message of query({
    prompt: "Review utils.py for bugs that would cause crashes. Fix any issues you find.",
    options: { allowedTools: ["Read", "Edit", "Glob"], permissionMode: "acceptEdits" }
  })) {
    if (message.type === "result") console.log(`Done: ${message.subtype}`);
  }
  ```

  [SDK-QS]
- `Options` fields (name, type, default), from the reference table [SDK-TS]:
  - `cwd: string`, default `process.cwd()`. Per-session isolation is done by passing a distinct `cwd` to each `query()`: `options: { cwd: "/work/session-a" }`. [SDK-HOST]
  - `model: string`, default from CLI.
  - `permissionMode: PermissionMode` = `"default" | "acceptEdits" | "bypassPermissions" | "plan" | "dontAsk" | "auto"`; if omitted "the session can start in auto mode".
  - `permissionPrompts: 'host' | 'none'`, default `'host'` (routes prompts to `canUseTool` or `permissionPromptToolName`); `'none'` denies them. Requires Claude Code v2.1.259+.
  - `canUseTool`: callback invoked only when the permission flow falls through to a prompt.
  - `allowedTools: string[]`, `disallowedTools: string[]`, `tools: string[] | { type: 'preset'; preset: 'claude_code' }`.
  - `additionalDirectories: string[]`, passed to Claude Code as `--add-dir`.
  - `maxTurns: number`; `maxBudgetUsd: number`.
  - `systemPrompt`: a string, or `{ type: 'preset', preset: 'claude_code', append?: string }` to use Claude Code's own prompt plus additions; default is a minimal prompt.
  - `settingSources: SettingSource[]`, default all; `[]` disables user, project, and local settings.
  - `resume: string` (session ID), `continue: boolean`, `forkSession: boolean`, `sessionId: string` (UUID), `persistSession: boolean` (default `true`).
  - `abortController: AbortController`, default a fresh one.
  - `includePartialMessages: boolean`, default `false`.
  - `env: Record<string, string | undefined>`, default `process.env`; "When set, this replaces the subprocess environment instead of merging with `process.env`, so pass `{ ...process.env, YOUR_VAR: 'value' }` to keep inherited variables like `PATH`."
  - `stderr: (data: string) => void`.
  - `pathToClaudeCodeExecutable: string`; `executable: 'bun' | 'deno' | 'node'`.
  - `spawnClaudeCodeProcess: (options: SpawnOptions) => SpawnedProcess` to run Claude Code in a VM, container, or remote host.
  - `projectConfigRoot: string` (v2.1.275+): "Absolute path of the trusted checkout that `cwd` is a worktree of. Claude Code reads project settings, `.mcp.json`, and the project's `.claude/` commands, agents, skills, workflows, routines, and output styles from this directory instead of `cwd`, and sets `CLAUDE_PROJECT_DIR` to it."
  - `forwardSubagentText: boolean`, `hooks`, `mcpServers`, `agents`, `managedSettings` also exist.
- Resume example: `query({ prompt: "...", options: { resume: sessionId, allowedTools: [...] } })`; fork: `options: { resume: sessionId, forkSession: true }`, and the fork's ID is read from the `system`/`init` message's `session_id`. "A single-shot `query()` throws after yielding an error result." [SDK-SESS]
- `startup()` pre-spawns the subprocess and completes the initialize handshake so a later `query()` on the returned `WarmQuery` pays no spawn cost; `prewarm()` does the same without a known `cwd`. A spare "holds roughly 230 to 260 MB of memory while it waits". [SDK-TS]

## 2. Output stream and cancellation

### stream-json (CLI)

- `claude -p "Explain recursion" --output-format stream-json --verbose --include-partial-messages`: "Each line is a JSON object representing an event... The last line of the stream is a `result` message with the final response text, cost, and session metadata." [HEADLESS]
- `--include-partial-messages` "Requires `--print` and `--output-format stream-json`"; `--verbose` is used alongside in every documented streaming example. [CLI], [HEADLESS]
- Token-level filter example: `jq -rj 'select(.type == "stream_event" and .event.delta.type? == "text_delta") | .event.delta.text'`. [HEADLESS]
- Event types named in the docs: `system`/`init` (first event, "reports session metadata including the model, tools, MCP servers, and loaded plugins"; carries `capabilities`, `plugins`, `plugin_errors`, `mcp_servers`, `mcp_server_errors`); `system`/`api_retry` (fields `attempt`, `max_retries`, `retry_delay_ms`, `error_status`, `error` category such as `rate_limit`, `overloaded`, `authentication_failed`); `system`/`plugin_install`; `assistant` and `user` messages whose `parent_tool_use_id` is the spawning tool call for subagent messages and `null` for the main conversation; `stream_event` partial deltas; `permission_denied` system messages; `result`. [HEADLESS]
- `--include-hook-events` adds hook lifecycle events to the stream; `--forward-subagent-text` adds subagent text and thinking blocks (v2.1.211+). [LOCAL], [CLI]
- The `json` output is one object with the text in `result`, plus `session_id`, `total_cost_usd`, a per-model cost breakdown, and usage; `jq -r '.result'` extracts the text. Both cost figures are "client-side estimates and can differ from your actual bill". [HEADLESS]
- Exit status: "Claude Code exits with code 0 on success and a non-zero code when the run fails... If you pass an invalid flag, Claude Code reports the error to stderr before the run starts. When a failure happens inside the run, such as missing authentication, Claude Code prints the failure as the result on stdout." [HEADLESS]
- If the consumer reads slowly, "Claude Code waits for the queued output to drain before exiting... capped at 30 seconds." [HEADLESS]
- `--input-format stream-json` accepts user messages on stdin for a multi-turn run; `--replay-user-messages` echoes them back on stdout for acknowledgment. With `--max-turns`, a message still queued when the limit ends a turn starts a new turn with its own limit. [LOCAL], [CLI]
- Background work at exit: a background Bash task is killed about five seconds after the final result; a background subagent or workflow keeps `claude -p` open until it completes, with a default idle ceiling of 10 minutes (`CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS`, `0` = no ceiling). [HEADLESS], [ENV]
- If the working directory is deleted mid-run, the session keeps running, emits a warning message in `stream-json`, and shell commands fail until the directory exists again. [HEADLESS]

### SDK message types

- The `SDKMessage` union includes `SDKAssistantMessage`, `SDKUserMessage`, `SDKResultMessage`, `SDKSystemMessage`, `SDKPartialAssistantMessage`, `SDKCompactBoundaryMessage`, `SDKPermissionDeniedMessage`, `SDKAPIRetryMessage`, `SDKRateLimitEvent`, `SDKToolProgressMessage`, `SDKTaskNotificationMessage`, `SDKHookStartedMessage`, `SDKInformationalMessage`, and others. [SDK-TS]
- `SDKSystemMessage`: `type: "system"`, `subtype: "init"`, with `session_id`, `cwd`, `tools`, `mcp_servers`, `model`, `permissionMode`, `apiKeySource`, `claude_code_version`, `plugins`, `plugin_errors?`, `capabilities?`, `effort?`. [SDK-TS]
- `SDKResultMessage` success variant: `type: "result"`, `subtype: "success"`, `session_id`, `duration_ms`, `duration_api_ms`, `is_error`, `num_turns`, `result: string`, `stop_reason`, `total_cost_usd`, `usage`, `modelUsage`, `permission_denials`, `structured_output?`, `terminal_reason?`. Error variant subtypes: `"error_max_turns" | "error_during_execution" | "error_max_budget_usd" | "error_max_structured_output_retries"`, with `errors` text and, for refused worktree resumes, `startup_failure_reason` (`worktree_unverified` or `worktree_resume_refused`). [SDK-TS], [WORKTREES]
- `SDKPartialAssistantMessage`: `type: "stream_event"`, `event: BetaRawMessageStreamEvent`; only emitted when `includePartialMessages` is `true`, and only for the main session (`parent_tool_use_id` is always `null`). Consumer code: `if (message.type === "stream_event" && message.event.type === "content_block_delta" && message.event.delta.type === "text_delta") process.stdout.write(message.event.delta.text)`. [SDK-TS], [SDK-STREAM]
- `SDKRateLimitEvent`: `type: "rate_limit_event"`, `rate_limit_info.status: "allowed" | "allowed_warning" | "rejected"`, `resetsAt?`, `utilization?`, `errorCode?: "credits_required"` ("the rejection is from a claude.ai subscription whose included usage is exhausted"). Requires v2.1.181+. [SDK-TS]
- `SDKAssistantMessage.aborted` is `true` when an interrupt or abort truncated the message (SDK v0.3.214+). [SDK-TS]

### Cancelling a run

- SIGTERM to a `claude -p` process: "Claude Code exits with code 143. Claude Code leaves the turn that was in progress unfinished and records no result for it. To end the turn instead, send SIGINT, or call the Agent SDK's `interrupt()`, before you stop the process." On SIGTERM it kills the process tree of any running Bash command, runs `SessionEnd` hooks, starts no new tool call or model request, and leaves an unanswered permission prompt unanswered. [HEADLESS]
- On resume after an interrupted turn, "Claude Code leaves the interrupted turn as it is, and your next prompt drives the conversation"; `CLAUDE_CODE_RESUME_INTERRUPTED_TURN=1` makes it continue the interrupted turn instead (`CLAUDE_CODE_RESUME_INTERRUPTED_TURN_MAX_AGE_MS` bounds how old the transcript may be). [HEADLESS], [ENV]
- SDK: `Query.interrupt()` "Interrupts the query. Only available in streaming input mode"; on CLIs v2.1.205+ it resolves with a receipt listing still-queued messages. `Query.close()` "Close the query and terminate the underlying process. Forcefully ends the query and cleans up all resources." `Options.abortController` is the cancellation handle; with a custom `spawnClaudeCodeProcess`, "The SDK first closes the process's stdin and waits about two seconds so the CLI can shut down cleanly, then aborts this signal." `AbortError` "is the only error class in the SDK's typed API." [SDK-TS]
- When the SDK closes a session that is waiting on a permission prompt, "the SDK ends Claude Code's input before sending any signal, and Claude Code cancels the prompt as soon as the input ends." [HEADLESS]

## 3. Worktrees

- `-w` / `--worktree [name]`: "Start Claude in an isolated git worktree at `<repo>/.claude/worktrees/<name>`. If you don't give a name, Claude Code generates one." The branch is named `worktree-<name>`; a generated name looks like `bright-running-fox`. [CLI], [WORKTREES], [LOCAL]
- `--worktree` with `-p`: "Non-interactive runs with `-p` skip the trust check, so `claude -p --worktree` proceeds without it." [WORKTREES]
- Base branch: default `worktree.baseRef: "fresh"` branches from the remote default branch (`origin/HEAD`, fetched if older than 24 h, capped at five seconds); `"head"` branches from the current local `HEAD`. A branch name is not accepted; "To start a worktree from a specific existing branch, create it with git directly." [WORKTREES]
- Reusing a name: "Passing `--worktree` a name whose directory already exists opens that existing worktree instead of creating a new one"; a clean, unmodified worktree on its original branch resets to the default branch when reopened. [WORKTREES]
- `.worktreeinclude` (gitignore syntax) copies gitignored files such as `.env` into every new worktree. [WORKTREES]
- Cleanup, interactive: on exit Claude checks for changed or untracked files and new commits; an unnamed clean worktree and its branch are removed automatically; a named session or a dirty worktree prompts. [WORKTREES]
- Cleanup, headless: "Non-interactive runs with `-p` have no exit prompt, so Claude doesn't clean up their worktrees, and Claude Code leaves the lock it took on each one at creation in place until a later session's stale-lock sweep releases it. To remove one, run `git worktree remove`; if git refuses because the worktree is locked, run `git worktree unlock` on it first." [WORKTREES]
- Locks: "While an agent is running, Claude Code holds a `git worktree lock` on its worktree so that concurrent cleanup can't remove it, and releases the lock when the agent finishes." The periodic sweep "also releases a lock Claude Code set for a session whose process has exited" and "never releases a lock you set yourself". [WORKTREES]
- The periodic sweep removes subagent and background-session worktrees older than `cleanupPeriodDays`, but keeps a worktree that holds changed or untracked files or unpushed commits, one created by hand with `git worktree add`, or one lacking the marker Claude Code writes into the git metadata of worktrees it creates. [WORKTREES]
- Resume into a worktree: a resumed session (interactive, `-p --resume`/`--continue`, or SDK) is returned to its worktree; `--fork-session` starts in the launch directory instead; a deleted worktree makes the session continue in the launch directory and clears the binding. In `-p` and SDK resumes, every other refusal stops the resume with a stderr error and, under `stream-json`, a `result` with `subtype: "error_during_execution"` and `startup_failure_reason` of `worktree_unverified` or `worktree_resume_refused` (v2.1.260+/v2.1.274+). [WORKTREES]
- Isolation enforcement inside a worktree session: Claude Code blocks `Edit`/`Write` to the main checkout, Bash commands whose cwd resolves to the main checkout, git redirects into it (`git -C`, `GIT_DIR`, `cd`), and commands whose text it cannot verify. [WORKTREES]
- Hooks: `${CLAUDE_PROJECT_DIR}` stays at the launch project root; the hook input's `cwd` field is the worktree root. [WORKTREES]
- Subagents: `isolation: worktree` in a subagent's frontmatter runs it in "a temporary git worktree... branched by default from your default branch... The worktree is automatically cleaned up if the subagent makes no changes"; a worktree with changes stays until the sweep can remove it. The Agent tool can also pass `isolation: "worktree"` on a call. [SUBAGENTS], [WORKTREES]
- `EnterWorktree` and `ExitWorktree` are tools Claude can call mid-session; entering a path outside `.claude/worktrees/` asks for approval, and only `bypassPermissions` skips that prompt. [WORKTREES]
- `WorktreeCreate` / `WorktreeRemove` hooks replace the git logic entirely, including placing worktrees elsewhere; the hook reads `name` from stdin JSON and prints the directory path. [WORKTREES]
- Shared across worktrees of one repo: the `.git` directory, project-scope plugins, and permission approvals ("Yes, and don't ask again" saves to the main checkout's `.claude/settings.local.json`). [WORKTREES]
- The SDK has no worktree option. Its reference mentions worktrees only via `projectConfigRoot` (the trusted checkout a `cwd` worktree belongs to), the `includeWorktrees` flag of the session-listing helper, the `WorktreeCreate`/`WorktreeRemove` hook inputs, and the `startup_failure_reason` values. The hosting guide's isolation mechanism is a distinct `cwd` per `query()`. [SDK-TS], [SDK-HOST]
- Observed on this machine: the subagent worktrees created by Claude Code 2.1.239 for this ticket's siblings sit at `.claude/worktrees/agent-<17 hex chars>` and show `locked` in the worktree listing. [LOCAL]

## 4. Subscription login from a non-interactive process

- Credential precedence, in order: (1) cloud provider credentials when `CLAUDE_CODE_USE_BEDROCK`/`_VERTEX`/`_FOUNDRY` is set; (2) `ANTHROPIC_AUTH_TOKEN`; (3) `ANTHROPIC_API_KEY` ("In non-interactive mode (`-p`), the key is always used when present"); (4) `apiKeyHelper` script; (5) `CLAUDE_CODE_OAUTH_TOKEN`; (6) Anthropic profile and federation credentials; (7) "Subscription OAuth credentials from `/login`. This is the default for Claude Pro, Max, Team, and Enterprise users." [AUTH]
- Where the `/login` credential is stored: "On macOS, credentials are stored in the encrypted macOS Keychain. When the Keychain rejects the write, such as when it's locked in an SSH session, Claude Code stores your login in `~/.claude/.credentials.json` with file mode `0600` instead". `CLAUDE_CONFIG_DIR` relocates the file and keys a separate Keychain entry, so different config dirs are different logins. [AUTH]
- "Parallel sessions on one machine share a saved login and coordinate its renewal so that only one process refreshes the token at a time." [TROUBLE]
- `claude setup-token`: "Generate a long-lived OAuth token for CI and scripts. Prints the token to the terminal without saving it. Requires a Claude subscription." The token is one-year, "authenticates with your Claude subscription and requires a Pro, Max, Team, or Enterprise plan. It can only make model requests, so it can't establish Remote Control sessions or fetch claude.ai connectors." Set it as `CLAUDE_CODE_OAUTH_TOKEN`. [CLI], [AUTH]
- `CLAUDE_CODE_OAUTH_TOKEN`: "OAuth access token for claude.ai authentication. Alternative to `/login` for SDK and automated environments. Takes precedence over keychain-stored credentials... To replace an expired token, generate a new one and restart." [ENV]
- `--bare` reads neither the Keychain nor `CLAUDE_CODE_OAUTH_TOKEN`: "If your script passes `--bare`, authenticate with `ANTHROPIC_API_KEY` or an `apiKeyHelper` instead." [AUTH], [HEADLESS]
- `apiKeyHelper`, `ANTHROPIC_API_KEY`, and `ANTHROPIC_AUTH_TOKEN` "apply to the CLI and the surfaces that wrap it, including the VS Code extension, the Agent SDK, and GitHub Actions." [AUTH]
- `claude auth status` prints JSON (`--text` for prose) and "Exits with code 0 if logged in, 1 if not"; `claude auth login` has `--claudeai` (default), `--console`, `--sso`, `--email`. [CLI], [LOCAL]
- What breaks: with no usable credential the run fails with `Not logged in · Please run /login`, printed as the result on stdout with a non-zero exit. An expired login that cannot be refreshed fails every request with `Login expired · Please run /login`. [ERRORS], [HEADLESS]
- Unattended runs and expiry: "Renewing early matters most for sessions that run unattended. A background session in agent view or a Remote Control session that outlives the login stops making progress once the credential expires and can't recover until you sign in again." A startup warning appears when the login is within three days of expiring. [AUTH]
- A stray `ANTHROPIC_API_KEY` in the environment overrides the subscription login in `-p` mode without a prompt; "Run `unset ANTHROPIC_API_KEY` to fall back to your subscription". [AUTH], [TROUBLE]
- The SDK reads credentials from the environment of the process that runs it and "doesn't load `.env` files automatically"; the quickstart's documented path is `ANTHROPIC_API_KEY`. [SDK-QS]
- Policy: "OAuth authentication is intended exclusively for purchasers of Claude Free, Pro, Max, Team, and Enterprise subscription plans and is designed to support ordinary use of Claude Code and other native Anthropic applications." Developers "building products or services that interact with Claude's capabilities, including those using the Agent SDK, should use API key authentication... Anthropic does not permit third-party developers to offer Claude.ai login into their own applications, or to route requests through Free, Pro, or Max plan credentials on behalf of their users." The same page adds that this does not "prevent an end user from signing in to the unmodified Claude Code binary with their own Claude subscription". [LEGAL]
- The SDK quickstart repeats: "Unless previously approved, Anthropic does not allow third party developers to offer claude.ai login or rate limits for their products, including agents built on the Claude Agent SDK." [SDK-QS]
- The support article on using the Agent SDK with a Claude plan says that, as of 15 June 2026, a planned separate monthly SDK credit is paused and "Claude Agent SDK, `claude -p`, and third-party app usage still draw from your subscription's usage limits". [SUP-SDK]
- Observed on this machine: `claude auth status` run from a sandboxed, non-TTY Bash subprocess returned `{"loggedIn": false, "authMethod": "none", "apiProvider": "firstParty"}` while the designer's interactive sessions are logged in. The cause (sandbox Keychain access, or a per-process environment difference) was not determined; see Not established. [LOCAL]

## 5. Concurrency and rate limits

- Subscription allowances: "Your session-based usage limit will reset every five hours"; Max plans "also have a weekly usage limit that applies across all models", resetting at a fixed weekly time per account; Max 5x and Max 20x are five and twenty times the Pro per-session allowance. [SUP-MAX]
- "Your usage of all different Claude product surfaces (claude.ai, Claude Code, Claude Desktop) counts towards the same usage limit." [SUP-LIMITS] "all activity in both tools counts against the same usage limits" for Claude and Claude Code. [SUP-PROMAX]
- "Advertised usage limits for Pro and Max plans assume ordinary, individual usage of Claude Code and the Agent SDK." [LEGAL]
- When a limit is hit: `You've hit your session limit · resets 3:45pm`, `You've hit your weekly limit · resets Mon 12:00am`, or per-model `Opus`/`Sonnet` limits. "The session and weekly limits are shared across all models, so switching models doesn't restore access." "Usage counts against the session and weekly allowances at the same time. A single burst of heavy activity, such as a large workflow fanout, can exhaust the weekly allowance before the session window resets." `/usage` shows plan windows and reset times. [ERRORS]
- Automatic wait-and-continue at a usage limit is an interactive-session feature (v2.1.234+); the docs describe it only for an open interactive session and the Desktop app. [ERRORS]
- In headless runs the rate limit surfaces as a `system`/`api_retry` event with `error: "rate_limit"` (CLI) or an `SDKAPIRetryMessage` / `SDKRateLimitEvent` (SDK). [HEADLESS], [SDK-TS]
- Retry controls: `CLAUDE_CODE_MAX_RETRIES` (default 10, capped at 15); `CLAUDE_CODE_RETRY_WATCHDOG=1` "for unattended sessions such as eval harnesses, CI jobs, or remote workers. Retries `429` and `529` capacity errors indefinitely... The watchdog backs off up to 5 minutes between attempts, or until the limit resets when the response carries a rate-limit reset time, so a session that hits a usage limit waits out the remaining window." It fails at once on a 429 that reports a spend limit or exhausted usage credits. [ENV], [ERRORS]
- Intra-session parallelism: `CLAUDE_CODE_MAX_TOOL_USE_CONCURRENCY` "Maximum number of read-only tools and subagents that can execute in parallel (default: 10)"; the 429 guidance is to lower it, "avoid running many parallel subagents, or switch to a smaller model". `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS` caps subagents per session (default 20, v2.1.217+). [ENV], [ERRORS]
- Across sessions: the SDK hosting guide bounds concurrency by host RAM ("agents per host = (host RAM - overhead) / (per-session RAM ceiling)", with 1 GiB RAM, 5 GiB disk and 1 CPU per agent as a starting point) and notes "Large parallel-subagent fanouts can hit rate limits. Break work into smaller batches rather than issuing one wide dispatch." No per-account cap on simultaneous sessions is documented. [SDK-HOST]
- Spend caps available per run: `--max-budget-usd` / `maxBudgetUsd` (client-side estimate; result subtype `error_max_budget_usd` when hit) and `--max-turns` / `maxTurns`. [CLI], [SDK-TS]

## Not established

- Any numeric limit on how many headless or SDK sessions one Pro/Max account may run at once. The docs only state that all surfaces draw from one shared allowance and that parallel fanouts can hit rate limits.
- Whether a `claude -p` run launched by launchd (or any process without the user's login session) can read the macOS Keychain entry written by `/login`. The docs cover the SSH-locked-Keychain fallback to `~/.claude/.credentials.json` and the `CLAUDE_CODE_OAUTH_TOKEN` alternative, but say nothing about launchd. The local observation (`loggedIn: false` from a sandboxed subprocess) was not diagnosed.
- Whether a local server that spawns `claude -p` under the designer's own subscription login, for the designer's own use, falls inside "ordinary, individual usage". The legal page defines what third-party developers may not do and what an end user may do with the unmodified binary; it does not address this exact case.
- The documented exit code for a `-p` run that ends on `--max-turns`, `--max-budget-usd`, a usage limit, or `Not logged in`, beyond "non-zero".
- The exact JSON shape of the CLI `result` line under `--output-format json`/`stream-json` from a primary example; the field list above is from the SDK's `SDKResultMessage` type, which the headless page cross-references for the same protocol.
- Whether `--permission-prompts none` and `permissionPrompts: 'none'` exist on the installed 2.1.239; the docs require v2.1.259 and the local `--help` does not list the flag.
- The name-generation rule for unnamed `--worktree` sessions (the docs give one example, `bright-running-fox`) and for subagent worktrees (observed `agent-<hex>` locally, undocumented).
- Agent SDK rate-limit behaviour specific to subscription OAuth (as opposed to API keys) beyond the `credits_required` rejection code.
