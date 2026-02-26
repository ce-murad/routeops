/**
 * App dashboard: sidebar + KPIs, map, routes table. Handles solve, CSV, manual entry, export.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Box,
  Grid,
  Alert,
  Badge,
  Group,
  Title,
  Paper,
  Loader,
  Stack,
  Button,
  Text,
  Container,
  Card,
  Textarea,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconRoute, IconClock, IconMap, IconAlertTriangle } from '@tabler/icons-react'
import { Sidebar } from '@/components/Sidebar'
import { KpiCard } from '@/components/KpiCard'
import { MapView } from '@/components/MapView'
import { RoutesTable } from '@/components/RoutesTable'
import { StopsTable } from '@/components/StopsTable'
import type { Stop } from '@/types/models'
import type { SolveResponse } from '@/types/models'
import type { ProblemSettingsInput } from '@/lib/validators'
import { parseCsv, exportStopsToCsv, downloadCsv } from '@/lib/csv'
import { validateStopRow } from '@/lib/validators'
import { generateSampleStops, DEFAULT_CENTER } from '@/lib/geo'
import { checkHealth, solve as apiSolve, getApiErrorMessage } from '@/lib/api'
import axios from 'axios'

const csvRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  demand: z.coerce.number(),
})

function parseCsvToStops(csvText: string): { stops: Stop[]; errors: string[] } {
  const rows = parseCsv(csvText)
  const errors: string[] = []
  const stops: Stop[] = []
  const seenIds = new Set<string>()
  rows.forEach((row, i) => {
    const err = validateStopRow(row as Record<string, unknown>)
    if (err) {
      errors.push(`Row ${i + 2}: ${err}`)
      return
    }
    const parsed = csvRowSchema.safeParse(row)
    if (!parsed.success) {
      errors.push(`Row ${i + 2}: ${parsed.error.message}`)
      return
    }
    const { id, name, lat, lng, demand } = parsed.data
    if (seenIds.has(id)) {
      errors.push(`Row ${i + 2}: duplicate id "${id}"`)
      return
    }
    seenIds.add(id)
    stops.push({ id, name, lat, lng, demand })
  })
  return { stops, errors }
}

function downloadTextFile(content: string, filename: string, mime = 'text/plain') {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function routesToCsv(solveResult: SolveResponse) {
  const routes = solveResult?.routes ?? []
  const header = ['routeId', 'vehicleId', 'distanceKm', 'timeMin', 'load', 'stopIds'].join(',')
  const lines = routes.map(r => {
    const stopIds = (r.stopIds ?? []).join('|')
    return [r.routeId, r.vehicleId, r.distanceKm, r.timeMin, r.load, `"${stopIds}"`].join(',')
  })
  return [header, ...lines].join('\n')
}

export function Dashboard() {
  const [stops, setStops] = useState<Stop[]>([])
  const [activeTab, setActiveTab] = useState<'csv' | 'manual'>('manual')
  const [settings, setSettings] = useState<ProblemSettingsInput>({
    vehicles: 3,
    capacity: 100,
    depotId: '',
    distanceMetric: 'haversine',
    objective: 'distance',
  })
  const [solveResult, setSolveResult] = useState<SolveResponse | null>(null)
  const [solving, setSolving] = useState(false)
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null)
  const [focusedRouteId, setFocusedRouteId] = useState<number | null>(null)
  const [csvErrors, setCsvErrors] = useState<string[]>([])
  const abortRef = useRef<AbortController | null>(null)

  const csvFormSchema = z.object({ csvText: z.string() })
  type CsvFormValues = z.infer<typeof csvFormSchema>
  const csvForm = useForm<CsvFormValues>({
    defaultValues: { csvText: '' },
    resolver: zodResolver(csvFormSchema),
  })

  const stopById = useMemo(() => {
    const m = new Map<string, Stop>()
    stops.forEach(s => m.set(s.id, s))
    return m
  }, [stops])

  const depotId = (settings.depotId ?? stops[0]?.id) ?? ''

  const totalDemand = useMemo(
    () => stops.reduce((sum, s) => sum + (Number(s.demand) || 0), 0),
    [stops]
  )

  const maxCarry = useMemo(
    () => (Number(settings.vehicles) || 0) * (Number(settings.capacity) || 0),
    [settings.vehicles, settings.capacity]
  )

  const capacityWarning =
    stops.length > 0 &&
    settings.vehicles > 0 &&
    settings.capacity > 0 &&
    totalDemand > maxCarry

  useEffect(() => {
    if (stops.length && !depotId) {
      setSettings(s => ({ ...s, depotId: stops[0].id }))
    }
  }, [stops, depotId])

  useEffect(() => {
    let cancelled = false
    const ctrl = new AbortController()
    checkHealth(ctrl.signal).then(ok => {
      if (!cancelled) setBackendOnline(ok)
    })
    return () => {
      cancelled = true
      ctrl.abort()
    }
  }, [])

  const handleSolve = useCallback(async () => {
    if (!stops.length || !depotId) return
    abortRef.current = new AbortController()
    setSolving(true)
    setSolveResult(null)
    try {
      const res = await apiSolve(
        {
          stops,
          depotId,
          vehicles: settings.vehicles,
          capacity: settings.capacity,
          distanceMetric: settings.distanceMetric,
          objective: settings.objective,
        },
        abortRef.current.signal
      )
      setSolveResult(res)
      notifications.show({
        title: 'Solved',
        message: `${res.summary.routes} routes, ${res.summary.stopsServed} stops served.`,
        color: 'green',
      })
    } catch (e) {
      if (axios.isCancel(e)) return
      notifications.show({
        title: 'Solve failed',
        message: getApiErrorMessage(e),
        color: 'red',
      })
    } finally {
      setSolving(false)
      abortRef.current = null
    }
  }, [stops, depotId, settings])

  const handleCancel = useCallback(() => {
    if (abortRef.current) abortRef.current.abort()
  }, [])

  const handleReset = useCallback(() => {
    setStops([])
    setSolveResult(null)
    csvForm.reset({ csvText: '' })
    setCsvErrors([])
    setSettings({
      vehicles: 3,
      capacity: 100,
      depotId: '',
      distanceMetric: 'haversine',
      objective: 'distance',
    })
    setFocusedRouteId(null)
    notifications.show({ message: 'Reset complete', color: 'gray' })
  }, [csvForm])

  const handleCsvApply = useCallback((values: CsvFormValues) => {
    const { stops: nextStops, errors } = parseCsvToStops(values.csvText)
    setCsvErrors(errors)
    setStops(nextStops)
    if (nextStops.length && !errors.length) {
      setSettings(s => ({ ...s, depotId: nextStops[0].id }))
      notifications.show({ message: `Loaded ${nextStops.length} stops`, color: 'green' })
    } else if (errors.length) {
      notifications.show({ message: `${errors.length} validation error(s)`, color: 'yellow' })
    }
  }, [])

  const addSampleStops = useCallback(() => {
    const sample = generateSampleStops(10, DEFAULT_CENTER, 8)
    setStops(prev => {
      const ids = new Set(prev.map(s => s.id))
      const newOnes = sample.filter(s => !ids.has(s.id))
      return [...prev, ...newOnes]
    })
    notifications.show({ message: 'Added 10 sample stops', color: 'blue' })
  }, [])

  const exportStops = useCallback(() => {
    const csv = exportStopsToCsv(stops)
    downloadCsv(csv, 'stops.csv')
    notifications.show({ message: 'Stops exported', color: 'green' })
  }, [stops])

  const solveDisabled = stops.length === 0 || !depotId || settings.vehicles < 1 || settings.capacity < 1

  const routes = solveResult?.routes ?? []
  const unserved = solveResult?.unservedStopIds ?? []
  const summary = solveResult?.summary

  const csvContent = (
    <form onSubmit={csvForm.handleSubmit(handleCsvApply)}>
      <Stack gap="xs">
        <Textarea
          placeholder="Paste CSV with headers: id,name,lat,lng,demand"
          rows={6}
          autosize
          minRows={6}
          maxRows={10}
          {...csvForm.register('csvText')}
        />
        <Button type="submit" size="sm" variant="light">
          Apply CSV
        </Button>
        {csvErrors.length > 0 && (
          <Alert color="yellow" title="Validation errors" icon={<IconAlertTriangle size={16} />}>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {csvErrors.slice(0, 5).map((e, i) => (
                <li key={i}>{e}</li>
              ))}
              {csvErrors.length > 5 && <li>… and {csvErrors.length - 5} more</li>}
            </ul>
          </Alert>
        )}
      </Stack>
    </form>
  )

  const manualContent = (
    <StopsTable
      stops={stops}
      onStopsChange={setStops}
      onAddSample={addSampleStops}
    />
  )

  return (
    <Box style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f8f9fa 0%, #ffffff 40%)' }}>
      <Container size="xl" py="lg">
        <Paper p="md">
          <Group justify="space-between" align="flex-start">
            <Group align="center" gap="sm">
              <Box
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background:
                    'linear-gradient(135deg, rgba(25,113,194,0.1), rgba(25,113,194,0.25))',
                }}
              >
                <IconRoute size={20} />
              </Box>
              <Box>
                <Group gap={4}>
                  <Title order={3}>RouteOps</Title>
                </Group>
                <Text size="sm" c="dimmed">
                  Plan and analyze optimized vehicle routes with live maps and KPIs.
                </Text>
              </Box>
            </Group>

            <Group gap="xs">
              <Badge
                color={backendOnline === true ? 'green' : backendOnline === false ? 'red' : 'gray'}
                variant="light"
              >
                Backend:{' '}
                {backendOnline === true ? 'Online' : backendOnline === false ? 'Offline' : 'Checking…'}
              </Badge>

              {Boolean((solveResult as any)?.summary?.matrixUsed) && (
                <Badge
                  variant="light"
                  color={((solveResult as any).summary.matrixUsed ?? '').toLowerCase() === 'osrm' ? 'green' : 'gray'}
                >
                  Road data: {String((solveResult as any).summary.matrixUsed).toUpperCase()}
                </Badge>
              )}

              <Button variant="subtle" onClick={handleReset}>
                Reset
              </Button>
            </Group>
          </Group>
        </Paper>

        <Grid gutter="md" mt="md">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Sidebar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              vehicles={settings.vehicles}
              capacity={settings.capacity}
              depotId={depotId}
              distanceMetric={settings.distanceMetric}
              objective={settings.objective}
              onSettingsChange={patch => setSettings(s => ({ ...s, ...patch }))}
              stops={stops}
              onSolve={handleSolve}
              onCancel={handleCancel}
              onReset={handleReset}
              solving={solving}
              solveDisabled={solveDisabled}
              csvContent={csvContent}
              manualContent={manualContent}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="md">
              <Card p="md">
                <Stack gap="sm">
                  <Text fw={600}>Key metrics</Text>
                  <Grid>
                    <Grid.Col span={{ base: 6, sm: 3 }}>
                      <KpiCard
                        title="Total distance"
                        value={summary?.totalDistanceKm ?? 0}
                        unit=" km"
                        icon={<IconRoute size={18} />}
                        loading={solving}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}>
                      <KpiCard
                        title="Total time"
                        value={summary?.totalTimeMin ?? 0}
                        unit=" min"
                        icon={<IconClock size={18} />}
                        loading={solving}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}>
                      <KpiCard
                        title="Routes"
                        value={summary?.routes ?? 0}
                        icon={<IconMap size={18} />}
                        loading={solving}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}>
                      <KpiCard
                        title="Stops served"
                        value={summary?.stopsServed ?? 0}
                        loading={solving}
                      />
                    </Grid.Col>
                  </Grid>

                  {unserved.length > 0 && (
                    <Alert color="orange" title="Unserved stops" icon={<IconAlertTriangle size={16} />}>
                      {unserved.join(', ')}
                    </Alert>
                  )}

                  {capacityWarning && (
                    <Alert color="yellow" title="Capacity warning" icon={<IconAlertTriangle size={16} />}>
                      Total demand is <b>{totalDemand}</b>, but vehicles × capacity is only <b>{maxCarry}</b>.
                      Some stops may be unserved unless you increase vehicles or capacity.
                    </Alert>
                  )}
                </Stack>
              </Card>

              <Card p="md">
                <Stack gap="sm">
                  <Group justify="space-between" align="flex-end">
                    <Box>
                      <Text fw={600} size="sm">
                        Map
                      </Text>
                      <Text size="xs" c="dimmed">
                        Routes are drawn using road geometry when available.
                      </Text>
                    </Box>
                    {focusedRouteId != null && (
                      <Button size="xs" variant="light" onClick={() => setFocusedRouteId(null)}>
                        Show all routes
                      </Button>
                    )}
                  </Group>

                  <Box pos="relative">
                    {solving && (
                      <Box
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(255,255,255,0.85)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 1000,
                          borderRadius: 12,
                        }}
                      >
                        <Loader size="lg" />
                      </Box>
                    )}
                    <MapView
                      stops={stops}
                      depotId={depotId}
                      routes={routes}
                      focusedRouteId={focusedRouteId}
                      height="420px"
                    />
                  </Box>
                </Stack>
              </Card>

              {routes.length > 0 && (
                <Card p="md">
                  <Stack gap="sm">
                    <Group justify="space-between">
                      <Text fw={600}>Routes</Text>
                      <Text size="xs" c="dimmed">
                        Click a row to focus it on the map.
                      </Text>
                    </Group>
                    <RoutesTable
                      routes={routes}
                      capacity={settings.capacity}
                      stopById={stopById}
                      onFocusRoute={setFocusedRouteId}
                    />
                  </Stack>
                </Card>
              )}

              {stops.length > 0 && (
                <Group justify="space-between">
                  {solveResult && (
                    <Group gap="xs">
                      <Button
                        variant="light"
                        onClick={() =>
                          downloadTextFile(
                            JSON.stringify(solveResult, null, 2),
                            'solution.json',
                            'application/json'
                          )
                        }
                      >
                        Download solution JSON
                      </Button>
                      <Button
                        variant="light"
                        onClick={() => downloadTextFile(routesToCsv(solveResult), 'routes.csv', 'text/csv')}
                      >
                        Download routes CSV
                      </Button>
                    </Group>
                  )}
                  <Button variant="outline" onClick={exportStops}>
                    Export stops to CSV
                  </Button>
                </Group>
              )}
            </Stack>
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  )
}