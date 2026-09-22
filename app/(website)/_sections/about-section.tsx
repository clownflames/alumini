import Link from "next/link";
import { FaUniversity } from "react-icons/fa";
import { SectionHeading } from "../_components/section-heading";

export function AboutSection() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        {/* Left placeholder */}
        <div className="h-96 border border-[#e0dcd3] bg-[#f0ece2] flex items-center justify-center">
          <FaUniversity size={80} className="text-[#1a2b4a]/30" />
        </div>

        {/* Right content */}
        <div>
          <SectionHeading
            eyebrow="About CIITM"
            title="A Legacy of Excellence"
          />

          <p className="mt-6 text-[#6b6b6b] leading-relaxed">
            Compucom Institute of Technology &amp; Management, Jaipur, is a
            well-reputed institution for professional studies, approved by
            AICTE and affiliated to Rajasthan Technical University, Kota, and
            the University of Rajasthan.
          </p>

          <p className="mt-4 text-[#6b6b6b] leading-relaxed">
            Promoted by Compucom Software Ltd., the institute has built a
            strong alumni family across the world. This portal exists to keep
            that family connected — for mentorship, opportunity, and lifelong
            bonds.
          </p>

          <Link
            href="/about"
            className="inline-block mt-8 text-sm uppercase tracking-[0.15em] text-[#b8860b] hover:text-[#7a1e2e] transition-colors"
          >
            Learn more &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}