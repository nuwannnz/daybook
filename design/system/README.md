# Daybook — design system

Daybook is a minimal note-taking app for notes, daily plans, weekly plans and longer projects. The interface is quiet until you act: a near-white page, one sans-serif typeface, dark ink actions and six pastel colours that each belong to one project. This system holds the tokens, component styles and rules behind the [Daybook design canvas](https://claude.ai/artifact/VHiRsqmVbKtnzEJyDhr9SE).

## Voice and copy

Short, warm and specific. Write what the person will see happen, in their words.

| Do | Don't |
| --- | --- |
| Bring to today | Migrate tasks |
| Everything has a day. Nice. | No items |
| That email and password don’t match. Try again, or reset your password. | Authentication failed (401) |
| Jot it down before it slips away | Enter text here |
| 3 of 7 done | 42.8% complete |

- Sentence case everywhere, including buttons. Uppercase only for eyebrow labels (`label` style).
- No exclamation marks, no emoji, no apologies in errors. Errors say what happened and how to fix it.
- Undo over confirm: actions show an Undo toast instead of asking first. Only deleting a project asks.

## Colour

**Colour means project.** Each project owns one pastel and uses it for its dot, chips, Top 3 number, schedule blocks, week-board cards and goal card. Colour is never decoration and never the only cue: chips always carry the project name.

Every pastel is a trio:

- `*-bg` is the fill (chips, cards, blocks).
- `*-ink` is the only text colour allowed on that fill. It passes 4.5:1 in both themes.
- `*-dot` is for non-text marks: the 10px project dot, progress fills, today's column border. Never use it for text.

Pastels are assigned to new projects in this order: lavender, mint, peach, rose, sky, butter. Butter is reserved for notices (`notice-bg`, the carry-over banner and pinned decisions) and Daily notes. Sky is used for calendar events. Rose doubles as the error colour (`error-bg`, `error-ink`).

**Neutrals.** `bg` for the page, `surface` for cards and inputs, `sidebar` for the sidebar and quiet controls. Text is `ink`; secondary text `ink-soft`; labels and meta `ink-muted`; completed tasks `ink-done` with line-through. `border` is a hairline for cards only; form inputs use `border-strong` so their edge passes 3:1.

**One primary action per view.** `primary` fills the main button (Add, Sign in, Save); everything else is a secondary button on `surface` or a text button in `accent`.

## Type

One family, Plus Jakarta Sans (Google Fonts, weights 400 / 500 / 600 / 700), with a system fallback.

- `page-title` 34/40 bold for the date or project name at the top of a view.
- `section-heading` 17/24 bold for sections such as Top 3 and Schedule.
- `task` 15/22 medium for Top 3 titles and inputs; `body` 14/22 for everything else.
- `note-body` 16/27 inside the editor, max `note-measure` (680px) wide.
- `meta` 13/18 semibold in `ink-muted` for counts and dates; `label` 12/16 uppercase with 0.05em tracking for eyebrows.

## Space, shape and depth

- Spacing runs on 4px steps (`space-1` to `space-9`). Lay out groups with flex or grid and `gap`, not margins.
- Radii grow with the element: `radius-md` (12) for buttons and inputs, `radius-lg` (16) for cards, `radius-2xl` (22) for the project header, `radius-pill` for chips and bars.
- Depth is almost flat. `shadow-raised` marks the selected nav item or tab; `shadow-card` is for the capture bar and auth cards only; `shadow-fab` is for the mobile capture button. No other shadows, no gradients.

## Iconography

Inline SVG line icons, 24-unit grid, `stroke="currentColor"`, stroke width 1.75 (nav) to 2 (buttons), round caps and joins, no fills. Sizes 16, 18 or 22px. Icons always sit next to a text label, or the button carries an `aria-label`. The current set is shown on the Icons card: sun (Today), calendar (This week), note (Notes), grid (Projects), search, plus, chevrons, check, key, mail, lock and link. No emoji, ever.

## Accessibility

- Everything tappable is at least `touch-target` (44px) in both dimensions.
- Focus is a 2px `focus-ring` outline with 2px offset on every interactive element.
- Text meets 4.5:1 on its ground in both themes; the pairs are listed in each token's note.
- Use real `<button>`, `<a href>`, `<input>` and `<label>` elements. Icon-only buttons need `aria-label`.
- Respect reduced motion: transitions are 150–200ms opacity and position only, and switch off when the OS asks.

## Using this system

Load the generated `tokens.css` and `components/bundle.css`, then use the `db-` classes shown on each component card. Tone classes (`db-tone--lavender` … `db-tone--butter`, `db-tone--inbox`) set a pastel fill with its matching ink and work on chips, Top 3 numbers, schedule blocks and goal cards. There is no JavaScript bundle; state (done, selected, error) is expressed with `aria-*` attributes and modifier classes.
