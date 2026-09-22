import { Button } from "../../_components/button";
import { SERIF } from "../../_lib/fonts";

export default function AboutCTA() {
  return (
    <section className="bg-[#1a2b4a] text-white">
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <div className="mx-auto w-16 h-px bg-[#b8860b]" />

        <h2 className={`mt-8 text-3xl md:text-4xl leading-tight ${SERIF}`}>
          Be Part of the Story
        </h2>

        <p className="mt-5 text-white/75 max-w-xl mx-auto">
          Whether you graduated last year or three decades ago, your journey
          belongs here. Join the alumni network and stay connected for life.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Button href="/register" variant="primary" size="lg">
            Register Now
          </Button>
          <Button href="/directory" variant="outlineLight" size="lg">
            Explore Alumni
          </Button>
        </div>
      </div>
    </section>
  );
}