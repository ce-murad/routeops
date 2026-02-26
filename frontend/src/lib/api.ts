/**
 * API client: health check and solve. Uses VITE_API_BASE_URL.
 */

import axios, { type AxiosError } from 'axios'
import type { SolveRequest, SolveResponse, HealthResponse } from '@/types/models'

const baseURL =
  typeof import.meta.env.VITE_API_BASE_URL === 'string' &&
  import.meta.env.VITE_API_BASE_URL.trim() !== ''
    ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')
    : ''

function fullUrl(path: string): string {
  if (!baseURL) return path
  return `${baseURL}${path.startsWith('/') ? path : `/${path}`}`
}

/** Check backend health. Returns true if backend is online. */
export async function checkHealth(signal?: AbortSignal): Promise<boolean> {
  if (!baseURL) return false
  try {
    const { data } = await axios.get<HealthResponse>(fullUrl('/health'), {
      timeout: 5000,
      signal,
    })
    return data?.status === 'ok'
  } catch {
    return false
  }
}

/** Solve VRP. Pass AbortController.signal to allow cancellation. */
export async function solve(
  body: SolveRequest,
  signal?: AbortSignal
): Promise<SolveResponse> {
  const url = baseURL ? fullUrl('/solve') : fullUrl('/solve')
  const res = await axios.post<SolveResponse>(url, body, {
    timeout: 120_000,
    signal,
    headers: { 'Content-Type': 'application/json' },
  })
  if (res.data?.status !== 'ok') {
    throw new Error('Invalid response from server')
  }
  return res.data
}

/** Extract user-friendly error message from API error. */
export function getApiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const ax = err as AxiosError<{ message?: string; error?: string }>
    if (ax.code === 'ERR_CANCELED') return 'Request cancelled'
    if (ax.message === 'Network Error') return 'Network error. Check backend URL and connectivity.'
    const msg = ax.response?.data?.message ?? ax.response?.data?.error
    if (msg) return String(msg)
    if (ax.response?.status) return `Server error (${ax.response.status})`
  }
  return err instanceof Error ? err.message : 'Unknown error'
}
