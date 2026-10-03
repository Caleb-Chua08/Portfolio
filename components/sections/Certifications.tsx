"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { certifications } from "@/lib/data/content";

export default function Certifications() {
  const [active, setActive] = useState<number | null>(null);
  const activeCert = active !== null ? certifications[active] : undefined;
  const activeImage = activeCert?.image;

  // Close on Escape and hold the page still while the viewer is open.
  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [active]);

  return (
    <section id="certifications" className="scroll-mt-16 border-b border-rule">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 flex items-baseline justify-between">
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
            Certifications
          </h2>
          <span className="font-mono text-[10px] tracking-widest text-faint uppercase">
            Sheet 5 — Schedule
          </span>
        </div>

        {/* Drawing schedule table — hairline rows, not cards */}
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-ink font-mono text-[10px] tracking-widest text-faint uppercase">
              <th className="py-2 pr-4 font-medium">Certification</th>
              <th className="hidden py-2 pr-4 font-medium sm:table-cell">Issuer</th>
              <th className="py-2 pr-4 font-medium">Date</th>
              <th className="py-2 font-medium">Doc</th>
            </tr>
          </thead>
          <tbody>
            {certifications.map((cert, i) => (
              <tr key={cert.name} className="border-b border-rule align-top">
                <td className="py-3 pr-4 text-sm text-ink">{cert.name}</td>
                <td className="hidden py-3 pr-4 font-mono text-xs text-ink2 sm:table-cell">
                  {cert.issuer}
                </td>
                <td className="py-3 pr-4 font-mono text-xs text-ink2">
                  {cert.date ?? "—"}
                </td>
                <td className="py-3 pr-4">
                  {cert.image ? (
                    <button
                      type="button"
                      onClick={() => setActive(i)}
                      title="View certificate"
                      aria-label={`View certificate — ${cert.name}`}
                      className="block cursor-zoom-in border border-rule bg-paper2 p-1 transition-colors hover:border-ink"
                    >
                      <span className="relative block h-14 w-24">
                        <Image
                          src={cert.image}
                          alt=""
                          fill
                          sizes="96px"
                          className="object-contain"
                        />
                      </span>
                    </button>
                  ) : (
                    <span className="font-mono text-xs text-faint">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Certificate viewer — opens like a drawing sheet on the light table */}
      {activeCert && activeImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Certificate — ${activeCert.name}`}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          onClick={() => setActive(null)}
        >
          <div className="absolute inset-0 bg-ink/70 backdrop-blur-sm" aria-hidden="true" />
          <div
            className="relative flex max-h-full w-full max-w-4xl flex-col border border-ink bg-paper shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-rule px-4 py-2">
              <span className="font-mono text-[10px] tracking-widest text-faint uppercase">
                Doc — {activeCert.issuer}
              </span>
              <button
                type="button"
                onClick={() => setActive(null)}
                className="font-mono text-[10px] tracking-widest text-ink2 uppercase hover:text-wire2"
              >
                Close ✕
              </button>
            </div>
            <div className="relative h-[70vh] w-full bg-paper2">
              <Image
                src={activeImage}
                alt={`Certificate — ${activeCert.name}`}
                fill
                sizes="(max-width: 896px) 100vw, 896px"
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-rule px-4 py-3">
              <p className="text-sm text-ink">{activeCert.name}</p>
              <div className="flex items-baseline gap-4 font-mono text-xs text-ink2">
                <span>{activeCert.date ?? "—"}</span>
                {activeCert.verifyUrl && (
                  <a
                    href={activeCert.verifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-wire2 underline decoration-wire/40 underline-offset-4 hover:decoration-wire"
                  >
                    verify ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
