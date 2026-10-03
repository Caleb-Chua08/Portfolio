import type { Metadata } from "next";
import ControlRoom from "@/components/control-room/ControlRoom";

export const metadata: Metadata = {
  title: "PLC Control Room — Caleb Chua",
  description:
    "Interactive PLC ladder-logic simulator with a live factory line and C++ scan-cycle code view. Built by Caleb Chua, Software and System Engineer.",
};

export default function ControlRoomPage() {
  return (
    <main className="blueprint-grid min-h-[calc(100vh-3.5rem)]">
      <ControlRoom />
    </main>
  );
}
