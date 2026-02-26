/**
 * Core data models for RouteOps vehicle routing.
 */

export interface Stop {
  id: string
  name: string
  lat: number
  lng: number
  demand: number
}

export interface SolveRequest {
  stops: Stop[]
  depotId: string
  vehicles: number
  capacity: number
  distanceMetric: 'haversine' | 'osrm'
  objective: 'distance' | 'time'
}

export interface RouteResult {
  routeId: number
  vehicleId: number
  stopIds: string[]
  load: number
  distanceKm: number
  timeMin: number
  geometry: Array<{ lat: number; lng: number }>
}

export interface SolveResponse {
  status: 'ok'
  summary: {
    totalDistanceKm: number
    totalTimeMin: number
    routes: number
    stopsServed: number
  }
  routes: RouteResult[]
  unservedStopIds: string[]
}

export interface HealthResponse {
  status: 'ok'
}
