import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { Navbar } from "./_components/navbar";
import { Footer } from "./_components/footer";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CIITM Alumni Portal",
  description:
    "Official alumni portal of Compucom Institute of Technology & Management (CIITM), Jaipur — connecting graduates of CIITM Alumni Association for mentorship, opportunity, and lifelong bonds.",
};

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${playfair.variable} ${inter.variable} ${inter.className} bg-[#faf8f3] text-[#1f1f1f] min-h-screen flex flex-col`}
    >
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}