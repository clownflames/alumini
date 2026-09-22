import { FaUniversity } from "react-icons/fa";
import { SectionHeading } from "../../_components/section-heading";

export default function WhoWeAre() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div className="relative h-[420px] border border-[#e0dcd3] bg-[#f0ece2] flex items-center justify-center">
          <FaUniversity className="text-[#1a2b4a]/25" size={120} />
        </div>

        <div>
          <SectionHeading
            eyebrow="Who We Are"
            title="Compucom Institute of Technology & Management"
          />

          <p className="mt-6 text-[#6b6b6b] leading-relaxed">
            Compucom Institute of Technology &amp; Management, Jaipur, is a
            well-reputed institution for professional studies (B.Tech, M.Tech,
            MBA, MCA, BCA) in Rajasthan. It is approved by the All India
            Council for Technical Education (AICTE), Ministry of HRD,
            Government of India, and affiliated to Rajasthan Technical
            University, Kota, and the University of Rajasthan.
          </p>

          <p className="mt-4 text-[#6b6b6b] leading-relaxed">
            The institute is promoted by Compucom Software Ltd., a company
            listed on NSE and BSE — the only recipient in the entire State of
            Rajasthan of the &ldquo;Best Performance Award&rdquo; from the
            Government of India &amp; Government of Rajasthan for exporting
            IT/Software to the USA and other countries.
          </p>
        </div>
      </div>
    </section>
  );
}