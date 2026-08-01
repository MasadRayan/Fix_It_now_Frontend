import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { bdt, pros } from "./data";
import { SectionHeading } from "./section-heading";

export function Pros() {
  return (
    <section id="pros" className="scroll-mt-20 border-t-2 border-dashed border-ink/20">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionHeading
          eyebrow="// Pros worth knowing"
          title="Vetted, rated, ready."
          sub="Every technician on the board is background-checked and rated by the people who actually hired them."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {pros.map((pro) => (
            <Card
              key={pro.name}
              className="flex flex-col rounded-sm border-ink/25 bg-ticket-hi p-6 shadow-none transition-all hover:-translate-y-0.5 hover:border-ink"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-12 items-center justify-center rounded-full border-2 border-ink/60 bg-ticket font-display text-base font-bold">
                  {pro.initials}
                </span>
                <Badge className="rounded-sm border border-safety bg-transparent font-mono text-[10px] font-bold uppercase tracking-widest text-safety">
                  {"\u2713"} verified
                </Badge>
              </div>
              <h3 className="mt-4 font-display text-xl font-bold">{pro.name}</h3>
              <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wider text-steel">
                {`${pro.skill} \u00b7 ${pro.area}`}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-steel">{pro.bio}</p>
              <div className="mt-auto flex items-center justify-between border-t-2 border-dashed border-ink/20 pt-3 font-mono text-[11px] text-steel">
                <span>
                  {"\u2605"} {pro.rating} ({pro.reviews})
                </span>
                <span>{pro.experienceYrs} yrs</span>
                <span className="font-bold text-ink">
                  {bdt(pro.hourlyRate)}/hr
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
