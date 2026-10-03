# Source packet — Symphony Kiosk

This replaces "the project code" that `/brag` step 1 normally reads. Everything here is drawn
from `content/symphony-kiosk.mdx`, `src/data/resume.tsx`, and the assets in
`public/case-studies/symphony-kiosk/`. **Nothing here is invented.** If a line is not supported
by one of those sources, it does not belong in the video.

## Identity

| | |
|---|---|
| Product | **Symphony Kiosk** — guest self-ordering kiosk |
| Company / year | Oracle FBGBU · 2024 |
| Role | Product designer — discovery through developer handoff |
| Venues | QSRs, fast casuals, limited-service restaurants, **stadiums** |
| Slug | `symphony-kiosk` |
| Accent | **`#a35c00`** — the toasted-amber of the kiosk's own food imagery. 5.14:1 on the house background (passes WCAG AA for normal text; `hyperframes check` gates on this). |

Oracle built the hardware too. Everything was built from scratch.

## The 9-question rubric

1. **What is it?** A guest self-ordering kiosk for Oracle's food-and-beverage platform — the
   missing entity between the Enterprise Management Console, the POS, and the Kitchen Display
   System.
2. **Strongest claim.** Eight named problems, one new entity. The kiosk removes the order-taking
   bottleneck so staff can focus on delivering food instead of writing it down.
3. **Visual hook.** The attract screen — a full-bleed food photograph under **"Redwood Cafe"**,
   with `Start Order` and `Iniciar Pedido` stacked. The bilingual button *is* the thesis.
4. **What to show.** The real prototype: attract → order type → menu → item configuration →
   tip → payment → pickup confirmation.
5. **Shortest satisfying cut.** Reel 20 s. Explainer 40 s.
6. **Tone.** `polished`. Enterprise work, shown plainly.
7. **Audio.** Reel silent. Explainer: restrained warm bed, low, fading under the end card.
8. **Share caption.** Draft at delivery, from the outcome beat.
9. **The flow worth showing** — *entry → key action → result*:
   **walk up and pick a language → configure a cheeseburger down to doneness and sauces →
   pay and get told exactly where to stand.**

## Copy that may appear verbatim

Product UI (read off the recordings — these are real strings):

- `Redwood Cafe` · `Start Order` · `Iniciar Pedido`
- `What type of order is this?` · `Dine In` · `Carry Out`
- `Dine-In Menu` · `Burgers` · `Sandwiches`
- `Cheeseburger` · `$6.50 | 700 Cal` · `Nutrition Info`
- `Doneness  Choose 1 (Required)` — Medium-Rare · Medium · Medium-Well · Well
- `Cheese  Choose 1 (Required)` · `Toppings  Choose up to 5` · `Sauces  Choose up to 4`
- `No Dairy` · `No Gluten` · `No Beef` · `No Sesame` · `No Celery` (allergen filters)
- `Add to Order | $6.50` · `Update Order | $4.20`
- `Would you like to leave a tip?` · `How would you like to pay?` · `Amount Due: $14.95`
- `Pay on Pickup` · `Credit/Debit`
- `Thank you for your order, Sai Charan!` — `Next Steps: 1. Take your receipt. 2. Go to the
  pickup area located on the left side of the counter. 3. Listen for your Name and Order Number.`

From the case study (`content/symphony-kiosk.mdx`), quotable as written:

- *"Guest self-ordering within the restaurant."*
- *"The staff to serve the orders was less."*
- *"Order entry errors."*
- *"The time to take orders was very high."*
- *"People with disabilities found it hard to give orders."*
- *"The person who is introverted in nature was unable to order their food."*
- *"Persons with language issues (mostly foreigners) are unable to order food efficiently."*
- *"Persons with introverted nature can order on their own."*

## The spine of the story

The eight problems in the write-up are abstract. **The prototype answers three of them
literally, on screen** — and that pairing is the video:

| Problem, in the write-up's words | What the UI actually does |
|---|---|
| *"Persons with language issues (mostly foreigners) are unable to order food efficiently."* | `Start Order` / `Iniciar Pedido` on the first screen |
| *"People with disabilities found it hard to give orders."* | allergen filter sheet — No Dairy, No Gluten, No Beef, No Sesame… |
| *"The person who is introverted in nature was unable to order their food."* | the whole flow completes without speaking to anyone |

Do not narrate all eight. Pick this pairing — claim, then proof — and let the screens carry it.

## Assets

`public/case-studies/symphony-kiosk/`

| File | What it shows | Use |
|---|---|---|
| `01-kiosk.png` | hero, kiosk in situ | explainer open, reel reveal |
| `02-currently.png` | the pre-kiosk EMC→POS→KDS system | problem beat |
| `03-introducing-kiosk.png` | the kiosk added to that system | approach beat |
| `04-usergoal1.png`, `05-usergoal2.png` | user goals | optional |
| `06-persona.png` | express mode vs browsing mode | strong, specific — highlight beat |
| `07-success-matrix.png` | pre-order / order-and-pay / post-order metrics | outcome beat |
| `08-user-journey.png` | journey with pain points | approach beat |
| `09-shape-of-data1.png`, `10-shape-of-data2.png` | data shape driving UI layout | optional |
| `11-kioskrecording1.webm` | **51 s**, 2000×1814 — attract → menu → item config | primary real-UI footage |
| `12-kioskrec2.webm` | **94 s**, 3456×1814 — bilingual, allergens, tip, payment, confirmation | primary real-UI footage |
| `/project-symphony-kiosk.png` | card still — **the reel's poster** | do not regenerate |

Both recordings are tall (roughly 1.1:1 and 1.9:1), **not 16:9**. Crop or inset them into the
frame; never letterbox into black bars — that reads as broken inside the card's own crop.

The two `.webm` files are VP8/VP9 and throw scattered decode errors on seek. Extract the frames
or sub-clips you need **once**, up front, into `brag-output/symphony-kiosk/footage/`, and build
the composition against those — do not have Hyperframes decode the originals per frame.

## Cautions

- The prototype is a **Figma prototype recording**, not shipped software. Say "prototype" or
  show it as one; never imply production traffic.
- There are **no measured outcome numbers** anywhere in the source. The outcome beat must be the
  designed result (the flow works end to end, handed off in phases), **not** an invented metric.
  If a percentage appears in the storyboard, it is a bug.
- `Thank you for your order, Sai Charan!` is the designer's own name in the prototype's test data.
  **Used deliberately** as the explainer's closing product beat: the "Next Steps" panel beside it
  (take your receipt, go to the pickup area, listen for your name) is the only screen that answers
  the write-up's *"The delivery of ordered food items was a pain."* The name is the designer's own,
  on their own portfolio — it reads as authorship, not as a placeholder. Not used in the reel,
  which has no room to earn it.
