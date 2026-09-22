import Link from "next/link";
import { SectionHeading } from "../_components/section-heading";
import { Card, CardBody } from "../_components/card";
import { SERIF } from "../_lib/fonts";

interface NewsItem {
  id: string;
  date: string;
  title: string;
  snippet: string;
}

const NEWS: NewsItem[] = [
  {
    id: "ciitm-ranks-top-institutes-rajasthan",
    date: "12 Feb 2026",
    title: "CIITM Ranks Among Top Institutes in Rajasthan",
    snippet:
      "Compucom Institute of Technology & Management has been recognised among the leading technical institutes in Rajasthan, reflecting its sustained commitment to academic rigour and industry-aligned learning.",
  },
  {
    id: "alumni-fund-25-scholarships",
    date: "28 Jan 2026",
    title: "Alumni Fund Supports 25 New Scholarships",
    snippet:
      "Contributions from the global alumni community have funded 25 new merit-cum-means scholarships for deserving students, extending the legacy of giving back to the institute.",
  },
  {
    id: "new-industry-partnership-announced",
    date: "09 Jan 2026",
    title: "New Industry Partnership Announced",
    snippet:
      "A new partnership will open internship and placement pathways for students, with alumni playing a key role in mentorship and referrals across partner organisations.",
  },
];

export function LatestNews() {
  return (
    <section className="bg-[#faf8f3] py-20">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading
          eyebrow="News & Announcements"
          title="Latest from CIITM"
          align="center"
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {NEWS.map((item) => (
            <Card key={item.id}>
              <CardBody>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#6b6b6b]">
                  {item.date}
                </p>

                <h3 className={`mt-3 text-lg text-[#1a2b4a] ${SERIF}`}>
                  {item.title}
                </h3>

                <p className="mt-3 text-sm text-[#6b6b6b] leading-relaxed line-clamp-3">
                  {item.snippet}
                </p>

                <Link
                  href={`/news/${item.id}`}
                  className="mt-5 inline-block text-xs uppercase tracking-[0.15em] text-[#b8860b] hover:text-[#7a1e2e] transition-colors"
                >
                  Read more &rarr;
                </Link>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}