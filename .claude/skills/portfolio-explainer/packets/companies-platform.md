# Source packet — Companies Platform

Replaces the project code `/brag` step 1 normally reads. Everything is drawn from
`content/companies-platform.mdx`, `src/data/resume.tsx`, and
`public/case-studies/companies-platform/`. **Nothing is invented.**

## Identity

| | |
|---|---|
| Product | **Companies Platform** — Recur Club's portal for startups raising recurring-revenue financing |
| Company / year | Recur Club · 2023 |
| Role | Product designer — research, analytics, heuristic review, IA restructure, visual design |
| Slug | `companies-platform` |
| Accent | **`#4C3BF5`** — Recur's CTA indigo (Login / Pay / Export CSV), the one token present on every product surface in both recordings and both hero stills. 6.46:1 on white, clears WCAG AA unmodified. Teal `#00688C` was rejected despite a higher pixel count: at hue 195° it is 11° from AI Unit Planning's accent and the two cards would read as the same video in the grid. Indigo (245°) separates from that and from Symphony Kiosk's amber (30°). |

## The 9-question rubric

1. **What is it?** An information-architecture overhaul of the platform startups use to raise
   debt capital and manage repayments.
2. **Strongest claim.** The most-downloaded report was buried five boxes deep. The analysis
   proved it, and the restructure surfaced it.
3. **Visual hook.** The restructured dashboard — Trade Limit donut, Scheduled Collections,
   Upcoming Payments — real product, dense and credible.
4. **What to show.** The dashboard, the fixed Reports tab, and the before/after click-paths.
5. **Shortest satisfying cut.** Reel 20 s · explainer 40 s.
6. **Tone.** `polished`.
7. **Audio.** Reel silent. Explainer: the same bed as the other two, fading under the outro.
8. **Share caption.** Written at delivery.
9. **The flow worth showing.** Not a task flow — a *path* comparison. Entry is the dashboard,
   the key action is reaching a report, the result is reaching it in fewer steps.

## Copy that may appear verbatim

From the MDX:

- *"Creating clear information architecture for easier user navigation in the companies platform"*
  (blockquote)
- *"Recur Club is a financial platform that provides hassle-free financing for startups."*
- *"I understood the initial workflow of all the modules and built the entire information
  architecture so that I could use that to frame my user interview questions."*
- *"Conducted the dropoff analysis in each workflow."*
- *"i have done a UX review on all the pages by using Jakob Nielsen's heuristics"*
- **Outcome:** *"After restructuring the product, the number of queries was reduced, and we
  received positive feedback from customers."*
- Research methods, as named: **Hotjar recordings · Mixpanel · dropoff analysis · heatmaps ·
  user interviews**

From `04-recur-img3.jpg` — the author's own dropoff board. **Verified by opening the image, not
by trusting a summary.** Problem note, verbatim:

> *"Accounting statements is the most used/downloaded report, but many clicks are required to
> perform the action."*

Before (teal path) and after (yellow path), exactly as drawn:

```
Before:  Dashboard (100%) → Finances → Reports (25%) → Accounting statement → Download (9.44%)
After:   Dashboard (100%) → Accounting Statement Card → Download statement
```

Other paths on the same board, all usable: Balance confirmation `Download (2.3%)` · TDS deposit
`Download TDS details (1.78%)` · Statements/escrow `(16%) → Select date range (3.3%) →
Download (2.8%)` · Invoices `(10.5%) → Download (2.7%)`.

## Numbers rule — the only project where this matters

Every percentage must match `04-recur-img3.jpg` exactly as labelled. **Do not derive a
"clicks saved" figure**: the diagram labels *boxes*, not clicks, and any arithmetic the source
does not state would be an invented metric. Show both paths and let the viewer count.

The funnel percentages describe the **problem**. The outcome is qualitative — *queries reduced,
positive feedback* — with no number attached. Never let a percentage drift into the outcome beat.

## Assets

| File | What it is | Use |
|---|---|---|
| `06-recur-companies.webm` | 167 s, CFR 60 fps, 3456×1814, no audio — post-listing navigation walkthrough | **every product beat** |
| `05-recur.webm` | 195 s — onboarding + KYC | **not used**: a different story (application, not navigation) |
| `04-recur-img3.jpg` | the dropoff board — five paths, three problem notes, the shortened flows | research beat, and the source of every figure |
| `03-recur-img2.jpg` | persona × sign-in matrix, dashboard visit breakdown | research beat (alt) |
| `02-recur-img1.jpg` | sign-in before/after listing, by persona | optional |
| `01-recurplatform.png` | 4608×3413 dashboard hero render | MDX banner; not needed in the video |
| `/project-companies-platform.png` | 4608×3072 dashboard on a Studio Display | card still — **the reel's poster** |

The app window sits inside dead padding in both recordings: **`crop=2218:1576:618:118`** isolates
it (1.41 aspect → plates use `contain`). Pre-cut clips live in
`brag-output/companies-platform/footage/`: `dashboard.mp4` (06 @ 8.5, 5.4 s) and
`reports.mp4` (06 @ 149, 5.6 s).

## Cautions

- **The Miro exports are illegible at video scale.** The click-paths are re-set in house type —
  same labels, same figures. The board itself is shown briefly so the artifact reads as real, but
  it is never the thing the viewer is asked to read.
- **Both Figma embeds are unusable** (`Design-Review`, nodes `0-1` and `1207-20` — the heuristic
  review and the IA map). Live iframes, 403 to headless capture. The restructure is carried by the
  typeset paths instead.
- The seeded table data in the recording is **dummy content** (investor names like "Krieger–Sauer",
  repeated "Cell Text"). Prefer frames where real structure shows — the dashboard cards and the
  Reports page — over table close-ups full of placeholder rows.

## Observed after build

With three reels on the homepage and all three cards in view at once, the **third sits paused on
its poster** — `MAX_CONCURRENT_REELS = 2` in `project-card.tsx` holding the decode budget. The
slot logic is correct (cards release their slot on scroll-out and the waiting one takes over), and
a paused card is visually identical to one with no reel, so it degrades cleanly. But once five
projects have reels, two of four visible cards will be static at any moment. Raising the cap to 3
is a one-constant change if that reads as arbitrary rather than deliberate.
