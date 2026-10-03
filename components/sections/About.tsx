import { profile } from "@/lib/data/content";

export default function About() {
  return (
    <section id="about" className="scroll-mt-16 border-b border-rule">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-[1fr_2fr]">
        <div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
            About
          </h2>
          <p className="mt-2 font-mono text-[10px] tracking-widest text-faint uppercase">
            Sheet 1 — General Notes
          </p>
        </div>
        <div className="max-w-2xl">
          <p className="text-lg leading-relaxed text-ink2 first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-5xl first-letter:font-bold first-letter:leading-none first-letter:text-wire2">
            {profile.about[0]}
          </p>
          <p className="mt-4 leading-relaxed text-ink2">{profile.about[1]}</p>
        </div>
      </div>
    </section>
  );
}
