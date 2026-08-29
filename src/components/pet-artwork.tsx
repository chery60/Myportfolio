"use client";

import type { CSSProperties } from "react";

export const DEFAULT_PET_ID = "among-us";
export const PET_STORAGE_KEY = "portfolio-selected-pet";
export const PET_CHANGE_EVENT = "portfolio-pet-change";

export type PetId =
  | "among-us"
  | "red"
  | "chuck"
  | "bomb"
  | "matilda"
  | "stella"
  | "terence"
  | "mighty-eagle"
  | "blues"
  | "hal"
  | "silver"
  | "bubbles"
  | "melody"
  | "willow"
  | "hatchlings";

type PetOption = {
  id: PetId;
  name: string;
  family: "Crewmate" | "Classic flock" | "Extended flock";
};

type BirdId = Exclude<PetId, "among-us" | "blues" | "hatchlings">;

type BirdConfig = {
  name: string;
  body: string;
  belly: string;
  beak: string;
  brow: string;
  crest: string;
  tail: string;
  variant:
    | "round"
    | "triangle"
    | "bomb"
    | "egg"
    | "large"
    | "long"
    | "eagle"
    | "silver"
    | "songbird";
};

type PetArtworkProps = {
  petId: PetId;
  walking?: boolean;
  preview?: boolean;
};

const OUTLINE =
  "drop-shadow(2px 0 0 #111) drop-shadow(-2px 0 0 #111) drop-shadow(0 2px 0 #111) drop-shadow(0 -2px 0 #111)";

const BODY_SHINE = "rgba(255,255,255,0.18)";

export const PETS: PetOption[] = [
  { id: "among-us", name: "Among Us", family: "Crewmate" },
  { id: "red", name: "Red", family: "Classic flock" },
  { id: "chuck", name: "Chuck", family: "Classic flock" },
  { id: "bomb", name: "Bomb", family: "Classic flock" },
  { id: "matilda", name: "Matilda", family: "Classic flock" },
  { id: "stella", name: "Stella", family: "Classic flock" },
  { id: "terence", name: "Terence", family: "Classic flock" },
  { id: "mighty-eagle", name: "Mighty Eagle", family: "Classic flock" },
  { id: "blues", name: "Blues", family: "Classic flock" },
  { id: "hal", name: "Hal", family: "Classic flock" },
  { id: "silver", name: "Silver", family: "Extended flock" },
  { id: "bubbles", name: "Bubbles", family: "Extended flock" },
  { id: "melody", name: "Melody", family: "Extended flock" },
  { id: "willow", name: "Willow", family: "Extended flock" },
  { id: "hatchlings", name: "Hatchlings", family: "Extended flock" },
];

const PET_IDS = new Set(PETS.map((pet) => pet.id));

const BIRD_CONFIGS: Record<BirdId, BirdConfig> = {
  red: {
    name: "Red",
    body: "#e63b2e",
    belly: "#f3c78d",
    beak: "#f6b332",
    brow: "#351c14",
    crest: "#9f1917",
    tail: "#171717",
    variant: "round",
  },
  chuck: {
    name: "Chuck",
    body: "#f7cf2f",
    belly: "#f7e7a3",
    beak: "#ed7d22",
    brow: "#3a2714",
    crest: "#1d1d1d",
    tail: "#1d1d1d",
    variant: "triangle",
  },
  bomb: {
    name: "Bomb",
    body: "#242424",
    belly: "#3a3a3a",
    beak: "#ef8c27",
    brow: "#e2a443",
    crest: "#f5cf54",
    tail: "#111111",
    variant: "bomb",
  },
  matilda: {
    name: "Matilda",
    body: "#f5f0de",
    belly: "#f1d3a6",
    beak: "#f2a32d",
    brow: "#653a28",
    crest: "#eee5d2",
    tail: "#6a3325",
    variant: "egg",
  },
  stella: {
    name: "Stella",
    body: "#e86aa7",
    belly: "#f7bdd2",
    beak: "#ef9c25",
    brow: "#53223a",
    crest: "#f7b3d0",
    tail: "#b73875",
    variant: "round",
  },
  terence: {
    name: "Terence",
    body: "#9f1917",
    belly: "#e7a86d",
    beak: "#f0a226",
    brow: "#27110d",
    crest: "#70100f",
    tail: "#161616",
    variant: "large",
  },
  "mighty-eagle": {
    name: "Mighty Eagle",
    body: "#74472f",
    belly: "#f0ead5",
    beak: "#f3b247",
    brow: "#4a271c",
    crest: "#f7f2df",
    tail: "#3a2117",
    variant: "eagle",
  },
  hal: {
    name: "Hal",
    body: "#52b864",
    belly: "#d9f0bb",
    beak: "#e89b2f",
    brow: "#213b1f",
    crest: "#2a8b45",
    tail: "#255c32",
    variant: "long",
  },
  silver: {
    name: "Silver",
    body: "#b8bec8",
    belly: "#eef1f4",
    beak: "#eaa640",
    brow: "#323744",
    crest: "#e7edf4",
    tail: "#777f8c",
    variant: "silver",
  },
  bubbles: {
    name: "Bubbles",
    body: "#f28c1f",
    belly: "#ffd48d",
    beak: "#f3b233",
    brow: "#563214",
    crest: "#f4b247",
    tail: "#9e4f0c",
    variant: "round",
  },
  melody: {
    name: "Melody",
    body: "#c7985e",
    belly: "#f7dfb7",
    beak: "#d88932",
    brow: "#4a2a18",
    crest: "#6f3a1d",
    tail: "#6f3a1d",
    variant: "songbird",
  },
  willow: {
    name: "Willow",
    body: "#67b8c9",
    belly: "#d8f1ef",
    beak: "#dfa153",
    brow: "#234855",
    crest: "#39798d",
    tail: "#276171",
    variant: "songbird",
  },
};

export function isPetId(value: string | null): value is PetId {
  return Boolean(value && PET_IDS.has(value as PetId));
}

export function getPetById(id: PetId) {
  return PETS.find((pet) => pet.id === id) ?? PETS[0];
}

export function PetArtwork({
  petId,
  walking = false,
  preview = false,
}: PetArtworkProps) {
  const scale = preview ? 0.9 : 1;

  return (
    <div
      data-pet-artwork={petId}
      className="relative select-none"
      style={{
        width: 58,
        height: 58,
        transform: `scale(${scale})`,
        transformOrigin: "center bottom",
      }}
    >
      {petId === "among-us" ? (
        <AmongUsPet walking={walking} />
      ) : petId === "blues" ? (
        <SmallFlockPet walking={walking} palette="blue" />
      ) : petId === "hatchlings" ? (
        <SmallFlockPet walking={walking} palette="hatchling" />
      ) : (
        <BirdPet petId={petId} walking={walking} />
      )}
    </div>
  );
}

function AmongUsPet({ walking }: { walking: boolean }) {
  const characterColor = "#7170ff";

  return (
    <div
      className={walking ? "animate-pet-bob" : undefined}
      style={{ position: "absolute", left: 11, bottom: 6, width: 36, height: 44 }}
    >
      <PetShadow width={34} left={1} />
      <div
        className="absolute"
        style={{
          top: 10,
          left: -6,
          width: 14,
          height: 22,
          borderRadius: 6,
          background: characterColor,
          filter: OUTLINE,
        }}
      >
        <Shade height={11} radius="0 0 6px 6px" />
      </div>
      <AmongUsLeg side="front" walking={walking} color={characterColor} />
      <AmongUsLeg side="back" walking={walking} color={characterColor} />
      <div
        className="absolute overflow-hidden"
        style={{
          top: 0,
          right: 0,
          width: 28,
          height: 32,
          borderRadius: "14px 14px 6px 6px",
          background: characterColor,
          filter: OUTLINE,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: "rgba(0,0,0,0.20)",
            borderRadius: "14px 14px 6px 6px",
            transform: "translateY(3px) translateX(3px)",
          }}
        />
        <div
          className="absolute"
          style={{
            top: 8,
            left: 8,
            width: 16,
            height: 12,
            borderRadius: "50%",
            background: BODY_SHINE,
            filter: "blur(4px)",
            transform: "translateY(-4px) translateX(2px)",
          }}
        />
      </div>
      <div
        className="absolute overflow-hidden"
        style={{
          top: 6,
          right: -4,
          width: 20,
          height: 12,
          borderRadius: 9999,
          background: "#92d1df",
          filter: OUTLINE,
        }}
      >
        <div
          className="absolute"
          style={{
            top: 4,
            left: 1,
            right: 1,
            height: 10,
            borderRadius: 9999,
            background: "#527f8b",
          }}
        />
        <div
          className="absolute"
          style={{
            top: 2,
            right: 4,
            width: 10,
            height: 3,
            borderRadius: 9999,
            background: "rgba(255,255,255,0.85)",
            transform: "rotate(-8deg)",
          }}
        />
      </div>
    </div>
  );
}

function AmongUsLeg({
  side,
  walking,
  color,
}: {
  side: "front" | "back";
  walking: boolean;
  color: string;
}) {
  return (
    <div
      data-pet-leg={side}
      className={`absolute ${walking ? `animate-pet-foot-${side === "front" ? "left" : "right"}` : ""}`}
      style={{
        bottom: 2,
        left: side === "front" ? 6 : undefined,
        right: side === "back" ? 4 : undefined,
        width: 12,
        height: 14,
        borderRadius: "2px 2px 6px 6px",
        background: color,
        filter: OUTLINE,
      }}
    >
      <Shade height={8} radius="0 0 6px 6px" />
    </div>
  );
}

function BirdPet({ petId, walking }: { petId: BirdId; walking: boolean }) {
  return <SingleBird config={BIRD_CONFIGS[petId]} walking={walking} />;
}

function SingleBird({
  config,
  walking,
}: {
  config: BirdConfig;
  walking: boolean;
}) {
  const bodyStyle = getBirdBodyStyle(config);
  const isTriangular = config.variant === "triangle";
  const isBomb = config.variant === "bomb";
  const isEagle = config.variant === "eagle";
  const isLong = config.variant === "long";

  return (
    <div className={walking ? "animate-pet-bob" : undefined}>
      <PetShadow width={isLong ? 46 : 38} left={isLong ? 6 : 10} />
      <BirdTail color={config.tail} variant={config.variant} />
      <BirdFeet walking={walking} />
      <div className="absolute" style={bodyStyle}>
        <BirdCrest color={config.crest} variant={config.variant} />
        {isBomb ? <BombFuse color={config.crest} walking={walking} /> : null}
        {isEagle ? <EagleHead color={config.crest} /> : null}
        <BirdBelly color={config.belly} variant={config.variant} />
        <BirdEyes brow={config.brow} variant={config.variant} />
        <BirdBeak color={config.beak} variant={config.variant} />
        {isTriangular ? <ChuckStripe /> : null}
        {config.variant === "silver" ? <SilverLoop /> : null}
        {config.variant === "songbird" ? <SongbirdWing color={config.tail} /> : null}
      </div>
    </div>
  );
}

function getBirdBodyStyle(config: BirdConfig): CSSProperties {
  const common: CSSProperties = {
    position: "absolute",
    background: config.body,
    filter: OUTLINE,
    overflow: "visible",
  };

  switch (config.variant) {
    case "triangle":
      return {
        ...common,
        left: 9,
        bottom: 9,
        width: 42,
        height: 43,
        clipPath: "polygon(50% 0%, 98% 80%, 50% 100%, 2% 80%)",
      };
    case "bomb":
      return {
        ...common,
        left: 8,
        bottom: 8,
        width: 43,
        height: 43,
        borderRadius: "50%",
      };
    case "egg":
      return {
        ...common,
        left: 11,
        bottom: 7,
        width: 37,
        height: 46,
        borderRadius: "48% 48% 44% 44%",
      };
    case "large":
      return {
        ...common,
        left: 2,
        bottom: 7,
        width: 54,
        height: 45,
        borderRadius: "52% 52% 46% 46%",
      };
    case "long":
      return {
        ...common,
        left: 3,
        bottom: 11,
        width: 52,
        height: 34,
        borderRadius: "65% 42% 58% 48%",
        transform: "rotate(-7deg)",
      };
    case "eagle":
      return {
        ...common,
        left: 6,
        bottom: 7,
        width: 47,
        height: 44,
        borderRadius: "55% 55% 46% 46%",
      };
    case "silver":
      return {
        ...common,
        left: 9,
        bottom: 8,
        width: 41,
        height: 44,
        borderRadius: "52% 52% 44% 44%",
        clipPath: "polygon(50% 0%, 88% 18%, 100% 58%, 74% 100%, 26% 100%, 0 58%, 12% 18%)",
      };
    case "songbird":
      return {
        ...common,
        left: 8,
        bottom: 8,
        width: 42,
        height: 43,
        borderRadius: "54% 48% 45% 48%",
      };
    default:
      return {
        ...common,
        left: 8,
        bottom: 8,
        width: 43,
        height: 43,
        borderRadius: "50% 50% 45% 45%",
      };
  }
}

function BirdTail({
  color,
  variant,
}: {
  color: string;
  variant: BirdConfig["variant"];
}) {
  const long = variant === "long";
  return (
    <div
      className="absolute"
      style={{
        left: long ? -1 : 5,
        bottom: long ? 26 : 27,
        width: long ? 18 : 15,
        height: long ? 14 : 13,
        background: color,
        clipPath: "polygon(0 50%, 100% 0, 78% 50%, 100% 100%)",
        filter: OUTLINE,
        transform: long ? "rotate(8deg)" : "rotate(-8deg)",
      }}
    />
  );
}

function BirdCrest({
  color,
  variant,
}: {
  color: string;
  variant: BirdConfig["variant"];
}) {
  if (variant === "eagle") {
    return null;
  }

  const crestStyle: CSSProperties =
    variant === "triangle"
      ? {
          top: -8,
          left: 16,
          width: 12,
          height: 14,
          clipPath: "polygon(50% 0, 100% 100%, 0 100%)",
        }
      : {
          top: -8,
          left: variant === "large" ? 19 : 15,
          width: variant === "songbird" ? 18 : 15,
          height: 13,
          borderRadius: "90% 30% 90% 30%",
          transform: "rotate(-18deg)",
        };

  return (
    <div
      className="absolute"
      style={{
        ...crestStyle,
        background: color,
        filter: OUTLINE,
      }}
    />
  );
}

function BombFuse({ color, walking }: { color: string; walking: boolean }) {
  return (
    <div
      className={`absolute ${walking ? "animate-pet-fuse" : ""}`}
      style={{
        top: -12,
        left: 20,
        width: 13,
        height: 15,
        borderTop: "3px solid #111",
        borderRight: `4px solid ${color}`,
        borderRadius: "50%",
        transform: "rotate(18deg)",
      }}
    />
  );
}

function EagleHead({ color }: { color: string }) {
  return (
    <div
      className="absolute"
      style={{
        top: -7,
        left: 6,
        right: 5,
        height: 19,
        borderRadius: "50% 50% 35% 35%",
        background: color,
        filter: OUTLINE,
      }}
    />
  );
}

function BirdBelly({
  color,
  variant,
}: {
  color: string;
  variant: BirdConfig["variant"];
}) {
  return (
    <div
      className="absolute"
      style={{
        left: variant === "large" ? 13 : 10,
        bottom: -1,
        width: variant === "large" ? 29 : 23,
        height: variant === "long" ? 16 : 19,
        borderRadius: "50% 50% 42% 42%",
        background: color,
        opacity: 0.96,
      }}
    />
  );
}

function BirdEyes({
  brow,
  variant,
}: {
  brow: string;
  variant: BirdConfig["variant"];
}) {
  const top = variant === "eagle" ? 10 : variant === "triangle" ? 19 : 13;
  const leftEyeLeft = variant === "long" ? 23 : 15;
  const rightEyeLeft = variant === "long" ? 33 : 25;

  return (
    <>
      <BirdEye left={leftEyeLeft} top={top} pupilLeft={5} />
      <BirdEye left={rightEyeLeft} top={top} pupilLeft={3} />
      <div
        className="absolute"
        style={{
          top: top - 3,
          left: leftEyeLeft - 2,
          width: 14,
          height: 4,
          borderRadius: 999,
          background: brow,
          transform: "rotate(18deg)",
        }}
      />
      <div
        className="absolute"
        style={{
          top: top - 4,
          left: rightEyeLeft - 1,
          width: 14,
          height: 4,
          borderRadius: 999,
          background: brow,
          transform: "rotate(-18deg)",
        }}
      />
    </>
  );
}

function BirdEye({
  left,
  top,
  pupilLeft,
}: {
  left: number;
  top: number;
  pupilLeft: number;
}) {
  return (
    <div
      className="absolute"
      style={{
        top,
        left,
        width: 12,
        height: 13,
        borderRadius: "50%",
        background: "#f8f8f8",
        boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.18)",
      }}
    >
      <div
        className="absolute"
        style={{
          left: pupilLeft,
          top: 5,
          width: 4,
          height: 4,
          borderRadius: "50%",
          background: "#171717",
        }}
      />
    </div>
  );
}

function BirdBeak({
  color,
  variant,
}: {
  color: string;
  variant: BirdConfig["variant"];
}) {
  const long = variant === "long";
  return (
    <div
      className="absolute"
      style={{
        top: long ? 17 : variant === "triangle" ? 28 : 24,
        right: long ? -13 : -9,
        width: long ? 26 : 19,
        height: long ? 13 : 12,
        background: color,
        clipPath: "polygon(0 0, 100% 50%, 0 100%)",
        filter: OUTLINE,
      }}
    />
  );
}

function ChuckStripe() {
  return (
    <div
      className="absolute"
      style={{
        left: 17,
        top: 10,
        width: 10,
        height: 24,
        borderRadius: 999,
        background: "rgba(255,255,255,0.16)",
        transform: "rotate(12deg)",
      }}
    />
  );
}

function SilverLoop() {
  return (
    <div
      className="absolute"
      style={{
        left: 13,
        top: -12,
        width: 16,
        height: 16,
        borderRadius: "50%",
        border: "5px solid #dfe5ec",
        borderBottomColor: "transparent",
        transform: "rotate(-18deg)",
        filter: OUTLINE,
      }}
    />
  );
}

function SongbirdWing({ color }: { color: string }) {
  return (
    <div
      className="absolute"
      style={{
        left: 3,
        top: 21,
        width: 15,
        height: 18,
        borderRadius: "60% 35% 55% 45%",
        background: color,
        opacity: 0.55,
      }}
    />
  );
}

function BirdFeet({ walking }: { walking: boolean }) {
  return (
    <>
      <div
        className={`absolute ${walking ? "animate-pet-foot-left" : ""}`}
        style={{
          left: 21,
          bottom: 6,
          width: 10,
          height: 6,
          borderRadius: "0 0 6px 6px",
          background: "#ef9c25",
          filter: OUTLINE,
        }}
      />
      <div
        className={`absolute ${walking ? "animate-pet-foot-right" : ""}`}
        style={{
          left: 32,
          bottom: 6,
          width: 10,
          height: 6,
          borderRadius: "0 0 6px 6px",
          background: "#ef9c25",
          filter: OUTLINE,
        }}
      />
    </>
  );
}

function SmallFlockPet({
  walking,
  palette,
}: {
  walking: boolean;
  palette: "blue" | "hatchling";
}) {
  const birds =
    palette === "blue"
      ? [
          { body: "#3f9fe3", belly: "#cfe9ff", left: 7, top: 13 },
          { body: "#4db6f2", belly: "#d9f1ff", left: 22, top: 7 },
          { body: "#2f87cf", belly: "#c5e6ff", left: 35, top: 15 },
        ]
      : [
          { body: "#f6d54a", belly: "#fff0a6", left: 6, top: 16 },
          { body: "#f7bbd2", belly: "#ffe1ec", left: 22, top: 9 },
          { body: "#8dd8ef", belly: "#dff7ff", left: 37, top: 16 },
        ];

  return (
    <div className={walking ? "animate-pet-bob" : undefined}>
      <PetShadow width={45} left={7} />
      {birds.map((bird, index) => (
        <MiniBird
          key={`${palette}-${index}`}
          body={bird.body}
          belly={bird.belly}
          left={bird.left}
          top={bird.top}
          walking={walking}
          delay={index * 80}
        />
      ))}
    </div>
  );
}

function MiniBird({
  body,
  belly,
  left,
  top,
  walking,
  delay,
}: {
  body: string;
  belly: string;
  left: number;
  top: number;
  walking: boolean;
  delay: number;
}) {
  return (
    <div
      className={`absolute ${walking ? "animate-pet-mini-hop" : ""}`}
      style={{
        left,
        top,
        width: 21,
        height: 24,
        borderRadius: "50% 50% 45% 45%",
        background: body,
        filter: OUTLINE,
        animationDelay: `${delay}ms`,
      }}
    >
      <div
        className="absolute"
        style={{
          left: 5,
          bottom: 0,
          width: 11,
          height: 9,
          borderRadius: "50%",
          background: belly,
        }}
      />
      <div
        className="absolute"
        style={{
          top: 8,
          left: 8,
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "#fff",
        }}
      >
        <div
          className="absolute"
          style={{
            top: 2,
            left: 2,
            width: 2,
            height: 2,
            borderRadius: "50%",
            background: "#111",
          }}
        />
      </div>
      <div
        className="absolute"
        style={{
          top: 13,
          right: -6,
          width: 11,
          height: 7,
          clipPath: "polygon(0 0, 100% 50%, 0 100%)",
          background: "#f2a32d",
          filter: OUTLINE,
        }}
      />
    </div>
  );
}

function PetShadow({ width, left }: { width: number; left: number }) {
  return (
    <div
      className="absolute bottom-0 rounded-full"
      style={{
        left,
        width,
        height: 8,
        background: "rgba(0,0,0,0.16)",
        filter: "blur(0.2px)",
      }}
    />
  );
}

function Shade({ height, radius }: { height: number; radius: string }) {
  return (
    <div
      className="absolute bottom-0 left-0 right-0"
      style={{
        height,
        borderRadius: radius,
        background: "rgba(0,0,0,0.20)",
      }}
    />
  );
}
