"use client";
import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

/** Bloque de texto recortado con botón "Mostrar más". */
export function Expandable({ children, collapsedHeight = 220 }: { children: ReactNode; collapsedHeight?: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="relative overflow-hidden" style={open ? undefined : { maxHeight: collapsedHeight }}>
        {children}
        {!open && <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-marfil to-transparent" />}
      </div>
      <button type="button" onClick={() => setOpen(!open)} className="mt-2 flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
        {open ? "Mostrar menos" : "Mostrar más"} <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
    </div>
  );
}

/** Botón que abre o cierra todos los <details> dentro del contenedor indicado. */
export function ToggleAllSections({ targetId }: { targetId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      type="button"
      className="text-sm font-semibold text-brand-700 hover:underline"
      onClick={() => {
        document.querySelectorAll<HTMLDetailsElement>(`#${targetId} details`).forEach((d) => (d.open = !open));
        setOpen(!open);
      }}
    >
      {open ? "Contraer todas las secciones" : "Expandir todas las secciones"}
    </button>
  );
}
