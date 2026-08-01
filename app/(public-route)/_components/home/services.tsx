import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { bdt, services } from "./data";
import { SectionHeading } from "./section-heading";
import { TicketStub } from "./ticket-stub";

export function Services() {
  return (
    <section id="services" className="scroll-mt-20 border-t-2 border-dashed border-ink/20">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="// On the bench"
            title="Services being booked right now."
            sub="Each one is a pull-tab ticket. Tear off the price, pick a time, and a pro takes the other half."
          />
          <Button
            asChild
            variant="outline"
            className="mb-10 rounded-md border-2 border-ink font-display font-bold text-ink hover:border-ink hover:bg-ink hover:text-bone"
          >
            <Link href="/services">Browse all services &#8594;</Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.serial}
              className="group flex overflow-hidden rounded-sm border-2 border-ink/80 transition-transform duration-200 hover:-translate-y-1"
            >
              <TicketStub top={service.serial} bottom={bdt(service.price)} />
              <Card className="flex flex-1 flex-col rounded-none border-0 bg-ticket-hi p-5 shadow-none">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-safety">
                    {service.category}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-steel">
                    {service.durationMins} min
                  </span>
                </div>
                <h3 className="mt-2 font-display text-lg font-bold leading-snug">
                  {service.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-steel line-clamp-2">
                  {service.description}
                </p>
                <div className="mt-4 flex items-end justify-between gap-3 border-t-2 border-dashed border-ink/20 pt-3">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-[10px] uppercase tracking-wider text-steel">
                      {service.technician}
                    </p>
                    <p className="font-mono text-[10px] text-steel">
                      {"\u2605"} {service.rating} ({service.reviews})
                      {"\u00a0\u00b7\u00a0"}
                      {service.area}
                    </p>
                  </div>
                  <span className="shrink-0 font-display text-xl font-bold tabular-nums">
                    {bdt(service.price)}
                  </span>
                </div>
                <Button
                  asChild
                  className="mt-3 block rounded-sm bg-ink px-3 py-2 text-center font-display text-sm font-bold text-bone group-hover:bg-safety group-hover:text-ink hover:bg-safety hover:text-ink"
                >
                  <Link href="/services">Book this</Link>
                </Button>
              </Card>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
