import type { BookImage, BookSpread, ProjectBook } from "@/lib/book/types";

export function fixtureImage(name: string): BookImage {
  return { src: `/fixture/${name}.png`, alt: `${name} diagram`, width: 1920, height: 1080 };
}

function spread(n: number, title: string): BookSpread {
  return {
    id: `s${n}`,
    title,
    caption: `${title} caption`,
    left: {
      id: `s${n}-left`,
      blocks: [
        { kind: "heading", text: `${title} heading` },
        { kind: "body", paragraphs: [`${title} body copy.`] },
      ],
    },
    right: {
      id: `s${n}-right`,
      blocks: [{ kind: "image", image: fixtureImage(`s${n}-right`), caption: `${title} figure` }],
    },
  };
}

/** Three spreads, six pages. Every right page carries one image. */
export const FIXTURE_BOOK: ProjectBook = {
  slug: "fixture",
  title: "Fixture Project",
  spreads: [spread(1, "The problem"), spread(2, "Who's ordering"), spread(3, "Handoff")],
};
