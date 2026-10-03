import type { LadderProgram } from "./types";

/**
 * Compiles a ladder program into readable, self-contained C++ mirroring the
 * scan cycle: read inputs once, evaluate rungs top-to-bottom, write outputs.
 * Returns lines with metadata so the UI can highlight the line matching
 * the rung currently being evaluated.
 */
export interface CodeLine {
  text: string;
  rungIndex: number | null;
}

export function generateCpp(program: LadderProgram): CodeLine[] {
  const lines: CodeLine[] = [];
  const push = (text: string, rungIndex: number | null = null) =>
    lines.push({ text, rungIndex });

  push(`// ${program.name} — ladder program compiled to a C++ scan cycle.`);

  const lower = (name: string) => name.toLowerCase();
  const allElements = program.rungs.flatMap((r) => r.branches.flat());

  // Unique TONs in program order, with their presets.
  const timerPresets = new Map<string, number>();
  for (const el of allElements) {
    if (el.type === "timerTON" && !timerPresets.has(el.name)) {
      timerPresets.set(el.name, el.preset ?? 0);
    }
  }
  const hasTimers = timerPresets.size > 0;

  // C++ reference for a contact: timer done-bit, coil output, or input tag.
  const contactRef = (name: string) => {
    if (timerPresets.has(name)) return `${lower(name)}.done`;
    if (program.outputs.includes(name)) return `outputs.${lower(name)}`;
    return lower(name);
  };

  push("#include <cstdint>");
  push("");
  if (hasTimers) {
    push("// On-delay timer (IEC 61131-3 TON): accumulates while its rung has");
    push("// power flow and resets the moment power drops. One evaluation per scan.");
    push("struct Ton {");
    push("    float preset_s  = 0.0f;");
    push("    float elapsed_s = 0.0f;");
    push("    bool  done      = false;");
    push("");
    push("    void tick(float dt_s) {");
    push("        elapsed_s += dt_s;");
    push("        done = elapsed_s >= preset_s;");
    push("    }");
    push("    void reset() {");
    push("        elapsed_s = 0.0f;");
    push("        done      = false;");
    push("    }");
    push("};");
    push("");
  }
  push("struct PlcOutputs {");
  program.outputs.forEach((o) => push(`    bool ${lower(o)} = false;`));
  push("};");
  push("");
  push("// ---- Field I/O plumbing — bind these to the platform's I/O driver ----");
  push("bool read_input(const char* tag);");
  push("void write_output(const char* tag, bool value);");
  push("");
  push("// Scan period the ladder timing is based on — keep in sync with the task.");
  push("constexpr float SCAN_PERIOD_S = 0.200f;");
  if (hasTimers) {
    push("");
    push("// One timer instance per ladder TON, configured with its preset.");
    for (const [name, preset] of timerPresets) {
      const literal = Number.isInteger(preset) ? `${preset}.0f` : `${preset}f`;
      push(`Ton ${lower(name)}{ .preset_s = ${literal} };`);
    }
  }
  push("");
  push("PlcOutputs outputs;");
  push("");
  push("// Runs once per scan period (default 200 ms)");
  push("void plc_scan() {");
  push("    // ---- Read inputs once so every rung sees the same snapshot ----");
  program.inputs.forEach((inp) =>
    push(`    bool ${lower(inp)} = read_input("${inp}");`)
  );
  if (program.inputs.length === 0) {
    push("    // No physical inputs — free-running logic");
  }
  push("");

  program.rungs.forEach((rung, i) => {
    if (rung.comment) push(`    // Rung ${i + 1}: ${rung.comment}`, i);

    // Branches OR-ed; within a branch, contacts AND-ed. Coils and timer
    // instructions are the writes below — never part of the condition.
    const branchConds = rung.branches.map((branch) =>
      branch
        .filter((el) => el.type === "contactNO" || el.type === "contactNC")
        .map((el) => {
          const ref = contactRef(el.name);
          return el.type === "contactNC" ? `!${ref}` : ref;
        })
        .join(" && ")
    );
    // Parenthesise each AND group so mixed &&/|| reads unambiguously in C++.
    const joined = branchConds
      .map((c) => (c.includes("&&") ? `(${c})` : c || "true"))
      .join(" || ");
    const condition = branchConds.length > 1 ? `(${joined})` : joined || "true";

    const coils = rung.branches.flat().filter((e) => e.type === "coil");
    const timers = rung.branches.flat().filter((e) => e.type === "timerTON");

    // Non-retentive coils: de-energized when the rung loses power flow.
    coils.forEach((c) =>
      push(`    outputs.${lower(c.name)} = ${condition};`, i)
    );
    timers.forEach((t) => {
      push(`    if (${condition}) {`, i);
      push(`        ${lower(t.name)}.tick(SCAN_PERIOD_S);`, i);
      push("    } else {", i);
      push(`        ${lower(t.name)}.reset();`, i);
      push("    }", i);
    });
    push("", i);
  });

  push("    // ---- Write outputs to the field ----");
  program.outputs.forEach((o) =>
    push(`    write_output("${o}", outputs.${lower(o)});`)
  );
  push("}");

  return lines;
}
