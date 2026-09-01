import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="relative z-10 mx-auto max-w-2xl px-6 pt-24 pb-24 text-center">
      <p className="font-serif text-6xl text-sky-300/70">404</p>
      <h1 className="mt-4 font-serif text-3xl tracking-[0.25em] text-sky-100">
        Lost in the Ruins
      </h1>
      <p className="mt-3 text-sm text-slate-400">
        The path you seek does not exist in this realm.
      </p>
      <Link
        to="/"
        className="mt-8 inline-block rounded-full border border-sky-400/40 bg-sky-500/10 px-8 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-sky-100 transition hover:bg-sky-500/20"
      >
        Return to Gate
      </Link>
    </section>
  );
}
