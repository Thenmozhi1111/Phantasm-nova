// DesktopConstellation.jsx
// The main deliverable: a single quest-line (Inaugural → Lunch → Valedictory)
// with four small "twin-star" branches hanging off it — one branch per
// 1-hour slot, each branch splitting into the two events running that hour.
//
// All positions are hand-placed percentages so the layout stays readable;
// tweak the POSITIONS map below if you rename/reorder events later.

import { scheduleTimeline } from "../data/scheduleData";
import ConstellationPath from "./ConstellationPath";
import StarNode from "./StarNode";

// x, y as % of the map container (which is fixed at a 2:1 aspect ratio)
const POSITIONS = {
  inaugural: { x: 5, y: 50 },
  lunch: { x: 50, y: 50 },
  valedictory: { x: 95, y: 50 },

  innosphere: { x: 18, y: 16 },
  techtrinity: { x: 34, y: 16 },
  visionforge: { x: 22, y: 84  },
  datalens: { x: 38, y: 84 },

  questexe: { x: 62, y: 16 },
  zonein: { x: 66, y: 84 },
  bidpro: { x: 78, y: 16 },
  mindwar: { x: 82, y: 84 },
};

// Where each 1-hour branch splits off the main spine
const ORIGINS = {
  "tech-slot-1": { x: 20, y: 50 },
  "tech-slot-2": { x: 36, y: 50 },
  "nontech-slot-1": { x: 64, y: 50 },
  "nontech-slot-2": { x: 80, y: 50 },
};

// Convert % to the 1000x500 viewBox (matches the 2:1 container aspect ratio)
const vx = (pct) => pct * 10;
const vy = (pct) => pct * 5;

const line = (a, b) => `M${vx(a.x)},${vy(a.y)} L${vx(b.x)},${vy(b.y)}`;

export default function DesktopConstellation() {
  const clusters = scheduleTimeline.filter((item) => item.type === "cluster");
  const nodes = scheduleTimeline.filter((item) => item.type === "node");

  return (
    <div className="relative w-full" style={{ aspectRatio: "2 / 1" }}>
      <svg
        viewBox="0 0 1000 500"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          <linearGradient id="constellationGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* main spine */}
        <ConstellationPath d={line(POSITIONS.inaugural, POSITIONS.lunch)} />
        <ConstellationPath d={line(POSITIONS.lunch, POSITIONS.valedictory)} delay={0.2} />

        {/* branch lines — each pair splits from its slot's origin point */}
        {Object.entries(ORIGINS).map(([slotId, origin], i) => {
          const cluster = clusters.find((c) => c.id.startsWith(slotId.split("-slot")[0]));
          const slot = cluster?.slots.find((s) => s.id === slotId);
          if (!slot) return null;
          return slot.events.map((ev, j) => (
            <ConstellationPath
              key={ev.id}
              d={line(origin, POSITIONS[ev.id])}
              delay={i * 0.08 + j * 0.05}
              thin
            />
          ));
        })}

        {/* junction dots where branches leave the spine */}
        {Object.values(ORIGINS).map((o, i) => (
          <circle key={i} cx={vx(o.x)} cy={vy(o.y)} r="3" fill="#60a5fa" fillOpacity="0.7" />
        ))}
      </svg>

      {/* spine nodes */}
      {nodes.map((n) => (
        <div
          key={n.id}
          className="absolute"
          style={{
            left: `${POSITIONS[n.id].x}%`,
            top: `${POSITIONS[n.id].y}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <StarNode
            time={n.time}
            title={n.title}
            venue={n.venue}
            desc={n.desc}
            cardSide="bottom"
          />
        </div>
      ))}

      {/* cluster labels + branch event stars */}
      {clusters.map((cluster) => (
        <div key={cluster.id}>
          <div
            className="absolute -translate-x-1/2 text-[10px] tracking-[3px] text-blue-500/90 font-body
                       border border-blue-500/60 rounded-full px-3 py-1 bg-slate-950/60"
            style={{
              left: `${
                (ORIGINS[cluster.slots[0].id].x + ORIGINS[cluster.slots[cluster.slots.length - 1].id].x) / 2
              }%`,
              top: "4%",
            }}
          >
            {cluster.label}
          </div>

          {cluster.slots.map((slot) => (
            <div key={slot.id}>
              {/* slot time label, sits just under the spine at the branch origin */}
              <div
  className="absolute -translate-x-1/2 text-[9px] text-slate-400 font-body whitespace-nowrap"
  style={{
    left: `${ORIGINS[slot.id].x}%`,
    top: slot.id === "tech-slot-2" || slot.id === "nontech-slot-1"
      ? "44%"
      : "56%",
  }}
>
  {slot.time}
</div>

              {slot.events.map((ev) => (
                <div
                  key={ev.id}
                  className="absolute"
                  style={{
                    left: `${POSITIONS[ev.id].x}%`,
                    top: `${POSITIONS[ev.id].y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <StarNode
                    time={slot.time}
                    title={ev.title}
                    venue={ev.venue}
                    desc={ev.desc}
                    cardSide={POSITIONS[ev.id].y < 50 ? "top" : "bottom"}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
