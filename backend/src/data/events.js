// Mirrors frontend/src/lib/events.js. Kept in sync manually — this is the
// source of truth the server uses to price and validate registrations, so
// a tampered client payload can never change what gets charged.
export const SOLO_EVENT_PRICE = 150;
export const TEAM_EVENT_PRICE = 250;
export const PASS_PRICE = 350;

export const EVENTS = [
  {
    id: "innosphere",
    name: "InnoSphere",
    category: "technical",
    type: "team",
    price: TEAM_EVENT_PRICE,
    minSize: 1,
    maxSize: 4,
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
    parallelWith: "innosphere",
  },
  {
    id: "visionforge",
    name: "VisionForge",
    category: "technical",
    type: "solo",
    price: SOLO_EVENT_PRICE,
    minSize: 1,
    maxSize: 1,
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
    parallelWith: "visionforge",
  },
  {
    id: "quest-exe",
    name: "Quest.exe",
    category: "nontech",
    type: "team",
    price: TEAM_EVENT_PRICE,
    minSize: 3,
    maxSize: 4,
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
    parallelWith: "quest-exe",
  },
  {
    id: "bidpro",
    name: "BidPro",
    category: "nontech",
    type: "team",
    price: TEAM_EVENT_PRICE,
    minSize: 3,
    maxSize: 4,
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
    parallelWith: "bidpro",
  },
];

const eventById = new Map(EVENTS.map((e) => [e.id, e]));

export function getEvent(id) {
  return eventById.get(id);
}
