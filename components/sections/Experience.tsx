"use client";

import { experience } from "@/lib/data/content";

export default function Experience() {
  return (
    <section id="experience" className="scroll-mt-16 border-b border-rule">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 flex items-baseline justify-between">
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
            Work Experience
          </h2>
          <span className="font-mono text-[10px] tracking-widest text-faint uppercase">
            Sheet 2 — As-Built Record
          </span>
        </div>

        <div className="stagger is-visible space-y-10">
          {experience.map((job, idx) => (
            <article
              key={job.company}
              id={idx === 0 ? "experience-sensata" : "experience-precision"}
              className="scroll-mt-24 border border-ink bg-paper"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink bg-paper2 px-5 py-2.5">
                <span className="font-mono text-[10px] tracking-widest text-faint uppercase">
                  DWG CC-{String(idx + 1).padStart(3, "0")} · {job.type}
                </span>
                <span className="font-mono text-[10px] tracking-widest text-wire2 uppercase">
                  {job.period}
                </span>
              </div>

              <div className="border-l-2 border-wire">
                <div className="px-5 py-5 md:px-7">
                  <h3 className="font-display text-xl font-bold text-ink md:text-2xl">
                    {job.role}
                  </h3>
                  <p className="mt-1 font-mono text-sm text-wire2">{job.company}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-faint">{job.location}</p>

                  <ol className="mt-5 space-y-3">
                    {job.bullets.map((bullet, i) => (
                      <li key={i} className="flex gap-3 text-sm leading-relaxed text-ink2">
                        <span className="mt-0.5 font-mono text-[10px] text-wire2">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ol>

                  <p className="mt-5 border-t border-rule pt-3 font-mono text-[11px] text-faint">
                    TOOLS: {job.tags.join(" · ")}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
