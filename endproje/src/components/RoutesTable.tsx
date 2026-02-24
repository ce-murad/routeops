/**
 * Routes table: Route #, Stops count, Load used/capacity, Distance, Time, Actions.
 */
import { Button, Table, Badge, Box } from '@mantine/core'
import { IconFocus2, IconDownload } from '@tabler/icons-react'
import type { RouteResult } from '@/types/models'
import type { Stop } from '@/types/models'
import { exportRoutesToCsv, downloadCsv } from '@/lib/csv'

interface RoutesTableProps {
  routes: RouteResult[]
  capacity: number
  stopById: Map<string, Stop>
  onFocusRoute: (routeId: number) => void
}

export function RoutesTable({
  routes,
  capacity,
  stopById,
  onFocusRoute,
}: RoutesTableProps) {
  const handleExportRoute = (r: RouteResult) => {
    const csv = exportRoutesToCsv([r], stopById)
    downloadCsv(csv, `route-${r.routeId}.csv`)
  }

  return (
    <Table striped highlightOnHover withTableBorder withColumnBorders>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Route #</Table.Th>
          <Table.Th>Stops</Table.Th>
          <Table.Th>Load / Capacity</Table.Th>
          <Table.Th>Distance (km)</Table.Th>
          <Table.Th>Time (min)</Table.Th>
          <Table.Th>Actions</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {routes.map(r => (
          <Table.Tr key={r.routeId}>
            <Table.Td>
              <Badge variant="light" size="lg">
                {r.routeId}
              </Badge>
            </Table.Td>
            <Table.Td>{r.stopIds.length}</Table.Td>
            <Table.Td>
              {r.load} / {capacity}
            </Table.Td>
            <Table.Td>{r.distanceKm.toFixed(2)}</Table.Td>
            <Table.Td>{r.timeMin.toFixed(0)}</Table.Td>
            <Table.Td>
              <Box style={{ display: 'flex', gap: 8 }}>
                <Button
                  size="xs"
                  variant="subtle"
                  leftSection={<IconFocus2 size={14} />}
                  onClick={() => onFocusRoute(r.routeId)}
                >
                  Focus on map
                </Button>
                <Button
                  size="xs"
                  variant="subtle"
                  leftSection={<IconDownload size={14} />}
                  onClick={() => handleExportRoute(r)}
                >
                  Export
                </Button>
              </Box>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  )
}
