import type { BookImage, ProjectBook } from "@/lib/book/types";

const DIR = "/case-studies/ai-unit-planning/book";

function image(file: string, width: number, height: number, alt: string): BookImage {
  return { src: `${DIR}/${file}`, alt, width, height };
}

const WALKTHROUGH_URL = "https://www.youtube.com/watch?v=VflbuL_Q9oE";

/**
 * The case study told in three phases: unify the planner's fields, redesign
 * template customization, then decide where AI enters. Pages carry a heading,
 * one picture or list and a short handwritten line; the full story stays in
 * the case study.
 */
export const aiUnitPlanning: ProjectBook = {
  slug: "ai-unit-planning",
  title: "AI Unit Planning",
  spreads: [
    {
      id: "problem",
      title: "The problem",
      caption: "Every curriculum had its own planner, built its own way.",
      left: {
        id: "problem-intro",
        blocks: [
          { kind: "kicker", text: "Field notes · AI Unit Planning" },
          { kind: "heading", text: "One planner, many curricula" },
          {
            kind: "body",
            paragraphs: ["At Toddle, schools plan units across PYP, MYP, DP and UbD. Each curriculum has its own template of fields."],
          },
          {
            kind: "image",
            image: image(
              "planner.png",
              1728,
              960,
              "PYP unit planner: an outline of sections on the left, the unit title and details, and transdisciplinary theme cards",
            ),
            caption: "A PYP unit planner",
            tape: "corners",
            tilt: -1.5,
          },
        ],
      },
      right: {
        id: "problem-pains",
        blocks: [
          { kind: "heading", text: "What had grown messy" },
          {
            kind: "list",
            items: [
              "Similar fields built in different ways",
              "Templates inconsistent and hard to maintain",
              "Datasets and dependencies hard to configure",
              "AI first needs to know which fields matter",
            ],
          },
          { kind: "note", text: "And a single-page planner was on its way." },
        ],
      },
    },
    {
      id: "framing",
      title: "Framing the work",
      caption: "Four use cases, and an order to work in.",
      left: {
        id: "framing-people",
        blocks: [
          { kind: "kicker", text: "Cover note" },
          { kind: "heading", text: "Who a unit plan serves" },
          {
            kind: "list",
            items: [
              "Teachers: plan quickly, teach more",
              "Teachers co-planning: co-create, keep ownership",
              "Students: a clear learning path",
              "Families: enough context to help at home",
            ],
          },
          { kind: "note", text: "Written up in Coda before any tables." },
        ],
      },
      right: {
        id: "framing-order",
        blocks: [
          { kind: "kicker", text: "Approach" },
          { kind: "heading", text: "One step at a time" },
          {
            kind: "list",
            ordered: true,
            items: ["Understand the system", "Simplify the components", "Redesign customization", "Then decide where AI enters"],
          },
          { kind: "note", text: "Planning quality first, not just AI generation." },
        ],
      },
    },
    {
      id: "fields",
      title: "Unifying the fields",
      caption: "One-off builds folded into a small, shared set of fields.",
      left: {
        id: "fields-model",
        blocks: [
          { kind: "kicker", text: "Phase 1" },
          { kind: "heading", text: "One field model" },
          {
            kind: "body",
            paragraphs: ["I audited fields across the PYP, MYP, DP and UbD planners and folded one-off builds into a smaller unified set."],
          },
          {
            kind: "image",
            image: image(
              "add-field-menu.png",
              700,
              590,
              "Add menu: add a section or existing fields, or create a rich text, text area, checklist, reflection box, card or nested checklist field",
            ),
            caption: "Create a new field: the unified set",
            tape: "top",
          },
        ],
      },
      right: {
        id: "fields-datasets",
        blocks: [
          { kind: "heading", text: "Fields fed by datasets" },
          {
            kind: "body",
            paragraphs: ["Card, checklist and nested checklist fields are tagged to a dataset of the same type, which supplies their options."],
          },
          {
            kind: "image",
            image: image(
              "theme-cards.png",
              1264,
              1166,
              "Transdisciplinary theme as six selectable cards, then transdisciplinary theme focus as a checklist",
            ),
            caption: "A card field, then a checklist field",
            tilt: 1.5,
          },
        ],
      },
    },
    {
      id: "ai-inputs",
      title: "What AI needs",
      caption: "Fields that create a unit, apart from fields that enrich it later.",
      left: {
        id: "ai-inputs-audit",
        blocks: [
          { kind: "heading", text: "Before AI can draft a unit" },
          {
            kind: "body",
            paragraphs: ["The field audit asked which fields must be filled before AI can draft a meaningful unit."],
          },
          {
            kind: "image",
            image: image(
              "unit-details.png",
              1560,
              550,
              "Unit header: add a cover image, type the unit title, then subject, start date, end date and unit hours",
            ),
            caption: "Basic details: title, subject, dates, hours",
            tape: "corners",
          },
        ],
      },
      right: {
        id: "ai-inputs-fields",
        blocks: [
          { kind: "kicker", text: "UI analysis" },
          { kind: "heading", text: "Required or optional" },
          {
            kind: "list",
            items: [
              "Unit title: required, drafted from the central idea",
              "Theme and central idea: high-signal inputs",
              "Cover image: optional, generated later",
            ],
          },
          { kind: "note", text: "Subject and theme are helpful add-ons." },
        ],
      },
    },
    {
      id: "customization",
      title: "Customizing templates",
      caption: "Admins set up datasets and fields; teachers see the planner.",
      left: {
        id: "customization-admin",
        blocks: [
          { kind: "kicker", text: "Phase 2" },
          { kind: "heading", text: "Customizing templates" },
          {
            kind: "body",
            paragraphs: ["Admins needed to configure datasets, add fields to templates, and see how each field would appear in the planner."],
          },
          {
            kind: "image",
            image: image(
              "templates.png",
              1600,
              446,
              "Admin portal list of unit plan templates with unit type, grades, usage, Toddle-managed or custom type, and status",
            ),
            caption: "Unit plan templates, in the admin portal",
            tape: "top",
          },
        ],
      },
      right: {
        id: "customization-needs",
        blocks: [
          { kind: "heading", text: "What setup had to make clear" },
          {
            kind: "list",
            items: [
              "Where a dataset applies, and who sees it",
              "Which planner field each dataset feeds",
              "Dependencies, like related concepts on subjects",
              "Mapping across PYP, MYP, DP and UbD",
            ],
          },
          { kind: "note", text: "Related concepts only appear if key concepts do." },
        ],
      },
    },
    {
      id: "visibility",
      title: "Who sees what",
      caption: "Visibility and display, set once for each template.",
      left: {
        id: "visibility-audience",
        blocks: [
          { kind: "kicker", text: "Design" },
          { kind: "heading", text: "Visible to whom" },
          {
            kind: "body",
            paragraphs: ["Field by field, admins choose what students, parents and the curriculum website see once a template is in use."],
          },
          {
            kind: "image",
            image: image(
              "visibility-settings.png",
              1200,
              950,
              "Visibility settings: for each field, choices for visible to student, visible to parents and visible in the curriculum website",
            ),
            caption: "Visibility settings, field by field",
            tape: "corners",
            tilt: -1,
          },
        ],
      },
      right: {
        id: "visibility-planner",
        blocks: [
          { kind: "heading", text: "Shaping the planner" },
          {
            kind: "body",
            paragraphs: ["The exploration also covered default display, bulk apply, reordering, tabs, sections and hiding fields."],
          },
          {
            kind: "image",
            image: image(
              "planner-visibility.png",
              1166,
              1592,
              "Manage unit planner visibility: every section and field listed with a drag handle and an eye toggle",
            ),
            caption: "Show, hide and reorder sections",
            tilt: 1.5,
          },
        ],
      },
    },
    {
      id: "datasets",
      title: "Datasets and decisions",
      caption: "Reusable datasets, and a log of what version one would not do.",
      left: {
        id: "datasets-mapping",
        blocks: [
          { kind: "kicker", text: "Dataset mapping" },
          { kind: "heading", text: "Mapping PYP items" },
          {
            kind: "list",
            items: [
              "Learner profile attributes → card dataset",
              "Approaches to learning → nested checklist",
              "Actions and concepts → checklist",
              "Related concepts → dependent dropdown",
            ],
          },
          { kind: "note", text: "Reusable datasets instead of one-off custom fields." },
        ],
      },
      right: {
        id: "datasets-decisions",
        blocks: [
          { kind: "kicker", text: "Decision log" },
          { kind: "heading", text: "What version one decided" },
          {
            kind: "list",
            items: [
              "Toddle templates stay protected",
              "Duplicate official datasets, don't edit them",
              "Teachers don't add dataset items yet",
              "Changing a dataset type needs care",
            ],
          },
          { kind: "note", text: "Each open question became a scope boundary." },
        ],
      },
    },
    {
      id: "ai-creation",
      title: "AI unit creation",
      caption: "Three ways in, and more to decide than a single button.",
      left: {
        id: "ai-creation-approaches",
        blocks: [
          { kind: "kicker", text: "Phase 3" },
          { kind: "heading", text: "Three ways AI could help" },
          {
            kind: "list",
            ordered: true,
            items: [
              "Whole unit from a few questions",
              "Step by step, reviewed at each stage",
              "Empty fields; teacher picks AI or manual",
            ],
          },
          { kind: "note", text: "One shot suits short flows; step by step, complex ones." },
        ],
      },
      right: {
        id: "ai-creation-scope",
        blocks: [
          { kind: "kicker", text: "Project pipeline" },
          { kind: "heading", text: "More than one AI button" },
          {
            kind: "body",
            paragraphs: [
              "The real work: the right entry point, the minimum inputs, how teachers modify the output, and the effect on learning experiences and worksheets.",
            ],
          },
          { kind: "note", text: "A structured planning assistant, not a separate generator." },
        ],
      },
    },
    {
      id: "outcome",
      title: "Outcome",
      caption: "A clearer system first, so AI can extend it naturally.",
      left: {
        id: "outcome-model",
        blocks: [
          { kind: "kicker", text: "Outcome" },
          { kind: "heading", text: "What the team got" },
          {
            kind: "body",
            paragraphs: [
              "A clearer model for planner fields, dataset-backed components, template customization and AI-assisted creation, linking admin setup to teacher planning.",
            ],
          },
          { kind: "note", text: "My part: audits, mapping, customization UX and AI workflows." },
        ],
      },
      right: {
        id: "outcome-learned",
        blocks: [
          { kind: "heading", text: "What I learned" },
          {
            kind: "body",
            paragraphs: [
              "AI workflows depend on information architecture. Before AI can generate useful output, the product needs a strong model of fields, dependencies and inputs.",
            ],
          },
          {
            kind: "callout",
            label: "See more",
            text: "The walkthrough, or the whole story below.",
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
