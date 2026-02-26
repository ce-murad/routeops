/**
 * CSV parse and export utilities.
 */

import type { Stop, RouteResult } from '@/types/models'

const CSV_HEADERS = ['id', 'name', 'lat', 'lng', 'demand'] as const

/** Parse CSV string into rows of records; first row = headers. */
export function parseCsv(csvText: string): Record<string, string>[] {
  const lines = csvText.trim().split(/\r?\n/)
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
  const rows: Record<string, string>[] = []
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i])
    const row: Record<string, string> = {}
    headers.forEach((h, j) => {
      row[h] = values[j] ?? ''
    })
    rows.push(row)
  }
  return rows
}

/** Simple CSV line parse (handles quoted fields). */
function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') {
      inQuotes = !inQuotes
    } else if ((c === ',' && !inQuotes) || c === '\n' || c === '\r') {
      result.push(current.trim())
      current = ''
    } else {
      current += c
    }
  }
  result.push(current.trim())
  return result
}

/** Convert stops to CSV string (id,name,lat,lng,demand). */
export function exportStopsToCsv(stops: Stop[]): string {
  const header = CSV_HEADERS.join(',')
  const rows = stops.map(s => [s.id, s.name, s.lat, s.lng, s.demand].join(','))
  return [header, ...rows].join('\n')
}

/** Export solved routes to CSV: routeId, vehicleId, sequenceIndex, stopId, stopName, lat, lng, demand, loadAfterStop, distanceKm, timeMin. */
export function exportRoutesToCsv(
  routes: RouteResult[],
  stopById: Map<string, Stop>
): string {
  const header =
    'routeId,vehicleId,sequenceIndex,stopId,stopName,lat,lng,demand,loadAfterStop,distanceKm,timeMin'
  const rows: string[] = []
  for (const r of routes) {
    let cumLoad = 0
    for (let i = 0; i < r.stopIds.length; i++) {
      const stopId = r.stopIds[i]
      const stop = stopById.get(stopId)
      cumLoad += stop?.demand ?? 0
      const stopName = stop?.name ?? stopId
      const lat = stop?.lat ?? 0
      const lng = stop?.lng ?? 0
      const demand = stop?.demand ?? 0
      rows.push(
        [
          r.routeId,
          r.vehicleId,
          i,
          stopId,
          `"${String(stopName).replace(/"/g, '""')}"`,
          lat,
          lng,
          demand,
          cumLoad,
          r.distanceKm,
          r.timeMin,
        ].join(',')
      )
    }
  }
  return [header, ...rows].join('\n')
}

/** Trigger download of a CSV string as file. */
export function downloadCsv(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
