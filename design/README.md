# Daybook design

Source files for the Daybook design canvas. The live, clickable canvas is here:
https://claude.ai/artifact/VHiRsqmVbKtnzEJyDhr9SE

The product spec lives in [../docs/product/PRD.md](../docs/product/PRD.md); its "Visual design system" section lists the colour tokens, type and spacing used below.

## Design system

`system/` mirrors the [Daybook Design System](https://claude.ai/artifact/Gmbo8YtCRf84VXVXazgcBS): `tokens.json` (colours for light and dark, type, spacing, radii, shadows, sizes), `README.md` (the brand book and usage rules), `components/bundle.css` (the `db-` component classes) and a guideline plus live preview per component. The canvas is linked to it, so its Theme menu offers these tokens.

Every artboard loads `canvas/ds/daybook/tokens.css` (built from `tokens.json`) and takes its colours, radii, shadows and font from those variables, e.g. `background: var(--lavender-bg); color: var(--lavender-ink); border-radius: var(--radius-md)`. Page titles and section headings use the `page-title` and `section-heading` text-style classes. Change a value in `tokens.json`, rebuild `tokens.css`, and every screen follows; setting `data-theme="dark"` on the page switches to the dark palette.

## Screens

| File                          | Screen                                                   | Size            |
| ----------------------------- | -------------------------------------------------------- | --------------- |
| `canvas/Main.dc.html`         | Today — daily plan                                       | Page, 1440 wide |
| `canvas/Week.dc.html`         | This week — weekly plan                                  | Page, 1440 wide |
| `canvas/Project.dc.html`      | Project — milestones, tasks, notes                       | Page, 1440 wide |
| `canvas/Notes.dc.html`        | Notes — list and editor                                  | Page, 1440 wide |
| `canvas/Mobile.dc.html`       | Mobile — Today and capture sheet                         | 390 × 844       |
| `canvas/SignIn.dc.html`       | Auth — Sign in (tweak: default / error / loading)        | Page, 1440 wide |
| `canvas/SignUp.dc.html`       | Auth — Create account, live password strength            | Page, 1440 wide |
| `canvas/Reset.dc.html`        | Auth — Reset password: request, sent, new password, done | Page, 1440 wide |
| `canvas/MobileSignIn.dc.html` | Auth — Mobile sign in                                    | 390 × 844       |

`canvas/canvas.json` holds the layout: where each artboard sits on the canvas, its title and size.

## About the files

- Each `.dc.html` file is one artboard in the canvas's Design Component format: HTML with inline styles plus a small `class Component extends DCLogic` script for state.
- They load `./support.js`, the canvas runtime, so they don't open on their own in a browser. View them on the canvas link above.
- The markup and inline styles are a good reference when building the real UI: colours, spacing, radii and copy are all exact.

## Keeping this folder in sync

The canvas is the working copy; this folder is a snapshot. After changing the design on the canvas, ask Claude to refresh `design/canvas/` from the canvas. Going the other way also works: edit these files and ask Claude to publish them back to the canvas.
