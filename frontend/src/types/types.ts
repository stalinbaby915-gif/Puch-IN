// These types mirror our backend's schemas.py — they describe the exact shape of the JSON
// our API sends/receives, so TypeScript can catch mistakes (wrong field names, wrong types)
// while we're writing screens, instead of only finding out when the app crashes.

export type Location = {
  id: number;
  name: string;
  color: string;
  hourly_rate: number;
};

export type Shift = {
  id: number;
  start_time: string;
  end_time: string | null;
  hours_worked: number | null;
  notes: string | null;
  location: Location;
};