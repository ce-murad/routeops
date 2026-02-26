import { Box, Card, Loader, Skeleton, Text, ThemeIcon } from '@mantine/core'
import type { ReactNode } from 'react'

interface KpiCardProps {
  title: string
  value: string | number
  unit?: string
  icon?: ReactNode
  loading?: boolean
}

export function KpiCard({ title, value, unit, icon, loading }: KpiCardProps) {
  return (
    <Card padding="md">
      <Box style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {icon && (
          <ThemeIcon size={34} radius="xl" variant="light">
            {icon}
          </ThemeIcon>
        )}
        <Box style={{ flex: 1 }}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            {title}
          </Text>
          {loading ? (
            <Box style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <Loader size="sm" />
              <Skeleton height={20} width="40%" radius="xl" />
            </Box>
          ) : (
            <Text size="xl" fw={700} mt={4}>
              {value}
              {unit != null && (
                <Text component="span" size="sm" c="dimmed" ml={4}>
                  {unit}
                </Text>
              )}
            </Text>
          )}
        </Box>
      </Box>
    </Card>
  )
}
