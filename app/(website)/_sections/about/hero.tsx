import { SERIF } from "../../_lib/fonts";

export default function AboutHero() {
  return (
    <section className="relative bg-[#1a2b4a] overflow-hidden">
      <div className="absolute inset-0 bg-black/25 pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-6 py-24 md:py-32 text-center">
        <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-[#b8860b]">
          About CIITM Alumni
        </p>

        <h1
          className={`mt-6 text-4xl md:text-5xl text-white leading-tight ${SERIF}`}
        >
          A Legacy Built on Excellence
        </h1>

        <p className="mt-6 text-white/75 max-w-2xl mx-auto">
          For over three decades, Compucom Institute of Technology &amp;
          Management has nurtured engineers, managers, and leaders. Our alumni
          carry that legacy across the world.
        </p>

        <div className="mt-14 mx-auto w-20 h-px bg-[#b8860b]" />
      </div>
    </section>
  );
}