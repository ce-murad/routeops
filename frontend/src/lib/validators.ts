import { z } from 'zod'

/** Zod schema for a single stop (CSV row / form). */
export const stopSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(1, 'Name is required'),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  demand: z.number().min(0),
})

export type StopInput = z.infer<typeof stopSchema>

/** Parse and validate a single CSV row; returns error message or null. */
export function validateStopRow(row: Record<string, unknown>): string | null {
  const parsed = z.object({
    id: z.string(),
    name: z.string(),
    lat: z.coerce.number(),
    lng: z.coerce.number(),
    demand: z.coerce.number(),
  }).safeParse(row)
  if (!parsed.success) {
    return parsed.error.errors.map(e => e.message).join('; ')
  }
  const { lat, lng, demand } = parsed.data
  if (lat < -90 || lat > 90) return 'lat must be in [-90, 90]'
  if (lng < -180 || lng > 180) return 'lng must be in [-180, 180]'
  if (demand < 0) return 'demand must be >= 0'
  return null
}

/** Schema for problem settings form. */
export const problemSettingsSchema = z.object({
  vehicles: z.coerce.number().int().min(1).max(50),
  capacity: z.coerce.number().int().min(1),
  depotId: z.string().min(1),
  distanceMetric: z.enum(['haversine', 'osrm']),
  objective: z.enum(['distance', 'time']),
})

export type ProblemSettingsInput = z.infer<typeof problemSettingsSchema>
