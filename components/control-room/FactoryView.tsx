"use client";

import { useControlRoom } from "@/lib/simulation/store";

export default function FactoryView() {
  const program = useControlRoom((s) => s.program);
  const outputs = useControlRoom((s) => s.outputs);
  const timers = useControlRoom((s) => s.timers);
  const running = useControlRoom((s) => s.running);
  const scanCount = useControlRoom((s) => s.scanCount);

  const motor = outputs.MOTOR ?? false;
  const pusher = outputs.PUSHER ?? false;
  const beacon = outputs.BEACON ?? false;
  const counter = outputs.COUNTER ?? false;
  const ejectTimer = timers.EJECT_DELAY;

  const stackLight =
    program.id === "beacon"
      ? beacon
        ? "amber-flash"
        : "off"
      : motor
        ? "green"
        : running
          ? "amber"
          : "off";

  return (
    <div className="flex h-full flex-col overflow-hidden border border-ink bg-paper">
      <div className="border-b border-ink bg-paper2 px-4 py-2.5">
        <h2 className="font-mono text-[10px] tracking-widest text-wire2 uppercase">
          Factory View
        </h2>
        <p className="mt-0.5 text-[11px] text-ink2">
          Live line driven by the simulated outputs
        </p>
      </div>

      <div className="flex-1 p-4">
        <svg viewBox="0 0 460 240" className="w-full" role="img" aria-label="Animated production line">
          <rect x="10" y="10" width="440" height="220" rx="2" className="fill-paper2 stroke-rule" />

          {/* Stack light tower */}
          <g transform="translate(400, 30)">
            <rect x="-4" y="30" width="8" height="30" className="fill-faint" />
            <rect x="-10" y="10" width="20" height="14" rx="1"
              className={stackLight === "green" ? "fill-live" : "fill-rule"} />
            <rect x="-10" y="-6" width="20" height="14" rx="1"
              className={
                stackLight === "amber-flash"
                  ? "fill-wire lamp-flash"
                  : stackLight === "amber"
                    ? "fill-wire"
                    : "fill-rule"
              } />
            <rect x="-10" y="-22" width="20" height="14" rx="1" className="fill-rule opacity-50" />
          </g>

          {/* Conveyor belt */}
          <rect x="30" y="150" width="340" height="16" rx="8" className="fill-rule" />
          <rect
            x="30" y="150" width="340" height="16" rx="8"
            className={`fill-none stroke-faint ${motor ? "belt-running" : ""}`}
            style={{ strokeDasharray: "6 6" }}
          />
          {[60, 120, 180, 240, 300, 350].map((x) => (
            <circle key={x} cx={x} cy="166" r="3" className={motor ? "fill-ink2" : "fill-rule"} />
          ))}
          <text x="200" y="185" textAnchor="middle" className="fill-current font-mono text-faint" fontSize="9">
            {motor ? "CONVEYOR RUNNING" : "CONVEYOR STOPPED"}
          </text>

          {/* Boxes */}
          <g>
            {[70, 150, 230].map((x) => (
              <rect key={x} x={x} y="122" width="26" height="26" rx="1"
                className={motor ? "fill-wire" : "fill-wire opacity-40"} />
            ))}
          </g>

          {/* Photo-eye */}
          <g transform="translate(320, 100)">
            <rect x="-6" y="20" width="12" height="30" className="fill-ink2" />
            <line x1="0" y1="20" x2="0" y2="52"
              className={ejectTimer && ejectTimer.elapsed > 0 ? "stroke-wire" : "stroke-live"}
              strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="0" y="12" textAnchor="middle" className="fill-current font-mono text-faint" fontSize="8">
              PE
            </text>
          </g>

          {/* Pusher arm */}
          <g transform={`translate(${pusher ? 250 : 262}, 118)`}>
            <rect x="0" y="0" width="14" height="34" rx="1"
              className={pusher ? "fill-wire" : "fill-ink2"} />
            <text x="7" y="-6" textAnchor="middle" className="fill-current font-mono text-faint" fontSize="8">
              PUSHER
            </text>
          </g>

          {/* Counter display */}
          <g transform="translate(40, 40)">
            <rect x="0" y="0" width="90" height="44" rx="2" className="fill-paper stroke-ink" />
            <text x="45" y="20" textAnchor="middle" className="fill-current font-mono text-faint" fontSize="8">
              EJECTED
            </text>
            <text x="45" y="38" textAnchor="middle"
              className={`fill-current font-mono text-2xl ${counter ? "text-live" : "text-ink"}`}>
              {String(scanCount % 100).padStart(2, "0")}
            </text>
          </g>

          {/* Status readout */}
          <g transform="translate(160, 40)">
            <rect x="0" y="0" width="120" height="44" rx="2" className="fill-paper stroke-ink" />
            <circle cx="16" cy="22" r="5" className={running ? "fill-live" : "fill-wire"} />
            <text x="30" y="26" className="fill-current font-mono text-ink" fontSize="11">
              {running ? "RUN" : "STOP"}
            </text>
          </g>
        </svg>
      </div>

      <div className="border-t border-ink bg-paper2 px-4 py-2.5">
        <p className="font-mono text-[10px] text-faint">{program.note}</p>
      </div>
    </div>
  );
}
