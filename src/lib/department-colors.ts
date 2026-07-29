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

export function departmentRowColor(department?: string | null) {
  const normalized = String(department || "Unassigned").trim().toLowerCase();
  let hash = 0;
  for (let index = 0; index < normalized.length; index++) {
    hash = ((hash << 5) - hash + normalized.charCodeAt(index)) | 0;
  }
  return DEPARTMENT_ROW_COLORS[Math.abs(hash) % DEPARTMENT_ROW_COLORS.length];
}
