"use client";

import { useControlRoom } from "@/lib/simulation/store";
import type { LadderElement } from "@/lib/simulation/types";

function ElementGraphic({ el, energized }: { el: LadderElement; energized: boolean }) {
  const wire = energized ? "stroke-wire" : "stroke-faint";
  const label = energized ? "text-wire2" : "text-faint";

  switch (el.type) {
    case "contactNO":
      return (
        <g>
          <line x1="0" y1="0" x2="14" y2="0" className={wire} strokeWidth="2" />
          <line x1="14" y1="-14" x2="14" y2="14" className={wire} strokeWidth="2" />
          <line x1="30" y1="-14" x2="30" y2="14" className={wire} strokeWidth="2" />
          <line x1="30" y1="0" x2="44" y2="0" className={wire} strokeWidth="2" />
          <text x="22" y="-20" textAnchor="middle" className={`fill-current font-mono ${label}`} fontSize="9">
            {el.name}
          </text>
        </g>
      );
    case "contactNC":
      return (
        <g>
          <line x1="0" y1="0" x2="14" y2="0" className={wire} strokeWidth="2" />
          <line x1="14" y1="-14" x2="14" y2="14" className={wire} strokeWidth="2" />
          <line x1="30" y1="-14" x2="30" y2="14" className={wire} strokeWidth="2" />
          <line x1="14" y1="14" x2="34" y2="-16" className={wire} strokeWidth="2" />
          <line x1="30" y1="0" x2="44" y2="0" className={wire} strokeWidth="2" />
          <text x="22" y="-20" textAnchor="middle" className={`fill-current font-mono ${label}`} fontSize="9">
            {el.name}
          </text>
        </g>
      );
    case "coil":
      return (
        <g>
          <line x1="0" y1="0" x2="15" y2="0" className={wire} strokeWidth="2" />
          <path d="M15 -14 Q7 0 15 14" fill="none" className={wire} strokeWidth="2" />
          <path d="M29 -14 Q37 0 29 14" fill="none" className={wire} strokeWidth="2" />
          <line x1="29" y1="0" x2="44" y2="0" className={wire} strokeWidth="2" />
          <text x="22" y="-20" textAnchor="middle" className={`fill-current font-mono ${label}`} fontSize="9">
            {el.name}
          </text>
        </g>
      );
    case "timerTON":
      return (
        <g>
          <line x1="0" y1="0" x2="8" y2="0" className={wire} strokeWidth="2" />
          <rect x="8" y="-16" width="44" height="32" rx="2"
            className={`fill-paper ${energized ? "stroke-wire" : "stroke-faint"}`} strokeWidth="1.5" />
          <text x="30" y="-2" textAnchor="middle" className={`fill-current font-mono ${label}`} fontSize="8">
            TON
          </text>
          <text x="30" y="10" textAnchor="middle" className={`fill-current font-mono ${label}`} fontSize="8">
            {el.preset}s
          </text>
          <line x1="52" y1="0" x2="60" y2="0" className={wire} strokeWidth="2" />
          <text x="30" y="-24" textAnchor="middle" className={`fill-current font-mono ${label}`} fontSize="9">
            {el.name}
          </text>
        </g>
      );
  }
}

export default function LadderEditor() {
  const program = useControlRoom((s) => s.program);
  const inputs = useControlRoom((s) => s.inputs);
  const outputs = useControlRoom((s) => s.outputs);
  const timers = useControlRoom((s) => s.timers);
  const lastScan = useControlRoom((s) => s.lastScan);
  const toggleInput = useControlRoom((s) => s.toggleInput);

  const isEnergized = (el: LadderElement): boolean => {
    const timerDone = timers[el.name]?.done ?? false;
    switch (el.type) {
      case "contactNO":
        return inputs[el.name] || outputs[el.name] || timerDone;
      case "contactNC":
        return !(inputs[el.name] || outputs[el.name] || timerDone);
      case "coil":
        return outputs[el.name];
      case "timerTON":
        return timerDone;
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden border border-ink bg-paper">
      <div className="border-b border-ink bg-paper2 px-4 py-2.5">
        <h2 className="font-mono text-[10px] tracking-widest text-wire2 uppercase">
          Ladder Logic — {program.name}
        </h2>
        <p className="mt-0.5 text-[11px] text-ink2">{program.description}</p>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-5">
          {program.rungs.map((rung, i) => {
            const powered = lastScan?.rungPower[i] ?? false;
            return (
              <div key={rung.id}>
                {rung.comment && (
                  <p className="mb-1 font-mono text-[10px] text-faint">
                    {`// ${rung.comment}`}
                  </p>
                )}
                <svg viewBox="0 0 460 60" className="w-full" role="img" aria-label={`Rung ${i + 1}`}>
                  <line x1="10" y1="5" x2="10" y2="55" className="stroke-ink" strokeWidth="2" />
                  <line x1="450" y1="5" x2="450" y2="55" className="stroke-ink" strokeWidth="2" />
                  {rung.branches.map((branch, bi) => {
                    const y = 30 + (bi - (rung.branches.length - 1) / 2) * 22;
                    let x = 10;
                    return (
                      <g key={bi} transform={`translate(0, ${y})`}>
                        {branch.map((el) => {
                          const energized = powered && isEnergized(el);
                          const node = (
                            <g key={el.id} transform={`translate(${x + 10}, 0)`}>
                              <ElementGraphic el={el} energized={energized} />
                            </g>
                          );
                          x += el.type === "timerTON" ? 70 : 54;
                          return node;
                        })}
                        <line
                          x1={x + 10}
                          y1="0"
                          x2="450"
                          y2="0"
                          className={powered ? "stroke-wire wire-live" : "stroke-rule"}
                          strokeWidth="2"
                        />
                      </g>
                    );
                  })}
                </svg>
              </div>
            );
          })}
        </div>
      </div>

      {program.inputs.length > 0 && (
        <div className="border-t border-ink bg-paper2 p-4">
          <p className="mb-2 font-mono text-[10px] tracking-widest text-faint uppercase">
            Inputs — click to toggle
          </p>
          <div className="flex flex-wrap gap-2">
            {program.inputs.map((inp) => (
              <button
                key={inp}
                onClick={() => toggleInput(inp)}
                aria-pressed={inputs[inp]}
                className={`flex items-center gap-2 border px-3 py-1.5 font-mono text-xs ${
                  inputs[inp]
                    ? "border-live bg-live/10 text-live"
                    : "border-rule bg-paper text-faint hover:border-faint"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${inputs[inp] ? "bg-live" : "bg-rule"}`} />
                {inp}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
