import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/home/mobile-nav";

const links = [
  { href: "#services", label: "Services" },
  { href: "#how", label: "How it works" },
  { href: "#pros", label: "Technicians" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-ink text-bone">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          aria-label="FixItNow — back to home"
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-safety font-mono text-base font-bold leading-none text-ink">
            &#10003;
          </span>
          <span className="font-display text-xl font-bold tracking-tight">
            FixItNow
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-bone/80 transition-colors hover:bg-white/10 hover:text-bone"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login"
            className="rounded-md px-3 py-2 text-sm font-medium text-bone/80 transition-colors hover:text-bone"
          >
            Log in
          </Link>
          <Button
            asChild
            className="rounded-md bg-safety font-display font-bold text-ink hover:bg-safety hover:brightness-110"
          >
            <Link href="/register">Book a service</Link>
          </Button>
        </div>

        <MobileNav links={links} />
      </div>
    </header>
  );
}
