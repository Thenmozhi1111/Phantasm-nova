export default function Field({ label, icon, ...props }) {
  return (
    <label className="auth-field block">
      <span className="field-label mb-2 block text-xs font-medium text-slate-300">{label}</span>
      <div className="field flex h-12 items-center rounded-xl border border-slate-700/80 bg-[#061524]/80 px-3 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.04)]">
        <span className="mr-3 flex h-6 w-6 items-center justify-center rounded-md border border-sky-400/20 bg-sky-500/5 text-sm text-sky-200" aria-hidden="true">{icon}</span>
        <input {...props} className="field-input w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600" />
      </div>
    </label>
  )
}
