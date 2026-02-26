import { Group, Text, Tooltip, ActionIcon } from '@mantine/core'
import { IconInfoCircle } from '@tabler/icons-react'

export function InfoLabel({
  label,
  info,
}: {
  label: string
  info: string
}) {
  return (
    <Group gap={6} align="center" wrap="nowrap">
      <Text size="sm" fw={600}>
        {label}
      </Text>

      <Tooltip
        label={info}
        withArrow
        position="right"
        multiline
        w={260}
        withinPortal
        zIndex={4000}
      >
        <ActionIcon variant="subtle" size="sm" aria-label={`${label} info`}>
          <IconInfoCircle size={16} />
        </ActionIcon>
      </Tooltip>
    </Group>
  )
}