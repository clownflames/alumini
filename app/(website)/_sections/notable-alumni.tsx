import Link from "next/link";
import { SectionHeading } from "../_components/section-heading";
import { Card, CardBody } from "../_components/card";
import { Badge } from "../_components/badge";
import { SERIF } from "../_lib/fonts";

interface Alumnus {
  name: string;
  degree: string;
  role: string;
  ctc: string;
}

const ALUMNI: Alumnus[] = [
  {
    name: "Rubal Waliya",
    degree: "B.Tech",
    role: "Software Development",
    ctc: "64.00",
  },
  {
    name: "Bhupesh Sharma",
    degree: "MBA",
    role: "Technical Lead",
    ctc: "24.00",
  },
  {
    name: "Najil Khan",
    degree: "B.Tech",
    role: "Software Developer",
    ctc: "20.59",
  },
  {
    name: "Kanak Sanpal",
    degree: "B.Tech",
    role: "Software Developer",
    ctc: "18.00",
  },
  {
    name: "Ritesh Mishra",
    degree: "M.Tech",
    role: "Software Developer",
    ctc: "17.83",
  },
  {
    name: "Priyanka Sharma",
    degree: "MCA",
    role: "DevOps Engineer",
    ctc: "17.50",
  },
];

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function NotableAlumni() {
  return (
    <section className="bg-[#faf8f3] py-20">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading
          align="center"
          eyebrow="Notable Alumni"
          title="Where Our Alumni Shine"
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ALUMNI.map((alumnus) => (
            <Card key={alumnus.name} className="text-center">
              <CardBody>
                <div className="w-16 h-16 mx-auto rounded-full bg-[#f0ece2] flex items-center justify-center">
                  <span className={`text-lg text-[#1a2b4a] ${SERIF}`}>
                    {initials(alumnus.name)}
                  </span>
                </div>

                <h3 className={`mt-4 text-lg text-[#1a2b4a] ${SERIF}`}>
                  {alumnus.name}
                </h3>

                <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#6b6b6b]">
                  {alumnus.degree}
                </p>

                <p className="mt-3 text-sm text-[#1f1f1f]">{alumnus.role}</p>

                <div className="mt-4 flex justify-center">
                  <Badge variant="gold">CTC {alumnus.ctc} LPA</Badge>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/directory"
            className="text-sm uppercase tracking-[0.15em] text-[#b8860b] hover:text-[#7a1e2e] transition-colors"
          >
            View all alumni &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}