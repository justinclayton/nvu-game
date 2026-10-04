# The self-hosted runner

Agent jobs in the [design loop](../../design/loop/spec.md) run on a GitHub
Actions runner on the designer's Mac mini. Use `runs-on: self-hosted` in a job
to land on it. Deterministic CI stays on `ubuntu-latest`.
The one exception is *Create printable kit*, which creates the playtest PDFs
here so every kit's PDFs come from the same machine with the same fonts. It fetches its own Chrome
for Testing into `~/.cache/nvu-game/chrome` the first time (`tools/find-chrome.sh`).

- **Install:** `~/actions-runner`, runner `Justins-Mac-mini-M2`, labels
  `self-hosted`, `macOS`, `ARM64`. Registered to this repo only.
- **Service:** a launchd agent,
  `~/Library/LaunchAgents/actions.runner.justinclayton-nvu-game.Justins-Mac-mini-M2.plist`.
  It starts at login and restarts if it crashes (`KeepAlive` on unsuccessful
  exit, added by hand to the plist `svc.sh` writes). Being a LaunchAgent, it
  runs only while `justin` is logged in, which is what lets jobs reach the
  login keychain that `gh` and `claude` use.
- **PATH:** jobs get the PATH in `~/actions-runner/.path`, which includes
  `~/.local/bin` for `claude` and `/opt/homebrew/bin` for `node` and `gh`.
  Edit it and restart the service after installing a tool somewhere new.
- **Logs:** `~/Library/Logs/actions.runner.justinclayton-nvu-game.Justins-Mac-mini-M2/`,
  plus `~/actions-runner/_diag/` for job-level detail.
- **Check it:** run the *Runner smoke test* workflow from the Actions tab.

Run these from `~/actions-runner`:

```bash
./svc.sh status
```

```bash
./svc.sh stop && ./svc.sh start
```

To re-register (new machine, or the runner was removed on GitHub): `./svc.sh
uninstall`, `./config.sh remove`, then `./config.sh` with a fresh token from
Settings → Actions → Runners, `./svc.sh install`, and re-add the `KeepAlive`
block to the plist.
