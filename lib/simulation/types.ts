export type ElementType = "contactNO" | "contactNC" | "coil" | "timerTON";

export interface LadderElement {
  id: string;
  type: ElementType;
  /** For contacts/coils: the signal name (input or output). For timers: the timer name. */
  name: string;
  /** For timerTON: preset in seconds. */
  preset?: number;
}

export interface Rung {
  id: string;
  /** Series branches evaluated left-to-right; parallel branches are OR-ed. */
  branches: LadderElement[][];
  comment?: string;
}

export interface LadderProgram {
  id: string;
  name: string;
  description: string;
  note: string;
  inputs: string[];
  outputs: string[];
  rungs: Rung[];
}

export interface TimerState {
  elapsed: number;
  done: boolean;
}

export interface ScanResult {
  outputs: Record<string, boolean>;
  timers: Record<string, TimerState>;
  /** Rung index currently energized (for code highlighting). */
  activeRung: number;
  /** Power flow per rung (for ladder highlighting). */
  rungPower: boolean[];
}

export function evaluateScan(
  program: LadderProgram,
  inputs: Record<string, boolean>,
  outputs: Record<string, boolean>,
  timers: Record<string, TimerState>,
  scanPeriodMs: number
): ScanResult {
  const newOutputs: Record<string, boolean> = { ...outputs };
  const newTimers: Record<string, TimerState> = {};
  const rungPower: boolean[] = [];
  let activeRung = -1;

  // A contact conducts when the signal it references is on. Inputs, coils and
  // timer done-bits share one namespace — a contact named REJECT_DELAY reads
  // that TON's done bit.
  const conducts = (name: string): boolean =>
    inputs[name] === true ||
    outputs[name] === true ||
    newTimers[name]?.done === true ||
    timers[name]?.done === true;

  for (let i = 0; i < program.rungs.length; i++) {
    const rung = program.rungs[i];
    // Parallel branches OR-ed. Within a branch, contacts AND-ed left-to-right;
    // coils and timer instructions are outputs — power flows through them,
    // they never gate their own rung (a TON in series with itself could
    // otherwise never start timing).
    let anyBranchOn = false;
    const coilPower: Record<string, boolean> = {};

    for (const branch of rung.branches) {
      let power = true;
      for (const el of branch) {
        switch (el.type) {
          case "contactNO":
            power = power && conducts(el.name);
            break;
          case "contactNC":
            power = power && !conducts(el.name);
            break;
          case "coil":
            coilPower[el.name] = (coilPower[el.name] ?? false) || power;
            break;
          case "timerTON": {
            const prev = newTimers[el.name] ?? timers[el.name] ?? { elapsed: 0, done: false };
            if (power) {
              const elapsed = prev.elapsed + scanPeriodMs / 1000;
              newTimers[el.name] = {
                elapsed,
                done: elapsed >= (el.preset ?? 0),
              };
            } else {
              newTimers[el.name] = { elapsed: 0, done: false };
            }
            break;
          }
        }
      }
      if (power) anyBranchOn = true;
    }

    // Coils write after the whole rung is evaluated so a coil shared by
    // parallel branches turns on when any powering branch conducts.
    for (const [name, on] of Object.entries(coilPower)) {
      newOutputs[name] = on;
    }

    if (anyBranchOn && activeRung === -1) activeRung = i;
    rungPower.push(anyBranchOn);
  }

  return { outputs: newOutputs, timers: newTimers, activeRung, rungPower };
}
