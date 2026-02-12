---
name: branch
description: Create a new feature/fix/chore branch from main. Use at the start of any new task.
argument-hint: "<description> (e.g. 'add driver photos' or 'fix/login-error')"
allowed-tools: Bash(git *)
---

Create a new git branch for a feature, fix, or chore and switch to it.

## Arguments
- `$ARGUMENTS` — short description of the work (required)

## Steps

1. Ensure the working tree is clean. If there are uncommitted changes, warn the user and stop.
2. Fetch latest from origin: `git fetch origin`
3. Determine the branch name from the arguments:
   - If the argument already includes a prefix like `feature/`, `fix/`, or `chore/`, use it as-is
   - Otherwise, infer the prefix based on the description:
     - Use `fix/` if the description contains words like "fix", "bug", "error", "broken"
     - Use `chore/` if it contains "cleanup", "refactor", "update deps", "rename"
     - Otherwise default to `feature/`
   - Convert the description to kebab-case (lowercase, spaces/underscores to hyphens)
   - Example: "add driver photos" → `feature/add-driver-photos`
4. Create and switch to the branch from `origin/main`: `git checkout -b <branch-name> origin/main`
5. Confirm success and show the branch name.

## Output
- Show the new branch name
- Remind the user: "When done, commit your changes and I can create a PR to main."
