import data from "@/data/locations.json";

export const PROVINCES = ["Aydın", "Denizli", "Muğla"] as const;
export type Province = (typeof PROVINCES)[number];
export type LocationData = Record<string, Record<string, string[]>>;

export const LOCATIONS = data as LocationData;

export const isValidLocation = (province: string, district: string, place: string) =>
  !!LOCATIONS[province]?.[district]?.includes(place);