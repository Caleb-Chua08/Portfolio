# Spec v3 — Software-Focus + Live Sorting Station

## Content rules
- "Sensata" appears ONLY in the Experience section cards. Remove from: hero, about, metadata, footer, everywhere else.
- Hero headline: "Software & System Engineer" (no company).
- About/summary: software-engineer story only — C++/C# manufacturing applications, data-tracking clients, SQL Server, internal web systems; mechatronics as the grounding, no employer names.

## The mindblowing upgrade: closed-loop sorting station (hero centerpiece)
A live machine embedded in the hero where the PLC actually controls it:

```
sensors on machine → set PLC inputs → ladder scan → outputs → actuators act on machine
```

- Conveyor spawns boxes; they step forward once per PLC scan (discrete, like a real machine; CSS 180ms linear smooths each step)
- PHOTO_EYE beam breaks when any box passes → PART_PRESENT coil in ladder
- DEFECT_CAM flags defective (red) boxes → TON REJECT_DELAY 0.3s → PUSHER fires → box knocked into reject bin → REJECT counter++
- Good boxes ride to the end → PASS counter++
- Visitor causality: INJECT DEFECT button spawns a red box; RUN/HOLD starts/stops the belt; scan-rate slider changes how fast the whole world steps
- Ladder diagram + generated C++ sit beside the machine, active rung/line glowing in sync with the physical action
- Stats: PASSED / REJECTED / SCAN #

### New preset: "sorting-station"
- Rung 1: PHOTO_EYE → coil PART_PRESENT
- Rung 2: DEFECT_CAM → TON REJECT_DELAY 0.3s
- Rung 3: REJECT_DELAY → coil PUSHER
- Rung 4: PUSHER → coil REJECT_LAMP (stack light red flash on eject)

### Store additions (machine slice, independent from rail slice)
- `boxes: {id, x, defective, ejected}[]`, `stats {passed, rejected}`, `machineRunning`, `machineScan()`, `injectDefect()`, `toggleMotor()`
- Machine sets PHOTO_EYE/DEFECT_CAM inputs from box positions each scan, then evaluateScan, then applies PUSHER to boxes

## Layout changes
- Hero: name + software summary on top, LiveMachine full-width below (SVG line + ladder + C++ + controls)
- ScanRail moves from hero → Experience section, sticky right column on desktop, scroll-driven program switching per card (existing behavior, restyled compact)
- Experience grid: lg:grid-cols-[1fr_340px] with sticky rail

## Files
- `lib/data/content.ts` — rewrite profile/about, strip Sensata outside experience
- `app/layout.tsx` — metadata without Sensata
- `lib/simulation/presets.ts` — add sorting-station program
- `lib/simulation/store.ts` — machine slice
- `components/machine/LiveMachine.tsx` — NEW hero centerpiece
- `components/sections/Hero.tsx` — new layout with machine
- `components/sections/Experience.tsx` — two-column with sticky ScanRail
- `components/scanrail/ScanRail.tsx` — compact restyle
