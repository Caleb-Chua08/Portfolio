const navItems = [
  { href: "/#about", label: "About" },
  { href: "/#experience", label: "Experience" },
  { href: "/#education", label: "Education" },
  { href: "/#projects", label: "Projects" },
  { href: "/#certifications", label: "Certifications" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-rule bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-6">
        <a href="#hero" className="font-mono text-xs font-semibold tracking-widest text-ink uppercase">
          CHUA<span className="text-wire">/</span>ENG
        </a>
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="font-mono text-[11px] tracking-wide text-ink2 transition-colors hover:text-wire2"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <span className="font-mono text-[10px] tracking-widest text-faint uppercase">
          DWG NO. CC-2025-001
        </span>
      </div>
    </header>
  );
}
