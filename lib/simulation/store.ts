"use client";

import { create } from "zustand";
import { evaluateScan } from "./types";
import type { LadderProgram, ScanResult, TimerState } from "./types";
import { presets } from "./presets";

/** Scroll-driven focus: which part of the career the rail is visualizing. */
export type RailFocus = "hero" | "sensata" | "precision";

/* ---------------- Machine slice: closed-loop sorting station ---------------- */

export interface Box {
  id: number;
  /** Position along the belt, 0..100. */
  x: number;
  defective: boolean;
  /** Being knocked off by the pusher. */
  ejecting: boolean;
}

/** Belt geometry shared with the view. */
export const BELT = { photoEye: 62, pusher: 70, end: 96, spawn: -6 };

interface MachineState {
  boxes: Box[];
  machineRunning: boolean;
  machineScanCount: number;
  stats: { passed: number; rejected: number };
  /** Snapshot of the last machine scan (for ladder/code highlighting). */
  machineScan: ScanResult | null;
  toggleMotor: () => void;
  injectDefect: () => void;
  machineTick: () => void;
  resetMachine: () => void;
}

let boxId = 0;

function createInitialMachine() {
  return {
    boxes: [] as Box[],
    // The line starts held — the visitor starts it with RUN LINE.
    machineRunning: false,
    machineScanCount: 0,
    stats: { passed: 0, rejected: 0 },
    machineScan: null as ScanResult | null,
  };
}

/* ---------------- Store ---------------- */

interface ControlRoomState extends MachineState {
  program: LadderProgram;
  running: boolean;
  /** Manual override: when true, the user picked a program and scroll won't switch it. */
  manualProgram: boolean;
  railFocus: RailFocus;
  setRailFocus: (focus: RailFocus) => void;
  scanRateMs: number;
  scanCount: number;
  inputs: Record<string, boolean>;
  outputs: Record<string, boolean>;
  timers: Record<string, TimerState>;
  lastScan: ScanResult | null;
  scanTick: number;
  loadProgram: (id: string) => void;
  toggleRun: () => void;
  setScanRate: (ms: number) => void;
  toggleInput: (name: string) => void;
  doScan: () => void;
}

function initProgram(program: LadderProgram) {
  const inputs: Record<string, boolean> = {};
  program.inputs.forEach((i) => (inputs[i] = false));
  const outputs: Record<string, boolean> = {};
  program.outputs.forEach((o) => (outputs[o] = false));
  return { inputs, outputs, timers: {} as Record<string, TimerState> };
}

/** Maps scroll position to the program the rail should visualize. */
const focusProgram: Record<RailFocus, string> = {
  hero: "sorting-station",
  sensata: "photo-eye",
  precision: "beacon",
};

export const useControlRoom = create<ControlRoomState>((set, get) => ({
  ...createInitialMachine(),

  toggleMotor: () => set((s) => ({ machineRunning: !s.machineRunning })),

  injectDefect: () =>
    set((s) => {
      // Spawn behind the leftmost box so boxes never overlap.
      const leftmost = s.boxes.length
        ? Math.min(...s.boxes.map((b) => b.x))
        : BELT.spawn;
      // Part pitch: 16 units of belt (~1.6 s) keeps consecutive eject
      // cycles from overlapping, the way a real gate would be pitched.
      const x = Math.max(-30, leftmost - 16);
      return {
        boxes: [...s.boxes, { id: ++boxId, x, defective: true, ejecting: false }],
      };
    }),

  resetMachine: () => {
    // A line reset powers the PLC down too: output image and timers clear.
    const fresh = initProgram(presets.find((p) => p.id === "sorting-station")!);
    set({
      ...createInitialMachine(),
      inputs: fresh.inputs,
      outputs: fresh.outputs,
      timers: fresh.timers,
    });
  },

  /**
   * One full closed-loop step:
   * 1. sensors read the machine -> PLC inputs
   * 2. ladder scan computes outputs
   * 3. outputs act on the machine (pusher ejects, belt advances)
   */
  machineTick: () => {
    const state = get();
    // The PLC scans even when the belt is held — that's how a real line
    // behaves: logic live, mechanics stopped.
    const sorting = presets.find((p) => p.id === "sorting-station")!;
    const inputs: Record<string, boolean> = {
      PHOTO_EYE: state.boxes.some(
        (b) => !b.ejecting && Math.abs(b.x - BELT.photoEye) < 4
      ),
      DEFECT_CAM: state.boxes.some(
        (b) => !b.ejecting && b.defective && Math.abs(b.x - BELT.photoEye) < 4
      ),
    };
    // The scan starts from the output image of the previous scan — coil
    // state persists between scans, which is what makes seal-in and latch
    // rungs work (a real PLC's output image behaves the same way).
    const result = evaluateScan(sorting, inputs, { ...state.outputs }, state.timers, state.scanRateMs);

    // Outputs act on the machine — driven only by the PLC's own output image.
    const pusherOut = result.outputs.PUSHER ?? false;
    let rejected = state.stats.rejected;
    let passed = state.stats.passed;

    // Belt speed is constant in real units regardless of scan rate — a
    // faster scan gives finer motion, not a faster belt (like a real VFD).
    const speedScale = state.scanRateMs / 200;
    const step = state.machineRunning ? 2 * speedScale : 0; // belt stopped when held
    const boxes = state.boxes
      .map((b) => {
        if (
          pusherOut &&
          !b.ejecting &&
          b.defective &&
          Math.abs(b.x - BELT.pusher) < 6
        ) {
          rejected++;
          return { ...b, ejecting: true };
        }
        return b;
      })
      .map((b) => ({ ...b, x: b.x + (b.ejecting ? 3 * speedScale : step) }))
      .filter((b) => {
        // Fell into the reject bin — dwell one extra eject-step past the
        // hidden pose so the sprite always renders a fully concealed frame
        // before unmounting, at every scan rate.
        if (b.ejecting && b.x > BELT.pusher + 14 + 3 * speedScale) return false;
        if (!b.ejecting && b.x >= BELT.end) {
          passed++;
          return false;
        }
        return true;
      });

    // Spawn a new good box every ~1.2 s of machine time. Defects enter the
    // line only when the visitor clicks INJECT DEFECT.
    const spawnEvery = Math.max(1, Math.round(6 * speedScale));
    const shouldSpawn =
      state.machineScanCount % spawnEvery === spawnEvery - 1 &&
      !state.boxes.some((b) => b.x < BELT.spawn + 8);
    const newBoxes = shouldSpawn
      ? [
          ...boxes,
          { id: ++boxId, x: BELT.spawn, defective: false, ejecting: false },
        ]
      : boxes;

    set({
      boxes: newBoxes,
      stats: { passed, rejected },
      machineScanCount: state.machineScanCount + 1,
      machineScan: result,
      // Expose machine sensors/outputs to the shared rail view. The stored
      // output image is exactly what the PLC produced — no machine-side
      // overrides, the ladder owns the actuator sequence end to end.
      inputs: { ...state.inputs, ...inputs },
      outputs: { ...state.outputs, ...result.outputs },
      timers: result.timers,
    });
  },

  program: presets[0],
  running: true,
  manualProgram: false,
  railFocus: "hero",
  setRailFocus: (focus) => {
    const { manualProgram, railFocus } = get();
    if (manualProgram || railFocus === focus) return;
    const program = presets.find((p) => p.id === focusProgram[focus]) ?? presets[0];
    const fresh = initProgram(program);
    set({
      railFocus: focus,
      program,
      inputs: fresh.inputs,
      outputs: fresh.outputs,
      timers: fresh.timers,
      lastScan: null,
      scanCount: 0,
    });
  },
  scanRateMs: 200,
  scanCount: 0,
  inputs: initProgram(presets[0]).inputs,
  outputs: initProgram(presets[0]).outputs,
  timers: {},
  lastScan: null,
  scanTick: 0,

  loadProgram: (id) => {
    const program = presets.find((p) => p.id === id) ?? presets[0];
    const fresh = initProgram(program);
    set({
      program,
      running: true,
      manualProgram: true,
      inputs: fresh.inputs,
      outputs: fresh.outputs,
      timers: fresh.timers,
      lastScan: null,
      scanCount: 0,
    });
  },

  toggleRun: () => set((s) => ({ running: !s.running })),

  setScanRate: (ms) => set({ scanRateMs: ms }),

  toggleInput: (name) =>
    set((s) => ({
      inputs: { ...s.inputs, [name]: !s.inputs[name] },
    })),

  doScan: () => {
    const { program, inputs, outputs, timers, scanRateMs, scanCount } = get();
    const result = evaluateScan(program, inputs, outputs, timers, scanRateMs);
    set({
      outputs: result.outputs,
      timers: result.timers,
      lastScan: result,
      scanCount: scanCount + 1,
      scanTick: scanCount + 1,
    });
  },
}));
