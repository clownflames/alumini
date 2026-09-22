import Link from "next/link";
import Image from "next/image";
import { FaBars } from "react-icons/fa";
import { Button } from "./button";
import { SERIF } from "../_lib/fonts";

const NAV_LINKS: { label: string; href: string }[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Directory", href: "/directory" },
  { label: "Events", href: "/events" },
  { label: "News", href: "/news" },
  { label: "Mentorship", href: "/mentorship" },
  { label: "Jobs", href: "/jobs" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white">
      {/* Top strip */}
      <div className="bg-[#1a2b4a] text-white text-[11px]">
        <div className="max-w-7xl mx-auto px-6 h-9 flex items-center justify-between">
          <p>Toll Free: 1800-8900-750</p>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hover:text-[#b8860b] transition-colors"
            >
              Login
            </Link>
            <span className="text-white/30">|</span>
            <Link
              href="/register"
              className="hover:text-[#b8860b] transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="bg-white border-b border-[#e0dcd3]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo/logo.png"
              alt="CIITM"
              width={52}
              height={52}
            />
            <div className="flex flex-col">
              <span
                className={`text-lg text-[#1a2b4a] leading-tight ${SERIF}`}
              >
                CIITM
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#6b6b6b]">
                Alumni Association
              </span>
            </div>
          </Link>

          {/* Center nav */}
          <nav className="hidden md:flex items-center gap-x-7">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs uppercase tracking-[0.15em] text-[#1f1f1f] hover:text-[#b8860b] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <Button variant="primary" size="sm" href="/register">
                Join the Network
              </Button>
            </div>
            <button
              type="button"
              aria-label="Open menu"
              className="md:hidden text-[#1a2b4a]"
            >
              <FaBars size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}