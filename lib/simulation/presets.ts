import type { LadderProgram } from "./types";

export const presets: LadderProgram[] = [
  {
    id: "sorting-station",
    name: "Sorting Station",
    description: "A live quality gate: the photo-eye and defect camera feed the PLC, the ladder decides, the pusher ejects bad parts.",
    note: "This is a closed loop — the machine's sensors drive the PLC inputs, the ladder computes, and the outputs physically act on the machine. Inject a defect and watch the logic catch it.",
    inputs: ["PHOTO_EYE", "DEFECT_CAM"],
    outputs: ["PART_PRESENT", "DEFECT_FLAG", "PUSHER", "REJECT_LAMP"],
    rungs: [
      {
        id: "r1",
        comment: "Part detected at gate",
        branches: [
          [
            { id: "e1", type: "contactNO", name: "PHOTO_EYE" },
            { id: "e2", type: "coil", name: "PART_PRESENT" },
          ],
        ],
      },
      {
        // The camera pulse can be shorter than any timer, so the verdict is
        // latched and only dropped when the eject STROKE completes — a reject
        // is never lost because the part left the camera too soon, and the
        // next flagged part always gets a freshly re-armed delay.
        id: "r2",
        comment: "Latch defect verdict — drop when the stroke completes",
        branches: [
          [
            { id: "e3", type: "contactNO", name: "DEFECT_CAM" },
            { id: "e4", type: "coil", name: "DEFECT_FLAG" },
          ],
          [
            { id: "e5", type: "contactNO", name: "DEFECT_FLAG" },
            { id: "e6", type: "contactNC", name: "PUSHER_TIMER" },
            { id: "e7", type: "coil", name: "DEFECT_FLAG" },
          ],
        ],
      },
      {
        // 0.8 s = camera-to-pusher travel at line speed, tuned to the centre
        // of the camera window so the pusher fires as the part arrives.
        id: "r3",
        comment: "Travel delay: camera to pusher",
        branches: [
          [
            { id: "e8", type: "contactNO", name: "DEFECT_FLAG" },
            { id: "t1", type: "timerTON", name: "REJECT_DELAY", preset: 0.8 },
          ],
        ],
      },
      {
        // Seal-in keeps the solenoid energised for the whole stroke; the
        // stroke timer (rung 5) breaks the seal at the end of the extend.
        id: "r4",
        comment: "Eject — sealed for the full stroke",
        branches: [
          [
            { id: "e10", type: "contactNO", name: "REJECT_DELAY" },
            { id: "e11", type: "coil", name: "PUSHER" },
          ],
          [
            { id: "e12", type: "contactNO", name: "PUSHER" },
            { id: "e13", type: "contactNC", name: "PUSHER_TIMER" },
            { id: "e14", type: "coil", name: "PUSHER" },
          ],
        ],
      },
      {
        id: "r5",
        comment: "Pusher stroke (solenoid extend time)",
        branches: [
          [
            { id: "e17", type: "contactNO", name: "PUSHER" },
            { id: "t2", type: "timerTON", name: "PUSHER_TIMER", preset: 0.25 },
          ],
        ],
      },
      {
        id: "r6",
        comment: "Reject indication while ejecting",
        branches: [
          [
            { id: "e15", type: "contactNO", name: "PUSHER" },
            { id: "e16", type: "coil", name: "REJECT_LAMP" },
          ],
        ],
      },
    ],
  },
  {
    id: "start-stop",
    name: "Start-Stop Latch",
    description: "The classic motor starter: seal-in contact keeps the belt running after Start is released.",
    note: "This is the first ladder pattern every controls engineer learns — I wired dozens of these during FAT at Precision Control.",
    inputs: ["START", "STOP"],
    outputs: ["MOTOR"],
    rungs: [
      {
        id: "r1",
        comment: "Seal-in starter — Start fires the coil, the Motor contact holds it in, Stop breaks the path",
        branches: [
          [
            { id: "e1", type: "contactNO", name: "START" },
            { id: "e2", type: "contactNC", name: "STOP" },
            { id: "e3", type: "coil", name: "MOTOR" },
          ],
          [
            { id: "e4", type: "contactNO", name: "MOTOR" },
            { id: "e5", type: "contactNC", name: "STOP" },
            { id: "e6", type: "coil", name: "MOTOR" },
          ],
        ],
      },
    ],
  },
  {
    id: "photo-eye",
    name: "Photo-Eye Ejector",
    description: "A box blocks the photo-eye; after a 1.5 s TON delay, the pusher kicks it off the belt and the counter ticks.",
    note: "TON timers + sensors driving actuators — the bread and butter of the ejector stations I commissioned on site.",
    inputs: ["PHOTO_EYE"],
    outputs: ["PUSHER", "COUNTER"],
    rungs: [
      {
        id: "r1",
        comment: "Delay before eject",
        branches: [[{ id: "e1", type: "contactNO", name: "PHOTO_EYE" }, { id: "t1", type: "timerTON", name: "EJECT_DELAY", preset: 1.5 }]],
      },
      {
        id: "r2",
        comment: "Pusher fires when timer done",
        branches: [[{ id: "e2", type: "contactNO", name: "EJECT_DELAY" }, { id: "e3", type: "coil", name: "PUSHER" }]],
      },
      {
        id: "r3",
        comment: "Count each eject",
        branches: [[{ id: "e4", type: "contactNO", name: "PUSHER" }, { id: "e5", type: "coil", name: "COUNTER" }]],
      },
    ],
  },
  {
    id: "beacon",
    name: "Flashing Beacon",
    description: "Two TON timers form an oscillator that flashes the amber beacon at 1 Hz — the idle-state stack light.",
    note: "Timer oscillators like this drove the stack lights and alarms on every SCADA screen I built.",
    inputs: [],
    outputs: ["BEACON"],
    rungs: [
      {
        id: "r1",
        comment: "Oscillator: on-phase 0.5 s",
        branches: [[{ id: "e1", type: "contactNC", name: "BEACON" }, { id: "t1", type: "timerTON", name: "TON_A", preset: 0.5 }]],
      },
      {
        id: "r2",
        comment: "Off-phase 0.5 s",
        branches: [[{ id: "e2", type: "contactNO", name: "TON_A" }, { id: "t2", type: "timerTON", name: "TON_B", preset: 0.5 }]],
      },
      {
        id: "r3",
        comment: "Beacon flashes while TON_B runs",
        branches: [[{ id: "e3", type: "contactNO", name: "TON_B" }, { id: "e4", type: "coil", name: "BEACON" }]],
      },
    ],
  },
];
