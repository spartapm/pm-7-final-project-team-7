export type PartId =
  | "spine"
  | "shoulder"
  | "knee"
  | "hand"
  | "foot"
  | "other";

export type OtherPartId =
  | "bone"
  | "wrist"
  | "liver"
  | "pelvis"
  | "joint"
  | "ligament"
  | "cartilage"
  | "muscle";

export type RegionId =
  | "donggu"
  | "junggu"
  | "seogu"
  | "yuseong"
  | "daedeok"
  | "all";

export type HospitalStatus = "high" | "unknown";
export type SortMode = "distance" | "type";
export type Ternary = true | false | "unknown";

export type Hospital = {
  ykiho: string;
  name: string;
  clCd: string;
  clCdNm: string;
  careLevel: 1 | 2 | 3 | 0;
  addr: string;
  telno: string | null;
  lat: number | null;
  lng: number | null;
  sgguCd: string;
  regionId: RegionId;
  regionLabel: string;
  mriCount: number | null;
  hasMri: boolean;
  hasOrtho: Ternary;
  orthoSpecialistCount: number | null;
  hasMriNonpay: Ternary;
  status: HospitalStatus;
  evidenceId: "F1" | "F2" | "F3" | "F4";
  evidence: string;
  sourceDate: string;
};

export type Snapshot = {
  generatedAt: string;
  sourceDate: string;
  source: string;
  hospitals: Hospital[];
};
