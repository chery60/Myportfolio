import { withBasePath } from "@/lib/utils";

interface Props {
  src: string;
  poster?: string;
  captions?: string;
  title: string;
}

export function CaseStudyVideo({ src, poster, captions, title }: Props) {
  const href = withBasePath(src);

  return (
    <div className="not-prose my-6 overflow-hidden rounded-xl border border-border bg-card">
      <video
        className="aspect-video w-full bg-muted object-cover"
        controls
        preload="none"
        playsInline
        poster={poster ? withBasePath(poster) : undefined}
        aria-label={`${title} — video walkthrough`}
      >
        <source src={href} type="video/mp4" />
        {captions && (
          <track
            kind="captions"
            src={withBasePath(captions)}
            srcLang="en"
            label="English"
            default
          />
        )}
        <a href={href}>Download the {title} video walkthrough</a>
      </video>
    </div>
  );
}
