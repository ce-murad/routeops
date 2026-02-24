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
    notifications.show({ message: 'Added 5 sample stops', color: 'blue' })
  }, [])

  const exportStops = useCallback(() => {
    const csv = exportStopsToCsv(stops)
    downloadCsv(csv, 'stops.csv')
    notifications.show({ message: 'Stops exported', color: 'green' })
  }, [stops])

  const solveDisabled =
    stops.length === 0 ||
    !depotId ||
    settings.vehicles < 1 ||
    settings.capacity < 1

  const routes = solveResult?.routes ?? []
  const unserved = solveResult?.unservedStopIds ?? []
  const summary = solveResult?.summary

  const csvContent = (
    <form onSubmit={csvForm.handleSubmit(handleCsvApply)}>
      <Stack gap="xs">
        <Textarea
          autosize
          minRows={6}
          placeholder="Paste CSV with headers: id,name,lat,lng,demand"
          styles={{
            input: {
              fontFamily: 'monospace',
              fontSize: 12,
            },
          }}
          {...csvForm.register('csvText')}
        />
        <Button type="submit" variant="light">
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
      depotId={depotId}
      onAddSample={addSampleStops}
    />
  )

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: '#f6f7f9' }}>
      <Container size="xl" py="md">
        <Stack gap="md">
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
                <Button
                  variant="subtle"
                  onClick={handleReset}
                >
                  Reset
                </Button>
                <Button
                  variant="filled"
                  onClick={exportStops}
                  disabled={stops.length === 0}
                >
                  Export CSV
                </Button>
              </Group>
            </Group>
          </Paper>

          <Grid gutter="md">
            <Grid.Col span={{ base: 12, md: 4, lg: 3 }}>
              <Card p="md">
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
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 8, lg: 9 }}>
              <Stack gap="md">
                <Card p="md">
                  <Stack gap="sm">
                    <Group justify="space-between" align="center">
                      <Text fw={600} size="sm" c="dimmed">
                        Key metrics
                      </Text>
                      {summary && (
                        <Text size="xs" c="dimmed">
                          Based on current solution
                        </Text>
                      )}
                    </Group>
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
                  </Stack>
                </Card>

                <Card p="md">
                  <Stack gap="sm">
                    <Group justify="space-between" align="flex-end">
                      <Box>
                        <Text fw={600} size="sm" c="dimmed">
                          Map
                        </Text>
                        <Text size="xs" c="dimmed">
                          Routes follow real roads where available and visualize stop assignments.
                        </Text>
                      </Box>
                    </Group>
                    <Box pos="relative">
                      {solving && (
                        <Box
                          style={{
                            position: 'absolute',
                            inset: 12,
                            background: 'rgba(255,255,255,0.85)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            borderRadius: 12,
                            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
                          }}
                        >
                          <Loader size="lg" />
                          <Text size="sm" mt="xs" c="dimmed">
                            Solving current routes…
                          </Text>
                        </Box>
                      )}
                      <MapView
                        stops={stops}
                        depotId={depotId}
                        routes={routes}
                        stopById={stopById}
                        focusedRouteId={focusedRouteId}
                        height="400px"
                      />
                    </Box>
                  </Stack>
                </Card>

                {routes.length > 0 && (
                  <Card p="md">
                    <Stack gap="sm">
                      <Group justify="space-between" align="center">
                        <Text fw={600} size="sm" c="dimmed">
                          Routes
                        </Text>
                        {focusedRouteId != null && (
                          <Button
                            variant="subtle"
                            onClick={() => setFocusedRouteId(null)}
                          >
                            Show all routes
                          </Button>
                        )}
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
                  <Group justify="flex-end">
                    <Button variant="outline" onClick={exportStops}>
                      Export stops to CSV
                    </Button>
                  </Group>
                )}
              </Stack>
            </Grid.Col>
          </Grid>
        </Stack>
      </Container>
    </Box>
  )
}
