"use client";

import { useEffect, useMemo } from "react";
import {
  useControlRoom,
  BELT,
  type Box,
} from "@/lib/simulation/store";
import { presets } from "@/lib/simulation/presets";
import { generateCpp } from "@/lib/simulation/codegen";

const SORTING = presets.find((p) => p.id === "sorting-station")!;

/** SVG x-coordinate for a belt position 0..100. */
const beltX = (x: number) => 40 + (x / 100) * 380;

const BOX_Y = 122; // resting y on the belt
/** Rect x that centers a 24-wide box in the reject bin throat. */
const BIN_BOX_X = 333;
/** Box top y once fully sunk: below the bin rim, above the slanted walls. */
const BIN_REST_Y = 152;

/**
 * Eject flight path: the pusher shoves the box along the belt, then it
 * drops into the reject bin. The bin graphic is painted after the boxes,
 * so the part sinks behind its front wall and vanishes inside.
 */
function ejectPose(boxX: number): { x: number; y: number } {
  const launch = BELT.pusher + 2; // shove phase ends at the belt edge
  if (boxX <= launch) return { x: beltX(boxX), y: BOX_Y };
  const fall = Math.min(1, (boxX - launch) / 12); // 12 units of flight
  return {
    // Sideways first (the shove), then gravity takes over.
    x:
      beltX(launch) +
      (BIN_BOX_X - beltX(launch)) * Math.min(1, fall / 0.45),
    y: BOX_Y + (BIN_REST_Y - BOX_Y) * fall * fall,
  };
}

function BoxSprite({ box }: { box: Box }) {
  const pose = box.ejecting ? ejectPose(box.x) : { x: beltX(box.x), y: BOX_Y };
  return (
    <rect
      x={pose.x}
      y={pose.y}
      width="24"
      height="24"
      rx="1"
      className={`transition-all duration-150 ease-linear ${
        box.defective ? "fill-wire" : "fill-ink2"
      }`}
      style={{ transitionProperty: "x, y" }}
    />
  );
}

/** Short display names so ladder labels never overlap. */
const shortName = (name: string) =>
  name
    .replace("PHOTO_EYE", "P.EYE")
    .replace("PART_PRESENT", "PRESENT")
    .replace("DEFECT_CAM", "D.CAM")
    .replace("DEFECT_FLAG", "D.FLG")
    .replace("REJECT_DELAY", "R.DLY")
    .replace("REJECT_LAMP", "R.LAMP")
    .replace("PUSHER_TIMER", "P.TMR")
    .replace("PUSHER", "PUSH");

/** Vertical distance between parallel branch paths of one rung. */
const RUNG_SPREAD = 32;

/** Rung wire positions — taller rungs for parallel branches so symbols and
 * labels never collide. Precomputed once from the program's branch counts. */
const rungYs = (() => {
  const ys: number[] = [];
  let cursor = 28;
  for (const r of SORTING.rungs) {
    ys.push(cursor);
    cursor += (r.branches.length - 1) * RUNG_SPREAD + 48;
  }
  return ys;
})();

/** Ladder rail geometry — the right rail hugs the widest rung content so
 * rungs never trail off into long stretches of unused wire. */
const RAIL_L = 16;
const RAIL_R = (() => {
  const widest = Math.max(
    ...SORTING.rungs.flatMap((rung) =>
      rung.branches.map((branch) =>
        branch.reduce((sum, el) => sum + (el.type === "timerTON" ? 46 : 30), 0)
      )
    )
  );
  return RAIL_L + 12 + widest + 10;
})();

/** Compact ladder rung for the side panel, drawn to ladder conventions:
 * numbered rungs, continuous rail-to-rail wiring, parallel branches drawn
 * as stacked paths that split from the left rail and rejoin before the
 * right rail, contact/coil/timer symbols. */
function MiniRung({
  rung,
  index,
  powered,
  isEnergized,
}: {
  rung: (typeof SORTING)["rungs"][number];
  index: number;
  powered: boolean;
  isEnergized: (name: string, type: string) => boolean;
}) {
  const railL = RAIL_L;
  const railR = RAIL_R;
  const y = rungYs[index];
  const branches = rung.branches;
  const yOffs = branches.map(
    (_, bi) => bi * RUNG_SPREAD - ((branches.length - 1) * RUNG_SPREAD) / 2
  );

  // Per-branch element widths/offsets — precomputed, no render mutation.
  const geoms = branches.map((branch) => {
    const widths = branch.map((el) => (el.type === "timerTON" ? 46 : 30));
    const offsets = widths.map(
      (_, i) => railL + 12 + widths.slice(0, i).reduce((a, b) => a + b, 0)
    );
    const end = railL + 12 + widths.reduce((a, b) => a + b, 0);
    return { widths, offsets, end };
  });
  const joinX = Math.max(...geoms.map((g) => g.end));
  const wire = powered ? "stroke-wire wire-live" : "stroke-rule";

  return (
    <g>
      <text x={5} y={y + 3} fontSize="7" className="fill-current font-mono text-faint">
        {index + 1}
      </text>
      <g transform={`translate(0, ${y})`}>
        {branches.map((branch, bi) => {
          const yOff = yOffs[bi];
          const { widths, offsets, end } = geoms[bi];
          return (
            <g key={bi} transform={`translate(0, ${yOff})`}>
              {/* Rail to first element */}
              <line x1={railL} y1="0" x2={offsets[0]} y2="0" className={wire} strokeWidth="1.5" />
              {branch.map((el, i) => {
                const x = offsets[i];
                const on = powered && isEnergized(el.name, el.type);
                const cls = on ? "stroke-wire" : "stroke-rule";
                const txt = on ? "text-wire2" : "text-faint";
                const node = (() => {
                  switch (el.type) {
                    case "contactNO":
                    case "contactNC":
                      return (
                        <g transform={`translate(${x}, 0)`}>
                          <line x1="0" y1="0" x2="7" y2="0" className={cls} strokeWidth="1.5" />
                          <line x1="7" y1="-8" x2="7" y2="8" className={cls} strokeWidth="1.5" />
                          <line x1="19" y1="-8" x2="19" y2="8" className={cls} strokeWidth="1.5" />
                          <line x1="19" y1="0" x2="30" y2="0" className={cls} strokeWidth="1.5" />
                          {el.type === "contactNC" && (
                            <line x1="9" y1="8" x2="17" y2="-8" className={cls} strokeWidth="1.5" />
                          )}
                          <text x="13" y="-12" textAnchor="middle" fontSize="7" className={`fill-current font-mono ${txt}`}>
                            {shortName(el.name)}
                          </text>
                        </g>
                      );
                    case "coil":
                      return (
                        <g transform={`translate(${x}, 0)`}>
                          <line x1="0" y1="0" x2="11" y2="0" className={cls} strokeWidth="1.5" />
                          <path d="M11 -8 Q5 0 11 8" fill="none" className={cls} strokeWidth="1.5" />
                          <path d="M19 -8 Q25 0 19 8" fill="none" className={cls} strokeWidth="1.5" />
                          <line x1="19" y1="0" x2="30" y2="0" className={cls} strokeWidth="1.5" />
                          <text x="15" y="-12" textAnchor="middle" fontSize="7" className={`fill-current font-mono ${txt}`}>
                            {shortName(el.name)}
                          </text>
                        </g>
                      );
                    case "timerTON":
                      return (
                        <g transform={`translate(${x}, 0)`}>
                          <line x1="0" y1="0" x2="5" y2="0" className={cls} strokeWidth="1.5" />
                          <rect x="5" y="-10" width="36" height="20" rx="2"
                            className={`fill-paper ${on ? "stroke-wire" : "stroke-rule"}`} strokeWidth="1.5" />
                          <text x="23" y="-1" textAnchor="middle" fontSize="7" className={`fill-current font-mono ${txt}`}>
                            TON
                          </text>
                          <text x="23" y="8" textAnchor="middle" fontSize="6" className={`fill-current font-mono ${txt}`}>
                            {el.preset}s
                          </text>
                          <line x1="41" y1="0" x2="46" y2="0" className={cls} strokeWidth="1.5" />
                          <text x="23" y="-15" textAnchor="middle" fontSize="7" className={`fill-current font-mono ${txt}`}>
                            {shortName(el.name)}
                          </text>
                        </g>
                      );
                  }
                })();
                return <g key={el.id}>{node}</g>;
              })}
              {/* Element jumpers, then out to the branch join */}
              {offsets.slice(0, -1).map((off, i) => (
                <line
                  key={`w${bi}-${i}`}
                  x1={off + widths[i]} y1="0" x2={offsets[i + 1]} y2="0"
                  className={wire} strokeWidth="1.5"
                />
              ))}
              {end < joinX && (
                <line x1={end} y1="0" x2={joinX} y2="0" className={wire} strokeWidth="1.5" />
              )}
            </g>
          );
        })}
        {/* Branch join, then the right rail */}
        {branches.length > 1 && (
          <line x1={joinX} y1={yOffs[0]} x2={joinX} y2={yOffs[branches.length - 1]} className={wire} strokeWidth="1.5" />
        )}
        <line x1={joinX} y1="0" x2={railR} y2="0" className={wire} strokeWidth="1.5" />
      </g>
    </g>
  );
}

export default function LiveMachine() {
  const boxes = useControlRoom((s) => s.boxes);
  const machineRunning = useControlRoom((s) => s.machineRunning);
  const machineScanCount = useControlRoom((s) => s.machineScanCount);
  const stats = useControlRoom((s) => s.stats);
  const machineScan = useControlRoom((s) => s.machineScan);
  const inputs = useControlRoom((s) => s.inputs);
  const outputs = useControlRoom((s) => s.outputs);
  const timers = useControlRoom((s) => s.timers);
  const scanRateMs = useControlRoom((s) => s.scanRateMs);
  const toggleMotor = useControlRoom((s) => s.toggleMotor);
  const injectDefect = useControlRoom((s) => s.injectDefect);
  const resetMachine = useControlRoom((s) => s.resetMachine);
  const machineTick = useControlRoom((s) => s.machineTick);

  // The PLC scans continuously — even with the belt held, the logic is live
  // and the scan counter advances; only the mechanics wait for RUN LINE.
  useEffect(() => {
    const id = setInterval(machineTick, scanRateMs);
    return () => clearInterval(id);
  }, [scanRateMs, machineTick]);

  const codeLines = useMemo(() => generateCpp(SORTING), []);
  // Show the scan cycle itself — the rungs are the interesting part.
  const scanCode = useMemo(() => {
    const start = codeLines.findIndex((l) => l.text.startsWith("void plc_scan"));
    return codeLines.slice(Math.max(0, start));
  }, [codeLines]);
  const activeRung = machineScan?.activeRung ?? -1;

  const isEnergized = (name: string, type: string): boolean => {
    const timerDone = timers[name]?.done ?? false;
    if (type === "contactNO") return inputs[name] || outputs[name] || timerDone;
    if (type === "contactNC") return !(inputs[name] || outputs[name] || timerDone);
    if (type === "coil") return outputs[name];
    if (type === "timerTON") return timerDone;
    return false;
  };

  const pusherOut = outputs.PUSHER ?? false;
  const rejectLamp = outputs.REJECT_LAMP ?? false;
  const photoEyeLive = inputs.PHOTO_EYE ?? false;
  const defectCamLive = inputs.DEFECT_CAM ?? false;
  const rejectTimer = timers.REJECT_DELAY;
  const rejectPreset =
    SORTING.rungs
      .flatMap((r) => r.branches.flat())
      .find((e) => e.type === "timerTON" && e.name === "REJECT_DELAY")?.preset ?? 0.8;

  return (
    <div className="mx-auto max-w-4xl overflow-hidden border border-ink bg-paper">
      {/* Header strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink bg-paper2 px-4 py-1.5">
        <span className="font-mono text-[10px] tracking-widest text-wire2 uppercase">
          Live Sorting Station — PLC Closed Loop
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-faint">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              machineRunning ? "bg-live wire-live" : "bg-faint"
            }`}
          />
          {machineRunning ? "RUNNING" : "HELD"} · SCAN #
          {String(machineScanCount).padStart(4, "0")}
        </span>
      </div>

      {/* Machine animation — wide but capped so it stays proportionate */}
      <div className="border-b border-rule px-4 py-3">
        <svg viewBox="0 0 460 210" className="mx-auto w-full max-w-2xl" role="img" aria-label="Live sorting station">
            <rect x="10" y="10" width="440" height="190" rx="2" className="fill-paper2 stroke-rule" />

            {/* Defect camera */}
            <g transform={`translate(${beltX(BELT.photoEye)}, 78)`}>
              <rect x="-10" y="-14" width="20" height="16" rx="1"
                className={defectCamLive ? "fill-wire" : "fill-ink2"} />
              <text x="0" y="-20" textAnchor="middle" className="fill-current font-mono text-faint" fontSize="8">
                DEFECT CAM
              </text>
              <line x1="0" y1="2" x2="0" y2="42"
                className={defectCamLive ? "stroke-wire wire-live" : "stroke-faint"}
                strokeWidth="1" strokeDasharray="2 3" />
            </g>

            {/* Photo-eye */}
            <g transform={`translate(${beltX(BELT.photoEye) + 26}, 78)`}>
              <line x1="0" y1="2" x2="0" y2="42"
                className={photoEyeLive ? "stroke-wire wire-live" : "stroke-live"}
                strokeWidth="1" strokeDasharray="2 3" />
              <text x="0" y="-4" textAnchor="middle" className="fill-current font-mono text-faint" fontSize="8">
                PHOTO EYE
              </text>
            </g>

            {/* Boxes */}
            {boxes.map((box) => (
              <BoxSprite key={box.id} box={box} />
            ))}

            {/* Belt */}
            <rect x="30" y="146" width="400" height="14" rx="7" className="fill-rule" />
            <rect
              x="30" y="146" width="400" height="14" rx="7"
              className={`fill-none stroke-faint ${machineRunning ? "belt-running" : ""}`}
              style={{ strokeDasharray: "6 6" }}
            />
            <text x="230" y="176" textAnchor="middle" className="fill-current font-mono text-faint" fontSize="8">
              {machineRunning ? "CONVEYOR RUNNING" : "CONVEYOR HELD"}
            </text>

            {/* Pusher */}
            <g transform={`translate(${pusherOut ? beltX(BELT.pusher) - 26 : beltX(BELT.pusher) - 14}, 112)`}>
              <rect x="0" y="0" width="14" height="34" rx="1"
                className={`transition-transform duration-100 ${pusherOut ? "fill-wire" : "fill-ink2"}`} />
              <text x="7" y="-6" textAnchor="middle" className="fill-current font-mono text-faint" fontSize="8">
                PUSHER
              </text>
            </g>

            {/* Reject bin */}
            <g transform={`translate(${beltX(BELT.pusher) + 22}, 150)`}>
              <path d="M0 0 L34 0 L28 34 L6 34 Z" className="fill-paper stroke-ink" />
              <text x="17" y="48" textAnchor="middle" className="fill-current font-mono text-faint" fontSize="8">
                REJECT
              </text>
            </g>

            {/* Pass chute */}
            <g transform="translate(438, 140)">
              <rect x="-2" y="0" width="4" height="30" className="fill-rule" />
              <text x="-8" y="48" textAnchor="end" className="fill-current font-mono text-faint" fontSize="8">
                PASS
              </text>
            </g>

            {/* Reject lamp */}
            <g transform="translate(30, 30)">
              <rect x="-6" y="8" width="12" height="18" className="fill-faint" />
              <rect x="-9" y="-6" width="18" height="14" rx="1"
                className={rejectLamp ? "fill-wire lamp-flash" : "fill-rule"} />
              <text x="0" y="-12" textAnchor="middle" className="fill-current font-mono text-faint" fontSize="8">
                REJECT LAMP
              </text>
            </g>

            {/* Timer readout */}
            <g transform="translate(340, 30)">
              <rect x="0" y="0" width="100" height="30" rx="2" className="fill-paper stroke-ink" />
              <text x="8" y="13" className="fill-current font-mono text-faint" fontSize="7">
                REJECT_DELAY
              </text>
              <text x="8" y="25" className="fill-current font-mono text-ink" fontSize="9">
                {rejectTimer ? `${rejectTimer.elapsed.toFixed(2)} / ${rejectPreset.toFixed(2)}s` : `0.00 / ${rejectPreset.toFixed(2)}s`}
                {rejectTimer?.done ? " ✓" : ""}
              </text>
            </g>
          </svg>

          {/* Controls + stats */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              onClick={toggleMotor}
              className={`border px-3 py-1 font-mono text-xs ${
                machineRunning
                  ? "border-wire bg-wire/10 text-wire2"
                  : "border-live bg-live/10 text-live"
              }`}
            >
              {machineRunning ? "■ HOLD LINE" : "▶ RUN LINE"}
            </button>
            <button
              onClick={injectDefect}
              className="border border-ink bg-ink px-3 py-1 font-mono text-xs text-paper"
            >
              ⚡ INJECT DEFECT
            </button>
            <button
              onClick={resetMachine}
              className="border border-rule px-3 py-1 font-mono text-xs text-faint hover:border-faint"
            >
              RESET
            </button>
            <span className="ml-auto flex gap-4 font-mono text-xs">
              <span className="text-live">PASS {String(stats.passed).padStart(3, "0")}</span>
              <span className="text-wire2">REJECT {String(stats.rejected).padStart(3, "0")}</span>
            </span>
          </div>
      </div>

      {/* Ladder + C++ — second row; the code listing is longer, so it gets the wider column */}
      <div className="grid lg:grid-cols-[1fr_2fr]">
        <div className="border-b border-rule p-4 lg:border-b-0 lg:border-r">
            <p className="mb-2 font-mono text-[10px] tracking-widest text-faint uppercase">
              Ladder — the logic that drives the outputs, step by step
            </p>
            <svg viewBox={`0 0 ${RAIL_R + 8} 346`} className="mx-auto w-full max-w-[300px] lg:max-w-none"
              role="img" aria-label="Ladder diagram">
              {/* Power rails */}
              <line x1={RAIL_L} y1="14" x2={RAIL_L} y2="340" className="stroke-faint" strokeWidth="1.5" />
              <line x1={RAIL_R} y1="14" x2={RAIL_R} y2="340" className="stroke-faint" strokeWidth="1.5" />
              {SORTING.rungs.map((rung, i) => (
                <MiniRung
                  key={rung.id}
                  rung={rung}
                  index={i}
                  powered={machineScan?.rungPower[i] ?? false}
                  isEnergized={isEnergized}
                />
              ))}
            </svg>
          </div>

          <div className="overflow-auto p-4">
            <p className="mb-2 font-mono text-[10px] tracking-widest text-faint uppercase">
              C++ — the same logic as the ladder, but in code form
            </p>
            <pre className="font-mono text-[11px] leading-relaxed">
              {scanCode.map((line, i) => {
                const isActive = line.rungIndex !== null && line.rungIndex === activeRung;
                return (
                  <div key={i} className={`rounded-sm px-1 ${isActive ? "code-active" : "text-ink2"}`}>
                    <code className="whitespace-pre">{line.text || " "}</code>
                  </div>
                );
              })}
            </pre>
          </div>
      </div>
    </div>
  );
}
