import type { BookImage, ProjectBook } from "@/lib/book/types";

const DIR = "/case-studies/symphony-kiosk";
const SLIDE = { width: 1920, height: 1080 } as const;
const SCREEN = { width: 540, height: 960 } as const;

function image(file: string, size: { width: number; height: number }, alt: string): BookImage {
  return { src: `${DIR}/${file}`, alt, ...size };
}

const WALKTHROUGH_URL = "https://www.youtube.com/watch?v=uKQQbFIGt-c";

/**
 * Pages are landscape sketchbook pages: a heading, one picture and a short
 * handwritten line. The full story stays in the case study below the book.
 */
export const symphonyKiosk: ProjectBook = {
  slug: "symphony-kiosk",
  title: "Symphony Kiosk",
  spreads: [
    {
      id: "problem",
      title: "The problem",
      caption: "Stadium food counters couldn't keep up with the rush.",
      left: {
        id: "problem-intro",
        blocks: [
          { kind: "kicker", text: "Field notes · Symphony Kiosk" },
          { kind: "heading", text: "Too many orders, too few hands" },
          {
            kind: "body",
            paragraphs: ["Stadium food courts and quick-service counters jammed up on every busy day."],
          },
          {
            kind: "image",
            image: image("book/kiosk-hero.png", { width: 1000, height: 985 }, "The Symphony Kiosk: a free-standing touch screen showing a café welcome screen"),
            caption: "Where it ends up: a self-ordering kiosk",
            tape: "corners",
            tilt: -2,
          },
        ],
      },
      right: {
        id: "problem-pains",
        blocks: [
          { kind: "heading", text: "What kept going wrong" },
          {
            kind: "list",
            items: [
              "Too few staff for every order",
              "Orders keyed in wrong",
              "Slow to order, pay and collect",
              "Hard with a disability or language barrier",
            ],
          },
          { kind: "note", text: "And shy guests often didn't order at all." },
        ],
      },
    },
    {
      id: "kiosk",
      title: "Introducing the kiosk",
      caption: "A fourth piece joins the system restaurants already run.",
      left: {
        id: "kiosk-before",
        blocks: [
          { kind: "kicker", text: "Before" },
          { kind: "heading", text: "Every order went through staff" },
          {
            kind: "image",
            image: image("02-currently.png", { width: 2843, height: 1490 }, "Diagram: Enterprise Management Console, Point of Sale and Kitchen Display System connected to each other"),
            caption: "Console, point of sale, kitchen display",
            tape: "corners",
          },
        ],
      },
      right: {
        id: "kiosk-after",
        blocks: [
          { kind: "kicker", text: "After" },
          { kind: "heading", text: "Guests order for themselves" },
          {
            kind: "image",
            image: image("03-introducing-kiosk.png", { width: 2892, height: 1959 }, "Diagram: Symphony Kiosk added alongside the console, point of sale and kitchen display, connected to all three"),
            caption: "The kiosk talks to all three",
            tape: "top",
          },
          { kind: "note", text: "Fewer errors, shorter lines, staff back on the food.", align: "end" },
        ],
      },
    },
    {
      id: "goals",
      title: "User goals",
      caption: "Two guests, one kiosk: speed for one, no small talk for the other.",
      left: {
        id: "goals-speed",
        blocks: [
          { kind: "kicker", text: "User goal 01" },
          { kind: "heading", text: "Get my food, quickly" },
          {
            kind: "image",
            image: image("04-usergoal1.png", SLIDE, "User goal slide: as a restaurant guest, Megan needs to order on a kiosk so her food is served quickly"),
            caption: "Megan, restaurant guest",
            tape: "corners",
          },
          { kind: "note", text: "She knows what she wants. Every tap is a delay." },
        ],
      },
      right: {
        id: "goals-quiet",
        blocks: [
          { kind: "kicker", text: "User goal 02" },
          { kind: "heading", text: "Order without small talk" },
          {
            kind: "image",
            image: image("05-usergoal2.png", SLIDE, "User goal slide: Luffy wants food served without human interaction because of introversion, distancing, language or anxiety"),
            caption: "Luffy, restaurant guest",
            tape: "corners",
          },
          { kind: "note", text: "Introversion, distancing, language, anxiety.", align: "end" },
        ],
      },
    },
    {
      id: "personas",
      title: "Two kinds of guests",
      caption: "Personas came from mental models, not demographics.",
      left: {
        id: "personas-modes",
        blocks: [
          { kind: "kicker", text: "Persona" },
          { kind: "heading", text: "Express or browsing?" },
          { kind: "body", paragraphs: ["Watching guests order, two mental models kept showing up."] },
          { kind: "list", items: ["Express: already knows the order", "Browsing: wants to explore first"] },
          { kind: "note", text: "Serve both without slowing either." },
        ],
      },
      right: {
        id: "personas-slide",
        blocks: [
          {
            kind: "image",
            image: image("06-persona.png", SLIDE, "Persona slide: express mode guests know what they want; browsing mode guests want to explore their options"),
            caption: "Two personas, by mental model",
            tape: "top",
            tilt: 1.5,
          },
          { kind: "note", text: "Express guests set the bar for speed.", align: "end" },
        ],
      },
    },
    {
      id: "success",
      title: "Defining success",
      caption: "Three phases of a visit, each with something to measure.",
      left: {
        id: "success-phases",
        blocks: [
          { kind: "kicker", text: "Success metrics" },
          { kind: "heading", text: "Measure the whole visit" },
          {
            kind: "list",
            ordered: true,
            items: [
              "Pre-order: find a stand, wait to order",
              "Order and pay: taps, accuracy, payment",
              "Post-order: pickup wait and clarity",
            ],
          },
          { kind: "note", text: "Starting with express guests." },
        ],
      },
      right: {
        id: "success-matrix",
        blocks: [
          {
            kind: "image",
            image: image("07-success-matrix.png", SLIDE, "Success metrics slide listing pre-order, order and pay, and post-order measures"),
            caption: "Use the magnifier for the small print",
            tape: "corners",
          },
          { kind: "note", text: "Accuracy is where a kiosk beats a busy cashier." },
        ],
      },
    },
    {
      id: "journey",
      title: "The journey",
      caption: "Where in-person and kiosk pain points land on the way.",
      left: {
        id: "journey-map",
        blocks: [
          { kind: "kicker", text: "Key insight" },
          { kind: "heading", text: "Journeys × persona" },
          {
            kind: "image",
            image: image("08-user-journey.png", SLIDE, "Journey map: browse, locate, decide, queue, order, pay, collect, return, with pain points marked for in-person and kiosk ordering"),
            caption: "Browse → decide → queue → order → pay → collect",
            tape: "top",
          },
        ],
      },
      right: {
        id: "journey-pain",
        blocks: [
          { kind: "heading", text: "Where it hurts" },
          {
            kind: "list",
            items: [
              "Deciding and queueing: everywhere",
              "Ordering: only on the kiosk",
              "Collecting food: only on the kiosk",
              "Getting back to the event: everyone",
            ],
          },
          { kind: "note", text: "The kiosk had to fix more than it broke.", align: "end" },
        ],
      },
    },
    {
      id: "data",
      title: "Shape of data",
      caption: "Real menu numbers chose the components before any pixels did.",
      left: {
        id: "data-menu",
        blocks: [
          { kind: "kicker", text: "Shape of data" },
          { kind: "heading", text: "Let the menu decide the UI" },
          {
            kind: "image",
            image: image("09-shape-of-data1.png", SLIDE, "Menu data cards: price levels, condiment groups, combo items, categories, payment options and description length"),
            caption: "Minimum, maximum and typical for each",
            tape: "corners",
          },
          { kind: "note", text: "Up to 10 condiment groups on one item." },
        ],
      },
      right: {
        id: "data-edges",
        blocks: [
          { kind: "heading", text: "Edge cases, counted" },
          {
            kind: "image",
            image: image("10-shape-of-data2.png", SLIDE, "More menu data: items per category, advisory length, images per item, available discounts and items per order"),
            caption: "Discounts, advisories, basket size",
            tape: "top",
          },
          { kind: "note", text: "Three or four items is typical; ten discounts can apply.", align: "end" },
        ],
      },
    },
    {
      id: "sitemap",
      title: "From sitemap to flows",
      caption: "The whole visit, from welcome screen to receipt, on one map.",
      left: {
        id: "sitemap-map",
        blocks: [
          { kind: "kicker", text: "Approach" },
          { kind: "heading", text: "One map for the whole visit" },
          {
            kind: "image",
            image: image("book/sitemap.png", { width: 2400, height: 939 }, "Kiosk sitemap in four zones: general, build and modify order, checkout and payment, post payment"),
            caption: "General · Build · Checkout · Post payment",
            tape: "corners",
          },
          { kind: "note", text: "Built after talking to guests and staff." },
        ],
      },
      right: {
        id: "sitemap-build",
        blocks: [
          { kind: "heading", text: "Building an order" },
          {
            kind: "image",
            image: image("book/sitemap-build.png", { width: 1306, height: 1400 }, "Build and modify order flow: menu, upsell, cart, menu item, item with condiments, combo and collection page"),
            caption: "Menu, upsell, cart, item, combo",
            tape: "top",
          },
          { kind: "note", text: "Split into flows developers could ship in phases.", align: "end" },
        ],
      },
    },
    {
      id: "handoff",
      title: "Prototype and handoff",
      caption: "Low fidelity in portrait and landscape, tested, then high fidelity.",
      left: {
        id: "handoff-lofi",
        blocks: [
          { kind: "kicker", text: "Low fidelity" },
          { kind: "heading", text: "Test the flow, not the paint" },
          {
            kind: "screens",
            images: [
              image("book/lofi-idle.png", SCREEN, "Wireframe: welcome screen with start order buttons"),
              image("book/lofi-item-detail.png", SCREEN, "Wireframe: item detail with quantity and add to order"),
              image("book/lofi-upsell.png", SCREEN, "Wireframe: you might also like upsell screen"),
              image("book/lofi-tip.png", SCREEN, "Wireframe: add a tip with preset percentages"),
            ],
            caption: "Welcome, item, upsell, tip",
          },
          { kind: "note", text: "Portrait and landscape, tested with users." },
        ],
      },
      right: {
        id: "handoff-hifi",
        blocks: [
          { kind: "kicker", text: "High fidelity" },
          { kind: "heading", text: "Ready for the kitchen" },
          {
            kind: "screens",
            images: [
              image("book/hifi-1.png", SCREEN, "Kiosk welcome screen for Redwood Cafe with start order buttons in two languages"),
              image("book/hifi-3.png", SCREEN, "Kiosk screen asking whether the order is dine-in or carry-out"),
              image("book/hifi-5.png", SCREEN, "Kiosk dine-in menu with burgers and sandwiches"),
              image("book/hifi-6.png", SCREEN, "Kiosk item detail for a cheeseburger with doneness and cheese choices"),
            ],
            caption: "Welcome, order type, menu, item",
          },
          {
            kind: "callout",
            label: "Handoff",
            text: "Shipped to developers in phases.",
            links: [
              { label: "Watch the walkthrough", href: WALKTHROUGH_URL },
              { label: "Read the full case study", href: "#case-study" },
            ],
          },
        ],
      },
    },
  ],
};
