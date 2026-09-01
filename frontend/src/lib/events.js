export const SOLO_EVENT_PRICE = 150;
export const TEAM_EVENT_PRICE = 250;
export const PASS_PRICE = 350;

// Parallel pairs run in the same time-slot. A participant may pick at
// most one event from each pair.
export const EVENT_PAIRS = [
  [
    {
      id: "innosphere",
      name: "InnoSphere",
      category: "technical",
      type: "team",
      price: TEAM_EVENT_PRICE,
      minSize: 1,
      maxSize: 4,
      description: "Pitch an innovative tech solution to a live panel.",
      emoji: "\u{1F4A1}",
      parallelWith: "tech-trinity",
    },
    {
      id: "tech-trinity",
      name: "Tech Trinity",
      category: "technical",
      type: "solo",
      price: SOLO_EVENT_PRICE,
      minSize: 1,
      maxSize: 1,
      description: "Solo tech challenge across three disciplines.",
      emoji: "\u{1F53A}",
      parallelWith: "innosphere",
    },
  ],
  [
    {
      id: "visionforge",
      name: "VisionForge",
      category: "technical",
      type: "solo",
      price: SOLO_EVENT_PRICE,
      minSize: 1,
      maxSize: 1,
      description: "Solo creative tech showcase.",
      emoji: "\u{1F441}\uFE0F",
      parallelWith: "datalens",
    },
    {
      id: "datalens",
      name: "DataLens",
      category: "technical",
      type: "team",
      price: TEAM_EVENT_PRICE,
      minSize: 2,
      maxSize: 4,
      description: "Data analytics & storytelling sprint.",
      emoji: "\u{1F4CA}",
      parallelWith: "visionforge",
    },
  ],
  [
    {
      id: "quest-exe",
      name: "Quest.exe",
      category: "nontech",
      type: "team",
      price: TEAM_EVENT_PRICE,
      minSize: 3,
      maxSize: 4,
      description: "Mystery escape & puzzle adventure.",
      emoji: "\u2753",
      parallelWith: "zonein",
    },
    {
      id: "zonein",
      name: "ZoneIn",
      category: "nontech",
      type: "team",
      price: TEAM_EVENT_PRICE,
      minSize: 4,
      maxSize: 4,
      description: "Full-squad team coordination challenge.",
      emoji: "\u{1F3AF}",
      parallelWith: "quest-exe",
    },
  ],
  [
    {
      id: "bidpro",
      name: "BidPro",
      category: "nontech",
      type: "team",
      price: TEAM_EVENT_PRICE,
      minSize: 3,
      maxSize: 4,
      description: "Mock auction & strategy face-off.",
      emoji: "\u{1F4B0}",
      parallelWith: "mindwar",
    },
    {
      id: "mindwar",
      name: "MindWar",
      category: "nontech",
      type: "team",
      price: TEAM_EVENT_PRICE,
      minSize: 3,
      maxSize: 4,
      description: "Strategy & rapid reasoning battle.",
      emoji: "\u{1F9E9}",
      parallelWith: "bidpro",
    },
  ],
];

export const EVENTS = EVENT_PAIRS.flat();

const eventById = new Map(EVENTS.map((e) => [e.id, e]));

export function getEvent(id) {
  return eventById.get(id);
}

export function partnerOf(id) {
  return eventById.get(id)?.parallelWith ?? null;
}

// Backwards-compatible name for solo event price in any older imports.
export const EVENT_PRICE = SOLO_EVENT_PRICE;
