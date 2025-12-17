"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const NAV_LINKS = [
  { label: "Mattresses", href: "/mattresses" },

  { label: "Collections", href: "/collections" },

  { label: "Accessories", href: "/accessories" },

  { label: "Sleep Guide", href: "/sleep-guide" },

  { label: "Contact", href: "/contact" },
] as const;

import { useCartStore } from "@/store/cart.store";
import { useEffect } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { items, sync } = useCartStore();

  useEffect(() => {
    sync();
  }, [sync]);

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 bg-light-100">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Primary"
      >
        <Link href="/" aria-label="Pillow Peek Home" className="flex items-center">
          <Image
            src="/logo.svg"
            alt="Pillow Peek Logo"
            width={40}
            height={40}
            priority
            className="invert"
          />
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-body text-dark-900 transition-colors hover:text-dark-700"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-6 md:flex">
          <button className="text-body text-dark-900 transition-colors hover:text-dark-700">
            Search
          </button>
          <Link href="/cart" className="text-body text-dark-900 transition-colors hover:text-dark-700 font-medium">
            My Cart ({itemCount})
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 md:hidden"
          aria-controls="mobile-menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Toggle navigation</span>
          <span className="mb-1 block h-0.5 w-6 bg-dark-900"></span>
          <span className="mb-1 block h-0.5 w-6 bg-dark-900"></span>
          <span className="block h-0.5 w-6 bg-dark-900"></span>
        </button>
      </nav>

      <div
        id="mobile-menu"
        className={`border-t border-light-300 md:hidden ${
          open ? "block" : "hidden"
        }`}
      >
        <ul className="space-y-2 px-4 py-3">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="block py-2 text-body text-dark-900 hover:text-dark-700"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li className="flex items-center justify-between pt-2">
            <button className="text-body">Search</button>
            <Link href="/cart" className="text-body font-medium" onClick={() => setOpen(false)}>
                My Cart ({itemCount})
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
