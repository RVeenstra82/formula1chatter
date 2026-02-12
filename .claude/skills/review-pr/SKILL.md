---
name: review-pr
description: Review a pull request for code quality, consistency, accessibility, and potential bugs.
argument-hint: "<PR number or URL>"
allowed-tools: Bash(git *), Bash(gh *)
---

Review a GitHub pull request thoroughly and post a structured review comment.

## Arguments
- `$ARGUMENTS` — PR number (e.g. `42`) or full GitHub PR URL

## Steps

1. **Determine PR number and repo:**
   - If a full URL is given, extract owner, repo, and PR number from it
   - If just a number is given, use the current repo (detect via `git remote get-url origin`)

2. **Fetch PR metadata:**
   - Use the GitHub MCP tool `get_pull_request` to get the PR title, description, base/head branches, and author
   - Use `get_pull_request_files` to get the full diff of all changed files

3. **Read the entire diff:**
   - The diff may be very large. Read the saved tool output file in sequential chunks (using Read with offset/limit) until 100% of the content has been reviewed
   - Do NOT skip any files — every changed file must be reviewed

4. **Analyze the changes looking for:**
   - **Consistency issues** — leftover patterns from before the change (e.g. old class names, old API calls, mixed conventions)
   - **Hardcoded values** — magic numbers, inline styles, or repeated values that should be constants/variables
   - **Accessibility concerns** — contrast ratios, missing ARIA attributes, keyboard navigation
   - **Code quality** — duplicated patterns that could be extracted, dead code, unused imports
   - **Potential bugs** — logic errors, missing error handling, race conditions, conflicting styles
   - **Missing coverage** — areas that should have been changed but were missed
   - **Security** — XSS, injection, exposed secrets, unsafe patterns

5. **Post the review on GitHub:**
   - Use `create_pull_request_review` MCP tool with event `COMMENT`
   - Structure the review body as:
     - **Critical** — must fix before merge
     - **Warnings** — should fix, potential issues
     - **Nits** — minor suggestions, style preferences
     - **Summary table** with severity counts
   - Include specific `file:line` references
   - End with an overall assessment

## Output
- Show the review summary to the user
- Provide the link to the review on GitHub

## Notes
- Always read 100% of the diff before writing the review
- Be specific — reference exact file names and line numbers
- Distinguish between pre-existing issues and issues introduced by the PR
- For styling PRs, pay special attention to consistency across all files
- For logic PRs, focus on edge cases and error handling
