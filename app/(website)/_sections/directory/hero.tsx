import { SERIF } from "../../_lib/fonts";

export default function DirectoryHero() {
  return (
    <section className="relative bg-[#1a2b4a] overflow-hidden">
      <div className="absolute inset-0 bg-black/25 pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-6 py-20 md:py-28 text-center">
        <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-[#b8860b]">
          Alumni Network
        </p>

        <h1
          className={`mt-6 text-4xl md:text-5xl text-white leading-tight ${SERIF}`}
        >
          Our Alumni Directory
        </h1>

        <p className="mt-6 text-white/75 max-w-2xl mx-auto">
          Discover and connect with fellow Compucomites across cities,
          industries, and generations. A network that grows stronger with every
          graduate.
        </p>

        <div className="mt-12 mx-auto w-20 h-px bg-[#b8860b]" />
      </div>
    </section>
  );
}