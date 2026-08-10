const DEPARTMENT_ROW_COLORS = [
  "bg-sky-50/80 hover:bg-sky-100/80",
  "bg-emerald-50/80 hover:bg-emerald-100/80",
  "bg-amber-50/80 hover:bg-amber-100/80",
  "bg-violet-50/80 hover:bg-violet-100/80",
  "bg-rose-50/80 hover:bg-rose-100/80",
  "bg-cyan-50/80 hover:bg-cyan-100/80",
  "bg-orange-50/80 hover:bg-orange-100/80",
  "bg-lime-50/80 hover:bg-lime-100/80",
] as const;

const DEPARTMENT_ACCENTS = [
  {
    dot: "bg-sky-500",
    badge: "bg-sky-50 text-sky-800 ring-sky-200",
    panel: "border-sky-200 bg-sky-50/70",
    bar: "bg-sky-500",
  },
  {
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    panel: "border-emerald-200 bg-emerald-50/70",
    bar: "bg-emerald-500",
  },
  {
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-900 ring-amber-200",
    panel: "border-amber-200 bg-amber-50/70",
    bar: "bg-amber-500",
  },
  {
    dot: "bg-violet-500",
    badge: "bg-violet-50 text-violet-800 ring-violet-200",
    panel: "border-violet-200 bg-violet-50/70",
    bar: "bg-violet-500",
  },
  {
    dot: "bg-rose-500",
    badge: "bg-rose-50 text-rose-800 ring-rose-200",
    panel: "border-rose-200 bg-rose-50/70",
    bar: "bg-rose-500",
  },
  {
    dot: "bg-cyan-500",
    badge: "bg-cyan-50 text-cyan-800 ring-cyan-200",
    panel: "border-cyan-200 bg-cyan-50/70",
    bar: "bg-cyan-500",
  },
  {
    dot: "bg-orange-500",
    badge: "bg-orange-50 text-orange-900 ring-orange-200",
    panel: "border-orange-200 bg-orange-50/70",
    bar: "bg-orange-500",
  },
  {
    dot: "bg-lime-500",
    badge: "bg-lime-50 text-lime-900 ring-lime-200",
    panel: "border-lime-200 bg-lime-50/70",
    bar: "bg-lime-500",
  },
] as const;

function departmentColorIndex(department?: string | null) {
  const normalized = String(department || "Unassigned").trim().toLowerCase();
  let hash = 0;
  for (let index = 0; index < normalized.length; index++) {
    hash = ((hash << 5) - hash + normalized.charCodeAt(index)) | 0;
  }
  return Math.abs(hash) % DEPARTMENT_ROW_COLORS.length;
}

export function departmentRowColor(department?: string | null) {
  return DEPARTMENT_ROW_COLORS[departmentColorIndex(department)];
}

export function departmentAccentClasses(department?: string | null) {
  return DEPARTMENT_ACCENTS[departmentColorIndex(department)];
}
