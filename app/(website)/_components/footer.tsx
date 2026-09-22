import Link from "next/link";
import Image from "next/image";
import { SERIF } from "../_lib/fonts";

const QUICK_LINKS: { label: string; href: string }[] = [
  { label: "About", href: "/" },
  { label: "Directory", href: "/directory" },
  { label: "Events", href: "/events" },
  { label: "Jobs", href: "/jobs" },
];

const FOR_ALUMNI: { label: string; href: string }[] = [
  { label: "Register", href: "/register" },
  { label: "Login", href: "/login" },
  { label: "Mentorship", href: "/mentorship" },
  { label: "Notifications", href: "/dashboard/notifications" },
];

export function Footer() {
  return (
    <footer className="bg-[#1a2b4a] text-white border-t-4 border-[#b8860b]">
      <div className="max-w-7xl mx-auto px-6 py-16 grid gap-10 md:grid-cols-4">
        {/* Col 1 */}
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/logo/logo.png"
              alt="CIITM"
              width={48}
              height={48}
            />
            <span className={`text-lg ${SERIF}`}>
              CIITM Alumni Association
            </span>
          </div>
          <p className="mt-4 text-white/70 text-sm leading-relaxed">
            Connecting graduates of Compucom Institute of Technology &
            Management, Jaipur.
          </p>
          <p className="mt-2 text-white/70 text-sm leading-relaxed">
            A lifelong network for mentorship, opportunity, and shared
            legacy.
          </p>
        </div>

        {/* Col 2 */}
        <div>
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#b8860b] font-medium">
            Quick Links
          </h3>
          <ul className="mt-5 space-y-3">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-white/80 hover:text-[#b8860b] text-sm transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3 */}
        <div>
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#b8860b] font-medium">
            For Alumni
          </h3>
          <ul className="mt-5 space-y-3">
            {FOR_ALUMNI.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-white/80 hover:text-[#b8860b] text-sm transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 4 */}
        <div>
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#b8860b] font-medium">
            Contact
          </h3>
          <ul className="mt-5 space-y-3 text-white/80 text-sm">
            <li>
              Compucom Institute of Technology &amp; Management, Jaipur
            </li>
            <li>Toll Free: 1800-8900-750</li>
            <li>
              <a
                href="mailto:alumni@ciitm.org"
                className="hover:text-[#b8860b] transition-colors"
              >
                alumni@ciitm.org
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row justify-between gap-3 text-xs text-white/60">
          <p>&copy; 2026 CIITM Alumni Association. All rights reserved.</p>
          <p>Privacy Policy &nbsp;&middot;&nbsp; Terms of Use</p>
        </div>
      </div>
      <div className="h-10" />
    </footer>
  );
}