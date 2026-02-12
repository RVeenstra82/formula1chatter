---
name: ux-review
description: Open the app in a browser and review it for UI/UX improvements. Use when you want a visual audit of the application.
argument-hint: "[page or area to focus on, e.g. 'predictions', 'leaderboard', or leave empty for full review]"
allowed-tools: mcp__chrome-devtools__*, Bash(curl *), Bash(lsof *)
---

Open the running application in Chrome, navigate through every page, run performance traces, check for console errors and network issues, and produce a structured UI/UX review with concrete improvement suggestions.

## Prerequisites
- The application must be running locally (`npm run dev` or equivalent)
- The Chrome DevTools MCP server must be connected (a Chrome browser must be open)

## Arguments
- `$ARGUMENTS` — (optional) A specific page or area to focus on. Leave empty for a full-app review.

## Steps

1. **Verify the app is running:**
   - Check that the frontend dev server is reachable (try `curl -s -o /dev/null -w "%{http_code}" http://localhost:5173`)
   - If not on 5173, try 5174
   - If not running, inform the user and stop

2. **Set up the browser:**
   - Use `list_pages` to see open pages, then `select_page` or `new_page` to open the app URL
   - Use `resize_page` to set desktop viewport (1280x800)
   - Take an initial `take_snapshot` to understand the page structure

3. **Review pages systematically:**
   If no specific area is given, visit ALL of these pages in order:
   - **Home / Landing page** — first impression, call to action
   - **Race schedule** — list layout, readability, race cards
   - **Prediction form** — form usability, driver selection, feedback
   - **Leaderboard** — table layout, ranking clarity
   - **User profile / auth states** — logged-in vs logged-out experience
   - **Mobile viewport** — responsive design check (see step 6)

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
   - **Accessibility** — Tab order logical? Contrast sufficient? Labels present? (use `take_snapshot` with `verbose: true` for full a11y tree)
   - **Performance feel** — Any visible jank, layout shifts, or slow loads?
   - **i18n** — Any hardcoded text that should be translated?

5. **Performance analysis (on key pages):**
   Run a performance trace on the most important page (usually home or race schedule):
   - Navigate to the target page with `navigate_page`
   - Start a trace with `performance_start_trace` (set `reload: true`, `autoStop: true`)
   - Review the trace results for Core Web Vitals (LCP, CLS, INP)
   - Use `performance_analyze_insight` to drill into any highlighted issues (e.g., LCPBreakdown, DocumentLatency, RenderBlocking, LayoutShifts)
   - Report CWV scores and any performance insights found

6. **Console & network checks:**
   After visiting each page:
   - Use `list_console_messages` (filter `types: ["error", "warn"]`) to catch JavaScript errors and warnings
   - Use `list_network_requests` to check for failed requests (4xx/5xx), slow responses, or oversized payloads
   - Report any issues found with request details

7. **Mobile & dark mode emulation:**
   - Use `emulate` to set a mobile viewport: `viewport: { width: 375, height: 812, deviceScaleFactor: 3, hasTouch: true, isMobile: true }`
   - Re-check the most important pages at mobile size
   - Use `emulate` with `colorScheme: "dark"` to verify dark mode consistency (if applicable)
   - Use `emulate` with `colorScheme: "auto"` to reset when done
   - Reset viewport to null when done: `emulate` with `viewport: null`

8. **Take screenshots:**
   - Save all screenshots to the `screenshots/` directory in the project root
   - Use `take_screenshot` with `filePath` set to descriptive names like `screenshots/ux-review-{page}-desktop.png`
   - Take a screenshot of each page at desktop width (1280x800)
   - Take a screenshot of key pages at mobile width (375x812)
   - Reference screenshots in the report

9. **Produce the review report:**
   Structure findings by severity:

   ### Critical (blocks usability)
   - Issues that prevent users from completing core tasks

   ### Performance
   - Core Web Vitals scores (LCP, CLS, INP) with pass/fail indication
   - Performance insights from the trace
   - Slow or failed network requests
   - Console errors

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
- Include a **Performance Summary** section with CWV scores
- List any console errors or failed network requests
- List all screenshots taken with their paths
- Provide a prioritized summary of top 5 improvements

## Notes
- Be specific — reference exact elements, colors, spacing values
- Compare against modern F1-themed design patterns
- Consider both first-time visitors and returning users
- Test with both authenticated and unauthenticated states when possible
- If the app has Dutch/English toggle, check both languages
- Use `emulate` with `networkConditions: "Slow 3G"` if you want to test perceived performance on slow connections
- Use `take_snapshot` with `verbose: true` for detailed accessibility information
