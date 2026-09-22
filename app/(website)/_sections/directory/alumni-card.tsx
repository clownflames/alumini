import Link from "next/link";
import {
  FaCheckCircle,
  FaBriefcase,
} from "react-icons/fa";
import { FaMapLocation as FaMapLocationDot } from "react-icons/fa6";
import { Card, CardBody } from "../../_components/card";
import { Badge } from "../../_components/badge";
import { SERIF } from "../../_lib/fonts";
import type { DirectoryAlumni } from "../../_data/alumni";

interface AlumniCardProps {
  alumni: DirectoryAlumni;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}

export default function AlumniCard({ alumni }: AlumniCardProps) {
  return (
    <Card className="group hover:border-[#b8860b] transition-colors">
      <CardBody className="p-6">
        {/* Top row */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-[#f0ece2] border border-[#e0dcd3] flex items-center justify-center shrink-0">
            <span className={`text-base text-[#1a2b4a] ${SERIF}`}>
              {initials(alumni.name)}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3
                className={`text-lg text-[#1a2b4a] ${SERIF} truncate`}
                title={alumni.name}
              >
                {alumni.name}
              </h3>
              {alumni.isVerified && (
                <FaCheckCircle
                  className="text-[#b8860b] shrink-0"
                  size={14}
                  title="Verified"
                />
              )}
            </div>

            <p className="mt-1 text-xs uppercase tracking-[0.15em] text-[#6b6b6b] truncate">
              {alumni.degree} &middot; {alumni.department} &middot;{" "}
              {alumni.batch}
            </p>
          </div>
        </div>

        {/* Headline */}
        <p className="mt-4 text-sm text-[#1f1f1f] leading-relaxed line-clamp-2">
          {alumni.headline}
        </p>

        {/* Meta rows */}
        <div className="mt-4 space-y-2 text-xs text-[#6b6b6b]">
          <p className="flex items-center gap-2">
            <FaBriefcase className="shrink-0" />
            <span className="truncate">
              {alumni.role} at {alumni.company}
            </span>
          </p>
          <p className="flex items-center gap-2">
            <FaMapLocationDot className="shrink-0" />
            <span className="truncate">
              {alumni.city}, {alumni.country}
            </span>
          </p>
        </div>

        {/* Badges */}
        {(alumni.ctc || alumni.isMentor || alumni.isOpenToWork) && (
          <div className="mt-5 flex flex-wrap gap-2">
            {alumni.ctc && (
              <Badge variant="gold">CTC {alumni.ctc}</Badge>
            )}
            {alumni.isMentor && <Badge variant="navy">Mentor</Badge>}
            {alumni.isOpenToWork && (
              <Badge variant="outline">Open to work</Badge>
            )}
          </div>
        )}

        <div className="mt-5 h-px bg-[#e0dcd3]" />

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between">
          <Link
            href={`/directory/${alumni.id}`}
            className="text-xs uppercase tracking-[0.15em] text-[#b8860b] hover:text-[#7a1e2e] transition-colors"
          >
            View Profile &rarr;
          </Link>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#6b6b6b]">
            Connect
          </span>
        </div>
      </CardBody>
    </Card>
  );
}