// Shared date-handling helpers. Our backend stores timestamps in UTC with no timezone
// marker, so JavaScript would otherwise misread them as local time — parseUTC fixes that
// by explicitly telling JS "this string is UTC" before parsing it into a Date object.

export function parseUTC(dateString: string): Date {
  return new Date(dateString.endsWith("Z") ? dateString : dateString + "Z");
}