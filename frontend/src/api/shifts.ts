// Functions that call our backend's /shifts endpoints. Screens import these instead of
// writing axios calls directly, so the actual API URLs only exist in one place.

import { api } from "./client";
import { Shift } from "../types/types";

export async function punchIn(locationId: number, notes?: string): Promise<Shift> {
  const response = await api.post("/shifts/punch-in", {
    location_id: locationId,
    notes: notes ?? null,
  });
  return response.data;
}

export async function punchOut(): Promise<Shift> {
  const response = await api.post("/shifts/punch-out");
  return response.data;
}

export async function getShifts(): Promise<Shift[]> {
  const response = await api.get("/shifts/");
  return response.data;
}