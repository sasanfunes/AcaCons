import { DEFAULT_TIMEZONE, LOCALE } from "@/lib/constants";

export function formatDate(d: Date, timeZone: string = DEFAULT_TIMEZONE) {
  return new Intl.DateTimeFormat(LOCALE, { dateStyle: "long", timeZone }).format(d);
}

export function formatDateTime(d: Date, timeZone: string = DEFAULT_TIMEZONE) {
  return new Intl.DateTimeFormat(LOCALE, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  }).format(d);
}

export function formatTime(d: Date, timeZone: string = DEFAULT_TIMEZONE) {
  return new Intl.DateTimeFormat(LOCALE, { hour: "numeric", minute: "2-digit", timeZone }).format(d);
}

/** "sábado, 5 de diciembre de 2026, 8:00 a. m. – 12:00 p. m." */
export function formatEventRange(start: Date, end: Date, timeZone: string = DEFAULT_TIMEZONE) {
  const sameDay =
    new Intl.DateTimeFormat("en-CA", { timeZone }).format(start) === new Intl.DateTimeFormat("en-CA", { timeZone }).format(end);
  return sameDay
    ? `${formatDateTime(start, timeZone)} – ${formatTime(end, timeZone)}`
    : `${formatDateTime(start, timeZone)} – ${formatDateTime(end, timeZone)}`;
}

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Convierte "2026-12-05T08:00" interpretado en la zona del evento a Date UTC. */
export function zonedLocalToUtc(local: string, timeZone: string): Date {
  const [datePart, timePart = "00:00"] = local.split("T");
  const [y, mo, d] = datePart!.split("-").map(Number);
  const [h, mi] = timePart.split(":").map(Number);
  const guess = Date.UTC(y!, mo! - 1, d!, h!, mi!);
  const offset = tzOffsetMinutes(new Date(guess), timeZone);
  return new Date(guess - offset * 60_000);
}

/** Inverso de zonedLocalToUtc, para precargar inputs datetime-local. */
export function utcToZonedLocal(date: Date, timeZone: string): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

function tzOffsetMinutes(date: Date, timeZone: string): number {
  const local = utcToZonedLocal(date, timeZone);
  const [dp, tp] = local.split("T");
  const [y, mo, d] = dp!.split("-").map(Number);
  const [h, mi] = tp!.split(":").map(Number);
  return (Date.UTC(y!, mo! - 1, d!, h!, mi!) - Math.floor(date.getTime() / 60_000) * 60_000) / 60_000;
}
