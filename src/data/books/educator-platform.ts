import type { BookImage, ProjectBook } from "@/lib/book/types";

const DIR = "/case-studies/educator-platform/book";

function image(file: string, width: number, height: number, alt: string): BookImage {
  return { src: `${DIR}/${file}`, alt, width, height };
}

const WALKTHROUGH_URL = "https://www.youtube.com/watch?v=ZfmJpMIkmGc";

/**
 * Redesigning how teachers assign work in Toddle's assignments module: three
 * problems, the research into dates, states and permissions, and the final
 * assign flow for tasks, learning experiences, assessments and worksheets.
 */
export const educatorPlatform: ProjectBook = {
  slug: "educator-platform",
  title: "Educator Platform",
  spreads: [
    {
      id: "problem",
      title: "The problem",
      caption: "A most-used module, with dates that confused teachers.",
      left: {
        id: "problem-intro",
        blocks: [
          { kind: "kicker", text: "Field notes · Educator Platform" },
          { kind: "heading", text: "One of the most-used modules" },
          {
            kind: "body",
            paragraphs: [
              "Toddle's assignments module is one of its most used: teachers assign tasks, learning experiences, worksheets and assessments.",
            ],
          },
          {
            kind: "image",
            image: image(
              "hero.png",
              1600,
              768,
              "Assign worksheet modal on a desktop monitor: settings for two classes, with students, opens on, due on and closes on",
            ),
            caption: "The redesigned assign flow",
            tape: "corners",
            tilt: -1.5,
          },
        ],
      },
      right: {
        id: "problem-list",
        blocks: [
          { kind: "heading", text: "Three problems" },
          {
            kind: "list",
            items: [
              "Locked at the due date: no late submissions",
              "Due and scheduled dates without explanation",
              "Visibility set for the whole program",
            ],
          },
          { kind: "note", text: "Competitors already let teachers do more." },
        ],
      },
    },
    {
      id: "goal",
      title: "Goal and competitors",
      caption: "One goal, and how other products handle assigning.",
      left: {
        id: "goal-dates",
        blocks: [
          { kind: "kicker", text: "User goal" },
          { kind: "heading", text: "Dates that make sense" },
          {
            kind: "body",
            paragraphs: [
              "Make due dates, schedule dates and close dates easier to manage and understand, with simpler terms for teachers and students.",
            ],
          },
          { kind: "note", text: "Easier to track, for students and teachers." },
        ],
      },
      right: {
        id: "goal-competitors",
        blocks: [
          { kind: "kicker", text: "Competitor analysis" },
          { kind: "heading", text: "How others assign" },
          {
            kind: "body",
            paragraphs: ["I compared competitors' assign flows and the patterns they shared, from creating a task to assigning it."],
          },
          {
            kind: "image",
            image: image(
              "observed.png",
              1600,
              1226,
              "Observed patterns: four assign flows from create task to assign, through classes, due date, schedule date and permissions",
            ),
            caption: "Observed patterns",
            tape: "corners",
            tilt: 1,
          },
        ],
      },
    },
    {
      id: "journey",
      title: "Journey and states",
      caption: "Before, during and after a task, and every combination of dates.",
      left: {
        id: "journey-phases",
        blocks: [
          { kind: "kicker", text: "User journey" },
          { kind: "heading", text: "Before, during, after" },
          {
            kind: "body",
            paragraphs: ["I broke assigning into three phases: before the task is assigned, during it, and after it's completed."],
          },
          {
            kind: "image",
            image: image(
              "journey.png",
              1600,
              750,
              "User journey map for assignments: before, during and after a task, branching into creation, classes, permissions and dates",
            ),
            caption: "User journey: assignments",
            tape: "top",
          },
        ],
      },
      right: {
        id: "journey-matrix",
        blocks: [
          { kind: "kicker", text: "Data matrix" },
          { kind: "heading", text: "Every state of a task" },
          {
            kind: "body",
            paragraphs: [
              "Available, due and close dates, and timed worksheets, together decide whether submissions are marked late or close.",
            ],
          },
          {
            kind: "image",
            image: image(
              "data-matrix.png",
              1200,
              1281,
              "Matrix of available date, due date, close date and timed worksheet, with outcomes like marked late or closes on the close date",
            ),
            caption: "Which dates are set, and what follows",
            tilt: -1,
          },
        ],
      },
    },
    {
      id: "permissions",
      title: "Visibility and permissions",
      caption: "What students can see, and when they can still submit.",
      left: {
        id: "permissions-use-cases",
        blocks: [
          { kind: "kicker", text: "Use cases" },
          { kind: "heading", text: "Visibility and submission" },
          {
            kind: "body",
            paragraphs: [
              "Use cases set what students see before the start date, and whether they can still submit after the due date.",
            ],
          },
          {
            kind: "image",
            image: image(
              "use-cases.png",
              1400,
              1365,
              "Use cases: visible before the start date, read-only, or hidden; and allow or block submissions after the due date",
            ),
            caption: "Visibility and submission use cases",
            tape: "corners",
            tilt: 1.5,
          },
        ],
      },
      right: {
        id: "permissions-config",
        blocks: [
          { kind: "kicker", text: "Permissions" },
          { kind: "heading", text: "Who sees what, when" },
          {
            kind: "body",
            paragraphs: [
              "Past, present and future tasks change what students, parents and teachers see, so we defined visibility permissions.",
            ],
          },
          {
            kind: "image",
            image: image(
              "permissions.png",
              1200,
              1664,
              "Permission flowchart: tasks assigned in the past, today or future, with visibility and submission options",
            ),
            caption: "Permission configuration",
            tilt: -1,
          },
        ],
      },
    },
    {
      id: "time",
      title: "Time series",
      caption: "Three states, four phases, one map.",
      left: {
        id: "time-phases",
        blocks: [
          { kind: "kicker", text: "Time series" },
          { kind: "heading", text: "Three states, four phases" },
          {
            kind: "list",
            ordered: true,
            items: ["Before the start date", "Start date to due date", "Due date to close date", "After the close date"],
          },
          { kind: "note", text: "Tracked for drafts, assigned and completed tasks." },
        ],
      },
      right: {
        id: "time-map",
        blocks: [
          { kind: "heading", text: "Mapped in full" },
          {
            kind: "body",
            paragraphs: ["Each state traced through each phase, from drafts to completed."],
          },
          {
            kind: "image",
            image: image(
              "time-series.png",
              1600,
              1114,
              "Time series board: drafts, assigned and completed tasks traced across four phases, with decision points and outcomes",
            ),
            caption: "States across phases",
            tape: "corners",
          },
        ],
      },
    },
    {
      id: "hifi",
      title: "High fidelity",
      caption: "Final designs for the assign flow.",
      left: {
        id: "hifi-timeline",
        blocks: [
          { kind: "kicker", text: "High fidelity" },
          { kind: "heading", text: "Advanced timeline settings" },
          {
            kind: "body",
            paragraphs: [
              "Teachers choose when a task opens, and set a close date after which submissions are no longer accepted.",
            ],
          },
          {
            kind: "image",
            image: image(
              "timeline-settings.png",
              1822,
              1040,
              "Assign modal with advanced timeline settings: task opens on a set date, and submissions close after a set date",
            ),
            caption: "Opens on a set date, closes after one",
            tape: "top",
            tilt: -1,
          },
        ],
      },
      right: {
        id: "hifi-classes",
        blocks: [
          { kind: "heading", text: "A class at a time" },
          {
            kind: "body",
            paragraphs: ["Each class gets its own students, and its own opens on, due on and closes on dates."],
          },
          {
            kind: "image",
            image: image(
              "classes.png",
              1600,
              692,
              "Assign modal with Class 1A and Class 1B, each with students, opens on, due on and closes on, and a student picker",
            ),
            caption: "Two classes, their own dates",
            tape: "corners",
            tilt: 1.5,
          },
        ],
      },
    },
    {
      id: "worksheets",
      title: "Worksheets",
      caption: "Worksheets, and how the redesign answers each problem.",
      left: {
        id: "worksheets-students",
        blocks: [
          { kind: "kicker", text: "Worksheets" },
          { kind: "heading", text: "Picking students" },
          {
            kind: "body",
            paragraphs: ["In the worksheet flow, teachers can pick individual students."],
          },
          {
            kind: "image",
            image: image(
              "students.png",
              906,
              512,
              "Worksheet assign modal for Class 1B: one student chosen from the list, with opens on, due on and closes on dates",
            ),
            caption: "Assigning a worksheet to one student",
            tape: "corners",
            tilt: -1.5,
          },
        ],
      },
      right: {
        id: "worksheets-answers",
        blocks: [
          { kind: "heading", text: "What changed for teachers" },
          {
            kind: "list",
            items: [
              "A close date after the due date",
              "A summary of what each date means",
              "Visibility set for each assignment",
              "Different dates for each class",
            ],
          },
          { kind: "note", text: "Three problems answered, plus dates for each class." },
        ],
      },
    },
    {
      id: "handoff",
      title: "Handoff",
      caption: "Built and handed off to developers.",
      left: {
        id: "handoff-built",
        blocks: [
          { kind: "kicker", text: "Handoff" },
          { kind: "heading", text: "Built and handed off" },
          {
            kind: "body",
            paragraphs: ["That's how the assignment workflow was built and handed off to developers."],
          },
          { kind: "note", text: "Quick tasks, learning experiences, assessments and worksheets." },
        ],
      },
      right: {
        id: "handoff-more",
        blocks: [
          { kind: "heading", text: "The whole story" },
          {
            kind: "body",
            paragraphs: ["From competitor patterns and data to journeys, permissions and time series."],
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
