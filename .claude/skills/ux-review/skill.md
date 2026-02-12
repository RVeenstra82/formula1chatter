---
name: ux-review
description: Open the app in a browser and review it for UI/UX improvements. Use when you want a visual audit of the application.
argument-hint: "[page or area to focus on, e.g. 'predictions', 'leaderboard', or leave empty for full review]"
allowed-tools: mcp__playwright__*, Bash(curl *), Bash(lsof *)
---

Open the running application in a headless browser, navigate through every page, take screenshots, and produce a structured UI/UX review with concrete improvement suggestions.

## Prerequisites
- The application must be running locally (`npm run dev` or equivalent)
- The Playwright MCP server must be available

## Arguments
- `$ARGUMENTS` — (optional) A specific page or area to focus on. Leave empty for a full-app review.

## Steps

1. **Verify the app is running:**
   - Check that the frontend dev server is reachable (try `curl -s -o /dev/null -w "%{http_code}" http://localhost:5173`)
   - If not on 5173, try 5174
   - If not running, inform the user and stop

2. **Navigate to the app:**
   - Use `browser_navigate` to open the app URL
   - Take a snapshot with `browser_snapshot` to understand the page structure

3. **Review pages systematically:**
   If no specific area is given, visit ALL of these pages in order:
   - **Home / Landing page** — first impression, call to action
   - **Race schedule** — list layout, readability, race cards
   - **Prediction form** — form usability, driver selection, feedback
   - **Leaderboard** — table layout, ranking clarity
   - **User profile / auth states** — logged-in vs logged-out experience
   - **Mobile viewport** (resize to 375x812) — responsive design check

   If a specific area is given, focus on that area but still check mobile.

4. **For each page, evaluate:**
   - **Visual hierarchy** — Is the most important content prominent? Are headings clear?
   - **Spacing & alignment** — Consistent margins/padding? Elements properly aligned?
   - **Color & contrast** — Text readable? Sufficient contrast ratios? Dark theme consistency?
   - **Typography** — Font sizes appropriate? Line heights readable? Text truncation?
   - **Interactive elements** — Buttons clearly clickable? Hover/focus states? Loading states?
   - **Empty states** — What happens when there's no data? Any blank screens?
   - **Error states** — Are errors clearly communicated? Recovery path obvious?
   - **Responsiveness** — Does it work at mobile, tablet, and desktop widths?
   - **Navigation** — Is it clear how to move between pages? Active state visible?
   - **Accessibility** — Tab order logical? Contrast sufficient? Labels present?
   - **Performance feel** — Any visible jank, layout shifts, or slow loads?
   - **i18n** — Any hardcoded text that should be translated?

5. **Take screenshots:**
   - Save all screenshots to the `screenshots/` directory in the project root
   - Use descriptive filenames like `screenshots/ux-review-{page}-{viewport}.png`
   - Take a screenshot of each page at desktop width (1280x800)
   - Take a screenshot of key pages at mobile width (375x812)
   - Reference screenshots in the report

6. **Produce the review report:**
   Structure findings by severity:

   ### Critical (blocks usability)
   - Issues that prevent users from completing core tasks

   ### Improvements (should fix)
   - Issues that degrade the experience but don't block functionality

   ### Suggestions (nice to have)
   - Polish items, minor visual tweaks, consistency improvements

   ### What's Working Well
   - Positive observations to keep

   For each finding, include:
   - **What:** Clear description of the issue
   - **Where:** Page and element location
   - **Why it matters:** Impact on user experience
   - **Suggestion:** Concrete fix recommendation

## Output
- Present the full review report to the user
- List all screenshots taken with their paths
- Provide a prioritized summary of top 5 improvements

## Notes
- Be specific — reference exact elements, colors, spacing values
- Compare against modern F1-themed design patterns
- Consider both first-time visitors and returning users
- Test with both authenticated and unauthenticated states when possible
- If the app has Dutch/English toggle, check both languages
