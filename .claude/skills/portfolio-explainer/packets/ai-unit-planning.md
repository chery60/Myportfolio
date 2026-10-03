# Source packet — AI Unit Planning

Replaces the project code that `/brag` step 1 normally reads. Everything here comes from
`content/ai-unit-planning.mdx`, `src/data/resume.tsx`, and `public/project-ai-unit-planning.png`.
**Nothing is invented.** If a line isn't supported by those, it doesn't go in the video.

## Identity

| | |
|---|---|
| Product | **AI Unit Planning** — unit template customization and AI-assisted planner creation |
| Company / year | Toddle · 2024 |
| Role | Product designer — field audit, dataset modelling, customization UX, AI workflow |
| Domain | EdTech · curriculum planning across PYP, MYP, DP, UbD |
| Slug | `ai-unit-planning` |
| Accent | **`#00828c`** — Toddle's product teal, the dominant saturated colour in the planner screenshot (n=2248, far ahead of anything else). 4.59:1 on the house background, so it clears WCAG AA for normal text unmodified. Sits opposite Symphony Kiosk's amber `#a35c00` on the wheel, so the two projects never read as the same video. |

## The 9-question rubric

1. **What is it?** Three phases of work on Toddle's unit planner: unify the planner fields,
   redesign template customization, then work out where AI can actually help.
2. **Strongest claim.** *"AI workflows depend heavily on information architecture."* The real
   design work wasn't the AI interaction — it was simplifying the system underneath it.
3. **Visual hook.** The planner's own outline sidebar: twenty-odd curriculum fields stacked down
   the left edge. That column *is* the problem statement.
4. **What to show.** Three crops of the one real screenshot (below) plus typeset information
   design for the dataset mapping, which has no screenshot.
5. **Shortest satisfying cut.** Reel 20 s · explainer 40 s.
6. **Tone.** `polished`.
7. **Audio.** Reel silent. Explainer: same restrained bed as the kiosk, fading under the outro.
8. **Share caption.** Written at delivery.
9. **The flow worth showing** — this is a *systems* project, not a task flow. The equivalent
   spine is: **field system → dataset mapping → what AI needs before it can generate.**

## Copy that may appear verbatim

From `content/ai-unit-planning.mdx`, quotable as written:

- *"Building a more flexible unit planning system for curriculum templates, custom datasets, and
  AI-assisted planner creation."* (the blockquote)
- *"Each curriculum has its own unit templates. Each template is made of fields, and those fields
  can either be dataset-driven or custom-created by the school."*
- *"Similar fields were implemented in different ways, which made maintenance difficult and
  created inconsistencies between templates."*
- *"before generating a useful unit plan, we first had to understand which fields were required,
  which were optional, and what minimum context an AI system needed to produce a meaningful
  output."*
- *"How might we help teachers generate curriculum-aligned unit plans using AI?"*
- *"AI workflows depend heavily on information architecture."*
- *"It was simplifying the underlying planning system so AI could become a natural extension of
  the workflow instead of a separate layer on top."* — **the closing line.**

Structured content, verbatim from the tables (these are the information design):

- **Unified field model:** rich text · text area · single-line text · list · reflection box ·
  card · checklist · nested checklist
- **Dataset mapping:** Learner profile attributes → **Card dataset** · Approaches to learning →
  **Nested checklist** · Actions → **Checklist** · Concepts → **Checklist** · Related concepts by
  subject → **Dependent dropdown**
- **AI minimum context:** Unit title — *Required*, feasible, needs *"Central idea, with subject
  and theme as helpful add-ons."* / Cover image — *Not required*
- **Curricula:** PYP · MYP · DP · UbD
- **Dependency rule:** *"related concepts should not appear unless key concepts are part of the
  unit template."*

## Assets — one screenshot, cropped three ways

`public/project-ai-unit-planning.png` (3456×1920) is the **only** real product imagery this
project has. It is a genuine Toddle planner screenshot, and it happens to contain one anchor for
each of the three phases. Crops are pre-cut into `brag-output/ai-unit-planning/footage/`:

| Crop | Region | What it shows | Serves |
|---|---|---|---|
| `sidebar.png` | 619×1493 @ 25,141 | the outline column — Unit details, Transdisciplinary theme, Central idea, Learner profile attributes, Key concepts, Related concepts, Lines of enquiry, Approaches to learning, Subject standards, Prior learning, Action, Questions… | **Phase 1** — the field system |
| `cards.png` | 1964×785 @ 754,911 | the six PYP transdisciplinary theme cards as radio-select cards | **Phase 2** — a card dataset, rendered |
| `emptystate.png` | 1560×550 @ 738,157 | "Type unit title", Subject, Start date, End date, Unit hours | **Phase 3** — the minimum context AI needs |
| `planner-full.png` | 3456×1920 | the whole editor | context / hero |

Aspect ratios differ wildly (0.41, 2.5, 2.8, 1.8), so plates use `object-fit: contain` on white —
these are screenshots of a white UI, so contain reads as natural margin, never as letterboxing.

## Cautions

- **There are no screen recordings and no case-study folder.** Do not imply motion that doesn't
  exist; the beats are crops and typeset information design, held still and animated in.
- **No metrics exist in the source.** The Outcome section is qualitative. Any percentage in a
  storyboard is a bug.
- **The Figma embed** (`mmW9jqencHdKNxpsdLVuJK`, node `0-1`, "Unit template customization") is a
  live iframe, not a local asset, and is bot-blocked (403) to headless capture. The Phase 2
  *design preview* therefore cannot be shown — Phase 2 is carried by `cards.png` plus the dataset
  mapping as type. If the boards are ever exported to PNG, Phase 2 gets much stronger.
- **`public/project-ai-unit-planning.svg` is a dead asset** — hand-authored, referenced by nothing
  in the repo, with a red `#FF5766` play button and three panels labelled *Field system*,
  *Template UI*, *AI workflow*. It reads as someone's mock-up of a video thumbnail for exactly
  this project. Its three-panel spine matches the case study's three phases and is worth honouring
  in the structure — but the file itself is not used, and its red is **not** the accent.
- This is an **information-architecture** project. Resist forcing it into the kiosk's
  walk-through shape; its drama is a system getting simpler, not a user completing a task.
