import Link from "next/link";
import { SectionHeading } from "../_components/section-heading";
import { Badge } from "../_components/badge";
import { SERIF } from "../_lib/fonts";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  jobType: string;
  salary: string;
}

const JOBS: Job[] = [
  {
    id: "senior-software-engineer-google",
    title: "Senior Software Engineer",
    company: "Google",
    location: "Bangalore",
    jobType: "Full Time",
    salary: "\u20B9 25L\u201340L",
  },
  {
    id: "product-manager-flipkart",
    title: "Product Manager",
    company: "Flipkart",
    location: "Remote",
    jobType: "Full Time",
    salary: "\u20B9 18L\u201330L",
  },
  {
    id: "devops-engineer-razorpay",
    title: "DevOps Engineer",
    company: "Razorpay",
    location: "Jaipur",
    jobType: "Full Time",
    salary: "\u20B9 12L\u201320L",
  },
];

export function RecentJobs() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-end justify-between gap-6">
          <SectionHeading eyebrow="Opportunities" title="Recent Openings" />
          <Link
            href="/jobs"
            className="hidden md:inline-block text-sm uppercase tracking-[0.15em] text-[#b8860b] hover:text-[#7a1e2e] transition-colors"
          >
            View all jobs &rarr;
          </Link>
        </div>

        <div className="mt-12 divide-y divide-[#e0dcd3] border-y border-[#e0dcd3]">
          {JOBS.map((job) => (
            <div key={job.id} className="flex items-center gap-4 py-5 group">
              <div
                className={`w-12 h-12 rounded-full bg-[#f0ece2] flex items-center justify-center text-[#1a2b4a] shrink-0 ${SERIF}`}
              >
                {job.company.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <h3
                  className={`text-base text-[#1a2b4a] group-hover:text-[#b8860b] transition-colors ${SERIF}`}
                >
                  {job.title}
                </h3>
                <p className="text-xs text-[#6b6b6b] mt-0.5">
                  {job.company} &middot; {job.location}
                </p>
              </div>

              <div className="hidden sm:flex items-center gap-2">
                <Badge variant="outline">{job.jobType}</Badge>
              </div>

              <div className="text-right">
                <p className={`text-sm text-[#b8860b] ${SERIF}`}>
                  {job.salary}
                </p>
              </div>

              <Link
                href={`/jobs/${job.id}`}
                aria-label={`View ${job.title}`}
                className="ml-2 text-[#6b6b6b] group-hover:text-[#b8860b] transition-colors"
              >
                &rarr;
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}