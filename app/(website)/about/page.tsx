import type { Metadata } from "next";
import AboutHero from "../_sections/about/hero";
import WhoWeAre from "../_sections/about/who-we-are";
import VisionMission from "../_sections/about/vision-mission";
import PrincipalMessage from "../_sections/about/principal-message";
import AtAGlance from "../_sections/about/at-a-glance";
import AlumniAssociation from "../_sections/about/alumni-association";
import AboutCTA from "../_sections/about/cta";

export const metadata: Metadata = {
  title: "About | CIITM Alumni",
  description:
    "Learn about Compucom Institute of Technology & Management, Jaipur, and the CIITM Alumni Association.",
};

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <WhoWeAre />
      <VisionMission />
      <PrincipalMessage />
      <AtAGlance />
      <AlumniAssociation />
      <AboutCTA />
    </>
  );
}