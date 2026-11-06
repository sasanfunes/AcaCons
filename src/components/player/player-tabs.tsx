"use client";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tab = { id: string; label: string; content: ReactNode; mobileOnly?: boolean };

/** Pestañas bajo el video (el contenido llega ya renderizado desde el servidor). */
export function PlayerTabs({ tabs, initial }: { tabs: Tab[]; initial?: string }) {
  const [active, setActive] = useState(() => (tabs.some((t) => t.id === initial) ? initial! : tabs.find((t) => !t.mobileOnly)!.id));
  return (
    <div>
      <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-ink-200 px-4 [scrollbar-width:none] sm:px-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            id={`tab-${t.id}`}
            role="tab"
            type="button"
            aria-selected={active === t.id}
            aria-controls={`panel-${t.id}`}
            onClick={() => setActive(t.id)}
            className={cn(
              "-mb-px whitespace-nowrap border-b-2 px-3 py-3 text-sm font-semibold",
              t.mobileOnly && "lg:hidden",
              active === t.id ? "border-ink-900 text-ink-900" : "border-transparent text-ink-500 hover:text-ink-900",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <div
          key={t.id}
          id={`panel-${t.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${t.id}`}
          hidden={active !== t.id}
          className="px-4 py-6 sm:px-6"
        >
          {t.content}
        </div>
      ))}
    </div>
  );
}
