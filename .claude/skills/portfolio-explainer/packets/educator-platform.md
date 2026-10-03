# Source packet — Educator Platform

Replaces the project code `/brag` step 1 normally reads. Drawn from
`content/educator-platform.mdx`, `src/data/resume.tsx`, and
`public/case-studies/educator-platform/`. **Nothing is invented.**

## Identity

| | |
|---|---|
| Product | **Educator Platform** — the assignments module in Toddle's educator platform |
| Company / year | Toddle · 2024 |
| Role | Product designer — problem framing, competitor and data analysis, assignment states, permissions, high-fidelity design |
| Slug | `educator-platform` |
| Accent | **`#006e78`** — the *same token* as `ai-unit-planning`, deliberately. This project's own UI samples at `#007C8C` (hue 187), 3° from that project's accent, because both are Toddle. Using the identical value makes the pairing read as intentional employer colour-coding rather than a near-miss. Was `#00828c` when the stage was white (4.59:1); on `#ececec` that falls to 3.89:1 and fails AA, so the grey-stage regrade darkened it to `#006e78` (5.08:1). |

## Quoting convention

The MDX blockquote used to contain a typo ("Redesinging the assign flow…"), corrected in the
source on 2026-09-19 at the author's request. The rule it prompted still holds: enlarging a typo
would be unkind, and silently correcting a quotation would be worse. So throughout:

- **Quote marks = the author's exact words**, verified against the source.
- **No quote marks = a faithful restatement** — e.g. the hook *Assignments locked the moment the
  due date passed.* and the closing *Built, and handed off to the developers.*

The typo'd blockquote is simply not used.

## The 9-question rubric

1. **What is it?** A redesign of the assign flow — how a teacher sets when an assignment opens,
   when it is due, when it closes, and who can see it.
2. **Strongest claim.** One date was doing three jobs. Splitting it is the whole case.
3. **Visual hook.** The redesigned assign modal — it contains the answer to every stated problem.
4. **What to show.** That modal, twice, with a marker; then the state/phase system as type.
5. **Shortest satisfying cut.** Reel 20 s · explainer 40 s.
6. **Tone.** `polished`.
7. **Audio.** Reel silent. Explainer: the same bed as the rest of the set.
8. **Share caption.** Written at delivery.
9. **The flow worth showing.** Not a task flow — a *rules* system. Three dates, three states,
   four phases, three audiences.

## Claim → proof, the spine of both videos

The three problems are the MDX's own H3 headings, and the modal answers all three:

| Problem (verbatim heading + claim) | What the redesigned modal shows |
|---|---|
| **Inflexible assignment locking** — *"assignments are automatically locked once the due date passes, with no option to set a different close date"* | `Opens on` · `Due on` · `Closes on` as three separate fields |
| **Confusing user interface** — *"Due date and scheduled date fields lack clear context or explanations"* | *"Assignment opens for submissions immediately and is visible to students. Submissions close on 23 May at 11:59 pm. Late submissions are not allowed."* |
| **Limited control over assignment visibility** — *"Teachers can't choose to show some tasks while hiding others"* | `Visibility: Show to students now`, set per class card (1A and 1B independently) |

## The system — verbatim, and the explainer's centrepiece

States: **In drafts · Assigned · Completed**
Phases: **Before the assignment start date · After the start date but before the due date ·
After the due date but before the close date · After the close date**

Permissions, verbatim: *"which affects what students, parents, and teachers can see across the
educator, student, and family platforms"*.

## Assets

| File | What it is | Use |
|---|---|---|
| `06-assign-modal.png` (2000×1250) | **the screen the videos use** — supplied by the author, flat and uncropped, no device mockup, no perspective, and with the **Advanced timeline settings popover open** | every product beat; cropped to `footage/modal-v2.png` at `crop=1822:1040:88:104` |
| `01-official-color.png` (3652×1754) | the same modal composited on a monitor at an angle — higher pixel count but perspective-skewed and soft | superseded by `06`; still the MDX hero |
| `05-permission-configuration.png` (3392×4704) | FigJam decision tree — three branches by when the task is assigned | permissions beat, as texture |
| `02-observed-patterns.png` · `03-data-matrix.png` · `04-usecases.png` | FigJam workshop boards | evidence, illegible at video scale — content re-set in type instead |
| `/project-educator-platform.png` | the same modal on a tablet, 3/4 perspective | card still — **the reel's poster** |

**Why `06` beats `01` despite being fewer pixels.** `01` is 3652 px wide but is a photograph of a
monitor: perspective-skewed, softened by the transform, and it had to be scaled to 0.48 to fit the
plate, halving its text. `06` is flat, crops to **1822×1040 = 1.752 aspect**, and the plates are
sized to that exact ratio — so it renders at ~0.79 scale with no letterbox and no resampling blur.
Net result: markedly more legible. *Match the plate to the source aspect whenever the source is
flat; only fall back to `contain` with margin when it genuinely cannot be matched.*

`06` also changes what the marker should point at. The popover occludes the `Closes on` column, but
it states both new controls in the product's own copy — **"Task opens on a set date"** and
**"Submissions close after a set date"** — which is stronger evidence than the field labels were.
The dates beat therefore marks the popover, not the date row.

**Marker geometry** (`4px solid var(--accent)`, crop coords × plate scale + plate origin):

- reel, plate `1246×711` at `(337,150)` → scale 0.6838, no offset
  - dates (popover) `left 1229, top 256, w 345, h 185` · visibility `left 362, top 385, w 295, h 62`
- explainer, plate `1440×822` at `(240,230)` → scale 0.7903, no offset
  - dates (popover) `left 1271, top 352, w 399, h 213` · visibility `left 268, top 501, w 341, h 72`

## Cautions

- **No recordings exist** and there is only one distinct product screen (in two renderings). Stills are held and
  animated in — never dressed up as captured motion.
- **Six of the nine embeds are now reachable** (2026-09-19). The author opened the Desktop Bridge
  in both Figma files, so the `Class-Stream-Task` board (`0mpT2uj6KEQqrNRjIdxndH`) and the
  `Class-Stream-Task---WIP` design file (`yLEnuihk0vrSNU9URupFzA`) export normally. The board's
  section names map straight onto the MDX headings: `90-542` current flow, `62-2111` competitor
  flows, `90-543` user journey, `97-3406` time series analysis — plus permissions configuration,
  use cases, data matrix and observed patterns, which the MDX shows only as flat PNGs. The three
  **Google Sheets remain unusable**, so the competitor *spreadsheet* and the outlier analysis are
  still not claimed; the competitor *flows* now are.
- **The board has a section named `Secondary analysis - ignore`.** That is the author's own
  instruction. It is excluded.
- **The two hi-fi embeds point at the same node.** MDX embeds 8 and 9 are captioned "quick tasks,
  learning experiences, and assessments" and "work sheet", but both use `1017-18014` (= *In other
  modules*). The WIP file genuinely holds both trees — *In other modules* and *In worksheets
  module* — so the videos show them correctly labelled even though the page does not.
- **There is no outcome statement in this case study.** It ends at developer handoff. No metric or
  feedback claim may be invented to fill the gap — the closing beat is the handoff, and that is
  the honest ending.
