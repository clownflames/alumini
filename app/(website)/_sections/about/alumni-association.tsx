import { FaUsers, FaCheckCircle } from "react-icons/fa";
import { SectionHeading } from "../../_components/section-heading";

const WHAT_WE_DO: string[] = [
  "Alumni meetups & reunions",
  "Mentorship for students",
  "Career & job referrals",
  "Scholarships & giving back",
];

export default function AlumniAssociation() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        {/* Left — content */}
        <div>
          <SectionHeading
            eyebrow="Our Alumni Association"
            title="A Lifelong Community"
          />

          <p className="mt-6 text-[#6b6b6b] leading-relaxed">
            The CIITM Alumni Association exists to keep the spirit of Compucom
            alive long after graduation. We connect alumni across batches,
            cities, and industries — creating a network that supports careers,
            mentorship, and meaningful friendships.
          </p>

          <p className="mt-4 text-[#6b6b6b] leading-relaxed">
            Through this portal, alumni can reconnect with classmates, discover
            opportunities, give back as mentors, and stay informed about the
            institute&rsquo;s growth.
          </p>

          <p className="mt-8 text-[10px] uppercase tracking-[0.2em] text-[#b8860b] font-medium">
            What We Do
          </p>

          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4">
            {WHAT_WE_DO.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <FaCheckCircle className="text-[#b8860b] shrink-0 mt-0.5" />
                <span className="text-sm text-[#1f1f1f]">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — image placeholder */}
        <div className="relative h-[400px] border border-[#e0dcd3] bg-[#f0ece2] flex items-center justify-center">
          <FaUsers className="text-[#1a2b4a]/25" size={120} />
        </div>
      </div>
    </section>
  );
}