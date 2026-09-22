import { StatsBar } from "./_sections/stats-bar";
import { AboutSection } from "./_sections/about-section";
import { NotableAlumni } from "./_sections/notable-alumni";
import { UpcomingEvents } from "./_sections/upcoming-events";
import { LatestNews } from "./_sections/latest-news";
import { RecentJobs } from "./_sections/recent-jobs";
import { CtaBanner } from "./_sections/cta-banner";
import { Hero } from "./_sections/hero";

export default function WebsiteHomePage() {
  return (
    <>
      <Hero />
      <StatsBar />
      <AboutSection />
      <NotableAlumni />
      <UpcomingEvents />
      <LatestNews />
      <RecentJobs />
      <CtaBanner />
    </>
  );
}