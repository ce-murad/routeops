/**
 * App dashboard sidebar: Data input tabs, problem settings, solve controls.
 */
import { Stack, Tabs, NumberInput, Select, Button, Box, Text, Divider } from '@mantine/core'
import { IconUpload, IconEdit } from '@tabler/icons-react'
import { InfoLabel } from '@/components/InfoLabel'
import type { Stop } from '@/types/models'
import type { ProblemSettingsInput } from '@/lib/validators'

interface SidebarProps {
  activeTab: 'csv' | 'manual'
  onTabChange: (tab: 'csv' | 'manual') => void
  vehicles: number
  capacity: number
  depotId: string
  distanceMetric: 'haversine' | 'osrm'
  objective: 'distance' | 'time'
  onSettingsChange: (s: Partial<ProblemSettingsInput>) => void
  stops: Stop[]
  onSolve: () => void
  onCancel: () => void
  onReset: () => void
  solving: boolean
  solveDisabled: boolean
  csvContent: React.ReactNode
  manualContent: React.ReactNode
}

export function Sidebar({
  activeTab,
  onTabChange,
  vehicles,
  capacity,
  depotId,
  distanceMetric,
  objective,
  onSettingsChange,
  stops,
  onSolve,
  onCancel,
  onReset,
  solving,
  solveDisabled,
  csvContent,
  manualContent,
}: SidebarProps) {
  const depotOptions = stops.map(s => ({
    value: s.id,
    label: `${s.name || s.id} (${s.lat.toFixed(2)}, ${s.lng.toFixed(2)})`,
  }))

  return (
    <Stack gap="md" style={{ minWidth: 280, maxWidth: 320 }}>
      <Box>
        <Text fw={600} size="xs" c="dimmed" tt="uppercase">
          Inputs
        </Text>
        <Text size="xs" c="dimmed" mt={2}>
          Configure how stops are loaded into the problem.
        </Text>
      </Box>

      <Tabs value={activeTab} onChange={v => onTabChange((v as 'csv') || 'manual')}>
        <Tabs.List>
          <Tabs.Tab value="csv" leftSection={<IconUpload size={14} />}>
            Upload CSV
          </Tabs.Tab>
          <Tabs.Tab value="manual" leftSection={<IconEdit size={14} />}>
            Manual entry
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="csv" pt="sm">
          {csvContent}
        </Tabs.Panel>
        <Tabs.Panel value="manual" pt="sm">
          {manualContent}
        </Tabs.Panel>
      </Tabs>

      <Divider label="Stops & settings" labelPosition="left" />

      <NumberInput
        label={
          <InfoLabel
            label="Number of vehicles"
            info="How many vehicles (routes) you allow. More vehicles usually makes it easier to serve all stops. With 1 vehicle, you may need higher capacity or some stops may be unserved."
          />
        }
        value={vehicles}
        onChange={v => onSettingsChange({ vehicles: typeof v === 'string' ? 3 : v })}
        min={1}
        max={50}
      />

      <NumberInput
        label={
          <InfoLabel
            label="Vehicle capacity"
            info="Max total demand one vehicle can carry. If total demand is greater than (vehicles × capacity), some stops may be unserved."
          />
        }
        value={capacity}
        onChange={v => onSettingsChange({ capacity: typeof v === 'string' ? 100 : v })}
        min={1}
      />

      <Select
        label={
          <InfoLabel
            label="Depot"
            info="The start (and end) location for each vehicle. All routes begin at the depot."
          />
        }
        placeholder="Select depot"
        data={depotOptions}
        value={depotId || (stops[0]?.id ?? null)}
        onChange={v => onSettingsChange({ depotId: v ?? '' })}
        allowDeselect={false}
      />

      <Select
        label={
          <InfoLabel
            label="Distance metric"
            info="How distances are computed. Haversine is straight-line. OSRM uses real road travel distances/times when available."
          />
        }
        data={[
          { value: 'haversine', label: 'Haversine' },
          { value: 'osrm', label: 'OSRM (if backend supports)' },
        ]}
        value={distanceMetric}
        onChange={v =>
          onSettingsChange({
            distanceMetric: (v as 'haversine' | 'osrm') ?? 'haversine',
          })
        }
      />

      <Select
        label={
          <InfoLabel
            label="Objective"
            info="What the solver minimizes. Distance = shorter routes. Time = faster routes (based on road travel time when available). With small examples they can look very similar."
          />
        }
        data={[
          { value: 'distance', label: 'Min distance' },
          { value: 'time', label: 'Min time' },
        ]}
        value={objective}
        onChange={v =>
          onSettingsChange({ objective: (v as 'distance' | 'time') ?? 'distance' })
        }
      />

      <Divider label="Solve" labelPosition="left" />

      <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Button fullWidth onClick={onSolve} loading={solving} disabled={solveDisabled}>
          Solve
        </Button>

        {solving && (
          <Button fullWidth variant="outline" color="red" onClick={onCancel}>
            Cancel
          </Button>
        )}

        <Button fullWidth variant="subtle" onClick={onReset}>
          Reset
        </Button>
      </Box>
    </Stack>
  )
}