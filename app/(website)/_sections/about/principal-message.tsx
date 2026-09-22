import { FaUserTie, FaQuoteLeft } from "react-icons/fa";
import { SectionHeading } from "../../_components/section-heading";
import { Card, CardBody } from "../../_components/card";
import { SERIF } from "../../_lib/fonts";

export default function PrincipalMessage() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-5xl mx-auto px-6">
        <SectionHeading
          align="center"
          eyebrow="From the Principal"
          title="A Word from Our Principal"
        />

        <div className="mt-12">
          <Card>
            <CardBody className="md:p-10">
              <div className="grid md:grid-cols-[160px_1fr] gap-8 items-start">
                {/* Left — avatar + name */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-32 h-32 rounded-full bg-[#f0ece2] border border-[#e0dcd3] flex items-center justify-center">
                    <FaUserTie className="text-[#1a2b4a]/40" size={44} />
                  </div>

                  <p className={`mt-5 text-lg text-[#1a2b4a] ${SERIF}`}>
                    Dr. Akash Saxena
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#6b6b6b]">
                    Principal
                  </p>
                </div>

                {/* Right — quote */}
                <div>
                  <FaQuoteLeft className="text-[#b8860b]/60" size={28} />

                  <p
                    className={`mt-4 text-[#1f1f1f] leading-loose italic text-lg ${SERIF}`}
                  >
                    &ldquo;It is with great pleasure that I welcome you to
                    Compucom Institute of Technology &amp; Management — an
                    institution that shares the same vision and aspirations as
                    the leading educational groups of our country. Our motto is
                    to provide high-quality professional education to
                    youngsters and to guide them to find the path to success,
                    thereby fulfilling the needs of our nation in the fields of
                    Engineering and Management.&rdquo;
                  </p>

                  <div className="mt-6 w-12 h-px bg-[#b8860b]" />

                  <p className="mt-4 text-sm text-[#6b6b6b]">
                    — Dr. Akash Saxena, Principal
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </section>
  );
}