import { profile } from "@/lib/data/content";
import LiveMachine from "@/components/machine/LiveMachine";

export default function Hero() {
  return (
    <section id="hero" className="sheet-grid border-b border-rule">
      {/* Drawing header strip */}
      <div className="border-b border-rule">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-2 font-mono text-[10px] tracking-widest text-faint uppercase">
          <span>Project: Portfolio — C. Chua</span>
          <span className="hidden sm:inline">Scale 1:1 · Rev A</span>
          <span>2025</span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-14 md:py-20">
        {/* Editorial intro */}
        <div className="reveal is-visible max-w-3xl">
          <p className="mb-4 font-mono text-xs tracking-widest text-wire2 uppercase">
            Software · Systems · Control
          </p>
          <h1 className="font-display text-5xl font-bold leading-[0.95] tracking-tight text-ink md:text-7xl">
            {profile.name}
          </h1>
          <p className="mt-4 text-xl text-ink2 md:text-2xl">{profile.headline}</p>
          <p className="mt-4 max-w-2xl leading-relaxed text-ink2">
            I engineer software for machines, manufacturing, and the systems
            that connect them. I turn complex engineering problems into reliable
            software—from machine applications and control systems to
            data-driven manufacturing solutions.
          </p>
        </div>

        {/* The centerpiece: closed-loop sorting station */}
        <div className="reveal is-visible mt-12">
          <p className="mb-3 max-w-2xl text-sm leading-relaxed text-ink2">
            See engineering in action. Explore a live PLC simulation where
            sensors, control logic, and machine states work together.{" "}
            <span className="text-wire2">
              Trigger a fault, follow the scan cycle, and see how the system
              responds.
            </span>
          </p>

          <div className="mb-6 mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-faint">
            <span>{profile.pronouns}</span>
            <span aria-hidden className="text-rule">|</span>
            <span>{profile.location}</span>
            <span aria-hidden className="text-rule">|</span>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-wire2 underline decoration-wire/40 underline-offset-4 hover:decoration-wire"
            >
              linkedin ↗
            </a>
          </div>

          <LiveMachine />
        </div>
      </div>
    </section>
  );
}
