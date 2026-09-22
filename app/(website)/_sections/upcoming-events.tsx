import Link from "next/link";
import { FaMapLocationDot } from "react-icons/fa6";
import { SectionHeading } from "../_components/section-heading";
import { Card, CardBody } from "../_components/card";
import { SERIF } from "../_lib/fonts";

interface AlumniEvent {
  id: string;
  day: string;
  month: string;
  title: string;
  location: string;
}

const EVENTS: AlumniEvent[] = [
  {
    id: "annual-alumni-meet-2026",
    day: "15",
    month: "Mar",
    title: "Annual Alumni Meet 2026",
    location: "CIITM Campus, Jaipur",
  },
  {
    id: "industry-connect-tech-careers",
    day: "02",
    month: "Apr",
    title: "Industry Connect: Tech Careers",
    location: "Online (Hybrid)",
  },
  {
    id: "alumni-mentorship-kickoff",
    day: "20",
    month: "Apr",
    title: "Alumni Mentorship Kickoff",
    location: "Seminar Hall, CIITM",
  },
];

export function UpcomingEvents() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Upcoming Events"
            title="Gather & Reconnect"
          />
          <Link
            href="/events"
            className="hidden md:inline-block text-sm uppercase tracking-[0.15em] text-[#b8860b] hover:text-[#7a1e2e] transition-colors"
          >
            View all events &rarr;
          </Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {EVENTS.map((event) => (
            <Card key={event.id}>
              <div className="bg-[#1a2b4a] text-white p-6 relative min-h-32">
                <div className="absolute top-4 left-4 bg-[#b8860b] text-white px-3 py-2 text-center">
                  <p className={`text-2xl leading-none ${SERIF}`}>
                    {event.day}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.2em]">
                    {event.month}
                  </p>
                </div>
              </div>

              <CardBody>
                <h3 className={`text-lg text-[#1a2b4a] ${SERIF}`}>
                  {event.title}
                </h3>

                <p className="mt-2 flex items-center gap-2 text-sm text-[#6b6b6b]">
                  <FaMapLocationDot className="shrink-0" />
                  <span>{event.location}</span>
                </p>

                <Link
                  href={`/events/${event.id}`}
                  className="mt-4 inline-block text-xs uppercase tracking-[0.15em] text-[#b8860b] hover:text-[#7a1e2e] transition-colors"
                >
                  Register &rarr;
                </Link>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}