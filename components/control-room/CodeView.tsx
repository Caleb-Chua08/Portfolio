"use client";

import { useMemo } from "react";
import { useControlRoom } from "@/lib/simulation/store";
import { generateCpp } from "@/lib/simulation/codegen";

export default function CodeView() {
  const program = useControlRoom((s) => s.program);
  const lastScan = useControlRoom((s) => s.lastScan);

  const lines = useMemo(() => generateCpp(program), [program]);
  const activeRung = lastScan?.activeRung ?? -1;

  return (
    <div className="flex h-full flex-col overflow-hidden border border-ink bg-paper">
      <div className="border-b border-ink bg-paper2 px-4 py-2.5">
        <h2 className="font-mono text-[10px] tracking-widest text-wire2 uppercase">
          C++ Scan Cycle
        </h2>
        <p className="mt-0.5 text-[11px] text-ink2">
          How I translate ladder logic into C++ — the active line glows each scan
        </p>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <pre className="font-mono text-[11px] leading-relaxed">
          {lines.map((line, i) => {
            const isActive = line.rungIndex !== null && line.rungIndex === activeRung;
            return (
              <div
                key={i}
                className={`flex gap-3 rounded-sm px-1 ${
                  isActive ? "code-active" : "text-ink2"
                }`}
              >
                <span className="w-6 shrink-0 select-none text-right text-faint/60">
                  {i + 1}
                </span>
                <code className="whitespace-pre">{line.text || " "}</code>
              </div>
            );
          })}
        </pre>
      </div>
    </div>
  );
}
