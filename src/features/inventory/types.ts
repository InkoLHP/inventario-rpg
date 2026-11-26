import type { OrbitStackItem } from "@/components/ui/orbit-card-stack";

export type SlotType = "HELMET" | "ARMOR" | "WEAPON" | "SHIELD" | "AMULET";

export interface RPGItem extends OrbitStackItem {
  id: string;
  slot: SlotType;
  attack: number;
  defense: number;
  magic: number;
}

export interface EquipmentSlot {
  key: SlotType;
  label: string;
  hint: string;
  icon: "helmet" | "armor" | "weapon" | "shield" | "amulet";
}

export interface Feedback {
  type: "success" | "error" | "info";
  text: string;
}
