/**
 * Map view: Leaflet with OSM tiles, depot, stops, route polylines, popups.
 */
import { useMemo, useEffect } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'
import type { LatLngExpression } from 'leaflet'
import type { Stop } from '@/types/models'
import type { RouteResult } from '@/types/models'

// Fix default marker icons in Vite/React (Leaflet + Webpack issue)
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})
L.Marker.prototype.options.icon = defaultIcon

/** Depot icon: use a different color (e.g. red circle). */
const depotIcon = L.divIcon({
  className: 'depot-marker',
  html: `<div style="
    width:24px;height:24px;border-radius:50%;
    background:#e03131;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.4);
  "></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

const ROUTE_COLORS = [
  '#228be6',
  '#40c057',
  '#fd7e14',
  '#be4bdb',
  '#fa5252',
  '#15aabf',
  '#fab005',
  '#7950f2',
]

function stopNumberIcon(num: number | string, color: string): L.DivIcon {
  return L.divIcon({
    className: 'stop-number-marker',
    html: `<div style="
      width:22px;height:22px;border-radius:50%;
      background:${color};color:#fff;border:2px solid #fff;
      box-shadow:0 1px 4px rgba(0,0,0,0.4);
      display:flex;align-items:center;justify-content:center;
      font-size:11px;font-weight:700;
    ">${num}</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  })
}

interface MapViewProps {
  stops: Stop[]
  depotId: string | null
  routes: RouteResult[] | null
  focusedRouteId: number | null
  height?: string
}

function MapBounds({
  stops,
  routes,
}: {
  stops: Stop[]
  routes: RouteResult[] | null
}) {
  const map = useMap()
  const bounds = useMemo(() => {
    const points: LatLngExpression[] = stops.map(s => [s.lat, s.lng])
    routes?.forEach(r => {
      r.geometry.forEach(p => points.push([p.lat, p.lng]))
    })
    if (points.length === 0) return null
    return L.latLngBounds(points)
  }, [stops, routes])
  useEffect(() => {
    if (bounds) map.fitBounds(bounds, { padding: [24, 24], maxZoom: 14 })
  }, [map, bounds])
  return null
}

export function MapView({
  stops,
  depotId,
  routes,
  focusedRouteId,
  height = '400px',
}: MapViewProps) {
  const center: LatLngExpression = useMemo(() => {
    if (stops.length === 0) return [39.9334, 32.8597] as LatLngExpression // Ankara
    const sumLat = stops.reduce((a, s) => a + s.lat, 0)
    const sumLng = stops.reduce((a, s) => a + s.lng, 0)
    return [sumLat / stops.length, sumLng / stops.length] as LatLngExpression
  }, [stops])

  const routeIdToIndex = useMemo(() => {
    const ids = [...new Set((routes ?? []).map(r => r.routeId))]
    const m = new Map<number, number>()
    ids.forEach((id, i) => m.set(id, i))
    return m
  }, [routes])

  return (
    <div style={{ height, width: '100%', borderRadius: 8, overflow: 'hidden' }}>
      <MapContainer
        center={center}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBounds stops={stops} routes={routes} />
        {stops.map((s) => {
  const isDepot = s.id === depotId
  const routeForStop = routes?.find((r) => r.stopIds.includes(s.id))
  const routeNum = routeForStop ? (routeIdToIndex.get(routeForStop.routeId) ?? 0) : 0
  const color = ROUTE_COLORS[routeNum % ROUTE_COLORS.length]
  const seq = routeForStop ? routeForStop.stopIds.indexOf(s.id) + 1 : '—'
  const stopIcon = isDepot ? depotIcon : stopNumberIcon(seq, color)

  return (
    <Marker key={s.id} position={[s.lat, s.lng]} icon={stopIcon}>
      <Popup>
        <div style={{ minWidth: 160 }}>
          <strong>{s.name}</strong> ({s.id})
          <br />
          Lat: {s.lat.toFixed(4)}, Lng: {s.lng.toFixed(4)}
          <br />
          Demand: {s.demand}
          {routeForStop && (
            <>
              <br />
              <span style={{ color: '#228be6' }}>
                Route #{routeForStop.routeId} (Vehicle {routeForStop.vehicleId})
              </span>
            </>
          )}
        </div>
      </Popup>
    </Marker>
  )
})}

        {routes?.map(r => {
          const color =
            ROUTE_COLORS[(routeIdToIndex.get(r.routeId) ?? 0) % ROUTE_COLORS.length]
          const isFocused =
            focusedRouteId == null || r.routeId === focusedRouteId
          const positions: LatLngExpression[] = r.geometry.map(p => [p.lat, p.lng])
          if (positions.length < 2) return null
          return (
            <Polyline
              key={r.routeId}
              positions={positions}
              pathOptions={{
                color,
                weight: isFocused ? 4 : 2,
                opacity: isFocused ? 0.9 : 0.4,
              }}
            />
          )
        })}
      </MapContainer>
    </div>
  )
}
