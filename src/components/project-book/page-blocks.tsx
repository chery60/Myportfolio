/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import type { Block, BookImage, BookLink } from "@/lib/book/types";
import { withBasePath } from "@/lib/utils";
import styles from "./paper.module.css";

/** Photos sit a little crooked, like they were taped in by hand. */
const MAX_TILT_DEG = 3;
const DEFAULT_TILTS_DEG = [-1.2, 1] as const;

interface PageBlockProps {
  block: Block;
  /** Position on the page; picks the default photo tilt deterministically. */
  index: number;
  /** Copies used by the page curl and the loupe: no alt text, never focusable. */
  decorative: boolean;
}

type StyleWithVars = CSSProperties & Record<`--${string}`, string | number>;

function clampTilt(tilt: number): number {
  return Math.min(Math.max(tilt, -MAX_TILT_DEG), MAX_TILT_DEG);
}

function Picture({ image, decorative }: { image: BookImage; decorative: boolean }) {
  return (
    <img
      className={styles.img}
      src={withBasePath(image.src)}
      alt={decorative ? "" : image.alt}
      width={image.width}
      height={image.height}
      decoding="async"
      draggable={false}
    />
  );
}

function CalloutLink({ link }: { link: BookLink }) {
  const external = link.href.startsWith("https://");
  return (
    <a
      className={styles.link}
      href={link.href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {link.label}
    </a>
  );
}

export function PageBlock({ block, index, decorative }: PageBlockProps) {
  switch (block.kind) {
    case "kicker":
      return <p className={styles.kicker}>{block.text}</p>;
    case "heading":
      return <h3 className={styles.heading}>{block.text}</h3>;
    case "body":
      return (
        <div className={styles.body}>
          {block.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      );
    case "note":
      return (
        <p className={styles.note} data-align={block.align ?? "start"}>
          {block.text}
        </p>
      );
    case "list": {
      const List = block.ordered ? "ol" : "ul";
      return (
        <List className={styles.list}>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </List>
      );
    }
    case "image": {
      const tilt = clampTilt(block.tilt ?? DEFAULT_TILTS_DEG[index % DEFAULT_TILTS_DEG.length]);
      const style: StyleWithVars = {
        "--ar": block.image.width / block.image.height,
        "--tilt": `${tilt}deg`,
      };
      return (
        <figure className={styles.figure}>
          <div className={styles.photoArea}>
            <div className={styles.photo} data-tape={block.tape ?? "corners"} style={style}>
              <Picture image={block.image} decorative={decorative} />
            </div>
          </div>
          {block.caption ? <figcaption className={styles.caption}>{block.caption}</figcaption> : null}
        </figure>
      );
    }
    case "screens": {
      const style: StyleWithVars = { "--n": block.images.length };
      return (
        <figure className={styles.screens}>
          <div className={styles.screenRow} style={style}>
            {block.images.map((image) => (
              <div key={image.src} className={styles.screen} style={{ "--ar": image.width / image.height } as StyleWithVars}>
                <Picture image={image} decorative={decorative} />
              </div>
            ))}
          </div>
          {block.caption ? <figcaption className={styles.caption}>{block.caption}</figcaption> : null}
        </figure>
      );
    }
    case "callout":
      return (
        <aside className={styles.callout}>
          <p className={styles.calloutLabel}>{block.label}</p>
          <p className={styles.calloutText}>{block.text}</p>
          {block.links?.length ? (
            <p className={styles.links}>
              {block.links.map((link) => (
                <CalloutLink key={link.href} link={link} />
              ))}
            </p>
          ) : null}
        </aside>
      );
  }
}
