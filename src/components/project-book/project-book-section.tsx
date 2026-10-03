import type { ProjectBook as ProjectBookData } from "@/lib/book/types";
import { cn } from "@/lib/utils";
import { bookFontVariables } from "./book-fonts";
import { ProjectBook } from "./project-book";
import styles from "./project-book.module.css";

/** Server wrapper: breaks the book out of the text column and loads its fonts. */
export function ProjectBookSection({ book }: { book: ProjectBookData }) {
  return (
    <div className={cn(styles.breakout, bookFontVariables)}>
      <ProjectBook book={book} />
    </div>
  );
}
