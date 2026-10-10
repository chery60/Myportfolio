import type { ProjectBook as ProjectBookData } from "@/lib/book/types";
import { bookFontVariables } from "./book-fonts";
import { ProjectBookDialog } from "./project-book-dialog";

/**
 * Server wrapper for the notebook button and its dialog: loads the book's
 * fonts here (next/font) and hands their variables to the client side.
 */
export function ProjectBookLauncher({ book }: { book: ProjectBookData }) {
  return <ProjectBookDialog book={book} fontClassName={bookFontVariables} />;
}
