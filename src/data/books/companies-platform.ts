import type { BookImage, ProjectBook } from "@/lib/book/types";

const DIR = "/case-studies/companies-platform/book";
/** The final screens, exported at 1366 wide. */
const SCREEN = { width: 1366, height: 657 } as const;

function image(file: string, size: { width: number; height: number }, alt: string): BookImage {
  return { src: `${DIR}/${file}`, alt, ...size };
}

const WALKTHROUGH_URL = "https://www.youtube.com/watch?v=-_T9MjzcvQQ";

/**
 * From watching how founders and finance managers used Recur Club's companies
 * platform, to a restructured information architecture and its visual design.
 */
export const companiesPlatform: ProjectBook = {
  slug: "companies-platform",
  title: "Companies Platform",
  spreads: [
    {
      id: "problem",
      title: "The problem",
      caption: "More startups arrived than the team could onboard.",
      left: {
        id: "problem-intro",
        blocks: [
          { kind: "kicker", text: "Field notes · Companies Platform" },
          { kind: "heading", text: "Onboarding outgrew the team" },
          {
            kind: "body",
            paragraphs: [
              "Recur Club finances startups. Its customer success and business teams handled every startup, until far too many arrived.",
            ],
          },
          {
            kind: "image",
            image: image(
              "platform.png",
              { width: 1400, height: 1037 },
              "The Recur companies platform on a desktop monitor: trade limit, scheduled collections, upcoming payments and tradebook",
            ),
            caption: "The companies platform",
            tape: "corners",
            tilt: -1.5,
          },
        ],
      },
      right: {
        id: "problem-goal",
        blocks: [
          { kind: "heading", text: "A product for two personas" },
          {
            kind: "body",
            paragraphs: [
              "The goal: a seamless experience for the founder and the finance manager, from raising debt capital to repayments.",
            ],
          },
          { kind: "note", text: "One product beside the investor portal, admin and insights." },
        ],
      },
    },
    {
      id: "usage",
      title: "Watching real use",
      caption: "Recordings, heatmaps and funnels before any interviews.",
      left: {
        id: "usage-hotjar",
        blocks: [
          { kind: "kicker", text: "Hotjar" },
          { kind: "heading", text: "Watching real sessions" },
          {
            kind: "list",
            items: [
              "Pain points in every module",
              "Drop-off on each page",
              "Average time on each page",
              "Paths people took to finish a task",
            ],
          },
          { kind: "note", text: "Heatmaps showed how people used it." },
        ],
      },
      right: {
        id: "usage-mixpanel",
        blocks: [
          { kind: "kicker", text: "Mixpanel" },
          { kind: "heading", text: "Who signs in, and when" },
          {
            kind: "body",
            paragraphs: ["Mixpanel showed when people came back after sign-up, and how often each persona signed in."],
          },
          {
            kind: "image",
            image: image(
              "sign-ins.png",
              { width: 1400, height: 1082 },
              "Sticky-note chart of sign-ins for CEO, CFO, director and finance manager before and after listing, and page visits after listing",
            ),
            caption: "Sign-ins by persona, before and after listing",
            tilt: 1.5,
          },
        ],
      },
    },
    {
      id: "drop-off",
      title: "Where people dropped off",
      caption: "The most-used report sat many clicks deep.",
      left: {
        id: "drop-off-flows",
        blocks: [
          { kind: "kicker", text: "Drop-off analysis" },
          { kind: "heading", text: "Every workflow, step by step" },
          {
            kind: "body",
            paragraphs: [
              "Dashboard, finances, reports, then the document: I measured how many people made it through each step.",
            ],
          },
          {
            kind: "image",
            image: image(
              "drop-off.png",
              { width: 1400, height: 665 },
              "Drop-off flows from dashboard to finances, reports, a statement, month selection and download, with the share reaching each step",
            ),
            caption: "Compliance downloads, step by step",
            tape: "top",
          },
        ],
      },
      right: {
        id: "drop-off-findings",
        blocks: [
          { kind: "heading", text: "What the numbers said" },
          {
            kind: "list",
            items: [
              "Sign-ins fell after listing, for every persona",
              "Tradebook drew the most visits after listing",
              "Accounting statements: most used, many clicks away",
            ],
          },
          { kind: "note", text: "Only 2.3% reached a balance confirmation download." },
        ],
      },
    },
    {
      id: "interviews",
      title: "Talking to companies",
      caption: "Interviews first, then a heuristic review of every page.",
      left: {
        id: "interviews-questions",
        blocks: [
          { kind: "kicker", text: "Interviews" },
          { kind: "heading", text: "Questions for companies" },
          {
            kind: "list",
            items: [
              "Where do the onboarding files come from?",
              "How is the finance manager added?",
              "How are repayments made and tracked?",
              "How are financial reports made?",
            ],
          },
          { kind: "note", text: "Asked during regular check-ins with companies." },
        ],
      },
      right: {
        id: "interviews-review",
        blocks: [
          { kind: "kicker", text: "UX review" },
          { kind: "heading", text: "Reviewed against heuristics" },
          {
            kind: "body",
            paragraphs: ["With the pain points in hand, I reviewed every page against Jakob Nielsen's heuristics."],
          },
          {
            kind: "image",
            image: image(
              "review.png",
              { width: 1000, height: 330 },
              "Onboarding screen with review notes on the document checklist, capital fields, dropdown spacing and a hard-to-find log out",
            ),
            caption: "Onboarding, annotated",
            tape: "corners",
          },
        ],
      },
    },
    {
      id: "structure",
      title: "A new structure",
      caption: "The information architecture, rebuilt from the findings.",
      left: {
        id: "structure-modules",
        blocks: [
          { kind: "kicker", text: "Information architecture" },
          { kind: "heading", text: "Restructuring the product" },
          {
            kind: "body",
            paragraphs: [
              "From the findings, I restructured the information architecture, from sign-in to every module behind the dashboard.",
            ],
          },
          {
            kind: "image",
            image: image(
              "ia-nav.png",
              { width: 554, height: 700 },
              "Navigation map: dashboard, trade, tradebook, finances, data vault, notifications, profile, deal chest, insights and collections",
            ),
            caption: "Dashboard and its modules",
            tilt: -1,
          },
        ],
      },
      right: {
        id: "structure-entry",
        blocks: [
          { kind: "heading", text: "Getting in" },
          {
            kind: "body",
            paragraphs: ["Sign-in, login with OTP, sign-up, verification and getting started all lead into the dashboard."],
          },
          {
            kind: "image",
            image: image(
              "ia-entry.png",
              { width: 520, height: 640 },
              "Entry flow map: landing page to sign in, login with OTP, forgot password, sign-up, verification and get started, then the dashboard",
            ),
            caption: "Sign in, sign up, get started",
            tilt: 1.5,
          },
        ],
      },
    },
    {
      id: "navigation",
      title: "The new navigation",
      caption: "The visual design for the restructured navigation.",
      left: {
        id: "navigation-dashboard",
        blocks: [
          { kind: "kicker", text: "Visual design" },
          { kind: "heading", text: "The new navigation" },
          {
            kind: "body",
            paragraphs: ["After the findings, I built the visual design for the new navigation flow."],
          },
          {
            kind: "image",
            image: image(
              "dashboard.png",
              SCREEN,
              "Dashboard greeting the user, with trade limit, total trading limit, payout received, trade price and upcoming payment cards",
            ),
            caption: "Dashboard",
            tape: "corners",
            tilt: -1,
          },
        ],
      },
      right: {
        id: "navigation-tradebook",
        blocks: [
          { kind: "heading", text: "Trades, at a glance" },
          {
            kind: "body",
            paragraphs: ["Tradebook lists every trade with its investor, payout, payments made and status."],
          },
          {
            kind: "image",
            image: image(
              "tradebook.png",
              SCREEN,
              "Tradebook table: trade date, investor name, payout, payments, payment overview with progress, and status",
            ),
            caption: "Tradebook",
            tape: "top",
          },
        ],
      },
    },
    {
      id: "finances",
      title: "Finances and help",
      caption: "Money matters under one heading, and a person to ask.",
      left: {
        id: "finances-transactions",
        blocks: [
          { kind: "heading", text: "Finances, together" },
          {
            kind: "body",
            paragraphs: ["Transactions, reports and invoices sit together under Finances."],
          },
          {
            kind: "image",
            image: image(
              "transactions.png",
              { width: 1366, height: 658 },
              "Finances transactions overview: a bar chart of payments, a donut chart of payouts, and scheduled and recent payments",
            ),
            caption: "Finances: transactions",
            tape: "corners",
            tilt: 1,
          },
        ],
      },
      right: {
        id: "finances-help",
        blocks: [
          { kind: "heading", text: "Help with a name" },
          {
            kind: "body",
            paragraphs: [
              "The help center lists a dedicated growth partner and a data specialist, each with a way to schedule a call.",
            ],
          },
          {
            kind: "image",
            image: image(
              "help.png",
              SCREEN,
              "Help center with links to help and contact us, and cards for a dedicated growth partner and a data specialist",
            ),
            caption: "Help center",
            tilt: -1.5,
          },
        ],
      },
    },
    {
      id: "outcome",
      title: "Outcome",
      caption: "Fewer queries, and room for new features.",
      left: {
        id: "outcome-result",
        blocks: [
          { kind: "kicker", text: "Outcome" },
          { kind: "heading", text: "What changed" },
          {
            kind: "body",
            paragraphs: ["After the restructure, the number of queries dropped and customers gave positive feedback."],
          },
          { kind: "note", text: "Next came new feature requests and process standardization." },
        ],
      },
      right: {
        id: "outcome-more",
        blocks: [
          { kind: "heading", text: "The whole story" },
          {
            kind: "body",
            paragraphs: ["From recordings and funnels to interviews, a heuristic review and a new structure."],
          },
          {
            kind: "callout",
            label: "See more",
            text: "The walkthrough, or every step below.",
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
