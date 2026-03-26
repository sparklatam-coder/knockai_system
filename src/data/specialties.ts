export const SPECIALTIES = [
  { key: "dental", label: "치과", color: "#3b82f6" },
  { key: "internal", label: "내과", color: "#059669" },
  { key: "ortho", label: "정형외과", color: "#d97706" },
  { key: "derma", label: "피부과", color: "#e11d48" },
  { key: "korean", label: "한의원", color: "#7c3aed" },
  { key: "animal", label: "동물병원", color: "#ea580c" },
  { key: "obgyn", label: "산부인과", color: "#db2777" },
  { key: "ent", label: "이비인후과", color: "#0891b2" },
  { key: "eye", label: "안과", color: "#2563eb" },
  { key: "pediatric", label: "소아청소년과", color: "#059669" },
] as const;

export type SpecialtyKey = (typeof SPECIALTIES)[number]["key"];

/** DB specialty label → key mapping */
export const SPECIALTY_LABEL_TO_KEY: Record<string, SpecialtyKey> = Object.fromEntries(
  SPECIALTIES.map((s) => [s.label, s.key])
) as Record<string, SpecialtyKey>;
