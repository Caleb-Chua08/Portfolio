"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useControlRoom } from "@/lib/simulation/store";
import { presets } from "@/lib/simulation/presets";
import LadderEditor from "./LadderEditor";
import FactoryView from "./FactoryView";
import CodeView from "./CodeView";

type Tab = "ladder" | "factory" | "code";

export default function ControlRoom() {
  const program = useControlRoom((s) => s.program);
  const running = useControlRoom((s) => s.running);
  const scanRateMs = useControlRoom((s) => s.scanRateMs);
  const scanCount = useControlRoom((s) => s.scanCount);
  const loadProgram = useControlRoom((s) => s.loadProgram);
  const toggleRun = useControlRoom((s) => s.toggleRun);
  const setScanRate = useControlRoom((s) => s.setScanRate);
  const doScan = useControlRoom((s) => s.doScan);

  const [tab, setTab] = useState<Tab>("ladder");

  useEffect(() => {
    if (!running) return;
    const id = setInterval(doScan, scanRateMs);
    return () => clearInterval(id);
  }, [running, scanRateMs, doScan]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      {/* Top bar */}
      <div className="mb-4 flex flex-wrap items-center gap-3 border border-ink bg-paper2 px-3 py-2.5">
        <select
          value={program.id}
          onChange={(e) => loadProgram(e.target.value)}
          aria-label="Select program"
          className="border border-rule bg-paper px-2 py-1.5 font-mono text-xs text-ink"
        >
          {presets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <button
          onClick={toggleRun}
          className={`border px-4 py-1.5 font-mono text-xs font-semibold ${
            running
              ? "border-wire bg-wire/10 text-wire2"
              : "border-live bg-live/10 text-live"
          }`}
        >
          {running ? "■ STOP" : "▶ RUN"}
        </button>

        <label className="flex items-center gap-2 font-mono text-xs text-ink2">
          Scan
          <input
            type="range"
            min={50}
            max={500}
            step={50}
            value={scanRateMs}
            onChange={(e) => setScanRate(Number(e.target.value))}
            className="w-24 accent-[#e8590c]"
            aria-label="Scan period"
          />
          {scanRateMs}ms
        </label>

        <span className="ml-auto font-mono text-xs text-faint">
          SCAN <span className="text-wire2">#{String(scanCount).padStart(5, "0")}</span>
        </span>
      </div>

      {/* Mobile tabs */}
      <div className="mb-3 flex gap-2 lg:hidden">
        {(
          [
            ["ladder", "Ladder"],
            ["factory", "Factory"],
            ["code", "C++"],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 border px-3 py-1.5 font-mono text-xs ${
              tab === key
                ? "border-wire bg-wire/10 text-wire2"
                : "border-rule bg-paper text-faint"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Panels */}
      <div className="grid gap-4 lg:grid-cols-3 lg:h-[calc(100vh-14rem)]">
        <div className={`h-[420px] lg:h-full ${tab === "ladder" ? "" : "hidden lg:block"}`}>
          <LadderEditor />
        </div>
        <div className={`h-[420px] lg:h-full ${tab === "factory" ? "" : "hidden lg:block"}`}>
          <FactoryView />
        </div>
        <div className={`h-[420px] lg:h-full ${tab === "code" ? "" : "hidden lg:block"}`}>
          <CodeView />
        </div>
      </div>

      <p className="mt-4 text-center font-mono text-[11px] text-faint">
        <Link href="/" className="text-wire2 hover:underline">
          ← Back to drawing sheet
        </Link>
        {" · Toggle inputs in the Ladder panel, then press RUN"}
      </p>
    </div>
  );
}
