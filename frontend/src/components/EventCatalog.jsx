import { Link } from "react-router-dom";
import { EVENT_PAIRS } from "../lib/events.js";

function inrFmt(n) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function CatalogCard({ ev }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-sky-400/15 bg-slate-950/50 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-400/40 hover:shadow-[0_0_18px_rgba(56,189,248,0.16)]">
      <div className="flex items-start justify-between gap-2">
        <span className="text-3xl drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]">{ev.emoji}</span>
        <div className="flex flex-col items-end gap-1">
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${
              ev.type === "team"
                ? "border-amber-400/30 bg-amber-500/10 text-amber-300"
                : "border-sky-400/30 bg-sky-500/10 text-sky-300"
            }`}
          >
            {ev.type === "team"
              ? ev.minSize === ev.maxSize
                ? `Team ${ev.maxSize}`
                : `Team ${ev.minSize}–${ev.maxSize}`
              : "Solo"}
          </span>
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${
              ev.category === "technical"
                ? "border-cyan-400/30 bg-cyan-500/10 text-cyan-300"
                : "border-violet-400/30 bg-violet-500/10 text-violet-300"
            }`}
          >
            {ev.category === "technical" ? "Tech" : "Non-Tech"}
          </span>
        </div>
      </div>
      <h3 className="mt-3 font-serif text-lg tracking-wider text-sky-50">{ev.name}</h3>
      <p className="mt-1 text-xs leading-relaxed text-slate-400">{ev.description}</p>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-widest text-slate-500">
          {ev.type === "team" ? "Your Seat Fee" : "Entry Fee"}
        </span>
        <span className="font-serif text-lg text-sky-200 drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]">
          {inrFmt(ev.price)}
        </span>
      </div>
    </div>
  );
}

export default function EventCatalog() {
  return (
    <div className="space-y-8">
      {EVENT_PAIRS.map(([a, b], i) => (
        <div key={i}>
          <div className="grid gap-3 sm:grid-cols-2">
            <CatalogCard ev={a} />
            <CatalogCard ev={b} />
          </div>
          <p className="mt-2 text-center text-[10px] uppercase tracking-[0.3em] text-slate-600">
            Same time-slot · pick one
          </p>
        </div>
      ))}
      <div className="flex justify-center">
        <Link
          to="/"
          className="rounded-full border border-sky-400/40 bg-sky-500/10 px-8 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-sky-100 transition hover:bg-sky-500/20"
        >
          ← Back to Register
        </Link>
      </div>
    </div>
  );
}
