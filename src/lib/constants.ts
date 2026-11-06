export const PROFESSIONS = {
  ARQUITECTO: "Arquitecto(a)",
  INGENIERO_CIVIL: "Ingeniero(a) civil",
  MAESTRO_DE_OBRA: "Maestro(a) de obra",
  CONTRATISTA: "Contratista / constructor(a)",
  TECNICO: "Técnico(a) en construcción",
  ALBANIL_OFICIO: "Albañil / oficio",
  ESTUDIANTE: "Estudiante",
  FERRETERIA_DISTRIBUIDOR: "Ferretería / distribuidora",
  OTRO: "Otro",
} as const;
export type ProfessionKey = keyof typeof PROFESSIONS;

export const LEVELS = { INICIAL: "Inicial", INTERMEDIO: "Intermedio", AVANZADO: "Avanzado" } as const;
export type LevelKey = keyof typeof LEVELS;

export const STATUS_LABELS = { DRAFT: "Borrador", PUBLISHED: "Publicado", ARCHIVED: "Archivado" } as const;

export const REGISTRATION_STATUS_LABELS = {
  CONFIRMED: "Confirmada",
  WAITLISTED: "En lista de espera",
  CANCELLED: "Cancelada",
} as const;

export const COUNTRIES = {
  HN: "Honduras",
  GT: "Guatemala",
  SV: "El Salvador",
  NI: "Nicaragua",
  CR: "Costa Rica",
  PA: "Panamá",
  BZ: "Belice",
} as const;
export type CountryCode = keyof typeof COUNTRIES;

export const HONDURAS_DEPARTMENTS = [
  "Atlántida",
  "Choluteca",
  "Colón",
  "Comayagua",
  "Copán",
  "Cortés",
  "El Paraíso",
  "Francisco Morazán",
  "Gracias a Dios",
  "Intibucá",
  "Islas de la Bahía",
  "La Paz",
  "Lempira",
  "Ocotepeque",
  "Olancho",
  "Santa Bárbara",
  "Valle",
  "Yoro",
] as const;

export const TIMEZONES = {
  "America/Tegucigalpa": "Honduras (UTC−6)",
  "America/Guatemala": "Guatemala (UTC−6)",
  "America/El_Salvador": "El Salvador (UTC−6)",
  "America/Managua": "Nicaragua (UTC−6)",
  "America/Costa_Rica": "Costa Rica (UTC−6)",
  "America/Belize": "Belice (UTC−6)",
  "America/Panama": "Panamá (UTC−5)",
} as const;
export const DEFAULT_TIMEZONE = "America/Tegucigalpa";
export const LOCALE = "es-HN";
