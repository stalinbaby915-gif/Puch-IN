// Functions that call our backend's /locations endpoints. Screens import these instead of
// writing axios calls directly, so the actual API URLs only exist in one place.

import { api } from "./client";
import { Location } from "../types/types";

export async function getLocations(): Promise<Location[]> {
  const response = await api.get("/locations/");
  return response.data;
}

export async function createLocation(data: {
  name: string;
  color: string;
  hourly_rate: number;
}): Promise<Location> {
  const response = await api.post("/locations/", data);
  return response.data;
}