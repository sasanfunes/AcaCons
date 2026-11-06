"use client";
import { useRef, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Fila horizontal con scroll-snap: flechas en desktop, deslizamiento en móvil. */
export function Carousel({ children, label }: { children: ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };
  return (
    <div className="group/carousel relative">
      <div
        ref={ref}
        role="region"
        aria-label={label}
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      {(["prev", "next"] as const).map((d) => (
        <button
          key={d}
          type="button"
          onClick={() => scroll(d === "prev" ? -1 : 1)}
          aria-label={d === "prev" ? "Anteriores" : "Siguientes"}
          className={`absolute top-[28%] z-10 hidden h-11 w-11 items-center justify-center rounded-full border border-ink-900 bg-ink-900 text-white shadow-lg hover:bg-ink-800 md:flex ${
            d === "prev" ? "-left-5" : "-right-5"
          }`}
        >
          {d === "prev" ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>
      ))}
    </div>
  );
}

/** Ancho fijo de cada elemento dentro del carrusel. */
export function CarouselItem({ children }: { children: ReactNode }) {
  return <div className="w-[78%] shrink-0 snap-start sm:w-[45%] md:w-[31%] lg:w-[23.5%]">{children}</div>;
}
