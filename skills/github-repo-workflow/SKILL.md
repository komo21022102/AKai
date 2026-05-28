---
name: github-repo-workflow
description: Use when a user wants Codex to read a GitHub repository, explain clone methods, clone a repo locally, inspect files, commit current local progress, or push commits to GitHub. Covers HTTPS, SSH, GitHub CLI, public/private access checks, and common push failures.
---

# GitHub Repo Workflow

Use this skill for practical GitHub repository handoffs: confirming access, cloning, listing files, committing local changes, and pushing to GitHub.

## Access Checks

Start with the least privileged check that matches the user's URL:

```bash
git ls-remote https://github.com/OWNER/REPO.git
```

For SSH URLs:

```bash
git ls-remote git@github.com:OWNER/REPO.git
```

If SSH returns `Permission denied (publickey)`, the current environment does not have an SSH key authorized for that repo. For public repos, switch to HTTPS. For private repos, ask the user to grant access through an SSH key, deploy key, GitHub CLI login, or HTTPS token.

If the user mentions GitHub CLI, check whether `gh` exists before relying on it:

```bash
gh repo view OWNER/REPO --json name,owner,visibility,url,defaultBranchRef
```

If `gh` is not installed, use Git HTTPS or SSH directly.

## Clone

Prefer HTTPS for public repos because it works without SSH setup:

```bash
git clone https://github.com/OWNER/REPO.git
```

If the destination directory already exists, inspect it before doing anything else:

```bash
git remote -v
git status --short
git branch --show-current
```

Never overwrite or delete an existing local project unless the user explicitly asks.

## Explain Clone Options

When the user asks about GitHub clone methods:

- HTTPS: easiest for public repos and temporary access; private repos need GitHub authentication or a token.
- SSH: best for long-term development after an SSH public key is added to GitHub; fails with `Permission denied (publickey)` when no authorized key is available.
- GitHub CLI: useful when `gh` is installed and logged in; it wraps GitHub auth and can clone, inspect PRs, issues, and repos.

## Inspect Files

Use fast file listing first:

```bash
rg --files
```

Then include hidden project files when relevant:

```bash
find . -maxdepth 3 -type f | sort
```

Summarize the meaningful project files. Avoid dumping `.git` internals unless they matter.

## Commit Current Progress

Before committing, confirm the repo, branch, remote, recent history, and changed files:

```bash
git status --short
git remote -v
git branch --show-current
git log --oneline -5
```

Review the change size and type:

```bash
git diff --stat
```

For binary changes, report the changed file and size/stat; do not try to print binary diffs.

Stage only the intended changed files:

```bash
git add PATH
git commit -m "Concise message"
```

Match the repository's existing commit message style where possible.

## Push

Before pushing, confirm whether the branch is ahead:

```bash
git status -sb
```

Push the current branch explicitly:

```bash
git push origin HEAD:BRANCH
```

After pushing, verify local and remote refs match:

```bash
git status -sb
git rev-parse --short HEAD
git rev-parse --short origin/BRANCH
```

## HTTP 400 During Push

If HTTPS push fails with output like:

```text
error: RPC failed; HTTP 400 curl 22 The requested URL returned error: 400
send-pack: unexpected disconnect while reading sideband packet
fatal: the remote end hung up unexpectedly
```

Check whether the remote actually advanced. If not, retry after setting a larger repo-local post buffer:

```bash
git fetch origin BRANCH
git status -sb
git config http.postBuffer 157286400
git push --verbose origin HEAD:BRANCH
```

This can avoid chunked transfer issues during HTTPS pushes.

## User-Facing Summary

When done, report:

- Local project path.
- Branch name.
- Commit hash and message, if a commit was created.
- Whether the push succeeded.
- Any important workaround applied, such as `http.postBuffer`.
