import type { BookImage, ProjectBook } from "@/lib/book/types";

const DIR = "/case-studies/symphony-kiosk";
const SLIDE = { width: 1920, height: 1080 } as const;
const SCREEN = { width: 540, height: 960 } as const;

function image(file: string, size: { width: number; height: number }, alt: string): BookImage {
  return { src: `${DIR}/${file}`, alt, ...size };
}

const WALKTHROUGH_URL = "https://www.youtube.com/watch?v=uKQQbFIGt-c";

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
            paragraphs: [
              "Oracle's Food & Beverage unit runs ordering for quick-service restaurants and stadium food courts. On busy days, the counter became the bottleneck.",
            ],
          },
          {
            kind: "image",
            image: image("book/kiosk-hero.png", { width: 1000, height: 985 }, "The Symphony Kiosk: a free-standing touch screen showing a café welcome screen"),
            caption: "Where this ends up — a guest self-ordering kiosk",
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
              "Too few staff to take every order",
              "Orders keyed in wrong at the counter",
              "Slow to order, slow to pay, slow to collect",
              "Hard for guests with disabilities or a language barrier",
            ],
          },
          { kind: "note", text: "And the shy guest at the back of the line often didn't order at all." },
          {
            kind: "callout",
            label: "The brief",
            text: "A self-ordering kiosk, hardware included, wired into the restaurant's existing system.",
          },
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
            caption: "Console, point of sale and kitchen display",
            tape: "corners",
          },
          {
            kind: "body",
            paragraphs: ["A cashier keyed each order into the point of sale before the kitchen ever saw it."],
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
          {
            kind: "list",
            items: [
              "Staff freed up to prepare and hand out food",
              "Guests enter their own order, so fewer errors",
              "Faster ordering, even for shy guests",
              "Ready alerts and easy payment",
            ],
          },
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
          { kind: "heading", text: "Get my food served quickly" },
          {
            kind: "image",
            image: image("04-usergoal1.png", SLIDE, "User goal slide: as a restaurant guest, Megan needs to order on a kiosk so her food is served quickly"),
            caption: "Megan, restaurant guest",
            tape: "corners",
          },
          { kind: "note", text: "She already knows what she wants. Every extra tap is a delay." },
        ],
      },
      right: {
        id: "goals-quiet",
        blocks: [
          { kind: "kicker", text: "User goal 02" },
          { kind: "heading", text: "Order without talking to anyone" },
          {
            kind: "image",
            image: image("05-usergoal2.png", SLIDE, "User goal slide: Luffy wants food served without human interaction because of introversion, distancing, language or anxiety"),
            caption: "Luffy, restaurant guest",
            tape: "corners",
          },
          { kind: "note", text: "Introversion, social distancing, a language barrier, social anxiety. All real reasons.", align: "end" },
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
          {
            kind: "body",
            paragraphs: [
              "Watching guests order, two mental models kept showing up. Each needs a different path through the same menu.",
            ],
          },
          {
            kind: "list",
            items: ["Express mode: knows exactly what to order", "Browsing mode: wants to explore the options"],
          },
          { kind: "note", text: "Serve both without slowing either one down." },
        ],
      },
      right: {
        id: "personas-slide",
        blocks: [
          {
            kind: "image",
            image: image("06-persona.png", SLIDE, "Persona slide: express mode guests know what they want; browsing mode guests want to explore their options"),
            caption: "Two personas, based on mental model",
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
            kind: "body",
            paragraphs: ["We split a visit into three phases and picked metrics for each, starting with express guests."],
          },
          {
            kind: "list",
            ordered: true,
            items: [
              "Pre-order: time to find a stand, wait to order",
              "Order and pay: taps, completion, accuracy, payment success",
              "Post-order: pickup wait, clear pickup info, time away",
            ],
          },
        ],
      },
      right: {
        id: "success-matrix",
        blocks: [
          {
            kind: "image",
            image: image("07-success-matrix.png", SLIDE, "Success metrics slide listing pre-order, order and pay, and post-order measures"),
            caption: "Success matrix. Use the loupe for the small print",
            tape: "corners",
          },
          { kind: "note", text: "Order accuracy is where a kiosk should beat a busy cashier." },
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
            caption: "Browse → decide → queue → order → pay → collect → return",
            tape: "top",
          },
        ],
      },
      right: {
        id: "journey-pain",
        blocks: [
          { kind: "heading", text: "Where it hurts" },
          {
            kind: "body",
            paragraphs: [
              "Browsing guests wander before they queue. Express guests decide first, then hunt for the stand. Both paths meet at the queue.",
            ],
          },
          {
            kind: "list",
            items: [
              "Deciding and queueing hurt, in person and on a kiosk",
              "Ordering adds friction only on the kiosk",
              "Collecting food is a kiosk-only pain point",
              "Getting back to the event hurts everyone",
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
          { kind: "note", text: "Up to 10 condiment groups on one item. The item screen had to cope." },
        ],
      },
      right: {
        id: "data-edges",
        blocks: [
          { kind: "heading", text: "Edge cases, counted" },
          {
            kind: "image",
            image: image("10-shape-of-data2.png", SLIDE, "More menu data: items per category, advisory length, images per item, available discounts and items per order"),
            caption: "Discounts, advisories, images, basket size",
            tape: "top",
          },
          {
            kind: "body",
            paragraphs: ["A typical order holds three or four items, but ten discounts can apply, so the cart had to stay readable at the extremes."],
          },
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
            caption: "General · Build order · Checkout · Post payment",
            tape: "corners",
          },
          {
            kind: "body",
            paragraphs: ["Built after talking to guests and staff about everything from walking in to getting the food."],
          },
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
          {
            kind: "body",
            paragraphs: ["Then the map was split into smaller task flows that developers could build and test in phases."],
          },
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
            caption: "Welcome, item, upsell and tip, tested with users",
          },
          { kind: "note", text: "Every unique screen drawn in portrait and landscape." },
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
            text: "Flows went to developers to build and test in phases.",
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
