Status: ready-for-agent

# Clickable Qualms app shell

## Problem Statement

Qualms needs a frontend people can click through to judge product shape before real backend, auth, and register flows exist. Today `apps/web` is a fresh SvelteKit scaffold with a default welcome page. There is a rough wireframe (sidebar with Qualms branding, repo list, add-repo control, Account; main area with repo context and Chat / Tests / Issues), but no implemented UI. Without a clickable shell, layout, navigation, and the Chat–Tests–Issues loop stay abstract and hard to react to.

## Solution

Build a mobile-first, clickable app shell in the SvelteKit web app with dummy data and clean product chrome (quiet, dense app UI — not paper wireframe boxes, not a loud invented brand). Users can select repositories, open Chat / Tests / Issues for the selected repo, add a repo via a centered modal, and open Account settings as a full main-pane page. Nothing talks to a real API; interactions update in-memory (and last-used repo persistence) dummy state so the structure can be validated end to end.

## User Stories

1. As a user, I want to open the Qualms web app and see an app shell (not the SvelteKit welcome page), so that I can immediately judge the product layout.
2. As a user, I want a left sidebar with the Qualms name/brand, so that I know which product I am in.
3. As a user, I want the sidebar to list repositories I have already added, so that I can switch between them.
4. As a user, I want the repo list (and Chat, Tests, and Issues) to be scoped to the selected repository, so that I never see another repo’s chats, tests, or issues while working in this one.
5. As a user, I want the app to restore my last-used repository on load when one exists, so that I land in a useful workspace without re-selecting.
6. As a user, when I have no repositories, I want a clear empty state in the main pane telling me to select or add a repository, so that I know what to do next.
7. As a user, when no repository is selected and the list is empty, I want Chat / Tests / Issues unavailable or clearly disabled, so that empty chrome does not pretend there is a workspace.
8. As a user, I want a control in the sidebar to add a new repository, so that I can grow my list without leaving the shell.
9. As a user, when I click add repository, I want a centered modal, so that the add flow is focused and familiar.
10. As a user, I want the add-repo modal to offer a searchable dropdown/list of connectable repositories from my (dummy) GitHub account, so that I pick a repo instead of pasting a URL.
11. As a user, I want personal repositories grouped separately from organization repositories in that list, so that I can find the right repo quickly.
12. As a user, when I confirm a repo from the modal, I want it added to the sidebar list and selectable, so that the shell behaves like registration succeeded.
13. As a user, I want an Account entry in the sidebar, so that account and settings feel part of the chrome.
14. As a user, when I open Account, I want Settings as a full main-pane page (sidebar remains), so that settings feel like a destination, not a cramped popup.
15. As a user, I want Settings to show placeholder sections (e.g. profile, organization, notifications), so that I can judge settings IA without real account APIs.
16. As a user, from Settings I want a clear way back to the workspace (e.g. select a repo or an explicit back/close), so that I am not stuck in settings.
17. As a user with a repository selected, I want a header area with information about that repository, so that I always know which repo I am working in.
18. As a user with a repository selected, I want toggles for Chat, Tests, and Issues, so that I can switch structured surfaces for that repo.
19. As a user, when I select a repository, I always want to land on Chat first, so that the assistant is the default workspace.
20. As a user, I want Chat to behave like a ChatGPT-style repo assistant (not human team chat), so that I can talk to Qualms about the selected repo.
21. As a user in Chat, I want the composer placeholder to read “What are we testing today”, so that the intended prompt is obvious.
22. As a user in Chat, I want a left thread rail of past chats for this repository, so that I can click back through previous conversations (Jakob’s law / familiar pattern).
23. As a user in Chat, I want to select a thread in the rail and see its messages in the main chat area, so that history is usable.
24. As a user, I want some chat threads to be general (about the repo) and some attached to a specific test, so that test-scoped conversations live in the same Chat product.
25. As a user, I want opening a test’s conversation to land me in Chat with that attached thread selected, so that Tests and Chat share one conversation model.
26. As a user on the Tests tab, I want a list of Qualms-defined tests for the selected repository, so that I can see what Qualms will run.
27. As a user on the Tests tab, I want each test row to show last-run outcome, when it ran, and whether it was triggered from the App or CI, so that I understand recent activity without a separate runs-only view.
28. As a user, I want it clear that tests are defined only in Qualms (not outside the app for now), so that the shell matches the product rule that CI only kicks off Qualms-defined tests.
29. As a user, I want to open a test from the list into a detail view, so that I can see more information about that test.
30. As a user on a test detail, I want access to the conversation attached to that test, so that discussion stays tied to the test.
31. As a user on the Issues tab, I want a list of Qualms-owned issues (findings) for the selected repository, so that I can scan problems Qualms discovered.
32. As a user viewing an issue in the list, I want to see the associated test identity (e.g. test number/id), so that I know which test produced the finding.
33. As a user, when I click an issue, I want an issue detail view in the Issues main pane, so that I can read the finding without leaving Issues.
34. As a user on issue detail, I want a way back to the issues list, so that I can continue scanning.
35. As a user, I want Issues to be Qualms findings from Qualms tests—not GitHub Issues—so that the shell does not imply a GitHub issues mirror.
36. As a mobile user, I want the shell designed mobile-first, so that phone layouts are first-class, not a crude shrink of desktop.
37. As a mobile user, I want the sidebar to collapse into an appropriate small-screen pattern (e.g. drawer or similar), so that the main workspace remains usable.
38. As a mobile user in Chat, I want the thread rail to adapt (stack, sheet, or equivalent), so that I can still browse past chats on a small screen.
39. As a user on desktop, I want a fixed sidebar and Chat thread rail that feel dense and product-like, so that the layout matches a real app.
40. As a user, I want the visual design to be a clean product shell (typography, spacing, restrained palette)—not gray wireframe boxes and not a flashy marketing brand—so that feedback is about structure, not unfinished UI or invented branding.
41. As a user, I want all Chat, Tests, and Issues content to be dummy/fixture data, so that I can click through without backend or auth.
42. As a user, I want Account to show a fake signed-in identity in settings/chrome, so that the shell feels inhabited without real OAuth.
43. As a developer, I want this shell implemented in the existing SvelteKit `web` app in the monorepo, so that we do not reintroduce a second frontend stack.
44. As a developer, I want dummy add-repo and navigation to update client state only, so that we do not pretend `@qualms/core` register APIs are wired yet.
45. As a user switching repositories, I want Chat / Tests / Issues content to swap to that repo’s data immediately, so that scoping is obvious.
46. As a user, I want selecting a different header toggle to replace the main content with that surface, so that Chat, Tests, and Issues feel like peers under one repo header.
47. As a user with Settings open, I want the Chat / Tests / Issues toggles not to imply I am still in a repo workspace (or to clearly yield), so that settings is not confused with repo surfaces.
48. As a user, I want enough fixture repos, tests, issues, and chat threads to exercise the happy paths (including at least one test-attached thread), so that the shell is demonstrable without looking empty.
49. As a user attempting to add a repo that is already in my list, I want sensible dummy behavior (e.g. select existing / no duplicate row), so that the modal does not create confusing duplicates.
50. As a user dismissing the add-repo modal without confirming, I want the repo list unchanged, so that cancel is safe.
51. As a keyboard/accessibility-minded user, I want interactive controls (toggles, modal, lists) to be reachable and labeled enough for a first shell, so that basic use is not mouse-only brittle.
52. As a user on a narrow viewport, I want the first viewport of the shell to remain one coherent composition (sidebar/nav + workspace), so that mobile-first does not devolve into a dashboard of unrelated cards.

## Implementation Decisions

- Implement in the existing SvelteKit TypeScript app under the monorepo web workspace; replace the default welcome page with the shell.
- Use Svelte 5 runes-mode patterns consistent with the scaffold; keep UI components thin over client dummy state.
- Scope: clickable shell with fixture/dummy data only — no real GitHub OAuth, no real register-repository API, no CI integration, no persistence backend.
- Persist only lightweight client preferences needed for the agreed UX (at minimum last-used repository id); everything else may be in-memory fixtures reset on reload except that preference.
- Domain vocabulary for the shell (even when fixture-only):
  - **Repository** — a repo registered in Qualms (sidebar list); aligns with existing core `Repository` concept but not wired to `RepositoryStore` yet.
  - **Test** — Qualms-defined check for a repository; CI or in-app may trigger runs; definitions are not created outside Qualms in this product direction.
  - **Issue** — Qualms-owned finding discovered from tests (not GitHub Issues), associated with a test id/number.
  - **Chat thread** — assistant conversation scoped to a repository; may be general or attached to a test.
- Layout chrome:
  - Left sidebar: Qualms brand, repo list, add-repo control, Account.
  - Main: repo header (when a repo is selected) with Chat / Tests / Issues toggles; content pane for the active surface; Settings replaces the workspace content when opened from Account.
- Add repository: centered modal; searchable list of connectable (dummy) GitHub repos; group **Personal** vs **Org**; confirming adds to the sidebar list.
- Default navigation: restore last-used repo if any; else empty-state fallback; when a repo is selected, **always** open Chat (do not remember last toggle).
- Chat UI: left thread rail + main transcript + composer; placeholder “What are we testing today”; ChatGPT-like assistant, not human team chat.
- Tests UI: single list of definitions with last-run outcome, timestamp, and trigger (App vs CI); row opens detail including path to attached conversation.
- Issues UI: list with associated test reference; click opens detail in the Issues pane with back to list.
- Visual: clean, quiet product shell; mobile-first responsive behavior for sidebar and Chat thread rail; avoid purple-gradient / marketing-landing aesthetics.
- Do not extend or depend on real `RepositoryStore` registration for this shell; keep a clear boundary so later wiring can replace fixtures.
- No dedicated test seam was agreed for this spec; do not invent a large testing architecture as a prerequisite to shipping the shell.

## Testing Decisions

- Prefer verifying external behavior a user can observe (navigation, scoping, modal add, empty state, defaults) over implementation details of components.
- No new formal test seam was selected for this work; automated tests are optional for the first shell pass.
- If tests are added later, prefer the highest practical seam available at that time (e.g. workspace state behavior or browser-level flows) rather than shallow component snapshot tests.
- Existing prior art in the repo is minimal (`packages/core` test file is empty); do not assume a mature web test harness.
- Manual click-through on mobile-width and desktop-width viewports is the expected acceptance check for this spec.

## Out of Scope

- Real authentication / GitHub OAuth / session management
- Real repository registration against `@qualms/core` or any backend
- Real CI webhooks or runners; App vs CI is display metadata on fixtures only
- Creating, editing, or deleting real test definitions
- Running tests for real
- Human team chat or Slack-like channels
- GitHub Issues sync or mirror
- Production design system / final brand identity
- Notification delivery, billing, or multi-org admin beyond Settings placeholders
- Hardening, analytics, or accessibility audit beyond basic usable controls
- Formal automated test harness or agreed architectural test seam (explicitly deferred)

## Further Notes

- Originating wireframe: sidebar (Qualms, repos, add repo, Account) + main (repo info + Chat/Tests/Issues toggles + content).
- Product loop agreed in grilling: Qualms defines tests; App or CI kicks those tests off; Issues are findings from those tests; Chat is the assistant beside that loop, with history and test-attached threads.
- `gh` was not authenticated in the authoring environment; this spec is published to the local markdown issue tracker at `.scratch/clickable-app-shell/spec.md` with `Status: ready-for-agent`. Re-file as a GitHub issue with label `ready-for-agent` once `gh auth login` is available if the project standard is GitHub.
