import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { Search } from "lucide-react";
import { auth } from "@/lib/auth";
import { UserNav } from "./UserNav";
import { CartLink } from "./CartLink";
import { MobileNav } from "./MobileNav";

const NAV_LINKS = [
  { label: "Mattresses", href: "/mattresses" },
  { label: "Collections", href: "/collections" },
  { label: "Accessories", href: "/accessories" },
  { label: "Sleep Guide", href: "/sleep-guide" },
  { label: "Contact", href: "/contact" },
] as const;

export default async function Navbar() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <header className="sticky top-0 z-50 bg-light-100 border-b border-light-300">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Primary"
      >
        <Link href="/" aria-label="Pillow Peek Home" className="flex items-center transition-transform hover:scale-105">
          <Image
            src="/logo.svg"
            alt="Pillow Peek Logo"
            width={40}
            height={40}
            priority
            className="invert"
          />
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-body text-dark-900 transition-colors hover:text-dark-700 font-medium"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-6 md:flex">
          <button className="text-dark-900 transition-colors hover:text-dark-700" aria-label="Search">
            <Search size={20} />
          </button>
          <CartLink />
          <UserNav session={session} />
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-4 md:hidden">
            <CartLink />
            <MobileNav navLinks={NAV_LINKS} session={session} />
        </div>
      </nav>
    </header>
  );
}
