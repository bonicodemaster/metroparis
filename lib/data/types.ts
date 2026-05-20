export type LineId =
  | "1" | "2" | "3" | "3bis" | "4" | "5" | "6"
  | "7" | "7bis" | "8" | "9" | "10" | "11"
  | "12" | "13" | "14";

export interface Station {
  /** kebab-case identifier, unique */
  id: string;
  /** display name with accents and special chars */
  name: string;
  /** WGS84 latitude */
  lat: number;
  /** WGS84 longitude */
  lon: number;
  /** lines passing through this station */
  lines: LineId[];
}

export interface Line {
  id: LineId;
  label: string;
  /** hex color, RATP-official */
  color: string;
  /** ordered list of station ids on this line */
  stations: string[];
  /** for branched lines, secondary segments (not part of main path) */
  branches?: { from: string; stations: string[]; label?: string }[];
}
