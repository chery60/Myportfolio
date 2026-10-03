# Source packet — User Management

Replaces the project code `/brag` step 1 normally reads. Drawn from
`content/user-management.mdx`, `src/data/resume.tsx`, and
`public/case-studies/user-management/`. **Nothing is invented.**

## Identity

| | |
|---|---|
| Product | **User Management** — one place to onboard, provision and manage users across Oracle's Food & Beverage products |
| Company / year | Oracle · 2022 |
| Role | Product designer — problem framing, data shape, IA, wireframes, accessibility specs |
| Slug | `user-management` |
| Accent | **`#9b5400`** — the *same token* as `symphony-kiosk`, continuing the employer colour-coding the user chose for the two Toddle projects. Independently defensible here: the project's own accessibility boards are **95–97% hue-40 amber** (`#e4cc9c`). Was `#a35c00` when the stage was white; the grey-stage regrade darkened it, because `#a35c00` is only 4.35:1 on `#ececec`, under the 4.5:1 AA threshold for normal text. On grey, `#9b5400` is 4.85:1. |

## Why the accent isn't sampled literally

The two most saturated colours in the product screens are the legacy console's blue (hue 205) and
the new list's link indigo (hue 222) — both would sit near Recur's `#4C3BF5` (245). The amber that
floods the a11y boards is the honest and distinctive choice, and it matches Symphony Kiosk, which
is the other Oracle project.

## The 9-question rubric

1. **What is it?** A unified user-management platform replacing four separate ones.
2. **Strongest claim.** Four products, four user systems, one administrator. The before/after is
   a Windows-era forms console versus a single searchable list.
3. **Visual hook.** The legacy EMC employee record — instantly dated, instantly legible as "the
   problem".
4. **What to show.** Legacy console → unified list → the accessibility specs behind it.
5. **Shortest satisfying cut.** Reel 20 s · explainer 40 s.
6. **Tone.** `polished`.
7. **Audio.** Reel silent. Explainer: the same bed as the rest of the set.
8. **Share caption.** Written at delivery.
9. **The flow worth showing.** A replacement, not a task flow: old system → new system → the
   rigour underneath it.

## Copy that may appear verbatim

- *"Allowing customers to fully onboard, provision, and manage users or employees from a common
  place."* (blockquote)
- *"Each of these had its own user management system."*
- *"How might we help an administrator add and manage user access of all employees across the Back
  Office, EMC, and POS from a single unified platform?"*
- *"As the user persona was an administrator based on the persona I designed the table and added
  an advanced search bar using which the administrator could easily filter out the users."*
- *"Worked on all the error cases and handled them. Worked on the A11Y specs"*
- Product strings, read off the supplied screens: `Oracle Food and Beverage` · `Oracle
  Administration` · `Users` · `Create User` · `Search by Name, Username, Email, Object Number, or
  Payroll ID` · `Status Active` · `Application Access Reports` · `POS Object Number` · `External
  Payroll ID`
- A11y spec strings: `Page Title Attribute: Users` · `Focus Management: Natural DOM Structure` ·
  `Table Caption` · `Hidden Column Heading: Actions` · `Focus On Load` · `aria-label="Reset User's
  Password"` · `aria-live="polite" aria-atomic="true"` · `Auto hide after: 3 or 5 seconds`

## Assets — four supplied by the author, filling real gaps

| File | What it is | Use |
|---|---|---|
| `06-legacy-emc.png` (936×652) | **the legacy EMC employee record** — Windows-era forms console, tabs inside tabs | the "before". **Was only a Figma embed in the MDX; no local copy existed.** |
| `07-users-new.png` (1920×1080) | **the new unified Users list** — search, filter chips, status column, Create User | the "after". Also absent from the repo before. |
| `08-a11y-users.png` (1920×1080) | accessibility spec for the Users list — page title, focus management, table caption, hidden column heading | accessibility beat |
| `09-a11y-reset-password.png` (1920×1080) | accessibility spec for the reset-password dialog — aria-labels, live regions, focus targets | accessibility beat |
| `03-search.png` · `04-a11ysepc-1.png` · `05-a11yspec2.png` | pre-existing specs: filter chips, assign locations, unassign revenue centre | **different** screens; not used, the four above tell the story better |
| `/project-user-management.png` | card still | **the reel's poster** |

`07`, `08` and `09` are exactly 16:9, so plates are sized 16:9 and they fill with no letterbox.
`06` is 1.436 — it `contain`s with side margins, which reads correctly for a small legacy app window.

## Cautions

- **No recordings exist.** Stills held and animated in, never dressed up as captured motion.
- **Seven Figma embeds are unusable** (user goals, legacy UI, user flow, IA, lo-fi, hi-fi ×2) —
  live iframes, 403 to headless capture. The supplied screens replace two of them directly.
- **There is no outcome statement.** The case study ends at developer handoff, same as
  `educator-platform`. No metric or result may be invented — the closing beat is the handoff.
- `07-users-new.png` carries two design annotations in its lower right ("Populate list
  alphabetically by last name", "If built in Rapid use infinite scroll…"). They are genuine spec
  notes; leave them visible rather than cropping them out.
