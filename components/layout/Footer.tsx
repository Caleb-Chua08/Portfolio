import { profile } from "@/lib/data/content";

/** Drawing title block — the signature element of an engineering sheet. */
export default function Footer() {
  const cells = [
    { label: "Drawn by", value: profile.name },
    { label: "Checked by", value: "—" },
    { label: "Discipline", value: "Software / Systems / Control" },
    { label: "Location", value: "Subang Jaya, MY" },
    { label: "Scale", value: "1:1" },
    { label: "Sheet", value: "1 of 1" },
    { label: "Rev", value: "A" },
  ];

  return (
    <footer className="border-t-2 border-ink bg-paper">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid grid-cols-2 border border-ink sm:grid-cols-4 lg:grid-cols-7">
          {cells.map((cell) => (
            <div
              key={cell.label}
              className="border-rule p-3 odd:border-r sm:border-r sm:last:border-r-0"
            >
              <p className="font-mono text-[9px] tracking-widest text-faint uppercase">
                {cell.label}
              </p>
              <p className="mt-1 font-mono text-xs text-ink">{cell.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-wire2 hover:underline"
          >
            linkedin.com/in/caleb-c-a9a678202 ↗
          </a>
          <p className="font-mono text-[10px] text-faint">
            © {new Date().getFullYear()} · Ladder logic simulated in the browser
          </p>
        </div>
      </div>
    </footer>
  );
}
