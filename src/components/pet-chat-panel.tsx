"use client";

import { useChat } from "@ai-sdk/react";
import { DirectChatTransport, type UIMessage } from "ai";
import {
  ArrowUpIcon,
  BriefcaseBusinessIcon,
  FolderOpenDotIcon,
  MessagesSquareIcon,
  RouteIcon,
  SparklesIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputFooter,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import {
  Suggestion,
  Suggestions,
} from "@/components/ai-elements/suggestion";
import { PetArtwork } from "@/components/pet-artwork";
import { useSelectedPet } from "@/components/use-selected-pet";
import { PET_BUBBLE_OFFSET_BOTTOM } from "@/components/use-pet-parked";
import { DATA } from "@/data/resume";
import {
  buildAssistantInstructions,
  FIRST_NAME,
  MAX_INPUT_CHARS,
  MAX_USER_TURNS,
} from "@/lib/assistant-persona";
import {
  createPetAssistantAgent,
  isAssistantConfigured,
} from "@/lib/pet-assistant-agent";
import { cn } from "@/lib/utils";

/**
 * `DirectChatTransport` narrows the message generic: this agent has no tools and
 * emits no data parts, so the wide `UIMessage` will not assign to it.
 */
type AssistantUIMessage = UIMessage<unknown, never, Record<string, never>>;

const STARTERS: Array<{
  label: string;
  prompt: string;
  icon: LucideIcon;
}> = [
  {
    label: "Current work",
    prompt: "What's he working on now?",
    icon: BriefcaseBusinessIcon,
  },
  {
    label: "Case studies",
    prompt: "Walk me through a case study",
    icon: FolderOpenDotIcon,
  },
  {
    label: "Design process",
    prompt: "What's his design process?",
    icon: RouteIcon,
  },
  {
    label: "Get in touch",
    prompt: "How do I reach him?",
    icon: MessagesSquareIcon,
  },
];

/**
 * Hand-written rather than generated: the greeting is the first thing every
 * visitor sees, so it should be instant, free, and identical every time.
 */
const GREETING: AssistantUIMessage = {
  id: "pet-greeting",
  role: "assistant",
  parts: [
    {
      type: "text",
      text: `Hey! I'm ${FIRST_NAME}'s assistant. Ask me about his work, his process, or any of the case studies.`,
    },
  ],
};

/**
 * Which links the assistant is allowed to actually render as links.
 *
 * Streamdown hardens links by default, rendering them as inert buttons — the
 * right call for arbitrary model output pointing anywhere on the web, but it
 * breaks the one thing this assistant is supposed to do: send people to the
 * case studies. So link safety is turned off and replaced with an allowlist.
 *
 * Internal paths cover `/blog/<slug>` (and `/Myportfolio/blog/<slug>` once the
 * base path is applied). `mailto:` and the social URLs already in `resume.tsx`
 * cover "how do I reach him". Anything else the model invents renders as plain
 * text rather than as a clickable link.
 */
const ALLOWED_LINKS = [
  "mailto:",
  ...Object.values(DATA.contact.social).map((social) => social.url),
];

function isAllowedLink(href: string | undefined): href is string {
  if (!href) {
    return false;
  }
  // Same-site path. `//evil.com` is protocol-relative, not internal.
  if (href.startsWith("/") && !href.startsWith("//")) {
    return true;
  }
  return ALLOWED_LINKS.some((prefix) => href.startsWith(prefix));
}

const MESSAGE_COMPONENTS = {
  a: ({ href, children }: { href?: string; children?: ReactNode }) =>
    isAllowedLink(href) ? (
      <a
        href={href}
        className="font-medium text-primary underline underline-offset-2"
      >
        {children}
      </a>
    ) : (
      <>{children}</>
    ),
};

function textOf(message: AssistantUIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => (part as { text: string }).text)
    .join("");
}

function friendlyError(): string {
  return `Something went wrong on my end. Try again in a moment — or email him at ${DATA.contact.email}.`;
}

interface Props {
  onClose: () => void;
  isDesktop: boolean;
  reducedMotion: boolean;
}

export function PetChatPanel({ onClose, isDesktop, reducedMotion }: Props) {
  const selectedPet = useSelectedPet();
  const panelRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  // The instructions string is ~6k tokens of resume + case studies. Building it
  // once keeps the transport identity stable across renders.
  const instructions = useMemo(() => buildAssistantInstructions(), []);
  const transport = useMemo(
    () =>
      new DirectChatTransport({
        agent: createPetAssistantAgent(instructions),
        // Flash-lite can emit thought parts; we never render them.
        sendReasoning: false,
        sendSources: false,
      }),
    [instructions]
  );

  const { messages, sendMessage, status, error, stop } = useChat({
    transport,
    messages: [GREETING],
  });

  const userTurns = messages.filter((m) => m.role === "user").length;
  const atTurnCap = userTurns >= MAX_USER_TURNS;
  const showStarters = messages.length <= 1;
  const busy = status === "submitted" || status === "streaming";

  // Abort any in-flight stream when the panel goes away, so a closed chat
  // can't keep burning quota in the background.
  useEffect(
    () => () => {
      void stop();
    },
    [stop]
  );

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.isComposing) {
        onClose();
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (!target) return;
      if (panelRef.current?.contains(target)) return;
      // Let the trigger handle its own toggle, or it would close and reopen.
      if (target.closest("[data-pet-chat-trigger]")) return;
      onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [onClose]);

  const submitText = (text: string): boolean => {
    const trimmed = text.trim();
    if (!trimmed || busy || atTurnCap) return false;

    // `maxLength` on the textarea does not stop every paste path, so the cap is
    // enforced again here rather than trusting the DOM.
    if (trimmed.length > MAX_INPUT_CHARS) {
      setInputError(`That's a bit long — keep it under ${MAX_INPUT_CHARS} characters.`);
      return false;
    }

    setInputError(null);
    void sendMessage({ text: trimmed });
    return true;
  };

  const handleSubmit = (message: PromptInputMessage) => {
    if (submitText(message.text ?? "")) {
      setDraft("");
    }
  };

  const scrollBehavior = reducedMotion ? "instant" : "smooth";

  return (
    <>
      {/* Below the desktop gate the panel is effectively a full-screen sheet, so
          the page behind it gets a scrim: it reads as inert, and it gives back
          the tap-outside-to-close that a near-full-bleed panel takes away. */}
      {isDesktop ? null : (
        <div
          aria-hidden="true"
          onPointerDown={onClose}
          className="fixed inset-0 z-[35] bg-background/60 backdrop-blur-sm"
        />
      )}
      <div
        ref={panelRef}
        id="pet-chat-panel"
        role="dialog"
        aria-label={`Ask about ${DATA.name}`}
        className={cn(
          "not-prose fixed z-40 flex flex-col",
          isDesktop
            ? "right-4 h-[min(35rem,calc(100vh-8.5rem))] w-[min(25rem,calc(100vw-2rem))] sm:right-6"
            : "inset-x-3 bottom-3 top-14",
          "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:duration-300"
        )}
        style={isDesktop ? { bottom: PET_BUBBLE_OFFSET_BOTTOM } : undefined}
      >
        {/* The tail must escape the card's rounded clip, so the card — not this
            wrapper — owns `overflow-hidden`. */}
        <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[24px] border border-foreground/10 bg-card/98 text-card-foreground shadow-[0_1px_1px_rgba(15,23,42,0.04),0_18px_55px_-22px_rgba(15,23,42,0.35),0_36px_90px_-42px_rgba(15,23,42,0.3)] ring-1 ring-background/80 backdrop-blur-xl dark:border-white/12 dark:bg-card/95">
          <header className="relative flex shrink-0 items-center gap-3 border-b border-border/60 bg-gradient-to-b from-background/95 to-background/70 px-4 py-3">
            <span
              aria-hidden="true"
              className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent dark:via-white/20"
            />
          {/* PetArtwork keeps its full 76px layout box when transformed, so the
              sprite is taken out of flow and centred inside a clipped box —
              otherwise it pushes the header apart and spills into the messages. */}
          <span
            aria-hidden="true"
              className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-xl border border-indigo-200/70 bg-gradient-to-br from-indigo-50 via-background to-sky-50 shadow-[0_5px_16px_-9px_rgba(79,70,229,0.8)] dark:border-indigo-400/20 dark:from-indigo-950/70 dark:to-sky-950/40"
          >
              <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[47%] scale-[0.42]">
              <PetArtwork petId={selectedPet} />
            </span>
          </span>
          <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold leading-tight tracking-[-0.01em]">
                {FIRST_NAME}&rsquo;s portfolio guide
            </p>
              <p className="mt-1 flex items-center gap-1.5 truncate text-[11px] leading-tight text-muted-foreground">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-50 motion-reduce:animate-none" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
                </span>
                Ask about his work and process
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat"
              className="flex size-8 shrink-0 items-center justify-center rounded-full border border-transparent text-muted-foreground transition-all hover:border-border/70 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
              <XIcon className="size-4" />
          </button>
        </header>

        {isAssistantConfigured ? (
          <>
            <Conversation
              className="min-h-0 flex-1 bg-[radial-gradient(circle_at_50%_105%,rgba(99,102,241,0.055),transparent_42%)]"
              initial={scrollBehavior}
              resize={scrollBehavior}
            >
              <ConversationContent className="min-h-full justify-end gap-4 px-4 pb-4 pt-5">
                {messages.map((message) => (
                  <Message
                    key={message.id}
                    from={message.role}
                    className={cn(
                      "max-w-full gap-1.5",
                      message.role === "user" && "max-w-[88%]"
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-end gap-2",
                        message.role === "user" && "justify-end"
                      )}
                    >
                      {message.role === "assistant" ? (
                        <span
                          aria-hidden="true"
                          className="mb-0.5 grid size-6 shrink-0 place-items-center rounded-lg border border-indigo-200/60 bg-indigo-50 text-indigo-600 dark:border-indigo-400/20 dark:bg-indigo-950/50 dark:text-indigo-300"
                        >
                          <SparklesIcon className="size-3" />
                        </span>
                      ) : null}
                      <MessageContent
                        className={cn(
                          "rounded-2xl px-3.5 py-2.5 text-[13px] leading-5 shadow-none",
                          message.role === "assistant"
                            ? "rounded-bl-md border border-border/65 bg-background/85 text-foreground shadow-[0_8px_24px_-20px_rgba(15,23,42,0.45)]"
                            : "rounded-br-md bg-foreground text-background group-[.is-user]:bg-foreground group-[.is-user]:px-3.5 group-[.is-user]:py-2.5 group-[.is-user]:text-background dark:bg-white dark:text-black"
                        )}
                      >
                        <MessageResponse
                          className="[&_p]:leading-5"
                          linkSafety={{ enabled: false }}
                          components={MESSAGE_COMPONENTS}
                        >
                          {textOf(message)}
                        </MessageResponse>
                      </MessageContent>
                    </div>
                  </Message>
                ))}
                {status === "submitted" ? (
                  <div
                    role="status"
                    aria-label="Thinking"
                    className="flex items-center gap-2 pl-8 text-xs text-muted-foreground"
                  >
                    <span className="flex items-center gap-1 rounded-full border border-border/60 bg-background/80 px-3 py-2">
                      {[0, 1, 2].map((dot) => (
                        <span
                          key={dot}
                          className="size-1.5 animate-pulse rounded-full bg-muted-foreground/60 motion-reduce:animate-none"
                          style={{ animationDelay: `${dot * 160}ms` }}
                        />
                      ))}
                    </span>
                  </div>
                ) : null}
                {error ? (
                  <p
                    role="alert"
                    className="ml-8 rounded-xl border border-destructive/15 bg-destructive/5 px-3 py-2 text-xs leading-5 text-muted-foreground"
                  >
                    {friendlyError()}
                  </p>
                ) : null}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>

            {showStarters ? (
              <div className="shrink-0 border-t border-border/45 bg-muted/15 px-3 pb-3 pt-2.5">
                <p className="mb-2 px-1 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/80">
                  Try asking
                </p>
                <Suggestions className="grid w-full grid-cols-2 gap-2">
                {STARTERS.map((starter) => (
                  <Suggestion
                      key={starter.prompt}
                      suggestion={starter.prompt}
                    onClick={submitText}
                      className="h-10 min-w-0 justify-start gap-2 rounded-xl border-border/65 bg-background/80 px-3 text-left text-[11px] font-medium shadow-none transition-all hover:-translate-y-0.5 hover:border-foreground/15 hover:bg-background hover:shadow-sm"
                    >
                      <starter.icon className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate">{starter.label}</span>
                    </Suggestion>
                ))}
              </Suggestions>
              </div>
            ) : null}

            <PromptInput
              onSubmit={handleSubmit}
              className={cn(
                "shrink-0 bg-muted/15 px-3 pb-3",
                "[&_[data-slot=input-group]]:rounded-2xl [&_[data-slot=input-group]]:border-foreground/10",
                "[&_[data-slot=input-group]]:bg-background [&_[data-slot=input-group]]:shadow-[0_8px_24px_-18px_rgba(15,23,42,0.45)]",
                "[&_[data-slot=input-group]]:transition-all [&_[data-slot=input-group]]:duration-200",
                "[&_[data-slot=input-group]]:has-[[data-slot=input-group-control]:focus-visible]:border-foreground/25",
                "[&_[data-slot=input-group]]:has-[[data-slot=input-group-control]:focus-visible]:ring-2",
                "[&_[data-slot=input-group]]:has-[[data-slot=input-group-control]:focus-visible]:ring-foreground/5"
              )}
            >
              <PromptInputBody>
                <PromptInputTextarea
                  ref={textareaRef}
                  maxLength={MAX_INPUT_CHARS}
                  disabled={atTurnCap}
                  onChange={(event) => setDraft(event.currentTarget.value)}
                  className="min-h-[52px] max-h-28 px-3.5 pb-2 pt-3.5 text-[13px] leading-5 placeholder:text-muted-foreground/75"
                  placeholder={
                    atTurnCap
                      ? "That's my limit for now — email him instead?"
                      : `Ask about ${FIRST_NAME}'s work…`
                  }
                />
              </PromptInputBody>
              <PromptInputFooter className="px-2.5 pb-2.5 pt-0">
                <span className="flex min-w-0 items-center gap-1.5 pl-1 text-[10px] text-muted-foreground/80">
                  {inputError ??
                    (atTurnCap ? (
                      <a
                        className="underline underline-offset-2"
                        href={`mailto:${DATA.contact.email}`}
                      >
                        {DATA.contact.email}
                      </a>
                    ) : (
                      <>
                        <span>{MAX_USER_TURNS - userTurns} left</span>
                        <span aria-hidden="true">·</span>
                        <span>AI may be imperfect</span>
                      </>
                    ))}
                </span>
                <PromptInputSubmit
                  status={status}
                  onStop={stop}
                  disabled={atTurnCap || (!busy && !draft.trim())}
                  className="size-8 rounded-xl bg-foreground text-background shadow-sm transition-transform hover:scale-[1.03] hover:bg-foreground/90 dark:bg-white dark:text-black"
                >
                  {status === "ready" ? (
                    <ArrowUpIcon className="size-4" />
                  ) : undefined}
                </PromptInputSubmit>
              </PromptInputFooter>
            </PromptInput>
          </>
        ) : (
          <div className="flex flex-1 flex-col justify-center gap-2 p-4 text-sm">
            <p className="font-medium">The assistant is offline.</p>
            <p className="text-muted-foreground">
              No assistant service is configured for this build. You can still
              reach{" "}
              {FIRST_NAME} at{" "}
              <a
                className="text-primary underline underline-offset-4"
                href={`mailto:${DATA.contact.email}`}
              >
                {DATA.contact.email}
              </a>
              .
            </p>
          </div>
        )}

        </div>

        {/* Two layers make the pointer read as part of the shell: the outer
            diamond supplies a crisp silhouette and the inner one carries the
            card surface over it. Both sit behind the clipped card. */}
        {isDesktop ? (
          <>
            <span
              aria-hidden="true"
              className="absolute -bottom-[8px] right-7 z-0 size-4 rotate-45 border-b border-r border-foreground/20 bg-card shadow-[5px_5px_12px_-8px_rgba(15,23,42,0.65)] dark:border-white/20"
            />
            <span
              aria-hidden="true"
              className="absolute -bottom-[5px] right-[31px] z-0 size-3 rotate-45 bg-card"
            />
          </>
        ) : null}
      </div>
    </>
  );
}
