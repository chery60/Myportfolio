---
name: portfolio-explainer
description: Produce the pair of videos for one portfolio project — a silent looping reel for the project card and a longer explainer for the case study page — by driving the /brag skill with a portfolio source packet and this repo's house style. Use when asked to make, remake, or update a project video, reel, or explainer for this portfolio.
---

# Portfolio explainer videos

Two videos per project, generated with `/brag` (which delegates rendering to Hyperframes):

| Output | Where it plays | Length | Audio |
|---|---|---|---|
| **reel** | the project card on `/` | 15–25 s | **none** — stripped at encode |
| **explainer** | top of `/blog/<slug>` | 30–45 s | music bed |

`/brag` owns the story for one project. Hyperframes owns composition mechanics. **This skill owns
everything that must be identical across all the videos** — house style, beat patterns, the safe
area, the encode budget, and where files land. Do not let per-project creativity drift into those.

## Why a wrapper exists

`/brag` reads *the current repo's own code* to find its story. These projects were built at
Toddle, Oracle, and Recur Club — that source is not here. So step 1 of `/brag` reads a
**source packet** (`packets/<slug>.md`) instead of `index.html` / `styles.css`.

`/brag`'s creative law is "15–25 seconds, not one second more." The **reel keeps that law**. The
**explainer deliberately breaks it** with the adapted beat pattern below — that is intentional,
not a mistake to correct.

---

## Step 0 — Prerequisites

```bash
ffmpeg -version          # required; install with `brew install ffmpeg`
npx hyperframes doctor   # required
```

## Step 1 — Build the source packet

If `packets/<slug>.md` does not exist, write it first. It is the substitute for "the project
code" and must answer `/brag`'s 9-question rubric before any planning starts.

| Packet section | Read it from |
|---|---|
| Name, company, year, role | `src/data/resume.tsx` → the `DATA.projects` entry (`title`, `dates`) |
| One-line claim, skill tags | the same entry's `description`, `technologies` |
| Problem → approach → outcome | `content/<slug>.mdx` body |
| Copy that must appear **verbatim** | real headings and claims lifted from that MDX — never invented |
| Real UI to show | `public/case-studies/<slug>/NN-*.png`, listed by filename with what each shows |
| Real screen recordings | `public/case-studies/<slug>/*.webm`, where they exist |
| Card still | `public/project-<slug>.png` |
| Accent | sampled from that project's own screenshots (below) |

**Never invent product UI, metrics, or claims.** If the source does not support a line, cut the
line. A portfolio video that overstates the work is worse than no video.

**Never imply motion that does not exist.** Where a project has only stills, hold them and animate
them in; never pan or fake a cursor to suggest a screen recording.

### Known source gaps

- `ai-unit-planning` has **no** `public/case-studies/` folder and no recordings — one product
  screenshot (`project-ai-unit-planning.png`, 3456×1920) and one dead SVG. **Done, and the
  screenshot turned out to be enough**: it contains one anchor per phase (sidebar = the field
  system, PYP theme cards = a card dataset rendered, empty "Type unit title" = the AI
  minimum-context question), so it was cropped three ways rather than padded with type.
  **The technique generalises** — when a project has one dense screenshot, look for regions that
  each carry a different part of the argument before concluding it must be typographic.
  Where a crop is too extreme in aspect to read (the sidebar is 0.41), show the whole screen and
  outline the region with a `border: 4px solid var(--accent)` marker instead of shrinking it.
- The three `DATA.hackathons` entries (AI Portfolio, Plukrr, Venture CRM) have no MDX case study.
  **Reel only, no explainer.**

## Step 2 — Run `/brag`, twice

Run the `/brag` four-step pipeline against the packet — once for the reel, once for the
explainer — into `brag-output/<slug>/`. Pass `--tone polished`.

Feed `/brag` the packet in place of project source, plus the house style and beat pattern below
as fixed constraints in the composition brief.

## Step 3 — Gate, render, encode, deliver

`npx hyperframes check` must pass with **zero errors** in each composition before rendering. It
audits WCAG contrast and text overflow; both matter here and both gate as errors.

Then render, pick and bake poster frames, and encode to the budget below.

---

## House style — fixed across every video

The portfolio has no brand hue: it is the stock shadcn neutral ramp with Geist type. That
restraint *is* the style.

- **Stage** `#ececec` · **Foreground** `#0a0a0a` · **Muted text** `#666666` ·
  **Border** `#d8d8d8`. The stage is deliberately *not* the site's white: these products are all
  light-themed, and a white screenshot on a white frame has no edge — it dissolves into the video.
  Every plate is an explicit white card on that stage
  (`background:#fff; border:1px solid var(--border); border-radius:14px; box-shadow:0 6px 28px rgba(0,0,0,.07)`).
- **Accents are the grey-stage variants**, not the white-background ones: Toddle `#006e78`,
  Oracle `#9b5400`, Recur `#4C3BF5` (indigo already cleared AA, so it is unchanged). The originals
  sampled straight off the products — `#00828c`, `#a35c00` — sit at 3.89 and 4.35 on `#ececec` and
  fail the gate.
- **Type**: Geist for display and body, Geist Mono for labels, metrics, and the lower third
- **Motion**: soft ease, no bounce, no strobing, no particle systems, no equalizer/waveform visuals
- **Tone preset**: `polished`. These are enterprise design case studies. `yc-parody` and
  `chaotic` would actively damage them.
- **Lower third**: `Project — Company · Year`, Geist Mono, drawn from the entry's `dates`
- **End card**: project title + role + portfolio URL

**Varies per project — exactly one thing:** the **accent color**, sampled from that project's own
screenshots (dominant non-neutral hue). It drives the progress bar, key underline, metric
highlight, and end-card rule. Derived from real product UI, never invented.

## Beat patterns

**Reel** — keeps `/brag`'s 15–25 s law. Silent. Must loop cleanly: the last frame has to be
visually continuous with the first.

**Reels play on hover only.** The card shows its still until the pointer enters (or the card takes
keyboard focus), then the reel fades in over it; on leave it pauses, resets, and fades back to the
still. Two consequences for composition: the reel always starts from frame 0, so **the opening
beat must earn attention immediately** — there is no "already playing" state to catch someone
mid-way; and because the still sits underneath rather than the video being paused on screen, the
blank first frame the loop contract requires is never visible. Devices without a real pointer
render no video element at all.

```
Hook        2-3s   one sharp line from the MDX
Reveal      2-4s   the product, real UI
Highlights  5-12s  2-3 design moves
Outro       2-4s   title + company + year
```

**Explainer** — 30–45 s, with a music bed.

```
Hook        2-3s   the tension, in the project's own words
Problem     4-6s   what was broken (verbatim MDX claim)
Approach    6-10s  real screens, the design decisions
Highlights  8-14s  2-3 features that carry the case
Outcome     4-6s   metric or impact
Outro       2-3s   title + role + URL
```

`/brag`'s readability law holds for both: a short label holds ~0.8 s settled, a sentence ~0.3 s
per word. Fast-in, then **hold** — never fast-in, then gone.

## Reel safe area — a hard requirement

The card media box is a fixed `h-48 object-cover` inside a two-column `max-w-[800px]` grid
(`src/components/project-card.tsx`, `src/components/section/projects-section.tsx`). A 16:9 reel
is therefore **center-cropped to roughly 2:1** on the card — about 23% of the frame height is cut,
top and bottom.

**Every word and every key visual must sit inside the middle ~70% of the frame.** Put this in the
composition brief verbatim, and check a mid-reel `hyperframes snapshot` against it before
rendering. Anything in the top or bottom band is invisible exactly where it matters most.

---

## Encode budget — not a suggestion

This repo is already heavy (`.git` ≈ 141 MB; the four existing `.webm` recordings alone are
103 MB), and the built static export is **committed at the repo root**, so every delivered file is
stored **twice in git**. GitHub Pages caps a published site at 1 GB.

| Output | Resolution | Encode | Ceiling |
|---|---|---|---|
| reel | 1280×720 | H.264, CRF 28, **`-an`** | **≤ 2 MB** |
| explainer | 1920×1080 | H.264, CRF 24, AAC 96 kbps mono | **≤ 8 MB** |
| poster | matches video | `-q:v 3` | ≤ 200 KB |

`-movflags +faststart` on both, or the browser must download the whole file before showing frame 1
— which defeats the reel's in-view play and the explainer's seek.

```bash
# reel: no audio track at all, it is always muted
ffmpeg -y -i brag-output/<slug>/reel-raw.mp4 -vf scale=1280:-2 \
  -c:v libx264 -crf 28 -preset slow -pix_fmt yuv420p -an \
  -movflags +faststart brag-output/<slug>/reel.mp4

# explainer
ffmpeg -y -i brag-output/<slug>/explainer-raw.mp4 -vf scale=1920:-2 \
  -c:v libx264 -crf 24 -preset slow -pix_fmt yuv420p \
  -c:a aac -b:a 96k -ac 1 \
  -movflags +faststart brag-output/<slug>/explainer.mp4
```

**Encode once at final quality.** Every re-encode that reaches `public/` adds a permanent git blob
that never goes away. Iterate inside `brag-output/` (gitignored); copy out only when it is final
and under budget. Verify with `ffprobe` before copying — the reel must have **no audio stream**.

## Delivery

```
public/project-<slug>-reel.mp4                 → src/data/resume.tsx      video: "/project-<slug>-reel.mp4"
public/case-studies/<slug>/00-explainer.mp4    → content/<slug>.mdx       video: "/case-studies/<slug>/00-explainer.mp4"
public/case-studies/<slug>/00-explainer.jpg    → content/<slug>.mdx       videoPoster: "..."
```

The reel's poster is the existing `public/project-<slug>.png` — the card already loads it, so it
costs nothing and there is no visual swap. Do not produce a separate reel poster.

The explainer poster is **required**: the player is `preload="none"`, so without it the box has
nothing to show until play.

`00-` sorts above the existing `01-banner`, so the filename mirrors the render order.
Use **mp4/H.264, not webm** — the reel must autoplay on iOS Safari.

Everything is wired already: `ProjectCard` renders the reel when `video` is set, and
`src/app/blog/[slug]/page.tsx` renders `CaseStudyVideo` when the post's `video` frontmatter is
set. Filling in a path is the only integration step.

## Verify before calling a project done

1. `ffprobe` — duration in range, reel has **no** audio stream, sizes under budget
2. `pnpm dev` → homepage: the card plays, off-screen cards pause, no jank
3. `pnpm dev` → `/blog/<slug>`: explainer sits above the banner, does not autoplay, poster shows
4. macOS **Reduce Motion** on → card falls back to the still, nothing downloads
5. `pnpm lint` clean

---

## Long-form walkthroughs (narrated)

A third format, beyond the reel and the explainer: a **3–4 minute narrated walkthrough** for
YouTube, embedded under the inline explainer via `YouTubeEmbed`.

**Voice sets the pace, not the storyboard.** Write the narration first as one line per beat, synth
each line separately, measure it, then derive every scene duration from its clip:

```bash
npx hyperframes tts "<line>" --voice af_heart --output vo/b01.wav   # needs: pip install kokoro-onnx soundfile
```

`walkthrough/build.py` in `brag-output/ai-unit-planning/` is the working generator: it reads
`script.json`, measures each clip, lays out beats as `LEAD(0.45s) + clip + TAIL(0.55s)`, emits the
timed composition **and** assembles a narration track whose clips sit at the identical offsets. The
visuals therefore cannot drift from the audio. Kokoro runs ≈2.65 words/sec, so ~520 words ≈ 3½ min.

**On-screen text gets sparser, not denser.** With narration carrying the argument, each beat shows
only a chapter label and a 4–6 word caption. Never put a sentence on screen while a different
sentence is being spoken — the viewer can do one or the other, not both.

**White UI needs a non-white stage.** Most of these products are light-themed, and on the white
house background a screenshot dissolves into the frame — you cannot see where the screen ends.
Put the stage on **`#ececec`** and give each plate an explicit white card
(`background:#fff; border:1px solid #d8d8d8; border-radius:14px; box-shadow:0 6px 28px rgba(0,0,0,.07)`).

**Greying the stage breaks two house tokens, so change them with it.** On white, accent `#00828c`
is 4.59:1 and muted `#737373` is 4.73:1 — both fall under AA the moment the background stops being
white (3.89 and 4.01 on `#ececec`). Use **`--accent:#006e78`** and **`--muted:#666666`** on a grey
stage; `hyperframes check` will otherwise fail the contrast gate. Ink `#0a0a0a` is unaffected.

**Normalise for the platform:** `loudnorm=I=-14:TP=-1.5:LRA=11`. Kokoro lands around −20 LUFS,
which is noticeably quiet against YouTube's −14 target.

**Past ~4 minutes, the render needs a flag.** Hyperframes streams frames straight into FFmpeg only
up to a duration cap; beyond it, it falls back to writing every frame to disk as a PNG — roughly
**250 MB per second of video**, so a 253 s composition asked for 63 GB and failed. Render long
pieces with the cap raised:

```bash
PRODUCER_STREAMING_ENCODE_MAX_DURATION_SECONDS=900 npx hyperframes render composition --output raw.mp4
```

**Fit a tall source by panning it, not by shrinking it.** A sitemap column 1260×2258 contained
inside a 1400×800 plate lands at 0.35× — texture, not information. Instead size the image to the
plate's *width* inside an `overflow:hidden` card (above 1:1 for a narrow source) and tween
`y` from `0` to `-(renderedHeight - plateHeight)` across the beat. Derive that distance from the
source's real pixel size rather than guessing, mark the card `data-layout-allow-overflow` so the
layout gate reads the overflow as deliberate, and hold ~0.9 s at the top before the pan starts.

### Getting Figma frames out, without a REST token

The `figma-console` Desktop Bridge exports at up to 4× without any personal access token (the REST
path needs one and it expires). The bytes must not pass through the agent's context, so:

1. Run a tiny local HTTP sink on **port 9230** — inside the range the plugin manifest already
   allows (`http://localhost:9224`–`9232`), so no manifest edit is needed.
2. `figma_execute`: `node.exportAsync({format:"PNG", constraint:{type:"SCALE", value:1.5}})`, then
   `fetch("http://localhost:9230/save?name=...", {method:"POST", body: bytes})`.
3. The sink writes straight to disk. 20 frames cost a few hundred tokens instead of megabytes of
   base64.

Enumerate first with `figma_execute` over `figma.currentPage.children` — section names usually map
directly onto the case study's own headings, which makes the storyboard nearly automatic.
