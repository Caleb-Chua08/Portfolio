import { skills } from "@/lib/data/content";

export default function Skills() {
  return (
    <section id="skills" className="scroll-mt-16 border-b border-rule">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 flex items-baseline justify-between">
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
            Skills
          </h2>
          <span className="font-mono text-[10px] tracking-widest text-faint uppercase">
            Sheet 6 — Legend
          </span>
        </div>

        <div className="space-y-5">
          {skills.map((group, i) => (
            <div
              key={group.group}
              className="grid gap-2 border-b border-rule pb-5 md:grid-cols-[220px_1fr]"
            >
              <p className="whitespace-nowrap font-mono text-[11px] tracking-widest text-wire2 uppercase">
                {String(i + 1).padStart(2, "0")} · {group.group}
              </p>
              <p className="overflow-x-auto whitespace-nowrap font-mono text-sm leading-relaxed text-ink2">
                {group.items.join(" · ")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
