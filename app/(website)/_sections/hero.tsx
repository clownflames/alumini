import { Button } from "../_components/button";
import { SERIF } from "../_lib/fonts";

export function Hero() {
  return (
    <section className="relative bg-[#1a2b4a] overflow-hidden">
      <div className="absolute inset-0 bg-black/25 pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-6 py-28 md:py-36 text-center">
        <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-[#b8860b]">
          CIITM Alumni Association
        </p>

        <h1
          className={`mt-6 text-4xl md:text-6xl text-white leading-[1.1] ${SERIF}`}
        >
          Once a Compucomite, Always a Compucomite
        </h1>

        <p className="mt-6 text-white/80 max-w-2xl mx-auto text-base md:text-lg">
          Reconnect with your alma mater, celebrate shared achievements, and
          help shape the future of Compucom Institute of Technology &amp;
          Management, Jaipur.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="primary" size="md" href="/register">
            Join the Network
          </Button>
          <Button variant="outlineLight" size="md" href="/directory">
            Explore Alumni
          </Button>
        </div>

        <div className="mt-16 mx-auto w-20 h-px bg-[#b8860b]" />
      </div>
    </section>
  );
}