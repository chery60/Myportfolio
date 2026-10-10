import type { BookImage, ProjectBook } from "@/lib/book/types";

const DIR = "/case-studies/user-management/book";
/** Presentation slides and screens, saved at 1600 × 900. */
const SLIDE = { width: 1600, height: 900 } as const;

function image(file: string, size: { width: number; height: number }, alt: string): BookImage {
  return { src: `${DIR}/${file}`, alt, ...size };
}

const WALKTHROUGH_URL = "https://www.youtube.com/watch?v=jDgsob_AObQ";

/**
 * One place for Oracle Food and Beverage administrators to add and manage
 * users across EMC, Back Office and point of sale: the known and unknown
 * problems, the data, the flows, and the screens handed off to developers.
 */
export const userManagement: ProjectBook = {
  slug: "user-management",
  title: "User Management",
  spreads: [
    {
      id: "problem",
      title: "The problem",
      caption: "Every product kept its own users, so admins managed each separately.",
      left: {
        id: "problem-intro",
        blocks: [
          { kind: "kicker", text: "Field notes · User Management" },
          { kind: "heading", text: "A user system per product" },
          {
            kind: "body",
            paragraphs: [
              "Oracle Food and Beverage runs EMC, Back Office, point of sale and kitchen displays. Each kept its own users.",
            ],
          },
          {
            kind: "image",
            image: image(
              "hero.png",
              { width: 1600, height: 763 },
              "User management on a laptop: a new user form with user information and point of sale settings",
            ),
            caption: "One place to manage users",
            tape: "corners",
            tilt: -1.5,
          },
        ],
      },
      right: {
        id: "problem-hmw",
        blocks: [
          { kind: "kicker", text: "How might we" },
          { kind: "heading", text: "One platform for access" },
          {
            kind: "body",
            paragraphs: [
              "How might we help an administrator add and manage the access of every employee across Back Office, EMC and POS from one platform?",
            ],
          },
          {
            kind: "image",
            image: image(
              "initiative.png",
              SLIDE,
              "Slide: the user management initiative, its business goals, and target markets from hotels to quick service",
            ),
            caption: "The initiative and its business goals",
            tilt: 1,
          },
        ],
      },
    },
    {
      id: "unknowns",
      title: "Known and unknown",
      caption: "Two architectures, two data flows, one set of users.",
      left: {
        id: "unknowns-known",
        blocks: [
          { kind: "kicker", text: "Known problems" },
          { kind: "heading", text: "What we knew going in" },
          {
            kind: "list",
            items: [
              "Two architectures: OJET 6 and OJET 12",
              "Different data flows and database tables",
              "Users from both products, migrated together",
              "Shared employees across zones and locations",
            ],
          },
          { kind: "note", text: "And two workflows: with labor management, and without." },
        ],
      },
      right: {
        id: "unknowns-unknown",
        blocks: [
          { kind: "kicker", text: "Unknown problems" },
          { kind: "heading", text: "What we had yet to solve" },
          {
            kind: "list",
            items: ["The right information architecture", "Component mismatches", "Screen responsiveness"],
          },
          { kind: "note", text: "IA reworked after testing lo-fi flows with users." },
        ],
      },
    },
    {
      id: "goals",
      title: "User goals",
      caption: "Defined with PMs and stakeholders before any screens.",
      left: {
        id: "goals-add",
        blocks: [
          { kind: "kicker", text: "User goal" },
          { kind: "heading", text: "Add a user, assign access" },
          {
            kind: "body",
            paragraphs: ["I worked with PMs and stakeholders to define every user goal the system had to meet."],
          },
          {
            kind: "image",
            image: image(
              "goal-add-user.png",
              SLIDE,
              "User goal slide: a system administrator needs to add users to assign roles, locations and revenue centers",
            ),
            caption: "System administrator: add a user",
            tape: "corners",
            tilt: -1,
          },
        ],
      },
      right: {
        id: "goals-workflow",
        blocks: [
          { kind: "heading", text: "One workflow, every app" },
          {
            kind: "body",
            paragraphs: [
              "An administrator needs a single workflow to onboard and manage users across all applications, from a common place.",
            ],
          },
          {
            kind: "image",
            image: image(
              "goal-one-workflow.png",
              SLIDE,
              "User goal slide: an administrator needs a single workflow to onboard and manage users across all applications",
            ),
            caption: "Administrator: one common place",
            tape: "top",
            tilt: 1.5,
          },
        ],
      },
    },
    {
      id: "approach",
      title: "The approach",
      caption: "An in-between component library, and the data first.",
      left: {
        id: "approach-stack",
        blocks: [
          { kind: "kicker", text: "Approach" },
          { kind: "heading", text: "Bridging two stacks" },
          {
            kind: "body",
            paragraphs: [
              "Moving all of Back Office to OJET 12 for the Redwood design system would take too long. So user management used ALTA SC, an intermediate component library.",
            ],
          },
          { kind: "note", text: "Then a list of supported components, and a lo-fi flow." },
        ],
      },
      right: {
        id: "approach-data",
        blocks: [
          { kind: "kicker", text: "Shape of data" },
          { kind: "heading", text: "Data before layout" },
          {
            kind: "body",
            paragraphs: ["With stakeholders, I mapped the data: how many locations, revenue centers and roles one user can have."],
          },
          {
            kind: "image",
            image: image(
              "shape-of-data.png",
              { width: 1600, height: 973 },
              "Data cards: users added at a time, and locations, revenue centers, roles and enterprise locations per user, with typical ranges",
            ),
            caption: "Minimum, typical and maximum per user",
            tape: "corners",
          },
        ],
      },
    },
    {
      id: "users",
      title: "Finding users",
      caption: "Search for administrators, and two workflows to support.",
      left: {
        id: "users-search",
        blocks: [
          { kind: "kicker", text: "Search" },
          { kind: "heading", text: "Filters for administrators" },
          {
            kind: "body",
            paragraphs: [
              "Users from both products land in one table, so I added an advanced search and asked admins which columns they need.",
            ],
          },
          {
            kind: "image",
            image: image(
              "search.png",
              SLIDE,
              "Initial chips for status and application access, then dynamic chips for roles, locations and revenue centers",
            ),
            caption: "Initial chips, then dynamic filters",
            tape: "top",
            tilt: -1,
          },
        ],
      },
      right: {
        id: "users-labor",
        blocks: [
          { kind: "kicker", text: "Labor management" },
          { kind: "heading", text: "Two workflows" },
          {
            kind: "body",
            paragraphs: [
              "Labor management changes some settings across the workflow, so I worked through how the system behaves with stakeholders.",
            ],
          },
          {
            kind: "image",
            image: image(
              "without-labor.png",
              SLIDE,
              "Slide of workflows without labor management: end-to-end flow, search, password reset, add user, edit user, copy a user template",
            ),
            caption: "Workflows without labor management",
            tilt: 1.5,
          },
        ],
      },
    },
    {
      id: "flows",
      title: "From legacy to flow",
      caption: "Where administrators started, and the flow that replaced it.",
      left: {
        id: "flows-legacy",
        blocks: [
          { kind: "kicker", text: "Legacy UI" },
          { kind: "heading", text: "Where it started" },
          {
            kind: "body",
            paragraphs: [
              "In the legacy console, adding an employee meant a record, general details, then property and revenue center records, step by step.",
            ],
          },
          {
            kind: "image",
            image: image(
              "legacy.png",
              { width: 936, height: 652 },
              "Legacy employee maintenance screen: employee record fields, general settings, information lines and EMC login",
            ),
            caption: "Employee maintenance, legacy",
            tape: "corners",
            tilt: -1.5,
          },
        ],
      },
      right: {
        id: "flows-end-to-end",
        blocks: [
          { kind: "kicker", text: "User flow" },
          { kind: "heading", text: "Every path, end to end" },
          {
            kind: "body",
            paragraphs: ["After testing a low-fidelity flow with real users, I reworked it with their feedback and the developers'."],
          },
          {
            kind: "image",
            image: image(
              "user-flow.png",
              { width: 1800, height: 697 },
              "End-to-end user flow: users dashboard to add user, then user details, point of sale, EMC and Back Office steps",
            ),
            caption: "The end-to-end user flow",
            tape: "top",
          },
        ],
      },
    },
    {
      id: "forms",
      title: "Reworking the form",
      caption: "The current form marked up, then a simpler low-fidelity one.",
      left: {
        id: "forms-current",
        blocks: [
          { kind: "kicker", text: "Review" },
          { kind: "heading", text: "The current form" },
          {
            kind: "body",
            paragraphs: ["I went through the current form, marking fields to remove and where users needed guidance."],
          },
          {
            kind: "image",
            image: image(
              "current-form.png",
              { width: 1600, height: 925 },
              "Current user form with general, payroll and cloud access fields, and notes on fields to remove and dialogs needed",
            ),
            caption: "Current form, marked up",
            tape: "corners",
            tilt: 1,
          },
        ],
      },
      right: {
        id: "forms-lofi",
        blocks: [
          { kind: "kicker", text: "Low fidelity" },
          { kind: "heading", text: "A new user form" },
          {
            kind: "body",
            paragraphs: [
              "One form for user information, then tabs for general settings, exemptions, payroll, point of sale and more.",
            ],
          },
          {
            kind: "image",
            image: image(
              "lofi-form.png",
              SLIDE,
              "Low-fidelity new user form: user information, then tabs for general, exemptions, payroll, status, point of sale and more",
            ),
            caption: "Low-fidelity new user form",
            tilt: -1,
          },
        ],
      },
    },
    {
      id: "hifi",
      title: "High fidelity",
      caption: "Responsive screens in OJET 16, with every error case handled.",
      left: {
        id: "hifi-users",
        blocks: [
          { kind: "kicker", text: "High fidelity" },
          { kind: "heading", text: "Users, at a glance" },
          {
            kind: "body",
            paragraphs: ["After interviews and developer reviews, I built responsive high-fidelity screens in OJET 16."],
          },
          {
            kind: "image",
            image: image(
              "users.png",
              SLIDE,
              "Users table in Oracle Food and Beverage administration: name, username, email, POS object number, payroll ID and status",
            ),
            caption: "Users",
            tape: "corners",
            tilt: -1,
          },
        ],
      },
      right: {
        id: "hifi-create",
        blocks: [
          { kind: "heading", text: "Creating a user" },
          {
            kind: "body",
            paragraphs: ["I worked through every error case and handled each one."],
          },
          {
            kind: "image",
            image: image(
              "create-user.png",
              SLIDE,
              "Create user screen: user information, copy settings from an existing user, and settings tabs with location and time zone",
            ),
            caption: "Create user",
            tape: "top",
            tilt: 1.5,
          },
        ],
      },
    },
    {
      id: "handoff",
      title: "Accessibility and handoff",
      caption: "Accessibility specs, then handoff to developers.",
      left: {
        id: "handoff-a11y",
        blocks: [
          { kind: "kicker", text: "A11Y specs" },
          { kind: "heading", text: "Accessibility specs" },
          {
            kind: "body",
            paragraphs: [
              "I wrote A11Y specs: focus on load, list captions, button labels, polite live announcements.",
            ],
          },
          {
            kind: "image",
            image: image(
              "a11y-assign.png",
              SLIDE,
              "Accessibility spec for assigning locations and revenue centers: focus on load, list captions, aria-labels and live success messages",
            ),
            caption: "Assign locations and revenue centers",
            tape: "corners",
          },
        ],
      },
      right: {
        id: "handoff-learned",
        blocks: [
          { kind: "kicker", text: "Handoff" },
          { kind: "heading", text: "What I took away" },
          {
            kind: "body",
            paragraphs: [
              "That's how the workflow was built and handed off to developers, learning a lot from senior designers and stakeholders on the way.",
            ],
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
