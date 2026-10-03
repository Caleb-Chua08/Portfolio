import { education } from "@/lib/data/content";

export default function Education() {
  return (
    <section id="education" className="scroll-mt-16 border-b border-rule">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 flex items-baseline justify-between">
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
            Education
          </h2>
          <span className="font-mono text-[10px] tracking-widest text-faint uppercase">
            Sheet 3 — Foundation
          </span>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-ink pb-6">
          <div>
            <h3 className="font-display text-xl font-bold text-ink md:text-2xl">
              {education.degree}
            </h3>
            <p className="mt-1 text-sm text-ink2">
              {education.school} · {education.field}
            </p>
            <p className="mt-1 font-mono text-[11px] text-faint">{education.period}</p>
          </div>
          {/* Dimension-line style CGPA callout */}
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className="h-px w-10 bg-wire" />
              <span className="font-mono text-[10px] tracking-widest text-faint uppercase">
                CGPA
              </span>
            </div>
            <p className="font-display text-5xl font-bold text-wire2">
              {education.cgpa}
              <span className="text-lg text-faint">/4.00</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
