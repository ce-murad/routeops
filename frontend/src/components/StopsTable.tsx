/**
 * Stops table for manual entry: add, edit, delete rows.
 */
import { Button, Table, TextInput, NumberInput, ActionIcon, Box } from '@mantine/core'
import { IconTrash, IconPlus } from '@tabler/icons-react'
import type { Stop } from '@/types/models'

interface StopsTableProps {
  stops: Stop[]
  onStopsChange: (stops: Stop[]) => void
  onAddSample?: () => void
}

export function StopsTable({
  stops,
  onStopsChange,
  onAddSample,
}: StopsTableProps) {
  const update = (id: string, patch: Partial<Stop>) => {
    onStopsChange(
      stops.map(s => (s.id === id ? { ...s, ...patch } : s))
    )
  }

  const remove = (id: string) => {
    onStopsChange(stops.filter(s => s.id !== id))
  }

  const addRow = () => {
    const newId = `stop-${Date.now()}`
    onStopsChange([
      ...stops,
      {
        id: newId,
        name: '',
        lat: 0,
        lng: 0,
        demand: 0,
      },
    ])
  }

  return (
    <Box>
      {/* Buttons */}
      <Box style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <Button size="xs" variant="light" leftSection={<IconPlus size={14} />} onClick={addRow}>
          Add row
        </Button>
        {onAddSample && (
          <Button size="xs" variant="outline" onClick={onAddSample}>
            Add 10 sample stops
          </Button>
        )}
      </Box>

      {/* 👇 KEY FIX: horizontal scroll */}
      <Box style={{ overflowX: 'auto' }}>
        <Table
          striped
          highlightOnHover
          withTableBorder
          withColumnBorders
          style={{ minWidth: 700 }} // 👈 forces columns to have space
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ minWidth: 120 }}>ID</Table.Th>
              <Table.Th style={{ minWidth: 120 }}>Name</Table.Th>
              <Table.Th style={{ minWidth: 140 }}>Lat</Table.Th>
              <Table.Th style={{ minWidth: 140 }}>Lng</Table.Th>
              <Table.Th style={{ minWidth: 100 }}>Demand</Table.Th>
              <Table.Th style={{ width: 40 }}></Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {stops.map(s => (
              <Table.Tr key={s.id}>
                <Table.Td>
                  <TextInput
                    size="xs"
                    value={s.id}
                    onChange={e => update(s.id, { id: e.target.value })}
                    placeholder="id"
                  />
                </Table.Td>

                <Table.Td>
                  <TextInput
                    size="xs"
                    value={s.name}
                    onChange={e => update(s.id, { name: e.target.value })}
                    placeholder="name"
                  />
                </Table.Td>

                <Table.Td>
                  <NumberInput
                    size="xs"
                    value={s.lat}
                    onChange={v => update(s.id, { lat: typeof v === 'string' ? 0 : v })}
                    min={-90}
                    max={90}
                    decimalScale={6} // 👈 more precise
                    step={0.0001}
                  />
                </Table.Td>

                <Table.Td>
                  <NumberInput
                    size="xs"
                    value={s.lng}
                    onChange={v => update(s.id, { lng: typeof v === 'string' ? 0 : v })}
                    min={-180}
                    max={180}
                    decimalScale={6}
                    step={0.0001}
                  />
                </Table.Td>

                <Table.Td>
                  <NumberInput
                    size="xs"
                    value={s.demand}
                    onChange={v => update(s.id, { demand: typeof v === 'string' ? 0 : v })}
                    min={0}
                  />
                </Table.Td>

                <Table.Td>
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    color="red"
                    onClick={() => remove(s.id)}
                  >
                    <IconTrash size={14} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Box>
    </Box>
  )
}