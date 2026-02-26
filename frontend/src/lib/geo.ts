/**
 * Geo utilities: Haversine distance and sample stop generation.
 */

/** Haversine distance in km between two points. */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/** Default city center for sample stops (Ankara). */
export const DEFAULT_CENTER = { lat: 39.9334, lng: 32.8597 }

/** Generate random offset in km; rough conversion to deg (~111 km/deg). */
function randomOffsetKm(maxKm: number): { lat: number; lng: number } {
  const lat = (Math.random() - 0.5) * 2 * (maxKm / 111)
  const lng = (Math.random() - 0.5) * 2 * (maxKm / (111 * Math.cos((DEFAULT_CENTER.lat * Math.PI) / 180)))
  return { lat, lng }
}

export interface StopLike {
  id: string
  name: string
  lat: number
  lng: number
  demand: number
}

/** Generate n random stops around a center (default Ankara). */
export function generateSampleStops(
  n: number,
  center: { lat: number; lng: number } = DEFAULT_CENTER,
  radiusKm = 8
): StopLike[] {
  const stops: StopLike[] = []
  const usedIds = new Set<string>()
  for (let i = 0; i < n; i++) {
    const { lat: dLat, lng: dLng } = randomOffsetKm(radiusKm)
    const id = `sample-${i + 1}`
    if (usedIds.has(id)) continue
    usedIds.add(id)
    stops.push({
      id,
      name: `Stop ${i + 1}`,
      lat: center.lat + dLat,
      lng: center.lng + dLng,
      demand: Math.floor(Math.random() * 25) + 1,
    })
  }
  return stops
}
