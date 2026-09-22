import { FaEye, FaBullseye } from "react-icons/fa";
import { SectionHeading } from "../../_components/section-heading";
import { Card, CardHeader, CardBody } from "../../_components/card";
import { SERIF } from "../../_lib/fonts";

const MISSION_POINTS: string[] = [
  "Impart high-quality professional education aligned with industry needs.",
  "Foster research, innovation, and entrepreneurial thinking.",
  "Strengthen the bond between students, faculty, and alumni.",
  "Create opportunities for mentorship, career growth, and giving back.",
];

export default function VisionMission() {
  return (
    <section className="bg-[#faf8f3] py-20">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading
          align="center"
          eyebrow="Our Purpose"
          title="Vision & Mission"
        />

        <div className="mt-12 grid md:grid-cols-2 gap-6">
          {/* Vision */}
          <Card>
            <CardHeader>
              <FaEye className="text-[#b8860b]" size={28} />
              <h3 className={`mt-4 text-xl text-[#1a2b4a] ${SERIF}`}>
                Our Vision
              </h3>
              <div className="mt-3 w-10 h-px bg-[#b8860b]" />
            </CardHeader>
            <CardBody>
              <p className="text-[#6b6b6b] leading-relaxed">
                To be a globally respected institution that empowers young
                minds with quality technical and management education, and to
                build a lifelong community of alumni who lead with integrity,
                innovation, and service.
              </p>
            </CardBody>
          </Card>

          {/* Mission */}
          <Card>
            <CardHeader>
              <FaBullseye className="text-[#b8860b]" size={28} />
              <h3 className={`mt-4 text-xl text-[#1a2b4a] ${SERIF}`}>
                Our Mission
              </h3>
              <div className="mt-3 w-10 h-px bg-[#b8860b]" />
            </CardHeader>
            <CardBody>
              <ul className="space-y-3">
                {MISSION_POINTS.map((point) => (
                  <li key={point} className="flex gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#b8860b] mt-2 shrink-0" />
                    <span className="text-[#6b6b6b] leading-relaxed">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </div>
      </div>
    </section>
  );
}